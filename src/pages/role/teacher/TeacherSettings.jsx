import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/authContext";
import {
  PiArchiveDuotone,
  PiFolderOpenDuotone,
  PiTrashDuotone,
  PiArrowRightDuotone,
} from "react-icons/pi";

export default function TeacherSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const settingsCards = [
    {
      title: "Archived Quizzes",
      description: "View and manage your archived quizzes",
      icon: PiArchiveDuotone,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
      path: "settings/archived",
    },
    {
      title: "Archived Rooms",
      description: "View and restore archived rooms",
      icon: PiFolderOpenDuotone,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      path: "settings/archived-rooms",
    },
    {
      title: "Recycle Bin",
      description: "Recover or permanently delete items",
      icon: PiTrashDuotone,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      path: "settings/recycle-bin",
    },
  ];

  return (
    <div className="p-4 md:p-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your account and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsCards.map((card) => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            className="group rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 text-left"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                <card.icon size={24} className={card.iconColor} />
              </div>
              <PiArrowRightDuotone
                size={20}
                className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all"
              />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              {card.title}
            </h3>
            <p className="text-sm text-slate-500">{card.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
