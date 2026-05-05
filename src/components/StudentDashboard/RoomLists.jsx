import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "../../context/sidebarContext";
import {
  PiBooksDuotone,
  PiUsersDuotone,
  PiArrowRightDuotone,
} from "react-icons/pi";
import { GetStudentRooms } from "../../api/rooms";
import { LoaderSpinner } from "../loader";

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
    return <LoaderSpinner />;
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
      <div className="space-y-1">
        {rooms.map((room) => {
          const isActive = location.pathname.includes(`/room/${room?.id}`);
          return (
            <div
              key={room?.id}
              onClick={() => handleRoomClick(room?.id)}
              className={`group relative  py-2 px-3    cursor-pointer outline-0 ${
                isActive
                  ? "border-2  rounded-full   border-emerald-200 shadow-md shadow-emerald-200/30 bg-gray-200"
                  : "hover:border-emerald-200"
              }`}
            >
              <div className="flex items-start justify-between ">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className={`${isOpen ? "flex items-center gap-4" : "flex items-center justify-center w-full flex-1 min-w-0"} flex-1 min-w-0`}
                  >
                    <span className=" rounded-full text-[var(--text-green)]  group-hover:text-emerald-600 transition-colors flex items-center justify-center h-7 min-w-7 bg-[var(--nav)]/30">
                      <h1 className="pt-0.5 text-sm">
                        {room?.name?.charAt(0)}
                      </h1>
                    </span>
                    <span className="flex flex-col flex-1 min-w-0">
                      <h3 className="text-sm  font-medium text-[var(--text-green)] truncate group-hover:text-emerald-600 transition-colors">
                        {room?.name}
                      </h3>
                      <span className="  text-xs    text-slate-400">
                        {room?.section}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
