import React from 'react';
import { Badge } from '../components/ui/Badge';
import { Heart, Globe, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="forest" size="sm" className="uppercase font-bold tracking-wider">
          Our Purpose
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
          Good Food. Shared Future.
        </h1>
        <p className="text-base text-charcoal-600 dark:text-charcoal-300 max-w-xl mx-auto leading-relaxed">
          SharePlate was born out of a stark paradox: over one-third of all food produced is discarded, while millions of individuals face nutritional insecurity every single day.
        </p>
      </div>

      {/* Core Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-citrus-100 dark:bg-citrus-950/80 text-citrus-700 dark:text-citrus-400 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-forest-950 dark:text-cream-50 font-editorial">
            Halving Food Waste (SDG 12.3)
          </h3>
          <p className="text-xs text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
            Target 12.3 of the UN Sustainable Development Goals aims to halve per capita global food waste by 2030. Commercial kitchens produce safe, high-grade surplus daily; our mission is to eliminate the friction that keeps it from reaching community dining tables.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-forest-100 dark:bg-forest-950/80 text-forest-900 dark:text-emerald-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-forest-950 dark:text-cream-50 font-editorial">
            Dignity, Safety & Transparency
          </h3>
          <p className="text-xs text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
            Redistribution should never compromise dignity or health safety. We introduce clear allergen labeling, cooling temperature protocols, and cryptographic pickup codes that guarantee verified handovers between certified donors and registered charities.
          </p>
        </div>
      </div>

      {/* Transparency & Demo Mode Notice */}
      <div className="p-8 rounded-3xl bg-cream-100 dark:bg-charcoal-850 border border-cream-300 dark:border-charcoal-800 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-citrus-500" />
          <h3 className="text-base font-bold text-forest-950 dark:text-cream-50 font-editorial">
            Academic & Hackathon Demonstration Notice
          </h3>
        </div>
        <p className="text-xs text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
          This platform is a fully functional prototype designed for social impact product competitions. All demonstrated restaurant donors, charities, and food records represent simulated demo entities for testing and evaluation purposes.
        </p>
        <p className="text-xs text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
          The underlying backend features real SQLite database persistence, JWT authorization, ACID transaction concurrency locking, and live impact aggregations.
        </p>
      </div>
    </div>
  );
};
