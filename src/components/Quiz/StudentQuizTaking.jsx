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
  const [quizClosed, setQuizClosed] = useState(false);
  const saveTimeoutRef = useRef({});
  const lastViolationRef = useRef(0);

  useEffect(() => {
    initializeQuiz();

    // Poll quiz status every 3 seconds
    const statusInterval = setInterval(() => {
      checkQuizStatus();
    }, 3000);

    return () => clearInterval(statusInterval);
  }, [quizId]);

  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress") return;

    const handleVisibilityChange = () => {
      const now = Date.now();
      if (now - lastViolationRef.current < 1000) return;

      if (document.hidden) {
        lastViolationRef.current = now;
        handleViolation("hidden");
      } else {
        LogViolation(attempt.id, "visible");
      }
    };

    const handleBlur = () => {
      const now = Date.now();
      if (now - lastViolationRef.current < 1000) return;

      lastViolationRef.current = now;
      handleViolation("blur");
    };

    const handleFocus = () => {
      LogViolation(attempt.id, "focus");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [attempt]);

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
    const response = await LogViolation(attempt.id, eventType);
    if (response.data) {
      setAttempt(response.data);
      const remaining = Math.max(0, 5 - response.data.violation_count);
      setShowWarning(true);

      if (remaining > 0) {
        toast.error(
          `Warning: Tab switch detected! ${remaining} warning${remaining !== 1 ? "s" : ""} remaining`,
          {
            duration: 5000,
            icon: "⚠️",
          },
        );
      } else {
        toast.error(`Penalty applied: -1 point for leaving quiz tab`, {
          duration: 5000,
          icon: "❌",
        });
      }

      setTimeout(() => setShowWarning(false), 5000);
    }
  };

  const handleAnswerChange = useCallback(
    (questionId, value, questionType) => {
      if (!attempt?.id || quizClosed) return;

      setAnswers((prev) => {
        const newAnswers = { ...prev };

        if (questionType === "checkboxes") {
          const current = newAnswers[questionId]?.selected_choice_ids;
          if (current.includes(value)) {
            newAnswers[questionId] = {
              selected_choice_ids: current.filter((id) => id !== value),
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {quizClosed && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-red-500 text-white">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <PiWarningDuotone size={24} />
            <div className="flex-1">
              <p className="font-semibold">Quiz Closed</p>
              <p className="text-sm">
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

      {showWarning && (
        <div
          className={`fixed top-0 left-0 right-0 z-50 p-4 ${isPenalized ? "bg-red-500" : "bg-amber-500"} text-white animate-in slide-in-from-top duration-300`}
        >
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <PiWarningDuotone size={24} />
            <div className="flex-1">
              <p className="font-semibold">
                {isPenalized
                  ? "Penalty Applied!"
                  : "Warning: Tab Switch Detected"}
              </p>
              <p className="text-sm">
                {isPenalized
                  ? `Each violation now deducts 1 point from your score. Current penalty: -${attempt.penalty_score || 0}`
                  : `${remainingWarnings} warning${remainingWarnings !== 1 ? "s" : ""} remaining before penalties apply`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{quiz.title}</h1>
            <p className="text-sm text-slate-500">{quiz.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isPenalized
                  ? "bg-red-50 text-red-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              <PiEyeDuotone size={20} />
              <div className="text-sm">
                <p className="font-semibold">
                  {isPenalized
                    ? `Penalty: -${attempt.penalty_score}`
                    : `Warnings: ${remainingWarnings}/5`}
                </p>
                <p className="text-xs">
                  {isPenalized ? "Points deducted" : "Stay on this tab"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {quiz.questions?.map((question, index) => (
            <div
              key={question.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
            >
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {index + 1}. {question.question_text}
                  </h3>
                  <span className="text-sm font-medium text-slate-500">
                    {question.points}{" "}
                    {question.points === 1 ? "point" : "points"}
                  </span>
                </div>
              </div>

              {question.question_type === "multiple_choice" && (
                <div className="space-y-2">
                  {question.choices?.map((choice) => (
                    <label
                      key={choice.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
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
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span className="text-slate-700">
                        {choice.choice_text}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {question.question_type === "checkboxes" && (
                <div className="space-y-2">
                  {question.choices?.map((choice) => (
                    <label
                      key={choice.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
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
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="text-slate-700">
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
                  placeholder="Type your answer here"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              )}

              {question.question_type === "paragraph" && (
                <textarea
                  value={answers[question.id]?.answer_text || ""}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value, "paragraph")
                  }
                  disabled={quizClosed}
                  placeholder="Type your answer here"
                  rows={5}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={submitting || quizClosed}
            className="px-8 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {quizClosed ? "Quiz Closed" : "Submit Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}
