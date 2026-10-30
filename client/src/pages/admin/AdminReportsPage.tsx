import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const res = await api.getReports();
      setReports(res.reports);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleResolve = async (reportId: string, deactivateListing: boolean) => {
    try {
      await api.resolveReport(reportId, {
        status: deactivateListing ? 'ACTION_TAKEN' : 'DISMISSED',
        adminNotes: deactivateListing ? 'Listing deactivated following food safety report.' : 'Report reviewed and dismissed as compliant.',
        deactivateListing
      });
      showToast(
        'Report Resolved',
        deactivateListing ? 'Listing flagged and taken down from marketplace' : 'Report dismissed',
        deactivateListing ? 'warning' : 'info'
      );
      loadReports();
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Badge variant="citrus" size="sm" className="mb-2 uppercase font-bold tracking-wider">
          Safety Moderation
        </Badge>
        <h1 className="text-3xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
          Food Safety & Inaccuracy Reports
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
          Review community reports regarding food conditions, temperature breaches, or quantity disputes.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="h-36 rounded-2xl bg-cream-200/60 dark:bg-charcoal-800/60 animate-pulse border border-cream-300 dark:border-charcoal-800" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-charcoal-900 rounded-3xl border border-cream-300 dark:border-charcoal-800 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <p className="text-lg font-bold text-forest-950 dark:text-cream-50 font-editorial">No pending reports</p>
          <p className="text-xs text-charcoal-400">All community listings comply with platform standards.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(rep => (
            <div
              key={rep.id}
              className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                  <h3 className="font-bold text-base text-forest-950 dark:text-cream-50">
                    Report on "{rep.listing_title}"
                  </h3>
                </div>
                <Badge
                  variant={rep.status === 'PENDING' ? 'citrus' : rep.status === 'ACTION_TAKEN' ? 'danger' : 'cream'}
                  size="sm"
                >
                  {rep.status}
                </Badge>
              </div>

              <div className="p-3.5 rounded-2xl bg-red-50/70 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 text-xs space-y-1.5">
                <p className="font-bold text-red-950 dark:text-red-200">Reason: {rep.reason}</p>
                <p className="text-charcoal-700 dark:text-cream-200 leading-relaxed italic">"{rep.description}"</p>
                <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400 pt-1">
                  Reported by: <strong>{rep.reporter_name}</strong> ({rep.reporter_email}) • Donor: <strong>{rep.donor_business_name}</strong>
                </p>
              </div>

              {rep.status === 'PENDING' && (
                <div className="flex justify-end gap-2 pt-2 border-t border-cream-200 dark:border-charcoal-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolve(rep.id, false)}
                    className="text-xs"
                  >
                    Dismiss Report
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleResolve(rep.id, true)}
                    className="text-xs"
                  >
                    Deactivate & Flag Listing
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
