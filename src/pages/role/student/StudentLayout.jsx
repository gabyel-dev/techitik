import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import { verifyStudentAccess } from "../../../api/auth";
import { useAuth } from "../../../context/authContext";
import Loader from "../../../components/loader";
import StudentSidebar from "../../../components/StudentSidebar";
import StudentHeader from "../../../components/StudentDashboard/StudentHeader";

export default function StudentLayout() {
  const navigate = useNavigate();
  const { user, loading: isLoading } = useAuth();
  const { id } = useParams();
  const [verifying, setVerifying] = useState(true);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (isLoading || hasVerified.current) return;
    if (!user) {
      navigate("/", { replace: true });
      return;
    }
    hasVerified.current = true;
    verifyStudentAccess(id)
      .then(() => setVerifying(false))
      .catch(() => navigate("/", { replace: true }));
  }, [isLoading, user, id]);

  if (isLoading || verifying) {
    return <Loader />;
  }

  return (
    <div className="relative flex h-screen w-full bg-emerald-50 text-slate-800 font-[var(--font-body)]">
      <StudentSidebar />
      <main className="flex w-full flex-col">
        <StudentHeader />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
