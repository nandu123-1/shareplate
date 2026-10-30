import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Utensils, HeartHandshake, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [role, setRole] = useState<'DONOR' | 'RECIPIENT'>('DONOR');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Donor fields
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Restaurant');
  const [pickupAddress, setPickupAddress] = useState('');
  const [city, setCity] = useState('Metro Central');
  const [postalCode, setPostalCode] = useState('90210');
  const [phone, setPhone] = useState('+1 (555) 0199');

  // Recipient fields
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState('Food Bank');
  const [capacityPortions, setCapacityPortions] = useState(150);
  const [serviceArea, setServiceArea] = useState('Metro Central & Downtown');

  const [foodSafetyAck, setFoodSafetyAck] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodSafetyAck) {
      setError('Please acknowledge the food safety & hygiene protocol.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const payload: any = {
        name,
        email,
        password,
        role,
        phone,
        foodSafetyAck: true
      };

      if (role === 'DONOR') {
        payload.businessName = businessName || name;
        payload.businessType = businessType;
        payload.pickupAddress = pickupAddress;
        payload.city = city;
        payload.postalCode = postalCode;
      } else {
        payload.organizationName = organizationName || name;
        payload.organizationType = organizationType;
        payload.capacityPortions = Number(capacityPortions);
        payload.serviceArea = serviceArea;
        payload.pickupAddress = pickupAddress;
        payload.city = city;
      }

      await register(payload);
      showToast('Registration Successful', `Welcome to SharePlate, ${name}!`, 'success');
      if (role === 'DONOR') navigate('/donor/dashboard');
      else navigate('/recipient/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <Badge variant="forest" size="sm" className="uppercase font-bold tracking-wider">
          Join the Network
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-forest-950 dark:text-cream-50 font-editorial tracking-tight">
          Create Your SharePlate Account
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
          Connect surplus commercial food with organizations that can distribute it safely.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-cream-200 dark:bg-charcoal-850 rounded-2xl border border-cream-300 dark:border-charcoal-800">
        <button
          type="button"
          onClick={() => setRole('DONOR')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            role === 'DONOR'
              ? 'bg-white dark:bg-charcoal-800 text-forest-950 dark:text-cream-50 shadow-soft-sm'
              : 'text-charcoal-600 dark:text-charcoal-400 hover:text-forest-900 dark:hover:text-cream-200'
          }`}
        >
          <Utensils className="w-4 h-4 text-citrus-500" />
          <span>I am a Food Donor</span>
        </button>

        <button
          type="button"
          onClick={() => setRole('RECIPIENT')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            role === 'RECIPIENT'
              ? 'bg-white dark:bg-charcoal-800 text-forest-950 dark:text-cream-50 shadow-soft-sm'
              : 'text-charcoal-600 dark:text-charcoal-400 hover:text-forest-900 dark:hover:text-cream-200'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>I am an NGO / Food Bank</span>
        </button>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-charcoal-900 p-6 sm:p-8 rounded-3xl border border-cream-300 dark:border-charcoal-800 shadow-soft-sm space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1">
                Representative Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Chef Marco Rossi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 0199"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="representative@business.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Role specific profile inputs */}
          {role === 'DONOR' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-cream-200 dark:border-charcoal-800">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1">
                    Business / Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="e.g. GreenLeaf Bistro"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1">
                    Establishment Type
                  </label>
                  <select
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
                  >
                    <option value="Restaurant">Restaurant</option>
                    <option value="Bakery & Cafe">Bakery & Cafe</option>
                    <option value="Hotel & Banquets">Hotel & Banquets</option>
                    <option value="Corporate Catering">Corporate Catering</option>
                    <option value="Supermarket / Grocer">Supermarket / Grocer</option>
                    <option value="Community Central Kitchen">Community Central Kitchen</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1">
                    Kitchen / Pickup Address
                  </label>
                  <input
                    type="text"
                    required
                    value={pickupAddress}
                    onChange={e => setPickupAddress(e.target.value)}
                    placeholder="e.g. 428 Artisan Blvd, Suite 101"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Metro Central"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-cream-200 dark:border-charcoal-800">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    required
                    value={organizationName}
                    onChange={e => setOrganizationName(e.target.value)}
                    placeholder="e.g. Hope Haven Food Bank"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1">
                    Organization Type
                  </label>
                  <select
                    value={organizationType}
                    onChange={e => setOrganizationType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
                  >
                    <option value="Food Bank">Food Bank & Emergency Pantry</option>
                    <option value="Youth Shelter">Youth & Transitional Shelter</option>
                    <option value="Community Kitchen">Community Kitchen / Dining Room</option>
                    <option value="Senior Center">Senior Citizen Meal Program</option>
                    <option value="Disaster Relief">Disaster Nutritional Relief</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1">
                    Daily Capacity (Portions)
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={capacityPortions}
                    onChange={e => setCapacityPortions(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-300 uppercase tracking-wider mb-1">
                    Primary Service Area
                  </label>
                  <input
                    type="text"
                    value={serviceArea}
                    onChange={e => setServiceArea(e.target.value)}
                    placeholder="e.g. Metro Central & Downtown"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-emerald-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Safety Agreement */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs text-charcoal-600 dark:text-charcoal-300 cursor-pointer">
              <input
                type="checkbox"
                checked={foodSafetyAck}
                onChange={e => setFoodSafetyAck(e.target.checked)}
                className="mt-0.5 rounded text-forest-800 dark:text-emerald-500 focus:ring-forest-800"
              />
              <span>
                I agree to adhere to safe food handling and temperature standards. I acknowledge that SharePlate coordinates redistribution logistics and does not independently certify edible food items.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center mt-2"
            isLoading={isLoading}
          >
            Complete Registration
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-charcoal-500 dark:text-charcoal-400">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-forest-800 dark:text-emerald-400 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
