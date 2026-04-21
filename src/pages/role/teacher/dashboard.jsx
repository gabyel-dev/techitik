import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../api/auth";
import { useAuth } from "../../../context/authContext";
import {
  PiHouseDuotone,
  PiBooksDuotone,
  PiUsersDuotone,
  PiChartLineUpDuotone,
  PiGearDuotone,
  PiMagnifyingGlassDuotone,
  PiBellDuotone,
  PiPlusDuotone,
  PiSignOutDuotone,
  PiTrophyDuotone,
  PiClockDuotone,
} from "react-icons/pi";
import { useParams } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: isLoading, setUser } = useAuth();
  const { id } = useParams();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/", { replace: true });
      return;
    }
    // Validate the id param matches the logged-in user
    if (!isLoading && user && id && String(user.id) !== String(id)) {
      navigate(`/dashboard/${user.id}`, { replace: true });
    }
  }, [isLoading, user, id, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } finally {
      navigate("/", { replace: true });
    }
  };

  return (
    <>
      <div className="relative flex h-screen w-full bg-slate-50 text-slate-800 font-sans">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-200 bg-white flex flex-col">
          <div className="flex h-16 items-center px-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
                <PiBooksDuotone size={20} />
              </div>
              <span className="text-sm font-bold tracking-wide text-slate-900">
                TechItik
              </span>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3 px-3">
              Menu
            </div>
            <button className="flex w-full items-center gap-3 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700 transition-colors">
              <PiHouseDuotone size={18} className="text-emerald-500" />
              Dashboard
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <PiBooksDuotone size={18} className="text-slate-400" />
              Quizzes
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <PiUsersDuotone size={18} className="text-slate-400" />
              Students
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <PiChartLineUpDuotone size={18} className="text-slate-400" />
              Results
            </button>

            <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-8 mb-3 px-3">
              System
            </div>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <PiGearDuotone size={18} className="text-slate-400" />
              Settings
            </button>
          </nav>

          <div className="border-t border-slate-100 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition-colors"
            >
              <PiSignOutDuotone size={18} className="text-slate-400" />
              Logout
            </button>
          </div>
        </aside>
        {/* Main Content Area */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Topbar */}
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
            <div className="flex items-center w-full max-w-md gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-500">
              <PiMagnifyingGlassDuotone className="text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search quizzes, students or reports..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-6">
              <button className="relative text-slate-400 hover:text-slate-600">
                <PiBellDuotone size={22} />
                <span className="absolute right-0 top-0 h-2 w-2 rounded-full border-2 border-white bg-emerald-500"></span>
              </button>
              <div className="h-6 w-px bg-slate-200"></div>
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-900 leading-none">
                    {user?.full_name}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    Instructor
                  </span>
                </div>
                <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
                  {user?.full_name?.charAt(0) || "G"}
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Overview
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Here's what's happening with your classes today.
                </p>
              </div>
              <button className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 transition-colors">
                <PiPlusDuotone size={16} />
                Create Quiz
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <PiBooksDuotone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Total Quizzes
                    </p>
                    <p className="text-2xl font-bold text-slate-900">24</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <PiUsersDuotone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Active Students
                    </p>
                    <p className="text-2xl font-bold text-slate-900">142</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <PiChartLineUpDuotone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Average Class Score
                    </p>
                    <p className="text-2xl font-bold text-slate-900">86%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Grid area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Table Section */}
              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
                <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Recent Quizzes
                  </h2>
                  <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                    View All
                  </button>
                </div>
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full min-w-125">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-medium text-slate-500">
                        <th className="px-6 py-3">Quiz Name</th>
                        <th className="px-6 py-3">Subject</th>
                        <th className="px-6 py-3">Participants</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      <tr>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          Midterm: React Fundamentals
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          Web Dev 101
                        </td>
                        <td className="px-6 py-4 text-slate-500">45 / 50</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            Active
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          Variables & Data Types
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          Intro to JS
                        </td>
                        <td className="px-6 py-4 text-slate-500">38 / 38</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            Completed
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          CSS Grid Layouts
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          Web UI Design
                        </td>
                        <td className="px-6 py-4 text-slate-500">0 / 60</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            Draft
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Side Column (Activity / Leaderboard preview) */}
              <div className="flex flex-col gap-6">
                {/* Leaderboard Preview */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-slate-900">
                      Top Performers
                    </h2>
                    <PiTrophyDuotone className="text-yellow-500" size={18} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                          AM
                        </div>
                        <span className="font-medium text-slate-900">
                          Alex Morgan
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">98%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                          JS
                        </div>
                        <span className="font-medium text-slate-900">
                          Jordan Smith
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">95%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                          RD
                        </div>
                        <span className="font-medium text-slate-900">
                          Riley Davis
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">92%</span>
                    </div>
                  </div>
                </div>

                {/* Activity */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-slate-900">
                      Recent Activity
                    </h2>
                    <PiClockDuotone className="text-slate-400" size={18} />
                  </div>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.75 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-100 ml-2">
                    <div className="relative flex items-center gap-4">
                      <div className="absolute -left-0.75 top-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-500 h-2.5 w-2.5"></div>
                      <div className="ml-6 text-xs text-slate-500">
                        <span className="font-semibold text-slate-900">
                          Web Dev 101
                        </span>{" "}
                        room was updated.
                        <br />
                        <span className="text-[10px] text-slate-400">
                          2 mins ago
                        </span>
                      </div>
                    </div>

                    <div className="relative flex items-center gap-4">
                      <div className="absolute -left-0.75 top-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-emerald-500 h-2.5 w-2.5"></div>
                      <div className="ml-6 text-xs text-slate-500">
                        <span className="font-semibold text-slate-900">
                          Midterm: React
                        </span>{" "}
                        was published.
                        <br />
                        <span className="text-[10px] text-slate-400">
                          1 hour ago
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
