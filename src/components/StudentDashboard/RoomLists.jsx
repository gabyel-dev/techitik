import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../context/sidebarContext";
import {
  PiBooksDuotone,
  PiUsersDuotone,
  PiArrowRightDuotone,
} from "react-icons/pi";
import { GetStudentRooms } from "../../api/rooms";

export const GetStudentRoomLists = () => {
  const { isOpen } = useSidebar();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentRooms = async () => {
      setLoading(true);
      try {
        const data = await GetStudentRooms();
        setRooms(data.rooms || []);
      } catch (error) {
        console.error("Failed to fetch student rooms:", error);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
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
      <div className="space-y-4 w-full px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">My Classes</h2>
          </div>
        </div>
        <div className="text-center py-8 text-slate-500 text-sm">
          No classes yet. Join your first class!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full px-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">My Classes</h2>
        </div>
        {isOpen && (
          <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-all">
            View All
          </button>
        )}
      </div>

      <div className="space-y-3">
        {rooms.map((room) => (
          <div
            key={room?.id}
            onClick={() => navigate(`/room/${room?.id}`)}
            className="group relative rounded-3xl bg-[var(--bg)] p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 cursor-pointer"
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
                    <span>{room?.student_count || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
