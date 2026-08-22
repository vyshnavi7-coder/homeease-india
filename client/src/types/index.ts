export type UserRole = "customer" | "worker" | "admin";
export type UserStatus = "active" | "suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  language: string;
  is_verified: boolean;
  status: UserStatus;
  created_at: string;
  worker?: WorkerProfile;
}

export interface WorkerProfile {
  id: string;
  user_id: string;
  bio: string;
  experience_years: number;
  aadhaar_number: string;
  aadhaar_doc?: string;
  pan_number?: string;
  pan_doc?: string;
  certificates: string[];
  portfolio: string[];
  service_radius_km: number;
  rating: number;
  review_count: number;
  is_approved: boolean;
  is_online: boolean;
  hourly_rate: number;
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  languages_spoken: string[];
  created_at: string;
  user?: User;
  services?: WorkerServiceWithSubcategory[];
  distance_km?: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  banner_image: string;
  sort_order: number;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  description: string;
  base_price: number;
  price_unit: string;
  est_duration_mins: number;
  icon: string;
}

export interface WorkerService {
  id: string;
  worker_id: string;
  subcategory_id: string;
  custom_price?: number;
  is_available: boolean;
}

export interface WorkerServiceWithSubcategory extends WorkerService {
  subcategory: Subcategory;
}

export type BookingStatus =
  | "pending"
  | "accepted"
  | "en_route"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed";

export type BookingType = "instant" | "scheduled" | "emergency" | "quotation";
export type PaymentStatus = "pending" | "paid" | "refunded";
export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet" | "cash";

export interface Booking {
  id: string;
  booking_ref: string;
  customer_id: string;
  worker_id: string;
  subcategory_id: string;
  status: BookingStatus;
  booking_type: BookingType;
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  final_amount: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  otp_start_code: string;
  notes?: string;
  media_urls: string[];
  current_worker_lat?: number;
  current_worker_lng?: number;
  created_at: string;
  updated_at: string;
  customer?: User;
  worker?: WorkerProfile;
  subcategory?: Subcategory;
  payment?: Payment;
  review?: Review;
}

export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_ref: string;
  status: "success" | "failed" | "pending" | "refunded";
  gst_number: string;
  invoice_number: string;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  loyalty_points: number;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  amount: number;
  type: "credit" | "debit" | "cashback" | "withdrawal";
  description: string;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  worker_id: string;
  customer_name: string;
  customer_avatar: string;
  rating: number;
  comment: string;
  photos: string[];
  worker_reply?: string;
  is_verified: boolean;
  created_at: string;
}

export interface Complaint {
  id: string;
  booking_id: string;
  raised_by: string;
  raised_by_name?: string;
  reason: string;
  description: string;
  status: "open" | "in_review" | "resolved" | "rejected";
  resolution_notes?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  booking_id: string;
  sender_id: string;
  receiver_id: string;
  sender_name: string;
  sender_role: UserRole;
  message: string;
  media_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_discount: number;
  min_order: number;
  valid_till: string;
  is_active: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image_url: string;
  link: string;
  is_active: boolean;
}
