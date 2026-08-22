import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../database/db";
import { AuthRequest } from "../middleware/auth";
import { ChatMessage } from "../types";
import { getSocketIO } from "../sockets/socketHandler";

export const getChatMessages = (req: AuthRequest, res: Response): void => {
  const { booking_id } = req.params;

  const messages = db.chat_messages.filter((m) => m.booking_id === booking_id);
  messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  res.json({
    success: true,
    data: messages,
  });
};

export const sendChatMessage = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const { booking_id, message, media_url } = req.body;

  if (!booking_id || (!message && !media_url)) {
    res.status(400).json({ success: false, message: "Booking ID and message content are required" });
    return;
  }

  const booking = db.bookings.find((b) => b.id === booking_id);
  if (!booking) {
    res.status(404).json({ success: false, message: "Booking not found" });
    return;
  }

  // Determine receiver ID
  const receiverId = req.user.id === booking.customer_id ? booking.worker_id : booking.customer_id;

  const newMsg: ChatMessage = {
    id: `msg_${uuidv4().slice(0, 8)}`,
    booking_id,
    sender_id: req.user.id,
    receiver_id: receiverId,
    sender_name: req.user.name,
    sender_role: req.user.role,
    message: message || "",
    media_url,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  db.chat_messages.push(newMsg);
  db.save();

  // Socket broadcast
  const io = getSocketIO();
  if (io) {
    io.emit(`chat_message_${booking_id}`, newMsg);
  }

  res.status(201).json({
    success: true,
    data: newMsg,
  });
};
