import React, { useState } from "react";
import {
  MapPin,
  Search,
  Mic,
  Globe,
  Sun,
  Moon,
  User,
  Shield,
  Briefcase,
  Layers,
  ChevronDown,
  Sparkles,
  PhoneCall,
  Menu,
  X,
  CreditCard,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useLocationContext, INDIAN_CITIES } from "../context/LocationContext";
import { useTheme } from "../context/ThemeContext";
import { UserRole } from "../types";

interface NavbarProps {
  onOpenAuth: (role?: "customer" | "worker") => void;
  onOpenBookingHistory?: () => void;
  onOpenWallet?: () => void;
  onOpenComplaints?: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
}) => {
  const { user, wallet, switchRole, logout } = useAuth();
  const { currentLanguage, setLanguageCode, languages, t } = useLanguage();
  const { cityName, addressText, selectCity, detectCurrentLocation, isDetecting } = useLocationContext();
  const { isDark, toggleTheme } = useTheme();

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Voice search using Web Speech API
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. Please type in search bar.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = currentLanguage.code === "hi" ? "hi-IN" : "en-IN";
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-400 text-slate-900 font-bold text-[10px] uppercase tracking-wide">
              🇮🇳 India
            </span>
            <span className="font-medium hidden sm:inline">
              Hyperlocal home services with 100% Aadhaar-verified pros across 15+ Indian cities
            </span>
          </div>

          {/* Quick Demo Switcher */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-white/80 hidden md:inline">Quick Role Switch:</span>
            <div className="inline-flex rounded-full bg-white/20 p-0.5 text-[11px] font-semibold">
              <button
                onClick={() => {
                  switchRole("customer");
                  setActiveView("home");
                }}
                className={`px-2.5 py-0.5 rounded-full transition-all ${
                  user?.role === "customer"
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-white/90 hover:text-white"
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => {
                  switchRole("worker");
                  setActiveView("worker-dashboard");
                }}
                className={`px-2.5 py-0.5 rounded-full transition-all ${
                  user?.role === "worker"
                    ? "bg-amber-400 text-slate-900 shadow-sm font-bold"
                    : "text-white/90 hover:text-white"
                }`}
              >
                Worker
              </button>
              <button
                onClick={() => {
                  switchRole("admin");
                  setActiveView("admin-dashboard");
                }}
                className={`px-2.5 py-0.5 rounded-full transition-all ${
                  user?.role === "admin"
                    ? "bg-purple-400 text-slate-900 shadow-sm font-bold"
                    : "text-white/90 hover:text-white"
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => setActiveView("home")}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Home<span className="text-brand-500">Ease</span>
                </span>
                <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 font-bold rounded-md border border-orange-200 dark:border-orange-800">
                  INDIA
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5">
                {t("tagline", "Hyperlocal Home Services")}
              </p>
            </div>
          </div>

          {/* Location Selector Pill */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700"
            >
              <MapPin className="w-4 h-4 text-brand-500" />
              <div className="text-left">
                <div className="text-xs text-slate-400 dark:text-slate-500 leading-none">Location</div>
                <div className="font-semibold text-xs truncate max-w-[120px]">{cityName}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* City Dropdown Menu */}
            {isCityDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => {
                      detectCurrentLocation();
                      setIsCityDropdownOpen(false);
                    }}
                    disabled={isDetecting}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/50 dark:hover:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 animate-bounce" />
                    <span>{isDetecting ? "Detecting GPS..." : "Auto-detect My Location"}</span>
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {INDIAN_CITIES.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => {
                        selectCity(city);
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                        cityName === city.name ? "font-bold text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span>{city.name}</span>
                      <span className="text-[10px] text-slate-400">{city.state}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Bar with Voice Input */}
          <div className="flex-1 max-w-lg hidden lg:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search_placeholder", "Search for services, electrician, maid, plumber...")}
                className="w-full pl-10 pr-12 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                onClick={handleVoiceSearch}
                title="Voice Search"
                className={`absolute right-3 top-2.5 p-1 rounded-full transition-colors ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "text-slate-400 hover:text-brand-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2.5">
            {/* 22 Indian Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700"
                title="Change Language (22 Indian Languages)"
              >
                <Globe className="w-3.5 h-3.5 text-brand-500" />
                <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 max-h-72 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700">
                    22 Official Indian Languages
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguageCode(lang.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                        currentLanguage.code === lang.code
                          ? "font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/30"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="font-medium">{lang.nativeName}</span>
                      <span className="text-[10px] text-slate-400">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Profile / Dashboard Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-brand-500"
                  />
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[100px]">
                      {user.name.split(" ")[0]}
                    </div>
                    <div className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold uppercase">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      {wallet && (
                        <div className="mt-2 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 rounded-lg text-xs">
                          <span className="text-emerald-700 dark:text-emerald-300 font-medium">Wallet Balance:</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">₹{wallet.balance}</span>
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveView("customer-dashboard");
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <Layers className="w-4 h-4 text-brand-500" />
                        <span>{t("my_bookings", "My Bookings & History")}</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveView("worker-dashboard");
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <Briefcase className="w-4 h-4 text-amber-500" />
                        <span>{t("worker_dashboard", "Worker Dashboard")}</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveView("admin-dashboard");
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <Shield className="w-4 h-4 text-purple-500" />
                        <span>{t("admin_portal", "Admin Control Hub")}</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveView("customer-dashboard");
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <CreditCard className="w-4 h-4 text-emerald-500" />
                        <span>Wallet & Cashback</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth("customer")}
                  className="px-4 py-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition-all"
                >
                  {t("login_signup", "Login / Signup")}
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="lg:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search_placeholder", "Search for services...")}
              className="w-full pl-9 pr-10 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <button
              onClick={handleVoiceSearch}
              className="absolute right-2.5 top-1.5 p-1 text-slate-400 hover:text-brand-500"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
