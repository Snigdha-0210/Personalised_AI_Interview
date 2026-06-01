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
const KEY = "hiremind.token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem(KEY);
      const userStr = localStorage.getItem("hiremind.user");
      if (token && userStr) {
        setUser(JSON.parse(userStr));
      }
    } catch {}
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Login failed");
    
    localStorage.setItem(KEY, data.token);
    localStorage.setItem("hiremind.user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Signup failed");
    
    localStorage.setItem(KEY, data.token);
    localStorage.setItem("hiremind.user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => { 
    localStorage.removeItem(KEY); 
    localStorage.removeItem("hiremind.user"); 
    setUser(null); 
  };

  return <AuthCtx.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}