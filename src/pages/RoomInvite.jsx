import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { JoinRoomByInvite } from "../api/rooms";
import { useAuth } from "../context/authContext";
import { PiCheckCircleDuotone, PiWarningDuotone } from "react-icons/pi";
import { LoaderSpinner } from "../components/loader";

export default function RoomInvite() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState("processing"); // processing, success, error, already_member
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Redirect to login with return URL
      navigate("/", {
        replace: true,
        state: { returnUrl: `/invite/${roomCode}` },
      });
      return;
    }

    handleInvite();
  }, [authLoading, user, roomCode]);

  const handleInvite = async () => {
    try {
      setStatus("processing");
      const response = await JoinRoomByInvite(roomCode);

      if (response.success) {
        if (response.data.alreadyMember) {
          setStatus("already_member");
          setMessage("You're already a member of this room!");
        } else {
          setStatus("success");
          setMessage("Successfully joined the room!");
          window.dispatchEvent(new Event("roomUpdated"));
        }

        // Redirect to room after 2 seconds
        setTimeout(() => {
          const dashboardPath =
            user.role === "teacher"
              ? `/dashboard/t/${user.id}/room/${response.data.roomId}`
              : `/dashboard/s/${user.id}/room/${response.data.roomId}`;
          navigate(dashboardPath, { replace: true });
        }, 2000);
      }
    } catch (err) {
      setStatus("error");
      setMessage(
        err.response?.data?.message ||
          "Failed to join room. Invalid or expired invitation.",
      );
    }
  };

  if (authLoading || status === "processing") {
    return (
      <div className="flex h-screen items-center justify-center bg-emerald-50">
        <div className="text-center">
          <LoaderSpinner />
          <p className="mt-4 text-slate-600">Processing invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-emerald-50">
      <div className="max-w-md w-full mx-4">
        <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-lg text-center animate-fadeIn">
          {status === "success" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <PiCheckCircleDuotone
                    size={40}
                    className="text-emerald-600"
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Welcome Aboard!
              </h2>
              <p className="text-slate-600 mb-4">{message}</p>
              <p className="text-sm text-slate-500">
                Redirecting you to the room...
              </p>
            </>
          )}

          {status === "already_member" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <PiCheckCircleDuotone size={40} className="text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Already Joined!
              </h2>
              <p className="text-slate-600 mb-4">{message}</p>
              <p className="text-sm text-slate-500">
                Taking you to the room...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <PiWarningDuotone size={40} className="text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Oops!</h2>
              <p className="text-slate-600 mb-6">{message}</p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Go to Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
