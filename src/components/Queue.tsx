import React, { useState } from "react";
import { MdQueueMusic, MdDelete } from "react-icons/md";

import { addVideoToQueue, deleteVideoFromQueue } from "../utils/api";
import { extractVideoId } from "../utils/config";
import { emitNextVideo } from "../utils/socket";
import toast from "react-hot-toast";
import { cn } from "../utils/cn";

interface QueueProps {
  roomId: string;
  queue: string[];
  currentIndex: number;
  isHost: boolean;
}

const Queue: React.FC<QueueProps> = ({
  roomId,
  queue,
  currentIndex,
  isHost,
}) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      toast.error("Invalid YouTube URL or ID");
      return;
    }

    try {
      setIsAdding(true);
      await addVideoToQueue(roomId, videoId);
      setVideoUrl("");
      toast.success("Video added to queue");
    } catch (error) {
      toast.error("Failed to add video");
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleNextVideo = () => {
    if (isHost && currentIndex < queue.length - 1) {
      emitNextVideo(roomId);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      await deleteVideoFromQueue(roomId, videoId);
      toast.success("Video removed from queue");
    } catch (error) {
      toast.error("Failed to remove video");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <form
        onSubmit={handleAddVideo}
        className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      >
        <div className="mb-2">
          <label
            htmlFor="videoUrl"
            className="text-base font-semibold block mb-1 text-gray-800 dark:text-gray-100"
          >
            Add a YouTube video to the queue
          </label>
          <div className="flex gap-2">
            <input
              id="videoUrl"
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste YouTube URL or video ID here..."
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={!videoUrl.trim() || isAdding}
              className="p-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-all"
            >
              {isAdding ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Paste a YouTube URL or video ID and click Add
        </p>
      </form>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {queue.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>Queue is empty. Add some videos!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {queue.map((videoId, index) => (
              <div
                key={videoId}
                className={cn(
                  "p-3 rounded-lg flex items-center",
                  index === currentIndex
                    ? "bg-primary-100 dark:bg-primary-900/30 border-l-4 border-primary-600"
                    : "bg-gray-100 dark:bg-gray-800"
                )}
              >
                <div className="flex-shrink-0 w-24 h-16 mr-3 bg-black rounded overflow-hidden">
                  <a
                    href={`https://youtube.com/watch?v=${videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </a>
                </div>
                <div className="overflow-hidden flex-1">
                  <p
                    className={cn(
                      "truncate text-sm",
                      index === currentIndex ? "font-medium" : ""
                    )}
                  >
                    {index === currentIndex && "▶ "}
                    Video {index + 1}
                  </p>
                  <a
                    href={`https://youtube.com/watch?v=${videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 underline truncate block"
                  >
                    {`https://youtube.com/watch?v=${videoId}`}
                  </a>
                </div>
                {isHost && (
                  <button
                    onClick={() => handleDeleteVideo(videoId)}
                    className="ml-4 p-2 text-red-600 hover:text-red-800 rounded-full"
                    title="Remove video"
                  >
                    <MdDelete className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Queue;
