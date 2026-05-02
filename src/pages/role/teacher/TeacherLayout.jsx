import { useEffect, useState } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import { verifyTeacherAccess } from "../../../api/auth";
import { useAuth } from "../../../context/authContext";
import { RoomsProvider } from "../../../context/roomsContext";
import Loader from "../../../components/loader";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/TeacherDashboard/Header";

export default function TeacherLayout() {
  const navigate = useNavigate();
  const { user, loading: isLoading } = useAuth();
  const { id } = useParams();
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

  if (isLoading || verifying) {
    return <Loader />;
  }

  return (
    <RoomsProvider>
      <div className="relative flex h-screen w-full bg-emerald-50 text-slate-800 font-[var(--font-body)]">
        <Sidebar />
        <main className="flex w-full flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </RoomsProvider>
  );
}
