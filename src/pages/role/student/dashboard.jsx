import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { verifyStudentAccess } from "../../../api/auth";
import { JoinRoom } from "../../../api/rooms";
import { useAuth } from "../../../context/authContext";
import Loader from "../../../components/loader";
import StudentSidebar from "../../../components/StudentSidebar";
import StudentHeader from "../../../components/StudentDashboard/StudentHeader";
import {
  PiBooksDuotone,
  PiPlusDuotone,
  PiSparkleDuotone,
  PiTrophyDuotone,
  PiClockDuotone,
  PiUsersDuotone,
} from "react-icons/pi";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, loading: isLoading } = useAuth();
  const { id } = useParams();
  const [verifying, setVerifying] = useState(true);
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleJoinRoom = useCallback(async () => {
    if (!roomCode.trim()) {
      setError("Please enter a room code");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await JoinRoom({ room_code: roomCode });
      setRoomCode("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join room");
      setTimeout(() => setError(""), 6000);
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  if (isLoading || verifying) {
    return <Loader />;
  }

  return (
    <>
      <div className="relative flex h-screen w-full bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 text-slate-800 font-[var(--font-body)]">
        <StudentSidebar />

        <main className="flex w-full flex-col ">
          <StudentHeader />

          <div className="flex-1 overflow-y-auto p-3 sm:p-8">
            <div className="mb-8 rounded-4xl md:max-h-50 max-h-40 flex  bg-[var(--primary)] py-6 px-3 text-white shadow-2xl shadow-emerald-500/40 relative">
              <img
                src="/sprites/pose_4.png"
                alt="sprites"
                className="relative w-40 md:w-60 h-full md:-translate-y-10 md:translate-x-0 -translate-x-6 z-1"
              />
              <span className="relative text-[var(--secondary)] md:translate-y-15 -translate-x-18 text-2xl md:-translate-x-5 rotate-28 z-10">
                ▲
              </span>

              <div className="absolute inset-0 overflow-hidden rounded-4xl">
                <img
                  src="/logo.png"
                  alt="PTC Logo"
                  className="absolute right-0 opacity-10 saturate-0 translate-x-24 w-150"
                />
              </div>

              <div className="flex items-center h-fit min-w-45 max-w-100 justify-between -translate-x-14 -translate-y-4 md:translate-y-0 md:translate-x-0 bg-[var(--secondary)] rounded-3xl md:rounded-[40px] py-5 px-10 md:p-8 z-10">
                <div>
                  <h2 className="md:text-2xl text-xl font-semibold">
                    Welcome back,{" "}
                    <span className="text-[var(--primary)] text-3xl">
                      {user?.full_name?.split(" ")[0]}!
                    </span>{" "}
                  </h2>
                  <p className="mt-1 text-xs md:text-sm text-emerald-100">
                    Ready to learn something new today?
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center mx-auto justify-center mb-4 sm:mb-8">
              <div className="mx-auto flex flex-col items-center">
                <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  My Dashboard
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 flex items-center gap-2">
                  Track your progress and join classes
                  <PiSparkleDuotone className="text-amber-400" size={14} />
                </p>
              </div>
            </div>

            <main className="__main_container__ flex flex-col-reverse lg:flex-row gap-4 sm:gap-8 w-full relative">
              <section className="__overview__ flex-1">
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 sm:mb-8">
                  <div className="rounded-2xl border border-slate-200/60 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-sm group-hover:scale-105 transition-transform">
                          <PiBooksDuotone size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">
                            My Classes
                          </p>
                          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                            5
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/60 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 shadow-sm group-hover:scale-105 transition-transform">
                          <PiTrophyDuotone
                            size={20}
                            className="sm:w-6 sm:h-6"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Completed
                          </p>
                          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                            12
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/60 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 shadow-sm group-hover:scale-105 transition-transform">
                          <PiClockDuotone size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Pending
                          </p>
                          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                            3
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden flex flex-col">
                  <div className="border-b border-slate-100 px-3 sm:px-6 py-3 sm:py-5 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                        My Classes
                      </h2>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                        Classes you're enrolled in
                      </p>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No classes yet. Join your first class!
                    </div>
                  </div>
                </div>
              </section>

              <aside className="__join_room__ w-full lg:w-80">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 sm:p-6 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <PiPlusDuotone className="text-white" size={20} />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        Join Class
                      </h2>
                      <p className="text-xs text-slate-500">Enter room code</p>
                    </div>
                  </div>
                  {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl mb-4 text-xs">
                      {error}
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="e.g. ABC123"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-center font-mono tracking-wider mb-4"
                    maxLength={8}
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={loading || !roomCode.trim()}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {loading ? "Joining..." : "Join Class"}
                  </button>
                </div>
              </aside>
            </main>
          </div>
        </main>
      </div>
    </>
  );
}
