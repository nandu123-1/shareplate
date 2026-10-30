import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ImpactMetrics } from '../types';
import { Badge } from '../components/ui/Badge';
import { Leaf, Award, TrendingUp, ShieldCheck, HeartHandshake } from 'lucide-react';

export const ImpactPage: React.FC = () => {
  const [data, setData] = useState<{
    metrics: ImpactMetrics | null;
    categoryStats: any[];
    recentActivity: any[];
  }>({
    metrics: null,
    categoryStats: [],
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadImpact() {
      try {
        const res = await api.getImpactMetrics();
        setData(res);
      } catch (err) {
        console.error('Failed to load impact metrics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadImpact();
  }, []);

  const metrics = data.metrics;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="citrus" size="sm" className="uppercase font-bold tracking-wider">
          Audited Sustainability
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
          Real-Time Social & Environmental Impact
        </h1>
        <p className="text-sm text-charcoal-600 dark:text-charcoal-300 max-w-2xl mx-auto leading-relaxed">
          Every kilogram of surplus food connected through SharePlate prevents landfill decomposition and feeds someone in need.
        </p>
      </div>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm text-center">
          <p className="text-xs text-charcoal-400 dark:text-charcoal-400 font-bold uppercase tracking-wider">
            Completed Pickups
          </p>
          <p className="text-4xl sm:text-5xl font-black text-forest-950 dark:text-cream-50 font-editorial mt-2">
            {metrics ? metrics.completedDonations : '--'}
          </p>
          <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400 mt-2">Verified Handovers</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm text-center">
          <p className="text-xs text-charcoal-400 dark:text-charcoal-400 font-bold uppercase tracking-wider">
            Surplus Portions
          </p>
          <p className="text-4xl sm:text-5xl font-black text-citrus-500 font-editorial mt-2">
            {metrics ? metrics.totalPortionsRedistributed : '--'}
          </p>
          <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400 mt-2">Meals to Community</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm text-center">
          <p className="text-xs text-charcoal-400 dark:text-charcoal-400 font-bold uppercase tracking-wider">
            Weight Rescued
          </p>
          <p className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 font-editorial mt-2">
            {metrics ? `${metrics.estimatedKgRedistributed} kg` : '--'}
          </p>
          <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400 mt-2">Edible Food Diverted</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm text-center">
          <p className="text-xs text-charcoal-400 dark:text-charcoal-400 font-bold uppercase tracking-wider">
            CO2e Prevented
          </p>
          <p className="text-4xl sm:text-5xl font-black text-forest-800 dark:text-forest-400 font-editorial mt-2">
            {metrics ? `${metrics.estimatedCo2ePreventedKg} kg` : '--'}
          </p>
          <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400 mt-2">Greenhouse Gases Avoided</p>
        </div>
      </div>

      {/* Category Breakdown & Calculation Framework */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Category distribution */}
        <div className="lg:col-span-7 bg-white dark:bg-charcoal-900 p-6 sm:p-8 rounded-3xl border border-cream-300 dark:border-charcoal-800 shadow-soft-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-forest-950 dark:text-cream-50 font-editorial">
              Redistribution by Food Category
            </h3>
            <Badge variant="forest" size="sm">Live DB Metrics</Badge>
          </div>

          <div className="space-y-4">
            {data.categoryStats.length === 0 ? (
              <p className="text-xs text-charcoal-400">Loading category metrics...</p>
            ) : (
              data.categoryStats.map(stat => {
                const totalUnits = metrics ? metrics.totalPortionsRedistributed : 100;
                const percentage = totalUnits > 0 ? Math.round((stat.total_quantity / totalUnits) * 100) : 0;
                return (
                  <div key={stat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-charcoal-900 dark:text-cream-100">{stat.category}</span>
                      <span className="text-charcoal-500 dark:text-charcoal-400 font-medium">
                        {stat.total_quantity} units ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-cream-200 dark:bg-charcoal-800 overflow-hidden">
                      <div
                        className="h-full bg-forest-800 dark:bg-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(8, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Transparent Methodology */}
        <div className="lg:col-span-5 bg-cream-100 dark:bg-charcoal-850 p-6 sm:p-8 rounded-3xl border border-cream-200 dark:border-charcoal-800 space-y-5">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-forest-700 dark:text-emerald-400" />
            <h3 className="text-lg font-bold text-forest-950 dark:text-cream-50 font-editorial">
              Methodology & Standards
            </h3>
          </div>

          <div className="space-y-3 text-xs text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
            <p>
              To maintain academic and commercial integrity, SharePlate avoids arbitrary multiplication factors.
            </p>
            <div className="p-3.5 rounded-xl bg-white dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 space-y-1">
              <span className="font-bold text-charcoal-900 dark:text-cream-100 block">Portion to Kilogram Conversion</span>
              <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400">
                1 standard cooked portion is normalized at <strong>0.40 kg</strong> based on USDA nutritional guidelines.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 space-y-1">
              <span className="font-bold text-charcoal-900 dark:text-cream-100 block">Carbon Displacement Factor</span>
              <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400">
                1 kg of edible food rescued from landfill prevents <strong>2.50 kg CO2 equivalent</strong> greenhouse emissions (UN FAO & WRAP UK Food Waste Carbon Index).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white dark:bg-charcoal-900 p-6 sm:p-8 rounded-3xl border border-cream-300 dark:border-charcoal-800 shadow-soft-sm space-y-6">
        <h3 className="text-xl font-bold text-forest-950 dark:text-cream-50 font-editorial">
          Recent Completed Handovers
        </h3>

        <div className="divide-y divide-cream-100 dark:divide-charcoal-800">
          {data.recentActivity.length === 0 ? (
            <p className="text-xs text-charcoal-400 py-4">No completed handovers recorded yet.</p>
          ) : (
            data.recentActivity.map(act => (
              <div key={act.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal-900 dark:text-cream-100 text-sm">{act.listing_title}</span>
                    <Badge variant="sage" size="sm">{act.category}</Badge>
                  </div>
                  <p className="text-charcoal-500 dark:text-charcoal-400">
                    From <strong className="text-charcoal-800 dark:text-cream-200">{act.donor_business_name}</strong> to <strong className="text-charcoal-800 dark:text-cream-200">{act.recipient_org_name || 'Community Organization'}</strong>
                  </p>
                </div>
                <div className="text-right sm:shrink-0 text-charcoal-400 text-[11px]">
                  {new Date(act.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
