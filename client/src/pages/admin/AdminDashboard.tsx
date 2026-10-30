import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Users,
  Building,
  HeartHandshake,
  Package,
  CheckCircle2,
  AlertTriangle,
  History,
  TrendingUp,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminOverview() {
      setIsLoading(true);
      try {
        const res = await api.getAdminOverview();
        setData(res);
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminOverview();
  }, []);

  const metrics = data?.metrics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="citrus" size="sm" className="mb-2 uppercase font-bold tracking-wider">
            Super Administrator
          </Badge>
          <h1 className="text-3xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
            Platform Command Center
          </h1>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-0.5">
            Real-time ecosystem governance, user management, and food safety moderation.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/admin/users">
            <Button variant="secondary" size="sm" icon={<Users className="w-4 h-4" />}>
              Manage Users
            </Button>
          </Link>
          <Link to="/admin/reports">
            <Button
              variant="outline"
              size="sm"
              icon={<ShieldAlert className="w-4 h-4 text-red-600" />}
            >
              Reports ({metrics ? metrics.openReports : 0})
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-400 uppercase tracking-wider block">
            Registered Users
          </span>
          <p className="text-3xl font-black text-forest-950 dark:text-cream-50 font-editorial mt-1">
            {metrics ? metrics.totalUsers : '--'}
          </p>
          <span className="text-[11px] text-charcoal-500 dark:text-charcoal-400 mt-1 block">
            {metrics?.totalDonors} Donors • {metrics?.totalRecipients} Charities
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-400 uppercase tracking-wider block">
            Active Listings
          </span>
          <p className="text-3xl font-black text-forest-800 dark:text-emerald-400 font-editorial mt-1">
            {metrics ? metrics.activeListings : '--'}
          </p>
          <span className="text-[11px] text-charcoal-500 dark:text-charcoal-400 mt-1 block">
            Surplus inventory live
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-400 uppercase tracking-wider block">
            Completed Pickups
          </span>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-editorial mt-1">
            {metrics ? metrics.completedPickups : '--'}
          </p>
          <span className="text-[11px] text-charcoal-500 dark:text-charcoal-400 mt-1 block">
            {metrics?.totalRedistributedQuantity} total units redistributed
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-400 uppercase tracking-wider block">
            Open Reports
          </span>
          <p className="text-3xl font-black text-red-600 font-editorial mt-1">
            {metrics ? metrics.openReports : '--'}
          </p>
          <span className="text-[11px] text-charcoal-500 dark:text-charcoal-400 mt-1 block">
            Flags needing review
          </span>
        </div>
      </div>

      {/* Two Column Section: Category Distribution & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Breakdown */}
        <div className="lg:col-span-7 bg-white dark:bg-charcoal-900 p-6 sm:p-8 rounded-3xl border border-cream-300 dark:border-charcoal-800 shadow-soft-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-forest-950 dark:text-cream-50 font-editorial">
              Listings by Food Category
            </h3>
            <Badge variant="forest" size="sm">Real-time DB</Badge>
          </div>

          <div className="space-y-4">
            {data?.listingsByCategory?.map((item: any) => (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-charcoal-900 dark:text-cream-100">{item.category}</span>
                  <span className="text-charcoal-500 dark:text-charcoal-400 font-medium">{item.count} items</span>
                </div>
                <div className="w-full h-2 rounded-full bg-cream-200 dark:bg-charcoal-800 overflow-hidden">
                  <div
                    className="h-full bg-forest-800 dark:bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, item.count * 20)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Admin Actions & Status */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-charcoal-900 p-6 rounded-3xl border border-cream-300 dark:border-charcoal-800 shadow-soft-sm space-y-4">
            <h3 className="text-lg font-bold text-forest-950 dark:text-cream-50 font-editorial">
              Admin Governance Links
            </h3>
            <div className="space-y-2">
              <Link
                to="/admin/users"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-cream-50 dark:bg-charcoal-800 hover:bg-cream-100 dark:hover:bg-charcoal-700 transition-colors text-xs font-semibold text-charcoal-800 dark:text-cream-100"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
                  <span>User & Partner Management</span>
                </div>
                <ArrowRight className="w-4 h-4 text-charcoal-400" />
              </Link>

              <Link
                to="/admin/reports"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-cream-50 dark:bg-charcoal-800 hover:bg-cream-100 dark:hover:bg-charcoal-700 transition-colors text-xs font-semibold text-charcoal-800 dark:text-cream-100"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>Safety & Inaccuracy Reports</span>
                </div>
                <ArrowRight className="w-4 h-4 text-charcoal-400" />
              </Link>

              <Link
                to="/admin/audit-logs"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-cream-50 dark:bg-charcoal-800 hover:bg-cream-100 dark:hover:bg-charcoal-700 transition-colors text-xs font-semibold text-charcoal-800 dark:text-cream-100"
              >
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4 text-citrus-600 dark:text-citrus-400" />
                  <span>System Audit Trail</span>
                </div>
                <ArrowRight className="w-4 h-4 text-charcoal-400" />
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-forest-900 dark:bg-charcoal-900 text-cream-50 space-y-2 border border-transparent dark:border-charcoal-800">
            <h4 className="font-bold text-sm">Automated Concurrency Protection</h4>
            <p className="text-xs text-cream-200/80 leading-relaxed">
              All inventory reservations execute within isolated SQLite ACID transactions, locking quantity counters so no food item can ever be overbooked.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
