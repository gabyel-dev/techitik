import { PiMedalDuotone, PiTrophyDuotone } from "react-icons/pi";

export default function RoomRankingList({ rankings, user }) {
  return (
    <div>
      {rankings?.length === 0 ? (
        <div className="px-5 sm:px-6 py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <PiTrophyDuotone size={32} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 font-medium">No rankings yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Complete quizzes to see rankings
          </p>
        </div>
      ) : (
        rankings?.map((student) => {
          const isCurrentUser = student.user_id === user?.id;
          const getRankColor = (rank) => {
            if (rank === 1) return "from-amber-400 to-yellow-500";
            if (rank === 2) return "from-slate-300 to-slate-400";
            if (rank === 3) return "from-orange-400 to-amber-600";
            return "from-slate-200 to-slate-300";
          };

          return (
            <div
              key={student.user_id}
              className={`px-5 sm:px-6 py-4 transition-colors ${
                isCurrentUser
                  ? "bg-emerald-50 border-l-4 border-emerald-500"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Profile Image with Rank Badge */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden border-2 border-white shadow-sm">
                    <img
                      src={`https://juexwulmukznvepvtzts.supabase.co/storage/v1/object/public/profiles/${student.google_id}.png`}
                      alt={student.full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Rank Badge Overlay */}
                  <div
                    className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br ${getRankColor(student.rank)} flex items-center justify-center border-2 border-white shadow-md`}
                  >
                    {student.rank <= 3 ? (
                      <PiMedalDuotone size={14} className="text-white" />
                    ) : (
                      <span className="text-[10px] font-bold text-white">
                        #{student.rank}
                      </span>
                    )}
                  </div>
                </div>

                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isCurrentUser ? "text-emerald-700" : "text-slate-900"
                      }`}
                    >
                      {student.full_name}
                      {isCurrentUser && (
                        <span className="ml-1 text-xs">(You)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium">
                      {student.total_score} pts
                    </span>
                    <span>•</span>
                    <span>
                      {student.quizzes_taken} quiz
                      {student.quizzes_taken !== 1 ? "zes" : ""}
                    </span>
                  </div>
                </div>

                {/* Average Score Badge */}
                {student.quizzes_taken > 0 && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-slate-500 font-medium mb-0.5">
                      Avg
                    </p>
                    <p
                      className={`text-sm font-bold ${
                        student.average_score >= 80
                          ? "text-emerald-600"
                          : student.average_score >= 60
                            ? "text-blue-600"
                            : student.average_score >= 40
                              ? "text-amber-600"
                              : "text-red-600"
                      }`}
                    >
                      {student.average_score}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
