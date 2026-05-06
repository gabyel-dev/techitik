import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GetQuizDetails } from "../../api/quiz";
import {
  StartAttempt,
  GetAttempt,
  SaveAnswer,
  SubmitAttempt,
  LogViolation,
} from "../../api/attempt";
import { useAuth } from "../../context/authContext";
import useFocusGuard from "../../utils/focusGuard/useFocusGuard";
import { Loader } from "../loader";
import toast from "react-hot-toast";
import { PiWarningDuotone, PiEyeDuotone, PiXBold } from "react-icons/pi";

export default function StudentQuizTaking() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTamperModal, setShowTamperModal] = useState(false);
  const [quizClosed, setQuizClosed] = useState(false);
  const saveTimeoutRef = useRef({});

  useEffect(() => {
    initializeQuiz();

    // Poll quiz status every 3 seconds
    const statusInterval = setInterval(() => {
      checkQuizStatus();
    }, 3000);

    return () => clearInterval(statusInterval);
  }, [quizId]);

  const initializeQuiz = async () => {
    try {
      setLoading(true);
      const [quizRes, attemptRes] = await Promise.all([
        GetQuizDetails(quizId),
        GetAttempt(quizId),
      ]);

      setQuiz(quizRes.data);

      // Check if quiz is closed
      if (!quizRes.data.is_open) {
        setQuizClosed(true);
        toast.error("This quiz is currently closed");
        navigate(`/dashboard/s/${user.id}/room/${quizRes.data.room_id}`);
        return;
      }

      if (attemptRes.data) {
        // Check if already submitted
        if (attemptRes.data.status === "submitted") {
          toast.error("You have already submitted this quiz");
          navigate(
            `/dashboard/s/${user.id}/room/${quizRes.data.room_id}/quiz/${quizId}/score`,
          );
          return;
        }

        setAttempt(attemptRes.data);
        const existingAnswers = {};
        attemptRes.data.quiz_responses?.forEach((response) => {
          existingAnswers[response.question_id] = {
            answer_text: response.answer_text,
            selected_choice_ids: response.selected_choice_ids,
          };
        });
        setAnswers(existingAnswers);
      } else {
        const newAttempt = await StartAttempt(quizId);
        setAttempt(newAttempt.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load quiz");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const checkQuizStatus = async () => {
    if (!quizId || quizClosed) return;

    try {
      const quizRes = await GetQuizDetails(quizId);

      if (!quizRes.data.is_open) {
        setQuizClosed(true);
        toast.error("Quiz has been closed by the teacher", { duration: 5000 });

        // Auto-submit if there's an active attempt
        if (attempt?.id && attempt.status === "in_progress") {
          try {
            await SubmitAttempt(attempt.id);
            toast.success("Your answers have been auto-submitted");
          } catch (err) {
            console.error("Auto-submit failed:", err);
          }
        }

        setTimeout(() => {
          navigate(`/dashboard/s/${user.id}/room/${quizRes.data.room_id}`);
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to check quiz status:", err);
    }
  };

  const handleViolation = async (eventType) => {
    if (!attempt?.id || quizClosed) return;

    // Show immediate toast notification
    const remaining = Math.max(0, 5 - ((attempt?.violation_count || 0) + 1));
    const isPenalized = (attempt?.violation_count || 0) + 1 > 5;

    toast.error(
      isPenalized
        ? `Tab switch detected! Penalty: -1 point`
        : `Warning: Tab switch detected! ${remaining} warning${remaining !== 1 ? "s" : ""} remaining`,
      {
        duration: 5000,
        icon: "⚠️",
      },
    );

    const response = await LogViolation(attempt.id, eventType);
    if (response.data) {
      setAttempt(response.data);
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 5000);
    }
  };

  const handleTamperDetected = async (tamperType) => {
    if (!attempt?.id || quizClosed) return;

    console.log(`[TAMPER ALERT] ${tamperType} detected`);

    // Show immediate modal warning
    setShowTamperModal(true);

    // Map tamper types to shorter names for database
    const tamperTypeMap = {
      blur_listener_removed: "tamper_blur",
      visibility_listener_removed: "tamper_visibility",
      console_tampering: "tamper_console",
    };

    const shortTamperType = tamperTypeMap[tamperType] || "tamper_console";

    try {
      // Log the tamper event
      await LogViolation(attempt.id, shortTamperType);
      console.warn("Tamper attempt logged for teacher review");
    } catch (err) {
      console.error("Failed to log tamper event:", err);
    }
  };

  useFocusGuard({
    enabled: Boolean(
      attempt?.id && attempt.status === "in_progress" && !quizClosed,
    ),
    onPenaltyEvent: handleViolation,
    onSignalEvent: (eventType) => {
      if (!attempt?.id || quizClosed) return;
      LogViolation(attempt.id, eventType).catch(() => {});
    },
    onTamperDetected: handleTamperDetected,
    throttleMs: 500,
    pollMs: 500,
  });

  const handleAnswerChange = useCallback(
    (questionId, value, questionType) => {
      if (!attempt?.id || quizClosed) return;

      setAnswers((prev) => {
        const newAnswers = { ...prev };

        if (questionType === "checkboxes") {
          const current = newAnswers[questionId]?.selected_choice_ids;
          if (current?.includes(value)) {
            newAnswers[questionId] = {
              selected_choice_ids: current?.filter((id) => id !== value),
            };
          } else {
            newAnswers[questionId] = {
              selected_choice_ids: [...current, value],
            };
          }
        } else if (questionType === "multiple_choice") {
          newAnswers[questionId] = { selected_choice_ids: [value] };
        } else {
          newAnswers[questionId] = { answer_text: value };
        }

        return newAnswers;
      });

      if (saveTimeoutRef.current[questionId]) {
        clearTimeout(saveTimeoutRef.current[questionId]);
      }

      saveTimeoutRef.current[questionId] = setTimeout(() => {
        saveAnswerToServer(questionId);
      }, 1000);
    },
    [attempt],
  );

  const saveAnswerToServer = async (questionId) => {
    if (!attempt?.id || quizClosed) {
      return;
    }

    try {
      setAnswers((currentAnswers) => {
        const answerData = {
          quiz_id: quizId,
          ...currentAnswers[questionId],
        };
        SaveAnswer(attempt.id, questionId, answerData).catch(() => {});
        return currentAnswers;
      });
    } catch (err) {
      // Silent fail
    }
  };

  const handleSubmit = async () => {
    if (quizClosed) {
      toast.error("Quiz is closed");
      return;
    }

    setShowSubmitModal(false);

    try {
      setSubmitting(true);
      await SubmitAttempt(attempt.id);
      toast.success("Quiz submitted successfully!");
      navigate(
        `/dashboard/s/${user.id}/room/${quiz.room_id}/quiz/${quizId}/score`,
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!quiz || !attempt) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-slate-500">Quiz not found</p>
      </div>
    );
  }

  const remainingWarnings = Math.max(0, 5 - (attempt.violation_count || 0));
  const isPenalized = (attempt.violation_count || 0) > 5;

  return (
    <div className="min-h-screen bg-emerald-50">
      {quizClosed && (
        <div className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-4 bg-red-500 text-white">
          <div className="max-w-5xl mx-auto flex items-center gap-2 sm:gap-3">
            <PiWarningDuotone size={20} className="sm:w-6 sm:h-6" />
            <div className="flex-1">
              <p className="font-semibold text-sm sm:text-base">Quiz Closed</p>
              <p className="text-xs sm:text-sm">
                This quiz has been closed by the teacher. Redirecting...
              </p>
            </div>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Submit Quiz?</h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <PiXBold size={20} />
              </button>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to submit? You cannot change your answers
              after submission.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tamper Detection Modal */}
      {showTamperModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn border-4 border-red-500">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PiWarningDuotone size={24} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-red-900">
                  🚨 Security Warning
                </h3>
              </div>
              <button
                onClick={() => setShowTamperModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <PiXBold size={20} />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                Suspicious activity detected. Attempting to manipulate quiz
                monitoring is strictly prohibited.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-800 font-semibold">
                  ⚠️ Your teacher has been notified of this attempt.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowTamperModal(false)}
              className="w-full px-4 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {showWarning && (
        <div
          className={`fixed top-0 left-0 right-0 z-50 p-3 sm:p-4 ${isPenalized ? "bg-red-500" : "bg-amber-500"} text-white animate-in slide-in-from-top duration-300`}
        >
          <div className="max-w-5xl mx-auto flex items-center gap-2 sm:gap-3">
            <PiWarningDuotone
              size={20}
              className="sm:w-6 sm:h-6 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base">
                {isPenalized
                  ? "Penalty Applied!"
                  : "Warning: Tab Switch Detected"}
              </p>
              <p className="text-xs sm:text-sm truncate">
                {isPenalized
                  ? `Penalty: -${attempt.penalty_score || 0} points`
                  : `${remainingWarnings} warning${remainingWarnings !== 1 ? "s" : ""} left`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-normal text-slate-900">
                {quiz.title}
              </h1>
              {quiz.description && (
                <p className="text-sm text-slate-600 mt-1">
                  {quiz.description}
                </p>
              )}
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg flex-shrink-0 text-xs ${
                isPenalized
                  ? "bg-red-50 text-red-700"
                  : "bg-purple-50 text-purple-700"
              }`}
            >
              <PiEyeDuotone size={16} />
              <span className="font-medium whitespace-nowrap">
                {isPenalized
                  ? `-${attempt.penalty_score} pts`
                  : `${remainingWarnings}/5`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-6">
          {quiz.questions?.map((question, index) => (
            <div
              key={question.id}
              className="bg-white rounded-lg border border-slate-300 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-6">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3 className="text-base font-normal text-slate-900">
                    {question.question_text}
                  </h3>
                  <span className="text-sm text-slate-500 flex-shrink-0">
                    {question.points} {question.points === 1 ? "pt" : "pts"}
                  </span>
                </div>
              </div>

              {question.question_type === "multiple_choice" && (
                <div className="space-y-3">
                  {question.choices?.map((choice) => (
                    <label
                      key={choice.id}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        checked={answers[
                          question.id
                        ]?.selected_choice_ids?.includes(choice.id)}
                        onChange={() =>
                          handleAnswerChange(
                            question.id,
                            choice.id,
                            "multiple_choice",
                          )
                        }
                        disabled={quizClosed}
                        className="w-5 h-5 mt-0.5 text-purple-600 border-slate-300 focus:ring-purple-500 flex-shrink-0"
                      />
                      <span className="text-sm text-slate-700 group-hover:text-slate-900">
                        {choice.choice_text}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {question.question_type === "checkboxes" && (
                <div className="space-y-3">
                  {question.choices?.map((choice) => (
                    <label
                      key={choice.id}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={answers[
                          question.id
                        ]?.selected_choice_ids?.includes(choice.id)}
                        onChange={() =>
                          handleAnswerChange(
                            question.id,
                            choice.id,
                            "checkboxes",
                          )
                        }
                        disabled={quizClosed}
                        className="w-5 h-5 mt-0.5 text-purple-600 border-slate-300 focus:ring-purple-500 rounded flex-shrink-0"
                      />
                      <span className="text-sm text-slate-700 group-hover:text-slate-900">
                        {choice.choice_text}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {question.question_type === "short_answer" && (
                <input
                  type="text"
                  value={answers[question.id]?.answer_text || ""}
                  onChange={(e) =>
                    handleAnswerChange(
                      question.id,
                      e.target.value,
                      "short_answer",
                    )
                  }
                  disabled={quizClosed}
                  placeholder="Your answer"
                  className="w-full px-0 py-2 text-sm border-0 border-b-2 border-slate-300 focus:border-purple-600 outline-none transition-colors disabled:bg-transparent disabled:cursor-not-allowed"
                />
              )}

              {question.question_type === "paragraph" && (
                <textarea
                  value={answers[question.id]?.answer_text || ""}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value, "paragraph")
                  }
                  disabled={quizClosed}
                  placeholder="Your answer"
                  rows={4}
                  className="w-full px-0 py-2 text-sm border-0 border-b-2 border-slate-300 focus:border-purple-600 outline-none resize-none transition-colors disabled:bg-transparent disabled:cursor-not-allowed"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 pb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-6 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isPenalized ? "bg-red-100" : "bg-purple-100"
                }`}
              >
                <PiEyeDuotone
                  size={20}
                  className={isPenalized ? "text-red-600" : "text-purple-600"}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {isPenalized ? "Penalties Applied" : "Monitoring Active"}
                </p>
                <p className="text-xs text-slate-600">
                  {isPenalized
                    ? `${attempt.violation_count} violations • -${attempt.penalty_score} points`
                    : `${remainingWarnings} warnings remaining`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={submitting || quizClosed}
              className="px-6 py-3 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {quizClosed ? "Quiz Closed" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
