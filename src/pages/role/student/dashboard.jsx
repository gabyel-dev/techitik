import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { logout, verifyStudentAccess } from "../../../api/auth";
import { JoinRoom } from "../../../api/rooms";
import { useAuth } from "../../../context/authContext";
import Loader from "../../../components/loader";
import {
  PiBooksDuotone,
  PiMagnifyingGlassDuotone,
  PiBellDuotone,
  PiSignOut,
  PiSignOutDuotone,
} from "react-icons/pi";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, loading: isLoading, setUser } = useAuth();
  const { id } = useParams();
  const [verifying, setVerifying] = useState(true);
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate("/", { replace: true });
      return;
    }
    verifyStudentAccess(id)
      .then(() => setVerifying(false))
      .catch(() => navigate("/", { replace: true }));
  }, [isLoading, user, id, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } finally {
      navigate("/", { replace: true });
    }
  };

  const handleJoinRoom = async () => {
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
  };

  if (isLoading || verifying) {
    return <Loader />;
  }

  return (
    <div className="relative flex h-screen w-full bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white  flex-col hidden md:block">
        <div className="flex h-16 items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
              <PiBooksDuotone size={20} />
            </div>
            <span className="text-sm font-bold tracking-wide text-slate-900">
              TechItik
            </span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3 px-3">
            Menu
          </div>
          <button className="flex w-full items-center gap-3 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700 transition-colors">
            <PiBooksDuotone size={18} className="text-emerald-500" />
            Dashboard
          </button>
        </nav>
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition-colors"
          >
            <PiSignOutDuotone size={18} className="text-slate-400" />
            Logout
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden items-center justify-center">
        {/* Topbar */}
        <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-8">
          <div className="flex items-center w-full max-w-md gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-500">
            <PiMagnifyingGlassDuotone className="text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search classes or quizzes..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-slate-600">
              <PiBellDuotone size={22} />
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full border-2 border-white bg-emerald-500"></span>
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="flex flex-col items-end">
                <p className="username text-sm font-semibold text-slate-900 leading-none">
                  {user?.full_name.toLowerCase()}
                </p>
                <span className="text-xs  first-letter:uppercase text-slate-500 mt-1">
                  {user?.role}
                </span>
              </div>
              <div className="h-9 w-9 rounded-full  flex items-center justify-center text-emerald-700 font-bold border border-white p-0.5 ring-2   ring-emerald-500">
                <img
                  src={`https://juexwulmukznvepvtzts.supabase.co/storage/v1/object/public/profiles/${user.google_id}.png`}
                  alt="Instructors Profile Picture"
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        </header>
        {/* Centered Enter Class Code */}
        <div className="flex flex-1 w-full items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 flex flex-col items-center w-full max-w-md">
            <h2 className="text-xl font-bold mb-2 text-slate-900">
              Enter Class Code
            </h2>
            <p className="text-sm text-slate-500 mb-6 text-center">
              Ask your teacher for the room code to join the class
            </p>
            {error && (
              <div className="w-full bg-rose-100 text-rose-700 px-4 py-2 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            <input
              type="text"
              placeholder="e.g. ABC123"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-lg mb-6 text-center font-mono tracking-wider"
              maxLength={8}
            />
            <button
              onClick={handleJoinRoom}
              disabled={loading || !roomCode.trim()}
              className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-white font-semibold text-base shadow hover:bg-emerald-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {loading ? "Joining..." : "Join Class"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
