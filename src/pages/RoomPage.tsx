import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { YouTubePlayer } from "react-youtube";
import YoutubePlayer from "../components/YoutubePlayer";
import RoomHeader from "../components/RoomHeader";
import VideoControls from "../components/VideoControls";
import UserList from "../components/UserList";
import Chat from "../components/Chat";
import Queue from "../components/Queue";
import { checkRoomExists, addVideoToQueue } from "../utils/api";
import { getSocket, connectToRoom, disconnectSocket } from "../utils/socket";
import toast from "react-hot-toast";
import { FiLink, FiUserPlus, FiYoutube } from "react-icons/fi";

type TabType = "users" | "chat" | "queue";

const RoomPage: React.FC = () => {
  const { roomId = "" } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>("");
  const [users, setUsers] = useState<string[]>([]);
  const [host, setHost] = useState<string>("");
  const [isHost, setIsHost] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [showGuide, setShowGuide] = useState(true);

  const playerRef = useRef<YouTubePlayer | null>(null);
  const ignoreSeekRef = useRef(false);
  const ignorePlayPauseRef = useRef(false);

  useEffect(() => {
    // Get username from localStorage or redirect to home
    const savedUsername = localStorage.getItem("syncbeats_username");
    if (!savedUsername) {
      navigate("/");
      return;
    }

    setUsername(savedUsername);

    // Check if room exists
    const checkRoom = async () => {
      try {
        const roomData = await checkRoomExists(roomId);

        if (!roomData.exists) {
          toast.error(`Room ${roomId} does not exist`);
          navigate("/");
          return;
        }

        // Connect to the room
        connectToRoom(roomId, savedUsername);
        setLoading(false);

        // If host and queue is empty, add a sample video
        if (
          roomData.host === savedUsername &&
          (!roomData.queue || roomData.queue.length === 0)
        ) {
          try {
            await addVideoToQueue(roomId, "dQw4w9WgXcQ");
            toast.success("Sample video added to queue!");
          } catch (err) {
            toast.error("Failed to add sample video");
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to connect to room");
        navigate("/");
      }
    };

    checkRoom();

    // Set up socket event listeners
    const socket = getSocket();

    const handleUserList = (data: { users: string[] }) => {
      setUsers(data.users);
    };

    const handleHostUpdate = (data: { host: string }) => {
      setHost(data.host);
      setIsHost(data.host === savedUsername);
    };

    const handleQueueUpdate = (data: {
      queue: string[];
      currentIndex: number;
    }) => {
      setQueue(data.queue);
      setCurrentIndex(data.currentIndex);
    };

    const handlePlayEvent = () => {
      if (playerRef.current && !ignorePlayPauseRef.current) {
        playerRef.current.playVideo();
      }
      ignorePlayPauseRef.current = false;
      setPlaying(true);
    };

    const handlePauseEvent = () => {
      if (playerRef.current && !ignorePlayPauseRef.current) {
        playerRef.current.pauseVideo();
      }
      ignorePlayPauseRef.current = false;
      setPlaying(false);
    };

    const handleSeekEvent = (data: { time: number }) => {
      if (playerRef.current && !ignoreSeekRef.current) {
        playerRef.current.seekTo(data.time, true);
      }
      ignoreSeekRef.current = false;
    };

    const handleSyncState = (data: { time: number; playing: boolean }) => {
      if (playerRef.current) {
        playerRef.current.seekTo(data.time, true);

        if (data.playing) {
          playerRef.current.playVideo();
          setPlaying(true);
        } else {
          playerRef.current.pauseVideo();
          setPlaying(false);
        }
      }
    };

    socket.on("user_list", handleUserList);
    socket.on("host_update", handleHostUpdate);
    socket.on("queue_update", handleQueueUpdate);
    socket.on("play", handlePlayEvent);
    socket.on("pause", handlePauseEvent);
    socket.on("seek", handleSeekEvent);
    socket.on("sync_state", handleSyncState);

    // Clean up on unmount
    return () => {
      disconnectSocket();

      socket.off("user_list", handleUserList);
      socket.off("host_update", handleHostUpdate);
      socket.off("queue_update", handleQueueUpdate);
      socket.off("play", handlePlayEvent);
      socket.off("pause", handlePauseEvent);
      socket.off("seek", handleSeekEvent);
      socket.off("sync_state", handleSyncState);
    };
  }, [roomId, navigate]);

  const handlePlayerReady = (player: YouTubePlayer) => {
    playerRef.current = player;
  };

  const handleStateChange = (state: number) => {
    // YT.PlayerState.PLAYING = 1
    if (state === 1) {
      setPlaying(true);
    }
    // YT.PlayerState.PAUSED = 2
    else if (state === 2) {
      setPlaying(false);
    }
  };

  const handlePlay = () => {
    if (playerRef.current) {
      ignorePlayPauseRef.current = true;
      playerRef.current.playVideo();
    }
  };

  const handlePause = () => {
    if (playerRef.current) {
      ignorePlayPauseRef.current = true;
      playerRef.current.pauseVideo();
    }
  };

  const handleLeaveRoom = () => {
    disconnectSocket();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Joining room...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <RoomHeader roomId={roomId} isHost={isHost} />
      {/* Next Steps Guide for Host */}
      {isHost && showGuide && queue.length === 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl"
              onClick={() => setShowGuide(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-700 dark:text-blue-300">
              Welcome! Next Steps
            </h2>
            <ol className="space-y-4 text-lg">
              <li className="flex items-center gap-3">
                <FiLink className="w-6 h-6 text-blue-500" />
                <span>
                  Share this room link:{" "}
                  <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {`http://192.168.56.1:5173/room/${roomId}`}
                  </span>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FiYoutube className="w-6 h-6 text-red-500" />
                <span>Add a YouTube video to start watching together</span>
              </li>
              <li className="flex items-center gap-3">
                <FiUserPlus className="w-6 h-6 text-green-500" />
                <span>Invite your friends to join the room</span>
              </li>
            </ol>
            <button
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition-all"
              onClick={() => setShowGuide(false)}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">
          <div className="flex-1 flex flex-col">
            <div className="relative bg-black">
              <YoutubePlayer
                videoId={queue[currentIndex] || null}
                roomId={roomId}
                isHost={isHost}
                onPlayerReady={handlePlayerReady}
                onStateChange={handleStateChange}
              />

              {playerRef.current && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-11/12 max-w-xl">
                  <VideoControls
                    player={playerRef.current}
                    playing={playing}
                    onPlay={handlePlay}
                    onPause={handlePause}
                  />
                </div>
              )}
            </div>

            <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex">
                <button
                  className={`flex-1 py-3 text-center ${
                    activeTab === "users"
                      ? "border-b-2 border-primary-600 text-primary-600"
                      : ""
                  }`}
                  onClick={() => setActiveTab("users")}
                >
                  Users ({users.length})
                </button>
                <button
                  className={`flex-1 py-3 text-center ${
                    activeTab === "chat"
                      ? "border-b-2 border-primary-600 text-primary-600"
                      : ""
                  }`}
                  onClick={() => setActiveTab("chat")}
                >
                  Chat
                </button>
                <button
                  className={`flex-1 py-3 text-center ${
                    activeTab === "queue"
                      ? "border-b-2 border-primary-600 text-primary-600"
                      : ""
                  }`}
                  onClick={() => setActiveTab("queue")}
                >
                  Queue ({queue.length})
                </button>
              </div>
            </div>

            <div className="md:hidden flex-1 overflow-hidden">
              {activeTab === "users" && (
                <UserList users={users} host={host} currentUser={username} />
              )}
              {activeTab === "chat" && (
                <Chat roomId={roomId} username={username} />
              )}
              {activeTab === "queue" && (
                <Queue
                  roomId={roomId}
                  queue={queue}
                  currentIndex={currentIndex}
                  isHost={isHost}
                />
              )}
            </div>
          </div>

          <div className="hidden md:flex md:w-80 lg:w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-col">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                className={`flex-1 py-3 text-center ${
                  activeTab === "users"
                    ? "border-b-2 border-primary-600 text-primary-600"
                    : ""
                }`}
                onClick={() => setActiveTab("users")}
              >
                Users
              </button>
              <button
                className={`flex-1 py-3 text-center ${
                  activeTab === "chat"
                    ? "border-b-2 border-primary-600 text-primary-600"
                    : ""
                }`}
                onClick={() => setActiveTab("chat")}
              >
                Chat
              </button>
              <button
                className={`flex-1 py-3 text-center ${
                  activeTab === "queue"
                    ? "border-b-2 border-primary-600 text-primary-600"
                    : ""
                }`}
                onClick={() => setActiveTab("queue")}
              >
                Queue
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {activeTab === "users" && (
                <UserList users={users} host={host} currentUser={username} />
              )}
              {activeTab === "chat" && (
                <Chat roomId={roomId} username={username} />
              )}
              {activeTab === "queue" && (
                <Queue
                  roomId={roomId}
                  queue={queue}
                  currentIndex={currentIndex}
                  isHost={isHost}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
