import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { History, ShieldCheck } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setIsLoading(true);
      try {
        const res = await api.getAuditLogs();
        setLogs(res.logs);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Badge variant="forest" size="sm" className="mb-2 uppercase font-bold tracking-wider">
          Compliance
        </Badge>
        <h1 className="text-3xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
          System Audit Trail & History
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
          Cryptographically recorded state machine events, handovers, and inventory alterations.
        </p>
      </div>

      <div className="bg-white dark:bg-charcoal-900 rounded-3xl border border-cream-300 dark:border-charcoal-800 shadow-soft-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-12 rounded-xl bg-cream-100 dark:bg-charcoal-800 animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-xs text-charcoal-400">
            No audit log entries found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal-700 dark:text-charcoal-300">
              <thead className="bg-cream-100 dark:bg-charcoal-800 text-charcoal-500 dark:text-charcoal-300 uppercase tracking-wider font-semibold border-b border-cream-200 dark:border-charcoal-700">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Listing Title</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Transition Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 dark:divide-charcoal-800">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-cream-50/80 dark:hover:bg-charcoal-800/60 transition-colors">
                    <td className="p-4 text-charcoal-500 dark:text-charcoal-400 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="p-4 font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.action === 'COMPLETED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                            : log.action === 'ACCEPTED'
                            ? 'bg-citrus-100 dark:bg-citrus-950/80 text-citrus-800 dark:text-citrus-300'
                            : log.action === 'CANCELLED' || log.action === 'REJECTED'
                            ? 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300'
                            : 'bg-forest-100 dark:bg-forest-950/80 text-forest-800 dark:text-emerald-300'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-charcoal-900 dark:text-cream-100 max-w-xs truncate">
                      {log.listing_title}
                    </td>
                    <td className="p-4 text-charcoal-600 dark:text-charcoal-300">
                      {log.performer_name} <span className="text-[10px] opacity-75">({log.performer_role})</span>
                    </td>
                    <td className="p-4 text-charcoal-600 dark:text-charcoal-300 max-w-md truncate">
                      {log.details || `Status: ${log.previous_status || 'NONE'} → ${log.new_status}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
