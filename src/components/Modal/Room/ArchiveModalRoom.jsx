import { PiArchiveDuotone, PiXBold } from "react-icons/pi";

export default function ArchiveModalRoom({
  setShowRoomArchiveModal,
  room,
  handleArchiveRoom,
  loading,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <PiArchiveDuotone size={24} className="text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Archive Room?</h3>
          </div>
          <button
            onClick={() => setShowRoomArchiveModal(false)}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <PiXBold size={20} />
          </button>
        </div>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Are you sure you want to archive{" "}
          <span className="font-semibold text-slate-900">"{room?.name}"</span>? It
          will be hidden from the active rooms list.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowRoomArchiveModal(false)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
          >
            Cancel
          </button>
          <button
            onClick={handleArchiveRoom}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
          >
            {loading ? "Archiving..." : "Archive"}
          </button>
        </div>
      </div>
    </div>
  );
}
