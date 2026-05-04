import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GetArchivedRooms,
  GetDeletedRooms,
  RestoreRoom,
  PermanentDeleteRoom,
  BulkDeleteRooms,
} from "../../../api/rooms";
import {
  PiArchiveDuotone,
  PiArrowCounterClockwiseDuotone,
  PiArrowLeftDuotone,
  PiTrashDuotone,
  PiWarningDuotone,
  PiXBold,
} from "react-icons/pi";
import toast from "react-hot-toast";
import { Loader } from "../../../components/loader";

export default function ArchivedRooms() {
  const navigate = useNavigate();
  const [archivedRooms, setArchivedRooms] = useState([]);
  const [deletedRooms, setDeletedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("archived");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const [archivedRes, deletedRes] = await Promise.all([
        GetArchivedRooms(),
        GetDeletedRooms(),
      ]);
      setArchivedRooms(archivedRes.data || []);
      setDeletedRooms(deletedRes.data || []);
    } catch (err) {
      toast.error("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (roomId) => {
    try {
      setRestoring(roomId);
      await RestoreRoom(roomId);
      toast.success("Room restored successfully");
      fetchRooms();
    } catch (err) {
      toast.error("Failed to restore room");
    } finally {
      setRestoring(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedRoom) return;
    try {
      setDeleting(true);
      await PermanentDeleteRoom(selectedRoom.id);
      toast.success("Room permanently deleted");
      setShowDeleteModal(false);
      setSelectedRoom(null);
      fetchRooms();
    } catch (err) {
      toast.error("Failed to delete room");
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setDeleting(true);
      await BulkDeleteRooms();
      toast.success("Room permanently deleted");
      setShowDeleteModal(false);
      setSelectedRoom(null);
      fetchRooms();
    } catch (err) {
      toast.error("Failed to delete room");
    } finally {
      setDeleting(false);
    }
  };

  const currentRooms = activeTab === "archived" ? archivedRooms : deletedRooms;

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
              Archived & Deleted Rooms
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {archivedRooms.length} archived, {deletedRooms.length} in recycle
              bin
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("archived")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === "archived"
                  ? "bg-amber-500 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              Archived ({archivedRooms.length})
            </button>
            <button
              onClick={() => setActiveTab("deleted")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === "deleted"
                  ? "bg-red-500 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              Recycle Bin ({deletedRooms.length})
            </button>
          </div>
          <button onClick={() => handleBulkDelete()}>Delete All</button>
        </div>

        {currentRooms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              {activeTab === "archived" ? (
                <PiArchiveDuotone size={32} className="text-slate-400" />
              ) : (
                <PiTrashDuotone size={32} className="text-slate-400" />
              )}
            </div>
            <p className="text-slate-500 font-medium">
              {activeTab === "archived"
                ? "No archived rooms"
                : "Recycle bin is empty"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentRooms.map((room) => (
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
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(room.id)}
                    disabled={restoring === room.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <PiArrowCounterClockwiseDuotone size={18} />
                    {restoring === room.id ? "Restoring..." : "Restore"}
                  </button>
                  {activeTab === "deleted" && (
                    <button
                      onClick={() => {
                        setSelectedRoom(room);
                        setShowDeleteModal(true);
                      }}
                      className="px-4 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 active:scale-95 transition-all"
                    >
                      <PiTrashDuotone size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDeleteModal && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PiWarningDuotone size={24} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Permanently Delete?
                </h3>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <PiXBold size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-slate-900">
                "{selectedRoom.name}"
              </span>
              ?
            </p>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-red-800 font-semibold leading-relaxed">
                ⚠️ This action cannot be undone. All quizzes, submissions, and
                data will be permanently deleted.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePermanentDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
