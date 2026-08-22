import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../database/db";
import { AuthRequest } from "../middleware/auth";
import { Complaint } from "../types";

export const createComplaint = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  const { booking_id, reason, description } = req.body;

  if (!booking_id || !reason || !description) {
    res.status(400).json({ success: false, message: "Booking, reason, and description are required" });
    return;
  }

  const user = db.users.find((u) => u.id === req.user?.id);

  const complaint: Complaint = {
    id: `cmp_${uuidv4().slice(0, 8)}`,
    booking_id,
    raised_by: req.user.id,
    raised_by_name: user?.name,
    reason,
    description,
    status: "open",
    created_at: new Date().toISOString(),
  };

  db.complaints.push(complaint);

  const booking = db.bookings.find((b) => b.id === booking_id);
  if (booking) {
    booking.status = "disputed";
  }

  db.save();

  res.status(201).json({
    success: true,
    message: "Complaint registered. Our support team will investigate within 2 hours.",
    data: complaint,
  });
};

export const getComplaints = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  let list: Complaint[] = [];
  if (req.user.role === "admin") {
    list = [...db.complaints];
  } else {
    list = db.complaints.filter((c) => c.raised_by === req.user?.id);
  }

  res.json({
    success: true,
    count: list.length,
    data: list,
  });
};
