import React, { useState } from 'react';
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
  Sparkles,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { AddAddressModal } from './AddAddressModal';

interface AddressManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddressManagementModal: React.FC<AddressManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    addresses,
    selectedAddress,
    setSelectedAddress,
    deleteAddress,
    isPincodeApproved
  } = useApp();

  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<DeliveryAddress | null>(null);

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

  return (
    <>
      <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Top Header Banner */}
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-5 relative shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-sm">
                  <MapPin className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-amber-100 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-300" /> 30-Min Delivery
                    </span>
                    <span className="text-[10px] font-extrabold text-amber-200/90">
                      Saphale 401102
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
                    Select & Manage Delivery Address
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-amber-100/90 font-medium mt-2 leading-relaxed">
              Choose where your fresh groceries and daily essentials will be delivered. You can edit, delete, or add new addresses anytime.
            </p>
          </div>

          {/* Current Active Address Summary Strip */}
          {selectedAddress && (
            <div className="bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-900/60 px-5 py-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <p className="truncate text-amber-950 dark:text-amber-200 font-bold">
                  Delivering to: <span className="font-extrabold text-orange-700 dark:text-orange-400">{selectedAddress.label}</span> ({selectedAddress.pincode}, {selectedAddress.area})
                </p>
              </div>
              <span className="text-[10px] font-mono font-black text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full shrink-0 border border-emerald-300 dark:border-emerald-800">
                ACTIVE
              </span>
            </div>
          )}

          {/* Body Content - Addresses List */}
          <div className="p-5 overflow-y-auto space-y-3 flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                Saved Delivery Addresses ({addresses.length})
              </span>
              <button
                onClick={() => setIsAddingNew(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-10 px-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-gray-800 dark:text-gray-200 mb-1">
                  No Addresses Saved Yet
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-xs mx-auto">
                  Add your home or work address in Saphale for instant 30-minute grocery delivery!
                </p>
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-md inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Delivery Address
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {addresses.map((addr) => {
                  const isSelected = selectedAddress?.id === addr.id;
                  const isApproved = isPincodeApproved(addr.pincode);
                  const IconComp = getIconForLabel(addr.label);

                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all relative ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/30 shadow-md ring-2 ring-orange-500/30'
                          : 'border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-gray-700 bg-white dark:bg-gray-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-orange-500 text-white shadow-xs'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-gray-900 dark:text-gray-100">
                                {addr.label}
                              </h4>
                              {isSelected && (
                                <span className="bg-orange-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5" /> Selected
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                                isApproved
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                              }`}
                            >
                              {isApproved ? '✓ 30-Min Serviceable' : '✕ Out of Service Area'}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons: Edit & Delete */}
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setEditingAddress(addr)}
                            className="p-2 rounded-xl bg-orange-100 hover:bg-orange-200 dark:bg-orange-950/80 dark:hover:bg-orange-900 text-orange-700 dark:text-orange-300 transition-colors flex items-center gap-1 text-[11px] font-bold"
                            title="Edit this address"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddressToDelete(addr)}
                            className="p-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/80 text-gray-400 hover:text-rose-600 transition-colors"
                            title="Delete this address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Address Details */}
                      <div className="mt-2.5 pl-10 text-xs space-y-0.5">
                        <p className="font-bold text-gray-800 dark:text-gray-200 leading-snug">
                          {addr.addressLine}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                          {addr.area}, {addr.city} - <strong className="font-mono text-gray-700 dark:text-gray-300">{addr.pincode}</strong>
                          {addr.landmark && (
                            <span className="block text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                              Landmark: {addr.landmark}
                            </span>
                          )}
                        </p>
                        {addr.latitude && addr.longitude && (
                          <p className="text-[9px] font-mono text-gray-400 dark:text-gray-500 pt-0.5 flex items-center gap-1">
                            <Navigation className="w-2.5 h-2.5 text-orange-500" /> GPS: {addr.latitude.toFixed(4)}, {addr.longitude.toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Saphale Service Guarantee Info */}
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl flex items-start gap-2.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-emerald-900 dark:text-emerald-200">
                  QuickPal Saphale 30-Minute Guarantee
                </p>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                  We guarantee direct door-to-door delivery within 30 minutes for all approved locations across Saphale (PIN 401102).
                </p>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={() => setIsAddingNew(true)}
              className="text-orange-600 dark:text-orange-400 font-black text-xs flex items-center gap-1.5 hover:underline"
            >
              <Plus className="w-4 h-4" /> Add Another Address
            </button>
            <button
              onClick={onClose}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-6 py-2.5 rounded-2xl shadow-md transition-transform active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <AddAddressModal
        isOpen={isAddingNew}
        onClose={() => setIsAddingNew(false)}
      />

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
                Are you sure you want to remove <span className="font-bold text-orange-600 dark:text-orange-400">'{addressToDelete.label}'</span> ({addressToDelete.addressLine}) from your saved delivery locations?
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
