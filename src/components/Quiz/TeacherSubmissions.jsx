import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  GetSubmissions,
  GetViolations,
  ReleaseScore,
  BulkReleaseScores,
} from "../../api/attempt";
import Loader from "../loader";
import toast from "react-hot-toast";
import { usePolling, useDebounce } from "../../hooks/useOptimizedFetch";
import {
  PiWarningDuotone,
  PiCheckCircleDuotone,
  PiEyeDuotone,
  PiXBold,
  PiClockDuotone,
  PiUserDuotone,
  PiChartBarDuotone,
  PiArrowLeftDuotone,
  PiMagnifyingGlassDuotone,
  PiCircleDuotone,
} from "react-icons/pi";

export default function TeacherSubmissions() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [violations, setViolations] = useState([]);
  const [showViolations, setShowViolations] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const mountedRef = useRef(true);

  // Debounce search query to prevent excessive filtering
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Optimized polling for submissions (5 seconds, pauses when tab not visible)
  const fetchSubmissionsData = useCallback(async () => {
    const response = await GetSubmissions(quizId);
    return response.data || [];
  }, [quizId]);

  const { data: submissions = [], loading } = usePolling(
    fetchSubmissionsData,
    5000,
    [quizId],
  );

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleViewViolations = useCallback(async (submission) => {
    if (!mountedRef.current) return;

    try {
      setSelectedSubmission(submission);
      const response = await GetViolations(submission.id);
      if (mountedRef.current) {
        setViolations(response.data || []);
        setShowViolations(true);
      }
    } catch (err) {
      if (mountedRef.current) {
        toast.error("Failed to load violations");
      }
    }
  }, []);

  const handleReleaseScore = useCallback(async (attemptId) => {
    if (!mountedRef.current) return;

    try {
      await ReleaseScore(attemptId);
      toast.success("Score released");
    } catch (err) {
      if (mountedRef.current) {
        toast.error("Failed to release score");
      }
    }
  }, []);

  const handleBulkRelease = useCallback(async () => {
    if (!confirm("Release scores for all submitted students?")) return;
    if (!mountedRef.current) return;

    try {
      await BulkReleaseScores(quizId);
      toast.success("All scores released");
    } catch (err) {
      if (mountedRef.current) {
        toast.error("Failed to release scores");
      }
    }
  }, [quizId]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Not submitted";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getScoreColor = useCallback((score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "text-emerald-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-amber-600";
    return "text-red-600";
  }, []);

  // Memoized filtered submissions to prevent unnecessary recalculations
  const filteredSubmissions = useMemo(() => {
    return submissions?.filter((sub) => {
      const matchesSearch = sub.users?.full_name
        ?.toLowerCase()
        .includes(debouncedSearch.toLowerCase());
      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "submitted" && sub.status === "submitted") ||
        (filterStatus === "pending" && sub.status !== "submitted") ||
        (filterStatus === "released" && sub.score_released) ||
        (filterStatus === "unreleased" &&
          !sub.score_released &&
          sub.status === "submitted");
      return matchesSearch && matchesFilter;
    });
  }, [submissions, debouncedSearch, filterStatus]);

  // Memoized stats calculations
  const stats = useMemo(() => {
    const submittedCount = submissions?.filter(
      (s) => s.status === "submitted",
    ).length;
    const releasedCount = submissions?.filter((s) => s.score_released).length;
    const avgScore =
      submittedCount > 0
        ? Math.round(
            submissions
              ?.filter((s) => s.status === "submitted")
              ?.reduce((sum, s) => sum + (s.final_score || 0), 0) /
              submittedCount,
          )
        : 0;

    return { submittedCount, releasedCount, avgScore };
  }, [submissions]);

  const { submittedCount, releasedCount, avgScore } = stats;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 text-sm font-medium transition-colors"
          >
            <PiArrowLeftDuotone size={20} />
            Back to Quiz
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Quiz Submissions
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {submittedCount} of {submissions.length} submitted
              </p>
            </div>
            <button
              onClick={handleBulkRelease}
              disabled={submittedCount === 0}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              <PiEyeDuotone size={20} />
              Release All Scores
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <PiUserDuotone size={20} className="text-blue-600" />
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Total
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">
              {submissions.length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <PiCheckCircleDuotone size={20} className="text-emerald-600" />
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Submitted
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
              {submittedCount}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <PiChartBarDuotone size={20} className="text-amber-600" />
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Avg Score
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600">
              {avgScore}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <PiEyeDuotone size={20} className="text-purple-600" />
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Released
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-purple-600">
              {releasedCount}
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <PiMagnifyingGlassDuotone
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {["all", "submitted", "pending", "released", "unreleased"].map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterStatus(filter)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                      filterStatus === filter
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-3">
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <PiUserDuotone size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No submissions found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            filteredSubmissions.map((submission) => {
              const hasPenalty = (submission.violation_count || 0) > 3;
              const isSubmitted = submission.status === "submitted";

              return (
                <div
                  key={submission.id || submission.student_id}
                  className={`bg-white rounded-xl border transition-all hover:shadow-md ${
                    hasPenalty
                      ? "border-red-300 bg-red-50/30"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Student Info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {submission.users?.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                            {submission.users?.full_name}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 truncate">
                            {submission.users?.email}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                isSubmitted
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {isSubmitted ? "Submitted" : "Not Started"}
                            </span>
                            {isSubmitted && (
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <PiClockDuotone size={14} />
                                {formatDate(submission.submitted_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Scores & Actions */}
                      {isSubmitted ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
                          {/* Score Display */}
                          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                            <div className="text-center">
                              <p className="text-xs text-slate-500 font-medium mb-1">
                                Base
                              </p>
                              <p className="text-lg font-bold text-slate-900">
                                {submission.base_score || 0}
                              </p>
                            </div>

                            {hasPenalty && (
                              <>
                                <div className="w-px h-8 bg-slate-200" />
                                <div className="text-center">
                                  <p className="text-xs text-slate-500 font-medium mb-1">
                                    Penalty
                                  </p>
                                  <p className="text-lg font-bold text-red-600">
                                    -{submission.penalty_score || 0}
                                  </p>
                                </div>
                              </>
                            )}

                            <div className="w-px h-8 bg-slate-200" />
                            <div className="text-center">
                              <p className="text-xs text-slate-500 font-medium mb-1">
                                Final
                              </p>
                              <p
                                className={`text-xl font-bold ${getScoreColor(
                                  submission.final_score || 0,
                                  submission.max_score || 100,
                                )}`}
                              >
                                {submission.final_score || 0}
                              </p>
                            </div>
                          </div>

                          {/* Violations Button */}
                          {(submission.violation_count || 0) > 0 && (
                            <button
                              onClick={() => handleViewViolations(submission)}
                              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${
                                hasPenalty
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                              }`}
                            >
                              <PiWarningDuotone size={18} />
                              <span>
                                {submission.violation_count} Violation
                                {submission.violation_count !== 1 ? "s" : ""}
                              </span>
                            </button>
                          )}

                          {/* Release Button */}
                          <button
                            onClick={() => handleReleaseScore(submission.id)}
                            disabled={submission.score_released}
                            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${
                              submission.score_released
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95"
                            }`}
                          >
                            {submission.score_released ? (
                              <>
                                <PiCheckCircleDuotone size={18} />
                                Released
                              </>
                            ) : (
                              <>
                                <PiEyeDuotone size={18} />
                                Release Score
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-4 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-500 font-medium">
                            Waiting for submission
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Violations Modal */}
      {showViolations && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <PiWarningDuotone size={24} className="text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Focus Violations
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {selectedSubmission.users?.full_name} •{" "}
                      {violations.length} event
                      {violations.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViolations(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <PiXBold size={20} className="text-slate-400" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
              {violations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">No violations recorded</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {violations.map((violation, index) => {
                    const isViolation =
                      violation.event_type === "blur" ||
                      violation.event_type === "hidden";
                    return (
                      <div
                        key={violation.id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          isViolation
                            ? "bg-red-50 border-red-200"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {index + 1}
                          </span>
                          <div>
                            <p
                              className={`font-semibold capitalize ${isViolation ? "text-red-700" : "text-slate-700"}`}
                            >
                              {violation.event_type}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {formatDate(violation.timestamp)}
                            </p>
                          </div>
                        </div>
                        {isViolation && (
                          <PiWarningDuotone
                            size={24}
                            className="text-red-500 flex-shrink-0"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
