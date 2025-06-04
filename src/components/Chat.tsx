import React, { useState, useEffect, useRef } from "react";
import { FiMessageSquare, FiSend } from "react-icons/fi";

import { getSocket, sendChatMessage } from "../utils/socket";
import { cn } from "../utils/cn";

interface Message {
  username: string;
  message: string;
  timestamp: number;
}

interface ChatProps {
  roomId: string;
  username: string;
}

const Chat: React.FC<ChatProps> = ({ roomId, username }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = getSocket();

    const handleChatMessage = (data: { username: string; message: string }) => {
      setMessages((prev) => [...prev, { ...data, timestamp: Date.now() }]);
    };

    const handleChatHistory = (data: { messages: Message[] }) => {
      setMessages(data.messages);
    };

    socket.on("chat_message", handleChatMessage);
    socket.on("chat_history", handleChatHistory);

    return () => {
      socket.off("chat_message", handleChatMessage);
      socket.off("chat_history", handleChatHistory);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendChatMessage(roomId, input, username);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <FiMessageSquare className="w-5 h-5 mr-2 text-primary-500" />
        <h3 className="text-lg font-medium">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "mb-3 p-2 rounded-lg max-w-[85%]",
                message.username === username
                  ? "bg-primary-600 text-white ml-auto"
                  : "bg-gray-200 dark:bg-gray-800"
              )}
            >
              <div className="flex items-baseline mb-1">
                <span className="font-medium text-sm">
                  {message.username === username ? "You" : message.username}
                </span>
                <span className="text-xs ml-2 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm">{message.message}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-2 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="input flex-1 py-2"
          />
          <button
            type="submit"
            className="ml-2 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
            disabled={!input.trim()}
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
