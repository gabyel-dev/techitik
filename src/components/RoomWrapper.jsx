import { useParams, Outlet } from "react-router-dom";
import { RoomProvider } from "../context/roomContext";

export default function RoomWrapper() {
  const { roomId } = useParams();

  return (
    <RoomProvider roomId={roomId}>
      <Outlet />
    </RoomProvider>
  );
}
