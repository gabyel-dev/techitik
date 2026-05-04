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
        {rooms.map((room) => {
          const isActive = location.pathname.includes(`/room/${room?.id}`);
          return (
            <div
              key={room?.id}
              onClick={() => handleRoomClick(room?.id)}
              className={`group relative rounded-3xl   p-5 shadow-xl hover:shadow-md  cursor-pointer outline-0 ${
                isActive
                  ? "border-2 border-emerald-200 shadow-md shadow-emerald-200/30 bg-emerald-50"
                  : "hover:border-emerald-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`flex-1 min-w-0 ${isOpen ? "" : "flex items-center justify-center w-full"}`}
                  >
                    <h3 className="font-semibold truncate text-[var(--secondary)] group-hover:text-black/60 transition-colors">
                      {isOpen ? room?.name : room?.name?.charAt(0)}
                    </h3>
                  </div>
                </div>
              </div>

              {isOpen && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 pt-1 pb-0.5 rounded-full bg-[var(--secondary)] text-xs font-medium text-slate-50">
                      {room?.section}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xl font-bold text-slat-500">
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
