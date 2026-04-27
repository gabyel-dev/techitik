import { api } from "./api";

export const CreateRoom = async (payload) => {
  const response = await api.post("/room/create", payload);
  return response.data;
};

export const JoinRoom = async (payload) => {
  const response = await api.post("/room/join", payload);
  return response.data;
};
