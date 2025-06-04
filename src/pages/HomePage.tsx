// src/pages/HomePage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, checkRoomExists } from "../utils/api";
import { generateUsername } from "../utils/config";
import toast from "react-hot-toast";
import { cn } from "../utils/cn"; // your existing classnames helper
import { FiUsers, FiMessageSquare, FiPlayCircle } from "react-icons/fi";

const HomePage: React.FC = () => {
  const [joinRoomId, setJoinRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  // On first render, generate a random username if none is set
  useEffect(() => {
    if (!username) {
      setUsername(generateUsername());
    }
  }, [username]);

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    try {
      setIsCreating(true);
      const roomId = await createRoom();
      localStorage.setItem("syncbeats_username", username);
      navigate(`/room/${roomId}`);
    } catch (error) {
      toast.error("Could not create room. Please try again.");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    if (!joinRoomId.trim()) {
      toast.error("Please enter a room ID");
      return;
    }

    try {
      setIsJoining(true);
      const roomData = await checkRoomExists(joinRoomId);
      if (!roomData.exists) {
        toast.error(`Room ${joinRoomId} does not exist`);
        return;
      }
      localStorage.setItem("syncbeats_username", username);
      navigate(`/room/${joinRoomId}`);
    } catch (error) {
      toast.error("Could not join room. Please try again.");
      console.error(error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="p-4 bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            SyncBeats
          </h1>

          {/* If you still want a "Toggle Theme" button, just use text for now. */}
          <button
            onClick={() => {
              /* If you have a ThemeContext, call toggleTheme() here. */
              /* toggleTheme(); */
            }}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
          >
            Toggle Theme
          </button>
        </div>
      </header>

      <main className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
            {/* Left side: Create or Join form */}
            <div className="flex-1 p-8 flex flex-col justify-center">
              <div className="text-center md:text-left mb-8">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                  Watch YouTube Together
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Sync videos with friends in real-time and chat while watching
                </p>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Your Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter a username"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                  maxLength={20}
                />
              </div>
              <div className="flex flex-col gap-4 mb-6">
                {/* Create Room Button */}
                <button
                  onClick={handleCreateRoom}
                  disabled={isCreating || !username.trim()}
                  className={cn(
                    "bg-blue-600 text-white w-full py-2 rounded-md font-semibold hover:bg-blue-700 transition-all duration-150 shadow-md",
                    (isCreating || !username.trim()) &&
                      "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isCreating ? "Creating..." : "Create New Room"}
                </button>
                {/* Join Room Form */}
                <form
                  onSubmit={handleJoinRoom}
                  className="flex flex-col md:flex-row gap-2 items-stretch w-full"
                >
                  <div className="flex-1 flex flex-col">
                    <label
                      htmlFor="joinRoomId"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Join a Room by ID
                    </label>
                    <input
                      id="joinRoomId"
                      type="text"
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value)}
                      placeholder="Paste Room ID here..."
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={
                      isJoining || !joinRoomId.trim() || !username.trim()
                    }
                    className={cn(
                      "bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 transition-all duration-150 shadow-md mt-6 md:mt-0 md:self-end",
                      (isJoining || !joinRoomId.trim() || !username.trim()) &&
                        "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {isJoining ? "Joining..." : "Join"}
                  </button>
                </form>
              </div>
              <p className="text-center text-gray-500 dark:text-gray-400 text-xs mt-6">
                &copy; {new Date().getFullYear()} SyncBeats. All rights
                reserved.
              </p>
            </div>
            {/* Right side: Features panel */}
            <div className="hidden md:flex md:w-96 bg-blue-600 text-white flex-col justify-center items-center p-10 gap-6">
              <h3 className="text-2xl font-bold mb-2">Features</h3>
              <ul className="space-y-5 w-full">
                <li className="flex items-center gap-3 text-lg">
                  <FiPlayCircle className="w-7 h-7" />
                  Watch YouTube videos in perfect sync
                </li>
                <li className="flex items-center gap-3 text-lg">
                  <FiMessageSquare className="w-7 h-7" />
                  Chat in real-time
                </li>
                <li className="flex items-center gap-3 text-lg">
                  <FiUsers className="w-7 h-7" />
                  Host controls playback
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
