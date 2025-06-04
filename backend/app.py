# project/backend/app.py
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, join_room, leave_room, emit
from flask_cors import CORS
import os
import random
import string
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_key_change_in_production')

# --- Relaxed CORS: Allow all origins on /api/* for development ---
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "supports_credentials": True
    }
})

# Initialize Socket.IO with CORS allowed for everything (dev only)
socketio = SocketIO(app, cors_allowed_origins="*", supports_credentials=True)

# In-memory data store for rooms
rooms = {}

def generate_room_id():
    """Generate a random 8-character room ID."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

def get_room_data(room_id):
    """Get room data if it exists."""
    return rooms.get(room_id)

# ------------------------------
#  HTTP ROUTES (API)
# ------------------------------

@app.route('/api/rooms', methods=['POST'])
def create_room():
    """Create a new room and return its ID."""
    room_id = generate_room_id()
    while room_id in rooms:
        room_id = generate_room_id()

    rooms[room_id] = {
        'host': None,        # First user to join becomes host
        'users': [],         # List of usernames (simple string IDs)
        'chat_history': [],  # List of {username, message, timestamp}
        'queue': [],         # YouTube video IDs
        'current_index': 0,  # Index in the queue currently playing
        'playback_state': {  # {time: number, playing: bool}
            'time': 0,
            'playing': False
        }
    }

    logger.info(f"Created room: {room_id}")
    return jsonify({'roomId': room_id})


@app.route('/api/rooms/<room_id>', methods=['GET'])
def get_room(room_id):
    """Check if a room exists; return metadata if it does."""
    room = get_room_data(room_id)
    if not room:
        return jsonify({'exists': False})

    return jsonify({
        'exists': True,
        'host': room['host'],
        'users': room['users'],
        'queue': room['queue'],
        'currentIndex': room['current_index'],
        'playbackState': room['playback_state']
    })


@app.route('/api/rooms/<room_id>/queue', methods=['POST'])
def add_to_queue(room_id):
    """Add a YouTube video ID to the room's queue."""
    room = get_room_data(room_id)
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    data = request.json or {}
    video_id = data.get('videoId')
    if not video_id:
        return jsonify({'error': 'Video ID is required'}), 400

    room['queue'].append(video_id)
    socketio.emit('queue_update', {
        'queue': room['queue'],
        'currentIndex': room['current_index']
    }, to=room_id)

    logger.info(f"Added video {video_id} to queue in room {room_id}")
    return jsonify({'success': True})


@app.route('/api/rooms/<room_id>/queue/<video_id>', methods=['DELETE'])
def delete_from_queue(room_id, video_id):
    """Remove a YouTube video ID from the room's queue."""
    room = get_room_data(room_id)
    if not room:
        return jsonify({'error': 'Room not found'}), 404

    try:
        room['queue'].remove(video_id)
        # Adjust current_index if needed
        if room['current_index'] >= len(room['queue']):
            room['current_index'] = max(0, len(room['queue']) - 1)
        socketio.emit('queue_update', {
            'queue': room['queue'],
            'currentIndex': room['current_index']
        }, to=room_id)
        logger.info(f"Removed video {video_id} from queue in room {room_id}")
        return jsonify({'success': True})
    except ValueError:
        return jsonify({'error': 'Video not found in queue'}), 404


# ------------------------------
#  SOCKET.IO EVENTS
# ------------------------------

@socketio.on('join_room')
def handle_join_room(data):
    """When a client emits 'join_room', add them to the room and broadcast state."""
    room_id = data.get('roomId')
    username = data.get('username')
    if not room_id or not username:
        return

    room = get_room_data(room_id)
    if not room:
        emit('error', {'message': 'Room not found'})
        return

    # Join the Socket.IO room
    join_room(room_id)
    # Add this user to the room's user list (we use the plain username as ID)
    if username not in room['users']:
        room['users'].append(username)

    # Assign host if it's the first user
    if not room['host']:
        room['host'] = username

    # Send initial data back to the joining socket
    emit('joined', {'roomId': room_id, 'username': username})
    # Broadcast updated user list & host to *everyone* in that room
    emit('user_list', {'users': room['users']}, to=room_id)
    emit('host_update', {'host': room['host']}, to=room_id)
    # Send any chat history as well
    emit('chat_history', {'messages': room['chat_history']})
    # Send the current queue state
    emit('queue_update', {
        'queue': room['queue'],
        'currentIndex': room['current_index']
    }, to=room_id)

    logger.info(f"User {username} joined room {room_id}. Host is {room['host']}.")


