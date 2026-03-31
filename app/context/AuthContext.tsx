// "use client";

// import { createContext, useContext, useState } from "react";

// type AuthUser = {
//   token?: string;
//   userid?: number;
//   email?: string;
//   role?: string;
//   roleid?: number | null;
//   name?: string | null;
// } | null;

// interface AuthContextType {
//   user: AuthUser;
//   login: (email: string, password: string) => Promise<boolean>;
//   register: (username: string, email: string, password: string) => Promise<boolean>;
//   logout: () => Promise<void>;
//   isAuthenticated: boolean;
//   isLoading: boolean;
// }

// const AuthContext = createContext<AuthContextType | null>(null);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<AuthUser>(() => {
//     if (typeof window === "undefined") return null;
//     const token = window.localStorage.getItem("token");
//     const storedUser = window.localStorage.getItem("user");
//     if (token && storedUser) {
//       try {
//         return { ...JSON.parse(storedUser), token };
//       } catch (e) {
//         return { token };
//       }
//     }
//     return token ? { token } : null;
//   });

//   const login = async (email: string, password: string) => {
//     const res = await fetch("/api/auth/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       alert(data.message);
//       return false;
//     }

//     const userData = {
//       userid: data.user?.userid,
//       email: data.user?.email,
//       role: data.user?.role,
//       roleid: data.user?.roleid,
//     };

//     localStorage.setItem("token", data.token);
//     localStorage.setItem("user", JSON.stringify(userData));

//     setUser({
//       ...userData,
//       token: data.token,
//     });
//     return true;
//   };

//   const register = async (username: string, email: string, password: string) => {
//     const res = await fetch("/api/auth/register", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ username, email, password }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       alert(data.message);
//       return false;
//     }

//     return true;
//   };

//   const logout = async () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     setUser(null);
//   };

//   const mergedUser = user;
//   const isLoading = false;

//   return (
//     <AuthContext.Provider
//       value={{ user: mergedUser, login, register, logout, isAuthenticated: !!mergedUser, isLoading }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext)!;


"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { signIn, signOut, useSession } from "next-auth/react";

// ================= TYPES =================

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
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  googleLogin: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ================= CONTEXT =================

const AuthContext = createContext<AuthContextType | null>(null);

// ================= PROVIDER =================

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  const [user, setUser] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage safely (client only)
  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    const token = window.localStorage.getItem("token");
    const storedUser = window.localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser({ ...parsed, token });
      } catch {
        setUser({ token });
      }
    }

    setIsLoading(false);
  }, []);

  // Exchange NextAuth Google session for backend JWT (required for API calls)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!session?.user?.email) return;

    const existingToken = window.localStorage.getItem("token");
    if (existingToken) return;

    const syncGoogleAuth = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/auth/google", { method: "POST" });
        if (!res.ok) return;

        const data = await res.json();
        const userData = {
          userid: data.user?.userid,
          email: data.user?.email,
          role: data.user?.role,
          roleid: data.user?.roleid,
        };

        window.localStorage.setItem("token", data.token);
        window.localStorage.setItem("user", JSON.stringify(userData));
        setUser({ ...userData, token: data.token });
      } catch (err) {
        console.error("Google auth sync error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    syncGoogleAuth();
  }, [session?.user?.email]);

  // ================= LOGIN =================
  const login = async (email: string, password: string) => {
    try {
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

      setUser({ ...userData, token: data.token });

      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  // ================= REGISTER =================
  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
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
    } catch (err) {
      console.error("Register error:", err);
      return false;
    }
  };

  // ================= GOOGLE LOGIN =================
  const googleLogin = async () => {
    // No API change needed; uses NextAuth provider
    await signIn("google", { callbackUrl: "/Home" });
  };

  // ================= LOGOUT =================
  const logout = async () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("user");
    }
    setUser(null);

    await signOut({ callbackUrl: "/login" });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        googleLogin,
        isAuthenticated: !!user,
        isLoading: isLoading || status === "loading",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ================= HOOK =================

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};


