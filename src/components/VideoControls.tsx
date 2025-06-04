import React, { useState, useEffect } from "react";

import { YouTubePlayer } from "react-youtube";
import { cn } from "../utils/cn";
import {
  MdPlayArrow,
  MdPause,
  MdVolumeUp,
  MdVolumeDown,
  MdVolumeOff,
} from "react-icons/md";

interface VideoControlsProps {
  player: YouTubePlayer | null;
  playing: boolean;
  onPlay: () => void;
  onPause: () => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  player,
  playing,
  onPlay,
  onPause,
}) => {
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      try {
        const currentTime = player.getCurrentTime() || 0;
        const duration = player.getDuration() || 0;
        setCurrentTime(currentTime);
        setDuration(duration);
      } catch (error) {
        console.error("Error getting player time:", error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [player]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);

    if (player) {
      player.setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (!player) return;

    if (isMuted) {
      player.unMute();
      player.setVolume(volume === 0 ? 50 : volume);
      setVolume(volume === 0 ? 50 : volume);
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (player) {
      player.seekTo(seekTime, true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const VolumeIcon = () => {
    if (isMuted || volume === 0) return <MdVolumeOff className="w-5 h-5" />;
    if (volume < 50) return <MdVolumeDown className="w-5 h-5" />;
    return <MdVolumeUp className="w-5 h-5" />;
  };

  return (
    <div className="bg-gray-900/90 p-3 rounded-lg backdrop-blur">
      <div className="flex items-center mb-2">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #7c3aed ${
              (currentTime / (duration || 1)) * 100
            }%, #4b5563 ${(currentTime / (duration || 1)) * 100}%)`,
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={playing ? onPause : onPlay}
            className="mr-4 p-2 rounded-full hover:bg-gray-800 text-white"
          >
            {playing ? (
              <MdPause className="w-5 h-5" />
            ) : (
              <MdPlayArrow className="w-5 h-5" />
            )}
          </button>

          <div className="text-xs text-gray-300">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className="flex items-center">
          <button onClick={toggleMute} className="mr-2 text-white">
            <VolumeIcon />
          </button>

          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className={cn(
              "w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer",
              isMuted && "opacity-50"
            )}
            style={{
              background: isMuted
                ? "#4b5563"
                : `linear-gradient(to right, #7c3aed ${volume}%, #4b5563 ${volume}%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoControls;
