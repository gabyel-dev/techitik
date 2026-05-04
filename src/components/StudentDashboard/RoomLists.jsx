import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "../../context/sidebarContext";
import {
  PiBooksDuotone,
  PiUsersDuotone,
  PiArrowRightDuotone,
} from "react-icons/pi";
import { GetStudentRooms } from "../../api/rooms";

export const GetStudentRoomLists = () => {
  const { isOpen, setIsOpen, isDesktop } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleRoomClick = (roomId) => {
    navigate(`room/${roomId}`);
    // Close sidebar on mobile after clicking
    if (!isDesktop) {
      setIsOpen(false);
    }
  };

  const fetchStudentRooms = async () => {
    setLoading(true);
    try {
      const data = await GetStudentRooms();
      setRooms(data.data || []);
    } catch (error) {
      console.error("Failed to fetch student rooms:", error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentRooms();
  }, []);

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
      <div className="space-y-4 w-full ">
        <div className="text-center py-8 text-slate-500 text-sm">
          No classes yet. Join your first class!
        </div>
        <button
          onClick={fetchStudentRooms}
          className="text-center w-full bg-[var(--primary)] text-white py-2 "
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-3">
        {rooms.map((room) => {
          const isActive = location.pathname.includes(`/room/${room?.id}`);
          return (
            <div
              key={room?.id}
              onClick={() => handleRoomClick(room?.id)}
              className={`group relative rounded-xl bg-[var(--bg)] p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                isActive
                  ? "border-2 border-emerald-500 shadow-md"
                  : "hover:border-emerald-200"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`${isOpen ? "" : "flex items-center justify-center w-full"}`}
                  >
                    <h3 className="font-semibold text-[var(--text-green)] group-hover:text-emerald-600 transition-colors">
                      {isOpen ? room?.name : room?.name?.charAt(0)}
                    </h3>
                    {isOpen && (
                      <p className="text-xs text-slate-500">{room?.subject}</p>
                    )}
                  </div>
                </div>
                {isOpen && (
                  <PiArrowRightDuotone
                    className="text-slate-300 group-hover:text-emerald-500 transition-colors"
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
                      <span>{room?.member_count || 0}</span>
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
