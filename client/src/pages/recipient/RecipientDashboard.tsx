import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DonationRequest, FoodListing } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  HeartHandshake,
  Clock,
  CheckCircle2,
  Package,
  Sparkles,
  KeyRound,
  MapPin,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const RecipientDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [recommended, setRecommended] = useState<FoodListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecipientData() {
      setIsLoading(true);
      try {
        const [reqsData, listingsData] = await Promise.all([
          api.getMyRequests(),
          api.getListings({ limit: '4', status: 'AVAILABLE' })
        ]);
        setRequests(reqsData.requests);
        setRecommended(listingsData.listings);
      } catch (err) {
        console.error('Failed to load recipient dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRecipientData();
  }, [user]);

  const activePickups = requests.filter(r => r.status === 'ACCEPTED');
  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const completedRequests = requests.filter(r => r.status === 'COMPLETED');
  const totalPortionsReceived = completedRequests.reduce((acc, r) => acc + r.requested_quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="forest" size="sm" className="mb-2 uppercase font-bold tracking-wider">
            Organization Workspace
          </Badge>
          <h1 className="text-3xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
            Recipient Hub
          </h1>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-0.5">
            Track community food requests, active collection codes, and nutritional distributions.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/explore')}
          icon={<Package className="w-4 h-4 text-citrus-400" />}
        >
          Browse Available Food
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-400 uppercase tracking-wider block">
            Upcoming Pickups
          </span>
          <p className="text-3xl font-black text-forest-950 dark:text-cream-50 font-editorial mt-1">
            {activePickups.length}
          </p>
          <span className="text-[11px] text-charcoal-500 dark:text-charcoal-400 mt-1 block">
            Approved & ready to collect
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
            Under donor kitchen review
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-400 uppercase tracking-wider block">
            Portions Collected
          </span>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-editorial mt-1">
            {totalPortionsReceived}
          </p>
          <span className="text-[11px] text-charcoal-500 dark:text-charcoal-400 mt-1 block">
            Meals delivered to clients
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-400 uppercase tracking-wider block">
            Carbon Prevented
          </span>
          <p className="text-3xl font-black text-forest-800 dark:text-emerald-400 font-editorial mt-1">
            {Math.round(totalPortionsReceived * 0.4 * 2.5)} kg
          </p>
          <span className="text-[11px] text-charcoal-500 dark:text-charcoal-400 mt-1 block">
            CO2 equivalent avoided
          </span>
        </div>
      </div>

      {/* Active Pickups Banner with Codes */}
      {activePickups.length > 0 && (
        <div className="bg-forest-950 dark:bg-charcoal-900 text-cream-50 p-6 rounded-3xl space-y-4 shadow-soft-md border border-transparent dark:border-charcoal-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-citrus-400" />
              <h3 className="text-base font-bold font-editorial text-white">
                Upcoming Collections Awaiting Handover ({activePickups.length})
              </h3>
            </div>
            <Link to="/recipient/pickups" className="text-xs font-semibold text-citrus-400 hover:underline">
              View All Pickup Codes
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePickups.map(pickup => (
              <div
                key={pickup.id}
                className="p-4 rounded-2xl bg-forest-900 dark:bg-charcoal-850 border border-forest-800 dark:border-charcoal-700 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-white line-clamp-1">{pickup.listing_title}</h4>
                  <p className="text-xs text-cream-300/80 dark:text-cream-200/80">
                    Donor: <strong>{pickup.donor_business_name}</strong>
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-cream-400">
                    <Clock className="w-3 h-3 text-citrus-400" />
                    <span>Time: {new Date(pickup.proposed_pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-cream-400 uppercase font-bold tracking-wider block">Show Code</span>
                  <div className="px-3 py-1.5 rounded-xl bg-forest-950 dark:bg-charcoal-950 border border-citrus-500/50 text-citrus-400 font-mono text-base font-black tracking-widest">
                    {pickup.verification_code || '------'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Recommendations Section */}
      <div className="bg-white dark:bg-charcoal-900 p-6 rounded-3xl border border-cream-300 dark:border-charcoal-800 shadow-soft-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-citrus-500" />
            <div>
              <h3 className="text-xl font-bold text-forest-950 dark:text-cream-50 font-editorial">
                Surplus Matching Your Shelter Profile
              </h3>
              <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                Recommended based on your daily capacity ({profile && 'capacity_portions_per_day' in profile ? profile.capacity_portions_per_day : 150} portions/day).
              </p>
            </div>
          </div>

          <Link to="/explore">
            <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
              Explore All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommended.slice(0, 4).map(item => (
            <div
              key={item.id}
              onClick={() => navigate('/explore')}
              className="p-4 rounded-2xl bg-cream-50 dark:bg-charcoal-800 border border-cream-200/80 dark:border-charcoal-700 hover:shadow-soft-sm hover:border-forest-300 dark:hover:border-emerald-500 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-2">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                  alt={item.title}
                  className="w-full h-32 rounded-xl object-cover"
                />
                <Badge variant="citrus" size="sm">{item.category}</Badge>
                <h4 className="font-bold text-xs text-forest-950 dark:text-cream-100 line-clamp-1">{item.title}</h4>
                <p className="text-xs text-forest-900 dark:text-emerald-400 font-semibold">{item.remaining_quantity} {item.unit} available</p>
              </div>
              <span className="text-[11px] text-forest-800 dark:text-emerald-400 font-bold mt-3 block">
                Claim Portion →
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
