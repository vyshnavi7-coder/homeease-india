import React, { memo } from "react";
import { Star, ShieldCheck, MapPin, Award, Zap } from "lucide-react";
import { WorkerProfile } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface WorkerCardProps {
  worker: WorkerProfile & { distance_km?: number };
  onSelect: (worker: WorkerProfile) => void;
  onBook: (worker: WorkerProfile) => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = memo(({ worker, onSelect, onBook }) => {
  const { t } = useLanguage();

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft hover:shadow-soft-lg transition-all duration-200 transform-gpu hover:-translate-y-0.5 flex flex-col justify-between">
      <div>
        {/* Header with avatar, badge, and distance */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="relative">
            <img
              src={
                worker.user?.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=75"
              }
              alt={worker.user?.name}
              loading="lazy"
              decoding="async"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/30 group-hover:border-brand-500 transition-colors shadow-sm"
            />
            {worker.is_online && (
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"
                title="Online & Ready for Bookings"
              />
            )}
          </div>

          <div className="flex flex-col items-end space-y-1">
            {worker.is_approved && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-800">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-500 fill-brand-100 dark:fill-brand-950" />
                <span>Aadhaar Verified</span>
              </span>
            )}
            {worker.distance_km !== undefined && (
              <span className="inline-flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
                <MapPin className="w-3.5 h-3.5 text-brand-500" />
                <span>{worker.distance_km} km away</span>
              </span>
            )}
          </div>
        </div>

        {/* Worker Name & Rating */}
        <div className="mb-2">
          <h3
            onClick={() => onSelect(worker)}
            className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors cursor-pointer"
          >
            {worker.user?.name}
          </h3>

          <div className="flex items-center space-x-3 mt-1 text-xs">
            <div className="flex items-center space-x-1 text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{worker.rating > 0 ? worker.rating : "New"}</span>
              <span className="text-slate-400 font-normal">({worker.review_count})</span>
            </div>

            <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              <span>{worker.experience_years} {t("experience", "yrs exp")}</span>
            </div>
          </div>
        </div>

        {/* Short Bio */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 leading-relaxed">
          {worker.bio}
        </p>

        {/* Services tags */}
        {worker.services && worker.services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {worker.services.slice(0, 3).map((s) => (
              <span
                key={s.id}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
              >
                {s.subcategory.name}
              </span>
            ))}
            {worker.services.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-500 text-[10px]">
                +{worker.services.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Languages spoken */}
        <div className="flex items-center space-x-1 text-[11px] text-slate-400 mb-4 truncate">
          <span>🗣️ {worker.languages_spoken.join(", ")}</span>
        </div>
      </div>

      {/* Footer Price & CTA Buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block leading-tight">
            {t("starts_at", "Starts at")}
          </span>
          <div className="flex items-baseline space-x-0.5">
            <span className="text-lg font-black text-slate-900 dark:text-white">
              ₹{worker.hourly_rate}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">/hr</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSelect(worker)}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            {t("view_profile", "Profile")}
          </button>
          <button
            onClick={() => onBook(worker)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition-all flex items-center space-x-1.5 active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{t("book_now", "Hire Now")}</span>
          </button>
        </div>
      </div>
    </div>
  );
});
