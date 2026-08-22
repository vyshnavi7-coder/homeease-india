import React, { useState, useEffect } from "react";
import {
  Layers,
  CreditCard,
  MapPin,
  AlertTriangle,
  FileText,
  Navigation,
  MessageSquare,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { Booking, Wallet, WalletTransaction, Complaint } from "../types";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

interface CustomerDashboardProps {
  onTrackBooking: (booking: Booking) => void;
  onOpenInvoice: (bookingId: string) => void;
  onOpenChat: (bookingId: string) => void;
  onOpenComplaint: (bookingId: string) => void;
  onRateBooking?: (booking: Booking) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onTrackBooking,
  onOpenInvoice,
  onOpenChat,
  onOpenComplaint,
}) => {
  const { user, wallet } = useAuth();
  const [activeTab, setActiveTab] = useState<"bookings" | "wallet" | "complaints">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [bkRes, walRes, cmpRes] = await Promise.all([
        api.get("/bookings"),
        api.get("/wallet"),
        api.get("/complaints"),
      ]);

      if (bkRes.data.success) setBookings(bkRes.data.data);
      if (walRes.data.success) setTransactions(walRes.data.data.transactions);
      if (cmpRes.data.success) setComplaints(cmpRes.data.data);
    } catch (err) {
      console.error("Failed to load customer dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header Profile Summary */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-700 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40 shadow"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                Customer Account
              </span>
            </div>
            <p className="text-xs text-white/80 mt-0.5">{user?.email} • {user?.phone}</p>
          </div>
        </div>

        {/* Quick Wallet Card */}
        <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 flex items-center space-x-4">
          <div>
            <span className="text-[10px] text-white/70 font-semibold block uppercase">
              Wallet Balance
            </span>
            <span className="text-xl font-black">₹{wallet?.balance || 0}</span>
          </div>
          <div className="border-l border-white/20 pl-4">
            <span className="text-[10px] text-white/70 font-semibold block uppercase">
              Loyalty Points
            </span>
            <span className="text-xl font-black text-amber-300">
              {wallet?.loyalty_points || 0} pts
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-8 text-sm font-bold">
        <button
          onClick={() => setActiveTab("bookings")}
          className={`pb-3 flex items-center space-x-2 transition-all ${
            activeTab === "bookings"
              ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Bookings ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("wallet")}
          className={`pb-3 flex items-center space-x-2 transition-all ${
            activeTab === "wallet"
              ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>HomeEase Wallet & Cashback</span>
        </button>

        <button
          onClick={() => setActiveTab("complaints")}
          className={`pb-3 flex items-center space-x-2 transition-all ${
            activeTab === "complaints"
              ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Support & Complaints ({complaints.length})</span>
        </button>
      </div>

      {/* TAB 1: Bookings */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-2">
              <Layers className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No bookings yet</h3>
              <p className="text-xs text-slate-500">Book your first home service to get ₹100 cashback!</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-soft hover:shadow-soft-lg transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {booking.subcategory?.name || "Home Service"}
                      </span>
                      <span className="text-xs text-brand-600 dark:text-brand-400 font-mono font-bold bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-full">
                        #{booking.booking_ref}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Booked for: {booking.scheduled_date} at {booking.scheduled_time} • {booking.address}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        booking.status === "completed"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : booking.status === "en_route"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse"
                          : booking.status === "in_progress"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {booking.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Worker summary & actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={booking.worker?.user?.avatar || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"}
                      alt={booking.worker?.user?.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-brand-500"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {booking.worker?.user?.name || "Professional"}
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Payment: <strong>₹{booking.final_amount}</strong> ({booking.payment_method.toUpperCase()} - {booking.payment_status})
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Live Tracker Button */}
                    {["pending", "accepted", "en_route", "in_progress"].includes(booking.status) && (
                      <button
                        onClick={() => onTrackBooking(booking)}
                        className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center space-x-1.5 transition-all"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Track Live (OTP: {booking.otp_start_code})</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenChat(booking.id)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat / Call</span>
                    </button>

                    <button
                      onClick={() => onOpenInvoice(booking.id)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>GST Invoice</span>
                    </button>

                    <button
                      onClick={() => onOpenComplaint(booking.id)}
                      className="px-3.5 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold transition-colors"
                    >
                      Help
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Wallet */}
      {activeTab === "wallet" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">
              Wallet Transactions History
            </h3>
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No wallet transactions yet. Book services to earn cashback!
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {tx.description}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`font-black text-sm ${
                        tx.type === "credit" || tx.type === "cashback"
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {tx.type === "credit" || tx.type === "cashback" ? "+" : "-"}₹{tx.amount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Complaints */}
      {activeTab === "complaints" && (
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
              No registered complaints or disputes.
            </div>
          ) : (
            complaints.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 dark:text-white">
                    Ticket #{c.id} • {c.reason}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      c.status === "resolved"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">{c.description}</p>
                {c.resolution_notes && (
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium">
                    Resolution: {c.resolution_notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
