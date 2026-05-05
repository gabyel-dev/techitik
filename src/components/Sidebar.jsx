import { useLocation } from "react-router-dom";
import { Dashboard, IdCard } from "@duo-icons/react";
import { GetRoomLists } from "./TeacherDashboard/RoomLists";
import SharedSidebar from "./shared/SharedSidebar";
import { useEffect } from "react";
import { useRooms } from "../context/roomsContext";

export default function Sidebar() {
  const location = useLocation();
  const { rooms, refetchRooms } = useRooms();

  useEffect(() => {
    const handleRoomUpdate = () => {
      refetchRooms();
    };

    window.addEventListener("roomUpdated", handleRoomUpdate);
    return () => window.removeEventListener("roomUpdated", handleRoomUpdate);
  }, [refetchRooms]);

  const navItems = [
    {
      name: "Dashboard",
      icon: Dashboard,
      path: ".",
      isActive:
        location.pathname.split("/").length === 4 &&
        !location.pathname.includes("/room/"),
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
      roomListComponent={rooms ? () => <GetRoomLists rooms={rooms} /> : null}
      roomsTitle="My Rooms"
    />
  );
}
