import fs from "fs";
import path from "path";
import {
  User,
  WorkerProfile,
  Category,
  Subcategory,
  WorkerService,
  Booking,
  Payment,
  Wallet,
  WalletTransaction,
  Review,
  Complaint,
  ChatMessage,
  Coupon,
  Banner,
} from "../types";

export interface DatabaseSchema {
  users: User[];
  workers: WorkerProfile[];
  categories: Category[];
  subcategories: Subcategory[];
  worker_services: WorkerService[];
  bookings: Booking[];
  payments: Payment[];
  wallets: Wallet[];
  wallet_transactions: WalletTransaction[];
  reviews: Review[];
  complaints: Complaint[];
  chat_messages: ChatMessage[];
  coupons: Coupon[];
  banners: Banner[];
}

const DB_FILE = path.join(__dirname, "database.json");

class Database {
  private data: DatabaseSchema = {
    users: [],
    workers: [],
    categories: [],
    subcategories: [],
    worker_services: [],
    bookings: [],
    payments: [],
    wallets: [],
    wallet_transactions: [],
    reviews: [],
    complaints: [],
    chat_messages: [],
    coupons: [],
    banners: [],
  };

  private isLoaded = false;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.load();
  }

  public load(): void {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
        this.isLoaded = true;
      } else {
        this.saveImmediate();
        this.isLoaded = true;
      }
    } catch (err) {
      console.error("Failed to load database.json, initializing empty schema", err);
    }
  }

  // Fast debounced asynchronous save (non-blocking in-memory persistence)
  public save(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveImmediate();
    }, 200);
  }

  public saveImmediate(): void {
    try {
      fs.writeFile(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8", (err) => {
        if (err) console.error("Async DB save error:", err);
      });
    } catch (err) {
      console.error("Failed to save database.json", err);
    }
  }

  // Getters
  get users() { return this.data.users; }
  get workers() { return this.data.workers; }
  get categories() { return this.data.categories; }
  get subcategories() { return this.data.subcategories; }
  get worker_services() { return this.data.worker_services; }
  get bookings() { return this.data.bookings; }
  get payments() { return this.data.payments; }
  get wallets() { return this.data.wallets; }
  get wallet_transactions() { return this.data.wallet_transactions; }
  get reviews() { return this.data.reviews; }
  get complaints() { return this.data.complaints; }
  get chat_messages() { return this.data.chat_messages; }
  get coupons() { return this.data.coupons; }
  get banners() { return this.data.banners; }

  public reset(newData: DatabaseSchema) {
    this.data = newData;
    this.saveImmediate();
  }
}

export const db = new Database();
