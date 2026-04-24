import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { verifyStudentAccess } from "../../../api/auth";
import { useAuth } from "../../../context/authContext";
import {
  PiBooksDuotone,
  PiMagnifyingGlassDuotone,
  PiBellDuotone,
} from "react-icons/pi";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, loading: isLoading } = useAuth();
  const { id } = useParams();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { navigate("/", { replace: true }); return; }
    verifyStudentAccess(id).catch(() =>
      navigate("/", { replace: true })
    );
  }, [isLoading, user, id, navigate]);
  return (
    <div className="relative flex h-screen w-full bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col">
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
                <span className="text-sm font-semibold text-slate-900 leading-none">
                  Student Name
                </span>
                <span className="text-xs text-slate-500 mt-1">Student</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
                S
              </div>
            </div>
          </div>
        </header>
        {/* Centered Enter Class Code */}
        <div className="flex flex-1 w-full items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 flex flex-col items-center w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-slate-900">
              Enter Class Code
            </h2>
            <input
              type="text"
              placeholder="e.g. ABC123"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 outline-none text-lg mb-6"
              disabled
            />
            <button
              className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-white font-semibold text-base shadow hover:bg-emerald-600 transition-colors"
              disabled
            >
              Join Class
            </button>
            <p className="mt-4 text-xs text-slate-400">
              (UI only, no functionality)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
