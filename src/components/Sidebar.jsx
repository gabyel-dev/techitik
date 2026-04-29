import { Navigate } from "react-router-dom";
import { logout } from "../api/auth";
import { useAuth } from "../context/authContext";
import { useSidebar } from "../context/sidebarContext";
import { PiGearDuotone, PiSignOutDuotone } from "react-icons/pi";

import { Book2, Dashboard, FolderOpen, IdCard } from "@duo-icons/react";
import { GetRoomLists } from "../components/TeacherDashboard/RoomLists";

export default function Sidebar() {
  const { setUser } = useAuth();
  const { isOpen, setIsOpen, isPinned } = useSidebar();

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } finally {
      Navigate({ to: "/" }, { replace: true });
    }
  };

  const handleMouseEnter = () => {
    if (!isPinned) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[45] transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`__side_bar__ pb-10 flex-col items-start gap-4 bg-white overflow-auto border-r-1 border-emerald-700/40 transition-all duration-300 z-[46] ${
          isOpen
            ? "flex fixed lg:sticky inset-y-0 left-0 w-[80%] lg:w-80"
            : "hidden lg:flex lg:sticky w-20"
        }`}
        style={{ height: "100vh" }}
      >
        <div
          className={`flex mb-3 flex-col w-full h-fit py-7 items-center justify-center bg-[var(--primary)] rounded-b-[45px] transition-all duration-300 ${
            isOpen ? "" : "px-2"
          }`}
        >
          <img
            src="/app_logo.png"
            alt="TechItik Logo"
            className={`transition-all duration-300 ${
              isOpen ? "w-30" : "w-12"
            }`}
          />
          {isOpen && (
            <h2 className="text-xl text-white font-[var(--font-heading)] mt-4">
              TechItik
            </h2>
          )}
        </div>

        <section
          className={`__nav_links__ w-full text-sm font-[var(--font-body)] flex flex-col gap-4 ${
            isOpen ? "px-5" : "px-2 items-center justive-center w-full"
          }`}
        >
          <span
            className={`flex gap-2 items-center cursor-pointer hover:text-emerald-600 transition-colors ${
              isOpen ? "" : "justify-center"
            }`}
            title={!isOpen ? "Dashboard" : ""}
          >
            <Dashboard size={24} color="var(--primary)" />
            {isOpen && <p>Dashboard</p>}
          </span>

          <span
            className={`flex gap-2 items-center cursor-pointer hover:text-emerald-600 transition-colors ${
              isOpen ? "" : "justify-center"
            }`}
            title={!isOpen ? "Quizzes" : ""}
          >
            <FolderOpen size={24} color="var(--primary)" />
            {isOpen && <p>Quizzes</p>}
          </span>

          <span
            className={`flex gap-2 items-center cursor-pointer hover:text-emerald-600 transition-colors ${
              isOpen ? "" : "justify-center"
            }`}
            title={!isOpen ? "Students" : ""}
          >
            <IdCard size={24} color="var(--primary)" />
            {isOpen && <p>Students</p>}
          </span>

          <span
            className={`inset-0  h-px bg-slate-200 ${isOpen ? "w-[100%]" : "w-10"}`}
          ></span>
        </section>

        <div
          className={`w-full h-full transition-all duration-300  ${isOpen ? "opacity-100" : "hidden "}`}
        >
          <GetRoomLists />
        </div>

        <span
          className={`flex gap-2 text-sm font-[var(--font-body)] cursor-pointer hover:text-emerald-600 transition-colors items-center ${
            isOpen ? "px-5" : "px-2 justify-center w-full"
          }`}
          title={!isOpen ? "Settings" : ""}
        >
          <PiGearDuotone size={24} color="var(--primary)" />
          {isOpen && <p>Settings</p>}
        </span>

        <button
          onClick={handleLogout}
          className={`flex gap-2 text-sm font-[var(--font-body)] hover:bg-slate-100 transition-colors duration-200 items-center ${
            isOpen ? "px-5" : "px-2 justify-center items-center w-full"
          }`}
          title={!isOpen ? "Logout" : ""}
        >
          <PiSignOutDuotone size={24} color="var(--primary)" />
          {isOpen && <p>Logout</p>}
        </button>
      </aside>
    </>
  );
}
