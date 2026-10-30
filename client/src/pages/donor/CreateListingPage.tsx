import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Utensils,
  Clock,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';

export const CreateListingPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cooked Meals');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80');

  const [quantity, setQuantity] = useState<number>(30);
  const [unit, setUnit] = useState('portions');

  const now = new Date();
  const nowIso = now.toISOString().slice(0, 16);
  const defaultEnd = new Date(now.getTime() + 6 * 3600 * 1000).toISOString().slice(0, 16);

  const [preparationTime, setPreparationTime] = useState(nowIso);
  const [pickupStart, setPickupStart] = useState(nowIso);
  const [pickupEnd, setPickupEnd] = useState(defaultEnd);

  const [storageInstructions, setStorageInstructions] = useState('Keep chilled below 4°C during transport and storage.');
  const [expiryGuidance, setExpiryGuidance] = useState('Consume within 24 hours. Reheat thoroughly to 75°C core temp.');
  const [dietaryTags, setDietaryTags] = useState<string[]>(['Halal']);
  const [allergens, setAllergens] = useState<string[]>([]);

  const [pickupLocation, setPickupLocation] = useState((profile as any)?.pickup_address || '428 Artisan Blvd, Rear Kitchen Loading Dock');
  const [donorNotes, setDonorNotes] = useState('Please bring insulated thermal bags or containers.');
  const [safetyAck, setSafetyAck] = useState(true);

  // Preset food images for easy demonstration
  const presetImages = [
    { label: 'Roast Chicken & Veg', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' },
    { label: 'Artisan Sourdough', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
    { label: 'Organic Produce', url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80' },
    { label: 'Baked Lasagna', url: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80' },
    { label: 'Warm Lentil Curry', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80' },
    { label: 'Pastries & Viennoiserie', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80' }
  ];

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Halal', 'Gluten-Free', 'Dairy-Free', 'High Protein', 'Organic', 'Kosher'];
  const allergenOptions = ['Gluten', 'Dairy', 'Eggs', 'Tree Nuts', 'Peanuts', 'Soy', 'Shellfish', 'Fish', 'Celery', 'Sesame'];

  const toggleDietary = (item: string) => {
    setDietaryTags(prev => prev.includes(item) ? prev.filter(t => t !== item) : [...prev, item]);
  };

  const toggleAllergen = (item: string) => {
    setAllergens(prev => prev.includes(item) ? prev.filter(t => t !== item) : [...prev, item]);
  };

  const validateStep1 = () => {
    if (!title.trim() || title.length < 3) {
      setError('Please provide a title with at least 3 characters.');
      return false;
    }
    if (!description.trim() || description.length < 10) {
      setError('Please provide a descriptive explanation with at least 10 characters.');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    if (quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return false;
    }
    const start = new Date(pickupStart);
    const end = new Date(pickupEnd);
    if (end <= start) {
      setError('Pickup end time must be after pickup start time.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!safetyAck) {
      setError('Please acknowledge the food safety handling confirmation.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        title,
        category,
        description,
        quantity: Number(quantity),
        unit,
        preparationTime,
        pickupStart,
        pickupEnd,
        expiryGuidance,
        storageInstructions,
        dietaryTags,
        allergens,
        pickupLocation,
        image,
        donorNotes
      };

      await api.createListing(payload);
      showToast('Surplus Published!', `"${title}" is now available for collection.`, 'success');
      navigate('/donor/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to publish listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Badge variant="forest" size="sm" className="mb-2 uppercase font-bold tracking-wider">
          Listing Wizard
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
          Publish Surplus Food Donation
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
          Provide accurate portions, preparation timestamps, and storage guidelines for community recipients.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between border-b border-cream-300 dark:border-charcoal-800 pb-4">
        {[
          { num: 1, label: 'Food Essentials' },
          { num: 2, label: 'Portions & Timing' },
          { num: 3, label: 'Storage & Safety' },
          { num: 4, label: 'Review & Publish' }
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => {
              if (s.num < step) setStep(s.num);
            }}
            className={`flex items-center gap-2 cursor-pointer ${
              step === s.num
                ? 'text-forest-900 dark:text-emerald-400 font-bold'
                : step > s.num
                ? 'text-forest-700 dark:text-emerald-500'
                : 'text-charcoal-400 dark:text-charcoal-500'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s.num
                  ? 'bg-forest-900 dark:bg-emerald-600 text-white'
                  : step > s.num
                  ? 'bg-forest-100 dark:bg-emerald-950 text-forest-900 dark:text-emerald-300'
                  : 'bg-cream-200 dark:bg-charcoal-800 text-charcoal-500 dark:text-charcoal-400'
              }`}
            >
              {step > s.num ? '✓' : s.num}
            </div>
            <span className="text-xs hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Form Container */}
      <div className="bg-white dark:bg-charcoal-900 p-6 sm:p-8 rounded-3xl border border-cream-300 dark:border-charcoal-800 shadow-soft-sm space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Essentials */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1.5">
                Food Donation Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Mediterranean Roast Chicken & Steamed Vegetables"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
              >
                <option value="Cooked Meals">Cooked Meals (Hot / Chilled)</option>
                <option value="Bakery">Bakery & Breads</option>
                <option value="Fruits">Fresh Fruits</option>
                <option value="Vegetables">Vegetables & Produce</option>
                <option value="Dairy">Dairy & Eggs</option>
                <option value="Grains">Grains & Pasta</option>
                <option value="Packaged Food">Packaged Non-Perishables</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1.5">
                Detailed Description & Packaging
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe preparation, containers (e.g. hotel pans, foil trays), and portion distribution advice..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
              />
            </div>

            {/* Photo preset picker */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-2">
                Food Photograph (Select Preset or Provide URL)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                {presetImages.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => setImage(p.url)}
                    className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all relative h-16 ${
                      image === p.url ? 'border-citrus-500 scale-95 ring-2 ring-citrus-200' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <input
                type="url"
                value={image}
                onChange={e => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-xs focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-cream-200 dark:border-charcoal-800">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
              >
                Continue to Timing & Quantity
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Portions & Timing */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1.5">
                  Surplus Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1.5">
                  Measurement Unit
                </label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
                >
                  <option value="portions">portions</option>
                  <option value="kg">kg</option>
                  <option value="loaves">loaves</option>
                  <option value="boxes">boxes</option>
                  <option value="trays">catering trays</option>
                  <option value="liters">liters</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1.5">
                Preparation / Cooking Timestamp
              </label>
              <input
                type="datetime-local"
                value={preparationTime}
                onChange={e => setPreparationTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1.5">
                  Pickup Window Start
                </label>
                <input
                  type="datetime-local"
                  value={pickupStart}
                  onChange={e => setPickupStart(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1.5">
                  Pickup Window End (Deadline)
                </label>
                <input
                  type="datetime-local"
                  value={pickupEnd}
                  onChange={e => setPickupEnd(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-cream-200 dark:border-charcoal-800">
              <Button variant="outline" size="md" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
              >
                Continue to Safety & Storage
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Safety & Storage */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1.5">
                Storage & Temperature Guidelines
              </label>
              <input
                type="text"
                value={storageInstructions}
                onChange={e => setStorageInstructions(e.target.value)}
                placeholder="e.g. Keep chilled below 4°C during transport and storage."
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1.5">
                Use-By / Reheating Guidance
              </label>
              <input
                type="text"
                value={expiryGuidance}
                onChange={e => setExpiryGuidance(e.target.value)}
                placeholder="e.g. Best within 24 hours. Reheat thoroughly to 75°C core temp."
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
              />
            </div>

            {/* Dietary Tags Multi-select */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-2">
                Dietary Attributes
              </label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleDietary(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      dietaryTags.includes(tag)
                        ? 'bg-forest-900 dark:bg-emerald-600 text-white'
                        : 'bg-cream-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-300 border border-cream-300 dark:border-charcoal-700'
                    }`}
                  >
                    {dietaryTags.includes(tag) ? `✓ ${tag}` : tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergens Multi-select */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-2">
                Allergen Disclosures (Select All That Apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {allergenOptions.map(alg => (
                  <button
                    key={alg}
                    type="button"
                    onClick={() => toggleAllergen(alg)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      allergens.includes(alg)
                        ? 'bg-red-700 text-white'
                        : 'bg-cream-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-300 border border-cream-300 dark:border-charcoal-700'
                    }`}
                  >
                    {allergens.includes(alg) ? `⚠️ ${alg}` : alg}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-cream-200 dark:border-charcoal-800">
              <Button variant="outline" size="md" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button variant="primary" size="md" onClick={() => setStep(4)}>
                Continue to Review
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Logistics */}
        {step === 4 && (
          <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1.5">
                Kitchen / Pickup Address
              </label>
              <input
                type="text"
                required
                value={pickupLocation}
                onChange={e => setPickupLocation(e.target.value)}
                placeholder="Address & dock number..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1.5">
                Special Donor Instructions (Optional)
              </label>
              <input
                type="text"
                value={donorNotes}
                onChange={e => setDonorNotes(e.target.value)}
                placeholder="e.g. Please ring rear service bell; staff will assist with cart."
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
              />
            </div>

            {/* Summary preview */}
            <div className="p-4 rounded-2xl bg-cream-100 dark:bg-charcoal-850 border border-cream-300 dark:border-charcoal-800 space-y-2 text-xs">
              <span className="font-bold text-forest-950 dark:text-cream-50 uppercase tracking-wider">Summary Review</span>
              <p className="text-sm font-bold text-forest-950 dark:text-cream-50">{title} ({quantity} {unit})</p>
              <p className="text-charcoal-600 dark:text-charcoal-300">Category: <strong className="text-charcoal-800 dark:text-cream-100">{category}</strong></p>
              <p className="text-charcoal-600 dark:text-charcoal-300">Window: {new Date(pickupStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</p>
              <p className="text-charcoal-600 dark:text-charcoal-300">Location: {pickupLocation}</p>
            </div>

            {/* Safety Acknowledgment */}
            <label className="flex items-start gap-2.5 text-xs text-charcoal-700 dark:text-charcoal-300 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={safetyAck}
                onChange={e => setSafetyAck(e.target.checked)}
                className="mt-0.5 rounded text-forest-800 dark:text-emerald-500 focus:ring-forest-800"
              />
              <span>
                I certify that this food was prepared under commercial food safety conditions, stored at safe temperatures, and is unexpired and fit for consumption.
              </span>
            </label>

            <div className="flex justify-between pt-4 border-t border-cream-200 dark:border-charcoal-800">
              <Button type="button" variant="outline" size="md" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting}>
                Publish Food Donation
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
