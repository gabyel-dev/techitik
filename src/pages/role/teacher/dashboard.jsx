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
  PiGraduationCapDuotone,
  PiSparkleDuotone,
} from "react-icons/pi";
import { useParams } from "react-router-dom";
import { CreateRoomModal } from "../../../components/Modal/CreateRoomModal";
import { GetRoomLists } from "../../../components/TeacherDashboard/RoomLists";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/TeacherDashboard/Header";

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

  if (isLoading || verifying) {
    return <Loader />;
  }

  return (
    <>
      <div className="relative flex h-screen w-full bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 text-slate-800 font-[var(--font-body)]">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex w-full flex-col overflow-hidden">
          {/* Topbar */}
          <Header />

          {/* Dashboard Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
            {/* Welcome Banner */}

            <div className="mb-8 rounded-4xl md:max-h-50 max-h-40 flex  bg-[var(--primary)] py-6 px-3 text-white shadow-2xl shadow-emerald-500/40 relative">
              <img
                src="/sprites/pose_4.png"
                alt="sprites"
                className="relative w-40 md:w-60 h-full md:-translate-y-10 md:translate-x-0 -translate-x-6 z-1"
              />
              <span className="relative text-[var(--secondary)] md:translate-y-15 -translate-x-18 text-2xl md:-translate-x-5 rotate-28 z-10">
                ▲
              </span>

              <div className="absolute inset-0 overflow-hidden rounded-4xl">
                <img
                  src="/logo.png"
                  alt="PTC Logo"
                  className="absolute right-0 opacity-10 saturate-0 translate-x-24 w-150"
                />
              </div>

              <div className="flex items-center h-fit min-w-45 max-w-100 justify-between -translate-x-14 -translate-y-4 md:translate-y-0 md:translate-x-0 bg-[var(--secondary)] rounded-3xl md:rounded-[40px] py-5 px-10 md:p-8 z-10">
                <div>
                  <h2 className="md:text-2xl text-xl font-semibold">
                    Welcome back,{" "}
                    <span className="text-[var(--primary)] text-3xl">
                      {user?.full_name?.split(" ")[0]}!
                    </span>{" "}
                  </h2>
                  <p className="mt-1 text-xs md:text-sm text-emerald-100">
                    You have 3 active quizzes and 5 rooms to manage today.
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="w-full  justify-end flex">
                <button
                  onClick={() => setIsModalVisible(true)}
                  className="flex items-center gap-2  rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-emerald-500/30 active:scale-95 transition-all duration-200"
                >
                  <PiPlusDuotone size={18} />
                  Create New Room
                </button>
              </div>
            </div>

            <div className="flex items-center mx-auto  justify-center mb-8 md:mt-8 mt-15 ">
              <div className="mx-auto flex flex-col items-center ">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Dashboard Overview
                </h1>
                <p className="mt-1 text-sm text-slate-500 flex items-center gap-2">
                  Here's what's happening with your classes today.
                  <PiSparkleDuotone className="text-amber-400" size={16} />
                </p>
                {isModalVisible && (
                  <CreateRoomModal onClose={() => setIsModalVisible(false)} />
                )}
              </div>
            </div>

            <main className="__main_container__ flex gap-8 w-full relative">
              <section className="__overview__ flex-[2]">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3   mb-8">
                  <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200 group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-sm group-hover:scale-105 transition-transform">
                          <PiBooksDuotone size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Total Quizzes
                          </p>
                          <p className="text-3xl font-bold text-slate-900 mt-1">
                            24
                          </p>
                        </div>
                      </div>
                      <div className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                        +12%
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200 group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 shadow-sm group-hover:scale-105 transition-transform">
                          <PiUsersDuotone size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Active Students
                          </p>
                          <p className="text-3xl font-bold text-slate-900 mt-1">
                            142
                          </p>
                        </div>
                      </div>
                      <div className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                        +5%
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200 group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 shadow-sm group-hover:scale-105 transition-transform">
                          <PiClockDuotone size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Pending Reviews
                          </p>
                          <p className="text-3xl font-bold text-slate-900 mt-1">
                            7
                          </p>
                        </div>
                      </div>
                      <div className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                        Due Today
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Grid area */}
                <div className="w-full">
                  {/* Table Section */}
                  <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden flex flex-col">
                    <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-semibold text-slate-900">
                          Recent Quizzes
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Latest 5 quizzes across all rooms
                        </p>
                      </div>
                      <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-all duration-200">
                        View All
                      </button>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white text-left">
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Quiz Name
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Subject
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Participants
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                  <PiBooksDuotone
                                    className="text-blue-600"
                                    size={16}
                                  />
                                </div>
                                <span className="font-medium text-slate-900 group-hover:text-emerald-600 transition-colors">
                                  Midterm: React Fundamentals
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                                Web Dev 101
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                  <div className="h-full w-[90%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                                </div>
                                <span className="text-sm text-slate-600 font-medium">
                                  45/50
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                  <PiBooksDuotone
                                    className="text-purple-600"
                                    size={16}
                                  />
                                </div>
                                <span className="font-medium text-slate-900 group-hover:text-emerald-600 transition-colors">
                                  Variables & Data Types
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                                Intro to JS
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                  <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
                                </div>
                                <span className="text-sm text-slate-600 font-medium">
                                  38/38
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100/50 px-3 py-1 text-xs font-semibold text-slate-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                                Completed
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                  <PiBooksDuotone
                                    className="text-amber-600"
                                    size={16}
                                  />
                                </div>
                                <span className="font-medium text-slate-900 group-hover:text-emerald-600 transition-colors">
                                  CSS Grid Layouts
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                                Web UI Design
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                  <div className="h-full w-0 rounded-full bg-gradient-to-r from-slate-400 to-slate-600"></div>
                                </div>
                                <span className="text-sm text-slate-600 font-medium">
                                  0/60
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                                Draft
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
            </main>
          </div>
        </main>
      </div>
    </>
  );
}
