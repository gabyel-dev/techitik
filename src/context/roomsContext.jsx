import { createContext, useContext, useState, useEffect } from "react";
import { GetRooms } from "../api/rooms";

const RoomsContext = createContext();

export const useRooms = () => {
  const context = useContext(RoomsContext);
  if (!context) {
    throw new Error("useRooms must be used within RoomsProvider");
  }
  return context;
};

export const RoomsProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await GetRooms();
      setRooms(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load rooms");
      console.error("Rooms fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const refreshRooms = async () => {
    await fetchRooms();
  };

  return (
    <RoomsContext.Provider value={{ rooms, loading, error, refreshRooms }}>
      {children}
    </RoomsContext.Provider>
  );
};
