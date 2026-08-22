import React, { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  Tag,
  Plus,
  Layers,
  Sparkles
} from "lucide-react";
import { User, WorkerProfile, Booking, Complaint, Category } from "../types";
import { api } from "../services/api";

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [pendingWorkers, setPendingWorkers] = useState<WorkerProfile[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "kyc" | "users" | "bookings" | "complaints" | "coupons">("overview");

  // New coupon state
  const [newCouponCode, setNewCouponCode] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [maxDiscount, setMaxDiscount] = useState<number>(200);

  const fetchAdminData = async () => {
    try {
      const [analyticsRes, pendingRes, usersRes, bkRes, cmpRes] = await Promise.all([
        api.get("/admin/analytics"),
        api.get("/admin/workers/pending"),
        api.get("/admin/users"),
        api.get("/bookings"),
        api.get("/complaints"),
      ]);

      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      if (pendingRes.data.success) setPendingWorkers(pendingRes.data.data);
      if (usersRes.data.success) setAllUsers(usersRes.data.data);
      if (bkRes.data.success) setBookings(bkRes.data.data);
      if (cmpRes.data.success) setComplaints(cmpRes.data.data);
    } catch (err) {
      console.error("Failed to load admin data", err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveKyc = async (workerId: string) => {
    try {
      const res = await api.put(`/admin/workers/${workerId}/approve`);
      if (res.data.success) {
        alert(res.data.message);
        fetchAdminData();
      }
    } catch {
      alert("Failed to approve worker");
    }
  };

  const handleRejectKyc = async (workerId: string) => {
    const reason = prompt("Enter rejection reason for worker:") || "Incomplete documentation";
    try {
      const res = await api.put(`/admin/workers/${workerId}/reject`, { reason });
      if (res.data.success) {
        alert(res.data.message);
        fetchAdminData();
      }
    } catch {
      alert("Failed to reject worker");
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-status`);
      if (res.data.success) {
        fetchAdminData();
      }
    } catch {
      alert("Failed to toggle status");
    }
  };

  const handleResolveComplaint = async (complaintId: string) => {
    const refund = prompt("Enter wallet refund amount (or 0 for no refund):", "200");
    const notes = prompt("Enter resolution notes:", "Investigated and credited customer wallet.");
    try {
      const res = await api.put(`/admin/complaints/${complaintId}/resolve`, {
        status: "resolved",
        resolution_notes: notes,
        refund_amount: Number(refund) || 0,
      });
      if (res.data.success) {
        alert(res.data.message);
        fetchAdminData();
      }
    } catch {
      alert("Failed to resolve complaint");
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    try {
      const res = await api.post("/admin/coupons", {
        code: newCouponCode,
        discount_percent: discountPercent,
        max_discount: maxDiscount,
      });
      if (res.data.success) {
        alert("Coupon code created successfully!");
        setNewCouponCode("");
      }
    } catch {
      alert("Failed to create coupon");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Admin Executive Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-indigo-900/50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center font-black text-xl shadow-lg">
            <Shield className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl font-black">HomeEase Admin Control Center</h1>
            <p className="text-xs text-indigo-300">
              Platform Governance, KYC Approvals, Financial Analytics & Moderation
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
            ● Production Live System
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs sm:text-sm font-bold overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 flex items-center space-x-1.5 transition-all ${
            activeTab === "overview"
              ? "border-b-2 border-purple-500 text-purple-600 dark:text-purple-400 font-black"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Platform Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("kyc")}
          className={`pb-3 flex items-center space-x-1.5 transition-all relative ${
            activeTab === "kyc"
              ? "border-b-2 border-purple-500 text-purple-600 dark:text-purple-400 font-black"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Shield className="w-4 h-4 text-amber-500" />
          <span>KYC Approval Queue</span>
          {pendingWorkers.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px]">
              {pendingWorkers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 flex items-center space-x-1.5 transition-all ${
            activeTab === "users"
              ? "border-b-2 border-purple-500 text-purple-600 dark:text-purple-400 font-black"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Moderation ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("bookings")}
          className={`pb-3 flex items-center space-x-1.5 transition-all ${
            activeTab === "bookings"
              ? "border-b-2 border-purple-500 text-purple-600 dark:text-purple-400 font-black"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Bookings ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("complaints")}
          className={`pb-3 flex items-center space-x-1.5 transition-all ${
            activeTab === "complaints"
              ? "border-b-2 border-purple-500 text-purple-600 dark:text-purple-400 font-black"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span>Disputes & Refunds ({complaints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("coupons")}
          className={`pb-3 flex items-center space-x-1.5 transition-all ${
            activeTab === "coupons"
              ? "border-b-2 border-purple-500 text-purple-600 dark:text-purple-400 font-black"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Coupons & Promos</span>
        </button>
      </div>

      {/* TAB 1: Overview Analytics */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Gross Merchandise Value</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                ₹{analytics?.metrics.totalRevenue || 4350}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">Total platform customer volume</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Platform Take Rate (15%)</span>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                ₹{analytics?.metrics.platformCommission || 652}
              </div>
              <span className="text-[10px] text-slate-400">Net platform revenue</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Active Workers</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {analytics?.metrics.approvedWorkers || 7} / {analytics?.metrics.workersCount || 8}
              </div>
              <span className="text-[10px] text-amber-500 font-semibold">
                {analytics?.metrics.pendingKycCount || 1} pending KYC approvals
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Bookings</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {analytics?.metrics.totalBookings || 3}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">
                {analytics?.metrics.completedBookings || 2} successfully completed
              </span>
            </div>
          </div>

          {/* Category Performance Breakdown */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Category Demand & GMV Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(analytics?.categoryStats || []).map((cat: any) => (
                <div
                  key={cat.category_id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                >
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                    {cat.category_name}
                  </span>
                  <div className="flex items-center justify-between text-xs mt-2 text-slate-500">
                    <span>{cat.bookings_count} bookings</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{cat.revenue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KYC Approval Queue */}
      {activeTab === "kyc" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Worker KYC Verification Queue ({pendingWorkers.length})
            </h3>
          </div>

          {pendingWorkers.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
              ✓ All worker KYC documents have been reviewed and approved!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-800 border-2 border-amber-300 dark:border-amber-700 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={worker.user?.avatar}
                      alt={worker.user?.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-amber-500"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">
                          {worker.user?.name}
                        </h4>
                        <span className="text-xs text-slate-500">({worker.city})</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {worker.bio}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-slate-500 mt-2 font-semibold">
                        <span>Aadhaar: {worker.aadhaar_number}</span>
                        <span>•</span>
                        <span>Exp: {worker.experience_years} yrs</span>
                        <span>•</span>
                        <span>Rate: ₹{worker.hourly_rate}/hr</span>
                      </div>
                      {worker.aadhaar_doc && (
                        <a
                          href={worker.aadhaar_doc}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block mt-2 text-xs text-brand-600 font-bold hover:underline"
                        >
                          📄 View Uploaded Aadhaar / ID Proof Document
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleRejectKyc(worker.id)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-red-600 font-bold text-xs rounded-2xl transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveKyc(worker.id)}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
                    >
                      Approve & Verify Pro
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: User Moderation */}
      {activeTab === "users" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft">
          <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">
            User Accounts Moderation ({allUsers.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-bold">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Phone / Email</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-3 flex items-center space-x-2">
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full" />
                      <span className="font-bold">{u.name}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 font-bold uppercase text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">{u.phone} • {u.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold ${
                            u.status === "active"
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                        >
                          {u.status === "active" ? "Suspend" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Bookings */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            All Platform Bookings ({bookings.length})
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {b.booking_ref} • {b.subcategory?.name || "Service"}
                  </span>
                  <p className="text-slate-500 mt-0.5">
                    Customer: {b.customer?.name} • Worker: {b.worker?.user?.name}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-black text-slate-900 dark:text-white">₹{b.final_amount}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 uppercase font-bold text-[10px]">
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Complaints */}
      {activeTab === "complaints" && (
        <div className="space-y-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Dispute & Refund Tickets ({complaints.length})
          </h3>
          {complaints.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-3xl text-xs text-slate-500">
              No open customer complaints.
            </div>
          ) : (
            complaints.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      #{c.id} • {c.reason}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">{c.description}</p>
                </div>

                {c.status === "open" && (
                  <button
                    onClick={() => handleResolveComplaint(c.id)}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-2xl shadow"
                  >
                    Resolve & Issue Refund
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 6: Coupons */}
      {activeTab === "coupons" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft space-y-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Create Discount Promo Code
          </h3>
          <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              required
              placeholder="COUPON CODE (e.g. DIWALI50)"
              value={newCouponCode}
              onChange={(e) => setNewCouponCode(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs uppercase font-bold"
            />
            <input
              type="number"
              required
              placeholder="Discount % (e.g. 25)"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <input
              type="number"
              required
              placeholder="Max Discount ₹ (e.g. 300)"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(Number(e.target.value))}
              className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <button
              type="submit"
              className="py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold text-xs shadow"
            >
              Create Coupon
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
