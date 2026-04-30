import { api } from "./api";

// Start Quiz Attempt
export const StartAttempt = async (quizId) => {
  const response = await api.post(`/attempt/${quizId}/start`);
  return response.data;
};

// Get Student Attempt
export const GetAttempt = async (quizId) => {
  const response = await api.get(`/attempt/${quizId}/attempt`);
  return response.data;
};

// Save Answer
export const SaveAnswer = async (attemptId, questionId, answerData) => {
  const response = await api.post(`/attempt/${attemptId}/answer/${questionId}`, answerData);
  return response.data;
};

// Submit Quiz Attempt
export const SubmitAttempt = async (attemptId) => {
  const response = await api.post(`/attempt/${attemptId}/submit`);
  return response.data;
};

// Log Focus Violation
export const LogViolation = async (attemptId, eventType) => {
  const response = await api.post(`/attempt/${attemptId}/violation`, { eventType });
  return response.data;
};

// Get Violations (Teacher)
export const GetViolations = async (attemptId) => {
  const response = await api.get(`/attempt/${attemptId}/violations`);
  return response.data;
};

// Release Score (Teacher)
export const ReleaseScore = async (attemptId) => {
  const response = await api.post(`/attempt/${attemptId}/release`);
  return response.data;
};

// Bulk Release Scores (Teacher)
export const BulkReleaseScores = async (quizId) => {
  const response = await api.post(`/attempt/${quizId}/release-all`);
  return response.data;
};

// Get Quiz Submissions (Teacher)
export const GetSubmissions = async (quizId) => {
  const response = await api.get(`/attempt/${quizId}/submissions`);
  return response.data;
};

// Pause Attempt
export const PauseAttempt = async (attemptId) => {
  const response = await api.post(`/attempt/${attemptId}/pause`);
  return response.data;
};

// Resume Attempt
export const ResumeAttempt = async (attemptId) => {
  const response = await api.post(`/attempt/${attemptId}/resume`);
  return response.data;
};
