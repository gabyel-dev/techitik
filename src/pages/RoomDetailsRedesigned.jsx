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
  PiCrownDuotone,
  PiShareNetworkDuotone,
  PiPlusDuotone,
  PiFileTextDuotone,
  PiChartBarDuotone,
  PiLockDuotone,
  PiLockOpenDuotone,
  PiArchiveDuotone,
  PiTrashDuotone,
  PiXBold,
  PiWarningDuotone,
  PiCheckCircleDuotone,
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
      
      if (location.pathname.includes('/dashboard/t/')) {
        navigate(`/dashboard/t/${teacherId}/room/${roomId}/quiz/${quizId}`);
      } else {
        navigate(`quiz/${quizId}`);
      }
      
      toast.success("Quiz created successfully!");
      fetchQuizzes();
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
      <div className="flex h-full items-center justify-center p-4 sm:p-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isTeacher = room?.members?.find(m => m.user?.id === user?.id)?.role === 'teacher';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Title & Metadata */}
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 break-words">
              {room?.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 text-slate-600">
                <PiBookOpenDuotone size={16} className="text-blue-500 flex-shrink-0" />
                <span className="font-medium">{room?.subject}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <PiClipboardTextDuotone size={16} className="text-emerald-500 flex-shrink-0" />
                <span>{room?.section}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <PiCalendarDuotone size={16} className="text-amber-500 flex-shrink-0" />
                <span className="text-xs">{formatDate(room?.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Room Code */}
            <div className="flex-shrink-0 bg-slate-100 px-4 py-2.5 rounded-lg">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Room Code</p>
              <p className="text-lg sm:text-xl font-bold text-emerald-600 uppercase tracking-wide">{room?.room_code}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              {isTeacher && (
                <>
                  <button
                    onClick={() => navigate(`/dashboard/t/${user.id}/room/${roomId}/analytics`)}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium flex-1 sm:flex-initial min-w-0"
                  >
                    <PiChartBarDuotone size={18} className="flex-shrink-0" />
                    <span className="hidden sm:inline">Analytics</span>
                  </button>
                  <button
                    onClick={handleCreateQuiz}
                    disabled={creatingQuiz}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm font-medium flex-1 sm:flex-initial min-w-0"
                  >
                    <PiPlusDuotone size={18} className="flex-shrink-0" />
                    <span>{creatingQuiz ? "Creating..." : "New Quiz"}</span>
                  </button>
                </>
              )}
              <button
                onClick={handleShareInvite}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                title="Share invitation"
              >
                <PiShareNetworkDuotone size={18} />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quizzes Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <PiFileTextDuotone size={24} className="text-blue-500" />
                  Quizzes
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''}</p>
              </div>
            </div>

            {quizzes.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
                <PiFileTextDuotone size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm">No quizzes yet</p>
                {isTeacher && (
                  <p className="text-xs text-slate-400 mt-1">Create your first quiz to get started</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="group bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-4"
                  >
                    {/* Quiz Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {quiz.title}
                          </h3>
                          {isTeacher && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleQuizStatus(quiz);
                              }}
                              className={`p-1 rounded transition-colors flex-shrink-0 ${
                                quiz.is_open
                                  ? 'text-emerald-600 hover:bg-emerald-50'
                                  : 'text-slate-400 hover:bg-slate-100'
                              }`}
                              title={quiz.is_open ? 'Quiz is open' : 'Quiz is closed'}
                            >
                              {quiz.is_open ? <PiLockOpenDuotone size={16} /> : <PiLockDuotone size={16} />}
                            </button>
                          )}
                        </div>
                        {quiz.description && (
                          <p className="text-xs text-slate-600 line-clamp-2">{quiz.description}</p>
                        )}
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                          quiz.is_published
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {quiz.is_published ? "Published" : "Draft"}
                        </span>
                        {isTeacher && (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                            quiz.is_open
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {quiz.is_open ? "Open" : "Closed"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quiz Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span>Created {formatDate(quiz.created_at)}</span>
                        {quiz.due_date && <span>Due {formatDate(quiz.due_date)}</span>}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        {isTeacher ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/t/${user.id}/room/${roomId}/quiz/${quiz.id}`);
                              }}
                              className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/t/${user.id}/room/${roomId}/quiz/${quiz.id}/submissions`);
                              }}
                              className="px-3 py-1.5 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                            >
                              Submissions
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedQuiz(quiz);
                                setShowArchiveModal(true);
                              }}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Archive"
                            >
                              <PiArchiveDuotone size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedQuiz(quiz);
                                setShowDeleteModal(true);
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <PiTrashDuotone size={16} />
                            </button>
                          </>
                        ) : quiz.is_published && quiz.is_open ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/s/${user.id}/room/${roomId}/quiz/${quiz.id}/take`);
                            }}
                            className="px-4 py-1.5 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                          >
                            Take Quiz
                          </button>
                        ) : quiz.is_published && !quiz.is_open ? (
                          <span className="px-3 py-1.5 text-xs bg-slate-100 text-slate-500 rounded-lg font-medium">
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

          {/* Members Section - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-24">
              <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <PiUsersDuotone size={24} className="text-emerald-500" />
                  Members
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{room?.members?.length || 0} member{room?.members?.length !== 1 ? 's' : ''}</p>
              </div>

              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {room?.members?.map((member) => (
                  <div
                    key={member.id}
                    className="px-4 sm:px-6 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm">
                        {member.user?.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 text-sm truncate">
                            {member.user?.full_name}
                          </p>
                          {member.role === "teacher" && (
                            <PiCrownDuotone size={14} className="text-amber-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{member.user?.email}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide flex-shrink-0 ${
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
      </div>

      {/* Archive Modal */}
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
            <p className="text-sm text-slate-600 mb-6">
              Archive <span className="font-semibold">"{selectedQuiz.title}"</span>? It will be hidden from students.
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

      {/* Delete Modal */}
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
            <p className="text-sm text-slate-600 mb-2">
              Permanently delete <span className="font-semibold">"{selectedQuiz.title}"</span>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-red-800 font-medium">
                ⚠️ This cannot be undone. All data will be permanently deleted.
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
                {processing ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
