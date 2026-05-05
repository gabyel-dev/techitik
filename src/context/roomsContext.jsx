import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { GetRooms, GetStudentRooms } from "../api/rooms";

const RoomsContext = createContext();

export const useRooms = () => useContext(RoomsContext);

export const RoomsProvider = ({ children, isStudent = false }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const res = isStudent ? await GetStudentRooms() : await GetRooms();
      setRooms(res.data || []);
    } catch (err) {
      console.error(err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [isStudent]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    const handleRoomUpdate = () => {
      fetchRooms();
    };

    window.addEventListener("roomUpdated", handleRoomUpdate);
    return () => window.removeEventListener("roomUpdated", handleRoomUpdate);
  }, [fetchRooms]);

  return (
    <RoomsContext.Provider value={{ rooms, loading, refetchRooms: fetchRooms }}>
      {children}
    </RoomsContext.Provider>
  );
};
