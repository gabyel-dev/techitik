import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GetQuizDetails, UpdateQuiz, ReorderQuestions } from "../../api/quiz";
import QuizHeader from "./QuizHeader";
import QuestionCard from "./QuestionCard";
import AddQuestionButton from "./AddQuestionButton";
import { Loader } from "../loader";
import toast from "react-hot-toast";
import {
  PiArrowLeftDuotone,
  PiEyeDuotone,
  PiCheckCircleDuotone,
} from "react-icons/pi";

export default function QuizBuilder() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await GetQuizDetails(quizId);
      setQuiz(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load quiz");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizUpdate = async (updates) => {
    try {
      setSaving(true);
      await UpdateQuiz(quizId, updates);
      setQuiz((prev) => ({ ...prev, ...updates }));
      toast.success("Quiz updated");
    } catch (err) {
      toast.error("Failed to update quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleQuestionUpdate = (questionId, updates) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q,
      ),
    }));
  };

  const handleQuestionDelete = (questionId) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }));
  };

  const handleQuestionAdd = (newQuestion) => {
    setQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newQuestions = [...quiz.questions];
    const draggedItem = newQuestions[draggedIndex];
    newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(index, 0, draggedItem);

    setQuiz((prev) => ({ ...prev, questions: newQuestions }));
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    const questionOrders = quiz.questions.map((q, idx) => ({
      id: q.id,
      order_index: idx,
    }));

    try {
      await ReorderQuestions(quizId, questionOrders);
      toast.success("Questions reordered");
    } catch (err) {
      toast.error("Failed to reorder questions");
      fetchQuiz();
    } finally {
      setDraggedIndex(null);
    }
  };

  const handlePublish = async () => {
    await handleQuizUpdate({ is_published: !quiz.is_published });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <PiArrowLeftDuotone size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="flex items-center gap-3">
            {saving && (
              <span className="text-xs text-slate-500">Saving...</span>
            )}
            <button
              onClick={handlePublish}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                quiz.is_published
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-emerald-500 text-white hover:bg-emerald-600"
              }`}
            >
              {quiz.is_published ? (
                <>
                  <PiCheckCircleDuotone size={18} />
                  Published
                </>
              ) : (
                <>
                  <PiEyeDuotone size={18} />
                  Publish
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <QuizHeader quiz={quiz} onUpdate={handleQuizUpdate} />

        <div className="mt-6 space-y-4">
          {quiz.questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              quizId={quizId}
              onUpdate={handleQuestionUpdate}
              onDelete={handleQuestionDelete}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              isDragging={draggedIndex === index}
            />
          ))}

          <AddQuestionButton
            quizId={quizId}
            orderIndex={quiz.questions.length}
            onAdd={handleQuestionAdd}
          />
        </div>
      </div>
    </div>
  );
}
