import { useEffect, useRef, useState } from "react";

import RoomDetailSkeleton from "../components/Skeletons/RoomDetail";

import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  GetRoomDetails,
  GetRoomRankings,
  ArchiveRoom,
  DeleteRoom,
} from "../api/rooms";
import {
  GetRoomQuizzes,
  CreateQuiz,
  ToggleQuizStatus,
  ArchiveQuiz,
  DeleteQuiz,
} from "../api/quiz";

import { useAuth } from "../context/authContext";
import { formatDate } from "../utils/dateFormatter";
import {
  PiUsersDuotone,
  PiBookOpenDuotone,
  PiClipboardTextDuotone,
  PiCalendarDuotone,
  PiCrownDuotone,
  PiShareNetworkDuotone,
  PiPlusDuotone,
  PiFileTextDuotone,
  PiChartBarDuotone,
  PiLockDuotone,
  PiLockOpenDuotone,
  PiArchiveDuotone,
  PiTrashDuotone,
  PiXBold,
  PiWarningDuotone,
  PiTrophyDuotone,
  PiMedalDuotone,
  PiDotsThreeVerticalBold,
  PiPencilSimpleDuotone,
  PiClipboardDuotone,
  PiGearDuotone,
  PiUserDuotone,
  PiArrowArcLeftDuotone,
  PiArrowLeft,
} from "react-icons/pi";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useWindowScroll } from "../utils/useWindowScroll";
import { useRoom } from "../context/roomContext";

