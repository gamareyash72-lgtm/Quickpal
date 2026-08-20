import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { printOrderReceipt } from '../utils/printReceipt';
import {
  Store,
  CheckCircle2,
  Package,
  Clock,
  MapPin,
  Phone,
  ShieldAlert,
  Lock,
  Bike,
  Building,
  AlertCircle,
  CheckCircle,
  Users,
  Printer
} from 'lucide-react';

export const StoreStaffDashboard: React.FC = () => {
  const { orders, storeAcceptOrder } = useApp();
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'history'>('pending');

  // Orders waiting for store stock confirmation
  const pendingOrders = orders.filter(o => o.status === 'placed');

  // Orders accepted by store, in progress
  const activeAcceptedOrders = orders.filter(
    o => o.status === 'store_accepted' || o.status === 'accepted' || o.status === 'picked_up' || o.status === 'out_for_delivery'
  );

  // Completed/cancelled history
  const historyOrders = orders.filter(
    o => o.status === 'delivered' || o.status === 'cancelled' || o.status === 'rejected'
  );

  const defaultStore = {
    name: 'QuickPal Saphale Central Mart',
    address: 'Shop No. 4, Station Road, Saphale East, 401102',
    phone: '+91 98234 56789'
  };

  const formatLoc = (loc: any, fallback = 'Saphale East Hub') => {
    if (!loc) return fallback;
    if (typeof loc === 'object') {
      if (typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
        return `GPS: ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`;
      }
      return fallback;
    }
    return String(loc);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 space-y-6 pb-24">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-400/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-blue-400 text-slate-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Store className="w-3 h-3" />
              Store Staff Portal
            </span>
            <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-emerald-400/30">
              Order Acceptance Active
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Store Product Availability & Dispatch Desk
          </h2>
          <p className="text-xs text-blue-100 font-medium max-w-2xl">
            {defaultStore.name} • {defaultStore.address}
          </p>
        </div>

        <div className="bg-slate-800/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700 text-xs font-bold shrink-0">
          <span className="text-gray-400 text-[10px] uppercase block font-black">Pending Verification</span>
          <span className="text-xl font-black text-amber-400">{pendingOrders.length} New Orders</span>
        </div>
      </div>

      {/* Security & Permissions Disclaimer Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold uppercase text-[11px] block">
            Store Staff Access Restrictions Policy
          </span>
          <p className="font-medium text-amber-800 dark:text-amber-300 mt-0.5">
            Admin & Owner features (Catalog Management, Pricing, User Accounts, Gateway Setup, Banners, Coupons) are disabled for Store Staff.
            Your role is strictly authorized for <strong>Order Product Stock Verification & Acceptance</strong>.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm gap-2 max-w-xl">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
            activeTab === 'pending'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Stock Check ({pendingOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('accepted')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
            activeTab === 'accepted'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Store Accepted ({activeAcceptedOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
            activeTab === 'history'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Order History</span>
        </button>
      </div>

      {/* TAB 1: Pending Orders Requiring Stock Acceptance */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-200 dark:border-gray-800 space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-black text-gray-900 dark:text-gray-100">All Orders Verified</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                No new customer orders waiting for stock verification right now. New orders will appear here instantly.
              </p>
            </div>
          ) : (
            pendingOrders.map(ord => (
              <div
                key={ord.id}
                className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-amber-300 dark:border-amber-700 shadow-md space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-400 text-amber-950 font-black text-xs px-2.5 py-1 rounded-lg">
                      STOCK CHECK REQUIRED
                    </span>
                    <span className="text-sm font-black text-gray-900 dark:text-gray-100">
                      Order #{ord.id}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-orange-600 dark:text-orange-400">
                      Total: ₹{ord.total} ({ord.paymentMethod.toUpperCase()})
                    </span>
                    <p className="text-[10px] text-gray-400">{new Date(ord.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>

                {/* Customer Info & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
                    <span className="font-extrabold text-gray-400 uppercase text-[10px] block">Customer Details</span>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{ord.customerName || 'Customer'}</p>
                    <p className="text-gray-500 text-[11px]">{ord.customerPhone || 'N/A'}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
                    <span className="font-extrabold text-gray-400 uppercase text-[10px] block">Delivery Location</span>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{formatLoc(ord.deliveryLocation, ord.address?.addressLine || 'Saphale')}</p>
                    <p className="text-gray-500 text-[11px]">Pin: {ord.address?.pincode || ord.deliveryPincode || '401102'}</p>
                  </div>
                </div>

                {/* Products Requested List */}
                <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/50 space-y-2 text-xs">
                  <span className="font-black text-amber-900 dark:text-amber-300 text-[11px] uppercase tracking-wider block">
                    🛒 Requested Items ({(ord.items || []).length}) - Please Verify Store Inventory:
                  </span>
                  <div className="divide-y divide-amber-200/50 dark:divide-amber-900/40">
                    {(ord.items || []).map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-gray-800 dark:text-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-amber-500 text-white font-black text-[10px] flex items-center justify-center">
                            {item.quantity}x
                          </span>
                          <span className="font-bold">{item.product?.name || 'Item'}</span>
                          <span className="text-[10px] text-gray-500">({item.product?.weightUnit || 'Standard'})</span>
                        </div>
                        <span className="font-black">₹{(item.product?.price || 0) * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button for Store Staff */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => printOrderReceipt(ord)}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-extrabold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Printer className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    Print Receipt
                  </button>

                  <button
                    onClick={() => storeAcceptOrder(ord.id)}
                    className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-2xl text-xs shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept Order & Confirm All Products Available
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Accepted Orders & Delivery Rider Dispatch Status */}
      {activeTab === 'accepted' && (
        <div className="space-y-4">
          {activeAcceptedOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-200 dark:border-gray-800 text-gray-500 text-xs font-bold">
              No store accepted orders currently in dispatch pipeline.
            </div>
          ) : (
            activeAcceptedOrders.map(ord => (
              <div
                key={ord.id}
                className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-blue-200 dark:border-blue-900/60 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400">
                      Order #{ord.id}
                    </span>
                    <span className="ml-2 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-xs font-black text-gray-900 dark:text-gray-100">
                    Total: ₹{ord.total}
                  </span>
                </div>

                {/* Delivery Rider Assignment Status */}
                <div className="bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center font-black">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-gray-400 block">Delivery Rider Status</span>
                      <p className="font-black text-gray-900 dark:text-gray-100">
                        {ord.deliveryPartnerName ? `Assigned Rider: ${ord.deliveryPartnerName}` : 'Broadcast sent to nearby riders...'}
                      </p>
                    </div>
                  </div>
                  {!ord.deliveryPartnerId && (
                    <span className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                      Awaiting Rider Pickup
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 text-xs text-gray-600 dark:text-gray-400 font-medium">
                  <div>
                    <strong>Items:</strong> {(ord.items || []).map(i => `${i.quantity}x ${i.product?.name || 'Item'}`).join(', ')}
                  </div>
                  <button
                    onClick={() => printOrderReceipt(ord)}
                    className="shrink-0 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-extrabold text-xs flex items-center gap-1 transition-all"
                  >
                    <Printer className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> Print
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: History */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-200 dark:border-gray-800 space-y-3">
          <h3 className="text-xs font-black uppercase text-gray-800 dark:text-gray-200">
            Completed Store Order Log ({historyOrders.length})
          </h3>
          {historyOrders.length === 0 ? (
            <p className="text-xs text-gray-500">No order history yet.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
              {historyOrders.map(ord => (
                <div key={ord.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-900 dark:text-gray-100">#{ord.id}</span>
                    <span className="ml-2 text-gray-500">{ord.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">₹{ord.total}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                      ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {ord.status}
                    </span>
                    <button
                      onClick={() => printOrderReceipt(ord)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-orange-600 transition-colors"
                      title="Print Receipt"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
