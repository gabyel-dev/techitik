import { useState } from "react";
import { PiNotePencilDuotone } from "react-icons/pi";

export default function QuizHeader({ quiz, onUpdate }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description || "");

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title !== quiz.title) {
      onUpdate({ title });
    }
  };

  const handleDescBlur = () => {
    setIsEditingDesc(false);
    if (description !== quiz.description) {
      onUpdate({ description });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      {/* Title */}
      <div className="mb-4">
        {isEditingTitle ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
            autoFocus
            className="w-full text-3xl font-bold text-slate-900 border-b-2 border-emerald-500 outline-none bg-transparent pb-2"
            placeholder="Quiz Title"
          />
        ) : (
          <div
            onClick={() => setIsEditingTitle(true)}
            className="group cursor-pointer"
          >
            <h1 className="text-3xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
              {title}
              <PiNotePencilDuotone
                size={24}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </h1>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        {isEditingDesc ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescBlur}
            autoFocus
            rows={3}
            className="w-full text-slate-600 border border-emerald-500 rounded-lg outline-none p-3 resize-none"
            placeholder="Quiz description (optional)"
          />
        ) : (
          <div
            onClick={() => setIsEditingDesc(true)}
            className="group cursor-pointer"
          >
            <p className="text-slate-600 group-hover:text-emerald-600 transition-colors min-h-[24px]">
              {description || (
                <span className="text-slate-400 italic">
                  Add description...
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Quiz Settings Preview */}
      <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Status:</span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              quiz.is_published
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {quiz.is_published ? "Published" : "Draft"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Questions:</span>
          <span className="font-medium text-slate-900">
            {quiz.questions?.length || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
