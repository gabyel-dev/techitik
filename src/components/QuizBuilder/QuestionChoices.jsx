import { useState } from "react";
import { AddChoice, UpdateChoice, DeleteChoice } from "../../api/quiz";
import toast from "react-hot-toast";
import { PiXDuotone, PiPlusDuotone } from "react-icons/pi";

export default function QuestionChoices({ question, onUpdate }) {
  const [choices, setChoices] = useState(question.choices || []);
  const [newChoiceText, setNewChoiceText] = useState("");

  const handleAddChoice = async () => {
    if (!newChoiceText.trim()) return;

    try {
      const response = await AddChoice(question.id, {
        choiceText: newChoiceText,
        isCorrect: false,
        orderIndex: choices.length,
      });

      const newChoice = response.data;
      const updatedChoices = [...choices, newChoice];
      setChoices(updatedChoices);
      onUpdate(question.id, { choices: updatedChoices });
      setNewChoiceText("");
      toast.success("Choice added");
    } catch (err) {
      toast.error("Failed to add choice");
    }
  };

  const handleUpdateChoice = async (choiceId, updates) => {
    try {
      await UpdateChoice(choiceId, updates);
      const updatedChoices = choices.map((c) =>
        c.id === choiceId ? { ...c, ...updates } : c
      );
      setChoices(updatedChoices);
      onUpdate(question.id, { choices: updatedChoices });
    } catch (err) {
      toast.error("Failed to update choice");
    }
  };

  const handleDeleteChoice = async (choiceId) => {
    try {
      await DeleteChoice(choiceId);
      const updatedChoices = choices.filter((c) => c.id !== choiceId);
      setChoices(updatedChoices);
      onUpdate(question.id, { choices: updatedChoices });
      toast.success("Choice deleted");
    } catch (err) {
      toast.error("Failed to delete choice");
    }
  };

  const handleCorrectToggle = async (choiceId) => {
    const choice = choices.find((c) => c.id === choiceId);
    
    // For multiple choice, uncheck others
    if (question.question_type === "multiple_choice") {
      const updates = choices.map((c) => ({
        id: c.id,
        is_correct: c.id === choiceId ? !choice.is_correct : false,
      }));

      for (const update of updates) {
        await UpdateChoice(update.id, { is_correct: update.is_correct });
      }

      const updatedChoices = choices.map((c) => ({
        ...c,
        is_correct: c.id === choiceId ? !choice.is_correct : false,
      }));
      setChoices(updatedChoices);
      onUpdate(question.id, { choices: updatedChoices });
    } else {
      // For checkboxes, toggle independently
      await handleUpdateChoice(choiceId, { is_correct: !choice.is_correct });
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500 mb-2">Click the radio/checkbox to mark correct answer(s)</p>
      {choices.map((choice, index) => (
        <div
          key={choice.id}
          className={`flex items-center gap-3 group p-2 rounded-lg transition-colors ${
            choice.is_correct ? 'bg-emerald-50 border border-emerald-200' : ''
          }`}
        >
          <input
            type={question.question_type === "multiple_choice" ? "radio" : "checkbox"}
            checked={choice.is_correct}
            onChange={() => handleCorrectToggle(choice.id)}
            className="w-4 h-4 text-emerald-600 cursor-pointer"
          />

          <input
            type="text"
            value={choice.choice_text}
            onChange={(e) =>
              handleUpdateChoice(choice.id, { choice_text: e.target.value })
            }
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 transition-colors"
            placeholder={`Option ${index + 1}`}
          />

          <button
            onClick={() => handleDeleteChoice(choice.id)}
            className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-600 transition-all"
          >
            <PiXDuotone size={18} />
          </button>
        </div>
      ))}

      {/* Add Choice */}
      <div className="flex items-center gap-3 mt-3">
        <div className="w-4 h-4" />
        <input
          type="text"
          value={newChoiceText}
          onChange={(e) => setNewChoiceText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddChoice()}
          placeholder="Add option"
          className="flex-1 px-3 py-2 border border-dashed border-slate-300 rounded-lg outline-none focus:border-emerald-500 transition-colors"
        />
        <button
          onClick={handleAddChoice}
          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <PiPlusDuotone size={18} />
        </button>
      </div>
    </div>
  );
}
