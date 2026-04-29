import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login.jsx";
import PublicRoute from "./components/publicRoutes.jsx";
import ProtectedRoute from "./components/protectedRoutes.jsx";
import TeacherLayout from "./pages/role/teacher/TeacherLayout.jsx";
import TeacherDashboardContent from "./pages/role/teacher/TeacherDashboardContent.jsx";
import TeacherQuizzes from "./pages/role/teacher/TeacherQuizzes.jsx";
import TeacherStudents from "./pages/role/teacher/TeacherStudents.jsx";
import TeacherSettings from "./pages/role/teacher/TeacherSettings.jsx";
import StudentLayout from "./pages/role/student/StudentLayout.jsx";
import StudentDashboardContent from "./pages/role/student/StudentDashboardContent.jsx";
import StudentClasses from "./pages/role/student/StudentClasses.jsx";
import StudentAchievements from "./pages/role/student/StudentAchievements.jsx";
import StudentSettings from "./pages/role/student/StudentSettings.jsx";
import RoomDetails from "./pages/RoomDetails.jsx";
import StudentDashboard from "./pages/role/student/dashboard.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard/s/:id"
          element={
            <ProtectedRoute>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="classes" element={<StudentClasses />} />
          <Route path="achievements" element={<StudentAchievements />} />
          <Route path="settings" element={<StudentSettings />} />
          <Route path="room/:roomId" element={<RoomDetails />} />
        </Route>

        <Route
          path="/dashboard/t/:id"
          element={
            <ProtectedRoute>
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboardContent />} />
          <Route path="quizzes" element={<TeacherQuizzes />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="settings" element={<TeacherSettings />} />
          <Route path="room/:roomId" element={<RoomDetails />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
