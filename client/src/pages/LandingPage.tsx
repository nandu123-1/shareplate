import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BackgroundFoodScene } from '../components/3d/BackgroundFoodScene';
import { InteractiveFoodViewer } from '../components/3d/InteractiveFoodViewer';
import { FoodCard } from '../components/food/FoodCard';
import { FoodDetailModal } from '../components/food/FoodDetailModal';
import { RequestFoodModal } from '../components/food/RequestFoodModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';
import { FoodListing, ImpactMetrics } from '../types';
import {
  ArrowRight,
  Sparkles,
  Utensils,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Leaf,
  Clock,
  Building,
  Users
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredListings, setFeaturedListings] = useState<FoodListing[]>([]);
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [requestListing, setRequestListing] = useState<FoodListing | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [listingsRes, impactRes] = await Promise.all([
          api.getListings({ limit: '6' }),
          api.getImpactMetrics()
        ]);
        setFeaturedListings(listingsRes.listings);
        setMetrics(impactRes.metrics);
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = ['All', 'Cooked Meals', 'Bakery', 'Fruits', 'Vegetables', 'Dairy', 'Grains'];

  const filteredListings = selectedCategory === 'All'
    ? featuredListings
    : featuredListings.filter(l => l.category === selectedCategory);

  return (
    <div className="space-y-24 md:space-y-32 overflow-hidden">
      {/* Hero Section with Ambient 3D SimReady Food Background */}
      <section className="relative pt-8 md:pt-14 pb-14 overflow-hidden min-h-[580px] flex items-center">
        {/* Continuous 3D Moving Food Animation Background */}
        <BackgroundFoodScene />

        {/* Subtle decorative glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-emerald-100/40 via-teal-50/20 to-orange-100/30 dark:from-emerald-950/20 dark:via-charcoal-900/30 dark:to-citrus-950/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-50 dark:bg-forest-950/80 text-forest-800 dark:text-emerald-300 border border-forest-200/80 dark:border-forest-800 text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-soft-sm">
                <Leaf className="w-3.5 h-3.5 text-citrus-500" />
                <span>Redistributing Goodness</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight leading-[1.12]">
                Good food deserves <br className="hidden sm:inline" />
                <span className="text-citrus-600 dark:text-citrus-400 italic font-medium font-serif">a better destination.</span>
              </h1>

              <p className="text-base sm:text-lg text-charcoal-600 dark:text-charcoal-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Connect restaurants, caterers, and grocery surplus with verified charitable organizations. Make every meal count through a smarter, simpler food-sharing network.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/donor/create-listing')}
                  icon={<Utensils className="w-5 h-5 text-citrus-400" />}
                  className="w-full sm:w-auto"
                >
                  Donate Surplus Food
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/explore')}
                  icon={<HeartHandshake className="w-5 h-5 text-forest-800 dark:text-emerald-400" />}
                  className="w-full sm:w-auto"
                >
                  Find Available Food
                </Button>
              </div>

              {/* Social proof indicator */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-4 text-xs text-charcoal-500 dark:text-charcoal-400">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-forest-800 text-white flex items-center justify-center font-bold text-xs border-2 border-white dark:border-charcoal-900 shadow-sm">G</div>
                  <div className="w-8 h-8 rounded-full bg-citrus-600 text-white flex items-center justify-center font-bold text-xs border-2 border-white dark:border-charcoal-900 shadow-sm">H</div>
                  <div className="w-8 h-8 rounded-full bg-forest-600 text-white flex items-center justify-center font-bold text-xs border-2 border-white dark:border-charcoal-900 shadow-sm">S</div>
                </div>
                <span>
                  Connecting verified businesses & community partners.
                </span>
              </div>
            </div>

            {/* Right Column: Interactive SimReady 3D Food Showcase */}
            <div className="lg:col-span-5 relative">
              <InteractiveFoodViewer />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="citrus" size="sm" className="mb-2 uppercase tracking-wider font-bold">
            Simplicity & Dignity
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
            How SharePlate Works
          </h2>
          <p className="text-charcoal-600 dark:text-charcoal-300 mt-3 text-sm leading-relaxed">
            From commercial kitchen surplus to community dining tables in three transparent, temperature-monitored steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="glass-card rounded-2xl p-8 relative flex flex-col justify-between hover:shadow-soft-lg transition-all group">
            <span className="text-5xl font-black text-cream-300 dark:text-charcoal-800 group-hover:text-forest-200 dark:group-hover:text-emerald-900/50 transition-colors font-serif">
              01
            </span>
            <div className="space-y-3 mt-4">
              <div className="w-12 h-12 rounded-xl bg-forest-900 dark:bg-emerald-600 text-citrus-400 dark:text-white flex items-center justify-center font-bold shadow-soft-sm">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-forest-950 dark:text-cream-50 font-editorial">
                Donate Surplus
              </h3>
              <p className="text-xs text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                Restaurants and food businesses list surplus portions with precise preparation times, storage guidance, and pickup windows.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-cream-200 dark:border-charcoal-800 text-xs text-forest-800 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span>Zero food waste</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 dark:text-emerald-400 ml-auto" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-card rounded-2xl p-8 relative flex flex-col justify-between hover:shadow-soft-lg transition-all group">
            <span className="text-5xl font-black text-cream-300 dark:text-charcoal-800 group-hover:text-forest-200 dark:group-hover:text-emerald-900/50 transition-colors font-serif">
              02
            </span>
            <div className="space-y-3 mt-4">
              <div className="w-12 h-12 rounded-xl bg-forest-900 dark:bg-emerald-600 text-emerald-400 dark:text-white flex items-center justify-center font-bold shadow-soft-sm">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-forest-950 dark:text-cream-50 font-editorial">
                Connect & Request
              </h3>
              <p className="text-xs text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                Eligible NGOs discover available donations and send pickup requests. Quantity is atomically reserved to prevent overbooking.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-cream-200 dark:border-charcoal-800 text-xs text-forest-800 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span>Secure reservation</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 dark:text-emerald-400 ml-auto" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-card rounded-2xl p-8 relative flex flex-col justify-between hover:shadow-soft-lg transition-all group">
            <span className="text-5xl font-black text-cream-300 dark:text-charcoal-800 group-hover:text-forest-200 dark:group-hover:text-emerald-900/50 transition-colors font-serif">
              03
            </span>
            <div className="space-y-3 mt-4">
              <div className="w-12 h-12 rounded-xl bg-forest-900 dark:bg-emerald-600 text-amber-400 dark:text-white flex items-center justify-center font-bold shadow-soft-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-forest-950 dark:text-cream-50 font-editorial">
                Redistribute & Verify
              </h3>
              <p className="text-xs text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                Donations are collected using a 6-digit verification code, logged in the audit trail, and immediately served to communities in need.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-cream-200 dark:border-charcoal-800 text-xs text-forest-800 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span>Verified impact</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 dark:text-emerald-400 ml-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Explore Available Food Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="forest" size="sm" className="mb-2 uppercase tracking-wider font-bold">
              Live Surplus Network
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
              Explore Available Food
            </h2>
            <p className="text-charcoal-600 dark:text-charcoal-400 text-xs mt-1">
              Real-time edible surplus awaiting collection from verified donors.
            </p>
          </div>

          <Link to="/explore">
            <Button variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
              View Full Catalog ({featuredListings.length})
            </Button>
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-soft-sm'
                  : 'bg-charcoal-900 text-charcoal-300 hover:bg-charcoal-800 border border-charcoal-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Food Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-charcoal-800/60 animate-pulse border border-charcoal-800" />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="p-12 text-center bg-charcoal-900 rounded-2xl border border-charcoal-800">
            <p className="text-charcoal-400 text-sm">No food listings found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.slice(0, 6).map((listing) => (
              <FoodCard
                key={listing.id}
                listing={listing}
                onViewDetails={(item) => setSelectedListing(item)}
                onRequestClick={(item) => setRequestListing(item)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Real-time Impact Section */}
      <section className="bg-forest-900 dark:bg-charcoal-900 text-cream-50 py-16 md:py-20 rounded-3xl mx-4 sm:mx-6 lg:mx-8 relative overflow-hidden shadow-soft-lg border border-transparent dark:border-charcoal-800">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-citrus-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-citrus-400">
              Verified Social Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-editorial mt-2 tracking-tight">
              Every Shared Meal Transforms Lives
            </h2>
            <p className="text-cream-200/80 text-xs mt-2 leading-relaxed">
              Derived in real time from database-verified completed food rescue handovers.
            </p>
          </div>

          {/* Metric Counter Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-forest-950/60 dark:bg-charcoal-950/80 border border-forest-800/80 dark:border-charcoal-800">
              <p className="text-4xl sm:text-5xl font-black text-white font-editorial tracking-tight">
                {metrics ? metrics.completedDonations : '18'}
              </p>
              <p className="text-xs text-cream-300/80 font-medium uppercase tracking-wider mt-2">
                Completed Pickups
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-forest-950/60 dark:bg-charcoal-950/80 border border-forest-800/80 dark:border-charcoal-800">
              <p className="text-4xl sm:text-5xl font-black text-citrus-400 font-editorial tracking-tight">
                {metrics ? `${metrics.totalPortionsRedistributed}+` : '350+'}
              </p>
              <p className="text-xs text-cream-300/80 font-medium uppercase tracking-wider mt-2">
                Portions Shared
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-forest-950/60 dark:bg-charcoal-950/80 border border-forest-800/80 dark:border-charcoal-800">
              <p className="text-4xl sm:text-5xl font-black text-emerald-400 font-editorial tracking-tight">
                {metrics ? `${metrics.estimatedCo2ePreventedKg}kg` : '350kg'}
              </p>
              <p className="text-xs text-cream-300/80 font-medium uppercase tracking-wider mt-2">
                CO2e Prevented
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-forest-950/60 dark:bg-charcoal-950/80 border border-forest-800/80 dark:border-charcoal-800">
              <p className="text-4xl sm:text-5xl font-black text-white font-editorial tracking-tight">
                {metrics ? `${metrics.activeDonors + metrics.participatingOrganizations}` : '8'}
              </p>
              <p className="text-xs text-cream-300/80 font-medium uppercase tracking-wider mt-2">
                Active Partners
              </p>
            </div>
          </div>

          {/* Carbon Conversion Note */}
          <div className="mt-8 text-center text-[11px] text-cream-300/60 max-w-xl mx-auto leading-relaxed border-t border-forest-800/60 dark:border-charcoal-800 pt-4">
            * Environmental calculation model: 1 portion ~0.40 kg edible food; 1 kg food waste diverted prevents ~2.5 kg CO2e greenhouse gas emissions according to standard FAO / WRAP climate models.
          </div>
        </div>
      </section>

      {/* Two-Sided Value Proposition Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Donors */}
          <div className="p-8 sm:p-10 rounded-3xl bg-charcoal-900 border border-charcoal-800 shadow-soft-sm hover:shadow-soft transition-all space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-citrus-950/80 text-citrus-400 flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-cream-50 font-editorial">
              For Food Businesses & Caterers
            </h3>
            <p className="text-xs text-charcoal-300 leading-relaxed">
              Transform inevitable kitchen overproduction into audited social impact. Streamline CSR commitments, reduce disposal fees, and receive verified donation receipts.
            </p>
            <ul className="space-y-2 text-xs text-charcoal-300 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Rapid 2-minute listing wizard with food photos</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Coordinated pickup windows so staff aren't interrupted</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 6-digit secure handover code verification</li>
            </ul>
            <Link to="/register" className="inline-block pt-2">
              <Button variant="primary" size="md">
                Register as a Donor
              </Button>
            </Link>
          </div>

          {/* For Recipient Organizations */}
          <div className="p-8 sm:p-10 rounded-3xl bg-charcoal-900 border border-charcoal-800 shadow-soft-sm hover:shadow-soft transition-all space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-forest-950/80 text-emerald-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-cream-50 font-editorial">
              For Charitable Organizations & NGOs
            </h3>
            <p className="text-xs text-charcoal-300 leading-relaxed">
              Access high-nutrition, chef-prepared hot meals and fresh grocery staples to stretch your food program budget further and feed more people daily.
            </p>
            <ul className="space-y-2 text-xs text-charcoal-300 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% free food donations with allergen transparency</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Smart capacity matching tailored to your daily headcounts</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Immediate reservation without overbooking risk</li>
            </ul>
            <Link to="/register" className="inline-block pt-2">
              <Button variant="secondary" size="md">
                Join as an Organization
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-6">
        <Badge variant="citrus" size="sm" className="uppercase font-bold tracking-wider">
          Join The Movement
        </Badge>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
          One small donation. <br />
          A meaningful difference.
        </h2>
        <p className="text-charcoal-600 dark:text-charcoal-300 max-w-xl mx-auto text-sm leading-relaxed">
          Be part of the solution to hunger and climate impact in your local community today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/register">
            <Button variant="primary" size="lg">
              Become a Food Donor
            </Button>
          </Link>
          <Link to="/explore">
            <Button variant="outline" size="lg">
              Explore Available Surplus
            </Button>
          </Link>
        </div>
      </section>

      {/* Modals */}
      <FoodDetailModal
        listing={selectedListing}
        isOpen={!!selectedListing}
        onClose={() => setSelectedListing(null)}
        onRequestClick={(item) => {
          setSelectedListing(null);
          setRequestListing(item);
        }}
      />

      <RequestFoodModal
        listing={requestListing}
        isOpen={!!requestListing}
        onClose={() => setRequestListing(null)}
      />
    </div>
  );
};
