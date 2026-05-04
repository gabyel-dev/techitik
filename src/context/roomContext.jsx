import { createContext, useContext, useState, useEffect } from "react";
import { GetRoomDetails, GetRoomRankings } from "../api/rooms";
import { GetRoomQuizzes } from "../api/quiz";

const RoomContext = createContext();

export const useRoom = () => useContext(RoomContext);

export const RoomProvider = ({ children, roomId }) => {
  const [room, setRoom] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (isInitial = false) => {
    if (!isInitial && loading) return;

    try {
      const [roomRes, quizzesRes, rankingsRes] = await Promise.all([
        GetRoomDetails(roomId),
        GetRoomQuizzes(roomId),
        GetRoomRankings(roomId),
      ]);
      setRoom(roomRes.data);
      setQuizzes(quizzesRes.data || []);
      setRankings(rankingsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);
    setRoom(null);
    setQuizzes([]);
    setRankings([]);

    fetchData(true);

    const interval = setInterval(() => {
      fetchData(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    if (room) {
      sessionStorage.setItem(`room_${roomId}`, JSON.stringify(room));
    }
  }, [room, roomId]);

  return (
    <RoomContext.Provider
      value={{
        room,
        quizzes,
        rankings,
        loading,
        refetchData: () => fetchData(false),
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
