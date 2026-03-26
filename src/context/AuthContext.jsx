import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = roles.includes("ADMIN");
  const isManager = roles.includes("MANAGER");
  const isAdminOrManager = isAdmin || isManager;

  const login = (accessToken, refreshToken) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    const decoded = jwtDecode(accessToken);
    setUser(decoded);
    setRoles(decoded.roles || []);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      const accessToken = localStorage.getItem("access_token");
      if (refreshToken) {
        await fetch(import.meta.env.VITE_API_BASE_URL + "/web/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Client-Type": "web",
            Authorization: "Bearer " + accessToken,
          },
          body: JSON.stringify({ refreshToken }),
        }).catch(() => {});
      }
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      setRoles([]);
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.clear();
        setLoading(false);
        return;
      }
      setUser(decoded);
      setRoles(decoded.roles || []);
    } catch (e) {
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        isAdmin,
        isManager,
        isAdminOrManager,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
