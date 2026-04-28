import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { verifyTeacherAccess } from "../../../api/auth";

import { useAuth } from "../../../context/authContext";

import Loader from "../../../components/loader";

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

import { CreateRoomModal } from "../../../components/Modal/CreateRoomModal";

import { GetRoomLists } from "../../../components/TeacherDashboard/RoomLists";

import Sidebar from "../../../components/Sidebar";

export default function Dashboard() {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { user, loading: isLoading } = useAuth();
  const { id } = useParams();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate("/", { replace: true });
      return;
    }
    verifyTeacherAccess(id)
      .then(() => setVerifying(false))
      .catch(() => navigate("/", { replace: true }));
  }, [isLoading, user, id]);

  if (isLoading || verifying) return <Loader />;

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-900 ">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar: Added blur and refined borders */}
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/80 px-10 backdrop-blur-md">
          <div className="relative w-full max-w-md group">
            <PiMagnifyingGlassDuotone
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div className="flex items-center gap-5">
            <button className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:text-emerald-600 transition-all">
              <PiBellDuotone size={22} />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  {user?.full_name}
                </p>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  {user?.role}
                </p>
              </div>
              <div className="relative h-11 w-11 overflow-hidden rounded-xl border-2 border-emerald-500/20 p-0.5 group-hover:border-emerald-500 transition-all">
                <img
                  src={`https://juexwulmukznvepvtzts.supabase.co/storage/v1/object/public/profiles/${user.google_id}.png`}
                  alt="Profile"
                  className="h-full w-full rounded-[10px] object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-10">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-[var(--font-heading)] font-bold tracking-tight text-slate-900">
                Teacher Dashboard
              </h1>
              <p className="mt-1 font-[var(--font-body)] text-slate-500">
                Welcome back! Manage your classrooms and track quiz performance.
              </p>
            </div>
            <button
              onClick={() => setIsModalVisible(true)}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-emerald-600 hover:shadow-emerald-500/20 transition-all active:scale-95"
            >
              <PiPlusDuotone size={18} />
              New Classroom
            </button>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Left Column: Stats & Table */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  {
                    label: "Total Quizzes",
                    val: "24",
                    icon: PiBooksDuotone,
                    color: "blue",
                  },
                  {
                    label: "Active Students",
                    val: "142",
                    icon: PiUsersDuotone,
                    color: "emerald",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}
                      >
                        <stat.icon size={28} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-black text-slate-900">
                          {stat.val}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Section */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
                  <h2 className="font-bold text-slate-900">Recent Activity</h2>
                  <button className="text-xs font-bold text-emerald-600 hover:underline">
                    View All Quizzes
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-8 py-4">Quiz Name</th>
                        <th className="px-8 py-4">Subject</th>
                        <th className="px-8 py-4">Participants</th>
                        <th className="px-8 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {[
                        {
                          name: "Midterm: React Fundamentals",
                          sub: "Web Dev 101",
                          p: "45/50",
                          status: "Active",
                        },
                        {
                          name: "Variables & Data Types",
                          sub: "Intro to JS",
                          p: "38/38",
                          status: "Completed",
                        },
                      ].map((row, i) => (
                        <tr
                          key={i}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-8 py-5 font-semibold text-slate-900">
                            {row.name}
                          </td>
                          <td className="px-8 py-5 text-slate-500">
                            {row.sub}
                          </td>
                          <td className="px-8 py-5 text-slate-500">{row.p}</td>
                          <td className="px-8 py-5">
                            <span
                              className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase ${
                                row.status === "Active"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Rooms List */}
            <div className="col-span-12 lg:col-span-4">
              <div className="sticky top-10">
                <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                  Your Classrooms
                </h2>
                <GetRoomLists />
              </div>
            </div>
          </div>
        </div>
      </main>

      {isModalVisible && (
        <CreateRoomModal onClose={() => setIsModalVisible(false)} />
      )}
    </div>
  );
}
