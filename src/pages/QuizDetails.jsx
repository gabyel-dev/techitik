import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { GetQuizDetails } from "../api/quiz";
import { GetRoomDetails } from "../api/rooms";
import { useAuth } from "../context/authContext";
import { formatDateTime } from "../utils/dateFormatter";
import {
  PiClockDuotone,
  PiLockDuotone,
  PiLockOpenDuotone,
  PiPencilSimpleDuotone,
  PiTrophyDuotone,
  PiClipboardDuotone,
} from "react-icons/pi";
import { LoaderSpinner } from "../components/loader";

export default function QuizDetails() {
  const { roomId, quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizRes, roomRes] = await Promise.all([
          GetQuizDetails(quizId),
          GetRoomDetails(roomId),
        ]);
        setQuiz(quizRes.data);
        setRoom(roomRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId, roomId]);

  const isTeacher = user?.role === "teacher";

  if (loading || !quiz || !user) return <LoaderSpinner />;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="flex mb-4">
          <Link
            to={`/dashboard/${user.role === "teacher" ? "t" : "s"}/${user.id}`}
            className="flex items-center gap-2"
          >
            <span className="text-[var(--primary)] text-xl">/</span>
            <p className="text-sm hover:underline">dashboard</p>
            <span className="text-[var(--primary)] text-xl">/</span>
          </Link>
          <Link
            to={`/dashboard/${user.role === "teacher" ? "t" : "s"}/${user.id}/room/${roomId}`}
            className="flex items-center gap-2"
          >
            <p className="text-sm hover:underline text-[var(--primary)]">
              &nbsp;&nbsp;{room?.room_code}
            </p>
            <span className="text-[var(--primary)] text-xl">/</span>
          </Link>
          <p className="flex items-center text-slate-600 text-sm">
            &nbsp;&nbsp;quiz details
          </p>
        </div>

        {/* Header */}
        <div className="py-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex w-full items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                    {quiz.title}
                  </h1>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatDateTime(quiz.created_at)}
                    </p>
                  </div>
                  {quiz.description && (
                    <p className="text-slate-600 text-sm mb-3">
                      {quiz.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      quiz.is_published
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {quiz.is_published ? "Published" : "Draft"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      quiz.is_open
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {quiz.is_open ? (
                      <PiLockOpenDuotone size={14} />
                    ) : (
                      <PiLockDuotone size={14} />
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ">
            <div className="flex items-center gap-3"></div>
            {quiz.due_date && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <PiClockDuotone size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Due Date</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDateTime(quiz.due_date)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isTeacher && (
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() =>
                navigate(
                  `/dashboard/t/${user.id}/room/${roomId}/quiz/${quizId}`,
                )
              }
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-all"
            >
              <PiPencilSimpleDuotone size={20} />
              Edit Quiz
            </button>
            <button
              onClick={() =>
                navigate(
                  `/dashboard/t/${user.id}/room/${roomId}/quiz/${quizId}/submissions`,
                )
              }
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-all"
            >
              <PiClipboardDuotone size={20} />
              View Submissions
            </button>
            <button
              onClick={() =>
                navigate(
                  `/dashboard/t/${user.id}/room/${roomId}/quiz/${quizId}/rankings`,
                )
              }
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-all"
            >
              <PiTrophyDuotone size={20} />
              View Rankings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
