import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DeliveryAddress } from '../types';
import {
  MapPin,
  Plus,
  Check,
  X,
  Edit2,
  Trash2,
  AlertCircle,
  Home,
  Briefcase,
  Building,
  Navigation,
  Clock,
  ShieldCheck,
  Search,
  ChevronRight,
  LocateFixed
} from 'lucide-react';
import { AddAddressModal } from './AddAddressModal';

interface AddressManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Haversine distance calculator (in km) from Saphale Dark Store (19.5785, 72.8220)
function getDistanceKm(lat?: number, lng?: number): string {
  if (!lat || !lng) return '1.10 km away';
  const R = 6371;
  const dLat = ((lat - 19.5785) * Math.PI) / 180;
  const dLng = ((lng - 72.822) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((19.5785 * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return `${(dist < 0.1 ? 0.5 : dist).toFixed(2)} km away`;
}

export const AddressManagementModal: React.FC<AddressManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    addresses,
    selectedAddress,
    setSelectedAddress,
    addAddress,
    deleteAddress,
    isPincodeApproved,
    currentUser
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<DeliveryAddress | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  const filteredAddresses = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return addresses;
    return addresses.filter(
      a =>
        a.label.toLowerCase().includes(q) ||
        a.addressLine.toLowerCase().includes(q) ||
        a.area.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.pincode.includes(q)
    );
  }, [addresses, searchTerm]);

  if (!isOpen) return null;

  const getIconForLabel = (label: string) => {
    switch (label) {
      case 'Work':
        return Briefcase;
      case 'Other':
        return Building;
      default:
        return Home;
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice('GPS is not supported by your browser. Please add address manually.');
      return;
    }
    setLocating(true);
    setLocationNotice(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        const nearSaphale =
          Math.abs(latitude - 19.5785) < 0.08 && Math.abs(longitude - 72.822) < 0.08;
        const detectedPin = nearSaphale ? '401102' : '400001';
        const detectedArea = nearSaphale ? 'Saphale Current GPS' : 'Outside Saphale Zone';
        const detectedCity = nearSaphale ? 'Palghar' : 'Nearby Region';
        const gpsAddress: DeliveryAddress = {
          id: `addr-gps-${Date.now()}`,
          label: 'Other',
          addressLine: `Current GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          area: detectedArea,
          city: detectedCity,
          pincode: detectedPin,
          landmark: 'Detected via Device Location',
          latitude,
          longitude,
          isDefault: false
        };
        addAddress(gpsAddress);
        setSelectedAddress(gpsAddress);
        onClose();
      },
      () => {
        setLocating(false);
        setLocationNotice('Could not access GPS permission. Select a saved address or add a new one.');
      },
      { timeout: 6000 }
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Blinkit-style Orange Header */}
          <div className="bg-[#FF6A00] text-white px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Select delivery location
                </h2>
                <p className="text-[11px] text-orange-100 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 30-Min Express Delivery • Saphale 401102
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input & Quick Actions (Video 00:08 UX) */}
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 space-y-3 bg-gray-50/70 dark:bg-gray-900/60 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search for area, street name, or pincode..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl pl-10 pr-8 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-orange-50/70 dark:hover:bg-orange-950/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-[#FF6A00] flex items-center justify-center shrink-0">
                    <LocateFixed className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#FF6A00]">
                      {locating ? 'Detecting GPS location...' : 'Use your current location'}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                      Enable GPS for accurate 30-minute doorstep delivery
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-orange-50/70 dark:hover:bg-orange-950/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-[#FF6A00] flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#FF6A00]">
                      Add new address
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                      Save a Home, Work or Saphale (401102) address
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {locationNotice && (
              <div className="text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl px-3 py-2">
                {locationNotice}
              </div>
            )}
          </div>

          {/* Saved Addresses List */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                Your saved addresses ({filteredAddresses.length})
              </span>
            </div>

            {filteredAddresses.length === 0 ? (
              <div className="text-center py-8 px-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#FF6A00] flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-gray-800 dark:text-gray-200 mb-1">
                  No Matching Addresses
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-xs mx-auto">
                  Add your home or work address in Saphale (401102) for instant 30-minute grocery delivery.
                </p>
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="bg-[#FF6A00] hover:bg-orange-600 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Delivery Address
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredAddresses.map((addr, idx) => {
                  const isSelected = selectedAddress?.id === addr.id;
                  const isApproved = isPincodeApproved(addr.pincode);
                  const IconComp = getIconForLabel(addr.label);
                  const distanceStr = getDistanceKm(addr.latitude, addr.longitude);

                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddress(addr);
                        onClose();
                      }}
                      className={`p-3.5 sm:p-4 rounded-2xl border text-left cursor-pointer transition-all relative ${
                        isSelected
                          ? 'border-[#FF6A00] bg-orange-50/70 dark:bg-orange-950/30 shadow-md ring-2 ring-[#FF6A00]/25'
                          : 'border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-gray-700 bg-white dark:bg-gray-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="flex flex-col items-center shrink-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                isSelected
                                  ? 'bg-[#FF6A00] text-white shadow-xs'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                              }`}
                            >
                              <IconComp className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 mt-1 text-center leading-tight">
                              {distanceStr}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-gray-100">
                                {addr.label}
                              </h4>
                              {(addr.isDefault || idx === 0) && (
                                <span className="bg-orange-100 dark:bg-orange-950 text-[#FF6A00] text-[9px] font-black px-1.5 py-0.5 rounded-md">
                                  Frequently used
                                </span>
                              )}
                              {isSelected && (
                                <span className="bg-[#FF6A00] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5" /> Selected
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-bold text-gray-700 dark:text-gray-200 leading-snug mt-1">
                              {addr.addressLine}, {addr.area}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                              {addr.city} - <strong className="font-mono text-gray-700 dark:text-gray-300">{addr.pincode}</strong>
                              {currentUser?.phone && (
                                <span className="ml-2 text-gray-500">• {currentUser.phone}</span>
                              )}
                            </p>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded inline-block mt-1.5 ${
                                isApproved
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                              }`}
                            >
                              {isApproved ? '✓ 30-Min Serviceable' : '✕ Not serving PIN ' + addr.pincode}
                            </span>
                          </div>
                        </div>

                        {/* Edit & Delete Buttons */}
                        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setEditingAddress(addr)}
                            className="p-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/60 text-[#FF6A00] transition-colors cursor-pointer"
                            title="Edit address"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddressToDelete(addr)}
                            className="p-1.5 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/80 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="p-3 bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-800/60 rounded-2xl flex items-start gap-2.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#FF6A00] shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                <strong className="text-gray-900 dark:text-white">Saphale (401102) 30-Min Guarantee:</strong> Live rider dispatch from our closest local partner store.
              </p>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="p-3.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={() => setIsAddingNew(true)}
              className="text-[#FF6A00] font-black text-xs flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
            <button
              onClick={onClose}
              className="bg-[#FF6A00] hover:bg-orange-600 text-white font-black text-xs px-6 py-2.5 rounded-2xl shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <AddAddressModal isOpen={isAddingNew} onClose={() => setIsAddingNew(false)} />

      {/* Edit Address Modal */}
      <AddAddressModal
        isOpen={!!editingAddress}
        initialAddress={editingAddress}
        onClose={() => setEditingAddress(null)}
      />

      {/* Delete Address Confirmation Dialog */}
      {addressToDelete && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-gray-100">
                Delete Address?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Are you sure you want to remove <span className="font-bold text-[#FF6A00]">'{addressToDelete.label}'</span> ({addressToDelete.addressLine})?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAddressToDelete(null)}
                className="px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAddress(addressToDelete.id);
                  setAddressToDelete(null);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black px-5 py-2 rounded-2xl shadow-md transition-transform active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