export default function RoomDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams();
  const { user } = useAuth();
  const { room, quizzes, rankings, loading, refetchData } = useRoom();
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoomArchiveModal, setShowRoomArchiveModal] = useState(false);
  const [showRoomDeleteModal, setShowRoomDeleteModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  const lastY = useRef(0);
  const { y } = useWindowScroll();

  useEffect(() => {
    const diff = y - lastY.current;

    if (diff > 0) {
      setShowRoomSettings(false);
    }

    lastY.current = y;
  }, [y]);

  const isTeacher =
    room?.members?.find((m) => m.user?.id === user?.id)?.role === "teacher";
  const currentUserRanking = rankings?.find((r) => r.user_id === user?.id);

  const handleCreateQuiz = async () => {
    try {
      setCreatingQuiz(true);
      const response = await CreateQuiz({
        roomId,
        title: "Untitled Quiz",
        description: "",
      });
      const quizId = response.data.id;
      const teacherId = user.id;
      if (location.pathname.includes("/dashboard/t/")) {
        navigate(`/dashboard/t/${teacherId}/room/${roomId}/quiz/${quizId}`);
      } else {
        navigate(`quiz/${quizId}`);
      }
      toast.success("Quiz created successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create quiz");
    } finally {
      setCreatingQuiz(false);
    }
  };

  const handleShareInvite = async () => {
    const inviteUrl = `${window.location.origin}/invite/${room?.room_code}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Join ${room?.name}`,
          text: `You've been invited to join ${room?.name}!`,
          url: inviteUrl,
        });
      } else {
        await navigator.clipboard.writeText(inviteUrl);
        toast.success("Invite copied!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleQuizStatus = async (quiz) => {
    try {
      await ToggleQuizStatus(quiz.id, !quiz.is_open);
      toast.success(`Quiz ${!quiz.is_open ? "opened" : "closed"} successfully`);
      refetchData();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update quiz status",
      );
    }
  };

  const handleArchiveQuiz = async () => {
    if (!selectedQuiz) return;
    try {
      setProcessing(true);
      await ArchiveQuiz(selectedQuiz.id);
      toast.success("Quiz archived successfully");
      setShowArchiveModal(false);
      setSelectedQuiz(null);
      refetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to archive quiz");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!selectedQuiz) return;
    try {
      setProcessing(true);
      await DeleteQuiz(selectedQuiz.id);
      toast.success("Quiz deleted successfully");
      setShowDeleteModal(false);
      setSelectedQuiz(null);
      refetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete quiz");
    } finally {
      setProcessing(false);
    }
  };

  const handleArchiveRoom = async () => {
    try {
      setProcessing(true);
      await ArchiveRoom(roomId);
      toast.success("Room archived successfully");
      setShowRoomArchiveModal(false);
      window.dispatchEvent(new Event("roomUpdated"));
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to archive room");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteRoom = async () => {
    try {
      setProcessing(true);
      await DeleteRoom(roomId);
      toast.success("Room moved to recycle bin");
      setShowRoomDeleteModal(false);
      window.dispatchEvent(new Event("roomUpdated"));
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete room");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <RoomDetailSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="__room_details_header__ sticky font-semibold text-slate-600 top-0 z-3 w-full bg-white max-h-20 flex items-center justify-center md:justify-start md:px-4 border-b-2 border-b-gray-200 shadow-lg/4">
        <span className="px-5 py-3 hover:bg-gray-200 text-sm">Stream</span>
        <span className="px-5 py-3 hover:bg-gray-200 text-sm ">People</span>
      </div>
      <div className="bg-black flex relative w-full h-fit  overflow-hidden">
        <img
          src="/bg/bg.png"
          alt="Room Background"
          className="object-cover opacity-60 w-full max-h-80   relative "
        />
        <div className="  absolute hidden md:block  right-4 bottom-4 ">
          <div className="bg-white w-fit px-4 py-3  border border-slate-200 flex-shrink-0">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-0.5">
              Room Code
            </p>
            <p className="text-lg sm:text-xl font-bold text-[var(--primary)] uppercase tracking-wider">
              {room?.room_code}
            </p>
          </div>
        </div>

        <div className=" bottom-4  left-4 absolute flex flex-1 min-w-0  flex-col">
          <p className="text-xs text-slate-500 font-medium">Subject</p>
          <p className="text-xs md:text-4xl uppercase font-semibold text-slate-50 truncate text-shadow-2xs">
            {room?.subject}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header Section */}
        <div className="flex">
          <Link
            to={`/dashboard/t/${user.id}`}
            replace={true}
            className="flex items-center gap-2 "
          >
            <span className="text-[var(--primary)] text-xl ">/</span>{" "}
            <p className="text-sm hover:underline">dashboard</p>
            <span className="text-[var(--primary)] text-xl">/</span>
          </Link>
          <p className="flex items-center text-[var(--primary)]  text-sm">
            &nbsp;&nbsp;{room?.room_code?.toUpperCase()}
          </p>
        </div>

        <div className=" overflow-hidden mb-6 ">
          {/* Title & Metadata */}

          <div className=" py-3 border-b border-slate-100">
            <div className="flex justify-between w-full items-center pb-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {room?.name || "-"}
                </h1>

                <div className="flex items-center gap-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-500 truncate">
                      By{" "}
                      {room?.members?.find((m) => m.role === "teacher")?.user
                        ?.full_name || "-"}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <button
                  onClick={() => setShowRoomSettings(!showRoomSettings)}
                  className="flex items-center justify-center gap-2   text-gray-500 text-sm font-medium  transition-all min-h-[44px]"
                >
                  <PiDotsThreeVerticalBold size={25} />
                </button>

                <div className={`absolute -translate-y-2 translate-x-4`}>
                  {showRoomSettings && (
                    <>
                      <div
                        className=" inset-0 z-40"
                        onClick={() => setShowRoomSettings(false)}
                      />
                      <div className="absolute right-0  w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-2 animate-fadeIn">
                        <button
                          onClick={() => {
                            setShowRoomSettings(false);
                            setShowRoomArchiveModal(true);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 transition-colors"
                        >
                          <PiArchiveDuotone
                            size={18}
                            className="text-amber-600"
                          />
                          <span className="font-medium">Archive Room</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowRoomSettings(false);
                            setShowRoomDeleteModal(true);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <PiTrashDuotone size={18} />
                          <span className="font-medium">Delete Room</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="flex items-center justify-between w-full pt-5 md:pt-8">
              <div className="flex items-center gap-2.5">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <PiClipboardTextDuotone
                    size={18}
                    className="text-emeral  d-600"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 font-medium">Section</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {room?.section || "-"}
                  </p>
                </div>
              </div>

              {user.role === "teacher" && (
                <div className="flex items-center ml-4 gap-2.5 w-full">
                  <div className="flex-shrink-0  w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <PiCalendarDuotone size={18} className="text-amber-600" />
                  </div>
                  <div className="w-full">
                    <p className="text-xs text-slate-500 font-medium">
                      Created
                    </p>
                    <p className="text-sm font-semibold text-slate-900 ">
                      {formatDate(room?.created_at) || "-"}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex  flex-row-reverse mt-4 md:flex md:flex-row items-center gap-2 md:justify-end w-full">
                    <div className="hidden md:block">
                      {isTeacher && (
                        <>
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/t/${user.id}/room/${roomId}/analytics`,
                              )
                            }
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 active:scale-95 transition-all min-h-[44px]"
                          >
                            <PiChartBarDuotone size={20} />
                          </button>
                        </>
                      )}
                    </div>
                    <div className="hidden md:block">
                      <button
                        onClick={handleShareInvite}
                        className=" flex items-center justify-center w-full sm:w-auto px-4 py-2.5 bg-[var(--primary)] text-white text-sm font-medium  hover:bg-emerald-600 active:scale-95 transition-all min-h-[44px]"
                      >
                        <PiShareNetworkDuotone size={20} className="sm:mr-2" />
                        <span className="sm:inline">Share Invite</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions Bar */}

          {/* Room Code */}
          {/* Action Buttons */}
          <div className="flex flex-row-reverse mt-4  items-center gap-2  w-full">
            <div className="block md:hidden ">
              {isTeacher && (
                <>
                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/t/${user.id}/room/${roomId}/analytics`,
                      )
                    }
                    className="flex-1  flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 active:scale-95 transition-all min-h-[44px]"
                  >
                    <PiChartBarDuotone size={20} />
                  </button>
                </>
              )}
            </div>
            <div className="block md:hidden w-full">
              <button
                onClick={handleShareInvite}
                className=" flex items-center justify-center w-full  px-4 py-2.5 bg-[var(--primary)] text-white text-sm font-medium  hover:bg-emerald-600 active:scale-95 transition-all min-h-[44px]"
              >
                <PiShareNetworkDuotone size={20} className="sm:mr-2" />
                <span className="sm:inline">Share Invite</span>
              </button>
            </div>
          </div>
        </div>

        {/* Current User Ranking Card - Only for Students */}
        {!isTeacher && currentUserRanking && (
          <div className="bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl sm:rounded-2xl border border-emerald-300 shadow-lg mb-6 overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <PiTrophyDuotone size={32} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-xs font-medium mb-1">
                      Your Rank
                    </p>
                    <p className="text-white text-3xl font-bold">
                      #{currentUserRanking.rank}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-xs font-medium mb-1">
                    Total Score
                  </p>
                  <p className="text-white text-2xl font-bold">
                    {currentUserRanking.total_score}
                  </p>
                  <p className="text-white/70 text-xs mt-1">
                    {currentUserRanking.quizzes_taken} quiz
                    {currentUserRanking.quizzes_taken !== 1 ? "zes" : ""} taken
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quizzes Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 ">
            <div className=" overflow-hidden">
              {/* Section Header */}
              <div className=" py-4 sm:py-5 border-b border-slate-100">
                <div className="flex items-center w-full justify-between">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <PiFileTextDuotone
                          size={22}
                          className="text-blue-600"
                        />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                          Quizzes
                        </h2>
                      </div>
                    </div>

                    {user.role === "teacher" && (
                      <button
                        onClick={handleCreateQuiz}
                        disabled={creatingQuiz}
                        className=" flex w-fit items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                      >
                        <PiPlusDuotone size={20} />
                        <span className="hidden md:block">
                          {creatingQuiz ? "Creating..." : "New Quiz"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quizzes List */}
              <div className=" ">
                {quizzes?.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <PiFileTextDuotone size={32} className="text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                      No quizzes yet
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {user.role === "teacher"
                        ? "Create your first quiz to get started"
                        : "No quizzes available for you to take"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quizzes?.map((quiz) => (
                      <Link to={`quiz/${quiz.id}/details`}>
                        <div
                          key={quiz.id}
                          className="group p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm bg-white hover:bg-blue-50/30 transition-all"
                        >
                          {/* Quiz Header */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <h3 className="text-base sm:text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                  {quiz.title}
                                </h3>
                                {isTeacher && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleQuizStatus(quiz);
                                    }}
                                    className={`flex-shrink-0 p-1.5 rounded-lg transition-all min-h-[36px] min-w-[36px] flex items-center justify-center ${
                                      quiz.is_open
                                        ? "text-emerald-600 hover:bg-emerald-100"
                                        : "text-slate-400 hover:bg-slate-100"
                                    }`}
                                    title={
                                      quiz.is_open
                                        ? "Quiz is open"
                                        : "Quiz is closed"
                                    }
                                  >
                                    {quiz.is_open ? (
                                      <PiLockOpenDuotone size={20} />
                                    ) : (
                                      <PiLockDuotone size={20} />
                                    )}
                                  </button>
                                )}
                              </div>
                              {quiz.description && (
                                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-2">
                                  {quiz.description}
                                </p>
                              )}
                            </div>

                            {/* Status Badges */}
                            <div className="flex gap-1.5 flex-shrink-0">
                              {isTeacher && (
                                <>
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold text-center whitespace-nowrap ${
                                      quiz.is_published
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {user.role === "teacher"
                                      ? quiz.is_published
                                        ? "Published"
                                        : "Draft"
                                      : ""}
                                  </span>
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold text-center whitespace-nowrap ${
                                      quiz.is_open
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-slate-100 text-slate-700"
                                    }`}
                                  >
                                    {quiz.is_open ? "Open" : "Closed"}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Quiz Footer */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                            {/* Metadata */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                              <span className="font-medium">
                                Uploaded {formatDate(quiz.created_at)}
                              </span>
                              {quiz.due_date && (
                                <span className="font-medium">
                                  Due {formatDate(quiz.due_date)}
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            {quiz.is_published &&
                            quiz.is_open &&
                            user.role === "student" ? (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                      `/dashboard/s/${user.id}/room/${roomId}/quiz/${quiz.id}/take`,
                                    );
                                  }}
                                  className="px-4 py-2 text-sm font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 active:scale-95 transition-all min-h-[40px]"
                                >
                                  Take Quiz
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                      `/dashboard/s/${user.id}/room/${roomId}/quiz/${quiz.id}/rankings`,
                                    );
                                  }}
                                  className="px-4 py-2 text-sm font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:scale-95 transition-all min-h-[40px]"
                                >
                                  Rankings
                                </button>
                              </div>
                            ) : quiz.is_published &&
                              !quiz.is_open & (user.role === "student") ? (
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-500 rounded-lg">
                                  Closed
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                      `/dashboard/s/${user.id}/room/${roomId}/quiz/${quiz.id}/rankings`,
                                    );
                                  }}
                                  className="px-3 py-1.5 text-xs font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:scale-95 transition-all min-h-[36px]"
                                >
                                  Rankings
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Members Section - Takes 1 column on large screens */}
          <div className="z-3 relative">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
              {/* Section Header */}
              <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <PiTrophyDuotone size={22} className="text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Leaderboard
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {rankings?.length} student
                      {rankings?.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rankings List */}
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {rankings?.length === 0 ? (
                  <div className="px-5 sm:px-6 py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <PiTrophyDuotone size={32} className="text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                      No rankings yet
                    </p>
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
                                <PiMedalDuotone
                                  size={14}
                                  className="text-white"
                                />
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
                                  isCurrentUser
                                    ? "text-emerald-700"
                                    : "text-slate-900"
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
            </div>
          </div>
        </div>
      </div>

      {/* Archive Confirmation Modal */}
      {showArchiveModal && selectedQuiz && (
        <div className="fixed inset-0  flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PiArchiveDuotone size={24} className="text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Archive Quiz?
                </h3>
              </div>
              <button
                onClick={() => setShowArchiveModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <PiXBold size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to archive{" "}
              <span className="font-semibold text-slate-900">
                "{selectedQuiz.title}"
              </span>
              ? It will be hidden from students and moved to archived quizzes.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowArchiveModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveQuiz}
                disabled={processing}
                className="flex-1 px-4 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
              >
                {processing ? "Archiving..." : "Archive"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PiWarningDuotone size={24} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Delete Quiz?
                </h3>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <PiXBold size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-slate-900">
                "{selectedQuiz.title}"
              </span>
              ?
            </p>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-red-800 font-semibold leading-relaxed">
                ⚠️ This action cannot be undone. All questions, submissions, and
                student data will be permanently deleted.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteQuiz}
                disabled={processing}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
              >
                {processing ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Room Archive Confirmation Modal */}
      {showRoomArchiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PiArchiveDuotone size={24} className="text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Archive Room?
                </h3>
              </div>
              <button
                onClick={() => setShowRoomArchiveModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <PiXBold size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to archive{" "}
              <span className="font-semibold text-slate-900">
                "{room?.name}"
              </span>
              ? It will be hidden from the active rooms list.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRoomArchiveModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveRoom}
                disabled={processing}
                className="flex-1 px-4 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
              >
                {processing ? "Archiving..." : "Archive"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Delete Confirmation Modal */}
      {showRoomDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PiWarningDuotone size={24} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Delete Room?
                </h3>
              </div>
              <button
                onClick={() => setShowRoomDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <PiXBold size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900">
                "{room?.name}"
              </span>
              ?
            </p>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-amber-800 font-semibold leading-relaxed">
                ⚠️ This room will be moved to the recycle bin. You can restore
                it later or permanently delete it.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRoomDeleteModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoom}
                disabled={processing}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
              >
                {processing ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
