import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../database/db";
import { AuthRequest } from "../middleware/auth";
import { Review } from "../types";

export const createReview = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  const { booking_id, rating, comment, photos = [] } = req.body;

  if (!booking_id || !rating || !comment) {
    res.status(400).json({ success: false, message: "Booking, rating, and review comment are required" });
    return;
  }

  const booking = db.bookings.find((b) => b.id === booking_id);
  if (!booking) {
    res.status(404).json({ success: false, message: "Booking not found" });
    return;
  }

  const customer = db.users.find((u) => u.id === req.user?.id);
  const worker = db.workers.find((w) => w.id === booking.worker_id);

  const newReview: Review = {
    id: `rev_${uuidv4().slice(0, 8)}`,
    booking_id: booking.id,
    customer_id: req.user.id,
    worker_id: booking.worker_id,
    customer_name: customer?.name || "Customer",
    customer_avatar: customer?.avatar || "",
    rating: Number(rating),
    comment,
    photos: Array.isArray(photos) ? photos : [],
    is_verified: true,
    created_at: new Date().toISOString(),
  };

  db.reviews.push(newReview);

  // Recalculate worker average rating
  if (worker) {
    const workerReviews = db.reviews.filter((r) => r.worker_id === worker.id);
    const totalRating = workerReviews.reduce((sum, r) => sum + r.rating, 0);
    worker.rating = Math.round((totalRating / workerReviews.length) * 10) / 10;
    worker.review_count = workerReviews.length;
  }

  db.save();

  res.status(201).json({
    success: true,
    message: "Thank you! Your verified review has been published.",
    data: newReview,
  });
};

export const replyToReview = (req: AuthRequest, res: Response): void => {
  if (!req.user || req.user.role !== "worker") {
    res.status(403).json({ success: false, message: "Only workers can reply to reviews" });
    return;
  }

  const { id } = req.params;
  const { reply } = req.body;

  const review = db.reviews.find((r) => r.id === id);
  if (!review) {
    res.status(404).json({ success: false, message: "Review not found" });
    return;
  }

  review.worker_reply = reply;
  db.save();

  res.json({
    success: true,
    message: "Reply saved",
    data: review,
  });
};
