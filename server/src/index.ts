import express from "express";
import http from "http";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import compression from "compression";
import { db } from "./database/db";
import { seedDatabase } from "./database/seed";
import { initSocketIO } from "./sockets/socketHandler";
import apiRoutes from "./routes";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO
initSocketIO(server);

// Fast performance middleware: gzip compression
app.use(compression({
  threshold: 1024,
  level: 6,
}));

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Static uploads folder with caching
const uploadsPath = path.join(__dirname, "../uploads");
app.use("/uploads", express.static(uploadsPath, {
  maxAge: "7d",
  immutable: true,
}));

// API Routes
app.use("/api", apiRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "HomeEase India Server",
    timestamp: new Date().toISOString(),
    database: {
      users: db.users.length,
      workers: db.workers.length,
      categories: db.categories.length,
      bookings: db.bookings.length,
    },
  });
});

// Auto-seed if database is empty
if (!db.users || db.users.length === 0) {
  console.log("Database empty. Auto-seeding initial HomeEase India dataset...");
  seedDatabase();
}

server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 HomeEase India Server (Fast Mode) on port ${PORT}`);
  console.log(`⚡ Gzip Compression & In-Memory RAM Caching Active`);
  console.log(`📡 WebSocket / Socket.IO server ready`);
  console.log(`=========================================`);
});
