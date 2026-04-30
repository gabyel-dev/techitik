import { useState } from "react";
import {
  UpdateQuestion,
  DeleteQuestion,
  DuplicateQuestion,
} from "../../api/quiz";
import QuestionChoices from "./QuestionChoices";
import toast from "react-hot-toast";
import {
  PiTrashDuotone,
  PiCopyDuotone,
  PiDotsSixVerticalDuotone,
} from "react-icons/pi";

export default function QuestionCard({
  question,
  index,
  quizId,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}) {
  const [questionText, setQuestionText] = useState(question.question_text);
  const [isEditing, setIsEditing] = useState(false);

  const handleTextBlur = async () => {
    setIsEditing(false);
    if (questionText !== question.question_text) {
      try {
        await UpdateQuestion(question.id, { question_text: questionText });
        onUpdate(question.id, { question_text: questionText });
        toast.success("Question updated");
      } catch (err) {
        toast.error("Failed to update question");
        setQuestionText(question.question_text);
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this question?")) return;

    try {
      await DeleteQuestion(question.id);
      onDelete(question.id);
      toast.success("Question deleted");
    } catch (err) {
      toast.error("Failed to delete question");
    }
  };

  const handleDuplicate = async () => {
    try {
      const response = await DuplicateQuestion(question.id, index + 1);
      onUpdate(response.data.id, response.data);
      toast.success("Question duplicated");
    } catch (err) {
      toast.error("Failed to duplicate question");
    }
  };

  const questionTypeLabels = {
    multiple_choice: "Multiple Choice",
    checkboxes: "Checkboxes",
    short_answer: "Short Answer",
    paragraph: "Paragraph",
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all ${
        isDragging ? "opacity-50 scale-95" : "hover:shadow-md"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <button
            className="mt-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
            title="Drag to reorder"
          >
            <PiDotsSixVerticalDuotone size={24} />
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-slate-500">
                Question {index + 1}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                {questionTypeLabels[question.question_type]}
              </span>
            </div>

            {isEditing ? (
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                onBlur={handleTextBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleTextBlur();
                  }
                }}
                autoFocus
                rows={2}
                className="w-full text-lg font-medium text-slate-900 border border-emerald-500 rounded-lg outline-none p-3 resize-none"
                placeholder="Question text"
              />
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                className="cursor-pointer group"
              >
                <p className="text-lg font-medium text-slate-900 group-hover:text-emerald-600 transition-colors">
                  {questionText}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDuplicate}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Duplicate"
          >
            <PiCopyDuotone size={20} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete"
          >
            <PiTrashDuotone size={20} />
          </button>
        </div>
      </div>

      {/* Question Content */}
      <div className="mt-4">
        {(question.question_type === "multiple_choice" ||
          question.question_type === "checkboxes") && (
          <QuestionChoices
            question={question}
            onUpdate={onUpdate}
          />
        )}

        {question.question_type === "short_answer" && (
          <QuestionChoices
            question={question}
            onUpdate={onUpdate}
          />
        )}

        {question.question_type === "paragraph" && (
          <textarea
            disabled
            placeholder="Long answer text"
            rows={3}
            className="w-full px-4 py-2 border border-slate-200 text-slate-400 bg-slate-50 rounded-lg resize-none"
          />
        )}
      </div>
    </div>
  );
}
