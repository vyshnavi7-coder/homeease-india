import React, { useState } from "react";
import { ArrowLeft, Clock, ShieldCheck, Star, Zap, MapPin, Sparkles } from "lucide-react";
import { Category, Subcategory, WorkerProfile } from "../types";
import { WorkerCard } from "../components/WorkerCard";
import { useLocationContext } from "../context/LocationContext";

interface CategoryDetailPageProps {
  category: Category;
  workers: (WorkerProfile & { distance_km?: number })[];
  onBack: () => void;
  onSelectWorker: (worker: WorkerProfile) => void;
  onBookWorker: (worker: WorkerProfile) => void;
  onBookSubcategory: (sub: Subcategory) => void;
}

export const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({
  category,
  workers,
  onBack,
  onSelectWorker,
  onBookWorker,
  onBookSubcategory,
}) => {
  const { cityName } = useLocationContext();
  const [selectedSubId, setSelectedSubId] = useState<string>("all");

  const subIds = category.subcategories?.map((s) => s.id) || [];
  const categoryWorkers = workers.filter((w) =>
    w.services?.some((ws) => subIds.includes(ws.subcategory_id))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Top back button & breadcrumb */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Categories</span>
      </button>

      {/* Category Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-brand-900 to-slate-900 text-white min-h-[220px] flex items-center p-8">
        <img
          src={category.banner_image}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="px-3 py-1 bg-brand-500 text-white font-black text-[10px] uppercase rounded-full tracking-wider">
            Category
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {category.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      {/* Subcategories Service Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Available Services in {category.name} ({category.subcategories?.length || 0})
          </h2>
          <p className="text-xs text-slate-500">
            Standard pricing with 100% money-back guarantee & GST tax invoice
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {category.subcategories?.map((sub) => (
            <div
              key={sub.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {sub.name}
                  </h3>
                  <span className="text-base font-black text-brand-600 dark:text-brand-400 shrink-0">
                    ₹{sub.base_price}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  {sub.description}
                </p>
                <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-brand-500" />
                    <span>~{sub.est_duration_mins} mins</span>
                  </span>
                  <span>•</span>
                  <span>{sub.price_unit}</span>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ Available in {cityName}
                </span>
                <button
                  onClick={() => onBookSubcategory(sub)}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/25 flex items-center space-x-1.5 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Book Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Specialists in Category */}
      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Specialist Professionals in {cityName} ({categoryWorkers.length})
          </h2>
          <p className="text-xs text-slate-500">
            Aadhaar verified experts ready for immediate dispatch
          </p>
        </div>

        {categoryWorkers.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs text-slate-500">
            No specialists currently online for this specific category in your selected area.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryWorkers.map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                onSelect={onSelectWorker}
                onBook={onBookWorker}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
