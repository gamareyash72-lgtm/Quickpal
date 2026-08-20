import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { DeliveryRouteMapModal } from './DeliveryRouteMapModal';
import { DeliveryOtpModal } from './DeliveryOtpModal';
import { SecureCallModal } from './SecureCallModal';
import { maskPhoneNumber } from '../utils/phonePrivacy';
import { db, auth, onSnapshot, collection } from '../lib/firebase';
import {
  Bike,
  CheckCircle,
  XCircle,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Power,
  Navigation,
  ChevronRight,
  ShieldAlert,
  AlertCircle,
  Building,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Wifi,
  WifiOff,
  KeyRound,
  Lock
} from 'lucide-react';

export const DeliveryPartnerDashboard: React.FC = () => {
  const {
    currentUser,
    partners,
    selectedPartnerId,
    setSelectedPartnerId,
    activePartner,
    servicePincodes,
    orders,
    syncOrdersFromRemote,
    partnerRespondToOrder,
    updateOrderStatusByAdmin,
    completeDeliveryWithOtp,
    updatePartner
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'assigned' | 'history'>('pending');
  const [selectedMapOrder, setSelectedMapOrder] = useState<Order | null>(null);
  const [selectedOrderForOtp, setSelectedOrderForOtp] = useState<Order | null>(null);
  const [secureCallTarget, setSecureCallTarget] = useState<{
    recipientName: string;
    recipientRole: string;
    rawPhoneNumber: string;
    orderId?: string;
  } | null>(null);
  const [mapDefaultLeg, setMapDefaultLeg] = useState<'store' | 'customer'>('store');
  const [selectedZonePincode, setSelectedZonePincode] = useState<string>(activePartner?.pinCode || '401102');
  
  // Real-time listener connection & error diagnostics state
  const [listenerStatus, setListenerStatus] = useState<'connected' | 'reconnecting' | 'error'>('connecting' as any);
  const [syncError, setSyncError] = useState<{ code: string; message: string; timestamp: string } | null>(null);
  const [reconnectCount, setReconnectCount] = useState<number>(0);

  const isPartnerUser = currentUser && currentUser.role === 'partner';
  const partnerUid = currentUser?.id || activePartner?.id || 'dp-1';

  // Manual or automatic re-authentication & reconnection handler
  const handleReauthAndReconnect = useCallback(async () => {
    setListenerStatus('reconnecting');
    setSyncError(null);
    try {
      if (auth.currentUser) {
        console.log('[DeliveryPartnerDashboard] Refreshing Firebase Auth token...');
        await auth.currentUser.getIdToken(true);
        console.log('[DeliveryPartnerDashboard] Token refreshed successfully.');
      } else {
        console.log('[DeliveryPartnerDashboard] No active Firebase Auth user session; reconnecting listener...');
      }
      setReconnectCount(prev => prev + 1);
    } catch (err: any) {
      console.error('[DeliveryPartnerDashboard] Re-authentication error:', {
        code: err?.code || 'AUTH_REFRESH_ERROR',
        message: err?.message || String(err)
      });
      setSyncError({
        code: err?.code || 'AUTH_REFRESH_ERROR',
        message: err?.message || 'Failed to refresh authentication session.',
        timestamp: new Date().toLocaleTimeString()
      });
      setListenerStatus('error');
    }
  }, []);

  // Dedicated Firestore real-time onSnapshot listener for Delivery Partner
  useEffect(() => {
    if (!db) {
      setListenerStatus('connected');
      return;
    }

    setListenerStatus('connected');
    const ordersColRef = collection(db, 'orders');

    const unsub = onSnapshot(
      ordersColRef,
      (snapshot) => {
        setListenerStatus('connected');
        setSyncError(null);

        const remoteOrders: Order[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          remoteOrders.push({
            id: docSnap.id,
            ...data,
            status: (data?.status || 'placed').toString(),
            items: data?.items || [],
            partnerResponseLogs: data?.partnerResponseLogs || [],
            deliveryPincode: data?.deliveryPincode || data?.address?.pincode || '401102',
            assignedPartnerId: data?.assignedPartnerId || data?.deliveryPartnerId || null,
            deliveryPartnerId: data?.deliveryPartnerId || data?.assignedPartnerId || null
          } as Order);
        });

        if (syncOrdersFromRemote) {
          syncOrdersFromRemote(remoteOrders);
        }
      },
      async (err) => {
        console.warn('[DeliveryPartnerDashboard onSnapshot Listener Notice]', {
          code: err.code,
          message: err.message,
          name: err.name,
          partnerId: partnerUid,
          authUid: auth.currentUser?.uid || 'anonymous/unauthenticated',
          timestamp: new Date().toISOString()
        });

        setSyncError({
          code: err.code || 'UNKNOWN_ERROR',
          message: err.message || 'Firestore listener encountered an unexpected error.',
          timestamp: new Date().toLocaleTimeString()
        });
        setListenerStatus('error');

        // Handle permission-denied or unauthenticated by re-authenticating / refreshing token
        if (err.code === 'permission-denied' || err.code === 'unauthenticated') {
          if (auth.currentUser) {
            try {
              await auth.currentUser.getIdToken(true);
            } catch (refreshErr) {
              console.warn('[DeliveryPartnerDashboard] Token refresh notice:', refreshErr);
            }
          }
        }
      }
    );

    return () => unsub();
  }, [reconnectCount, partnerUid, syncOrdersFromRemote]);

  if (!activePartner) {
    return (
      <div className="p-8 text-center text-gray-500">
        No active delivery partner account found.
      </div>
    );
  }

  // Pending orders requiring partner acceptance in active service area pincode (default 401102)
  const pendingOrders = (orders || []).filter(o => {
    const s = (o?.status || 'pending').toLowerCase().trim();
    const isEligibleStatus = !s || s === 'pending' || s === 'placed' || s === 'store_accepted' || s === 'ready_for_delivery' || s === 'processing';
    const isUnassigned = !o?.deliveryPartnerId && !o?.assignedPartnerId;
    const notResponded = !(o?.partnerResponseLogs || []).some(l => l?.partnerId === partnerUid);
    const pin = (o?.deliveryPincode || (typeof o?.address === 'object' ? (o.address as any)?.pincode : '') || (typeof o?.deliveryAddress === 'string' && o.deliveryAddress.includes('401102') ? '401102' : '') || '401102').trim();
    const activeZone = (selectedZonePincode || activePartner?.pinCode || '401102').trim();
    const isZoneMatch = !activeZone || !pin || pin === activeZone || pin === '401102' || activeZone === '401102';

    return isEligibleStatus && isUnassigned && notResponded && isZoneMatch;
  });

  // Orders accepted by this partner
  const myAssignedOrders = (orders || []).filter(
    o => (o?.deliveryPartnerId === partnerUid || o?.assignedPartnerId === partnerUid) &&
      (o?.status || '').toLowerCase() !== 'delivered' && (o?.status || '').toLowerCase() !== 'cancelled'
  );

  // Completed delivery history for this partner
  const myCompletedOrders = (orders || []).filter(
    o => (o?.deliveryPartnerId === partnerUid || o?.assignedPartnerId === partnerUid) &&
      (o?.status || '').toLowerCase() === 'delivered'
  );

  // Accurate real-time earnings calculation from verified delivered orders
  const todayStr = new Date().toDateString();
  const todayCompletedOrders = myCompletedOrders.filter(o => {
    if (!o.createdAt) return true;
    try {
      return new Date(o.createdAt).toDateString() === todayStr;
    } catch {
      return true;
    }
  });

  const todayEarnings = todayCompletedOrders.reduce((sum, o) => sum + (o.deliveryFee || 40), 0);
  const totalCompletedTrips = myCompletedOrders.length;
  const totalEarnings = myCompletedOrders.reduce((sum, o) => sum + (o.deliveryFee || 40), 0);

  const toggleOnline = () => {
    updatePartner({
      ...activePartner,
      isOnline: !activePartner.isOnline
    });
  };

  const handleOpenMap = (order: Order, leg: 'store' | 'customer') => {
    setSelectedMapOrder(order);
    setMapDefaultLeg(leg);
  };

  const getCustomerNavUrl = (ord: Order) => {
    let lat: number | null = null;
    let lng: number | null = null;

    if (ord.deliveryLocation && typeof ord.deliveryLocation === 'object') {
      lat = ord.deliveryLocation.latitude;
      lng = ord.deliveryLocation.longitude;
    } else if (ord.address && typeof ord.address.latitude === 'number' && typeof ord.address.longitude === 'number') {
      lat = ord.address.latitude;
      lng = ord.address.longitude;
    }

    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 space-y-6 pb-20">
      {/* Sync Status / Permission Diagnostics Banner */}
      {syncError && (
        <div className="bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-md animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-500 text-white rounded-xl">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-rose-900 dark:text-rose-200">
                  Firestore Orders Stream Notice
                </span>
                <span className="bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                  {syncError.code}
                </span>
              </div>
              <p className="text-rose-700 dark:text-rose-300 text-[11px] mt-0.5">
                {syncError.message} (Logged at {syncError.timestamp})
              </p>
            </div>
          </div>
          <button
            onClick={handleReauthAndReconnect}
            className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all transform active:scale-95 whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-authenticate & Reconnect
          </button>
        </div>
      )}

      {/* Top Bar Partner Profile & Status */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-orange-950 flex items-center justify-center font-black text-xl shadow-md">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Partner Profile
              </span>
              {isPartnerUser ? (
                <span className="text-[11px] font-black text-orange-800 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/80 px-2.5 py-0.5 rounded-lg border border-orange-200 dark:border-orange-800">
                  ID: #{activePartner.id}
                </span>
              ) : (
                <select
                  value={selectedPartnerId}
                  onChange={e => setSelectedPartnerId(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.vehicleType})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 mt-0.5">
              {activePartner.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Vehicle: {activePartner.vehicleType} • {activePartner.vehicleNumber}
            </p>
          </div>
        </div>

        {/* Online / Offline Toggle */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 dark:border-gray-800">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 mb-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Duty Status</span>
              {listenerStatus === 'connected' && !syncError && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Sync
                </span>
              )}
            </div>
            <span
              className={`text-xs font-black uppercase tracking-wider ${
                activePartner.isOnline ? 'text-orange-600' : 'text-gray-400'
              }`}
            >
              {activePartner.isOnline ? '● Online & Accepting Orders' : '○ Offline'}
            </span>
          </div>

          <button
            onClick={toggleOnline}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-md transition-all ${
              activePartner.isOnline
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Power className="w-4 h-4" />
            {activePartner.isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

      {/* Earnings & Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-orange-500 text-white rounded-3xl p-4 shadow-md">
          <span className="text-[10px] font-black uppercase tracking-wider text-orange-100">
            Today's Earnings
          </span>
          <p className="text-2xl font-black mt-1">₹{todayEarnings}</p>
          <span className="text-[10px] text-orange-100">₹40 payout per delivery</span>
        </div>

        <div className="bg-yellow-400 text-orange-950 rounded-3xl p-4 shadow-md">
          <span className="text-[10px] font-black uppercase tracking-wider text-orange-950">
            Completed Trips
          </span>
          <p className="text-2xl font-black mt-1">
            {totalCompletedTrips}
          </p>
          <span className="text-[10px] text-orange-900/80">Lifetime verified deliveries</span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-4 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
            Partner Rating
          </span>
          <p className="text-2xl font-black mt-1 text-amber-500">
            ★ {totalCompletedTrips > 0 ? (activePartner.rating || 5.0).toFixed(1) : '5.0'}
          </p>
          <span className="text-[10px] text-gray-500">
            {totalCompletedTrips > 0 ? 'Based on verified deliveries' : 'New partner standard'}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Operating Hub Zone
              </span>
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <p className="text-xs font-black mt-1 text-gray-800 dark:text-gray-200 line-clamp-1">
              {activePartner.currentLocationName || 'Saphale East Express Hub'}
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-1.5">
            <span className="text-[10px] text-gray-400 font-extrabold uppercase">Service PIN:</span>
            <select
              value={selectedZonePincode}
              onChange={e => {
                const newPin = e.target.value;
                setSelectedZonePincode(newPin);
                updatePartner({ ...activePartner, pinCode: newPin });
              }}
              className="bg-orange-50 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 text-xs font-black px-2 py-0.5 rounded-lg border border-orange-200 dark:border-orange-800 focus:outline-none cursor-pointer"
            >
              {servicePincodes.filter(p => p.isActive).map(p => (
                <option key={p.id} value={p.pincode}>
                  {p.pincode} ({p.areaName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-2xl w-fit gap-1">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'pending'
              ? 'bg-white dark:bg-gray-700 text-orange-700 dark:text-orange-300 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          New Orders ({pendingOrders.length})
          {pendingOrders.length > 0 && (
            <span className="ml-1.5 bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
              NEW
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('assigned')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'assigned'
              ? 'bg-white dark:bg-gray-700 text-orange-700 dark:text-orange-300 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Active Deliveries ({myAssignedOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-white dark:bg-gray-700 text-orange-700 dark:text-orange-300 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Completed History
        </button>
      </div>

      {/* Tab 1: New Orders Requiring Accept / Reject */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {!activePartner.isOnline ? (
            <div className="bg-amber-50 dark:bg-amber-950/40 p-6 rounded-3xl border border-amber-200 dark:border-amber-900 text-center space-y-2">
              <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto" />
              <h4 className="text-sm font-black text-amber-900 dark:text-amber-200">
                You are currently OFFLINE
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Toggle your status to ONLINE above to receive instant order ping notifications.
              </p>
            </div>
          ) : pendingOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 text-center space-y-2">
              <Bike className="w-10 h-10 text-orange-500 mx-auto opacity-40 animate-bounce" />
              <h4 className="text-sm font-black text-gray-700 dark:text-gray-300">
                Waiting for incoming orders...
              </h4>
              <p className="text-xs text-gray-400">
                New customer orders placed in your zone will ping here instantly!
              </p>
            </div>
          ) : (
            pendingOrders.map(ord => (
              <div
                key={ord.id}
                className="bg-white dark:bg-gray-900 rounded-3xl p-5 border-2 border-yellow-400 shadow-lg space-y-4 animate-in fade-in"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="bg-yellow-400 text-orange-950 font-black text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" />
                      {ord.status === 'store_accepted' ? 'STORE ACCEPTED & IN STOCK' : 'NEW ORDER REQUEST'}
                    </span>
                    <span className="text-sm font-black text-gray-900 dark:text-gray-100">
                      #{ord.id}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 px-2.5 py-1 rounded-lg">
                    Earn ₹40 Payout
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Pickup Location */}
                  <div className="bg-orange-50/80 dark:bg-orange-950/40 p-3 rounded-2xl border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-1.5 text-orange-700 dark:text-orange-400 font-extrabold uppercase text-[10px] mb-1">
                      <Building className="w-3.5 h-3.5" /> 1. Pickup Store (Map Route Leg 1)
                    </div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{ord.storeInfo?.name || (typeof ord.pickupLocation === 'string' ? ord.pickupLocation : 'QuickPal Store')}</p>
                    <p className="text-[11px] text-gray-500">{ord.storeInfo?.address || 'Shop #4, Station Road, Saphale East'}</p>
                  </div>

                  {/* Delivery Location */}
                  <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-extrabold uppercase text-[10px] mb-1">
                      <Navigation className="w-3.5 h-3.5" /> 2. Customer Destination (Map Route Leg 2)
                    </div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {ord.deliveryAddress || (typeof ord.deliveryLocation === 'string' ? ord.deliveryLocation : `${ord.address?.addressLine}, ${ord.address?.area}`)}
                    </p>
                    {ord.deliveryPincode && <p className="text-[10px] text-gray-500 font-mono">PIN: {ord.deliveryPincode}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-gray-600 dark:text-gray-400">
                        Customer: <strong className="text-gray-900 dark:text-gray-200">{ord.customerName}</strong>
                      </span>
                      <span className="bg-white/80 dark:bg-gray-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700 text-[10px] font-mono text-gray-600 dark:text-gray-300 font-semibold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-orange-500" /> {maskPhoneNumber(ord.customerPhone)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items preview */}
                <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-2xl border border-amber-200/50 text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">
                    Order Items Checked by Store ({(ord.items || []).length}):
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 font-medium truncate">
                    {(ord.items || []).map(i => `${i.quantity}x ${i.product?.name || (i as any).productName || 'Item'}`).join(', ')}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Payment Method: <strong className="uppercase">{ord.paymentMethod}</strong> (Total ₹{ord.total})
                  </p>
                </div>

                {/* Accept / Reject Action Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => partnerRespondToOrder(ord.id, 'rejected')}
                    className="flex-1 bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <XCircle className="w-4 h-4" /> Decline
                  </button>

                  <button
                    onClick={async () => {
                      const res = await partnerRespondToOrder(ord.id, 'accepted');
                      if (!res.success) {
                        alert(res.message);
                      } else {
                        setActiveTab('assigned');
                        handleOpenMap({ ...ord, status: 'PARTNER_ACCEPTED' }, 'store');
                      }
                    }}
                    className="flex-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 transition-all transform active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" /> Accept & Start Store Map Route
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Active Deliveries */}
      {activeTab === 'assigned' && (
        <div className="space-y-4">
          {myAssignedOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 text-center">
              <p className="text-xs text-gray-500 font-bold">No active deliveries at the moment.</p>
            </div>
          ) : (
            myAssignedOrders.map(ord => {
              const isPickUpPhase = ord.status === 'accepted' || ord.status === 'store_accepted';
              return (
                <div
                  key={ord.id}
                  className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-orange-500/30 shadow-md space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-xs font-black uppercase text-orange-600 dark:text-orange-400">
                        Active Order #{ord.id}
                      </span>
                      <p className="text-[11px] text-gray-400">ETA: {ord.deliveryTimeMins} minutes</p>
                    </div>
                    <span className="bg-yellow-400 text-orange-950 text-xs font-black px-3 py-1 rounded-full uppercase">
                      Phase: {isPickUpPhase ? 'Leg 1: Store Pickup' : 'Leg 2: Doorstep Delivery'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className={`p-3 rounded-2xl border ${isPickUpPhase ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-300' : 'bg-gray-50 dark:bg-gray-800 border-gray-200'}`}>
                      <span className="font-extrabold text-orange-700 dark:text-orange-400 text-[10px] uppercase block">
                        1. Store Pickup Address
                      </span>
                      <p className="font-bold text-gray-900 dark:text-gray-100">{ord.storeInfo?.name || (typeof ord.pickupLocation === 'string' ? ord.pickupLocation : 'QuickPal Store')}</p>
                      <p className="text-[11px] text-gray-500">{ord.storeInfo?.address || 'Shop No. 4, Station Road, Saphale East'}</p>
                    </div>

                    <div className={`p-3 rounded-2xl border ${!isPickUpPhase ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300' : 'bg-gray-50 dark:bg-gray-800 border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-[10px] uppercase block">
                          2. Customer Address
                        </span>
                        <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> Masked Contact
                        </span>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-gray-100">{ord.customerName}</p>
                      <p className="text-[11px] text-gray-500">
                        {ord.deliveryAddress || (typeof ord.deliveryLocation === 'string' ? ord.deliveryLocation : `${ord.address?.addressLine}, ${ord.address?.area}`)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {ord.deliveryPincode && <span className="text-[10px] text-gray-400 font-mono">PIN: {ord.deliveryPincode}</span>}
                        <span className="text-[10px] font-mono text-gray-500">
                          {maskPhoneNumber(ord.customerPhone)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Private Call & Map Navigation buttons */}
                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isPickUpPhase) {
                          setSecureCallTarget({
                            recipientName: ord.storeInfo?.name || 'Dark Store Hub #1',
                            recipientRole: 'Store Dispatch Manager',
                            rawPhoneNumber: ord.storeInfo?.contactPhone || '+91 98234 56789',
                            orderId: ord.id
                          });
                        } else {
                          setSecureCallTarget({
                            recipientName: ord.customerName,
                            recipientRole: 'Customer',
                            rawPhoneNumber: ord.customerPhone,
                            orderId: ord.id
                          });
                        }
                      }}
                      className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Phone className="w-4 h-4 text-orange-600" /> Secure Call {isPickUpPhase ? 'Store' : 'Customer'}
                    </button>

                    <button
                      onClick={() => handleOpenMap(ord, isPickUpPhase ? 'store' : 'customer')}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95"
                    >
                      <Navigation className="w-4 h-4" /> Route Map
                    </button>

                    {(() => {
                      const navUrl = getCustomerNavUrl(ord);
                      if (navUrl) {
                        return (
                          <a
                            href={navUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95"
                          >
                            <ExternalLink className="w-4 h-4" /> Navigate to Customer
                          </a>
                        );
                      } else {
                        return (
                          <div className="flex-1 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 px-3 py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center text-center">
                            Customer location is unavailable.
                          </div>
                        );
                      }
                    })()}
                  </div>

                  {/* Status Advancement Controls */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase block mb-2">
                      Delivery Action Steps
                    </span>
                    <div className="flex flex-col gap-2">
                      {isPickUpPhase && (
                        <button
                          onClick={() => {
                            updateOrderStatusByAdmin(ord.id, 'picked_up');
                            handleOpenMap(ord, 'customer');
                          }}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-2xl font-black text-xs shadow-md flex items-center justify-center gap-2"
                        >
                          <Building className="w-4 h-4" />
                          Arrived at Store & Collected Items → Start Leg 2 Map
                        </button>
                      )}
                      {(ord.status === 'picked_up' || ord.status === 'out_for_delivery') && (
                        <button
                          onClick={() => setSelectedOrderForOtp(ord)}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3.5 rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                        >
                          <KeyRound className="w-4 h-4" />
                          🔑 Enter Customer OTP & Complete Delivery
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Delivery History */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
            <h4 className="text-sm font-black uppercase text-gray-700 dark:text-gray-300">
              Completed Trip History ({myCompletedOrders.length})
            </h4>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-xl">
              Total Earned: ₹{totalEarnings}
            </span>
          </div>

          {myCompletedOrders.length === 0 ? (
            <div className="py-8 text-center space-y-1">
              <p className="text-xs text-gray-500 font-bold">No completed orders yet</p>
              <p className="text-[11px] text-gray-400">Accept and deliver customer orders to earn ₹40 per trip!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myCompletedOrders.map(ord => (
                <div
                  key={ord.id}
                  className="p-3 bg-gray-50 dark:bg-gray-800/80 rounded-2xl flex items-center justify-between text-xs border border-gray-100 dark:border-gray-800"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-orange-600 dark:text-orange-400">#{ord.id}</span>
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-md">
                        Delivered
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                      {typeof ord.deliveryLocation === 'string'
                        ? ord.deliveryLocation
                        : ord.address?.addressLine || 'Saphale (401102)'}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {ord.createdAt ? new Date(ord.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Delivered'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm block">
                      +₹{ord.deliveryFee || 40}
                    </span>
                    <p className="text-[10px] text-gray-400">Order: ₹{ord.total}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interactive Dual-Leg GPS Route Navigation Map Modal */}
      <DeliveryRouteMapModal
        order={selectedMapOrder}
        onClose={() => setSelectedMapOrder(null)}
        defaultLeg={mapDefaultLeg}
      />

      {/* Doorstep OTP Delivery Verification Modal */}
      <DeliveryOtpModal
        isOpen={!!selectedOrderForOtp}
        onClose={() => setSelectedOrderForOtp(null)}
        order={selectedOrderForOtp}
        onSuccess={() => {
          setSelectedOrderForOtp(null);
          setActiveTab('history');
        }}
      />

      {/* Secure In-App VoIP Call Modal */}
      {secureCallTarget && (
        <SecureCallModal
          isOpen={!!secureCallTarget}
          onClose={() => setSecureCallTarget(null)}
          recipientName={secureCallTarget.recipientName}
          recipientRole={secureCallTarget.recipientRole}
          rawPhoneNumber={secureCallTarget.rawPhoneNumber}
          orderId={secureCallTarget.orderId}
        />
      )}
    </div>
  );
};
