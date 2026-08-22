import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "../database/db";
import { generateToken, AuthRequest } from "../middleware/auth";
import { User, WorkerProfile, Wallet } from "../types";

// In-memory OTP storage for mobile verification
const otpStore = new Map<string, { otp: string; expires: number }>();

export const register = (req: Request, res: Response): void => {
  const { name, email, phone, password, role = "customer", language = "en" } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400).json({ success: false, message: "Name, email, phone, and password are required" });
    return;
  }

  const existingEmail = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingEmail) {
    res.status(400).json({ success: false, message: "User with this email already exists" });
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = `usr_${uuidv4().slice(0, 8)}`;

  const newUser: User = {
    id: userId,
    name,
    email: email.toLowerCase(),
    phone,
    password: hashedPassword,
    role: role === "worker" ? "worker" : "customer",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    language,
    is_verified: true,
    status: "active",
    created_at: new Date().toISOString(),
  };

  db.users.push(newUser);

  // Initialize wallet for new user
  const newWallet: Wallet = {
    id: `wal_${uuidv4().slice(0, 8)}`,
    user_id: userId,
    balance: role === "customer" ? 100 : 0, // ₹100 signup bonus for customers
    loyalty_points: 50,
  };
  db.wallets.push(newWallet);

  // If worker, initialize worker profile
  if (role === "worker") {
    const {
      bio = "",
      experience_years = 1,
      hourly_rate = 300,
      service_radius_km = 10,
      city = "Bengaluru",
      state = "Karnataka",
      address = "Local Area",
      languages_spoken = ["Hindi", "English"],
      subcategories = [],
    } = req.body;

    const workerId = `wrk_${uuidv4().slice(0, 8)}`;
    const newWorker: WorkerProfile = {
      id: workerId,
      user_id: userId,
      bio,
      experience_years: Number(experience_years) || 1,
      aadhaar_number: req.body.aadhaar_number || "XXXX-XXXX-9999",
      aadhaar_doc: req.body.aadhaar_doc || "",
      pan_number: req.body.pan_number || "",
      certificates: req.body.certificates || [],
      portfolio: req.body.portfolio || [],
      service_radius_km: Number(service_radius_km) || 10,
      rating: 5.0,
      review_count: 0,
      is_approved: false, // requires admin verification
      is_online: true,
      hourly_rate: Number(hourly_rate) || 300,
      lat: req.body.lat || 12.9716,
      lng: req.body.lng || 77.5946,
      address,
      city,
      state,
      languages_spoken: Array.isArray(languages_spoken) ? languages_spoken : ["English", "Hindi"],
      created_at: new Date().toISOString(),
    };
    db.workers.push(newWorker);

    // Map subcategories
    if (Array.isArray(subcategories)) {
      subcategories.forEach((subId: string) => {
        db.worker_services.push({
          id: `ws_${uuidv4().slice(0, 8)}`,
          worker_id: workerId,
          subcategory_id: subId,
          is_available: true,
        });
      });
    }
  }

  db.save();

  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    name: newUser.name,
  });

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({
    success: true,
    message: "Registration successful",
    token,
    user: userWithoutPassword,
  });
};

export const login = (req: Request, res: Response): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: "Email and password are required" });
    return;
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !user.password) {
    res.status(401).json({ success: false, message: "Invalid email or password" });
    return;
  }

  if (user.status === "suspended") {
    res.status(403).json({ success: false, message: "This account has been suspended by administration." });
    return;
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    res.status(401).json({ success: false, message: "Invalid email or password" });
    return;
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const { password: _, ...userWithoutPassword } = user;
  const workerProfile = user.role === "worker" ? db.workers.find((w) => w.user_id === user.id) : undefined;
  const wallet = db.wallets.find((w) => w.user_id === user.id);

  res.json({
    success: true,
    message: "Logged in successfully",
    token,
    user: userWithoutPassword,
    workerProfile,
    wallet,
  });
};

export const sendOtp = (req: Request, res: Response): void => {
  const { phone } = req.body;
  if (!phone) {
    res.status(400).json({ success: false, message: "Phone number is required" });
    return;
  }

  // Pre-configured test OTP is 123456 or 6 digit
  const otp = "123456";
  otpStore.set(phone, {
    otp,
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes
  });

  res.json({
    success: true,
    message: `OTP sent to ${phone} (Use test OTP: 123456)`,
    otp: "123456",
  });
};

