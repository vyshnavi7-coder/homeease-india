import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../database/db";
import { AuthRequest } from "../middleware/auth";
import { Category, Subcategory, Coupon, Banner } from "../types";

export const getAdminAnalytics = (_req: AuthRequest, res: Response): void => {
  const totalUsers = db.users.length;
  const customersCount = db.users.filter((u) => u.role === "customer").length;
  const workersCount = db.workers.length;
  const approvedWorkers = db.workers.filter((w) => w.is_approved).length;
  const pendingKycCount = db.workers.filter((w) => !w.is_approved).length;

  const totalBookings = db.bookings.length;
  const completedBookings = db.bookings.filter((b) => b.status === "completed").length;
  const activeBookings = db.bookings.filter((b) =>
    ["pending", "accepted", "en_route", "in_progress"].includes(b.status)
  ).length;

  const totalRevenue = db.payments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + p.amount, 0);

  const platformCommission = Math.round(totalRevenue * 0.15); // 15% platform take rate
  const openComplaints = db.complaints.filter((c) => c.status === "open").length;

  // Category performance
  const categoryStats = db.categories.map((cat) => {
    const subIds = db.subcategories.filter((s) => s.category_id === cat.id).map((s) => s.id);
    const catBookings = db.bookings.filter((b) => subIds.includes(b.subcategory_id));
    const revenue = catBookings.reduce((sum, b) => sum + b.final_amount, 0);
    return {
      category_id: cat.id,
      category_name: cat.name,
      bookings_count: catBookings.length,
      revenue,
    };
  });

  res.json({
    success: true,
    data: {
      metrics: {
        totalUsers,
        customersCount,
        workersCount,
        approvedWorkers,
        pendingKycCount,
        totalBookings,
        completedBookings,
        activeBookings,
        totalRevenue,
        platformCommission,
        openComplaints,
      },
      categoryStats,
      recentBookings: db.bookings.slice(-5).reverse(),
    },
  });
};

export const getPendingKycWorkers = (_req: AuthRequest, res: Response): void => {
  const pending = db.workers
    .filter((w) => !w.is_approved)
    .map((worker) => {
      const user = db.users.find((u) => u.id === worker.user_id);
      return {
        ...worker,
        user,
      };
    });

  res.json({
    success: true,
    count: pending.length,
    data: pending,
  });
};

export const approveWorkerKyc = (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const worker = db.workers.find((w) => w.id === id);

  if (!worker) {
    res.status(404).json({ success: false, message: "Worker not found" });
    return;
  }

  worker.is_approved = true;
  const user = db.users.find((u) => u.id === worker.user_id);
  if (user) {
    user.is_verified = true;
  }

  db.save();

  res.json({
    success: true,
    message: `Worker ${user?.name || worker.id} KYC verified and approved!`,
    data: worker,
  });
};

export const rejectWorkerKyc = (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const { reason } = req.body;

  const worker = db.workers.find((w) => w.id === id);
  if (!worker) {
    res.status(404).json({ success: false, message: "Worker not found" });
    return;
  }

  worker.is_approved = false;
  db.save();

  res.json({
    success: true,
    message: `Worker KYC rejected: ${reason || "Incomplete documentation"}`,
    data: worker,
  });
};

export const toggleUserStatus = (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const user = db.users.find((u) => u.id === id);

  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  user.status = user.status === "active" ? "suspended" : "active";
  db.save();

  res.json({
    success: true,
    message: `User status changed to ${user.status}`,
    data: user,
  });
};

export const getAllUsers = (_req: AuthRequest, res: Response): void => {
  const users = db.users.map((u) => {
    const { password: _, ...clean } = u;
    const worker = u.role === "worker" ? db.workers.find((w) => w.user_id === u.id) : undefined;
    return {
      ...clean,
      worker,
    };
  });

  res.json({
    success: true,
    count: users.length,
    data: users,
  });
};

export const resolveComplaint = (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const { status = "resolved", resolution_notes, refund_amount } = req.body;

  const complaint = db.complaints.find((c) => c.id === id);
  if (!complaint) {
    res.status(404).json({ success: false, message: "Complaint not found" });
    return;
  }

  complaint.status = status;
  complaint.resolution_notes = resolution_notes;

  // If refund requested, credit customer wallet
  if (refund_amount && Number(refund_amount) > 0) {
    const refund = Number(refund_amount);
    let wallet = db.wallets.find((w) => w.user_id === complaint.raised_by);
    if (!wallet) {
      wallet = { id: `wal_${uuidv4().slice(0, 8)}`, user_id: complaint.raised_by, balance: 0, loyalty_points: 0 };
      db.wallets.push(wallet);
    }
    wallet.balance += refund;
    db.wallet_transactions.push({
      id: `wt_${uuidv4().slice(0, 8)}`,
      wallet_id: wallet.id,
      user_id: complaint.raised_by,
      amount: refund,
      type: "credit",
      description: `Dispute refund for complaint #${complaint.id}`,
      created_at: new Date().toISOString(),
    });
  }

  db.save();

  res.json({
    success: true,
    message: `Complaint marked as ${status}`,
    data: complaint,
  });
};

export const createCoupon = (req: AuthRequest, res: Response): void => {
  const { code, discount_percent, max_discount, min_order, valid_till } = req.body;

  if (!code || !discount_percent) {
    res.status(400).json({ success: false, message: "Coupon code and discount percent required" });
    return;
  }

  const newCoupon: Coupon = {
    id: `cp_${uuidv4().slice(0, 8)}`,
    code: code.toUpperCase(),
    discount_percent: Number(discount_percent),
    max_discount: Number(max_discount) || 200,
    min_order: Number(min_order) || 299,
    valid_till: valid_till || "2026-12-31",
    is_active: true,
  };

  db.coupons.push(newCoupon);
  db.save();

  res.status(201).json({
    success: true,
    message: "Coupon created",
    data: newCoupon,
  });
};

export const createCategory = (req: AuthRequest, res: Response): void => {
  const { name, slug, icon, description, banner_image } = req.body;

  if (!name || !slug) {
    res.status(400).json({ success: false, message: "Category name and slug required" });
    return;
  }

  const newCat: Category = {
    id: `cat_${uuidv4().slice(0, 8)}`,
    name,
    slug,
    icon: icon || "Sparkles",
    description: description || "",
    banner_image: banner_image || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    sort_order: db.categories.length + 1,
  };

  db.categories.push(newCat);
  db.save();

  res.status(201).json({
    success: true,
    message: "Category added",
    data: newCat,
  });
};
