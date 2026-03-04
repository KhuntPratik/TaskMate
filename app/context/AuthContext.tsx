"use client";

import { createContext, useContext, useState } from "react";
import { signOut, useSession } from "next-auth/react";

type AuthUser = {
  token?: string;
  userid?: number;
  email?: string;
  role?: string;
  name?: string | null;
} | null;

interface AuthContextType {
  user: AuthUser;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(() => {
    if (typeof window === "undefined") return null;
    const token = window.localStorage.getItem("token");
    return token ? { token } : null;
  });
  const { data: session, status } = useSession();

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return false;
    }

    localStorage.setItem("token", data.token);
    setUser({
      userid: data.user?.userid,
      email: data.user?.email,
      role: data.user?.role,
      token: data.token,
    });
    return true;
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setUser(null);
    await signOut({ redirect: false });
  };

  const nextAuthUser: AuthUser = session?.user
    ? {
        name: session.user.name,
        email: session.user.email ?? undefined,
      }
    : null;
  const mergedUser = user ?? nextAuthUser;
  const isLoading = status === "loading";

  if (isLoading) return null;

  return (
    <AuthContext.Provider
      value={{ user: mergedUser, login, logout, isAuthenticated: !!mergedUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
