import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { GetRooms } from "../api/rooms";

const RoomsContext = createContext();

export const useRooms = () => useContext(RoomsContext);

export const RoomsProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await GetRooms();
      setRooms(res.data);
    } catch (err) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return (
    <RoomsContext.Provider value={{ rooms, loading, refetchRooms: fetchRooms }}>
      {children}
    </RoomsContext.Provider>
  );
};
