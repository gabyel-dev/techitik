import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { Loader } from "./loader";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    // Save current path to localStorage before redirecting to login
    if (location.pathname.startsWith('/invite/')) {
      console.log('[ProtectedRoute] Saving invite URL:', location.pathname);
      localStorage.setItem('returnUrl', location.pathname);
    }
    return <Navigate to="/" replace={true} />;
  }

  return children;
}
