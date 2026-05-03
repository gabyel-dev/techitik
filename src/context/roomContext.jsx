import { createContext, useContext, useState, useEffect } from "react";
import { GetRoomDetails } from "../api/rooms";
import { GetRoomQuizzes } from "../api/quiz";

const RoomContext = createContext();

export const useRoom = () => useContext(RoomContext);

export const RoomProvider = ({ children, roomId }) => {
  const [room, setRoom] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;
    
    const fetchData = async () => {
      try {
        const [roomRes, quizzesRes] = await Promise.all([
          GetRoomDetails(roomId),
          GetRoomQuizzes(roomId)
        ]);
        setRoom(roomRes.data);
        setQuizzes(quizzesRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [roomId]);

  return (
    <RoomContext.Provider value={{ room, quizzes, loading }}>
      {children}
    </RoomContext.Provider>
  );
};
