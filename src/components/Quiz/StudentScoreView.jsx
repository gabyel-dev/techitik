import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GetAttempt } from "../../api/attempt";
import { GetQuizDetails } from "../../api/quiz";
import Loader from "../loader";
import {
  PiCheckCircleDuotone,
  PiXCircleDuotone,
  PiWarningDuotone,
  PiTrophyDuotone,
  PiArrowLeftDuotone,
} from "react-icons/pi";

export default function StudentScoreView() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [quizId]);

  const fetchData = async () => {
    try {
      const [quizRes, attemptRes] = await Promise.all([
        GetQuizDetails(quizId),
        GetAttempt(quizId),
      ]);
      setQuiz(quizRes.data);
      setAttempt(attemptRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!attempt || attempt.status !== "submitted") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">No submission found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const scoreReleased = attempt.score_released;
  const hasPenalty = (attempt.violation_count || 0) > 3;
  const percentage = attempt.max_score > 0 
    ? Math.round((attempt.final_score / attempt.max_score) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors mb-6"
        >
          <PiArrowLeftDuotone size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <PiTrophyDuotone size={32} />
              <h1 className="text-2xl font-bold">{quiz?.title}</h1>
            </div>
            <p className="text-emerald-100">{quiz?.description}</p>
          </div>

          {/* Score Display */}
          {scoreReleased ? (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 mb-4">
                  <div className="text-4xl font-bold text-emerald-700">
                    {percentage}%
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Quiz Completed!
                </h2>
                <p className="text-slate-600">
                  Your score has been released
                </p>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Base Score</span>
                  <span className="text-xl font-bold text-slate-900">
                    {attempt.base_score || 0} / {attempt.max_score || 0}
                  </span>
                </div>

                {hasPenalty && (
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <PiWarningDuotone size={20} className="text-red-600" />
                      <span className="text-red-700 font-medium">Penalty</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">
                      -{attempt.penalty_score || 0}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border-2 border-emerald-500">
                  <span className="text-emerald-700 font-semibold">Final Score</span>
                  <span className="text-2xl font-bold text-emerald-700">
                    {attempt.final_score || 0} / {attempt.max_score || 0}
                  </span>
                </div>
              </div>

              {/* Violations Info */}
              {attempt.violation_count > 0 && (
                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-3">
                    <PiWarningDuotone size={20} className="text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-amber-900">
                        Focus Violations: {attempt.violation_count}
                      </p>
                      <p className="text-sm text-amber-700 mt-1">
                        {attempt.violation_count <= 3
                          ? "You received warnings for leaving the quiz tab."
                          : `${attempt.violation_count - 3} violation${attempt.violation_count - 3 > 1 ? 's' : ''} resulted in point deductions.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submission Info */}
              <div className="mt-6 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
                Submitted on {new Date(attempt.submitted_at).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
                <PiCheckCircleDuotone size={40} className="text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Quiz Submitted Successfully
              </h2>
              <p className="text-slate-600 mb-6">
                Your teacher will release the scores soon
              </p>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  You'll be able to see your score once your teacher releases it.
                  This page will update automatically.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
