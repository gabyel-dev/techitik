import { useNavigate, useLocation } from "react-router-dom";
import { useRooms } from "../../context/roomsContext";
import { LoaderSpinner } from "../loader";
import { useSidebar } from "../../context/sidebarContext";
import { PiUsersDuotone, PiArrowRightDuotone } from "react-icons/pi";

export const GetRoomLists = () => {
  const { rooms, loading, refetchRooms } = useRooms();
  const { isOpen, setIsOpen, isDesktop } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoomClick = (roomId) => {
    navigate(`room/${roomId}`);
    // Close sidebar on mobile after clicking
    if (!isDesktop) {
      setTimeout(() => setIsOpen(false), 1000); // Delay to allow navigation before closing
    }
  };

  if (loading) {
    return <LoaderSpinner />;
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="space-y-4 w-full">
        <div className="text-center py-8 text-slate-500 text-sm">
          No rooms yet. Create your first room!
        </div>
        <button
          onClick={refetchRooms}
          className="text-center w-full bg-[var(--primary)] text-white py-2 "
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full pb-3">
      <div className="space-y-3 ">
        {rooms.map((room, index) => {
          const isActive = location.pathname.includes(`/room/${room?.id}`);
          return (
            <div
              key={room?.id}
              onClick={() => handleRoomClick(room?.id)}
              className={`group relative rounded-full   py-2 px-3  cursor-pointer outline-0 ${
                isActive
                  ? "border-2 border-emerald-200 shadow-md shadow-emerald-200/30 bg-slate-50"
                  : "hover:border-emerald-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between ">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className={`${isOpen ? "flex items-center gap-4" : "flex items-center justify-center w-full flex-1 min-w-0"} flex-1 min-w-0`}
                  >
                    <span
                      className={`${index % 3 === 0 ? "bg-emerald-100" : index % 3 === 1 ? "bg-blue-100" : "bg-amber-100"} rounded-full text-[var(--text-green)]  group-hover:text-emerald-600 transition-colors flex items-center justify-center h-7 min-w-7 `}
                    >
                      <h1 className="pt-0.5 text-sm">
                        {room?.name?.charAt(0).toUpperCase()}
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
