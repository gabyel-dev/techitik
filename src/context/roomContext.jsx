import { createContext, useContext, useState, useCallback } from "react";
import { GetRooms, CreateRoom as createRoomAPI } from "../api/rooms";

const RoomContext = createContext(null);

export const useRooms = () => useContext(RoomContext);

export const RoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GetRooms();
      setRooms(data.data || []);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRoom = useCallback(async (payload) => {
    const response = await createRoomAPI(payload);
    const newRoom = response.data;
    setRooms((prev) => [newRoom, ...prev]);
    return response;
  }, []);

  const updateRoom = useCallback((roomId, updates) => {
    setRooms((prev) =>
      prev.map((room) => (room.id === roomId ? { ...room, ...updates } : room)),
    );
  }, []);

  const deleteRoom = useCallback((roomId) => {
    setRooms((prev) => prev.filter((room) => room.id !== roomId));
  }, []);

  return (
    <RoomContext.Provider
      value={{
        rooms,
        loading,
        fetchRooms,
        createRoom,
        updateRoom,
        deleteRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
