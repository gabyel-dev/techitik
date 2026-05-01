import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { GetRoomDetails } from "../api/rooms";
import { GetRoomQuizzes, CreateQuiz, ToggleQuizStatus, ArchiveQuiz, DeleteQuiz } from "../api/quiz";
import { useAuth } from "../context/authContext";
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
  PiPlusDuotone,
  PiFileTextDuotone,
  PiChartBarDuotone,
  PiLockDuotone,
  PiLockOpenDuotone,
  PiArchiveDuotone,
  PiTrashDuotone,
  PiXBold,
  PiWarningDuotone,
} from "react-icons/pi";
import toast from "react-hot-toast";

export default function RoomDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRoomDetails();
    fetchQuizzes();
    
    // Poll for updates every 3 seconds
    const interval = setInterval(() => {
      fetchRoomDetails();
      fetchQuizzes();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [roomId]);

  const fetchRoomDetails = async () => {
    try {
      const response = await GetRoomDetails(roomId);
      setRoom(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load room details");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await GetRoomQuizzes(roomId);
      setQuizzes(response.data || []);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCreateQuiz = async () => {
    try {
      setCreatingQuiz(true);
      const response = await CreateQuiz({
        roomId,
        title: "Untitled Quiz",
        description: "",
      });
      
      const quizId = response.data.id;
      const teacherId = user.id;
      
      // Navigate based on current path
      if (location.pathname.includes('/dashboard/t/')) {
        navigate(`/dashboard/t/${teacherId}/room/${roomId}/quiz/${quizId}`);
      } else {
        navigate(`quiz/${quizId}`);
      }
      
      toast.success("Quiz created successfully!");
      fetchQuizzes(); // Refresh quiz list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create quiz");
    } finally {
      setCreatingQuiz(false);
    }
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

  const handleToggleQuizStatus = async (quiz) => {
    try {
      const newStatus = !quiz.is_open;
      await ToggleQuizStatus(quiz.id, newStatus);
      toast.success(`Quiz ${newStatus ? 'opened' : 'closed'} successfully`);
      fetchQuizzes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update quiz status");
    }
  };

  const handleArchiveQuiz = async () => {
    if (!selectedQuiz) return;

    try {
      setProcessing(true);
      await ArchiveQuiz(selectedQuiz.id);
      toast.success("Quiz archived successfully");
      setShowArchiveModal(false);
      setSelectedQuiz(null);
      fetchQuizzes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to archive quiz");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!selectedQuiz) return;

    try {
      setProcessing(true);
      await DeleteQuiz(selectedQuiz.id);
      toast.success("Quiz deleted successfully");
      setShowDeleteModal(false);
      setSelectedQuiz(null);
      fetchQuizzes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete quiz");
    } finally {
      setProcessing(false);
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
      {/* Header Card */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm mb-6 animate-fadeIn">
        <div className="flex items-start justify-between mb-6">
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
                <PiClipboardTextDuotone size={18} className="text-emerald-500" />
                <span>{room?.section}</span>
              </div>
              <div className="flex items-center gap-2">
                <PiCalendarDuotone size={18} className="text-amber-500" />
                <span>Created: {formatDate(room?.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 w-full justify-end">
          <div className="bg-slate-100 px-4 py-2 rounded-lg">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Room Code</p>
            <p className="text-xl font-bold text-[var(--primary)] uppercase">{room?.room_code}</p>
          </div>
          {room?.members?.find(m => m.user?.id === user?.id)?.role === 'teacher' && (
            <>
              <button
                onClick={() => navigate(`/dashboard/t/${user.id}/room/${roomId}/analytics`)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
                title="View room analytics"
              >
                <PiChartBarDuotone size={20} />
                <span className="text-sm font-medium">Analytics</span>
              </button>
              <button
                onClick={handleCreateQuiz}
                disabled={creatingQuiz}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Create quiz for students"
              >
                <PiPlusDuotone size={20} />
                <span className="text-sm font-medium">{creatingQuiz ? "Creating..." : "Create Quiz"}</span>
              </button>
            </>
          )}
          <button
            onClick={handleShareInvite}
            className="flex items-center px-5 bg-[var(--primary)] text-white rounded-full hover:bg-emerald-600 transition-colors"
            title="Share invitation link"
          >
            <PiShareNetworkDuotone size={20} />
          </button>
        </div>
      </div>

      {/* Main Content - Quizzes (Middle) and Members (Right) */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Quizzes Section - Middle */}
        <div className="flex-1">
          <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden animate-fadeIn" style={{ animationDelay: "0.1s" }}>
            <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <PiFileTextDuotone size={24} className="text-blue-500" />
                  Quizzes
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} available</p>
              </div>
            </div>

            <div className="p-6">
              {quizzes.length === 0 ? (
                <div className="text-center py-12">
                  <PiFileTextDuotone size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 text-sm">No quizzes yet. Create your first quiz!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quizzes.map((quiz, index) => (
                    <div
                      key={quiz.id}
                      className="group p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all animate-slideInUp"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{quiz.title}</h3>
                            {user.role === 'teacher' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleQuizStatus(quiz);
                                }}
                                className={`p-1 rounded transition-colors ${
                                  quiz.is_open
                                    ? 'text-emerald-600 hover:bg-emerald-100'
                                    : 'text-slate-400 hover:bg-slate-100'
                                }`}
                                title={quiz.is_open ? 'Quiz is open' : 'Quiz is closed'}
                              >
                                {quiz.is_open ? <PiLockOpenDuotone size={18} /> : <PiLockDuotone size={18} />}
                              </button>
                            )}
                          </div>
                          {quiz.description && (
                            <p className="text-sm text-slate-500 mt-1">{quiz.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            <span>Created: {formatDate(quiz.created_at)}</span>
                            {quiz.due_date && <span>Due: {formatDate(quiz.due_date)}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              quiz.is_published
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}>
                              {quiz.is_published ? "Published" : "Draft"}
                            </span>
                            {user.role === 'teacher' && (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                quiz.is_open
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}>
                                {quiz.is_open ? "Open" : "Closed"}
                              </span>
                            )}
                          </div>
                          {user.role === 'teacher' ? (
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/dashboard/t/${user.id}/room/${roomId}/quiz/${quiz.id}`);
                                }}
                                className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/dashboard/t/${user.id}/room/${roomId}/quiz/${quiz.id}/submissions`);
                                }}
                                className="px-3 py-1 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                              >
                                Submissions
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedQuiz(quiz);
                                  setShowArchiveModal(true);
                                }}
                                className="px-3 py-1 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                title="Archive quiz"
                              >
                                <PiArchiveDuotone size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedQuiz(quiz);
                                  setShowDeleteModal(true);
                                }}
                                className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                title="Delete quiz"
                              >
                                <PiTrashDuotone size={14} />
                              </button>
                            </div>
                          ) : quiz.is_published && quiz.is_open ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/s/${user.id}/room/${roomId}/quiz/${quiz.id}/take`);
                              }}
                              className="px-3 py-1 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                              Take Quiz
                            </button>
                          ) : quiz.is_published && !quiz.is_open ? (
                            <span className="px-3 py-1 text-xs bg-slate-100 text-slate-500 rounded-lg">
                              Closed
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Members Section - Right */}
        <div className="lg:w-96">
          <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden animate-fadeIn" style={{ animationDelay: "0.15s" }}>
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <PiUsersDuotone size={24} className="text-[var(--primary)]" />
                Members
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{room?.members?.length || 0} total members</p>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {room?.members?.map((member, index) => (
                <div
                  key={member.id}
                  className="px-6 py-4 hover:bg-slate-50 transition-colors animate-slideInUp"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {member.user?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                        <span className="truncate">{member.user?.full_name}</span>
                        {member.role === "teacher" && (
                          <PiCrownDuotone size={14} className="text-amber-500 flex-shrink-0" />
                        )}
                      </p>
                      <p className="text-xs truncate text-slate-500">{member.user?.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                      member.role === "teacher"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Archive Confirmation Modal */}
      {showArchiveModal && selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <PiArchiveDuotone size={24} className="text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Archive Quiz?</h3>
              </div>
              <button
                onClick={() => setShowArchiveModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <PiXBold size={20} />
              </button>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to archive <span className="font-semibold">"{selectedQuiz.title}"</span>? 
              It will be hidden from students and moved to the archived quizzes page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowArchiveModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveQuiz}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                {processing ? "Archiving..." : "Archive"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <PiWarningDuotone size={24} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Delete Quiz?</h3>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <PiXBold size={20} />
              </button>
            </div>
            <p className="text-slate-600 mb-2">
              Are you sure you want to permanently delete <span className="font-semibold">"{selectedQuiz.title}"</span>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ This action cannot be undone. All questions, submissions, and student data will be permanently deleted.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteQuiz}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {processing ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
