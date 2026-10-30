import React, { useState } from 'react';
import { Clock, MapPin, ShieldCheck, AlertTriangle, Phone, Flag, Heart } from 'lucide-react';
import { FoodListing } from '../../types';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { api } from '../../services/api';

interface FoodDetailModalProps {
  listing: FoodListing | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestClick: (listing: FoodListing) => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  listing,
  isOpen,
  onClose,
  onRequestClick
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Spoiled or unsafe food');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  if (!listing) return null;

  const isAvailable = listing.status === 'AVAILABLE' || listing.status === 'PARTIALLY_RESERVED';

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Authentication Required', 'Please log in to report a listing.', 'warning');
      return;
    }
    setIsSubmittingReport(true);
    try {
      await api.submitReport({
        listingId: listing.id,
        reason: reportReason,
        description: reportDescription
      });
      showToast('Report Submitted', 'Our moderation team has been notified.', 'success');
      setIsReportOpen(false);
      setReportDescription('');
    } catch (err: any) {
      showToast('Submission Failed', err.message, 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-6">
        {/* Hero image and quick stats */}
        <div className="relative h-64 rounded-xl overflow-hidden bg-cream-200">
          <img
            src={listing.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="citrus" size="sm">
              {listing.category}
            </Badge>
            <Badge variant="forest" size="sm">
              {listing.status}
            </Badge>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-2xl font-bold tracking-tight font-editorial">
              {listing.title}
            </h3>
            <p className="text-sm opacity-90 mt-0.5">
              Offered by <span className="font-semibold">{listing.donor_business_name}</span> • {listing.donor_city}
            </p>
          </div>
        </div>

        {/* Quantities & Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-cream-100 dark:bg-charcoal-800/80 border border-cream-200 dark:border-charcoal-700">
          <div>
            <span className="text-[11px] text-charcoal-400 dark:text-charcoal-400 uppercase tracking-wider font-semibold">Surplus Available</span>
            <p className="text-xl font-bold text-forest-900 dark:text-emerald-400 mt-0.5">
              {listing.remaining_quantity} <span className="text-xs font-normal text-charcoal-500 dark:text-charcoal-400">{listing.unit}</span>
            </p>
          </div>
          <div>
            <span className="text-[11px] text-charcoal-400 dark:text-charcoal-400 uppercase tracking-wider font-semibold">Total Prepared</span>
            <p className="text-xl font-bold text-charcoal-800 dark:text-cream-100 mt-0.5">
              {listing.quantity} <span className="text-xs font-normal text-charcoal-500 dark:text-charcoal-400">{listing.unit}</span>
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[11px] text-charcoal-400 dark:text-charcoal-400 uppercase tracking-wider font-semibold">Cost</span>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
              100% Free
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold text-forest-950 dark:text-cream-100 uppercase tracking-wider mb-2">Description</h4>
          <p className="text-sm text-charcoal-700 dark:text-charcoal-300 leading-relaxed bg-white dark:bg-charcoal-800/80 p-3.5 rounded-xl border border-cream-200/80 dark:border-charcoal-700">
            {listing.description}
          </p>
        </div>

        {/* Storage, Expiry, Safety Protocols */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-forest-50/60 dark:bg-forest-950/40 border border-forest-100 dark:border-forest-900/60 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-forest-900 dark:text-emerald-300 mb-1">
              <ShieldCheck className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
              <span>Storage Instructions</span>
            </div>
            <p className="text-forest-800 dark:text-emerald-200/90 leading-relaxed">{listing.storage_instructions}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-citrus-50/60 dark:bg-citrus-950/40 border border-citrus-100 dark:border-citrus-900/60 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-citrus-900 dark:text-citrus-300 mb-1">
              <Clock className="w-4 h-4 text-citrus-700 dark:text-citrus-400" />
              <span>Use-By / Expiry Guidance</span>
            </div>
            <p className="text-citrus-800 dark:text-citrus-200/90 leading-relaxed">{listing.expiry_guidance}</p>
          </div>
        </div>

        {/* Dietary & Allergens */}
        <div className="flex flex-wrap gap-2 items-center">
          {listing.dietary_tags && listing.dietary_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center mr-4">
              <span className="text-xs text-charcoal-400 font-medium">Dietary:</span>
              {listing.dietary_tags.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full bg-cream-200 dark:bg-charcoal-700 text-charcoal-700 dark:text-cream-200 border border-cream-300 dark:border-charcoal-600">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {listing.allergens && listing.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-charcoal-400 font-medium">Allergens:</span>
              {listing.allergens.map(alg => (
                <span key={alg} className="text-xs px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                  ⚠️ {alg}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pickup Logistics */}
        <div className="p-4 rounded-xl bg-white dark:bg-charcoal-800/80 border border-cream-200 dark:border-charcoal-700 text-xs space-y-2">
          <h4 className="font-bold text-forest-950 dark:text-cream-100 uppercase tracking-wider mb-1">Pickup Coordination</h4>
          <div className="flex items-start gap-2 text-charcoal-700 dark:text-charcoal-300">
            <MapPin className="w-4 h-4 text-forest-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-charcoal-900 dark:text-cream-100">{listing.pickup_location}</p>
              <p className="text-charcoal-500 dark:text-charcoal-400 mt-0.5">{listing.donor_pickup_address || listing.pickup_location}, {listing.donor_city}</p>
            </div>
          </div>
          {listing.donor_phone && (
            <div className="flex items-center gap-2 text-charcoal-700 dark:text-charcoal-300">
              <Phone className="w-4 h-4 text-forest-600 dark:text-emerald-400 shrink-0" />
              <span>Donor Contact: <strong className="text-charcoal-900 dark:text-cream-100">{listing.donor_phone}</strong></span>
            </div>
          )}
          {listing.donor_notes && (
            <div className="p-2.5 rounded-lg bg-cream-100 dark:bg-charcoal-900 text-charcoal-600 dark:text-charcoal-300 italic border border-cream-200 dark:border-charcoal-700">
              Donor Note: "{listing.donor_notes}"
            </div>
          )}
        </div>

        {/* Food Safety Disclaimer */}
        <p className="text-[11px] text-charcoal-400 leading-tight">
          * SharePlate is a redistribution coordination platform. Donors must provide verified safe food handling notes. Recipients should evaluate food upon collection.
        </p>

        {/* Report Form Toggle */}
        {isReportOpen ? (
          <form onSubmit={handleReportSubmit} className="p-4 rounded-xl bg-red-50/80 border border-red-200 space-y-3">
            <h4 className="text-xs font-bold text-red-900 uppercase">Report Listing to Administration</h4>
            <div>
              <label className="block text-xs font-medium text-charcoal-700 mb-1">Reason</label>
              <select
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-red-200 bg-white"
              >
                <option value="Spoiled or unsafe food">Spoiled or unsafe food</option>
                <option value="Inaccurate quantity/details">Inaccurate quantity/details</option>
                <option value="Inaccessible pickup">Inaccessible pickup</option>
                <option value="Spam or non-food">Spam or non-food</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal-700 mb-1">Details</label>
              <textarea
                value={reportDescription}
                onChange={e => setReportDescription(e.target.value)}
                required
                rows={2}
                placeholder="Explain the issue for the moderation team..."
                className="w-full text-xs p-2 rounded-lg border border-red-200 bg-white"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsReportOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" size="sm" isLoading={isSubmittingReport}>
                Send Report
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between pt-2 border-t border-cream-200">
            <button
              onClick={() => setIsReportOpen(true)}
              className="text-xs text-charcoal-400 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report issue</span>
            </button>

            <div className="flex gap-3">
              <Button variant="outline" size="md" onClick={onClose}>
                Close
              </Button>

              {isAvailable && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    onClose();
                    onRequestClick(listing);
                  }}
                >
                  Request This Food
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
