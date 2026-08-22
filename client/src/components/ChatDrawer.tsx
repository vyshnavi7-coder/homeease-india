import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Image as ImageIcon,
  Phone,
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Check,
  CheckCheck
} from "lucide-react";
import { ChatMessage } from "../types";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  recipientName?: string;
  recipientAvatar?: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  bookingId,
  recipientName = "Service Professional",
  recipientAvatar = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [callType, setCallType] = useState<"voice" | "video">("voice");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "I am at the entrance gate.",
    "Please call when you reach the building.",
    "Please bring extra spare parts/materials.",
    "Ring flat bell #402.",
  ];

  // Fetch messages
  useEffect(() => {
    if (!isOpen || !bookingId) return;

    const fetchHistory = async () => {
      try {
        const res = await api.get(`/chat/${bookingId}`);
        if (res.data.success) {
          setMessages(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load chat", err);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, [isOpen, bookingId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Call timer
  useEffect(() => {
    let timer: any;
    if (isCalling) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCalling]);

  const handleSendMessage = async (textToSend?: string) => {
    const content = textToSend || inputText;
    if (!content.trim() || !bookingId) return;

    try {
      const res = await api.post("/chat", {
        booking_id: bookingId,
        message: content,
      });
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setInputText("");
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
      {/* Call Simulator Overlay */}
      {isCalling && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-between p-8 text-white animate-in fade-in">
          <div className="text-center pt-8">
            <span className="px-3 py-1 bg-brand-500/20 text-brand-400 rounded-full text-xs font-bold uppercase tracking-wider">
              Encrypted In-App {callType === "video" ? "Video" : "Voice"} Call
            </span>
            <h2 className="text-2xl font-black mt-3">{recipientName}</h2>
            <p className="text-xs text-slate-400 mt-1">{formatCallTime(callDuration)}</p>
          </div>

          {/* Video Avatar / Stream View */}
          <div className="relative">
            <img
              src={recipientAvatar}
              alt={recipientName}
              className={`w-40 h-40 rounded-full object-cover border-4 border-brand-500 shadow-glow mx-auto ${
                callType === "video" && !isVideoOff ? "scale-110" : ""
              }`}
            />
            {callType === "video" && (
              <div className="absolute -bottom-2 right-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                HD 1080p
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex items-center space-x-6 pb-8">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full transition-colors ${
                isMuted ? "bg-red-500 text-white" : "bg-slate-800 text-white hover:bg-slate-700"
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {callType === "video" && (
              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-4 rounded-full transition-colors ${
                  isVideoOff ? "bg-red-500 text-white" : "bg-slate-800 text-white hover:bg-slate-700"
                }`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
            )}

            <button
              onClick={() => setIsCalling(false)}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/40 transition-transform active:scale-95"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Main Drawer Panel */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center space-x-3">
            <img
              src={recipientAvatar}
              alt={recipientName}
              className="w-10 h-10 rounded-full object-cover border border-brand-500"
            />
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">{recipientName}</h4>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Active on HomeEase</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                setCallType("voice");
                setIsCalling(true);
              }}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              title="Voice Call"
            >
              <Phone className="w-4 h-4 text-emerald-500" />
            </button>
            <button
              onClick={() => {
                setCallType("video");
                setIsCalling(true);
              }}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              title="Video Call"
            >
              <Video className="w-4 h-4 text-blue-500" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/50">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No messages yet. Send a greeting or quick instruction.
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? "bg-brand-500 text-white rounded-br-none shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-sm"
                    }`}
                  >
                    {msg.message}
                    {msg.media_url && (
                      <img
                        src={msg.media_url}
                        alt="attachment"
                        className="mt-2 rounded-xl max-h-40 object-cover"
                      />
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1 flex items-center space-x-1">
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isMe && <CheckCheck className="w-3 h-3 text-brand-500" />}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick reply pills */}
        <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto whitespace-nowrap flex space-x-2">
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(reply)}
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950 text-slate-700 dark:text-slate-300 hover:text-brand-600 text-[11px] border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="p-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