export const verifyOtp = (req: Request, res: Response): void => {
  const { phone, otp, name, role = "customer" } = req.body;

  if (!phone || !otp) {
    res.status(400).json({ success: false, message: "Phone and OTP are required" });
    return;
  }

  const record = otpStore.get(phone);
  if (!record || (record.otp !== otp && otp !== "123456")) {
    res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    return;
  }

  // Check if user exists by phone
  let user = db.users.find((u) => u.phone === phone);
  if (!user) {
    // Create quick account
    const userId = `usr_${uuidv4().slice(0, 8)}`;
    const userName = name || `User ${phone.slice(-4)}`;
    user = {
      id: userId,
      name: userName,
      email: `${phone.replace(/[^0-9]/g, "")}@homeease.in`,
      phone,
      role: role === "worker" ? "worker" : "customer",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`,
      language: "en",
      is_verified: true,
      status: "active",
      created_at: new Date().toISOString(),
    };
    db.users.push(user);

    db.wallets.push({
      id: `wal_${uuidv4().slice(0, 8)}`,
      user_id: userId,
      balance: 100,
      loyalty_points: 50,
    });

    if (role === "worker") {
      db.workers.push({
        id: `wrk_${uuidv4().slice(0, 8)}`,
        user_id: userId,
        bio: "Skilled home service professional ready for bookings.",
        experience_years: 2,
        aadhaar_number: "XXXX-XXXX-8888",
        certificates: [],
        portfolio: [],
        service_radius_km: 10,
        rating: 5.0,
        review_count: 0,
        is_approved: true,
        is_online: true,
        hourly_rate: 300,
        lat: 12.9716,
        lng: 77.5946,
        address: "Bengaluru Central",
        city: "Bengaluru",
        state: "Karnataka",
        languages_spoken: ["Hindi", "English"],
        created_at: new Date().toISOString(),
      });
    }

    db.save();
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const { password: _, ...userWithoutPassword } = user;
  const workerProfile = user.role === "worker" ? db.workers.find((w) => w.user_id === user.id) : undefined;
  const wallet = db.wallets.find((w) => w.user_id === user.id);

  res.json({
    success: true,
    message: "OTP verified successfully",
    token,
    user: userWithoutPassword,
    workerProfile,
    wallet,
  });
};

export const googleAuth = (req: Request, res: Response): void => {
  const { email, name, avatar, role = "customer" } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: "Google email is required" });
    return;
  }

  let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    const userId = `usr_${uuidv4().slice(0, 8)}`;
    user = {
      id: userId,
      name: name || "Google User",
      email: email.toLowerCase(),
      phone: "+91 9900000000",
      role: role === "worker" ? "worker" : "customer",
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`,
      language: "en",
      is_verified: true,
      status: "active",
      created_at: new Date().toISOString(),
    };
    db.users.push(user);
    db.wallets.push({
      id: `wal_${uuidv4().slice(0, 8)}`,
      user_id: userId,
      balance: 100,
      loyalty_points: 50,
    });
    db.save();
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    success: true,
    token,
    user: userWithoutPassword,
  });
};

// Demo quick-login switch (Customer / Worker / Admin)
export const demoLogin = (req: Request, res: Response): void => {
  const { role } = req.params;

  let user: User | undefined;
  if (role === "admin") {
    user = db.users.find((u) => u.role === "admin");
  } else if (role === "worker") {
    user = db.users.find((u) => u.id === "usr_wrk_1"); // Ramesh Kumar
  } else {
    user = db.users.find((u) => u.id === "usr_cust_1"); // Priya Sharma
  }

  if (!user) {
    res.status(404).json({ success: false, message: "Demo user not found" });
    return;
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const { password: _, ...userWithoutPassword } = user;
  const workerProfile = user.role === "worker" ? db.workers.find((w) => w.user_id === user.id) : undefined;
  const wallet = db.wallets.find((w) => w.user_id === user.id);

  res.json({
    success: true,
    message: `Logged in as demo ${role}: ${user.name}`,
    token,
    user: userWithoutPassword,
    workerProfile,
    wallet,
  });
};

export const getMe = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }

  const user = db.users.find((u) => u.id === req.user?.id);
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  const { password: _, ...userWithoutPassword } = user;
  const workerProfile = user.role === "worker" ? db.workers.find((w) => w.user_id === user.id) : undefined;
  const wallet = db.wallets.find((w) => w.user_id === user.id);

  res.json({
    success: true,
    user: userWithoutPassword,
    workerProfile,
    wallet,
  });
};

export const updateProfile = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }

  const user = db.users.find((u) => u.id === req.user?.id);
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  const { name, phone, language, avatar } = req.body;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (language) user.language = language;
  if (avatar) user.avatar = avatar;

  db.save();

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    success: true,
    message: "Profile updated successfully",
    user: userWithoutPassword,
  });
};
