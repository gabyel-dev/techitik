import { useState, useEffect } from "react";
import {
  GetArchivedQuizzes,
  UnarchiveQuiz,
  DeleteQuiz,
} from "../../../api/quiz";
import { Loader } from "../../../components/loader";
import toast from "react-hot-toast";
import { formatDate } from "../../../utils/dateFormatter";
import {
  PiArchiveDuotone,
  PiTrashDuotone,
  PiArrowCounterClockwiseDuotone,
  PiXBold,
  PiWarningDuotone,
  PiBookOpenDuotone,
} from "react-icons/pi";

export default function ArchivedQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchArchivedQuizzes();
  }, []);

  const fetchArchivedQuizzes = async () => {
    try {
      setLoading(true);
      const response = await GetArchivedQuizzes();
      setQuizzes(response.data || []);
    } catch (err) {
      toast.error("Failed to load archived quizzes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async () => {
    if (!selectedQuiz) return;

    try {
      setProcessing(true);
      await UnarchiveQuiz(selectedQuiz.id);
      toast.success("Quiz unarchived successfully");
      setShowUnarchiveModal(false);
      setSelectedQuiz(null);
      fetchArchivedQuizzes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to unarchive quiz");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedQuiz) return;

    try {
      setProcessing(true);
      await DeleteQuiz(selectedQuiz.id);
      toast.success("Quiz deleted permanently");
      setShowDeleteModal(false);
      setSelectedQuiz(null);
      fetchArchivedQuizzes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete quiz");
    } finally {
      setProcessing(false);
    }
  };

  // Group quizzes by room
  const groupedQuizzes = quizzes.reduce((acc, quiz) => {
    const roomName = quiz.rooms?.name || "Unknown Room";
    if (!acc[roomName]) {
      acc[roomName] = [];
    }
    acc[roomName].push(quiz);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-8 animate-slideIn">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <PiArchiveDuotone size={36} className="text-slate-600" />
            Archived Quizzes
          </h1>
          <p className="text-slate-500 mt-1">
            {quizzes.length} archived quiz{quizzes.length !== 1 ? "zes" : ""}
          </p>
        </div>

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <PiArchiveDuotone
              size={64}
              className="mx-auto text-slate-300 mb-4"
            />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Archived Quizzes
            </h3>
            <p className="text-slate-500">Archived quizzes will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedQuizzes).map(([roomName, roomQuizzes]) => (
              <div
                key={roomName}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <PiBookOpenDuotone size={20} className="text-blue-500" />
                    {roomName}
                    <span className="text-sm font-normal text-slate-500">
                      ({roomQuizzes.length} quiz
                      {roomQuizzes.length !== 1 ? "zes" : ""})
                    </span>
                  </h2>
                  {roomQuizzes[0]?.rooms?.subject && (
                    <p className="text-sm text-slate-500 mt-1">
                      {roomQuizzes[0].rooms.subject}
                    </p>
                  )}
                </div>

                <div className="divide-y divide-slate-100">
                  {roomQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="p-6 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {quiz.title}
                          </h3>
                          {quiz.description && (
                            <p className="text-sm text-slate-600 mt-1">
                              {quiz.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                            <span>Created: {formatDate(quiz.created_at)}</span>
                            <span>
                              Archived: {formatDate(quiz.archived_at)}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full ${
                                quiz.is_published
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {quiz.is_published ? "Published" : "Draft"}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedQuiz(quiz);
                              setShowUnarchiveModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            title="Unarchive quiz"
                          >
                            <PiArrowCounterClockwiseDuotone size={18} />
                            <span className="text-sm font-medium">
                              Unarchive
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedQuiz(quiz);
                              setShowDeleteModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            title="Delete permanently"
                          >
                            <PiTrashDuotone size={18} />
                            <span className="text-sm font-medium">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Unarchive Confirmation Modal */}
        {showUnarchiveModal && selectedQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <PiArrowCounterClockwiseDuotone
                      size={24}
                      className="text-blue-600"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Unarchive Quiz?
                  </h3>
                </div>
                <button
                  onClick={() => setShowUnarchiveModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <PiXBold size={20} />
                </button>
              </div>
              <p className="text-slate-600 mb-6">
                Are you sure you want to unarchive{" "}
                <span className="font-semibold">"{selectedQuiz.title}"</span>?
                It will be restored to the room and visible to students if
                published.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUnarchiveModal(false)}
                  disabled={processing}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnarchive}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {processing ? "Unarchiving..." : "Unarchive"}
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
                  <h3 className="text-xl font-bold text-slate-900">
                    Delete Quiz?
                  </h3>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <PiXBold size={20} />
                </button>
              </div>
              <p className="text-slate-600 mb-2">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold">"{selectedQuiz.title}"</span>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ This action cannot be undone. All questions, submissions,
                  and student data will be permanently deleted.
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
                  onClick={handleDelete}
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
    </div>
  );
}
