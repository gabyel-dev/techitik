import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetArchivedRooms, RestoreRoom } from "../../../api/rooms";
import {
  PiArchiveDuotone,
  PiArrowCounterClockwiseDuotone,
  PiArrowLeftDuotone,
} from "react-icons/pi";
import toast from "react-hot-toast";
import Loader from "../../../components/loader";

export default function ArchivedRooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);

  useEffect(() => {
    fetchArchivedRooms();
  }, []);

  const fetchArchivedRooms = async () => {
    try {
      const response = await GetArchivedRooms();
      setRooms(response.data || []);
    } catch (err) {
      toast.error("Failed to fetch archived rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (roomId) => {
    try {
      setRestoring(roomId);
      await RestoreRoom(roomId);
      toast.success("Room restored successfully");
      fetchArchivedRooms();
    } catch (err) {
      toast.error("Failed to restore room");
    } finally {
      setRestoring(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 text-sm font-medium transition-colors"
        >
          <PiArrowLeftDuotone size={20} />
          Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <PiArchiveDuotone size={24} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Archived Rooms
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {rooms.length} archived rooms
            </p>
          </div>
        </div>

        {rooms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <PiArchiveDuotone size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No archived rooms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2 truncate">
                  {room.name}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {room.subject} - {room.section}
                </p>
                <button
                  onClick={() => handleRestore(room.id)}
                  disabled={restoring === room.id}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50"
                >
                  <PiArrowCounterClockwiseDuotone size={18} />
                  {restoring === room.id ? "Restoring..." : "Restore"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
