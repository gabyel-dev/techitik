import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GetRoomDetails } from "../api/rooms";
import { useAuth } from "../context/authContext";
import Loader from "../components/loader";
import StudentSidebar from "../components/StudentSidebar";
import StudentHeader from "../components/StudentDashboard/StudentHeader";
import {
  PiUsersDuotone,
  PiBookOpenDuotone,
  PiClipboardTextDuotone,
  PiCalendarDuotone,
  PiArrowLeftDuotone,
  PiCrownDuotone,
} from "react-icons/pi";

export default function RoomDetails() {
  const navigate = useNavigate();
  const { user, loading: isLoading } = useAuth();
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (isLoading || hasLoaded.current) return;
    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    hasLoaded.current = true;
    fetchRoomDetails();
  }, [isLoading, user, roomId]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const response = await GetRoomDetails(roomId);
      setRoom(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load room details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading || loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 text-slate-800 font-[var(--font-body)]">
      <StudentSidebar />

      <main className="flex w-full flex-col">
        <StudentHeader />

        <div className="flex-1 overflow-y-auto p-3 sm:p-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-slate-600 hover:text-[var(--primary)] transition-colors"
          >
            <PiArrowLeftDuotone size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {room?.name}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <PiBookOpenDuotone size={18} className="text-blue-500" />
                    <span>{room?.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PiClipboardTextDuotone
                      size={18}
                      className="text-emerald-500"
                    />
                    <span>Section: {room?.section}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PiCalendarDuotone size={18} className="text-amber-500" />
                    <span>Created: {formatDate(room?.created_at)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-100 px-4 py-2 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  Room Code
                </p>
                <p className="text-xl font-bold text-[var(--primary)] uppercase">
                  {room?.room_code}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <PiUsersDuotone size={24} className="text-[var(--primary)]" />
                  Members
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {room?.members?.length || 0} total members
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {room?.members?.map((member) => (
                <div
                  key={member.id}
                  className="px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                        {member.user?.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 flex items-center gap-2">
                          {member.user?.full_name}
                          {member.role === "teacher" && (
                            <PiCrownDuotone
                              size={16}
                              className="text-amber-500"
                            />
                          )}
                        </p>
                        <p className="text-xs text-slate-500">
                          {member.user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          member.role === "teacher"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {member.role}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        Joined: {formatDate(member.joined_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
