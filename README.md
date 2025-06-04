# SyncBeats - Watch YouTube Together

SyncBeats is a full-stack web application that allows multiple users to watch YouTube videos together in real-time. Users can create or join rooms, chat with each other, and control the playback synchronously across all connected clients.

## Features

- Real-time synchronization of YouTube video playback
- Room-based system with unique 8-character room IDs
- Live chat functionality
- Video queue management
- Host controls for playback (play, pause, seek, next)
- Responsive design that works on mobile and desktop
- Dark mode support

## Tech Stack

### Frontend
- React (with Vite)
- TypeScript
- Socket.IO client for real-time communication
- React YouTube for the video player
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation

### Backend
- Python with Flask
- Flask-SocketIO for real-time communication
- In-memory data store for room persistence

## Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/syncbeats.git
cd syncbeats
```

2. Set up the backend
```
cd backend
pip install -r requirements.txt
```

3. Set up the frontend
```
cd ..  # Back to root directory
npm install
```

### Running the Application

1. Start the backend server
```
cd backend
flask run
```

2. In a new terminal, start the frontend development server
```
cd ..  # If in backend directory
npm run dev
```

3. Open your browser and navigate to the provided local URL (usually http://localhost:5173)

## Usage

1. Open the SyncBeats application in your browser
2. Enter a username
3. Create a new room or join an existing room with a room ID
4. Add YouTube videos to the queue by pasting YouTube URLs or video IDs
5. Chat with other users in the room
6. The host can control playback for everyone in the room

## Room Features

- **Host Control**: The first user to join a room becomes the host and can control playback
- **Queue Management**: Add multiple videos to a queue and play them sequentially
- **Synchronized Playback**: When the host plays, pauses, or seeks, all users see the same actions
- **Real-time Chat**: Communicate with other users while watching

## Development

### Environment Variables

Create a `.env` file in the frontend directory with the following content:
```
VITE_BACKEND_URL=http://localhost:5000
```

### Building for Production

1. Build the frontend
```
npm run build
```

2. The built files will be in the `dist` directory and can be served by any static file server

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.