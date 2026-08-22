import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../database/db";
import { AuthRequest } from "../middleware/auth";
import { PaymentMethod } from "../types";

export const createPaymentOrder = (req: AuthRequest, res: Response): void => {
  const { amount, booking_id } = req.body;

  if (!amount) {
    res.status(400).json({ success: false, message: "Amount is required" });
    return;
  }

  // Simulated Razorpay Order ID
  const orderId = `order_${uuidv4().replace(/-/g, "").slice(0, 14)}`;

  res.json({
    success: true,
    data: {
      orderId,
      amount: Number(amount),
      currency: "INR",
      key: "rzp_test_HomeEaseIndiaDemo",
      booking_id,
    },
  });
};

export const verifyPayment = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const { booking_id, amount, payment_method = "upi", transaction_ref } = req.body;

  const payment = {
    id: `pay_${uuidv4().slice(0, 8)}`,
    booking_id,
    user_id: req.user.id,
    amount: Number(amount),
    payment_method: payment_method as PaymentMethod,
    transaction_ref: transaction_ref || `UPI/2026/${Math.floor(100000000 + Math.random() * 900000000)}`,
    status: "success" as const,
    gst_number: "29AABCH1234F1Z8",
    invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
    created_at: new Date().toISOString(),
  };

  db.payments.push(payment);

  const booking = db.bookings.find((b) => b.id === booking_id);
  if (booking) {
    booking.payment_status = "paid";
    booking.payment_method = payment_method as PaymentMethod;
  }

  db.save();

  res.json({
    success: true,
    message: "Payment verified successfully",
    data: payment,
  });
};

export const getInvoice = (req: AuthRequest, res: Response): void => {
  const { id } = req.params; // booking_id or payment_id

  const payment = db.payments.find((p) => p.booking_id === id || p.id === id);
  const booking = db.bookings.find((b) => b.id === id || b.id === payment?.booking_id);

  if (!booking) {
    res.status(404).json({ success: false, message: "Invoice / Booking not found" });
    return;
  }

  const customer = db.users.find((u) => u.id === booking.customer_id);
  const worker = db.workers.find((w) => w.id === booking.worker_id);
  const workerUser = worker ? db.users.find((u) => u.id === worker.user_id) : undefined;
  const subcategory = db.subcategories.find((s) => s.id === booking.subcategory_id);

  const invoice = {
    invoice_number: payment?.invoice_number || `INV-${new Date().getFullYear()}-00912`,
    date: payment?.created_at || booking.created_at,
    gstin: "29AABCH1234F1Z8",
    sac_code: "998719", // Maintenance and repair services
    company: {
      name: "HomeEase India Hyperlocal Services Pvt. Ltd.",
      address: "Embassy TechVillage, Outer Ring Road, Devarabisanahalli, Bengaluru, Karnataka 560103",
      email: "billing@homeease.in",
      phone: "+91 (80) 4123-8899",
    },
    customer: {
      name: customer?.name || "Customer",
      email: customer?.email || "customer@example.com",
      phone: customer?.phone || "+91 9800000000",
      address: booking.address,
      city: booking.city,
    },
    worker: {
      name: workerUser?.name || "Professional",
      phone: workerUser?.phone,
      service: subcategory?.name || "Home Service",
    },
    booking_ref: booking.booking_ref,
    service_date: `${booking.scheduled_date} ${booking.scheduled_time}`,
    items: [
      {
        description: subcategory?.name || "Home Service",
        rate: booking.total_amount,
        quantity: 1,
        amount: booking.total_amount,
      },
    ],
    subtotal: booking.total_amount,
    discount: booking.discount_amount,
    taxable_amount: Math.max(0, booking.total_amount - booking.discount_amount),
    cgst_rate: "9%",
    cgst_amount: Math.round(booking.tax_amount / 2),
    sgst_rate: "9%",
    sgst_amount: Math.round(booking.tax_amount / 2),
    total_amount: booking.final_amount,
    payment_method: payment?.payment_method || booking.payment_method,
    payment_status: payment?.status || booking.payment_status,
    transaction_ref: payment?.transaction_ref || "N/A",
  };

  res.json({
    success: true,
    data: invoice,
  });
};

export const getWallet = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  let wallet = db.wallets.find((w) => w.user_id === req.user?.id);
  if (!wallet) {
    wallet = {
      id: `wal_${uuidv4().slice(0, 8)}`,
      user_id: req.user.id,
      balance: 100,
      loyalty_points: 50,
    };
    db.wallets.push(wallet);
    db.save();
  }

  const transactions = db.wallet_transactions.filter((t) => t.user_id === req.user?.id);
  transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({
    success: true,
    data: {
      wallet,
      transactions,
    },
  });
};

export const withdrawWalletFunds = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const { amount, upi_id, bank_account } = req.body;
  const withdrawAmount = Number(amount);

  if (!withdrawAmount || withdrawAmount <= 0) {
    res.status(400).json({ success: false, message: "Valid withdrawal amount required" });
    return;
  }

  const wallet = db.wallets.find((w) => w.user_id === req.user?.id);
  if (!wallet || wallet.balance < withdrawAmount) {
    res.status(400).json({ success: false, message: "Insufficient wallet balance" });
    return;
  }

  wallet.balance -= withdrawAmount;

  const tx = {
    id: `wt_${uuidv4().slice(0, 8)}`,
    wallet_id: wallet.id,
    user_id: req.user.id,
    amount: withdrawAmount,
    type: "withdrawal" as const,
    description: `Withdrawal to ${upi_id || bank_account || "Linked UPI"}`,
    created_at: new Date().toISOString(),
  };

  db.wallet_transactions.push(tx);
  db.save();

  res.json({
    success: true,
    message: `₹${withdrawAmount} withdrawal initiated successfully to ${upi_id || "Bank Account"}. Expected credit within 15 minutes.`,
    data: {
      new_balance: wallet.balance,
      transaction: tx,
    },
  });
};
