import React, { createContext, useContext, useState, useEffect } from "react";
import { User, WorkerProfile, Wallet, UserRole } from "../types";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  workerProfile: WorkerProfile | null;
  wallet: Wallet | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  loginWithOtp: (phone: string, otp: string) => Promise<boolean>;
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string; otp?: string }>;
  switchRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("homeease_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchMe = async () => {
    try {
      if (!token) {
        // Automatically log in as default customer Priya Sharma for instant seamless experience
        await switchRole("customer");
        return;
      }
      const res = await api.get("/auth/me");
      if (res.data.success) {
        setUser(res.data.user);
        setWorkerProfile(res.data.workerProfile || null);
        setWallet(res.data.wallet || null);
      }
    } catch {
      // Fallback demo switch
      await switchRole("customer");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, [token]);

  const login = async (email: string, password = "password123"): Promise<boolean> => {
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        localStorage.setItem("homeease_token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setWorkerProfile(res.data.workerProfile || null);
        setWallet(res.data.wallet || null);
        return true;
      }
      return false;
    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed");
      return false;
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      const res = await api.post("/auth/register", data);
      if (res.data.success) {
        localStorage.setItem("homeease_token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        if (data.role === "worker") {
          await fetchMe();
        }
        return true;
      }
      return false;
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration failed");
      return false;
    }
  };

  const sendOtp = async (phone: string) => {
    try {
      const res = await api.post("/auth/send-otp", { phone });
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Failed to send OTP" };
    }
  };

  const loginWithOtp = async (phone: string, otp: string): Promise<boolean> => {
    try {
      const res = await api.post("/auth/verify-otp", { phone, otp });
      if (res.data.success) {
        localStorage.setItem("homeease_token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setWorkerProfile(res.data.workerProfile || null);
        setWallet(res.data.wallet || null);
        return true;
      }
      return false;
    } catch (err: any) {
      alert(err.response?.data?.message || "Invalid OTP");
      return false;
    }
  };

  const switchRole = async (role: UserRole): Promise<void> => {
    try {
      setIsLoading(true);
      const res = await api.get(`/auth/demo/${role}`);
      if (res.data.success) {
        localStorage.setItem("homeease_token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setWorkerProfile(res.data.workerProfile || null);
        setWallet(res.data.wallet || null);
      }
    } catch (err) {
      console.error("Demo role switch error", err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("homeease_token");
    setToken(null);
    setUser(null);
    setWorkerProfile(null);
    setWallet(null);
  };

  const refreshMe = async () => {
    await fetchMe();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workerProfile,
        wallet,
        token,
        isLoading,
        login,
        register,
        loginWithOtp,
        sendOtp,
        switchRole,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
