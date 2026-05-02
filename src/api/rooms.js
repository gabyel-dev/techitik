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

export const JoinRoomByInvite = async (roomCode) => {
  const response = await api.get(`/room/invite/${roomCode}`);
  return response.data;
};

export const GetRoomRankings = async (roomId) => {
  const response = await api.get(`/room/rankings/${roomId}`);
  return response.data;
};

export const ArchiveRoom = async (roomId) => {
  const response = await api.put(`/room/${roomId}/archive`);
  return response.data;
};

export const DeleteRoom = async (roomId) => {
  const response = await api.delete(`/room/${roomId}`);
  return response.data;
};

export const GetArchivedRooms = async () => {
  const response = await api.get("/room/archived");
  return response.data;
};

export const GetDeletedRooms = async () => {
  const response = await api.get("/room/deleted");
  return response.data;
};

export const RestoreRoom = async (roomId) => {
  const response = await api.put(`/room/${roomId}/restore`);
  return response.data;
};

export const PermanentDeleteRoom = async (roomId) => {
  const response = await api.delete(`/room/${roomId}/permanent`);
  return response.data;
};
