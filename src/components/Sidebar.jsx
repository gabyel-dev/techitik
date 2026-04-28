import { Navigate } from "react-router-dom";
import { logout } from "../api/auth";
import { useAuth } from "../context/authContext";
import {
  PiBooksDuotone,
  PiChartLineUpDuotone,
  PiGearDuotone,
  PiHouseDuotone,
  PiSignOutDuotone,
  PiUsersDuotone,
} from "react-icons/pi";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } finally {
      Navigate({ to: "/" }, { replace: true });
    }
  };

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col hidden md:block">
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
          <PiHouseDuotone size={18} className="text-emerald-500" />
          Dashboard
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
          <PiBooksDuotone size={18} className="text-slate-400" />
          Quizzes
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
          <PiUsersDuotone size={18} className="text-slate-400" />
          Students
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
          <PiChartLineUpDuotone size={18} className="text-slate-400" />
          Results
        </button>

        <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-8 mb-3 px-3">
          System
        </div>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
          <PiGearDuotone size={18} className="text-slate-400" />
          Settings
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
  );
}
