import { api } from "./api";

export const CreateRoom = async (payload) => {
  const response = await api.post("/room/create", payload);
  return response.data;
};

export const JoinRoom = async (payload) => {
  const response = await api.post("/room/join", payload);
  return response.data;
};

export const GetRooms = async () => {
  const response = await api.get("/room/room_lists");
  return response.data;
};

export const GetStudentRooms = async () => {
  const response = await api.get("/room/student_rooms");
  return response.data;
};

export const GetRoomDetails = async (roomId) => {
  const response = await api.get(`/room/details/${roomId}`);
  return response.data;
};
