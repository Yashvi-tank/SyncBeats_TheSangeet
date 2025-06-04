import React, { useEffect, useRef } from "react";
import YouTube, {
  YouTubePlayer,
  YouTubeEvent,
  YouTubeProps,
} from "react-youtube";
import {
  emitPlayEvent,
  emitPauseEvent,
  emitSeekEvent,
  emitNextVideo,
} from "../utils/socket";

interface YoutubePlayerProps {
  videoId: string | null;
  roomId: string;
  isHost: boolean;
  onPlayerReady: (player: YouTubePlayer) => void;
  onStateChange: (state: number) => void;
}

const YoutubePlayer: React.FC<YoutubePlayerProps> = ({
  videoId,
  roomId,
  isHost,
  onPlayerReady,
  onStateChange,
}) => {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const lastTimeUpdateRef = useRef<number>(0);
  const syncTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Clean up interval on unmount
    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  const opts: YouTubeProps["opts"] = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
      fs: 1,
    },
  };

  const handleReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    onPlayerReady(event.target);
  };

  const handleStateChange = (event: YouTubeEvent) => {
    // Only emit events if user is host
    if (isHost) {
      const state = event.data;

      // YT.PlayerState.PLAYING = 1
      if (state === 1) {
        emitPlayEvent(roomId);
      }
      // YT.PlayerState.PAUSED = 2
      else if (state === 2) {
        emitPauseEvent(roomId);
      }
      // YT.PlayerState.ENDED = 0
      else if (state === 0) {
        emitNextVideo(roomId);
      }

      // Emit current time when playing to keep in sync
      if (state === 1 && playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime();

        // Only emit seek if time has changed significantly
        if (Math.abs(currentTime - lastTimeUpdateRef.current) > 1) {
          emitSeekEvent(roomId, currentTime);
          lastTimeUpdateRef.current = currentTime;
        }

        // Set up periodic time sync for host
        if (syncTimeoutRef.current) {
          window.clearTimeout(syncTimeoutRef.current);
        }

        syncTimeoutRef.current = window.setTimeout(() => {
          if (playerRef.current) {
            const newTime = playerRef.current.getCurrentTime();
            if (Math.abs(newTime - lastTimeUpdateRef.current) > 1) {
              emitSeekEvent(roomId, newTime);
              lastTimeUpdateRef.current = newTime;
            }
          }
        }, 5000); // Sync every 5 seconds
      }
    }

    onStateChange(event.data);
  };

  if (!videoId) {
    return (
      <div className="youtube-container bg-gray-800 flex items-center justify-center">
        <div className="text-center p-4">
          <h3 className="text-xl font-semibold mb-2">No video playing</h3>
          <p className="text-gray-400">
            Add a video to the queue to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="youtube-container">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={handleReady}
        onStateChange={handleStateChange}
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
};

export default YoutubePlayer;
