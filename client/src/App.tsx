import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { LocationProvider, useLocationContext } from "./context/LocationContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { CategoryDetailPage } from "./pages/CategoryDetailPage";
import { WorkerProfilePage } from "./pages/WorkerProfilePage";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { WorkerDashboard } from "./pages/WorkerDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AuthModal } from "./components/AuthModal";
import { BookingModal } from "./components/BookingModal";
import { LiveTrackerModal } from "./components/LiveTrackerModal";
import { ChatDrawer } from "./components/ChatDrawer";
import { InvoiceModal } from "./components/InvoiceModal";
import { ComplaintModal } from "./components/ComplaintModal";
import { Category, WorkerProfile, Subcategory, Banner, Coupon, Booking, UserRole } from "./types";
import { api } from "./services/api";

function AppContent() {
  const { user } = useAuth();
  const { lat, lng, radiusKm } = useLocationContext();

  // Navigation View State: 'home' | 'category-detail' | 'worker-profile' | 'customer-dashboard' | 'worker-dashboard' | 'admin-dashboard'
  const [activeView, setActiveView] = useState<string>("home");
  const [categories, setCategories] = useState<Category[]>([]);
  const [workers, setWorkers] = useState<(WorkerProfile & { distance_km?: number })[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Selected Entities
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("");
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const [bookingWorker, setBookingWorker] = useState<WorkerProfile | undefined>(undefined);
  const [bookingSubcategory, setBookingSubcategory] = useState<Subcategory | undefined>(undefined);
  const [activeTrackingBooking, setActiveTrackingBooking] = useState<Booking | null>(null);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>("customer");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatBookingId, setChatBookingId] = useState<string>("");
  const [isInvoiceOpen, setIsInvoiceOpen] = useState<boolean>(false);
  const [invoiceBookingId, setInvoiceBookingId] = useState<string>("");
  const [isComplaintOpen, setIsComplaintOpen] = useState<boolean>(false);
  const [complaintBookingId, setComplaintBookingId] = useState<string>("");

  // Fetch initial data
  const loadData = async () => {
    try {
      const [catRes, wrkRes, banRes, cpnRes] = await Promise.all([
        api.get("/categories"),
        api.get(`/workers?lat=${lat}&lng=${lng}&radius=${radiusKm}`),
        api.get("/banners"),
        api.get("/coupons"),
      ]);

      if (catRes.data.success) setCategories(catRes.data.data);
      if (wrkRes.data.success) setWorkers(wrkRes.data.data);
      if (banRes.data.success) setBanners(banRes.data.data);
      if (cpnRes.data.success) setCoupons(cpnRes.data.data);
    } catch (err) {
      console.error("Failed to load initial marketplace data", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [lat, lng, radiusKm]);

  // Handlers
  const handleSelectCategory = (slug: string) => {
    setSelectedCategorySlug(slug);
    setActiveView("category-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectWorker = (worker: WorkerProfile) => {
    setSelectedWorker(worker);
    setActiveView("worker-profile");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBookWorker = (worker: WorkerProfile) => {
    setBookingWorker(worker);
    setBookingSubcategory(undefined);
    setIsBookingModalOpen(true);
  };

  const handleBookSubcategory = (sub: Subcategory) => {
    setBookingSubcategory(sub);
    // Find closest worker for this subcategory
    const matched = workers.find((w) =>
      w.services?.some((ws) => ws.subcategory_id === sub.id)
    );
    setBookingWorker(matched || workers[0]);
    setIsBookingModalOpen(true);
  };

  const handleOpenEmergencyBooking = () => {
    // Pick first available electrician or plumber for SOS
    const emergencyWorker = workers.find((w) => w.is_online) || workers[0];
    setBookingWorker(emergencyWorker);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = (booking: Booking) => {
    setActiveTrackingBooking(booking);
    setIsTrackerModalOpen(true);
    setIsBookingModalOpen(false);
  };

  const handleOpenChat = (bookingId: string) => {
    setChatBookingId(bookingId);
    setIsChatOpen(true);
  };

  const handleOpenInvoice = (bookingId: string) => {
    setInvoiceBookingId(bookingId);
    setIsInvoiceOpen(true);
  };

  const handleOpenComplaint = (bookingId: string) => {
    setComplaintBookingId(bookingId);
    setIsComplaintOpen(true);
  };

  const activeCategory = categories.find(
    (c) => c.slug === selectedCategorySlug || c.id === selectedCategorySlug
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        onOpenAuth={(r) => {
          setAuthModalRole(r || "customer");
          setIsAuthModalOpen(true);
        }}
        activeView={activeView}
        setActiveView={setActiveView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="flex-1">
        {activeView === "home" && (
          <HomePage
            categories={categories}
            workers={workers}
            banners={banners}
            coupons={coupons}
            onSelectCategory={handleSelectCategory}
            onSelectWorker={handleSelectWorker}
            onBookWorker={handleBookWorker}
            onOpenEmergencyBooking={handleOpenEmergencyBooking}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activeView === "category-detail" && activeCategory && (
          <CategoryDetailPage
            category={activeCategory}
            workers={workers}
            onBack={() => setActiveView("home")}
            onSelectWorker={handleSelectWorker}
            onBookWorker={handleBookWorker}
            onBookSubcategory={handleBookSubcategory}
          />
        )}

        {activeView === "worker-profile" && selectedWorker && (
          <WorkerProfilePage
            worker={selectedWorker}
            onBack={() => setActiveView("home")}
            onBook={handleBookWorker}
            onOpenChat={(id) => handleOpenChat(id)}
          />
        )}

        {activeView === "customer-dashboard" && (
          <CustomerDashboard
            onTrackBooking={(bk) => {
              setActiveTrackingBooking(bk);
              setIsTrackerModalOpen(true);
            }}
            onOpenInvoice={handleOpenInvoice}
            onOpenChat={handleOpenChat}
            onOpenComplaint={handleOpenComplaint}
          />
        )}

        {activeView === "worker-dashboard" && (
          <WorkerDashboard onOpenChat={handleOpenChat} />
        )}

        {activeView === "admin-dashboard" && <AdminDashboard />}
      </main>

      <Footer onSelectCategory={handleSelectCategory} />

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialRole={authModalRole}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        worker={bookingWorker}
        initialSubcategory={bookingSubcategory}
        subcategories={categories.flatMap((c) => c.subcategories || [])}
        onBookingSuccess={handleBookingSuccess}
      />

      <LiveTrackerModal
        isOpen={isTrackerModalOpen}
        onClose={() => setIsTrackerModalOpen(false)}
        booking={activeTrackingBooking}
        onOpenChat={handleOpenChat}
        onOpenInvoice={handleOpenInvoice}
        onOpenComplaint={handleOpenComplaint}
      />

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        bookingId={chatBookingId}
        recipientName={
          activeTrackingBooking?.worker?.user?.name || "Service Professional"
        }
      />

      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        bookingId={invoiceBookingId}
      />

      <ComplaintModal
        isOpen={isComplaintOpen}
        onClose={() => setIsComplaintOpen(false)}
        bookingId={complaintBookingId}
      />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <LocationProvider>
          <AuthProvider>
            <SocketProvider>
              <AppContent />
            </SocketProvider>
          </AuthProvider>
        </LocationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
