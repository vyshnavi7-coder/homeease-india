import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  X,
  CheckCircle2,
  Clock,
  Calendar,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Upload,
  CreditCard,
  QrCode,
  Wallet as WalletIcon,
  Banknote,
  Tag,
  ArrowRight,
  Sparkles,
  MapPin
} from "lucide-react";
import { WorkerProfile, Subcategory, BookingType, PaymentMethod, Booking } from "../types";
import { useAuth } from "../context/AuthContext";
import { useLocationContext } from "../context/LocationContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker?: WorkerProfile;
  initialSubcategory?: Subcategory;
  subcategories?: Subcategory[];
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  worker,
  initialSubcategory,
  subcategories = [],
  onBookingSuccess,
}) => {
  const { user, wallet } = useAuth();
  const { cityName, addressText, lat, lng } = useLocationContext();
  const { t } = useLanguage();

  const [step, setStep] = useState<number>(1);
  const [selectedSubId, setSelectedSubId] = useState<string>("");
  const [bookingType, setBookingType] = useState<BookingType>("instant");
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [scheduledTime, setScheduledTime] = useState<string>("11:00 AM");
  const [address, setAddress] = useState<string>(addressText);
  const [notes, setNotes] = useState<string>("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (initialSubcategory) {
      setSelectedSubId(initialSubcategory.id);
    } else if (worker?.services && worker.services.length > 0) {
      setSelectedSubId(worker.services[0].subcategory_id);
    } else if (subcategories.length > 0) {
      setSelectedSubId(subcategories[0].id);
    }
  }, [initialSubcategory, worker, subcategories]);

  useEffect(() => {
    setAddress(addressText);
  }, [addressText]);

  if (!isOpen) return null;

  // Selected subcategory
  const activeSubcategory =
    subcategories.find((s) => s.id === selectedSubId) ||
    worker?.services?.find((ws) => ws.subcategory_id === selectedSubId)?.subcategory;

  // Price calculations
  const workerCustomService = worker?.services?.find((ws) => ws.subcategory_id === selectedSubId);
  const basePrice =
    workerCustomService?.custom_price || activeSubcategory?.base_price || worker?.hourly_rate || 499;

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    const code = couponCode.toUpperCase().trim();
    if (code === "HOMEEASE50") {
      const disc = Math.min(Math.round(basePrice * 0.5), 250);
      setDiscountAmount(disc);
      setAppliedCoupon(code);
    } else if (code === "WELCOME100") {
      setDiscountAmount(100);
      setAppliedCoupon(code);
    } else if (code === "FESTIVE20") {
      const disc = Math.min(Math.round(basePrice * 0.2), 500);
      setDiscountAmount(disc);
      setAppliedCoupon(code);
    } else {
      alert("Invalid coupon code. Try HOMEEASE50 or WELCOME100");
    }
  };

  const taxableAmount = Math.max(0, basePrice - discountAmount);
  const gstAmount = Math.round(taxableAmount * 0.18); // 18% GST
  const finalTotal = taxableAmount + gstAmount;

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setMediaUrls((prev) => [...prev, res.data.fileUrl]);
      }
    } catch {
      // Use client preview fallback
      const mockUrl = URL.createObjectURL(file);
      setMediaUrls((prev) => [...prev, mockUrl]);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedSubId || !worker) {
      alert("Please select a service and worker");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        worker_id: worker.id,
        subcategory_id: selectedSubId,
        booking_type: bookingType,
        scheduled_date: scheduledDate,
        scheduled_time: bookingType === "instant" ? "Immediate / ASAP" : scheduledTime,
        address,
        city: cityName,
        lat,
        lng,
        coupon_code: appliedCoupon,
        notes,
        media_urls: mediaUrls,
        payment_method: paymentMethod,
      };

      const res = await api.post("/bookings", payload);
      if (res.data.success) {
        setConfirmedBooking(res.data.data);
        setStep(4); // Confirmed screen
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
        onBookingSuccess(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Booking creation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
              HE
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {step === 4 ? "Booking Confirmed! 🎉" : "Book Service with HomeEase"}
              </h3>
              <p className="text-[11px] text-slate-500">
                {step < 4 ? `Step ${step} of 3` : "Worker assigned & dispatched"}
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

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP 1: Service & Time Slot */}
          {step === 1 && (
            <div className="space-y-4">
              {worker && (
                <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900">
                  <img
                    src={worker.user?.avatar}
                    alt={worker.user?.name}
                    className="w-12 h-12 rounded-xl object-cover border border-brand-400"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {worker.user?.name}
                      </span>
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      ★ {worker.rating} • {worker.experience_years} yrs exp • {cityName}
                    </p>
                  </div>
                </div>
              )}

              {/* Service Subcategory Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Specific Service
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-44 overflow-y-auto pr-1">
                  {(worker?.services?.map((ws) => ws.subcategory) || subcategories).map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubId(sub.id)}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        selectedSubId === sub.id
                          ? "border-brand-500 bg-brand-50/40 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 shadow-sm"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs">{sub.name}</div>
                        <div className="text-[10px] text-slate-400">{sub.description}</div>
                      </div>
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        ₹{sub.base_price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Booking Type: Instant vs Scheduled vs Emergency */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Timing Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setBookingType("instant")}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      bookingType === "instant"
                        ? "border-brand-500 bg-brand-500 text-white shadow-md shadow-brand-500/25"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Zap className="w-4 h-4 mx-auto mb-1 text-amber-300" />
                    <span>Instant (15m)</span>
                  </button>

                  <button
                    onClick={() => setBookingType("scheduled")}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      bookingType === "scheduled"
                        ? "border-brand-500 bg-brand-500 text-white shadow-md shadow-brand-500/25"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Calendar className="w-4 h-4 mx-auto mb-1 text-white" />
                    <span>Schedule Slot</span>
                  </button>

                  <button
                    onClick={() => setBookingType("emergency")}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      bookingType === "emergency"
                        ? "border-red-500 bg-red-600 text-white shadow-md shadow-red-500/25"
                        : "border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-amber-300" />
                    <span>Emergency SOS</span>
                  </button>
                </div>
              </div>

              {bookingType === "scheduled" && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Date</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Time Slot</label>
                    <select
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <option>09:00 AM - 11:00 AM</option>
                      <option>11:00 AM - 01:00 PM</option>
                      <option>02:00 PM - 04:00 PM</option>
                      <option>04:00 PM - 06:00 PM</option>
                      <option>06:00 PM - 08:00 PM</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all"
              >
                <span>Continue to Address & Notes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Address, Notes, Media Upload */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-500" />
                  <span>Service Address ({cityName})</span>
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  placeholder="House/Flat No., Apartment name, Street, Landmark..."
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Job Instructions / Problem Description
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Bring extra wiring or switchboard; AC making loud noise; 3 BHK deep clean..."
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Upload Photos/Videos of Issue */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Upload Problem Photos / Video (Optional)
                </label>
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-brand-500" />
                    <span>Upload Media</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleUploadPhoto}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {mediaUrls.length} file(s) attached
                  </span>
                </div>

                {mediaUrls.length > 0 && (
                  <div className="flex items-center space-x-2 mt-2">
                    {mediaUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="attachment"
                        className="w-12 h-12 rounded-xl object-cover border border-brand-500"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="w-2/3 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all"
                >
                  <span>Proceed to Payment & Offers</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Offers, Pricing & Payment */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Promo code box */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                <label className="block text-xs font-bold text-amber-900 dark:text-amber-300 mb-1.5 flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Have a Promo Code?</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="e.g. HOMEEASE50"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-xs uppercase font-bold"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Coupon {appliedCoupon} applied! ₹{discountAmount} discount saved.</span>
                  </p>
                )}
              </div>

              {/* Price Breakdown Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Item Base Rate ({activeSubcategory?.name || "Service"}):</span>
                  <span className="font-semibold text-slate-900 dark:text-white">₹{basePrice}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-semibold">
                    <span>Discount Coupon ({appliedCoupon}):</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>GST (18% Official Tax Invoice):</span>
                  <span className="font-semibold text-slate-900 dark:text-white">₹{gstAmount}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex items-center justify-between text-sm font-extrabold text-slate-900 dark:text-white">
                  <span>Total Amount:</span>
                  <span className="text-base text-brand-600 dark:text-brand-400">₹{finalTotal}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod("upi")}
                    className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all ${
                      paymentMethod === "upi"
                        ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-indigo-500" />
                    <div>
                      <div className="font-bold text-xs">UPI / GPay / PhonePe</div>
                      <div className="text-[10px] text-slate-400">Instant QR & VPA</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all ${
                      paymentMethod === "card"
                        ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-bold text-xs">Debit / Credit Card</div>
                      <div className="text-[10px] text-slate-400">Visa, RuPay, Master</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("wallet")}
                    className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all ${
                      paymentMethod === "wallet"
                        ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <WalletIcon className="w-5 h-5 text-emerald-500" />
                    <div>
                      <div className="font-bold text-xs">HomeEase Wallet</div>
                      <div className="text-[10px] text-slate-400">Balance: ₹{wallet?.balance || 0}</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all ${
                      paymentMethod === "cash"
                        ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-amber-500" />
                    <div>
                      <div className="font-bold text-xs">Cash on Delivery</div>
                      <div className="text-[10px] text-slate-400">Pay after service</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting}
                  className="w-2/3 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isSubmitting ? "Dispatching Pro..." : `Pay ₹${finalTotal} & Book`}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success & Confirmed OTP Screen */}
          {step === 4 && confirmedBooking && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-500 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  Booking Confirmed!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Booking Ref: <span className="font-bold text-brand-600">{confirmedBooking.booking_ref}</span>
                </p>
              </div>

              {/* 4-digit OTP Highlight */}
              <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 max-w-xs mx-auto">
                <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                  Share this 4-Digit OTP with Worker on Arrival
                </p>
                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-widest mt-1">
                  {confirmedBooking.otp_start_code}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Do not share OTP before the professional reaches your home.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-brand-500/25 transition-all"
                >
                  Go to Live Tracking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
