import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { DonationRequest } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Clock, CheckCircle2, XCircle, Phone, Package, KeyRound } from 'lucide-react';

export const DonorRequestsPage: React.FC = () => {
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

  const handleAccept = async (id: string) => {
    try {
      const res = await api.acceptRequest(id);
      showToast(
        'Request Accepted! 🎉',
        `Inventory reserved. Handover verification code: ${res.verificationCode}`,
        'success'
      );
      loadRequests();
    } catch (err: any) {
      showToast('Accept Error', err.message, 'error');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.rejectRequest(id, 'Kitchen capacity limitation');
      showToast('Request Declined', 'Notification sent to recipient organization', 'info');
      loadRequests();
    } catch (err: any) {
      showToast('Decline Error', err.message, 'error');
    }
  };

  const filteredRequests = statusFilter === 'ALL'
    ? requests
    : requests.filter(r => r.status === statusFilter);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Badge variant="forest" size="sm" className="mb-2 uppercase font-bold tracking-wider">
          Donor Coordination
        </Badge>
        <h1 className="text-3xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
          Incoming Food Requests
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
          Review requests submitted by charitable organizations for your surplus food listings.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === st
                ? 'bg-forest-900 dark:bg-emerald-600 text-white'
                : 'bg-white dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-300 hover:bg-cream-200 dark:hover:bg-charcoal-700 border border-cream-300 dark:border-charcoal-700'
            }`}
          >
            {st} ({st === 'ALL' ? requests.length : requests.filter(r => r.status === st).length})
          </button>
        ))}
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-32 rounded-2xl bg-cream-200/60 dark:bg-charcoal-800/60 animate-pulse border border-cream-300 dark:border-charcoal-800" />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-charcoal-900 rounded-3xl border border-cream-300 dark:border-charcoal-800 space-y-2">
          <Package className="w-8 h-8 text-charcoal-400 mx-auto" />
          <p className="text-base font-bold text-forest-950 dark:text-cream-50 font-editorial">No requests found</p>
          <p className="text-xs text-charcoal-400">Requests sent by recipient organizations will appear here.</p>
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
                  <h3 className="text-lg font-bold text-forest-950 dark:text-cream-100 font-editorial">
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
                  <p>
                    Recipient: <strong className="text-charcoal-900 dark:text-cream-100">{req.recipient_org_name}</strong> ({req.recipient_org_type || 'Charity'})
                  </p>
                  <p>
                    Requested Surplus: <strong className="text-forest-800 dark:text-emerald-400">{req.requested_quantity} {req.unit}</strong>
                  </p>
                  <div className="flex items-center gap-2 text-charcoal-500 dark:text-charcoal-400">
                    <Clock className="w-3.5 h-3.5 text-forest-700 dark:text-emerald-400" />
                    <span>Proposed Pickup: <strong>{new Date(req.proposed_pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</strong></span>
                  </div>
                  {req.recipient_phone && (
                    <div className="flex items-center gap-2 text-charcoal-500 dark:text-charcoal-400">
                      <Phone className="w-3.5 h-3.5 text-forest-700 dark:text-emerald-400" />
                      <span>Phone: {req.recipient_phone}</span>
                    </div>
                  )}
                  {req.notes && (
                    <p className="italic text-charcoal-500 dark:text-charcoal-300 bg-cream-100 dark:bg-charcoal-800 p-2 rounded-lg mt-1 border border-cream-200 dark:border-charcoal-700">
                      "{req.notes}"
                    </p>
                  )}
                </div>

                {req.verification_code && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-forest-100 dark:bg-forest-950/80 border border-forest-200 dark:border-forest-800 text-forest-900 dark:text-emerald-300 text-xs font-bold mt-1">
                    <KeyRound className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
                    <span>Handover Code: <span className="font-mono tracking-widest text-sm">{req.verification_code}</span></span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:shrink-0">
                {req.status === 'PENDING' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(req.id)}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAccept(req.id)}
                    >
                      Accept & Reserve
                    </Button>
                  </>
                ) : req.status === 'ACCEPTED' ? (
                  <Link to="/donor/pickups">
                    <Button variant="secondary" size="sm">
                      Go to Pickup Verification
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
