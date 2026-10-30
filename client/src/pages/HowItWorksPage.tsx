import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Utensils,
  HeartHandshake,
  CheckCircle2,
  ShieldCheck,
  Thermometer,
  KeyRound,
  FileCheck2,
  Leaf
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="citrus" size="sm" className="uppercase font-bold tracking-wider">
          Architecture & Standards
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
          How SharePlate Powers Food Redistribution
        </h1>
        <p className="text-base text-charcoal-600 dark:text-charcoal-300 max-w-2xl mx-auto leading-relaxed">
          A dependable, transparent digital infrastructure bridging commercial food surplus with community kitchens, shelters, and food banks.
        </p>
      </div>

      {/* 5-Stage Lifecycle Timeline */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-forest-950 dark:text-cream-50 font-editorial text-center">
          The 5-Stage Food Rescue Lifecycle
        </h2>

        <div className="space-y-6">
          {/* Stage 1 */}
          <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm">
            <div className="w-12 h-12 rounded-xl bg-forest-900 dark:bg-emerald-600 text-citrus-400 dark:text-white flex items-center justify-center font-bold text-lg shrink-0">
              1
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-forest-950 dark:text-cream-50">Surplus Listing & Safety Declaration</h3>
                <Badge variant="forest" size="sm">AVAILABLE</Badge>
              </div>
              <p className="text-xs text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                The food donor (restaurant, hotel, bakery, or grocer) inputs quantity, measurement unit, accurate preparation time, storage requirements, allergen tags, and strict pickup window hours.
              </p>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm">
            <div className="w-12 h-12 rounded-xl bg-forest-900 dark:bg-emerald-600 text-cream-50 dark:text-white flex items-center justify-center font-bold text-lg shrink-0">
              2
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-forest-950 dark:text-cream-50">NGO Request & Portion Matching</h3>
                <Badge variant="sage" size="sm">REQUESTED</Badge>
              </div>
              <p className="text-xs text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                A verified charitable organization browses active surplus. The NGO requests either full or partial quantity, entering their vehicle details and proposed pickup window.
              </p>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm">
            <div className="w-12 h-12 rounded-xl bg-citrus-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
              3
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-forest-950 dark:text-cream-50">Atomic Acceptance & Inventory Locking</h3>
                <Badge variant="citrus" size="sm">ACCEPTED</Badge>
              </div>
              <p className="text-xs text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                The donor reviews the incoming request and accepts it. The database executes an atomic transaction that reserves the inventory immediately, eliminating any risk of double-booking or over-commitment.
              </p>
            </div>
          </div>

          {/* Stage 4 */}
          <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm">
            <div className="w-12 h-12 rounded-xl bg-forest-800 dark:bg-charcoal-800 text-amber-300 flex items-center justify-center font-bold text-lg shrink-0">
              4
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-forest-950 dark:text-cream-50">Pickup Coordination & 6-Digit Verification Code</h3>
                <Badge variant="outline" size="sm">CONFIRMED PICKUP</Badge>
              </div>
              <p className="text-xs text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                Upon acceptance, a unique 6-digit cryptographic verification code is generated. When the NGO arrives at the donor's kitchen, the code is confirmed to guarantee authorized recipient identity.
              </p>
            </div>
          </div>

          {/* Stage 5 */}
          <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shrink-0">
              5
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-forest-950 dark:text-cream-50">Handover Complete & Impact Calculation</h3>
                <Badge variant="success" size="sm">COMPLETED</Badge>
              </div>
              <p className="text-xs text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                Collection is verified. The audit trail logs timestamp and actors. Both parties' dashboards update with meals saved, kilograms diverted, and avoided CO2 equivalent emissions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Food Safety & Hygiene Standards */}
      <div className="p-8 sm:p-10 rounded-3xl bg-forest-900 dark:bg-charcoal-900 text-cream-50 space-y-6 border border-transparent dark:border-charcoal-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-citrus-400" />
          <h2 className="text-2xl font-bold font-editorial">
            Food Safety Responsibility Framework
          </h2>
        </div>

        <p className="text-xs text-cream-200/80 leading-relaxed">
          SharePlate is dedicated to safe food redistribution. While the platform operates as a logistics coordinator, all participants adhere to strict hygiene guidelines:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-4 rounded-xl bg-forest-950/60 dark:bg-charcoal-950/80 border border-forest-800 dark:border-charcoal-800 text-xs space-y-2">
            <Thermometer className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-white text-sm">Temperature Control</h4>
            <p className="text-cream-300/80 leading-relaxed">
              Cooked hot food must remain above 63°C or rapidly chilled below 4°C within 90 minutes of cooking (HACCP standard).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-forest-950/60 dark:bg-charcoal-950/80 border border-forest-800 dark:border-charcoal-800 text-xs space-y-2">
            <FileCheck2 className="w-5 h-5 text-citrus-400" />
            <h4 className="font-bold text-white text-sm">Allergen Transparency</h4>
            <p className="text-cream-300/80 leading-relaxed">
              Donors disclose all major allergens (gluten, nuts, dairy, soy, eggs, shellfish) directly in listing metadata to protect vulnerable clients.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-forest-950/60 dark:bg-charcoal-950/80 border border-forest-800 dark:border-charcoal-800 text-xs space-y-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-white text-sm">Recipient Assessment</h4>
            <p className="text-cream-300/80 leading-relaxed">
              NGO coordinators inspect temperature, container seals, and sensory freshness upon pickup before distribution.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 pt-4">
        <h3 className="text-2xl font-bold text-forest-950 dark:text-cream-50 font-editorial">
          Ready to join our community network?
        </h3>
        <div className="flex justify-center gap-3">
          <Link to="/register">
            <Button variant="primary" size="md">
              Create Free Account
            </Button>
          </Link>
          <Link to="/explore">
            <Button variant="outline" size="md">
              Browse Available Food
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