@socketio.on('leave_room')
def handle_leave_room(data):
    """When a client leaves, remove them from the room and broadcast updates."""
    room_id = data.get('roomId')
    username = data.get('username')
    if not room_id or not username:
        return

    room = get_room_data(room_id)
    if not room:
        return

    # Remove the user from the list
    if username in room['users']:
        room['users'].remove(username)

        # If that user was the host, pick a new host
        if room['host'] == username:
            if room['users']:
                room['host'] = room['users'][0]
                socketio.emit('host_update', {'host': room['host']}, to=room_id)
                logger.info(f"New host in room {room_id}: {room['host']}")
            else:
                room['host'] = None

        # Broadcast the updated user list
        socketio.emit('user_list', {'users': room['users']}, to=room_id)
        # Actually remove the socket from the room
        leave_room(room_id)
        logger.info(f"User {username} left room {room_id}")


@socketio.on('chat_message')
def handle_chat_message(data):
    """Broadcast a chat message to everyone in the room."""
    room_id = data.get('roomId')
    username = data.get('username')
    message = data.get('message')
    if not room_id or not username or not message:
        return

    room = get_room_data(room_id)
    if not room:
        return

    msg_data = {
        'username': username,
        'message': message,
        'timestamp': 0  # The client can overwrite this timestamp if desired
    }
    room['chat_history'].append(msg_data)
    # Keep only the last 100 messages
    if len(room['chat_history']) > 100:
        room['chat_history'] = room['chat_history'][-100:]

    socketio.emit('chat_message', msg_data, to=room_id)
    logger.info(f"Chat in room {room_id} from {username}: {message}")


@socketio.on('play')
def handle_play_event(data):
    """When the host plays, broadcast a 'play' event to everyone else."""
    room_id = data.get('roomId')
    room = get_room_data(room_id)
    if not room:
        return
    room['playback_state']['playing'] = True
    socketio.emit('play', {}, to=room_id)
    logger.info(f"Play event in room {room_id}")


@socketio.on('pause')
def handle_pause_event(data):
    """When the host pauses, broadcast a 'pause' event."""
    room_id = data.get('roomId')
    room = get_room_data(room_id)
    if not room:
        return
    room['playback_state']['playing'] = False
    socketio.emit('pause', {}, to=room_id)
    logger.info(f"Pause event in room {room_id}")


@socketio.on('seek')
def handle_seek_event(data):
    """When the host seeks, broadcast new time to all clients."""
    room_id = data.get('roomId')
    new_time = data.get('time')
    room = get_room_data(room_id)
    if not room or new_time is None:
        return
    room['playback_state']['time'] = new_time
    socketio.emit('seek', {'time': new_time}, to=room_id)
    logger.info(f"Seek in room {room_id} to time {new_time}")


@socketio.on('next')
def handle_next_video(data):
    """When host moves to next video, advance index in queue."""
    room_id = data.get('roomId')
    room = get_room_data(room_id)
    if not room:
        return

    # Advance the current index if possible
    if room['current_index'] < len(room['queue']) - 1:
        room['current_index'] += 1
        room['playback_state'] = {
            'time': 0,
            'playing': True
        }
        socketio.emit('queue_update', {
            'queue': room['queue'],
            'currentIndex': room['current_index']
        }, to=room_id)
        logger.info(f"Next video in room {room_id}, now playing index {room['current_index']}")


@socketio.on('sync_request')
def handle_sync_request(data):
    """
    A late-joining client can request the current playback state
    so that it can synchronize to the host's time+play/pause state.
    """
    room_id = data.get('roomId')
    room = get_room_data(room_id)
    if not room:
        return
    # Send the current playbackState back to the requester only
    emit('sync_state', {'playbackState': room['playback_state']}, to=request.sid)
    logger.info(f"Sync request in room {room_id}; sending state.")


@socketio.on('kick_user')
def handle_kick_user(data):
    """Host can remove a user from the room."""
    room_id = data.get('roomId')
    username = data.get('username')  # user to kick
    host = data.get('host')
    if not room_id or not username or not host:
        return
    room = get_room_data(room_id)
    if not room:
        return
    # Only host can kick
    if room['host'] != host:
        return
    if username in room['users']:
        room['users'].remove(username)
        socketio.emit('user_list', {'users': room['users']}, to=room_id)
        socketio.emit('kicked', {'roomId': room_id}, to=room_id)  # Notify all, frontend will handle
        logger.info(f"Host {host} kicked user {username} from room {room_id}")


# ------------------------------
#  RUN THE FLASK + SOCKET.IO SERVER
# ------------------------------
if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
