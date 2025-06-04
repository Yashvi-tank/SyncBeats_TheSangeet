// src/components/RoomHeader.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../utils/cn";
import { FiSend } from "react-icons/fi";
import { MdQueueMusic } from "react-icons/md";
import { getSocket } from "../utils/socket";

interface RoomHeaderProps {
  roomId: string;
  isHost: boolean;
  // If you have a ThemeContext, you can uncomment these two lines:
  // theme: 'light' | 'dark';
  // toggleTheme: () => void;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({
  roomId,
  isHost /*, theme, toggleTheme */,
}) => {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-white dark:bg-gray-800 shadow py-4 px-6 flex items-center justify-between">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate("/")}
          className={cn(
            "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white",
            "font-medium"
          )}
        >
          ← Back
        </button>
      </div>

      {/* Room Info */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Room ID: {roomId}
        </h2>
        {isHost && (
          <p className="text-sm text-green-600 dark:text-green-400">
            You are the host
          </p>
        )}
      </div>

      {/* Theme Toggle and Exit Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            /* 
              If you have a ThemeContext, uncomment and use these:
              toggleTheme();
            */
          }}
          className={cn(
            "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white",
            "font-medium"
          )}
        >
          Toggle Theme
        </button>
        <button
          onClick={() => {
            const socket = getSocket();
            if (socket && socket.connected) {
              socket.disconnect();
            }
            window.location.href = "http://localhost:5173";
          }}
          className={cn(
            "ml-2 px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition font-medium"
          )}
        >
          Exit Room
        </button>
      </div>
    </header>
  );
};

export default RoomHeader;
