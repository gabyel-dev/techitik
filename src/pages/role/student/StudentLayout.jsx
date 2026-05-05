import { useEffect, useRef } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import { verifyStudentAccess } from "../../../api/auth";
import { useAuth } from "../../../context/authContext";

import StudentSidebar from "../../../components/StudentSidebar";
import StudentHeader from "../../../components/StudentDashboard/StudentHeader";
import { RoomsProvider } from "../../../context/roomsContext";

function StudentLayoutContent() {
  const navigate = useNavigate();
  const { user, loading: isLoading } = useAuth();
  const { id } = useParams();
  const hasVerified = useRef(false);

  useEffect(() => {
    if (isLoading || hasVerified.current) return;
    if (!user) {
      navigate("/", { replace: true });
      return;
    }
    hasVerified.current = true;
    verifyStudentAccess(id).catch(() => navigate("/", { replace: true }));
  }, [isLoading, user, id]);

  return (
    <div className="fixed  h-screen w-full bg-white text-slate-800 font-[var(--font-body)]">
      <StudentHeader />
      <div className="relative flex h-screen w-full bg-white text-slate-800 font-[var(--font-body)]">
        <StudentSidebar />
        <main className="flex w-full flex-col">
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function StudentLayout() {
  return (
    <RoomsProvider isStudent={true}>
      <StudentLayoutContent />
    </RoomsProvider>
  );
}
