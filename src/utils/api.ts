// project/src/utils/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "", // Vite will proxy /api → http://localhost:5000/api
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export interface CreateRoomResponse {
  roomId: string;
}

export interface RoomDetailsResponse {
  exists: boolean;
  host?: string;
  users?: string[];
  queue?: string[];
  currentIndex?: number;
  playbackState?: {
    time: number;
    playing: boolean;
  };
}

// Create a new room
export const createRoom = async (): Promise<string> => {
  try {
    const response = await api.post<CreateRoomResponse>("/api/rooms");
    return response.data.roomId;
  } catch (error) {
    console.error("Error creating room:", error);
    throw new Error("Failed to create room");
  }
};

// Check if a room exists
export const checkRoomExists = async (
  roomId: string
): Promise<RoomDetailsResponse> => {
  try {
    const response = await api.get<RoomDetailsResponse>(`/api/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    console.error("Error checking room:", error);
    return { exists: false };
  }
};

// Add a video to a room's queue
export const addVideoToQueue = async (
  roomId: string,
  videoId: string
): Promise<void> => {
  try {
    await api.post(`/api/rooms/${roomId}/queue`, { videoId });
  } catch (error) {
    console.error("Error adding video to queue:", error);
    throw new Error("Failed to add video to queue");
  }
};

// Remove a video from a room's queue
export const deleteVideoFromQueue = async (
  roomId: string,
  videoId: string
): Promise<void> => {
  try {
    await api.delete(`/api/rooms/${roomId}/queue/${videoId}`);
  } catch (error) {
    console.error("Error deleting video from queue:", error);
    throw new Error("Failed to delete video from queue");
  }
};
