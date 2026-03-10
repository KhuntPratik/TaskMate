"use client";

import { createContext, useContext, useState } from "react";
import { signOut, useSession } from "next-auth/react";

type AuthUser = {
  token?: string;
  userid?: number;
  email?: string;
  role?: string;
  roleid?: number | null;
  name?: string | null;
} | null;

interface AuthContextType {
  user: AuthUser;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(() => {
    if (typeof window === "undefined") return null;
    const token = window.localStorage.getItem("token");
    const storedUser = window.localStorage.getItem("user");
    if (token && storedUser) {
      try {
        return { ...JSON.parse(storedUser), token };
      } catch (e) {
        return { token };
      }
    }
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

    const userData = {
      userid: data.user?.userid,
      email: data.user?.email,
      role: data.user?.role,
      roleid: data.user?.roleid,
    };

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser({
      ...userData,
      token: data.token,
    });
    return true;
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return false;
    }

    return true;
  };

  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
      value={{ user: mergedUser, login, register, logout, isAuthenticated: !!mergedUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
