import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login.jsx";
import PublicRoute from "./components/publicRoutes.jsx";
import ProtectedRoute from "./components/protectedRoutes.jsx";
import TeacherLayout from "./pages/role/teacher/TeacherLayout.jsx";
import TeacherDashboardContent from "./pages/role/teacher/TeacherDashboardContent.jsx";
import TeacherQuizzes from "./pages/role/teacher/TeacherQuizzes.jsx";
import TeacherStudents from "./pages/role/teacher/TeacherStudents.jsx";
import TeacherSettings from "./pages/role/teacher/TeacherSettings.jsx";
import ArchivedQuizzes from "./pages/role/teacher/ArchivedQuizzes.jsx";
import ArchivedRooms from "./pages/role/teacher/ArchivedRooms.jsx";
import StudentLayout from "./pages/role/student/StudentLayout.jsx";
import StudentClasses from "./pages/role/student/StudentClasses.jsx";
import StudentAchievements from "./pages/role/student/StudentAchievements.jsx";
import StudentSettings from "./pages/role/student/StudentSettings.jsx";
import RoomDetails from "./pages/RoomDetails.jsx";
import RoomInvite from "./pages/RoomInvite.jsx";
import StudentDashboard from "./pages/role/student/dashboard.jsx";
import QuizBuilder from "./components/QuizBuilder/QuizBuilder.jsx";
import StudentQuizTaking from "./components/Quiz/StudentQuizTaking.jsx";
import TeacherSubmissionsEnhanced from "./components/Quiz/TeacherSubmissionsEnhanced.jsx";
import StudentScoreView from "./components/Quiz/StudentScoreView.jsx";
import QuizAnalytics from "./components/Quiz/QuizAnalytics.jsx";
import RoomAnalytics from "./components/Quiz/RoomAnalytics.jsx";
import QuizRankings from "./pages/QuizRankings.jsx";

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
          path="/dashboard/t/:id/room/:roomId/quiz/:quizId"
          element={<QuizBuilder />}
        />

        <Route path="room/:roomId/create-quiz" element={<QuizBuilder />} />

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
          <Route
            path="room/:roomId/quiz/:quizId/take"
            element={<StudentQuizTaking />}
          />
          <Route
            path="room/:roomId/quiz/:quizId/score"
            element={<StudentScoreView />}
          />
        </Route>

        <Route
          path="/invite/:roomCode"
          element={
            <ProtectedRoute>
              <RoomInvite />
            </ProtectedRoute>
          }
        />

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
          <Route path="archived" element={<ArchivedQuizzes />} />
          <Route path="archived-rooms" element={<ArchivedRooms />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="settings" element={<TeacherSettings />} />
          <Route path="room/:roomId" element={<RoomDetails />} />
          <Route path="room/:roomId/quiz/:quizId" element={<QuizBuilder />} />
          <Route
            path="room/:roomId/quiz/:quizId/submissions"
            element={<TeacherSubmissionsEnhanced />}
          />
          <Route path="room/:roomId/analytics" element={<RoomAnalytics />} />
          <Route
            path="room/:roomId/quiz/:quizId/rankings"
            element={<QuizRankings />}
          />
        </Route>

        {/* Standalone Analytics Routes */}
        <Route
          path="/quiz/:quizId/analytics"
          element={
            <ProtectedRoute>
              <QuizAnalytics />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
