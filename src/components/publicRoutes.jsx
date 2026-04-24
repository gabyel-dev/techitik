import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Loader from "./loader";
import SplashScreen from "./SplashScreen";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  if (user) {
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
