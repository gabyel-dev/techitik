import { useLocation } from "react-router-dom";
import { Dashboard, FolderOpen, Award } from "@duo-icons/react";
import { GetStudentRoomLists } from "./StudentDashboard/RoomLists";
import SharedSidebar from "./shared/SharedSidebar";

export default function StudentSidebar() {
  const location = useLocation();

  const navItems = [
    {
      name: "Dashboard",
      icon: Dashboard,
      path: ".",
      isActive: location.pathname.split("/").length === 4 && !location.pathname.includes("/room/"),
    },
    {
      name: "My Classes",
      icon: FolderOpen,
      path: "classes",
      isActive: location.pathname.includes("/classes"),
    },
    {
      name: "Achievements",
      icon: Award,
      path: "achievements",
      isActive: location.pathname.includes("/achievements"),
    },
  ];

  return (
    <SharedSidebar
      navItems={navItems}
      roomListComponent={GetStudentRoomLists}
      roomsTitle="My Classes"
    />
  );
}
