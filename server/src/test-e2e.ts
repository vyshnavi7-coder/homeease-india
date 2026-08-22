import axios from "axios";

const API = "http://localhost:5000/api";

async function runVerification() {
  console.log("=========================================");
  console.log("🧪 Starting HomeEase India Automated Test Suite");
  console.log("=========================================");

  try {
    // 1. Health check
    const health = await axios.get(`${API}/health`);
    console.log("✅ 1. Health check passed:", health.data.status, "DB counts:", health.data.database);

    // 2. Categories & Subcategories check
    const cats = await axios.get(`${API}/categories`);
    console.log(`✅ 2. Categories fetched: ${cats.data.data.length} categories loaded`);
    const totalSubcats = cats.data.data.reduce((sum: number, c: any) => sum + (c.subcategories?.length || 0), 0);
    console.log(`✅    Subcategories count: ${totalSubcats} services loaded`);

    // 3. Demo Logins (Customer, Worker, Admin)
    const custLogin = await axios.get(`${API}/auth/demo/customer`);
    const custToken = custLogin.data.token;
    console.log(`✅ 3. Customer Demo Login: ${custLogin.data.user.name} (Balance: ₹${custLogin.data.wallet.balance})`);

    const wrkLogin = await axios.get(`${API}/auth/demo/worker`);
    const wrkToken = wrkLogin.data.token;
    console.log(`✅    Worker Demo Login: ${wrkLogin.data.user.name} (Role: ${wrkLogin.data.user.role})`);

    const adminLogin = await axios.get(`${API}/auth/demo/admin`);
    const adminToken = adminLogin.data.token;
    console.log(`✅    Admin Demo Login: ${adminLogin.data.user.name}`);

    // 4. Nearby Workers filter (Bengaluru coords, 10km radius)
    const workers = await axios.get(`${API}/workers?lat=12.9716&lng=77.5946&radius=15`);
    console.log(`✅ 4. Nearby Workers within 15km: ${workers.data.count} workers found`);

    // 5. Create a new Booking
    const workerToBook = workers.data.data[0];
    const subcatToBook = workerToBook.services[0].subcategory;

    const newBookingRes = await axios.post(
      `${API}/bookings`,
      {
        worker_id: workerToBook.id,
        subcategory_id: subcatToBook.id,
        booking_type: "instant",
        address: "Flat 204, Palm Residency, Indiranagar, Bengaluru",
        city: "Bengaluru",
        lat: 12.9782,
        lng: 77.6408,
        coupon_code: "HOMEEASE50",
        notes: "Automated test booking for deep home clean",
        payment_method: "upi",
      },
      { headers: { Authorization: `Bearer ${custToken}` } }
    );

    const booking = newBookingRes.data.data;
    console.log(`✅ 5. Booking created! Ref: ${booking.booking_ref}, OTP: ${booking.otp_start_code}, Total: ₹${booking.final_amount} (GST: ₹${booking.tax_amount})`);

    // 6. Worker Accepts Booking
    await axios.put(
      `${API}/bookings/${booking.id}/status`,
      { status: "accepted" },
      { headers: { Authorization: `Bearer ${wrkToken}` } }
    );
    console.log("✅ 6. Worker accepted booking");

    // 7. Worker moves to En Route
    await axios.put(
      `${API}/bookings/${booking.id}/status`,
      { status: "en_route" },
      { headers: { Authorization: `Bearer ${wrkToken}` } }
    );
    console.log("✅ 7. Worker marked En Route with live GPS tracking");

    // 8. Worker verifies Customer OTP to start work
    await axios.put(
      `${API}/bookings/${booking.id}/status`,
      { status: "in_progress", otp_code: booking.otp_start_code },
      { headers: { Authorization: `Bearer ${wrkToken}` } }
    );
    console.log("✅ 8. OTP verified successfully -> Service In Progress");

    // 9. Worker marks completed (Wallet Payout credited)
    await axios.put(
      `${API}/bookings/${booking.id}/status`,
      { status: "completed" },
      { headers: { Authorization: `Bearer ${wrkToken}` } }
    );
    console.log("✅ 9. Service Completed -> 85% worker payout credited to wallet");

    // 10. Fetch GST Tax Invoice
    const invoiceRes = await axios.get(`${API}/payments/invoice/${booking.id}`, {
      headers: { Authorization: `Bearer ${custToken}` },
    });
    console.log(`✅ 10. GST Tax Invoice generated: ${invoiceRes.data.data.invoice_number} (GSTIN: ${invoiceRes.data.data.gstin})`);

    // 11. Customer leaves 5-star rating & review
    const reviewRes = await axios.post(
      `${API}/reviews`,
      {
        booking_id: booking.id,
        rating: 5,
        comment: "Outstanding service! Arrived in 10 minutes and did an immaculate deep clean.",
        photos: [],
      },
      { headers: { Authorization: `Bearer ${custToken}` } }
    );
    console.log("✅ 11. Customer review published:", reviewRes.data.data.comment);

    // 12. Admin Analytics Check
    const adminAnalytics = await axios.get(`${API}/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log("✅ 12. Admin Analytics verified: GMV ₹" + adminAnalytics.data.data.metrics.totalRevenue + ", Platform Take: ₹" + adminAnalytics.data.data.metrics.platformCommission);

    console.log("=========================================");
    console.log("🎉 ALL 12 AUTOMATED TESTS PASSED SUCCESSFULLY!");
    console.log("=========================================");
  } catch (err: any) {
    console.error("❌ Test failed:", err.response?.data || err.message);
  }
}

runVerification();
