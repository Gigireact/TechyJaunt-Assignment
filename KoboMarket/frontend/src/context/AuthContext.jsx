import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { api, tokens } from "../api/client";

const Ctx = createContext(null);

export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(tokens.has());

  // Restore the user when the app loads with an existing access token.
  const load = useCallback(async () => {
    try {
      const data = await api("/user/me");
      setUser(data.user ?? data);
    } catch {
      tokens.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tokens.has()) {
      load();
    }
  }, [load]);

  // Log in using the backend's existing endpoint.
  const login = async (email, password) => {
    const data = await api("/user/login", {
      method: "POST",
      body: { email, password },
    });

    tokens.set(data.accessToken, data.refreshToken);
    setUser(data.user);
  };

  // Log out locally until the backend logout endpoint is implemented.
  const logout = async () => {
    tokens.clear();
    setUser(null);
  };

  const roles = user?.roles || (user?.role ? [user.role] : []);

  const has = (role) => roles.includes(role);

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        login,
        logout,
        reload: load,
        has,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
