import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSession, refreshSession } from "../api/auth";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = async () => {
      try {
        const response = await getSession();
        setUser(response.user);
      } catch {
        try {
          await refreshSession();
        } catch {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    auth();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
