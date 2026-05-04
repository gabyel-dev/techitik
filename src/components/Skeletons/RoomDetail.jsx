export default function RoomDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Background Image Skeleton */}
      <div className="bg-slate-200 flex relative w-full h-80 overflow-hidden animate-pulse">
        <div className="absolute right-4 bottom-4">
          <div className="bg-white w-32 h-20 border border-slate-200"></div>
        </div>
        <div className="bottom-4 left-4 absolute flex flex-col">
          <div className="h-4 bg-slate-400 rounded w-16 mb-2"></div>
          <div className="h-10 bg-slate-400 rounded w-48"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb Skeleton */}
        <div className="flex gap-2 mb-4 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-20"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
        </div>

        {/* Header Section Skeleton */}
        <div className="py-3 border-b border-slate-100 mb-6 animate-pulse">
          <div className="flex justify-between items-center pb-3">
            <div className="flex-1">
              <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-40"></div>
            </div>
            <div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
          </div>

          {/* Metadata Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-5 md:pt-8">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
                <div className="flex-1">
                  <div className="h-3 bg-slate-200 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex gap-2 justify-end mb-6 animate-pulse">
          <div className="h-11 bg-slate-200 rounded-lg w-28"></div>
          <div className="h-11 bg-slate-200 rounded-lg w-32"></div>
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quizzes Section Skeleton */}
          <div className="lg:col-span-2">
            <div className="py-4 border-b border-slate-100 mb-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-200"></div>
                  <div className="h-6 bg-slate-200 rounded w-24"></div>
                </div>
                <div className="h-11 bg-slate-200 rounded-lg w-28"></div>
              </div>
            </div>

            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white animate-pulse"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                      <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <div className="h-3 bg-slate-200 rounded w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Section Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-200"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-slate-200 rounded w-28 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-200"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-24"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-slate-200 rounded w-12 mb-1"></div>
                        <div className="h-3 bg-slate-200 rounded w-8"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
