import React, { useEffect } from "react";
import { MdPeople, MdEmojiEvents, MdClose } from "react-icons/md";
import { emitKickUser, getSocket } from "../utils/socket";
import toast from "react-hot-toast";

interface UserListProps {
  users: string[];
  host: string;
  currentUser: string;
}

// Helper to generate a color from a string
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 50%)`;
  return color;
}

const UserList: React.FC<UserListProps> = ({ users, host, currentUser }) => {
  useEffect(() => {
    const socket = getSocket();
    const handleKicked = () => {
      toast.error("You have been removed from the room by the host.");
      window.location.href = "/";
    };
    socket.on("kicked", handleKicked);
    return () => {
      socket.off("kicked", handleKicked);
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <MdPeople className="w-5 h-5 mr-2 text-primary-500" />
        <h3 className="text-lg font-medium">Users ({users.length})</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                style={{ background: stringToColor(user) }}
              >
                <span className="text-white font-medium">
                  {user.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user === currentUser ? `${user} (You)` : user}
                </p>
              </div>
              {user === host && (
                <MdEmojiEvents
                  className="w-4 h-4 text-yellow-500 ml-2 flex-shrink-0"
                  title="Host"
                />
              )}
              {host === currentUser && user !== currentUser && (
                <button
                  onClick={() =>
                    emitKickUser(
                      window.location.pathname.split("/").pop() || "",
                      user,
                      host
                    )
                  }
                  className="ml-2 p-1 text-red-600 hover:text-red-800 rounded-full"
                  title="Remove user"
                >
                  <MdClose className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserList;
