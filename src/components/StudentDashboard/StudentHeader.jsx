import {
  PiBellDuotone,
  PiMagnifyingGlassDuotone,
  PiSignOutDuotone,
  PiUserDuotone,
} from "react-icons/pi";
import { useAuth } from "../../context/authContext";
import { useSidebar } from "../../context/sidebarContext";
import { AlignCenter, Menu } from "@duo-icons/react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/auth";

export default function StudentHeader() {
  const { user, setUser } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="flex sticky h-14 sm:h-16 items-center justify-between border-b border-slate-200/60 bg-[var(--primary)] backdrop-blur-xl px-3 sm:px-8 shadow-sm">
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <button
          onClick={toggleSidebar}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Menu size={20} className="w-8 h-8" color="white" />
        </button>
        <img src="/logo.png" alt="PTC Logo" className="w-7 sm:w-9" />
      </div>

      <div className="hidden md:flex items-center w-full max-w-md gap-3 rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-2.5 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all duration-300">
        <PiMagnifyingGlassDuotone className="text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search classes or quizzes..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
        <div className="flex items-center gap-1.5 rounded-md bg-slate-200/50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
          <span>⌘</span>
          <span>K</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-6">
        <button className="relative text-slate-50 hover:text-slate-900 transition-colors duration-200 p-1.5 sm:p-2 rounded-full hover:bg-[var(--bg)]">
          <PiBellDuotone size={18} className="sm:w-[22px] sm:h-[22px]" />
          <span className="absolute right-1 top-1 sm:right-1.5 sm:top-1.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full border-2 border-white bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/20"></span>
        </button>
        <div className="hidden sm:block h-6 w-px bg-slate-200"></div>

        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="hidden sm:flex flex-col items-end">
              <p className="username text-sm font-semibold text-slate-900 leading-none group-hover:text-emerald-600 transition-colors">
                {user?.full_name}
              </p>
              <span className="text-xs first-letter:uppercase text-slate-500 mt-1">
                {user?.role}
              </span>
            </div>
            <div className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-emerald-700 font-bold ring-2 ring-emerald-500 ring-offset-2 transition-transform duration-200 group-hover:scale-105">
              <img
                src={`https://juexwulmukznvepvtzts.supabase.co/storage/v1/object/public/profiles/${user.google_id}.png`}
                alt="Student Profile Picture"
                className="rounded-full"
              />
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500 border-2 border-white"></div>
            </div>
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.full_name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              </div>

              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={() => {
                  setIsDropdownOpen(false);
                }}
              >
                <PiUserDuotone size={18} className="text-slate-400" />
                <span>Profile</span>
              </button>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                onClick={handleLogout}
              >
                <PiSignOutDuotone size={18} className="text-rose-500" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
