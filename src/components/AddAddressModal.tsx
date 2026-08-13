import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DeliveryAddress } from '../types';
import { MapPin, Plus, Check, X, AlertTriangle, Building, Home, Briefcase, Navigation } from 'lucide-react';

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressAdded?: (newAddress: DeliveryAddress) => void;
}

export const AddAddressModal: React.FC<AddAddressModalProps> = ({
  isOpen,
  onClose,
  onAddressAdded
}) => {
  const { addAddress, isPincodeApproved } = useApp();

  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [addressLine, setAddressLine] = useState('');
  const [area, setArea] = useState('Saphale East');
  const [city, setCity] = useState('Palghar');
  const [pincode, setPincode] = useState('401102');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState<number>(19.5785);
  const [longitude, setLongitude] = useState<number>(72.8220);
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const isApproved = isPincodeApproved(pincode);

  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setErrorMsg('');
    setLocationNotice('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setIsLocating(false);
        setLocationNotice(`GPS coordinates detected: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      },
      (err) => {
        setIsLocating(false);
        setLocationNotice('Location permission unavailable. Using default Saphale East coordinates.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!addressLine.trim()) {
      setErrorMsg('Please enter your house/building number and street address.');
      return;
    }

    if (!area.trim()) {
      setErrorMsg('Please specify area / locality (e.g., Saphale East or West).');
      return;
    }

    if (!pincode.trim() || !/^\d{6}$/.test(pincode.trim())) {
      setErrorMsg('Please enter a valid 6-digit PIN code.');
      return;
    }

    const newAddressData: Omit<DeliveryAddress, 'id'> = {
      label,
      addressLine: addressLine.trim(),
      area: area.trim(),
      city: city.trim() || 'Palghar',
      pincode: pincode.trim(),
      landmark: landmark.trim() || undefined,
      isDefault: true,
      latitude,
      longitude
    };

    addAddress(newAddressData);

    setSuccessMsg('Address added successfully!');
    setTimeout(() => {
      onClose();
      // Reset form
      setAddressLine('');
      setLandmark('');
      setSuccessMsg('');
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4 text-xs font-bold relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-orange-100 dark:bg-orange-950/80 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-gray-900 dark:text-gray-100">
                Add New Delivery Address
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                Save your home or work address for fast 30-min delivery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback messages */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 text-rose-700 dark:text-rose-200 rounded-2xl flex items-center gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 text-emerald-700 dark:text-emerald-200 rounded-2xl flex items-center gap-2 text-xs">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Address Label Selector */}
          <div>
            <label className="block mb-1.5 uppercase text-gray-500 text-[10px] font-black">
              Save Address As
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'Home', icon: Home, label: 'Home' },
                  { id: 'Work', icon: Briefcase, label: 'Work' },
                  { id: 'Other', icon: Building, label: 'Other' }
                ] as const
              ).map(item => {
                const IconComponent = item.icon;
                const isSelected = label === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLabel(item.id)}
                    className={`py-2 px-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Address Line */}
          <div>
            <label className="block mb-1 uppercase text-gray-500 text-[10px] font-black">
              House / Flat No., Building & Street Address *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Flat 302, Sai Residency, Station Road"
              value={addressLine}
              onChange={e => setAddressLine(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Area & Landmark */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block mb-1 uppercase text-gray-500 text-[10px] font-black">
                Area / Locality *
              </label>
              <select
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="Saphale East">Saphale East</option>
                <option value="Saphale West">Saphale West</option>
                <option value="Station Road">Station Road</option>
                <option value="Main Bazaar">Main Bazaar</option>
                <option value="Gram Panchayat Area">Gram Panchayat Area</option>
                <option value="Other Area">Other Area</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 uppercase text-gray-500 text-[10px] font-black">
                Landmark (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Near Railway Station"
                value={landmark}
                onChange={e => setLandmark(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          {/* City & PIN Code */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block mb-1 uppercase text-gray-500 text-[10px] font-black">
                City / District
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Palghar"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 uppercase text-gray-500 text-[10px] font-black">
                PIN Code *
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={pincode}
                onChange={e => setPincode(e.target.value)}
                placeholder="401102"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-3.5 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          {/* GPS Coordinates & Geolocation */}
          <div className="bg-orange-50/80 dark:bg-orange-950/40 p-3.5 rounded-2xl border border-orange-200 dark:border-orange-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-orange-900 dark:text-orange-300">
                <Navigation className="w-4 h-4 text-orange-600 animate-pulse" />
                <span>GPS Location Coordinates</span>
              </div>
              <button
                type="button"
                onClick={handleDetectCurrentLocation}
                disabled={isLocating}
                className="bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 transition-transform active:scale-95 disabled:opacity-50"
              >
                <Navigation className="w-3.5 h-3.5" />
                {isLocating ? 'Locating...' : 'Use my current location'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-400 block mb-0.5">Latitude</span>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={e => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-400 block mb-0.5">Longitude</span>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={e => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {locationNotice && (
              <p className="text-[10px] text-orange-800 dark:text-orange-300 font-extrabold pt-0.5">
                {locationNotice}
              </p>
            )}
          </div>

          {/* PIN Code Service Status Indicator */}
          <div className="pt-1">
            {isApproved ? (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-[11px] font-extrabold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  ✓ Service Available! 30-Min Express Delivery supported in PIN <strong>{pincode}</strong> (Saphale).
                </span>
              </div>
            ) : (
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-900 dark:text-amber-200 text-[11px] font-extrabold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p>Service Unavailable for PIN {pincode}</p>
                  <p className="text-[10px] font-medium text-amber-700 dark:text-amber-300">
                    QuickPal currently delivers ONLY in Saphale East & West (PIN 401102). You can save this address, but ordering is restricted to PIN 401102.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-black px-5 py-2.5 rounded-2xl shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Save Delivery Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
