import React from "react";
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Award,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  CheckCircle2,
  Zap,
  Globe
} from "lucide-react";
import { WorkerProfile, Review } from "../types";

interface WorkerProfilePageProps {
  worker: WorkerProfile & { distance_km?: number; reviews?: Review[] };
  onBack: () => void;
  onBook: (worker: WorkerProfile) => void;
  onOpenChat?: (workerId: string) => void;
}

export const WorkerProfilePage: React.FC<WorkerProfilePageProps> = ({
  worker,
  onBack,
  onBook,
  onOpenChat,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Top back button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Search</span>
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Full Profile, Skills, Portfolio, Reviews */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-soft">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center space-x-4">
                <img
                  src={worker.user?.avatar}
                  alt={worker.user?.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-500 shadow-md"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                      {worker.user?.name}
                    </h1>
                    {worker.is_approved && (
                      <span className="p-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center space-x-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{worker.rating}</span>
                      <span className="text-slate-400 font-normal">({worker.review_count} reviews)</span>
                    </span>
                    <span>•</span>
                    <span>{worker.experience_years} years experience</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-500" />
                    <span>{worker.address}, {worker.city}</span>
                    {worker.distance_km !== undefined && (
                      <span className="text-brand-600 font-bold">({worker.distance_km} km away)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex flex-col sm:items-end">
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-full border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Online for Instant Booking</span>
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Service Radius: {worker.service_radius_km} km
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="pt-6 space-y-2">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">About Pro</h3>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                {worker.bio}
              </p>
              <div className="flex items-center space-x-1 text-xs text-slate-500 pt-2">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Languages: <strong>{worker.languages_spoken.join(", ")}</strong></span>
              </div>
            </div>
          </div>

          {/* Services & Rate Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-soft space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Services & Pricing Rate Card
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {worker.services?.map((ws) => (
                <div
                  key={ws.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {ws.subcategory.name}
                    </h4>
                    <p className="text-[10px] text-slate-400">{ws.subcategory.description}</p>
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    ₹{ws.custom_price || ws.subcategory.base_price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Certificates & Verification Badges */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-soft space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Award className="w-4 h-4 text-brand-500" />
              <span>Verified Qualifications & Certifications</span>
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Govt ID (Aadhaar #{worker.aadhaar_number}) Background Verified</span>
              </div>
              {worker.certificates.map((cert, i) => (
                <div key={i} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Verified Customer Reviews ({worker.review_count})
              </h3>
              <div className="flex items-center space-x-1 text-sm font-extrabold text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{worker.rating} / 5.0</span>
              </div>
            </div>

            <div className="space-y-4">
              {(worker.reviews || []).map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={rev.customer_avatar}
                        alt={rev.customer_name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {rev.customer_name}
                      </span>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    "{rev.comment}"
                  </p>

                  {rev.photos && rev.photos.length > 0 && (
                    <div className="flex space-x-2 pt-1">
                      {rev.photos.map((photo, i) => (
                        <img
                          key={i}
                          src={photo}
                          alt="review upload"
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                        />
                      ))}
                    </div>
                  )}

                  {rev.worker_reply && (
                    <div className="mt-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="font-bold text-brand-600 block mb-0.5">
                        Response from {worker.user?.name}:
                      </span>
                      {rev.worker_reply}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Sticky Booking Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xl space-y-6">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Standard Consultation & Labor
              </span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  ₹{worker.hourly_rate}
                </span>
                <span className="text-xs text-slate-500 font-semibold">/ hour</span>
              </div>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">
                ✓ 100% Free cancellation before arrival
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                <Clock className="w-4 h-4 text-brand-500" />
                <span>Immediate Arrival within ~15 minutes</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>₹10,000 Home Protection Cover</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => onBook(worker)}
                className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-2xl font-extrabold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Instant Hire & Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
