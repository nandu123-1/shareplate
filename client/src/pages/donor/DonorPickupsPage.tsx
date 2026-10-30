import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { DonationRequest } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  Clock,
  KeyRound,
  CheckCircle2,
  MapPin,
  Phone,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const DonorPickupsPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [pickups, setPickups] = useState<DonationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Verification modal state
  const [activeVerify, setActiveVerify] = useState<DonationRequest | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [handoffNote, setHandoffNote] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [completionResult, setCompletionResult] = useState<any | null>(null);

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

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVerify) return;

    setIsVerifying(true);
    try {
      const res = await api.verifyAndCompletePickup(
        activeVerify.id,
        inputCode,
        handoffNote
      );

      // Trigger celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setCompletionResult(res);
      showToast('Handover Completed!', 'Food redistribution verified and logged.', 'success');
      loadPickups();
    } catch (err: any) {
      showToast('Verification Failed', err.message, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Badge variant="forest" size="sm" className="mb-2 uppercase font-bold tracking-wider">
          Scheduled Pickups
        </Badge>
        <h1 className="text-3xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
          Active Pickup Coordination
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
          Verify recipient handover using the secure 6-digit confirmation code.
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
          <p className="text-lg font-bold text-forest-950 dark:text-cream-50 font-editorial">No pickups currently scheduled</p>
          <p className="text-xs text-charcoal-400">Accepted food requests ready for collection will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pickups.map(pickup => (
            <div
              key={pickup.id}
              className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft-sm space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="forest" size="sm" className="mb-1">
                      {pickup.listing_category || 'Surplus'}
                    </Badge>
                    <h3 className="text-lg font-bold text-forest-950 dark:text-cream-100 font-editorial line-clamp-1">
                      {pickup.listing_title}
                    </h3>
                  </div>
                  <Badge variant="citrus" size="sm">
                    {pickup.requested_quantity} {pickup.unit}
                  </Badge>
                </div>

                <div className="p-3 rounded-xl bg-cream-100 dark:bg-charcoal-800 border border-cream-200 dark:border-charcoal-700 text-xs space-y-1.5">
                  <p className="font-semibold text-charcoal-900 dark:text-cream-100">
                    Recipient: {pickup.recipient_org_name}
                  </p>
                  <p className="text-charcoal-500 dark:text-charcoal-400">
                    Phone: <strong className="text-charcoal-800 dark:text-cream-200">{pickup.recipient_phone}</strong>
                  </p>
                  <div className="flex items-center gap-1.5 text-forest-800 dark:text-emerald-400 pt-1">
                    <Clock className="w-3.5 h-3.5 text-forest-600 dark:text-emerald-400" />
                    <span>Scheduled for: <strong>{new Date(pickup.proposed_pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</strong></span>
                  </div>
                </div>

                {/* Secure Handover Code Box */}
                <div className="p-3.5 rounded-xl bg-forest-950 dark:bg-charcoal-950 text-cream-50 flex items-center justify-between border border-transparent dark:border-charcoal-800">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-citrus-400" />
                    <span className="text-xs text-cream-300">Expected Code:</span>
                  </div>
                  <span className="font-mono text-base font-bold tracking-widest text-citrus-400">
                    {pickup.verification_code || '------'}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setActiveVerify(pickup);
                  setInputCode(pickup.verification_code || '');
                  setCompletionResult(null);
                }}
                className="w-full justify-center"
              >
                Verify & Confirm Handover
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Verification Dialog */}
      <Modal
        isOpen={!!activeVerify}
        onClose={() => setActiveVerify(null)}
        title="Confirm Food Collection"
        subtitle={activeVerify?.listing_title}
        maxWidth="md"
      >
        {completionResult ? (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-forest-950 dark:text-cream-50 font-editorial">
              Handover Successfully Verified!
            </h3>
            <p className="text-xs text-charcoal-600 dark:text-charcoal-300 max-w-sm mx-auto">
              {completionResult.quantity} {completionResult.unit} successfully redistributed to {activeVerify?.recipient_org_name}.
            </p>

            <div className="p-4 rounded-2xl bg-cream-100 dark:bg-charcoal-800 border border-cream-200 dark:border-charcoal-700 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-charcoal-400 font-semibold uppercase text-[10px] block">Food Rescued</span>
                <span className="text-lg font-bold text-forest-900 dark:text-emerald-400">~{completionResult.estimatedKgSaved} kg</span>
              </div>
              <div>
                <span className="text-charcoal-400 font-semibold uppercase text-[10px] block">CO2e Prevented</span>
                <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">~{completionResult.co2PreventedKg} kg</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setActiveVerify(null)}
              className="w-full justify-center"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-cream-100 dark:bg-charcoal-800 border border-cream-200 dark:border-charcoal-700 text-xs space-y-1">
              <p className="text-charcoal-700 dark:text-cream-200">
                Authorized Volunteer: <strong>{activeVerify?.recipient_org_name}</strong>
              </p>
              <p className="text-charcoal-500 dark:text-charcoal-400">
                Quantity: <strong>{activeVerify?.requested_quantity} {activeVerify?.unit}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1">
                Enter Recipient's 6-Digit Pickup Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={inputCode}
                onChange={e => setInputCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold py-3 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-forest-950 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
              <p className="text-[11px] text-charcoal-400 mt-1">
                The volunteer or driver will show this code on their mobile device.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1">
                Kitchen Handover Note (Optional)
              </label>
              <textarea
                value={handoffNote}
                onChange={e => setHandoffNote(e.target.value)}
                rows={2}
                placeholder="e.g. Verified cold pack temperature; all 3 trays collected."
                className="w-full p-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-xs focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-cream-200 dark:border-charcoal-800">
              <Button type="button" variant="outline" size="md" onClick={() => setActiveVerify(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isVerifying}>
                Confirm Handover
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
