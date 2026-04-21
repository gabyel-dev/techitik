import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Loader from "./loader";
import SplashScreen from "./SplashScreen";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    <SplashScreen />;
  }

  if (user) {
    return <Navigate to={`/dashboard/${user.id}`} replace={true} />;
  }

  return children;
}
