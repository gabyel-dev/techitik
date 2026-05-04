import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GetQuizRankings } from "../api/quiz";
import { GetQuizDetails } from "../api/quiz";
import { useAuth } from "../context/authContext";
import { Loader } from "../components/loader";
import { formatDateTimeShort } from "../utils/dateFormatter";
import {
  PiTrophyDuotone,
  PiMedalDuotone,
  PiArrowLeftDuotone,
  PiWarningDuotone,
  PiCheckCircleDuotone,
  PiClockDuotone,
  PiXCircleDuotone,
} from "react-icons/pi";

export default function QuizRankings() {
  const navigate = useNavigate();
  const { roomId, quizId } = useParams();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuizDetails();
    fetchRankings();

    const interval = setInterval(() => {
      fetchRankings();
    }, 5000);

    return () => clearInterval(interval);
  }, [quizId]);

  const fetchQuizDetails = async () => {
    try {
      const response = await GetQuizDetails(quizId);
      setQuiz(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load quiz details");
    }
  };

  const fetchRankings = async () => {
    try {
      const response = await GetQuizRankings(quizId);
      setRankings(response.data || []);
    } catch (err) {
      console.error("Failed to fetch rankings:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "from-amber-400 to-yellow-500";
    if (rank === 2) return "from-slate-300 to-slate-400";
    if (rank === 3) return "from-orange-400 to-amber-600";
    return "from-slate-200 to-slate-300";
  };

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "text-emerald-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-amber-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isTeacher = user?.role === "teacher";
  const currentUserRanking = rankings.find((r) => r.user_id === user?.id);
  const submittedCount = rankings.filter((r) => r.has_submitted).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 text-sm font-medium transition-colors"
          >
            <PiArrowLeftDuotone size={20} />
            Back to Room
          </button>

          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center flex-shrink-0">
                <PiTrophyDuotone size={28} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  {quiz?.title || "Quiz Rankings"}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                  <span className="font-medium">
                    {submittedCount} / {rankings.length} submitted
                  </span>
                  {quiz?.max_score && (
                    <>
                      <span>•</span>
                      <span className="font-medium">
                        Max Score: {quiz.max_score}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current User Rank Card - Only for Students */}
        {!isTeacher &&
          currentUserRanking &&
          currentUserRanking.has_submitted &&
          currentUserRanking.score_released && (
            <div className="bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl sm:rounded-2xl border border-emerald-300 shadow-lg mb-6 overflow-hidden">
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      {currentUserRanking.rank <= 3 ? (
                        <PiMedalDuotone size={32} className="text-white" />
                      ) : (
                        <span className="text-white text-2xl font-bold">
                          #{currentUserRanking.rank}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-white/80 text-xs font-medium mb-1">
                        Your Rank
                      </p>
                      <p className="text-white text-3xl font-bold">
                        #{currentUserRanking.rank}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-xs font-medium mb-1">
                      Your Score
                    </p>
                    <p className="text-white text-2xl font-bold">
                      {currentUserRanking.final_score}
                    </p>
                    <p className="text-white/70 text-xs mt-1">
                      out of {currentUserRanking.max_score}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Rankings List */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Leaderboard
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {submittedCount} student{submittedCount !== 1 ? "s" : ""}{" "}
              submitted
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {rankings.length === 0 ? (
              <div className="px-5 sm:px-6 py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <PiTrophyDuotone size={32} className="text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  No submissions yet
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Rankings will appear after students submit
                </p>
              </div>
            ) : (
              rankings.map((student) => {
                const isCurrentUser = student.user_id === user?.id;
                const showScore =
                  isTeacher || (student.score_released && isCurrentUser);

                return (
                  <div
                    key={student.user_id}
                    className={`px-5 sm:px-6 py-4 transition-colors ${
                      isCurrentUser
                        ? "bg-emerald-50 border-l-4 border-emerald-500"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Rank Badge */}
                      {student.has_submitted ? (
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${getRankColor(student.rank)} flex items-center justify-center text-white font-bold shadow-sm`}
                        >
                          {student.rank <= 3 ? (
                            <PiMedalDuotone size={24} />
                          ) : (
                            <span className="text-sm">#{student.rank}</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <PiClockDuotone
                            size={24}
                            className="text-slate-400"
                          />
                        </div>
                      )}

                      {/* Student Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className={`text-sm sm:text-base font-semibold truncate ${
                              isCurrentUser
                                ? "text-emerald-700"
                                : "text-slate-900"
                            }`}
                          >
                            {student.full_name}
                            {isCurrentUser && (
                              <span className="ml-1 text-xs">(You)</span>
                            )}
                          </p>
                          {student.has_submitted && (
                            <PiCheckCircleDuotone
                              size={18}
                              className="text-emerald-500 flex-shrink-0"
                            />
                          )}
                        </div>

                        {/* Score Info */}
                        {student.has_submitted ? (
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            {showScore ? (
                              <>
                                <span className="font-medium">
                                  Score:{" "}
                                  <span
                                    className={`${getScoreColor(student.final_score, student.max_score)} font-bold`}
                                  >
                                    {student.final_score}/{student.max_score}
                                  </span>
                                </span>
                                {student.violation_count > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <PiWarningDuotone
                                        size={14}
                                        className="text-amber-500"
                                      />
                                      {student.violation_count} violation
                                      {student.violation_count !== 1 ? "s" : ""}
                                    </span>
                                  </>
                                )}
                                {student.penalty_score > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="text-red-600 font-medium">
                                      -{student.penalty_score} penalty
                                    </span>
                                  </>
                                )}
                              </>
                            ) : (
                              <span className="flex items-center gap-1">
                                <PiCheckCircleDuotone
                                  size={14}
                                  className="text-emerald-500"
                                />
                                Submitted • Score not released
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <PiXCircleDuotone size={14} />
                            Not submitted
                          </div>
                        )}
                      </div>

                      {/* Score Display - Right Side */}
                      {student.has_submitted && showScore && (
                        <div className="flex-shrink-0 text-right">
                          <p
                            className={`text-xl sm:text-2xl font-bold ${getScoreColor(student.final_score, student.max_score)}`}
                          >
                            {student.final_score}
                          </p>
                          <p className="text-xs text-slate-400">
                            / {student.max_score}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Submission Time - Only for Teacher or Current User */}
                    {student.has_submitted && (isTeacher || isCurrentUser) && (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-500">
                          Submitted: {formatDateTimeShort(student.submitted_at)}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Stats Summary - Only for Teachers */}
        {isTeacher && submittedCount > 0 && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500 font-medium mb-1">
                Submitted
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {submittedCount}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500 font-medium mb-1">Pending</p>
              <p className="text-2xl font-bold text-amber-600">
                {rankings.length - submittedCount}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500 font-medium mb-1">
                Avg Score
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(
                  rankings
                    .filter((r) => r.has_submitted)
                    .reduce((sum, r) => sum + r.final_score, 0) /
                    submittedCount,
                )}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500 font-medium mb-1">Highest</p>
              <p className="text-2xl font-bold text-emerald-600">
                {Math.max(
                  ...rankings
                    .filter((r) => r.has_submitted)
                    .map((r) => r.final_score),
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
