import { useEffect } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import { verifyTeacherAccess } from "../../../api/auth";
import { useAuth } from "../../../context/authContext";
import { RoomsProvider, useRooms } from "../../../context/roomsContext";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/TeacherDashboard/Header";

function TeacherLayoutContent() {
  const navigate = useNavigate();
  const { user, loading: isLoading } = useAuth();
  const { id } = useParams();
  const { refetchRooms } = useRooms();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate("/", { replace: true });
      return;
    }
    verifyTeacherAccess(id).catch(() => navigate("/", { replace: true }));
  }, [isLoading, user, id]);

  useEffect(() => {
    const handleRoomUpdate = () => {
      refetchRooms();
    };

    window.addEventListener("roomUpdated", handleRoomUpdate);
    return () => window.removeEventListener("roomUpdated", handleRoomUpdate);
  }, [refetchRooms]);

  return (
    <>
      <div className="fixed  h-screen w-full bg-white text-slate-800 font-[var(--font-body)]">
        <Header />
        <div className="relative flex h-screen w-full bg-white text-slate-800 font-[var(--font-body)]">
          <Sidebar />
          <main className="flex w-full flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default function TeacherLayout() {
  return (
    <RoomsProvider>
      <TeacherLayoutContent />
    </RoomsProvider>
  );
}
