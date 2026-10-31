import React, { useState } from 'react';
import { FoodListing } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface RequestFoodModalProps {
  listing: FoodListing | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RequestFoodModal: React.FC<RequestFoodModalProps> = ({
  listing,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [requestedQuantity, setRequestedQuantity] = useState<number>(0);
  const [proposedPickupTime, setProposedPickupTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize requested quantity to remaining quantity when opened
  React.useEffect(() => {
    if (listing) {
      setRequestedQuantity(listing.remaining_quantity);
      // Default to 1 hour from now for demo convenience
      const defaultTime = new Date(Date.now() + 3600 * 1000).toISOString().slice(0, 16);
      setProposedPickupTime(defaultTime);
    }
  }, [listing]);

  if (!listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast('Login Required', 'Please log in as an authorized recipient organization.', 'warning');
      navigate('/login');
      return;
    }

    if (user.role !== 'RECIPIENT') {
      showToast('Role Restriction', 'Only registered charitable organizations and NGOs can request food.', 'error');
      return;
    }

    if (requestedQuantity <= 0 || requestedQuantity > listing.remaining_quantity) {
      showToast('Invalid Quantity', `Quantity must be between 1 and ${listing.remaining_quantity} ${listing.unit}.`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createRequest({
        listingId: listing.id,
        requestedQuantity,
        proposedPickupTime,
        notes
      });

      showToast(
        'Request Sent!',
        `Your request for ${requestedQuantity} ${listing.unit} of "${listing.title}" has been submitted to the donor.`,
        'success'
      );

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast('Request Failed', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Food Donation"
      subtitle={`Connecting with ${listing.donor_business_name || 'Donor'}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-xl bg-cream-100 dark:bg-charcoal-800/80 border border-cream-200 dark:border-charcoal-700">
          <p className="font-semibold text-sm text-forest-950 dark:text-cream-50">{listing.title}</p>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-0.5">
            Surplus available: <strong className="text-forest-800 dark:text-emerald-400">{listing.remaining_quantity} {listing.unit}</strong>
          </p>
        </div>

        {/* Quantity requested input */}
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1">
            Quantity to Request ({listing.unit})
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={listing.remaining_quantity}
              value={requestedQuantity}
              onChange={e => setRequestedQuantity(Math.max(1, Math.min(listing.remaining_quantity, Number(e.target.value))))}
              required
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 font-semibold focus:outline-none focus:ring-2 focus:ring-forest-800 text-sm"
            />
            <button
              type="button"
              onClick={() => setRequestedQuantity(listing.remaining_quantity)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-cream-200 dark:bg-charcoal-700 text-forest-900 dark:text-emerald-300 hover:bg-cream-300 dark:hover:bg-charcoal-600 transition-colors"
            >
              Take All ({listing.remaining_quantity})
            </button>
          </div>
        </div>

        {/* Proposed pickup date & time */}
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1">
            Proposed Collection Time
          </label>
          <input
            type="datetime-local"
            value={proposedPickupTime}
            onChange={e => setProposedPickupTime(e.target.value)}
            required
            className="w-full px-3.5 py-2 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800"
          />
          <p className="text-[11px] text-charcoal-400 dark:text-charcoal-400 mt-1">
            Donor window: {(() => {
              try {
                const s = listing.pickup_start ? new Date(listing.pickup_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Flexible';
                const e = listing.pickup_end ? new Date(listing.pickup_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Flexible';
                return `${s} - ${e}`;
              } catch {
                return 'Flexible pickup schedule';
              }
            })()}
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1">
            Logistics & Vehicle Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Volunteer food rescue van arriving at loading dock; insulated boxes ready."
            className="w-full px-3.5 py-2 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800"
          />
        </div>

        {/* Temperature & handling acknowledgement */}
        <div className="p-3 rounded-xl bg-forest-50/70 dark:bg-forest-950/40 border border-forest-100 dark:border-forest-900/60 text-xs text-forest-900 dark:text-emerald-300 space-y-1">
          <p className="font-semibold">Food Rescue Protocol:</p>
          <p className="text-[11px] text-forest-800 dark:text-emerald-200/90">
            By requesting, your organization agrees to collect with suitable thermal transport containers following safe food handling guidelines.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-cream-200 dark:border-charcoal-800">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
            Send Pickup Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
