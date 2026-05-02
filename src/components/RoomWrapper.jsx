import { useParams, Outlet } from "react-router-dom";
import { RoomProvider, useRoom } from "../context/roomContext";

function RoomContent() {
  const { loading } = useRoom();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-emerald-200 rounded-full mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

export default function RoomWrapper() {
  const { roomId } = useParams();

  return (
    <RoomProvider roomId={roomId}>
      <RoomContent />
    </RoomProvider>
  );
}
