import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type User = { id: string; email: string; name: string };
type Ctx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<Ctx | null>(null);
const KEY = "hiremind.user";
const USERS_KEY = "hiremind.users";

type StoredUser = User & { password: string };

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
}
function writeUsers(u: StoredUser[]) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const users = readUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) throw new Error("Invalid email or password");
    const u: User = { id: found.id, email: found.email, name: found.name };
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  };

  const signup = async (name: string, email: string, password: string) => {
    const users = readUsers();
    if (users.some((u) => u.email === email)) throw new Error("Email already registered");
    const u: StoredUser = { id: crypto.randomUUID(), name, email, password };
    users.push(u);
    writeUsers(users);
    const safe: User = { id: u.id, email: u.email, name: u.name };
    localStorage.setItem(KEY, JSON.stringify(safe));
    setUser(safe);
  };

  const logout = () => { localStorage.removeItem(KEY); setUser(null); };

  return <AuthCtx.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}