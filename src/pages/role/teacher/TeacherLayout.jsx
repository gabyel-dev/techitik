import { useEffect, useState } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import { verifyTeacherAccess } from "../../../api/auth";
import { useAuth } from "../../../context/authContext";
import { RoomsProvider, useRooms } from "../../../context/roomsContext";
import Loader from "../../../components/loader";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/TeacherDashboard/Header";

function TeacherLayoutContent() {
  const navigate = useNavigate();
  const { user, loading: isLoading } = useAuth();
  const { id } = useParams();
  const { refetchRooms } = useRooms();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate("/", { replace: true });
      return;
    }
    verifyTeacherAccess(id)
      .then(() => setVerifying(false))
      .catch(() => navigate("/", { replace: true }));
  }, [isLoading, user, id]);

  useEffect(() => {
    const handleRoomUpdate = () => {
      refetchRooms();
    };

    window.addEventListener('roomUpdated', handleRoomUpdate);
    return () => window.removeEventListener('roomUpdated', handleRoomUpdate);
  }, [refetchRooms]);

  if (isLoading || verifying) {
    return <Loader />;
  }

  return (
    <div className="relative flex h-screen w-full bg-emerald-50 text-slate-800 font-[var(--font-body)]">
      <Sidebar />
      <main className="flex w-full flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function TeacherLayout() {
  return (
    <RoomsProvider>
      <TeacherLayoutContent />
    </RoomsProvider>
  );
}
