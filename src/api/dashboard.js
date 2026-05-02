import { api } from "./api";

export const GetTeacherDashboardStats = async () => {
  const response = await api.get("/dashboard/teacher/stats");
  return response.data;
};

export const GetStudentDashboardStats = async () => {
  const response = await api.get("/dashboard/student/stats");
  return response.data;
};
