import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../database/db";
import { AuthRequest } from "../middleware/auth";
import { Booking, BookingStatus, BookingType, PaymentMethod } from "../types";
import { getSocketIO } from "../sockets/socketHandler";

export const createBooking = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  const {
    worker_id,
    subcategory_id,
    booking_type = "instant",
    scheduled_date,
    scheduled_time,
    address,
    city = "Bengaluru",
    lat,
    lng,
    coupon_code,
    notes,
    media_urls = [],
    payment_method = "upi",
  } = req.body;

  if (!worker_id || !subcategory_id || !address) {
    res.status(400).json({ success: false, message: "Worker, service, and address are required" });
    return;
  }

  const worker = db.workers.find((w) => w.id === worker_id);
  if (!worker) {
    res.status(404).json({ success: false, message: "Worker not found" });
    return;
  }

  const subcategory = db.subcategories.find((s) => s.id === subcategory_id);
  if (!subcategory) {
    res.status(404).json({ success: false, message: "Service subcategory not found" });
    return;
  }

  // Calculate pricing
  const workerService = db.worker_services.find(
    (ws) => ws.worker_id === worker.id && ws.subcategory_id === subcategory.id
  );
  const basePrice = workerService?.custom_price || subcategory.base_price || worker.hourly_rate;

  let discount = 0;
  if (coupon_code) {
    const coupon = db.coupons.find(
      (c) => c.code.toUpperCase() === coupon_code.toUpperCase() && c.is_active
    );
    if (coupon && basePrice >= coupon.min_order) {
      const calculated = (basePrice * coupon.discount_percent) / 100;
      discount = Math.min(calculated, coupon.max_discount);
    }
  }

  const discountedAmount = Math.max(0, basePrice - discount);
  const tax = Math.round(discountedAmount * 0.18); // 18% GST in India
  const finalAmount = discountedAmount + tax;

  // Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const bookingRef = `HE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newBooking: Booking = {
    id: `bk_${uuidv4().slice(0, 8)}`,
    booking_ref: bookingRef,
    customer_id: req.user.id,
    worker_id: worker.id,
    subcategory_id: subcategory.id,
    status: "pending",
    booking_type: booking_type as BookingType,
    scheduled_date: scheduled_date || new Date().toISOString().split("T")[0],
    scheduled_time: scheduled_time || "Immediate / ASAP",
    address,
    city,
    lat: Number(lat) || 12.9782,
    lng: Number(lng) || 77.6408,
    total_amount: basePrice,
    discount_amount: discount,
    tax_amount: tax,
    final_amount: finalAmount,
    payment_status: payment_method === "cash" ? "pending" : "paid",
    payment_method: payment_method as PaymentMethod,
    otp_start_code: otp,
    notes,
    media_urls: Array.isArray(media_urls) ? media_urls : [],
    current_worker_lat: worker.lat,
    current_worker_lng: worker.lng,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.bookings.push(newBooking);

  // If paid immediately via online method, create payment record
  if (payment_method !== "cash") {
    db.payments.push({
      id: `pay_${uuidv4().slice(0, 8)}`,
      booking_id: newBooking.id,
      user_id: req.user.id,
      amount: finalAmount,
      payment_method: payment_method as PaymentMethod,
      transaction_ref: `UPI/${new Date().getFullYear()}/${newBooking.booking_ref.replace("-", "")}`,
      status: "success",
      gst_number: "29AABCH1234F1Z8",
      invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      created_at: new Date().toISOString(),
    });
  }

  db.save();

  // Socket notification to worker
  const io = getSocketIO();
  if (io) {
    const customer = db.users.find((u) => u.id === req.user?.id);
    io.emit(`worker_notification_${worker.id}`, {
      type: "NEW_BOOKING",
      booking: {
        ...newBooking,
        customer,
        subcategory,
      },
    });
  }

  res.status(201).json({
    success: true,
    message: "Booking requested successfully",
    data: newBooking,
  });
};

