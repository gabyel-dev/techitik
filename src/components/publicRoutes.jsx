import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { Loader } from "./loader";
import SplashScreen from "./SplashScreen";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  if (user) {
    // Check if there's a return URL in localStorage
    const returnUrl = localStorage.getItem('returnUrl');
    if (returnUrl) {
      console.log('[PublicRoute] Found returnUrl, redirecting to:', returnUrl);
      localStorage.removeItem('returnUrl');
      return <Navigate to={returnUrl} replace={true} />;
    }
    
    // Default dashboard redirect
    return (
      <Navigate
        to={
          user.role === "teacher"
            ? `/dashboard/t/${user.id}`
            : `/dashboard/s/${user.id}`
        }
        replace={true}
      />
    );
  }

  return children;
}
