import { useState } from "react";
import { AddQuestion } from "../../api/quiz";
import toast from "react-hot-toast";
import {
  PiPlusDuotone,
  PiRadioButtonDuotone,
  PiCheckSquareDuotone,
  PiTextTDuotone,
  PiTextAlignLeftDuotone,
} from "react-icons/pi";

export default function AddQuestionButton({ quizId, orderIndex, onAdd }) {
  const [showMenu, setShowMenu] = useState(false);

  const questionTypes = [
    {
      type: "multiple_choice",
      label: "Multiple Choice",
      icon: PiRadioButtonDuotone,
    },
    {
      type: "checkboxes",
      label: "Checkboxes",
      icon: PiCheckSquareDuotone,
    },
    {
      type: "short_answer",
      label: "Short Answer",
      icon: PiTextTDuotone,
    },
    {
      type: "paragraph",
      label: "Paragraph",
      icon: PiTextAlignLeftDuotone,
    },
  ];

  const handleAddQuestion = async (questionType) => {
    try {
      const response = await AddQuestion(quizId, {
        question_type: questionType,
        question_text: "Untitled Question",
        order_index: orderIndex,
        points: 1,
        required: true,
      });

      onAdd(response.data);
      setShowMenu(false);
      toast.success("Question added");
    } catch (err) {
      toast.error("Failed to add question");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-dashed border-slate-300 rounded-2xl text-slate-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
      >
        <PiPlusDuotone size={20} />
        <span className="font-medium">Add Question</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20">
            {questionTypes.map((qt) => (
              <button
                key={qt.type}
                onClick={() => handleAddQuestion(qt.type)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <qt.icon size={20} className="text-emerald-600" />
                <span className="text-sm font-medium">{qt.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
