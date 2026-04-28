import { useEffect, useState } from "react";
import { GetRooms } from "../../api/rooms";
import { PiBooksDuotone, PiGearDuotone } from "react-icons/pi";

export const GetRoomLists = () => {
  const [rooms, setRooms] = useState([]);
  console.log(rooms);

  useEffect(() => {
    const fetchRooms = async () => {
      const roomsData = await GetRooms();
      setRooms(roomsData.rooms);
    };
    fetchRooms();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4">
      {rooms.map((room) => (
        <div
          key={room.id}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
        >
          {/* Subtle background subject tag */}
          <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <PiBooksDuotone size={100} />
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                {room.name}
              </h3>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span className="rounded-md bg-slate-100 px-2 py-0.5">
                  {room.subject}
                </span>
                <span>•</span>
                <span>{room.section}</span>
              </div>
            </div>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600">
              <PiGearDuotone size={18} />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-7 w-7 rounded-full border-2 border-white bg-slate-200"
                ></div>
              ))}
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-50 text-[10px] font-bold text-emerald-600">
                +12
              </div>
            </div>
            <button className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors">
              Open Room
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
