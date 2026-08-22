import React, { useState } from "react";
import { X, Phone, Mail, Lock, User, ShieldCheck, Briefcase, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = "customer",
}) => {
  const { login, register, sendOtp, loginWithOtp } = useAuth();

  const [authMode, setAuthMode] = useState<"login" | "signup" | "otp">("login");
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("password123");
  const [phone, setPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [bio, setBio] = useState<string>("");
  const [experience, setExperience] = useState<number>(3);
  const [hourlyRate, setHourlyRate] = useState<number>(350);
  const [aadhaarNumber, setAadhaarNumber] = useState<string>("XXXX-XXXX-9999");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const ok = await login(email, password);
    setIsSubmitting(false);
    if (ok) onClose();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const ok = await register({
      name,
      email,
      phone: phone || "+91 9800000000",
      password,
      role,
      bio,
      experience_years: experience,
      hourly_rate: hourlyRate,
      aadhaar_number: aadhaarNumber,
    });
    setIsSubmitting(false);
    if (ok) onClose();
  };

  const handleSendOtp = async () => {
    if (!phone) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    const res = await sendOtp(phone);
    if (res.success) {
      setOtpSent(true);
      setOtp("123456"); // Pre-fill test OTP for frictionless testing
    }
  };

  const handleVerifyOtp = async () => {
    if (!phone || !otp) return;
    setIsSubmitting(true);
    const ok = await loginWithOtp(phone, otp);
    setIsSubmitting(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-xs">
              🇮🇳
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {authMode === "login"
                ? "Welcome to HomeEase"
                : authMode === "otp"
                ? "Login with Mobile OTP"
                : "Create Free Account"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Toggle */}
        <div className="px-6 pt-4">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                role === "customer"
                  ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("worker")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                role === "worker"
                  ? "bg-amber-400 text-slate-900 shadow-sm font-black"
                  : "text-slate-500"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Skilled Worker</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Email / Password Login */}
          {authMode === "login" && (
            <form onSubmit={handleEmailLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@gmail.com or admin@homeease.in"
                    className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50 mt-2"
              >
                {isSubmitting ? "Logging In..." : "Sign In"}
              </button>

              <div className="relative py-2 flex items-center justify-center">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
                <span className="bg-white dark:bg-slate-900 px-3 text-[10px] text-slate-400 font-bold uppercase absolute">
                  Or
                </span>
              </div>

              <button
                type="button"
                onClick={() => setAuthMode("otp")}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-semibold text-xs flex items-center justify-center space-x-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>Continue with Mobile OTP</span>
              </button>

              <p className="text-center text-xs text-slate-500 pt-2">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Register Now
                </button>
              </p>
            </form>
          )}

          {/* Mobile OTP Flow */}
          {authMode === "otp" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  10-Digit Mobile Number (India)
                </label>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9811122233"
                    className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-bold shadow transition-colors shrink-0"
                  >
                    Send OTP
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Enter 6-Digit OTP (Pre-filled test: 123456)
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-mono font-bold text-lg tracking-widest"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Verifying OTP..." : "Verify & Sign In"}
                  </button>
                </div>
              )}

              <p className="text-center text-xs text-slate-500 pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  ← Back to Email Login
                </button>
              </p>
            </div>
          )}

          {/* Registration Flow */}
          {authMode === "signup" && (
            <form onSubmit={handleRegister} className="space-y-3 max-h-96 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9845012345"
                  className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              {/* Extra Worker Fields */}
              {role === "worker" && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Aadhaar Number (for KYC Verification)
                    </label>
                    <input
                      type="text"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value)}
                      placeholder="12-digit Aadhaar"
                      className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Exp (Years)
                      </label>
                      <input
                        type="number"
                        value={experience}
                        onChange={(e) => setExperience(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Base Rate (₹/hr)
                      </label>
                      <input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Bio / Skills Summary
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Specialization, experience, equipment..."
                      rows={2}
                      className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50 mt-2"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>

              <p className="text-center text-xs text-slate-500 pt-2">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Sign In
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
