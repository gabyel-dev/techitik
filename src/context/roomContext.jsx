import { createContext, useContext, useState, useEffect } from "react";
import { GetRoomDetails } from "../api/rooms";
import { GetRoomQuizzes } from "../api/quiz";

const RoomContext = createContext();

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoom must be used within RoomProvider");
  }
  return context;
};

export const RoomProvider = ({ children, roomId }) => {
  const [room, setRoom] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomId) return;

    // Reset loading state when roomId changes
    setLoading(true);
    setRoom(null);
    setQuizzes([]);

    const fetchRoomData = async () => {
      try {
        const [roomResponse, quizzesResponse] = await Promise.all([
          GetRoomDetails(roomId),
          GetRoomQuizzes(roomId),
        ]);
        setRoom(roomResponse.data);
        setQuizzes(quizzesResponse.data || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load room");
        console.error("Room fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchRoomData, 5000);
    return () => clearInterval(interval);
  }, [roomId]);

  const refreshRoom = async () => {
    try {
      const [roomResponse, quizzesResponse] = await Promise.all([
        GetRoomDetails(roomId),
        GetRoomQuizzes(roomId),
      ]);
      setRoom(roomResponse.data);
      setQuizzes(quizzesResponse.data || []);
    } catch (err) {
      console.error("Room refresh error:", err);
    }
  };

  const getQuizById = (quizId) => {
    return quizzes.find((q) => q.id === quizId);
  };

  return (
    <RoomContext.Provider
      value={{ room, quizzes, loading, error, refreshRoom, getQuizById }}
    >
      {children}
    </RoomContext.Provider>
  );
};
