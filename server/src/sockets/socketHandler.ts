import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { db } from "../database/db";

let io: SocketIOServer | null = null;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room for specific booking
    socket.on("join_booking", (bookingId: string) => {
      socket.join(`booking_${bookingId}`);
      console.log(`Socket ${socket.id} joined room booking_${bookingId}`);
    });

    // Join room for worker live notifications
    socket.on("join_worker_channel", (workerId: string) => {
      socket.join(`worker_${workerId}`);
      console.log(`Worker ${workerId} connected to worker notification channel`);
    });

    // Worker live location tracking broadcast
    socket.on("update_location", (data: { bookingId: string; lat: number; lng: number }) => {
      const { bookingId, lat, lng } = data;
      const booking = db.bookings.find((b) => b.id === bookingId);
      if (booking) {
        booking.current_worker_lat = lat;
        booking.current_worker_lng = lng;
        db.save();
      }
      io?.to(`booking_${bookingId}`).emit("worker_location_update", { lat, lng });
    });

    // Chat message relay
    socket.on("chat_message", (messageData) => {
      if (messageData && messageData.booking_id) {
        io?.to(`booking_${messageData.booking_id}`).emit("chat_message", messageData);
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getSocketIO(): SocketIOServer | null {
  return io;
}
