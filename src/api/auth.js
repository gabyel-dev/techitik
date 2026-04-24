import { api } from "./api";

export async function googleLogin(payload) {
  const response = await api.post("/auth/googleLogin", payload);
  return response.data;
}

export async function refreshSession() {
  const response = await api.post("/auth/refresh");
  return response.data;
}

export async function getSession() {
  const response = await api.get("/auth/session");
  return response.data;
}

export async function logout() {
  const response = await api.post("/auth/logout");
  return response.data;
}

export async function verifyDashboardAccess(id) {
  const response = await api.get(`/dashboard/verify/${id}`);
  return response.data;
}
