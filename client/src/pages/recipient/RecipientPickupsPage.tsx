import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { DonationRequest } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Clock,
  KeyRound,
  CheckCircle2,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const RecipientPickupsPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [pickups, setPickups] = useState<DonationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState<string | null>(null);

  const loadPickups = async () => {
    setIsLoading(true);
    try {
      const res = await api.getActivePickups();
      setPickups(res.pickups);
    } catch (err) {
      console.error('Failed to load active pickups:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPickups();
  }, []);

  const handleConfirmReceipt = async (id: string) => {
    setIsConfirming(id);
    try {
      await api.verifyAndCompletePickup(id);

      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 }
      });

      showToast(
        'Collection Confirmed! 🎉',
        'Thank you! The food donation has been marked completed.',
        'success'
      );
      loadPickups();
    } catch (err: any) {
      showToast('Confirmation Error', err.message, 'error');
    } finally {
      setIsConfirming(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Badge variant="forest" size="sm" className="mb-2 uppercase font-bold tracking-wider">
          Digital Passes
        </Badge>
        <h1 className="text-3xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
          Active Pickup Passes & Codes
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
          Present the 6-digit confirmation code below to the commercial kitchen staff upon collection.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="h-44 rounded-2xl bg-cream-200/60 dark:bg-charcoal-800/60 animate-pulse border border-cream-300 dark:border-charcoal-800" />
          ))}
        </div>
      ) : pickups.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-charcoal-900 rounded-3xl border border-cream-300 dark:border-charcoal-800 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <p className="text-lg font-bold text-forest-950 dark:text-cream-50 font-editorial">No active collections waiting</p>
          <p className="text-xs text-charcoal-400">Accepted food requests ready for pickup will appear here with your verification code.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pickups.map(pickup => (
            <div
              key={pickup.id}
              className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="citrus" size="sm" className="mb-1">
                      {pickup.listing_category || 'Surplus'}
                    </Badge>
                    <h3 className="text-xl font-bold text-forest-950 dark:text-cream-50 font-editorial line-clamp-1">
                      {pickup.listing_title}
                    </h3>
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-0.5">
                      Offered by <strong className="text-charcoal-900 dark:text-cream-200">{pickup.donor_business_name}</strong>
                    </p>
                  </div>
                  <Badge variant="forest" size="sm">
                    {pickup.requested_quantity} {pickup.unit}
                  </Badge>
                </div>

                {/* Digital Verification Pass Badge */}
                <div className="p-4 rounded-2xl bg-forest-950 dark:bg-charcoal-950 text-cream-50 text-center space-y-1 shadow-soft-sm border border-transparent dark:border-charcoal-800">
                  <span className="text-[10px] text-cream-400 uppercase tracking-widest font-bold">
                    Official Handover Pass
                  </span>
                  <p className="text-3xl font-mono font-black tracking-widest text-citrus-400">
                    {pickup.verification_code || '------'}
                  </p>
                  <p className="text-[10px] text-cream-300/80">Show this code to donor at kitchen pickup</p>
                </div>

                {/* Logistics Info */}
                <div className="space-y-2 text-xs text-charcoal-600 dark:text-charcoal-300">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-forest-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-charcoal-900 dark:text-cream-100">{pickup.listing_pickup_location}</p>
                      <p className="text-charcoal-500 dark:text-charcoal-400">{pickup.donor_pickup_address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-forest-700 dark:text-emerald-400 shrink-0" />
                    <span>Scheduled Time: <strong>{new Date(pickup.proposed_pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</strong></span>
                  </div>

                  {pickup.donor_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-forest-700 dark:text-emerald-400 shrink-0" />
                      <span>Donor Phone: <strong>{pickup.donor_phone}</strong></span>
                    </div>
                  )}

                  {pickup.listing_storage_instructions && (
                    <div className="p-2 rounded-lg bg-forest-50 dark:bg-forest-950/40 border border-forest-100 dark:border-forest-900/60 text-[11px] text-forest-900 dark:text-emerald-300 flex items-center gap-1.5 mt-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-forest-700 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">{pickup.listing_storage_instructions}</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => handleConfirmReceipt(pickup.id)}
                isLoading={isConfirming === pickup.id}
                className="w-full justify-center"
              >
                Confirm Food Collected
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
