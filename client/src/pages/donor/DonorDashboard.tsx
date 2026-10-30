import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { FoodListing, DonationRequest } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  PlusCircle,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  MapPin,
  Sparkles
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [myListings, setMyListings] = useState<FoodListing[]>([]);
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDonorData = async () => {
    setIsLoading(true);
    try {
      const [listingsData, requestsData] = await Promise.all([
        api.getListings({ limit: '50' }), // Can filter by donor
        api.getMyRequests()
      ]);

      // Filter listings for this donor
      const donorListings = listingsData.listings.filter(
        l => l.donor_id === user?.id
      );
      setMyListings(donorListings);
      setRequests(requestsData.requests);
    } catch (err) {
      console.error('Failed to load donor dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDonorData();
  }, [user]);

  // Handle accept request
  const handleAcceptRequest = async (requestId: string) => {
    try {
      const res = await api.acceptRequest(requestId);
      showToast(
        'Request Accepted! 🎉',
        `Reserved inventory. Handover code: ${res.verificationCode}`,
        'success'
      );
      loadDonorData();
    } catch (err: any) {
      showToast('Accept Error', err.message, 'error');
    }
  };

  // Handle reject request
  const handleRejectRequest = async (requestId: string) => {
    try {
      await api.rejectRequest(requestId, 'Kitchen schedule constraint');
      showToast('Request Declined', 'Notification sent to recipient organization', 'info');
      loadDonorData();
    } catch (err: any) {
      showToast('Reject Error', err.message, 'error');
    }
  };

  // Metrics
  const activeListings = myListings.filter(l => l.status === 'AVAILABLE' || l.status === 'PARTIALLY_RESERVED');
  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const acceptedRequests = requests.filter(r => r.status === 'ACCEPTED');
  const completedRequests = requests.filter(r => r.status === 'COMPLETED');
  const totalPortionsRedistributed = completedRequests.reduce((acc, r) => acc + r.requested_quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="forest" size="sm" className="mb-2 uppercase font-bold tracking-wider">
            Donor Workspace
          </Badge>
          <h1 className="text-3xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
            Kitchen Dashboard
          </h1>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-0.5">
            Manage surplus food listings, incoming community requests, and coordinated pickups.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/donor/create-listing')}
          icon={<PlusCircle className="w-4 h-4 text-citrus-400" />}
        >
          Create Food Donation
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-400 uppercase tracking-wider block">
            Active Listings
          </span>
          <p className="text-3xl font-black text-forest-950 dark:text-cream-50 font-editorial mt-1">
            {activeListings.length}
          </p>
          <span className="text-[11px] text-charcoal-500 dark:text-charcoal-400 mt-1 block">
            Available surplus in network
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-400 uppercase tracking-wider block">
            Pending Requests
          </span>
          <p className="text-3xl font-black text-citrus-500 font-editorial mt-1">
            {pendingRequests.length}
          </p>
          <span className="text-[11px] text-charcoal-500 dark:text-charcoal-400 mt-1 block">
            Awaiting your approval
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-400 uppercase tracking-wider block">
            Active Pickups
          </span>
          <p className="text-3xl font-black text-forest-800 dark:text-emerald-400 font-editorial mt-1">
            {acceptedRequests.length}
          </p>
          <span className="text-[11px] text-charcoal-500 dark:text-charcoal-400 mt-1 block">
            Scheduled for today
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-400 uppercase tracking-wider block">
            Portions Donated
          </span>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-editorial mt-1">
            {totalPortionsRedistributed}
          </p>
          <span className="text-[11px] text-charcoal-500 dark:text-charcoal-400 mt-1 block">
            ~{Math.round(totalPortionsRedistributed * 0.4 * 2.5)} kg CO2e saved
          </span>
        </div>
      </div>

      {/* Pending Requests Needing Attention */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50/70 dark:bg-amber-950/20 p-6 rounded-3xl border border-amber-200/80 dark:border-amber-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-citrus-600" />
              <h3 className="text-base font-bold text-charcoal-900 dark:text-cream-100 font-editorial">
                Pending Requests Awaiting Review ({pendingRequests.length})
              </h3>
            </div>
            <Link to="/donor/requests" className="text-xs font-semibold text-citrus-700 dark:text-citrus-400 hover:underline">
              View All Requests
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map(req => (
              <div key={req.id} className="p-4 rounded-2xl bg-white dark:bg-charcoal-800 border border-amber-200 dark:border-charcoal-700 shadow-soft-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-forest-950 dark:text-cream-100">{req.listing_title}</h4>
                    <p className="text-xs text-charcoal-600 dark:text-charcoal-300 mt-0.5">
                      Requested by <strong className="text-charcoal-900 dark:text-cream-50">{req.recipient_org_name}</strong>
                    </p>
                  </div>
                  <Badge variant="citrus" size="sm">
                    {req.requested_quantity} {req.unit}
                  </Badge>
                </div>

                <div className="text-xs text-charcoal-500 dark:text-charcoal-400 space-y-1">
                  <p>Proposed Pickup: <strong className="text-charcoal-800 dark:text-cream-200">{new Date(req.proposed_pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</strong></p>
                  {req.notes && <p className="italic">"{req.notes}"</p>}
                </div>

                <div className="flex gap-2 pt-2 border-t border-cream-200 dark:border-charcoal-700">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => handleRejectRequest(req.id)}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => handleAcceptRequest(req.id)}
                  >
                    Accept & Lock
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Listings Table */}
      <div className="bg-white dark:bg-charcoal-900 p-6 rounded-3xl border border-cream-300 dark:border-charcoal-800 shadow-soft-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-forest-950 dark:text-cream-50 font-editorial">
              Your Food Listings
            </h3>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-0.5">
              Live status, remaining surplus inventory, and pickup windows.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/donor/create-listing')}
            icon={<PlusCircle className="w-4 h-4 text-forest-900 dark:text-emerald-400" />}
          >
            New Listing
          </Button>
        </div>

        {isLoading ? (
          <div className="h-40 rounded-xl bg-cream-100 dark:bg-charcoal-800 animate-pulse" />
        ) : myListings.length === 0 ? (
          <div className="p-12 text-center bg-cream-50 dark:bg-charcoal-850 rounded-2xl border border-cream-200 dark:border-charcoal-800 space-y-3">
            <Package className="w-8 h-8 text-charcoal-400 mx-auto" />
            <p className="text-sm font-semibold text-charcoal-700 dark:text-cream-200">No food listings published yet</p>
            <p className="text-xs text-charcoal-400">List your restaurant or bakery surplus so local shelters can collect it.</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/donor/create-listing')}
            >
              Create First Listing
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal-700 dark:text-charcoal-300">
              <thead className="bg-cream-100 dark:bg-charcoal-800 text-charcoal-500 dark:text-charcoal-300 uppercase tracking-wider font-semibold border-b border-cream-200 dark:border-charcoal-700">
                <tr>
                  <th className="p-3.5">Food Item</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Available / Total</th>
                  <th className="p-3.5">Pickup Window</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 dark:divide-charcoal-800">
                {myListings.map(listing => (
                  <tr key={listing.id} className="hover:bg-cream-50/80 dark:hover:bg-charcoal-800/60 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={listing.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80'}
                          alt={listing.title}
                          className="w-10 h-10 rounded-lg object-cover bg-cream-200 dark:bg-charcoal-800 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-forest-950 dark:text-cream-100 text-sm">{listing.title}</p>
                          <p className="text-[11px] text-charcoal-400 line-clamp-1">{listing.pickup_location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <Badge variant="sage" size="sm">{listing.category}</Badge>
                    </td>
                    <td className="p-3.5 font-bold">
                      <span className={listing.remaining_quantity === 0 ? 'text-charcoal-400' : 'text-forest-900 dark:text-emerald-400'}>
                        {listing.remaining_quantity}
                      </span>
                      <span className="text-charcoal-400 font-normal"> / {listing.quantity} {listing.unit}</span>
                    </td>
                    <td className="p-3.5 text-charcoal-500 dark:text-charcoal-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-forest-700 dark:text-emerald-400 shrink-0" />
                        <span>{new Date(listing.pickup_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          listing.status === 'AVAILABLE'
                            ? 'forest'
                            : listing.status === 'PARTIALLY_RESERVED'
                            ? 'citrus'
                            : listing.status === 'COMPLETED'
                            ? 'success'
                            : 'cream'
                        }
                        size="sm"
                      >
                        {listing.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <Link to="/donor/requests">
                        <Button variant="ghost" size="sm" className="text-xs">
                          Requests
                        </Button>
                      </Link>
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
