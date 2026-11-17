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
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(tokens.has());
  const load = useCallback(async () => {
    try {
      setUser(await api("/users/me"));
    } catch {
      tokens.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (tokens.has()) load();
  }, [load]);
  const login = async (email, password) => {
    const d = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    tokens.set(d.accessToken, d.refreshToken);
    await load();
  };
  const logout = async () => {
    try {
      await api("/auth/logout", {
        method: "POST",
        body: { refreshToken: localStorage.getItem("rt") },
      });
    } catch {}
    tokens.clear();
    setUser(null);
  };
  const roles = user?.roles || (user?.role ? [user.role] : []);
  const has = (r) => roles.includes(r);
  return (
    <Ctx.Provider value={{ user, loading, login, logout, reload: load, has }}>
      {children}
    </Ctx.Provider>
  );
}
