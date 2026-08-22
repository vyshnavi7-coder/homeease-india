import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  CreditCard,
  ShieldCheck,
  Upload,
  ArrowUpRight,
  TrendingUp,
  Award,
  Star,
  Sliders,
  DollarSign
} from "lucide-react";
import { Booking, WorkerProfile, Wallet, WalletTransaction } from "../types";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

interface WorkerDashboardProps {
  onOpenChat: (bookingId: string) => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ onOpenChat }) => {
  const { user, workerProfile, wallet, refreshMe } = useAuth();

  const [isOnline, setIsOnline] = useState<boolean>(workerProfile?.is_online ?? true);
  const [radiusKm, setRadiusKm] = useState<number>(workerProfile?.service_radius_km ?? 15);
  const [hourlyRate, setHourlyRate] = useState<number>(workerProfile?.hourly_rate ?? 350);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [upiId, setUpiId] = useState<string>("ramesh@okhdfcbank");
  const [aadhaarDocUrl, setAadhaarDocUrl] = useState<string>(workerProfile?.aadhaar_doc || "");
  const [certificateText, setCertificateText] = useState<string>("");
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchWorkerBookings = async () => {
    try {
      const res = await api.get("/bookings");
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load worker bookings", err);
    }
  };

  useEffect(() => {
    fetchWorkerBookings();
    const interval = setInterval(fetchWorkerBookings, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleOnline = async () => {
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    try {
      await api.put("/workers/profile", { is_online: nextStatus });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleUpdateRadius = async (val: number) => {
    setRadiusKm(val);
    try {
      await api.put("/workers/profile", { service_radius_km: val });
    } catch (err) {
      console.error("Failed to update radius", err);
    }
  };

  const handleUpdateRate = async () => {
    try {
      await api.put("/workers/profile", { hourly_rate: hourlyRate });
      alert("Rate updated successfully");
    } catch {
      alert("Failed to update rate");
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const otp = otpInputs[bookingId];
      const res = await api.put(`/bookings/${bookingId}/status`, {
        status,
        otp_code: otp,
      });
      if (res.data.success) {
        await fetchWorkerBookings();
        await refreshMe();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update booking status");
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    try {
      const res = await api.post("/wallet/withdraw", {
        amount: Number(withdrawAmount),
        upi_id: uppiOrBank(upiId),
      });
      if (res.data.success) {
        alert(res.data.message);
        setWithdrawAmount("");
        await refreshMe();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Withdrawal failed");
    }
  };

  const uppiOrBank = (str: string) => str || "UPI ID";

  const handleKycUpload = async () => {
    setIsSaving(true);
    try {
      const res = await api.post("/workers/kyc", {
        aadhaar_doc: aadhaarDocUrl || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
        certificates: certificateText ? [certificateText] : ["NSDC Govt Verified Certificate"],
      });
      if (res.data.success) {
        alert("KYC documents submitted to Admin for approval.");
        await refreshMe();
      }
    } catch {
      alert("KYC submission failed");
    } finally {
      setIsSaving(false);
    }
  };

  const pendingRequests = bookings.filter((b) => b.status === "pending");
  const activeJobs = bookings.filter((b) =>
    ["accepted", "en_route", "in_progress"].includes(b.status)
  );
  const completedJobs = bookings.filter((b) => b.status === "completed");

  const totalEarnings = completedJobs.reduce((sum, b) => sum + Math.round(b.total_amount * 0.85), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Top Banner with Online/Offline toggle */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-brand-600 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40 shadow-md"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black">{user?.name}</h1>
              {workerProfile?.is_approved ? (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-900/80 text-blue-200 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Govt Verified Pro</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-900/80 text-amber-200 text-[10px] font-bold uppercase">
                  KYC Pending Admin Review
                </span>
              )}
            </div>
            <p className="text-xs text-white/90 mt-0.5">
              ★ {workerProfile?.rating || 4.9} • {workerProfile?.experience_years || 5} yrs exp • {workerProfile?.city || "Bengaluru"}
            </p>
          </div>
        </div>

        {/* Live Status Switch & Radius */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleToggleOnline}
            className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs flex items-center space-x-2 shadow-md transition-all ${
              isOnline
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-white animate-pulse" : "bg-red-400"}`} />
            <span>{isOnline ? "ONLINE (Receiving Jobs)" : "OFFLINE (Resting)"}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Wallet Balance</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ₹{wallet?.balance || 0}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">Available for instant UPI payout</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Net Earnings</span>
          <div className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">
            ₹{totalEarnings}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">85% worker payout rate</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Jobs Completed</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {completedJobs.length}
          </div>
          <span className="text-[10px] text-slate-400">100% completion reliability</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Customer Rating</span>
          <div className="text-2xl font-black text-amber-500 mt-1 flex items-center space-x-1">
            <Star className="w-5 h-5 fill-amber-400" />
            <span>{workerProfile?.rating || 4.9}</span>
          </div>
          <span className="text-[10px] text-slate-400">Based on verified reviews</span>
        </div>
      </div>

      {/* 1. Incoming Booking Requests (Live Accept/Reject) */}
      {pendingRequests.length > 0 && (
        <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 shadow-lg space-y-4 animate-bounce">
          <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-300">
            <Zap className="w-6 h-6 text-amber-500 fill-amber-400 animate-spin" />
            <h2 className="text-base font-black uppercase tracking-wide">
              ⚡ New Job Request Received! ({pendingRequests.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {req.subcategory?.name || "Home Service"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-[10px] font-bold uppercase">
                      {req.booking_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Customer: <strong>{req.customer?.name}</strong> • {req.address}
                  </p>
                  <p className="text-xs text-brand-600 font-bold mt-0.5">
                    Estimated Earning: ₹{Math.round(req.total_amount * 0.85)}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleUpdateBookingStatus(req.id, "cancelled")}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleUpdateBookingStatus(req.id, "accepted")}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
                  >
                    Accept Job Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Active Jobs Execution Panel */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">
          Active Job Workflow ({activeJobs.length})
        </h2>

        {activeJobs.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            No active jobs in progress. Keep your status Online to receive instant bookings.
          </div>
        ) : (
          <div className="space-y-4">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {job.subcategory?.name || "Service"}
                      </span>
                      <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                        #{job.booking_ref}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Address: <strong>{job.address}</strong> ({job.city})
                    </p>
                    {job.notes && (
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 italic">
                        Customer instructions: "{job.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onOpenChat(job.id)}
                      className="px-3 py-1.5 bg-brand-500 text-white rounded-xl text-xs font-bold shadow flex items-center space-x-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat / Call Customer</span>
                    </button>
                  </div>
                </div>

                {/* Status action stepper */}
                <div className="flex flex-wrap items-center gap-3">
                  {job.status === "accepted" && (
                    <button
                      onClick={() => handleUpdateBookingStatus(job.id, "en_route")}
                      className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center space-x-1.5"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Mark "En Route" (Start Driving)</span>
                    </button>
                  )}

                  {job.status === "en_route" && (
                    <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        placeholder="Enter 4-digit Customer OTP"
                        value={otpInputs[job.id] || ""}
                        onChange={(e) =>
                          setOtpInputs({ ...otpInputs, [job.id]: e.target.value })
                        }
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono font-bold text-center w-48"
                      />
                      <button
                        onClick={() => handleUpdateBookingStatus(job.id, "in_progress")}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow"
                      >
                        Verify OTP & Start Job
                      </button>
                    </div>
                  )}

                  {job.status === "in_progress" && (
                    <button
                      onClick={() => handleUpdateBookingStatus(job.id, "completed")}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition-transform active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Work Completed & Collect ₹{job.final_amount}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Wallet Payout & Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Instant UPI Withdrawal Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft space-y-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-emerald-500" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Instant Earnings Withdrawal (UPI / IMPS)
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Linked UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="ramesh@okhdfcbank"
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Amount to Withdraw (Max: ₹{wallet?.balance || 0})
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="₹1000"
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            <button
              onClick={handleWithdraw}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-600/25 transition-all"
            >
              Withdraw Funds to Bank
            </button>
          </div>
        </div>

        {/* Service Radius & Pricing Settings */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft space-y-4">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-brand-500" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Service Radius & Hourly Rate
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Working Radius:</span>
                <span className="text-brand-600">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min={2}
                max={50}
                step={1}
                value={radiusKm}
                onChange={(e) => handleUpdateRadius(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Base Hourly Rate (₹)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="flex-1 px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
                <button
                  onClick={handleUpdateRate}
                  className="px-4 py-2 bg-brand-500 text-white font-bold text-xs rounded-2xl shadow"
                >
                  Save Rate
                </button>
              </div>
            </div>

            {/* KYC Upload trigger */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={handleKycUpload}
                disabled={isSaving}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl transition-colors"
              >
                {isSaving ? "Submitting KYC..." : "Submit / Refresh Aadhaar KYC Proofs"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
