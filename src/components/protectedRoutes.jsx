import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Loader from "./loader";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/" replace={true} />;
  }

  if (role && user.role !== role) {
    return (
      <Navigate
        to={user.role === "teacher" ? `/dashboard/t/${user.id}` : `/dashboard/s/${user.id}`}
        replace={true}
      />
    );
  }

  return children;
}
