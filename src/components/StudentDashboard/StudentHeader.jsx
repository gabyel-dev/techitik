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
import { useNavigate, useParams } from "react-router-dom";
import { logout } from "../../api/auth";
import { DropdownModal } from "../Modal/DropdownModal";

export default function StudentHeader() {
  const { user, setUser } = useAuth();
  const { roomId } = useParams();
  const { toggleSidebar } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    const storedRoom = sessionStorage.getItem(`room_${roomId}`);

    const room = JSON.parse(storedRoom);
    setRoomName(room?.name);
  }, [roomId]);

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
    <header className="flex sticky top-0 h-14 sm:h-16 items-center justify-between border-b border-slate-200/60 bg-slate-100   backdrop-blur-xl px-3 sm:px-8 shadow-sm z-34">
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <button
          onClick={toggleSidebar}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Menu size={20} className="w-8 h-8" color="var(--primary)" />
        </button>
        <img src="/logo.png" alt="PTC Logo" className="w-7 sm:w-9" />
        <span className="hover:underline hover:text-emerald-700 truncate">
          {roomName ? roomName : ""}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-6">
        <button className="relative text-[var(--primary)] hover:text-slate-900 transition-colors duration-200 p-1.5 sm:p-2 rounded-full hover:bg-[var(--bg)]">
          <PiBellDuotone size={18} className="sm:w-[22px] sm:h-[22px]" />
          <span className="absolute right-1 top-1 sm:right-1.5 sm:top-1.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full border-2 border-white bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/20"></span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="hidden md:flex flex-col items-end">
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
            <DropdownModal
              setIsDropdownOpen={setIsDropdownOpen}
              user={user}
              handleLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </header>
  );
}
