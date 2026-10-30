import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { FoodListing } from '../types';
import { FoodCard } from '../components/food/FoodCard';
import { FoodDetailModal } from '../components/food/FoodDetailModal';
import { RequestFoodModal } from '../components/food/RequestFoodModal';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const AvailableFoodPage: React.FC = () => {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [dietary, setDietary] = useState('All');
  const [sort, setSort] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [requestListing, setRequestListing] = useState<FoodListing | null>(null);

  const categories = [
    'All',
    'Cooked Meals',
    'Fruits',
    'Vegetables',
    'Bakery',
    'Packaged Food',
    'Dairy',
    'Grains'
  ];

  const dietaryOptions = ['All', 'Vegetarian', 'Vegan', 'Halal', 'Gluten-Free', 'Organic', 'Kosher'];

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '9',
        sort
      };
      if (search.trim()) params.search = search.trim();
      if (category !== 'All') params.category = category;
      if (dietary !== 'All') params.dietary = dietary;

      const data = await api.getListings(params);
      setListings(data.listings);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [page, category, dietary, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadListings();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <Badge variant="forest" size="sm" className="mb-2 uppercase font-bold tracking-wider">
          Marketplace
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
          Explore Available Food Donations
        </h1>
        <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
          Discover surplus food items ready for rescue across restaurants, bakeries, and markets.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-charcoal-900 p-4 sm:p-5 rounded-2xl border border-cream-300 dark:border-charcoal-800 shadow-soft-sm space-y-4">
        {/* Search input + Sort dropdown */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by food name, description, donor, or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 text-sm text-charcoal-900 dark:text-cream-100 bg-white dark:bg-charcoal-800 focus:outline-none focus:ring-2 focus:ring-forest-800"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={sort}
              onChange={e => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 text-xs font-semibold bg-white dark:bg-charcoal-800 text-charcoal-700 dark:text-cream-200 focus:outline-none focus:ring-2 focus:ring-forest-800"
            >
              <option value="newest">Recently Listed</option>
              <option value="expiry_soon">Pickup Ending Soonest</option>
              <option value="quantity_desc">Highest Quantity</option>
            </select>

            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
          </div>
        </form>

        {/* Category Pills */}
        <div className="space-y-2 pt-2 border-t border-cream-200 dark:border-charcoal-800">
          <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-400 uppercase tracking-wider block">
            Category
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  category === cat
                    ? 'bg-forest-900 dark:bg-emerald-600 text-white'
                    : 'bg-cream-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-300 hover:bg-cream-200 dark:hover:bg-charcoal-700 border border-cream-300 dark:border-charcoal-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Filters */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-400 uppercase tracking-wider block">
            Dietary Requirements
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {dietaryOptions.map(diet => (
              <button
                key={diet}
                onClick={() => {
                  setDietary(diet);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  dietary === diet
                    ? 'bg-citrus-600 text-white'
                    : 'bg-cream-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-300 hover:bg-cream-200 dark:hover:bg-charcoal-700 border border-cream-300 dark:border-charcoal-700'
                }`}
              >
                {diet}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count & Listings Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-charcoal-500 dark:text-charcoal-400">
          <span>
            Showing <strong className="text-forest-900 dark:text-emerald-400">{listings.length}</strong> of <strong className="text-forest-900 dark:text-emerald-400">{total}</strong> available donations
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-80 rounded-2xl bg-cream-200/60 dark:bg-charcoal-800/60 animate-pulse border border-cream-300 dark:border-charcoal-800" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-charcoal-900 rounded-3xl border border-cream-300 dark:border-charcoal-800 space-y-3">
            <p className="text-lg font-bold text-forest-950 dark:text-cream-50 font-editorial">No surplus listings match your filters</p>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400 max-w-sm mx-auto">
              Try clearing your search term or switching to another category to discover available food.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCategory('All');
                setDietary('All');
                setSearch('');
                setPage(1);
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <FoodCard
                key={listing.id}
                listing={listing}
                onViewDetails={item => setSelectedListing(item)}
                onRequestClick={item => setRequestListing(item)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-xs text-charcoal-600 dark:text-charcoal-300 px-3">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <FoodDetailModal
        listing={selectedListing}
        isOpen={!!selectedListing}
        onClose={() => setSelectedListing(null)}
        onRequestClick={item => {
          setSelectedListing(null);
          setRequestListing(item);
        }}
      />

      <RequestFoodModal
        listing={requestListing}
        isOpen={!!requestListing}
        onClose={() => setRequestListing(null)}
        onSuccess={() => loadListings()}
      />
    </div>
  );
};
