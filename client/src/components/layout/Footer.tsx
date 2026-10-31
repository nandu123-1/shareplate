import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-forest-950 text-cream-200 border-t border-forest-900 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-charcoal-900 border border-charcoal-800 flex items-center justify-center text-forest-950">
                <svg className="w-4 h-4 text-citrus-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7c-2 2-3 4-3 6a3 3 0 0 0 6 0c0-2-1-4-3-6z" fill="#E06D3B" stroke="none" />
                </svg>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white font-editorial">
                Share<span className="text-citrus-400">Plate</span>
              </span>
            </div>
            <p className="text-xs text-cream-300/80 leading-relaxed">
              Good Food. Shared Future. A premium surplus food redistribution network connecting commercial donors with charitable community organizations.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-cream-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Platform Active • Demo Network</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cream-50">Platform</h4>
            <ul className="space-y-2 text-xs text-cream-300/70">
              <li><Link to="/explore" className="hover:text-white transition-colors">Explore Available Food</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/impact" className="hover:text-white transition-colors">Real-Time Impact Metrics</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Our Mission & Principles</Link></li>
            </ul>
          </div>

          {/* Roles */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cream-50">Participation</h4>
            <ul className="space-y-2 text-xs text-cream-300/70">
              <li><Link to="/register" className="hover:text-white transition-colors">For Food Businesses (Donors)</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">For Community Pantries & NGOs</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In to Dashboard</Link></li>
            </ul>
          </div>

          {/* Food Safety & Responsibility Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cream-50 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Food Safety & Standards
            </h4>
            <p className="text-[11px] text-cream-300/70 leading-relaxed">
              SharePlate coordinates food rescue logistics. Donors provide accurate temperature and preparation guidance. Collecting organizations evaluate food upon pickup according to local health regulations.
            </p>
            <div className="pt-2">
              <span className="inline-block text-[10px] px-2 py-1 rounded bg-forest-900 border border-forest-800 text-cream-400">
                Aligned with UN SDG 12.3: Zero Food Waste
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-forest-900/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-cream-400/60 gap-4">
          <p>© {new Date().getFullYear()} SharePlate Technologies. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-citrus-400 fill-citrus-400" /> for Social Impact & Food Sustainability.
          </p>
        </div>
      </div>
    </footer>
  );
};
