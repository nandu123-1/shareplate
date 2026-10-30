import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DonationRequest } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Clock, MapPin, Package, KeyRound, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecipientRequestsPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMyRequests();
      setRequests(res.requests);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCancelRequest = async (id: string) => {
    if (!confirm('Are you sure you wish to cancel this food request? Any reserved portions will be returned to the donor.')) {
      return;
    }
    try {
      await api.cancelRequest(id, 'Cancelled by recipient organization');
      showToast('Request Cancelled', 'Reserved food returned to donor available pool.', 'info');
      loadRequests();
    } catch (err: any) {
      showToast('Cancel Failed', err.message, 'error');
    }
  };

  const filteredRequests = statusFilter === 'ALL'
    ? requests
    : requests.filter(r => r.status === statusFilter);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="forest" size="sm" className="mb-2 uppercase font-bold tracking-wider">
            Requests Log
          </Badge>
          <h1 className="text-3xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
            Your Food Donation Requests
          </h1>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
            Track requested portions, donor review statuses, and pickup scheduling.
          </p>
        </div>

        <Link to="/explore">
          <Button variant="primary" size="md">
            + Request More Food
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === st
                ? 'bg-forest-900 dark:bg-forest-700 text-white'
                : 'bg-white dark:bg-charcoal-900 text-charcoal-700 dark:text-charcoal-300 hover:bg-cream-200 dark:hover:bg-charcoal-800 border border-cream-300 dark:border-charcoal-800'
            }`}
          >
            {st} ({st === 'ALL' ? requests.length : requests.filter(r => r.status === st).length})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-32 rounded-2xl bg-cream-200/60 dark:bg-charcoal-900/60 animate-pulse border border-cream-300 dark:border-charcoal-800" />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-charcoal-900 rounded-3xl border border-cream-300 dark:border-charcoal-800 space-y-2">
          <Package className="w-8 h-8 text-charcoal-400 dark:text-charcoal-500 mx-auto" />
          <p className="text-base font-bold text-forest-950 dark:text-cream-50 font-editorial">No requests in this view</p>
          <p className="text-xs text-charcoal-400 dark:text-charcoal-500">Browse the live surplus catalog to request food for your programs.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(req => (
            <div
              key={req.id}
              className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-forest-950 dark:text-cream-50 font-editorial">
                    {req.listing_title}
                  </h3>
                  <Badge
                    variant={
                      req.status === 'ACCEPTED'
                        ? 'forest'
                        : req.status === 'PENDING'
                        ? 'citrus'
                        : req.status === 'COMPLETED'
                        ? 'success'
                        : 'outline'
                    }
                    size="sm"
                  >
                    {req.status}
                  </Badge>
                </div>

                <div className="text-xs text-charcoal-600 dark:text-charcoal-300 space-y-1">
                  <p>Donor: <strong className="text-charcoal-900 dark:text-cream-100">{req.donor_business_name}</strong></p>
                  <p>Requested Quantity: <strong className="text-forest-800 dark:text-sage-400">{req.requested_quantity} {req.unit}</strong></p>
                  <p className="text-charcoal-500 dark:text-charcoal-400">
                    Pickup Location: {req.listing_pickup_location}
                  </p>
                  <div className="flex items-center gap-2 text-charcoal-500 dark:text-charcoal-400">
                    <Clock className="w-3.5 h-3.5 text-forest-700 dark:text-sage-400" />
                    <span>Proposed Pickup: {new Date(req.proposed_pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                  </div>
                  {req.cancellation_reason && (
                    <p className="text-red-700 dark:text-red-300 italic bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-2 rounded-lg mt-1">
                      Note: {req.cancellation_reason}
                    </p>
                  )}
                </div>

                {/* Handover verification code banner if accepted */}
                {req.status === 'ACCEPTED' && req.verification_code && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-forest-900 dark:bg-forest-950 text-cream-50 text-xs font-bold mt-1 border border-forest-800 dark:border-forest-700">
                    <KeyRound className="w-4 h-4 text-citrus-400" />
                    <span>Your Handover Code: <span className="font-mono tracking-widest text-sm text-citrus-400">{req.verification_code}</span></span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:shrink-0">
                {req.status === 'ACCEPTED' ? (
                  <Link to="/recipient/pickups">
                    <Button variant="primary" size="sm">
                      View Pickup Pass
                    </Button>
                  </Link>
                ) : null}

                {(req.status === 'PENDING' || req.status === 'ACCEPTED') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelRequest(req.id)}
                    className="text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    Cancel Request
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
