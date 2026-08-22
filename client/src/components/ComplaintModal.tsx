import React, { useState } from "react";
import { X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { api } from "../services/api";

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({ isOpen, onClose, bookingId }) => {
  const [reason, setReason] = useState<string>("Quality of Service");
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!description.trim()) {
      alert("Please provide details of your complaint.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/complaints", {
        booking_id: bookingId,
        reason,
        description,
      });
      if (res.data.success) {
        setTicketId(res.data.data.id);
      }
    } catch {
      alert("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Raise Dispute / Complaint
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {ticketId ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-black text-sm text-slate-900 dark:text-white">
                Ticket Registered #{ticketId}
              </h4>
              <p className="text-xs text-slate-500">
                Our customer resolution manager is reviewing your complaint. We guarantee resolution or 100% wallet refund within 2 hours.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-brand-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-brand-500/25"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Reason for Complaint
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-brand-500"
                >
                  <option>Worker Delayed / Did Not Arrive</option>
                  <option>Poor Quality of Work</option>
                  <option>Demanded Extra Cash</option>
                  <option>Unprofessional Behavior</option>
                  <option>Damage to Property</option>
                  <option>Other Issues</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Describe what happened
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Please describe the issue in detail..."
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-red-600/25 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Complaint"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
