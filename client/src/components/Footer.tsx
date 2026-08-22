import React from "react";
import { ShieldCheck, PhoneCall, Heart, Award, Clock, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export const Footer: React.FC<{ onSelectCategory?: (slug: string) => void }> = ({ onSelectCategory }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center space-x-3.5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="p-2.5 rounded-xl bg-brand-500/20 text-brand-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Verified Pros</h4>
              <p className="text-xs text-slate-400">Aadhaar & police background checked</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Transparent Pricing</h4>
              <p className="text-xs text-slate-400">Honest rates with 18% GST tax invoices</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">15 Min Arrival</h4>
              <p className="text-xs text-slate-400">Hyperlocal nearby workers on live GPS</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24x7 SOS Support</h4>
              <p className="text-xs text-slate-400">Toll Free: 1800-HOMEEASE</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-10">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Home<span className="text-brand-400">Ease</span> India
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-4">
              India's leading hyperlocal marketplace connecting verified skilled local workers (maids, electricians, plumbers, cooks, carpenters, tailors, beauticians, painters) with homes across all 28 states & union territories.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>Supports all 22 Official Scheduled Indian Languages</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Cleaning & Help</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button onClick={() => onSelectCategory?.("home-cleaning")} className="hover:text-white transition-colors">Full Home Cleaning</button></li>
              <li><button onClick={() => onSelectCategory?.("home-cleaning")} className="hover:text-white transition-colors">Kitchen & Chimney</button></li>
              <li><button onClick={() => onSelectCategory?.("home-cleaning")} className="hover:text-white transition-colors">Bathroom Sanitization</button></li>
              <li><button onClick={() => onSelectCategory?.("domestic-help")} className="hover:text-white transition-colors">Daily / Monthly Maid</button></li>
              <li><button onClick={() => onSelectCategory?.("domestic-help")} className="hover:text-white transition-colors">Home Cook & Chef</button></li>
              <li><button onClick={() => onSelectCategory?.("domestic-help")} className="hover:text-white transition-colors">Elder & Baby Care</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Repairs & Tech</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button onClick={() => onSelectCategory?.("electrical")} className="hover:text-white transition-colors">Electrician & Wiring</button></li>
              <li><button onClick={() => onSelectCategory?.("plumbing")} className="hover:text-white transition-colors">Plumber & Leak Fix</button></li>
              <li><button onClick={() => onSelectCategory?.("ac-services")} className="hover:text-white transition-colors">AC Jet Servicing</button></li>
              <li><button onClick={() => onSelectCategory?.("appliances")} className="hover:text-white transition-colors">Washing Machine & TV</button></li>
              <li><button onClick={() => onSelectCategory?.("carpenter")} className="hover:text-white transition-colors">Carpenter & Woodwork</button></li>
              <li><button onClick={() => onSelectCategory?.("installation")} className="hover:text-white transition-colors">CCTV & Smart Lock</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Lifestyle & Home</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button onClick={() => onSelectCategory?.("beauty")} className="hover:text-white transition-colors">Salon & Makeup at Home</button></li>
              <li><button onClick={() => onSelectCategory?.("tailoring")} className="hover:text-white transition-colors">Tailoring & Saree Pico</button></li>
              <li><button onClick={() => onSelectCategory?.("painting")} className="hover:text-white transition-colors">Interior Painting</button></li>
              <li><button onClick={() => onSelectCategory?.("construction")} className="hover:text-white transition-colors">Mason & Tile Worker</button></li>
              <li><button onClick={() => onSelectCategory?.("gardening")} className="hover:text-white transition-colors">Gardener & Lawn Care</button></li>
              <li><button onClick={() => onSelectCategory?.("packers-movers")} className="hover:text-white transition-colors">Packers & Shifting</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} HomeEase India Marketplace Private Limited. All rights reserved.
          </div>
          <div className="flex items-center space-x-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 inline fill-red-500" />
            <span>for 1.4 Billion Indian Citizens 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