export const getBookings = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  let userBookings: Booking[] = [];

  if (req.user.role === "admin") {
    userBookings = [...db.bookings];
  } else if (req.user.role === "worker") {
    const worker = db.workers.find((w) => w.user_id === req.user?.id);
    if (worker) {
      userBookings = db.bookings.filter((b) => b.worker_id === worker.id);
    }
  } else {
    userBookings = db.bookings.filter((b) => b.customer_id === req.user?.id);
  }

  const populated = userBookings.map((b) => {
    const customer = db.users.find((u) => u.id === b.customer_id);
    const worker = db.workers.find((w) => w.id === b.worker_id);
    const workerUser = worker ? db.users.find((u) => u.id === worker.user_id) : undefined;
    const subcategory = db.subcategories.find((s) => s.id === b.subcategory_id);

    return {
      ...b,
      customer,
      worker: worker ? { ...worker, user: workerUser } : undefined,
      subcategory,
    };
  });

  // Sort by latest created
  populated.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({
    success: true,
    count: populated.length,
    data: populated,
  });
};

export const getBookingById = (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const booking = db.bookings.find((b) => b.id === id || b.booking_ref === id);

  if (!booking) {
    res.status(404).json({ success: false, message: "Booking not found" });
    return;
  }

  const customer = db.users.find((u) => u.id === booking.customer_id);
  const worker = db.workers.find((w) => w.id === booking.worker_id);
  const workerUser = worker ? db.users.find((u) => u.id === worker.user_id) : undefined;
  const subcategory = db.subcategories.find((s) => s.id === booking.subcategory_id);
  const payment = db.payments.find((p) => p.booking_id === booking.id);
  const review = db.reviews.find((r) => r.booking_id === booking.id);

  res.json({
    success: true,
    data: {
      ...booking,
      customer,
      worker: worker ? { ...worker, user: workerUser } : undefined,
      subcategory,
      payment,
      review,
    },
  });
};

export const updateBookingStatus = (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const { status, otp_code } = req.body;

  const booking = db.bookings.find((b) => b.id === id);
  if (!booking) {
    res.status(404).json({ success: false, message: "Booking not found" });
    return;
  }

  // If moving to in_progress, verify OTP
  if (status === "in_progress") {
    if (!otp_code || otp_code !== booking.otp_start_code) {
      res.status(400).json({ success: false, message: "Invalid 4-digit OTP provided by customer" });
      return;
    }
  }

  // If moving to completed, credit worker wallet
  if (status === "completed" && booking.status !== "completed") {
    const worker = db.workers.find((w) => w.id === booking.worker_id);
    if (worker) {
      const workerWallet = db.wallets.find((wal) => wal.user_id === worker.user_id);
      if (workerWallet) {
        const workerEarning = Math.round(booking.total_amount * 0.85); // 85% payout (15% platform fee)
        workerWallet.balance += workerEarning;
        db.wallet_transactions.push({
          id: `wt_${uuidv4().slice(0, 8)}`,
          wallet_id: workerWallet.id,
          user_id: worker.user_id,
          amount: workerEarning,
          type: "credit",
          description: `Payout for booking ${booking.booking_ref}`,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  booking.status = status as BookingStatus;
  booking.updated_at = new Date().toISOString();
  db.save();

  // Broadcast socket event
  const io = getSocketIO();
  if (io) {
    io.emit(`booking_update_${booking.id}`, {
      bookingId: booking.id,
      status: booking.status,
      updated_at: booking.updated_at,
    });
  }

  res.json({
    success: true,
    message: `Booking status updated to ${status}`,
    data: booking,
  });
};

export const updateWorkerLiveLocation = (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const { lat, lng } = req.body;

  const booking = db.bookings.find((b) => b.id === id);
  if (!booking) {
    res.status(404).json({ success: false, message: "Booking not found" });
    return;
  }

  booking.current_worker_lat = Number(lat);
  booking.current_worker_lng = Number(lng);
  db.save();

  const io = getSocketIO();
  if (io) {
    io.emit(`worker_live_location_${booking.id}`, {
      lat: booking.current_worker_lat,
      lng: booking.current_worker_lng,
    });
  }

  res.json({ success: true });
};
