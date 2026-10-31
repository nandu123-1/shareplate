import React from 'react';
import { Clock, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { FoodListing } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface FoodCardProps {
  listing: FoodListing;
  onViewDetails: (listing: FoodListing) => void;
  onRequestClick?: (listing: FoodListing) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  listing,
  onViewDetails,
  onRequestClick
}) => {
  const isAvailable = listing.status === 'AVAILABLE' || listing.status === 'PARTIALLY_RESERVED';

  // Format pickup window nicely
  const formatPickupWindow = (startStr: string, endStr: string) => {
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      const today = new Date();
      const isToday = start.toDateString() === today.toDateString();
      const timeOpts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
      const datePrefix = isToday ? 'Today' : start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return `${datePrefix}, ${start.toLocaleTimeString([], timeOpts)} - ${end.toLocaleTimeString([], timeOpts)}`;
    } catch {
      return 'Flexible pickup';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cooked Meals': return 'citrus';
      case 'Bakery': return 'sage';
      case 'Fruits':
      case 'Vegetables': return 'forest';
      case 'Dairy': return 'cream';
      default: return 'forest';
    }
  };

  return (
    <div className="group bg-charcoal-900 rounded-2xl overflow-hidden border border-charcoal-800 shadow-soft-sm hover:shadow-soft-lg hover:border-emerald-600/60 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Card Image Banner */}
        <div className="relative h-48 w-full overflow-hidden bg-charcoal-800">
          <img
            src={listing.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-transparent to-black/20" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <Badge variant={getCategoryColor(listing.category) as any} size="sm">
              {listing.category}
            </Badge>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-charcoal-950/90 text-emerald-400 border border-emerald-500/30 shadow-soft-sm backdrop-blur-md">
              100% FREE
            </span>
          </div>

          {/* Bottom quantity overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
            <div>
              <p className="text-2xl font-bold tracking-tight text-cream-50">
                {listing.remaining_quantity} <span className="text-xs font-normal opacity-90">{listing.unit}</span>
              </p>
              {listing.remaining_quantity !== listing.quantity && (
                <p className="text-[10px] text-cream-200/70">
                  of {listing.quantity} {listing.unit} initial
                </p>
              )}
            </div>

            {/* Smart match indicator if available */}
            {listing.matchScore && (
              <div className="flex items-center gap-1 bg-charcoal-900/95 text-emerald-300 text-[11px] font-medium px-2 py-0.5 rounded-full backdrop-blur-md border border-charcoal-700">
                <Sparkles className="w-3 h-3 text-citrus-400" />
                <span>{listing.matchScore}% Match</span>
              </div>
            )}
          </div>
        </div>

        {/* Content body */}
        <div className="p-5">
          <h4
            onClick={() => onViewDetails(listing)}
            className="font-bold text-base text-cream-50 line-clamp-1 group-hover:text-emerald-400 cursor-pointer transition-colors"
          >
            {listing.title}
          </h4>

          <p className="text-xs text-charcoal-400 line-clamp-2 mt-1.5 leading-relaxed">
            {listing.description}
          </p>

          <div className="mt-4 pt-3 border-t border-charcoal-800 space-y-2 text-xs text-charcoal-300">
            {/* Donor */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-cream-100 line-clamp-1">
                {listing.donor_business_name || 'Verified Donor'}
              </span>
              <span className="text-[11px] text-charcoal-400">
                {listing.donor_city || 'Metro Central'}
              </span>
            </div>

            {/* Pickup window */}
            <div className="flex items-center gap-1.5 text-charcoal-400 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="line-clamp-1">{formatPickupWindow(listing.pickup_start, listing.pickup_end)}</span>
            </div>

            {/* Storage requirement */}
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-forest-950/60 px-2 py-1 rounded-md border border-forest-900/60">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span className="truncate">{listing.storage_instructions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="p-5 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => onViewDetails(listing)}
        >
          View Details
        </Button>

        {isAvailable && onRequestClick && (
          <Button
            variant="primary"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onRequestClick(listing)}
          >
            Request Food
          </Button>
        )}
      </div>
    </div>
  );
};
