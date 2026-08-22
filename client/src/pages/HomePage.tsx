import React, { useState, useEffect, useMemo, memo } from "react";
import {
  Sparkles,
  Search,
  MapPin,
  ShieldCheck,
  Zap,
  Star,
  Award,
  AlertTriangle,
  Clock,
  Heart
} from "lucide-react";
import { Category, WorkerProfile, Banner, Coupon } from "../types";
import { WorkerCard } from "../components/WorkerCard";
import { InteractiveMap } from "../components/InteractiveMap";
import { useLanguage } from "../context/LanguageContext";
import { useLocationContext, DISTANCE_OPTIONS } from "../context/LocationContext";

interface HomePageProps {
  categories: Category[];
  workers: (WorkerProfile & { distance_km?: number })[];
  banners: Banner[];
  coupons: Coupon[];
  onSelectCategory: (slug: string) => void;
  onSelectWorker: (worker: WorkerProfile) => void;
  onBookWorker: (worker: WorkerProfile) => void;
  onOpenEmergencyBooking: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const HomePage: React.FC<HomePageProps> = memo(({
  categories,
  workers,
  banners,
  coupons,
  onSelectCategory,
  onSelectWorker,
  onBookWorker,
  onOpenEmergencyBooking,
  searchQuery,
  setSearchQuery,
}) => {
  const { t } = useLanguage();
  const { cityName, lat, lng, radiusKm, setRadiusKm } = useLocationContext();

  const [selectedCatFilter, setSelectedCatFilter] = useState<string>("all");
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [emergencyOnly, setEmergencyOnly] = useState<boolean>(false);
  const [activeBannerIdx, setActiveBannerIdx] = useState<number>(0);

  // Banner rotation
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Fast Memoized filtered workers
  const filteredWorkers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return workers.filter((worker) => {
      if (verifiedOnly && !worker.is_approved) return false;
      if (minRatingFilter > 0 && worker.rating < minRatingFilter) return false;
      if (emergencyOnly && !worker.is_online) return false;
      if (radiusKm && worker.distance_km !== undefined && worker.distance_km > radiusKm) return false;

      if (selectedCatFilter !== "all") {
        const matchCat = categories.find((c) => c.slug === selectedCatFilter || c.id === selectedCatFilter);
        if (matchCat) {
          const subIds = matchCat.subcategories?.map((s) => s.id) || [];
          const hasService = worker.services?.some((ws) => subIds.includes(ws.subcategory_id));
          if (!hasService) return false;
        }
      }

      if (q) {
        const matchName = worker.user?.name.toLowerCase().includes(q);
        const matchBio = worker.bio.toLowerCase().includes(q);
        const matchServices = worker.services?.some((s) => s.subcategory.name.toLowerCase().includes(q));
        if (!matchName && !matchBio && !matchServices) return false;
      }

      return true;
    });
  }, [workers, verifiedOnly, minRatingFilter, emergencyOnly, radiusKm, selectedCatFilter, categories, searchQuery]);

