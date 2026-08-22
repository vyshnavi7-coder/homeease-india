import { Router } from "express";
import * as authController from "../controllers/authController";
import * as categoryController from "../controllers/categoryController";
import * as workerController from "../controllers/workerController";
import * as bookingController from "../controllers/bookingController";
import * as paymentController from "../controllers/paymentController";
import * as reviewController from "../controllers/reviewController";
import * as complaintController from "../controllers/complaintController";
import * as chatController from "../controllers/chatController";
import * as adminController from "../controllers/adminController";
import * as bannerCouponController from "../controllers/bannerCouponController";
import { authenticateToken, requireRole, upload } from "../middleware/auth";

const router = Router();

// 1. Auth routes
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/send-otp", authController.sendOtp);
router.post("/auth/verify-otp", authController.verifyOtp);
router.post("/auth/google", authController.googleAuth);
router.get("/auth/demo/:role", authController.demoLogin);
router.get("/auth/me", authenticateToken, authController.getMe);
router.put("/auth/profile", authenticateToken, authController.updateProfile);

// 2. Categories & Subcategories
router.get("/categories", categoryController.getCategories);
router.get("/categories/:slug", categoryController.getCategoryBySlug);
router.get("/subcategories", categoryController.getSubcategories);

// 3. Workers
router.get("/workers", workerController.getWorkers);
router.get("/workers/:id", workerController.getWorkerById);
router.put("/workers/profile", authenticateToken, workerController.updateWorkerProfile);
router.post("/workers/kyc", authenticateToken, workerController.uploadKycDocuments);

// 4. Bookings
router.post("/bookings", authenticateToken, bookingController.createBooking);
router.get("/bookings", authenticateToken, bookingController.getBookings);
router.get("/bookings/:id", authenticateToken, bookingController.getBookingById);
router.put("/bookings/:id/status", authenticateToken, bookingController.updateBookingStatus);
router.put("/bookings/:id/location", authenticateToken, bookingController.updateWorkerLiveLocation);

// 5. Payments, Invoices, & Wallet
router.post("/payments/create-order", authenticateToken, paymentController.createPaymentOrder);
router.post("/payments/verify", authenticateToken, paymentController.verifyPayment);
router.get("/payments/invoice/:id", authenticateToken, paymentController.getInvoice);
router.get("/wallet", authenticateToken, paymentController.getWallet);
router.post("/wallet/withdraw", authenticateToken, paymentController.withdrawWalletFunds);

// 6. Reviews
router.post("/reviews", authenticateToken, reviewController.createReview);
router.put("/reviews/:id/reply", authenticateToken, reviewController.replyToReview);

// 7. Complaints
router.post("/complaints", authenticateToken, complaintController.createComplaint);
router.get("/complaints", authenticateToken, complaintController.getComplaints);

// 8. Chat
router.get("/chat/:booking_id", authenticateToken, chatController.getChatMessages);
router.post("/chat", authenticateToken, chatController.sendChatMessage);

// 9. Admin routes
router.get("/admin/analytics", authenticateToken, requireRole(["admin"]), adminController.getAdminAnalytics);
router.get("/admin/workers/pending", authenticateToken, requireRole(["admin"]), adminController.getPendingKycWorkers);
router.put("/admin/workers/:id/approve", authenticateToken, requireRole(["admin"]), adminController.approveWorkerKyc);
router.put("/admin/workers/:id/reject", authenticateToken, requireRole(["admin"]), adminController.rejectWorkerKyc);
router.put("/admin/users/:id/toggle-status", authenticateToken, requireRole(["admin"]), adminController.toggleUserStatus);
router.get("/admin/users", authenticateToken, requireRole(["admin"]), adminController.getAllUsers);
router.put("/admin/complaints/:id/resolve", authenticateToken, requireRole(["admin"]), adminController.resolveComplaint);
router.post("/admin/coupons", authenticateToken, requireRole(["admin"]), adminController.createCoupon);
router.post("/admin/categories", authenticateToken, requireRole(["admin"]), adminController.createCategory);

// 10. Public Banners & Coupons
router.get("/banners", bannerCouponController.getBanners);
router.get("/coupons", bannerCouponController.getCoupons);

// 11. Media Upload
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: "No file uploaded" });
    return;
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    fileUrl,
    filename: req.file.filename,
  });
});

export default router;
