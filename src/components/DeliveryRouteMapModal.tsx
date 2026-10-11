import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import {
  X,
  MapPin,
  Navigation,
  CheckCircle2,
  Bike,
  Building,
  Phone,
  ExternalLink,
  Clock,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

interface DeliveryRouteMapModalProps {
  order: Order | null;
  onClose: () => void;
  defaultLeg?: 'store' | 'customer';
}

export const DeliveryRouteMapModal: React.FC<DeliveryRouteMapModalProps> = ({
  order,
  onClose,
  defaultLeg = 'store'
}) => {
  const { updateOrderStatusByAdmin, activePartner } = useApp();
  const [activeLeg, setActiveLeg] = useState<'store' | 'customer'>(defaultLeg);

  if (!order) return null;

  const defaultStore = order.storeInfo || {
    id: 'store-saphale-1',
    name: 'QuickPal Saphale Central Mart',
    address: 'Shop No. 4, Station Road, Saphale East',
    area: 'Saphale East',
    pincode: '401102',
    contactPhone: '+91 98234 56789',
    lat: 19.5785,
    lng: 72.8220
  };

  const isStoreLegActive = activeLeg === 'store';

  // Target coordinates for Leg 1 (Store) & Leg 2 (Customer)
  const originName = isStoreLegActive ? (activePartner?.name || 'Partner Location') : defaultStore.name;
  const destinationName = isStoreLegActive ? defaultStore.name : order.customerName;
  const destinationAddress = isStoreLegActive ? defaultStore.address : (order.deliveryAddress || `${order.address.addressLine}, ${order.address.area}`);
  const destinationPhone = isStoreLegActive ? defaultStore.contactPhone : order.customerPhone;

  // Extract coordinates for customer
  let customerLat: number | null = null;
  let customerLng: number | null = null;

  if (order.deliveryLocation && typeof order.deliveryLocation === 'object') {
    customerLat = order.deliveryLocation.latitude;
    customerLng = order.deliveryLocation.longitude;
  } else if (order.address && typeof order.address.latitude === 'number' && typeof order.address.longitude === 'number') {
    customerLat = order.address.latitude;
    customerLng = order.address.longitude;
  }

  const hasCustomerCoords = customerLat !== null && customerLng !== null && !isNaN(customerLat) && !isNaN(customerLng) && customerLat !== 0 && customerLng !== 0;

  // External Google Maps directions URL with direct lat,lng destination
  let googleMapsUrl: string | null = null;
  if (isStoreLegActive) {
    googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=19.5785,72.8220`;
  } else if (hasCustomerCoords) {
    googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${customerLat},${customerLng}`;
  }

  const handleMarkPickedUp = () => {
    updateOrderStatusByAdmin(order.id, 'picked_up');
    setActiveLeg('customer');
  };

  const handleMarkDelivered = () => {
    updateOrderStatusByAdmin(order.id, 'delivered');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-lg shadow-md">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider">
                  Live GPS Route Navigation
                </span>
                <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded-md">
                  #{order.id}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black leading-tight text-white">
                {isStoreLegActive ? 'Leg 1: Navigate to Store Pickup' : 'Leg 2: Navigate to Customer Doorstep'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Leg Switcher Tabs */}
        <div className="bg-slate-100 dark:bg-slate-800/80 p-2 flex items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveLeg('store')}
            className={`flex-1 py-2 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
              isStoreLegActive
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>1. Store Pickup</span>
            {order.status === 'picked_up' || order.status === 'out_for_delivery' || order.status === 'delivered' ? (
              <span className="bg-emerald-400 text-slate-950 text-[9px] px-1.5 py-0.5 rounded-full font-bold">✓ Collected</span>
            ) : null}
          </button>

          <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />

          <button
            onClick={() => setActiveLeg('customer')}
            className={`flex-1 py-2 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
              !isStoreLegActive
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>2. Customer Doorstep</span>
            {order.status === 'delivered' ? (
              <span className="bg-emerald-400 text-slate-950 text-[9px] px-1.5 py-0.5 rounded-full font-bold">✓ Delivered</span>
            ) : null}
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Simulated Interactive Map Display Canvas */}
          <div className="relative w-full h-64 sm:h-72 bg-slate-900 rounded-3xl overflow-hidden shadow-inner border border-slate-700">
            {/* Grid graphic background */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

            {/* Map Roads Visualizer */}
            <svg className="absolute inset-0 w-full h-full stroke-slate-700/80 fill-none" strokeWidth="6">
              <path d="M 40 180 Q 150 120, 280 140 T 480 80 T 600 200" strokeDasharray="6 6" className="animate-pulse stroke-orange-500/40" />
              <path d="M 40 180 Q 150 120, 280 140 T 480 80 T 600 200" strokeWidth="3" className="stroke-orange-400" />
            </svg>

            {/* Origin Marker */}
            <div className="absolute top-[55%] left-[12%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
              <div className="bg-blue-600 text-white p-2.5 rounded-2xl shadow-lg ring-4 ring-blue-500/30 flex items-center justify-center">
                <Bike className="w-5 h-5" />
              </div>
              <span className="mt-1 bg-slate-900/90 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow border border-slate-700 whitespace-nowrap">
                {originName}
              </span>
            </div>

            {/* Destination Marker */}
            <div className="absolute top-[28%] right-[18%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 animate-bounce">
              <div className={`p-2.5 rounded-2xl shadow-lg ring-4 flex items-center justify-center text-white ${
                isStoreLegActive
                  ? 'bg-amber-500 ring-amber-500/30'
                  : 'bg-emerald-600 ring-emerald-500/30'
              }`}>
                {isStoreLegActive ? <Building className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
              </div>
              <span className="mt-1 bg-slate-900/90 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow border border-slate-700 whitespace-nowrap">
                {destinationName}
              </span>
            </div>

            {/* Distance & Time Overlay Badge */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-4 text-xs font-bold">
              <div>
                <span className="text-[9px] uppercase font-black text-slate-400 block">Estimated Distance</span>
                <span className="text-orange-400 font-extrabold text-sm">{isStoreLegActive ? '1.2 km' : '2.8 km'}</span>
              </div>
              <div className="h-6 w-px bg-slate-700" />
              <div>
                <span className="text-[9px] uppercase font-black text-slate-400 block">Est. Drive Time</span>
                <span className="text-emerald-400 font-extrabold text-sm">{isStoreLegActive ? '4 mins' : '8 mins'}</span>
              </div>
            </div>

            {/* Open Google Maps Button */}
            {googleMapsUrl ? (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 bg-white text-slate-900 hover:bg-slate-100 font-black text-xs px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <ExternalLink className="w-4 h-4 text-blue-600" />
                Navigate to {isStoreLegActive ? 'Store' : 'Customer'}
              </a>
            ) : (
              <div className="absolute bottom-3 right-3 bg-rose-950/90 text-rose-200 border border-rose-800 font-bold text-[11px] px-3 py-2 rounded-2xl shadow-xl">
                Customer location is unavailable.
              </div>
            )}
          </div>

          {/* Destination Details Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isStoreLegActive ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  {isStoreLegActive ? 'Store Pickup Address' : 'Customer Delivery Address'}
                </h4>
              </div>
              <a
                href={`tel:${destinationPhone}`}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" /> Call Contact
              </a>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-black text-gray-900 dark:text-gray-100">{destinationName}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{destinationAddress}</p>
              <p className="text-[11px] text-orange-600 dark:text-orange-400 font-bold">
                Zone: Saphale ({isStoreLegActive ? defaultStore.pincode : order.address.pincode})
              </p>
            </div>
          </div>

          {/* Items Summary list */}
          <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-200/50 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-extrabold text-amber-900 dark:text-amber-300 uppercase text-[10px]">
                Order Items ({order.items.length})
              </span>
              <span className="font-black text-orange-700 dark:text-orange-400">Total ₹{order.total} ({order.paymentMethod.toUpperCase()})</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
            </p>
          </div>

          {/* Action Step Controls */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            {isStoreLegActive ? (
              order.status === 'store_accepted' || order.status === 'accepted' || order.status === 'placed' ? (
                <button
                  onClick={handleMarkPickedUp}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Arrived at Store & Collected Order Items
                </button>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center">
                  ✓ Store Pickup Completed. Proceed to Leg 2 (Customer Delivery).
                </div>
              )
            ) : order.status === 'delivered' ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center">
                🎉 Order Successfully Delivered to Customer!
              </div>
            ) : (
              <button
                onClick={handleMarkDelivered}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" />
                Confirm Order Delivered to Customer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
