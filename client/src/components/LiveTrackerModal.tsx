import React, { useState, useEffect } from "react";
import {
  X,
  Phone,
  MessageSquare,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Star,
  Clock
} from "lucide-react";
import { Booking } from "../types";
import { InteractiveMap } from "./InteractiveMap";
import { api } from "../services/api";

interface LiveTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onOpenChat: (bookingId: string) => void;
  onOpenInvoice: (bookingId: string) => void;
  onOpenComplaint: (bookingId: string) => void;
  onStatusUpdated?: () => void;
}

export const LiveTrackerModal: React.FC<LiveTrackerModalProps> = ({
  isOpen,
  onClose,
  booking,
  onOpenChat,
  onOpenInvoice,
  onOpenComplaint,
  onStatusUpdated,
}) => {
  if (!isOpen || !booking) return null;

  const [simulatedLat, setSimulatedLat] = useState<number>(
    booking.current_worker_lat || 12.9716
  );
  const [simulatedLng, setSimulatedLng] = useState<number>(
    booking.current_worker_lng || 77.5946
  );
  const [currentStatus, setCurrentStatus] = useState<string>(booking.status);
  const [etaMins, setEtaMins] = useState<number>(8);

  // Live GPS simulation towards customer coordinates if status is en_route
  useEffect(() => {
    if (currentStatus !== "en_route") return;

    const interval = setInterval(() => {
      setSimulatedLat((prevLat) => {
        const diff = (booking.lat - prevLat) * 0.1;
        return prevLat + diff;
      });
      setSimulatedLng((prevLng) => {
        const diff = (booking.lng - prevLng) * 0.1;
        return prevLng + diff;
      });
      setEtaMins((prev) => (prev > 1 ? prev - 1 : 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [currentStatus, booking.lat, booking.lng]);

  const handleCancelBooking = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.put(`/bookings/${booking.id}/status`, { status: "cancelled" });
      setCurrentStatus("cancelled");
      onStatusUpdated?.();
    } catch {
      alert("Failed to cancel booking");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Live Service Tracker</span>
                <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-full">
                  #{booking.booking_ref}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {booking.subcategory?.name || "Home Service"} • {booking.address}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status Progress Bar */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  currentStatus === "completed"
                    ? "bg-emerald-500"
                    : currentStatus === "in_progress"
                    ? "bg-blue-500 animate-pulse"
                    : currentStatus === "en_route"
                    ? "bg-amber-500 animate-ping"
                    : "bg-slate-400"
                }`}
              />
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {currentStatus === "en_route" && "Worker En Route"}
                  {currentStatus === "in_progress" && "Service In Progress"}
                  {currentStatus === "completed" && "Job Completed"}
                  {currentStatus === "pending" && "Waiting for Confirmation"}
                  {currentStatus === "accepted" && "Worker Dispatched"}
                  {currentStatus === "cancelled" && "Booking Cancelled"}
                </div>
                <div className="text-[11px] text-slate-500">
                  {currentStatus === "en_route" && `Estimated arrival in ~${etaMins} mins`}
                  {currentStatus === "in_progress" && "Work started after OTP verification"}
                  {currentStatus === "completed" && "Thank you for using HomeEase India"}
                </div>
              </div>
            </div>

            {/* OTP Code Card */}
            {["pending", "accepted", "en_route"].includes(currentStatus) && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-center">
                <span className="text-[9px] font-bold text-amber-800 dark:text-amber-300 uppercase block">
                  Start OTP
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white tracking-wider">
                  {booking.otp_start_code}
                </span>
              </div>
            )}
          </div>

          {/* Interactive Map with Real-time GPS Tracker */}
          <InteractiveMap
            centerLat={booking.lat}
            centerLng={booking.lng}
            customerLat={booking.lat}
            customerLng={booking.lng}
            liveWorkerLat={simulatedLat}
            liveWorkerLng={simulatedLng}
            isTrackingMode={true}
            className="h-64 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800"
          />

          {/* Worker Info Card & Contact Actions */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center space-x-3">
              <img
                src={
                  booking.worker?.user?.avatar ||
                  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"
                }
                alt={booking.worker?.user?.name}
                className="w-12 h-12 rounded-2xl object-cover border border-brand-500"
              />
              <div>
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {booking.worker?.user?.name || "Professional"}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <p className="text-[11px] text-slate-500">
                  {booking.worker?.user?.phone || "+91 9845012345"}
                </p>
                <div className="flex items-center space-x-1 text-[10px] text-amber-500 font-bold mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{booking.worker?.rating || 4.9}</span>
                  <span className="text-slate-400 font-normal">
                    ({booking.worker?.review_count || 120} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenChat(booking.id)}
                className="p-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/50 dark:hover:bg-brand-900/50 text-brand-600 dark:text-brand-400 transition-colors"
                title="Chat with Worker"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenChat(booking.id)}
                className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 transition-colors"
                title="Call Worker"
              >
                <Phone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <button
              onClick={() => onOpenInvoice(booking.id)}
              className="flex items-center space-x-1.5 text-brand-600 dark:text-brand-400 font-bold hover:underline"
            >
              <FileText className="w-4 h-4" />
              <span>GST Tax Invoice</span>
            </button>

            <button
              onClick={() => onOpenComplaint(booking.id)}
              className="flex items-center space-x-1.5 text-slate-500 hover:text-red-500 font-medium"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Raise Dispute / Help</span>
            </button>

            {currentStatus !== "completed" && currentStatus !== "cancelled" && (
              <button
                onClick={handleCancelBooking}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
