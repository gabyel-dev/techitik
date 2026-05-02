import { useLocation } from "react-router-dom";
import { Dashboard, FolderOpen, IdCard } from "@duo-icons/react";
import { PiArchiveDuotone, PiFolderOpenDuotone } from "react-icons/pi";
import { GetRoomLists } from "./TeacherDashboard/RoomLists";
import SharedSidebar from "./shared/SharedSidebar";

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    {
      name: "Dashboard",
      icon: Dashboard,
      path: ".",
      isActive: location.pathname.split("/").length === 4 && !location.pathname.includes("/room/"),
    },
    {
      name: "Quizzes",
      icon: FolderOpen,
      path: "quizzes",
      isActive: location.pathname.includes("/quizzes"),
    },
    {
      name: "Archived Quizzes",
      icon: PiArchiveDuotone,
      path: "archived",
      isActive: location.pathname.includes("/archived") && !location.pathname.includes("/archived-rooms"),
    },
    {
      name: "Archived Rooms",
      icon: PiFolderOpenDuotone,
      path: "archived-rooms",
      isActive: location.pathname.includes("/archived-rooms"),
    },
    {
      name: "Students",
      icon: IdCard,
      path: "students",
      isActive: location.pathname.includes("/students"),
    },
  ];

  return (
    <SharedSidebar
      navItems={navItems}
      roomListComponent={GetRoomLists}
      roomsTitle="My Rooms"
    />
  );
}
