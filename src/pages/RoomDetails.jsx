import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GetRoomDetails } from "../api/rooms";
import Loader from "../components/loader";
import {
  PiUsersDuotone,
  PiBookOpenDuotone,
  PiClipboardTextDuotone,
  PiCalendarDuotone,
  PiArrowLeftDuotone,
  PiCrownDuotone,
  PiShareNetworkDuotone,
  PiCheckDuotone,
} from "react-icons/pi";
import toast from "react-hot-toast";

export default function RoomDetails() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const response = await GetRoomDetails(roomId);
      setRoom(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load room details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleShareInvite = async () => {
    const inviteUrl = `${window.location.origin}/invite/${room?.room_code}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Join ${room?.name}`,
          text: `You've been invited to join ${room?.name}!`,
          url: inviteUrl,
        });
      } else {
        await navigator.clipboard.writeText(inviteUrl);
        toast.success("Invite copied!");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-8 animate-slideIn flex-1 min-w-0">
      <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm mb-6 animate-fadeIn flex-1 min-w-0">
        <div className="flex items-start justify-between mb-6 flex-1 min-w-10">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl truncate font-bold text-slate-900 mb-2">
              {room?.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <PiBookOpenDuotone size={18} className="text-blue-500" />
                <span>{room?.subject}</span>
              </div>
              <div className="flex items-center gap-2">
                <PiClipboardTextDuotone
                  size={18}
                  className="text-emerald-500"
                />
                <span> {room?.section}</span>
              </div>
              <div className="flex items-center gap-2">
                <PiCalendarDuotone size={18} className="text-amber-500" />
                <span>Created: {formatDate(room?.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 w-full justify-end right-0">
          <div className="bg-slate-100 px-4 py-2 rounded-lg">
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              Room Code
            </p>
            <p className="text-xl font-bold text-[var(--primary)] uppercase">
              {room?.room_code}
            </p>
          </div>
          <button
            onClick={handleShareInvite}
            className="flex items-center  px-5  bg-[var(--primary)] text-white rounded-full hover:bg-emerald-600 transition-colors"
            title="Share invitation link"
          >
            <PiShareNetworkDuotone size={20} />
          </button>
        </div>
      </div>

      <div
        className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden animate-fadeIn"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <PiUsersDuotone size={24} className="text-[var(--primary)]" />
              Students
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {room?.members?.length || 0} total members
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {room?.members?.map((member, index) => (
            <div
              key={member.id}
              className="px-6 py-4 hover:bg-slate-50 transition-colors animate-slideInUp"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {member.user?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 flex items-center gap-2">
                      {member.user?.full_name}
                      {member.role === "teacher" && (
                        <PiCrownDuotone size={16} className="text-amber-500" />
                      )}
                    </p>
                    <p className="text-xs truncate text-slate-500">
                      {member.user?.email}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      member.role === "teacher"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {member.role}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    Joined: {formatDate(member.joined_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