  // AI Recommended worker (memoized)
  const aiRecommendedWorker = useMemo(() => {
    return filteredWorkers.length > 0 ? filteredWorkers[0] : null;
  }, [filteredWorkers]);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 bg-gradient-to-b from-brand-50/70 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200/70 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900 text-orange-800 dark:text-orange-300 text-xs font-bold shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span>Hyperlocal Skilled Pros in {cityName} • ~15 Mins Arrival</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Expert Home Services, <br />
                <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Verified & At Your Door.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                Connect with background-checked maids, electricians, plumbers, cooks, carpenters, and beauty pros across India with transparent pricing and official GST invoices.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onOpenEmergencyBooking}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-red-600/30 flex items-center space-x-2 transition-all active:scale-95"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-300 animate-bounce" />
                  <span>24x7 Emergency SOS</span>
                </button>

                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-400 px-3 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <ShieldCheck className="w-4 h-4 text-brand-500" />
                  <span>100% Aadhaar Verified</span>
                </div>
              </div>

              {/* Popular tags */}
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="font-semibold">Trending:</span>
                <div className="flex flex-wrap gap-1.5">
                  {["Deep Cleaning", "AC Service", "House Maid", "Plumber", "Electrician"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] hover:border-brand-500 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hero Right Banner Carousel */}
            <div className="lg:col-span-5">
              {banners.length > 0 && (
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 group h-80">
                  <img
                    src={banners[activeBannerIdx]?.image_url}
                    alt={banners[activeBannerIdx]?.title}
                    loading="eager"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="inline-block px-2.5 py-1 bg-amber-400 text-slate-900 font-black text-[10px] uppercase rounded-md max-w-max mb-2">
                      {banners[activeBannerIdx]?.tag}
                    </span>
                    <h3 className="text-xl font-extrabold tracking-tight">
                      {banners[activeBannerIdx]?.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                      {banners[activeBannerIdx]?.subtitle}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. All 14 Categories Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("all_categories", "Explore All Home Services")}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select from 60+ specialized home services across India
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className="group p-3.5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-brand-500 shadow-soft hover:shadow-soft-lg transition-all duration-200 flex flex-col items-center text-center transform-gpu hover:-translate-y-0.5"
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden mb-2.5 relative shadow-sm">
                <img
                  src={cat.banner_image}
                  alt={cat.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-brand-600/10 group-hover:bg-transparent transition-colors" />
              </div>
              <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 group-hover:text-brand-500 transition-colors line-clamp-1">
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {cat.subcategories?.length || 4}+ services
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Interactive Hyperlocal Map & Distance Radius Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-soft">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-brand-500/10 text-brand-500 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {t("nearby_workers", "Nearby Skilled Workers on Live Map")}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing active verified professionals in and around {cityName}
              </p>
            </div>

            {/* Distance Radius Filter Buttons */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Distance Radius:</span>
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-700 p-1 text-xs font-bold">
                {DISTANCE_OPTIONS.map((dist) => (
                  <button
                    key={dist}
                    onClick={() => setRadiusKm(dist)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      radiusKm === dist
                        ? "bg-brand-500 text-white shadow-sm font-extrabold"
                        : "text-slate-600 dark:text-slate-300 hover:text-brand-500"
                    }`}
                  >
                    {dist} km
                  </button>
                ))}
              </div>
            </div>
          </div>

          <InteractiveMap
            centerLat={lat}
            centerLng={lng}
            radiusKm={radiusKm}
            workers={filteredWorkers}
            onSelectWorker={onSelectWorker}
            onBookWorker={onBookWorker}
            className="h-80 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700"
          />
        </div>
      </section>

      {/* 4. AI Worker Recommendation Match (Smart Spotlight) */}
      {aiRecommendedWorker && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-6 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-700 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={aiRecommendedWorker.user?.avatar}
                    alt={aiRecommendedWorker.user?.name}
                    loading="lazy"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-lg"
                  />
                  <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-amber-400 text-slate-900 rounded-full font-black text-[10px] uppercase shadow">
                    AI Match #1
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-extrabold text-white">
                      {aiRecommendedWorker.user?.name}
                    </h3>
                    <ShieldCheck className="w-5 h-5 text-blue-300" />
                  </div>
                  <p className="text-xs text-white/80 line-clamp-1 max-w-md mt-0.5">
                    {aiRecommendedWorker.bio}
                  </p>
                  <div className="flex items-center space-x-3 text-xs mt-2 font-bold">
                    <span className="bg-white/20 px-2.5 py-0.5 rounded-lg">
                      ★ {aiRecommendedWorker.rating} ({aiRecommendedWorker.review_count} reviews)
                    </span>
                    <span className="bg-white/20 px-2.5 py-0.5 rounded-lg">
                      ₹{aiRecommendedWorker.hourly_rate}/hr
                    </span>
                    {aiRecommendedWorker.distance_km !== undefined && (
                      <span className="bg-emerald-500/80 px-2.5 py-0.5 rounded-lg">
                        {aiRecommendedWorker.distance_km} km away
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto">
                <button
                  onClick={() => onSelectWorker(aiRecommendedWorker)}
                  className="flex-1 md:flex-none px-5 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => onBookWorker(aiRecommendedWorker)}
                  className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs shadow-lg transition-transform active:scale-95"
                >
                  Instant Book Pro
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Workers List with Live Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Verified Professionals in {cityName} ({filteredWorkers.length})
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`px-3 py-1.5 rounded-full border transition-all ${
                verifiedOnly
                  ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              }`}
            >
              ✓ Aadhaar Verified Only
            </button>

            <button
              onClick={() => setEmergencyOnly(!emergencyOnly)}
              className={`px-3 py-1.5 rounded-full border transition-all ${
                emergencyOnly
                  ? "bg-red-500 text-white border-red-500 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              }`}
            >
              ⚡ Instant Available
            </button>

            <button
              onClick={() => setMinRatingFilter(minRatingFilter === 4.5 ? 0 : 4.5)}
              className={`px-3 py-1.5 rounded-full border transition-all ${
                minRatingFilter === 4.5
                  ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              }`}
            >
              ★ 4.5+ Rated
            </button>
          </div>
        </div>

        {/* Worker Cards Grid */}
        {filteredWorkers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 mt-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              No workers match your current filters
            </h4>
            <p className="text-xs text-slate-500">
              Try increasing your distance radius or clearing category filters.
            </p>
            <button
              onClick={() => {
                setSelectedCatFilter("all");
                setMinRatingFilter(0);
                setVerifiedOnly(false);
                setEmergencyOnly(false);
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-bold shadow"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredWorkers.map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                onSelect={onSelectWorker}
                onBook={onBookWorker}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
});
