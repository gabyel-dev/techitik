import { useLocation, useMemo } from "react";
import { Dashboard, Award } from "@duo-icons/react";
import { GetStudentRoomLists } from "./StudentDashboard/RoomLists";
import SharedSidebar from "./shared/SharedSidebar";
import { useRooms } from "../context/roomsContext";

export default function StudentSidebar() {
  const { rooms, loading, refetchRooms } = useRooms();

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
      name: "Achievements",
      icon: Award,
      path: "achievements",
      isActive: location.pathname.includes("/achievements"),
    },
  ];

  const RoomListComponent = useMemo(
    () => () => (
      <GetStudentRoomLists
        rooms={rooms}
        loading={loading}
        onRefetch={refetchRooms}
      />
    ),
    [rooms, loading, refetchRooms],
  );

  return (
    <SharedSidebar
      navItems={navItems}
      roomListComponent={RoomListComponent}
      roomsTitle="My Classes"
    />
  );
}
