import { api } from "./api";

// Quiz CRUD
export const CreateQuiz = async (payload) => {
  const response = await api.post("/quiz/create", payload);
  return response.data;
};

export const GetQuizDetails = async (quizId) => {
  const response = await api.get(`/quiz/${quizId}`);
  return response.data;
};

export const GetRoomQuizzes = async (roomId) => {
  const response = await api.get(`/quiz/room/${roomId}`);
  return response.data;
};

export const UpdateQuiz = async (quizId, updates) => {
  const response = await api.put(`/quiz/${quizId}`, updates);
  return response.data;
};

export const DeleteQuiz = async (quizId) => {
  const response = await api.delete(`/quiz/${quizId}`);
  return response.data;
};

// Question CRUD
export const AddQuestion = async (quizId, questionData) => {
  const response = await api.post(`/quiz/${quizId}/questions`, questionData);
  return response.data;
};

export const UpdateQuestion = async (questionId, updates) => {
  const response = await api.put(`/quiz/questions/${questionId}`, updates);
  return response.data;
};

export const DeleteQuestion = async (questionId) => {
  const response = await api.delete(`/quiz/questions/${questionId}`);
  return response.data;
};

export const ReorderQuestions = async (quizId, questionOrders) => {
  const response = await api.post(`/quiz/${quizId}/questions/reorder`, {
    questionOrders,
  });
  return response.data;
};

export const DuplicateQuestion = async (questionId, newOrderIndex) => {
  const response = await api.post(`/quiz/questions/${questionId}/duplicate`, {
    newOrderIndex,
  });
  return response.data;
};

// Choice CRUD
export const AddChoice = async (questionId, choiceData) => {
  const response = await api.post(`/quiz/questions/${questionId}/choices`, choiceData);
  return response.data;
};

export const UpdateChoice = async (choiceId, updates) => {
  const response = await api.put(`/quiz/choices/${choiceId}`, updates);
  return response.data;
};

export const DeleteChoice = async (choiceId) => {
  const response = await api.delete(`/quiz/choices/${choiceId}`);
  return response.data;
};
