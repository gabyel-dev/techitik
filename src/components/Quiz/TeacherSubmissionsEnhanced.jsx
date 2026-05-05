import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  GetSubmissions,
  GetViolations,
  ReleaseScore,
  BulkReleaseScores,
  GetStudentResponses,
  OverrideScore,
} from "../../api/attempt";
import toast from "react-hot-toast";
import {
  PiWarningDuotone,
  PiCheckCircleDuotone,
  PiEyeDuotone,
  PiXBold,
  PiChartBarDuotone,
  PiNoteDuotone,
  PiArrowLeft,
} from "react-icons/pi";
import { useAuth } from "../../context/authContext";
import { useRoom } from "../../context/roomContext";
import { formatDateTimeShort } from "../../utils/dateFormatter";
import { LoaderSpinner } from "../loader";

export default function TeacherSubmissions() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const { room } = useRoom();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [violations, setViolations] = useState([]);
  const [studentResponses, setStudentResponses] = useState([]);
  const [showViolations, setShowViolations] = useState(false);
  const [showResponses, setShowResponses] = useState(false);
  const [editingScore, setEditingScore] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all, submitted, not_started, in_progress

  useEffect(() => {
    setLoading(true);
    try {
      fetchSubmissions();
    } finally {
      setLoading(false);
    }
    const interval = setInterval(fetchSubmissions, 5000);
    return () => clearInterval(interval);
  }, [quizId]);

  const fetchSubmissions = async () => {
    try {
      const response = await GetSubmissions(quizId);
      setSubmissions(response.data || []);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
  };

  const handleViewViolations = async (submission) => {
    try {
      setSelectedSubmission(submission);
      const response = await GetViolations(submission.id);
      setViolations(response.data || []);
      setShowViolations(true);
    } catch (err) {
      toast.error("Failed to load violations");
    }
  };

  const handleViewResponses = async (submission) => {
    if (submission.status === "not_started" || !submission.id) {
      toast.error("Student hasn't started the quiz yet");
      return;
    }

    try {
      setSelectedSubmission(submission);
      const response = await GetStudentResponses(submission.id);
      setStudentResponses(response.data || []);
      setShowResponses(true);
    } catch (err) {
      toast.error("Failed to load student responses");
    }
  };

  const handleScoreOverride = async (responseId, newPoints) => {
    try {
      await OverrideScore(responseId, newPoints);
      toast.success("Score updated");
      setEditingScore(null);

      // Refresh responses and submissions
      const response = await GetStudentResponses(selectedSubmission.id);
      setStudentResponses(response.data || []);
      fetchSubmissions();
    } catch (err) {
      toast.error("Failed to update score");
    }
  };

  const handleReleaseScore = async (attemptId) => {
    if (!attemptId) {
      toast.error("No submission to release");
      return;
    }

    try {
      await ReleaseScore(attemptId);
      toast.success("Score released");
      fetchSubmissions();
    } catch (err) {
      toast.error("Failed to release score");
    }
  };

  const handleBulkRelease = async () => {
    const submittedCount = submissions.filter(
      (s) => s.status === "submitted",
    ).length;
    if (submittedCount === 0) {
      toast.error("No submitted quizzes to release");
      return;
    }

    try {
      await BulkReleaseScores(quizId);
      toast.success("All scores released");
      fetchSubmissions();
    } catch (err) {
      toast.error("Failed to release scores");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      submitted: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        label: "Submitted",
      },
      in_progress: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        label: "In Progress",
      },
      not_started: {
        bg: "bg-slate-100",
        text: "text-slate-600",
        label: "Not Started",
      },
      paused: { bg: "bg-amber-100", text: "text-amber-700", label: "Paused" },
    };
    return badges[status] || badges.not_started;
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (filterStatus === "all") return true;
    return sub.status === filterStatus;
  });

  const stats = {
    total: submissions.length,
    submitted: submissions.filter((s) => s.status === "submitted").length,
    in_progress: submissions.filter((s) => s.status === "in_progress").length,
    not_started: submissions.filter((s) => s.status === "not_started").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex w-fit pb-5">
          <Link
            to={`/dashboard/t/${user?.id}/room/${room?.id}/quiz/${quizId}/details`}
            replace={true}
            className="flex items-center gap-2 "
          >
            <PiArrowLeft color="black" />
          </Link>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Quiz Submissions
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="text-slate-500">
                Total:{" "}
                <span className="font-semibold text-slate-900">
                  {stats.total}
                </span>
              </span>
              <span className="text-emerald-600">
                Submitted:{" "}
                <span className="font-semibold">{stats.submitted}</span>
              </span>
              <span className="text-blue-600">
                In Progress:{" "}
                <span className="font-semibold">{stats.in_progress}</span>
              </span>
              <span className="text-slate-600">
                Not Started:{" "}
                <span className="font-semibold">{stats.not_started}</span>
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/quiz/${quizId}/analytics`)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <PiChartBarDuotone size={20} />
              View Analytics
            </button>
            <button
              onClick={handleBulkRelease}
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
            >
              Release All Scores
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === "all"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus("submitted")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === "submitted"
                ? "bg-emerald-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Submitted ({stats.submitted})
          </button>
          <button
            onClick={() => setFilterStatus("in_progress")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === "in_progress"
                ? "bg-blue-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            In Progress ({stats.in_progress})
          </button>
          <button
            onClick={() => setFilterStatus("not_started")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === "not_started"
                ? "bg-slate-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Not Started ({stats.not_started})
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Base Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Violations
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Penalty
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Final Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Submitted
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 w-full">
                {loading ? (
                  <span className="w-full flex items-center justify-center">
                    {" "}
                    <LoaderSpinner />
                  </span>
                ) : (
                  filteredSubmissions.map((submission) => {
                    const hasPenalty = (submission.violation_count || 0) > 3;
                    const statusBadge = getStatusBadge(submission.status);
                    const isNotStarted = submission.status === "not_started";

                    return (
                      <tr
                        key={submission?.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          hasPenalty
                            ? "bg-red-50/30"
                            : isNotStarted
                              ? "bg-slate-50/50"
                              : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">
                              {submission.users?.full_name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {submission.users?.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">
                            {isNotStarted
                              ? "-"
                              : `${submission.base_score || 0}/${submission.max_score || 0}`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {isNotStarted ? (
                            <span className="text-slate-400">-</span>
                          ) : (
                            <button
                              onClick={() => handleViewViolations(submission)}
                              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                hasPenalty
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                              }`}
                            >
                              <PiWarningDuotone size={16} />
                              {submission.violation_count || 0}
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-semibold ${hasPenalty ? "text-red-600" : "text-slate-400"}`}
                          >
                            {isNotStarted
                              ? "-"
                              : `-${submission.penalty_score || 0}`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-lg text-slate-900">
                            {isNotStarted ? "-" : submission.final_score || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {formatDateTimeShort(submission.submitted_at)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {submission.status === "submitted" &&
                            submission.id ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleViewResponses(submission)
                                  }
                                  className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                >
                                  <PiNoteDuotone size={16} />
                                  View Answers
                                </button>
                                <button
                                  onClick={() =>
                                    handleReleaseScore(submission.id)
                                  }
                                  disabled={submission.score_released}
                                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                    submission.score_released
                                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                  }`}
                                >
                                  {submission.score_released ? (
                                    <>
                                      <PiCheckCircleDuotone size={16} />
                                      Released
                                    </>
                                  ) : (
                                    <>
                                      <PiEyeDuotone size={16} />
                                      Release
                                    </>
                                  )}
                                </button>
                              </>
                            ) : isNotStarted ? (
                              <span className="text-xs text-slate-400 italic">
                                No submission yet
                              </span>
                            ) : submission.status === "in_progress" ? (
                              <span className="text-xs text-blue-600 italic">
                                Quiz in progress...
                              </span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Responses Modal */}
        {showResponses && selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Student Responses
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {selectedSubmission.users?.full_name} - Score:{" "}
                      {selectedSubmission.final_score}/
                      {selectedSubmission.max_score}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowResponses(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <PiXBold size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-6">
                  {studentResponses.map((response, index) => {
                    const question = response.quiz_questions;
                    const isEditing = editingScore === response.id;

                    return (
                      <div
                        key={response.id}
                        className="bg-slate-50 rounded-xl p-5 border border-slate-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-1">
                              {index + 1}. {question.question_text}
                            </h3>
                            <p className="text-xs text-slate-500 uppercase">
                              {question.question_type}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max={question.points}
                                  defaultValue={response.points_earned || 0}
                                  className="w-16 px-2 py-1 border border-slate-300 rounded text-sm"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleScoreOverride(
                                        response.id,
                                        parseFloat(e.target.value),
                                      );
                                    } else if (e.key === "Escape") {
                                      setEditingScore(null);
                                    }
                                  }}
                                  autoFocus
                                />
                                <span className="text-sm text-slate-600">
                                  / {question.points}
                                </span>
                                <button
                                  onClick={() => setEditingScore(null)}
                                  className="text-slate-400 hover:text-slate-600"
                                >
                                  <PiXBold size={16} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingScore(response.id)}
                                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                                  response.is_correct
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                }`}
                              >
                                {response.points_earned || 0}/{question.points}
                              </button>
                            )}
                            {response.manually_graded && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                Manual
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Show correct answer */}
                        {question.question_type === "multiple_choice" && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-slate-600 mb-1">
                              Correct Answer:
                            </p>
                            <p className="text-sm text-emerald-700 font-medium">
                              {question.quiz_choices?.find((c) => c.is_correct)
                                ?.choice_text || "N/A"}
                            </p>
                          </div>
                        )}

                        {question.question_type === "checkboxes" && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-slate-600 mb-1">
                              Correct Answers:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {question.quiz_choices
                                ?.filter((c) => c.is_correct)
                                .map((choice) => (
                                  <span
                                    key={choice.id}
                                    className="text-sm bg-emerald-100 text-emerald-700 px-2 py-1 rounded"
                                  >
                                    {choice.choice_text}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}

                        {question.question_type === "short_answer" && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-slate-600 mb-1">
                              Expected Answer:
                            </p>
                            <p className="text-sm text-emerald-700 font-medium">
                              {question.quiz_choices?.[0]?.choice_text || "N/A"}
                            </p>
                          </div>
                        )}

                        {/* Show student answer */}
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-1">
                            Student Answer:
                          </p>
                          {response.answer_text ? (
                            <p className="text-sm text-slate-900 bg-white p-3 rounded border border-slate-200">
                              {response.answer_text}
                            </p>
                          ) : response.selected_choice_ids?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {response.selected_choice_ids.map((choiceId) => {
                                const choice = question.quiz_choices?.find(
                                  (c) => c.id === choiceId,
                                );
                                return choice ? (
                                  <span
                                    key={choiceId}
                                    className="text-sm bg-white border border-slate-200 px-3 py-1 rounded"
                                  >
                                    {choice.choice_text}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400 italic">
                              No answer provided
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Violations Modal */}
        {showViolations && selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Focus Violations
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {selectedSubmission.users?.full_name} -{" "}
                      {violations.length} event
                      {violations.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowViolations(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <PiXBold size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-2">
                  {violations.map((violation, index) => (
                    <div
                      key={violation.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        violation.event_type === "blur" ||
                        violation.event_type === "hidden"
                          ? "bg-red-50 border border-red-200"
                          : "bg-slate-50 border border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-slate-500">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-slate-900 capitalize">
                            {violation.event_type}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDateTimeShort(violation.timestamp)}
                          </p>
                        </div>
                      </div>
                      {(violation.event_type === "blur" ||
                        violation.event_type === "hidden") && (
                        <PiWarningDuotone size={20} className="text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
