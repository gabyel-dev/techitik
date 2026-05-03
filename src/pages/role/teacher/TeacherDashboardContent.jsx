import { useState, useEffect } from "react";
import { useAuth } from "../../../context/authContext";
import { useRooms } from "../../../context/roomsContext";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import {
  PiBooksDuotone,
  PiUsersDuotone,
  PiPlusDuotone,
  PiClockDuotone,
  PiSparkleDuotone,
  PiChartBarDuotone,
} from "react-icons/pi";
import { CreateRoomModal } from "../../../components/Modal/CreateRoomModal";
import Loader from "../../../components/loader";

export default function TeacherDashboardContent() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { user } = useAuth();
  const { rooms, loading, refetchRooms } = useRooms();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (rooms.length > 0) {
      const totalQuizzes = rooms.reduce((sum, room) => sum + (room.quiz_count || 0), 0);
      const totalStudents = rooms.reduce((sum, room) => sum + (room.member_count || 0), 0);
      const activeQuizzes = rooms.reduce((sum, room) => sum + (room.active_quiz_count || 0), 0);

      setStats({
        totalQuizzes,
        totalStudents,
        activeQuizzes,
        totalRooms: rooms.length,
      });
    }
  }, [rooms]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const roomChartData = rooms.slice(0, 5).map(room => ({
    name: room.name.length > 15 ? room.name.substring(0, 15) + '...' : room.name,
    students: room.member_count || 0,
    quizzes: room.quiz_count || 0,
  }));

  const quizStatusData = [
    { name: 'Active', value: stats?.activeQuizzes || 0 },
    { name: 'Inactive', value: (stats?.totalQuizzes || 0) - (stats?.activeQuizzes || 0) },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 animate-fadeIn ">
      <button
        onClick={() => setIsModalVisible(true)}
        className="md:hidden z-1 fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/40 hover:shadow-emerald-500/60 active:scale-95 transition-all duration-200 flex items-center justify-center"
        aria-label="Create New Room"
      >
        <PiPlusDuotone size={24} />
      </button>
      <div className="mb-8 rounded-4xl md:max-h-50 max-h-40 flex bg-[var(--primary)] relative py-6 px-3 text-white shadow-2xl shadow-emerald-500/40 ">
        <img
          src="/sprites/pose_4.png"
          alt="sprites"
          className="relative w-40 md:w-60 h-full md:-translate-y-10 md:translate-x-0 -translate-x-6 "
        />
        <span className="relative text-[var(--secondary)] md:translate-y-15 -translate-x-18 text-2xl md:-translate-x-5 rotate-28 ">
          ▲
        </span>

        <div className="absolute inset-0 overflow-hidden rounded-4xl">
          <img
            src="/logo.png"
            alt="PTC Logo"
            className="absolute right-0 opacity-10 saturate-0 translate-x-24 w-150"
          />
        </div>

        <div className="flex items-center h-fit min-w-45 max-w-100 justify-between -translate-x-14 -translate-y-4 md:translate-y-0 md:translate-x-0 bg-[var(--secondary)] rounded-3xl md:rounded-[40px] py-5 px-10 md:p-8 ">
          <div>
            <h2 className="md:text-2xl text-xl font-semibold">
              Welcome back,{" "}
              <span className="text-[var(--primary)] text-3xl">
                {user?.full_name?.split(" ")[0]}!
              </span>{" "}
            </h2>
            <p className="mt-1 text-xs md:text-sm text-emerald-100">
              You have {stats?.activeQuizzes || 0} active quizzes and {stats?.totalRooms || 0} rooms to manage today.
            </p>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="w-full justify-end flex">
          <button
            onClick={() => setIsModalVisible(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-emerald-500/30 active:scale-95 transition-all duration-200"
          >
            <PiPlusDuotone size={18} />
            Create New Room
          </button>
        </div>
      </div>

      <div className="flex items-center mx-auto justify-center mb-8 md:mt-8 mt-15">
        <div className="mx-auto flex flex-col items-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500 flex items-center text-center gap-2">
            Here's what's happening with your classes today.
          </p>
          {isModalVisible && (
            <CreateRoomModal 
              onClose={() => setIsModalVisible(false)} 
              onSuccess={() => {
                setIsModalVisible(false);
                refetchRooms();
              }}
            />
          )}
        </div>
      </div>

      <main className="__main_container__ flex gap-8 w-full relative">
        <section className="__overview__ flex-[2]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-sm group-hover:scale-105 transition-transform">
                    <PiBooksDuotone size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Total Quizzes
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.totalQuizzes || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div onClick={() => navigate(`/dashboard/t/${user.id}/students`)} className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 shadow-sm group-hover:scale-105 transition-transform">
                    <PiUsersDuotone size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Total Students
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {stats?.totalStudents || 0}
                    </p>
                  </div>
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
                      Active Quizzes
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.activeQuizzes || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 shadow-sm group-hover:scale-105 transition-transform">
                    <PiChartBarDuotone size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Total Rooms
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.totalRooms || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="text-base font-semibold text-slate-900">
                  Room Statistics
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Students and quizzes per room
                </p>
              </div>
              <div className="p-6">
                {roomChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={roomChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="students" fill="#10b981" name="Students" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="quizzes" fill="#3b82f6" name="Quizzes" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    No room data available
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="text-base font-semibold text-slate-900">
                  Quiz Status Distribution
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Active vs inactive quizzes
                </p>
              </div>
              <div className="p-6">
                {stats?.totalQuizzes > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={quizStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {quizStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    No quiz data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
