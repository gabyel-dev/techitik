import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useSidebar } from "../../context/sidebarContext";
import { PiGearDuotone, PiSignOutDuotone } from "react-icons/pi";
import Header from "../TeacherDashboard/Header";

export default function SharedSidebar({
  navItems,
  roomListComponent: RoomListComponent,
  roomsTitle = "My Rooms",
}) {
  const { isOpen, setIsOpen, isPinned, isDesktop } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);

    const diff = currentTouch - touchStart;
    if (isOpen && diff < 0) {
      setDragOffset(Math.max(diff, -280));
    } else if (!isOpen && diff > 0 && touchStart < 50) {
      setDragOffset(Math.min(diff, 280));
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && isOpen) {
      setIsOpen(false);
    } else if (isRightSwipe && !isOpen) {
      setIsOpen(true);
    }

    setDragOffset(0);
  };

  const handleNavClick = (path) => {
    navigate(path);
    // Close sidebar on mobile after clicking
    if (!isDesktop) {
      setIsOpen(false);
    }
  };

  const handleMouseEnter = () => {
    if (!isPinned && isDesktop) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned && isDesktop) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-45 overflow-hidden touch-none transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`__side_bar__ flex flex-col  bg-white border-r-slate-300 border-r-1 ease-in-out z-[46] fixed lg:sticky inset-y-0 left-0 shadow-xl lg:shadow-none ${
          isOpen
            ? "translate-x-0 w-72 min-w-0"
            : "-translate-x-full lg:translate-x-0 md:w-20"
        } ${isDragging ? "transition-none" : "transition-all duration-300"}`}
        style={{
          height: "100vh",
          transform:
            isDragging && !isDesktop
              ? `translateX(${isOpen ? dragOffset : 280 + dragOffset}px)`
              : undefined,
        }}
      >
        {/* Logo Section */}
        {/*   <div className="flex flex-col items-center sticky top-0 z-10 bg-gradient-to-b from-white to-transparent pb-4">
          <div
            className={`flex w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 transition-all duration-300 ${
              isOpen ? "h-24 rounded-b-3xl" : "h-20 rounded-b-2xl"
            }`}
          >
            <img
              src="/app_logo.png"
              alt="TechItik Logo"
              className={`transition-all duration-300 drop-shadow-lg ${
                isOpen ? "w-16" : "w-10"
              }`}
            />
          </div>
        </div> */}

        {/* Navigation Links */}
        <nav
          className={`flex flex-col gap-1.5 px-3 mt-5 ${
            isOpen ? "" : "items-center"
          }`}
        >
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.path)}
              className={`group relative flex items-center gap-4 rounded-full transition-all duration-200 ${
                isOpen ? "px-4 py-3" : "p-3 justify-center"
              } ${
                item.isActive
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                  : "text-slate-600 hover:bg-slate-100 hover:text-emerald-600"
              }`}
              title={!isOpen ? item.name : ""}
            >
              <item.icon
                size={22}
                color={item.isActive ? "white" : "var(--primary)"}
                className="flex-shrink-0"
              />
              {isOpen && (
                <span className="text-sm font-medium truncate">
                  {item.name}
                </span>
              )}
              {item.isActive && isOpen && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        {/* Divider */}
        <div
          className={`mx-auto my-4 bg-slate-200 h-px ${
            isOpen ? "w-[calc(100%-2rem)]" : "w-10"
          } transition-all duration-300`}
        />

        {/* Rooms Section Header */}
        {isOpen && (
          <div className="flex items-center justify-between px-5 pb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {roomsTitle}
            </h2>
            <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded-md hover:bg-emerald-50 transition-all">
              View All
            </button>
          </div>
        )}

        {/* Rooms List - Scrollable */}
        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ${
            isOpen ? "opacity-100 px-3" : "opacity-0 h-0"
          }`}
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#10b981 transparent",
          }}
        >
          {RoomListComponent && <RoomListComponent />}
        </div>

        {/* Bottom Actions - Sticky */}
        <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-4 pb-5 border-t border-slate-200/60 mt-auto">
          <div
            className={`flex flex-col gap-2 ${
              isOpen ? "px-3" : "px-2 items-center"
            }`}
          >
            <button
              onClick={() => handleNavClick("settings")}
              className={`group flex items-center gap-3 rounded-xl text-slate-600 transition-all duration-200 ${
                isOpen ? "px-4 py-3" : "p-3 justify-center"
              } ${
                location.pathname.includes("/settings")
                  ? "bg-slate-100 text-emerald-600 font-medium"
                  : "hover:bg-slate-100 hover:text-emerald-600"
              }`}
              title={!isOpen ? "Settings" : ""}
            >
              <PiGearDuotone
                size={22}
                color={
                  location.pathname.includes("/settings")
                    ? "var(--primary)"
                    : "currentColor"
                }
                className="flex-shrink-0"
              />
              {isOpen && <span className="text-sm font-medium">Settings</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
