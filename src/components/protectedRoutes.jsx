import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Loader from "./loader";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/" replace={true} />;
  }

  return children;
}
