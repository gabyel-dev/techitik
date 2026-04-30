import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useRooms } from "../../context/roomContext";
import { useSidebar } from "../../context/sidebarContext";
import {
  PiBooksDuotone,
  PiUsersDuotone,
  PiArrowRightDuotone,
  PiClockDuotone,
} from "react-icons/pi";

export const GetRoomLists = () => {
  const { rooms, fetchRooms, loading } = useRooms();
  const { isOpen } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  if (loading) {
    return (
      <div className="space-y-4 w-full px-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="space-y-4 w-full px-4">
        <div className="text-center py-8 text-slate-500 text-sm">
          No rooms yet. Create your first room!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full  pb-3 px-4">
      <div className="space-y-3 overflow-hidden">
        {rooms.map((room) => {
          const isActive = location.pathname.includes(`/room/${room?.id}`);
          return (
            <div
              key={room?.id}
              onClick={() => navigate(`room/${room?.id}`)}
              className={`group relative rounded-3xl bg-[var(--bg)] p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                isActive
                  ? "border-2 border-emerald-500 shadow-md"
                  : "hover:border-emerald-200"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`flex-1 min-w-0 ${isOpen ? "" : "flex items-center justify-center w-full"}`}
                  >
                    <h3 className="font-semibold truncate text-[var(--text-green)] group-hover:text-emerald-600 transition-colors">
                      {isOpen ? room?.name : room?.name?.charAt(0)}
                    </h3>
                    {isOpen && (
                      <p className="text-xs text-slate-500 truncate">
                        {room?.subject}
                      </p>
                    )}
                  </div>
                </div>
                {isOpen && (
                  <PiArrowRightDuotone
                    className="text-slate-300 group-hover:text-emerald-500 transition-colors flex-shrink-0"
                    size={20}
                  />
                )}
              </div>

              {isOpen && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[var(--secondary)] text-xs font-medium text-slate-50">
                      {room?.section}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xl font-bold text-[var(--text-green)]">
                    <div className="flex items-center gap-1">
                      <PiUsersDuotone size={14} />
                      <span>{room?.student_count}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
