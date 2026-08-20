import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Order } from '../types';
import { ProductDetailModal } from './ProductDetailModal';
import { AddAddressModal } from './AddAddressModal';
import ganpatiBappaImg from '../assets/images/ganpati_bappa_statue_1786946303732.jpg';
import {
  Zap,
  Plus,
  Minus,
  Heart,
  ShoppingBag,
  Star,
  Clock,
  ArrowRight,
  Sparkles,
  Check,
  X,
  Eye,
  Images,
  MapPin,
  AlertTriangle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Layers
} from 'lucide-react';

interface CustomerDashboardProps {
  onOpenCart: () => void;
  onOpenCheckout: () => void;
  onTrackOrder: (orderId: string) => void;
  onOpenAiAssistant?: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onOpenCart,
  onOpenCheckout,
  onTrackOrder,
  onOpenAiAssistant,
}) => {
  const {
    products,
    categories,
    banners,
    selectedCategoryId,
    setSelectedCategoryId,
    searchQuery,
    setSearchQuery,
    cartItems,
    addToCart,
    updateQuantity,
    wishlistProductIds,
    toggleWishlist,
    orders,
    cartCount,
    cartSubtotal,
    selectedAddress,
    addresses,
    setSelectedAddress,
    deleteAddress,
    isPincodeApproved,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'under10' | 'deals'>('all');
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<{ id: string; label: string; addressLine: string } | null>(null);
  const [dismissedOrderId, setDismissedOrderId] = useState<string | null>(null);

  const topCategoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollTopCategories = (direction: 'left' | 'right') => {
    if (topCategoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      topCategoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Compute non-hidden product count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      if (p && !p.isHidden) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const totalAvailableProducts = useMemo(() => {
    return products.filter(p => p && !p.isHidden).length;
  }, [products]);

  // Active trackable order for floating widget (strictly scoped to the currently logged in customer or locally placed order)
  const isMyCustomerOrder = (order: Order) => {
    if (currentUser) {
      if (order.customerId === currentUser.id) return true;
      if (currentUser.phone && order.customerPhone === currentUser.phone) return true;
      if (currentUser.name && order.customerName.toLowerCase() === currentUser.name.toLowerCase()) return true;
    }
    try {
      const mySavedOrderIds: string[] = JSON.parse(localStorage.getItem('qp_my_placed_order_ids') || '[]');
      return mySavedOrderIds.includes(order.id);
    } catch {
      return false;
    }
  };

  const activeOrder = orders.find(
    o => o.status !== 'delivered' && o.status !== 'cancelled' && isMyCustomerOrder(o) && dismissedOrderId !== o.id
  );

  // Filter products by search, category, and tab
  const filteredProducts = products.filter(prod => {
    if (prod.isHidden) return false;

    // Search query filter (searches across entire store)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const catObj = categories.find(c => c.id === prod.category);
      const catName = catObj ? catObj.name.toLowerCase() : '';
      
      const matchName = prod.name.toLowerCase().includes(query);
      const matchCat = prod.category.toLowerCase().includes(query) || catName.includes(query);
      const matchDesc = prod.description.toLowerCase().includes(query);
      const matchWeight = prod.weightUnit ? prod.weightUnit.toLowerCase().includes(query) : false;

      if (!matchName && !matchCat && !matchDesc && !matchWeight) return false;
    } else {
      // Only apply category filter when NO search query is active
      if (selectedCategoryId && prod.category !== selectedCategoryId) {
        return false;
      }

      // Only apply tab filter when NO search query is active
      if (activeTab === 'featured' && !prod.isFeatured) return false;
      if (activeTab === 'under10' && prod.deliveryTimeMins > 30) return false;
      if (activeTab === 'deals' && prod.price >= prod.originalPrice) return false;
    }

    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 space-y-6 pb-28">
      {/* Delivery Address & Service Territory Control Banner */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/80 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 shadow-sm">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-gray-900 dark:text-gray-100">
                  Delivering To: {selectedAddress.label}
                </span>
                {isPincodeApproved(selectedAddress.pincode) ? (
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                    ✓ Serviceable Area (30 Mins)
                  </span>
                ) : (
                  <span className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                    ✕ Unserviceable PIN ({selectedAddress.pincode})
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {selectedAddress.addressLine}, {selectedAddress.area} ({selectedAddress.pincode})
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddAddressModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-1.5 transition-transform active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Delivery Address
          </button>
        </div>

        {/* Saved Addresses Quick Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[10px] uppercase font-black text-gray-400 shrink-0">Saved Locations:</span>
          {addresses.map(addr => (
            <div
              key={addr.id}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 flex items-center gap-1.5 group ${
                selectedAddress.id === addr.id
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedAddress(addr)}
                className="flex items-center gap-1.5 focus:outline-none"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{addr.label}</span>
                <span className="opacity-75 font-normal text-[10px]">({addr.pincode})</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAddressToDelete({ id: addr.id, label: addr.label, addressLine: addr.addressLine });
                }}
                className={`p-0.5 rounded-full hover:bg-black/20 transition-colors ml-0.5 ${
                  selectedAddress.id === addr.id ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-rose-600'
                }`}
                title={`Delete ${addr.label} address`}
                aria-label={`Delete ${addr.label} address`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setShowAddAddressModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border border-dashed border-orange-400 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors shrink-0 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            New Address
          </button>
        </div>
      </div>

      {/* Horizontal Pill-Shaped Category Filter Buttons at Top */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-3 sm:p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-orange-500" />
              Quick Category Filter
            </span>
            {selectedCategoryId ? (
              <span className="bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
                <span>Filter: <strong>{categories.find(c => c.id === selectedCategoryId)?.name || 'Category'}</strong></span>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(null)}
                  className="hover:text-rose-600 p-0.5 rounded-full hover:bg-orange-200 dark:hover:bg-orange-900 transition-colors"
                  title="Clear category filter"
                  aria-label="Clear category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-bold hidden sm:inline-block">
                • Tap any category to filter
              </span>
            )}
          </div>

          {/* Scroll Controls for Desktop */}
          <div className="flex items-center gap-1">
            {selectedCategoryId && (
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline mr-2 hidden sm:inline-flex items-center gap-1"
              >
                Show All <X className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => scrollTopCategories('left')}
              className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950 hover:border-orange-300 transition-colors"
              aria-label="Scroll categories left"
              title="Scroll left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollTopCategories('right')}
              className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950 hover:border-orange-300 transition-colors"
              aria-label="Scroll categories right"
              title="Scroll right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pill-Shaped Buttons Container */}
        <div
          ref={topCategoryScrollRef}
          className="flex items-center gap-2 overflow-x-auto py-1 scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* All Items Pill */}
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-2 border whitespace-nowrap shadow-xs ${
              !selectedCategoryId
                ? 'bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/20 font-black scale-[1.02]'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-950/50 hover:border-orange-300'
            }`}
          >
            <span className="text-sm">✨</span>
            <span>All Products</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                !selectedCategoryId
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {totalAvailableProducts}
            </span>
          </button>

          {/* Category Pill Buttons */}
          {categories.map(cat => {
            const isSelected = selectedCategoryId === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(isSelected ? null : cat.id)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-2 border whitespace-nowrap shadow-xs ${
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/20 font-black scale-[1.02]'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-950/50 hover:border-orange-300'
                }`}
              >
                <span className="text-sm shrink-0">{cat.iconEmoji || '📦'}</span>
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Saphale 401102 Service Area Warning if selected pin invalid */}
      {!isPincodeApproved(selectedAddress.pincode) && (
        <div className="bg-rose-500 text-white p-4 rounded-2xl shadow-md border-2 border-rose-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-xl font-bold">
              🚫
            </div>
            <div>
              <h4 className="font-black text-sm">Service Unavailable for PIN Code {selectedAddress.pincode}</h4>
              <p className="text-xs text-rose-100 font-medium">
                QuickPal grocery delivery is currently operating <strong>ONLY in Saphale East & West (PIN Code 401102)</strong>, Palghar District. Please add or select an address in PIN 401102.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddAddressModal(true)}
            className="bg-white text-rose-950 hover:bg-rose-100 px-3 py-1.5 rounded-xl text-xs font-black shrink-0 whitespace-nowrap shadow-sm"
          >
            + Add Saphale Address
          </button>
        </div>
      )}

      {/* Hero Banners Section with Happy Ganesh Chaturthi Theme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Banner - Happy Ganesh Chaturthi with Ganpati Bappa Statue */}
        <div className="md:col-span-2 bg-gradient-to-r from-amber-950 via-orange-900 to-amber-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between shadow-xl border border-amber-500/30 gap-6">
          <div className="z-10 max-w-md">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="bg-amber-500 text-amber-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs border border-yellow-300/60 flex items-center gap-1">
                <span>🌺</span>
                <span>गणेशोत्सव विशेष २०२६</span>
              </span>
              <span className="text-amber-300 text-xs font-bold">
                श्री गणेशाय नमः
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-amber-100 leading-tight mb-2 tracking-tight drop-shadow-md">
              HAPPY GANESH<br />
              <span className="text-yellow-300">CHATURTHI! 🌺</span>
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 font-semibold mb-5">
              गणपती बाप्पा मोरया! Fresh Ukadiche Modak, 21 Durva Grass, Red Hibiscus & Pooja Samagri delivered in 10-15 mins in Saphale!
            </p>
            <button
              onClick={() => {
                setSelectedCategoryId('cat-ganesh-special');
                setActiveTab('all');
              }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-amber-950 px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-lg border border-yellow-300/60 transition-all flex items-center gap-2 transform active:scale-95"
            >
              <span>🥟 Order Bappa Prasad & Puja Kit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Ganpati Bappa Statue Image */}
          <div className="relative z-10 shrink-0 w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/50 group">
            <img
              src={ganpatiBappaImg}
              alt="Lord Ganesha - Ganpati Bappa Statue"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2">
              <span className="text-[11px] font-black text-yellow-300 drop-shadow-md">
                🙏 बाप्पा मोरया
              </span>
            </div>
          </div>

          {/* Ambient Glows */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Express Delivery Badge Card with Ganpati Festival Accent */}
        <div className="bg-amber-50 dark:bg-amber-950/40 rounded-3xl p-6 border-2 border-amber-300 dark:border-amber-800/80 flex flex-col justify-center items-center text-center shadow-sm relative overflow-hidden">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-600 text-white rounded-2xl flex items-center justify-center mb-3 shadow-md border border-amber-300/40 text-3xl">
            🪔
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-500" />
            <h3 className="font-black text-amber-950 dark:text-amber-100 text-lg">
              10 - 15 Mins Delivery
            </h3>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold mb-3">
            Fastest dark store delivery for your daily Aarti & Naivedya
          </p>
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-amber-50 text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
            🌺 Saphale West (401102)
          </div>
        </div>
      </div>

      {/* Shop by Category */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>Shop by Category</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h3>
          {selectedCategoryId && (
            <button
              onClick={() => setSelectedCategoryId(null)}
              className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
            >
              Show All Categories <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
          {categories.map(cat => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategoryId(isSelected ? null : cat.id)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div
                  className={`w-full aspect-square rounded-2xl p-2 shadow-sm border transition-all flex items-center justify-center overflow-hidden relative ${
                    isSelected
                      ? 'border-orange-500 bg-orange-100 dark:bg-orange-900 ring-2 ring-orange-500 scale-105'
                      : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 group-hover:border-orange-300 group-hover:bg-orange-50 dark:group-hover:bg-orange-950/50'
                  }`}
                >
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const fallback = parent.querySelector('.cat-emoji-fallback') as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }
                      }}
                      className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : null}
                  <div className={`cat-emoji-fallback ${cat.image ? 'hidden' : 'flex'} w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 dark:bg-gray-700 rounded-full items-center justify-center text-2xl sm:text-3xl shadow-inner`}>
                    {cat.iconEmoji}
                  </div>
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-bold text-center line-clamp-1 ${
                    isSelected ? 'text-orange-700 dark:text-orange-400 font-black' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Section Header & Filter Tabs */}
      <div className="pt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                {searchQuery.trim()
                  ? `Search Results for "${searchQuery}"`
                  : selectedCategoryId
                  ? categories.find(c => c.id === selectedCategoryId)?.name
                  : 'Fresh Picks For You'}
              </h3>
              {searchQuery.trim() && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-950 dark:text-orange-300 text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 transition-colors"
                >
                  Clear Search <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Showing {filteredProducts.length} items with real product photos
            </p>
          </div>

          <div className="flex bg-gray-200/80 dark:bg-gray-800 p-1 rounded-xl gap-1">
            {(
              [
                { id: 'all', label: 'All Items' },
                { id: 'featured', label: '★ Featured' },
                { id: 'under10', label: '⚡ Within 30 Mins' },
                { id: 'deals', label: '🏷️ Best Deals' },
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-orange-800 dark:text-orange-300 shadow-sm font-extrabold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 text-center border border-gray-100 dark:border-gray-800 space-y-3">
            <div className="text-4xl">🥦</div>
            <h4 className="text-sm font-black text-gray-700 dark:text-gray-300">
              No products found matching your search.
            </h4>
            <button
              onClick={() => {
                setSelectedCategoryId(null);
                setActiveTab('all');
              }}
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {filteredProducts.map(prod => {
              const cartItem = cartItems?.find(item => item?.product?.id === prod.id);
              const isWishlisted = wishlistProductIds?.includes(prod.id);
              const mainImgUrl = prod.image || (prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
              const hasMultipleImages = Array.isArray(prod.images) && prod.images.length > 1;
              const priceVal = Number(prod.price) || 0;
              const origPriceVal = Number(prod.originalPrice) || priceVal;
              const deliveryMins = Number(prod.deliveryTimeMins) || 10;
              const ratingVal = Number(prod.rating) || 5.0;

              return (
                <div
                  key={prod.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-3 border border-gray-100 dark:border-gray-800 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all relative group cursor-pointer"
                  onClick={() => setSelectedDetailProduct(prod)}
                >
                  {/* Wishlist Heart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(prod.id);
                    }}
                    className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-rose-500 transition-colors shadow-sm"
                    title="Add to Wishlist"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isWishlisted ? 'text-rose-500 fill-rose-500' : ''
                      }`}
                    />
                  </button>

                  {/* Thumbnail Frame (Actual Product Photograph) */}
                  <div className="h-32 bg-gray-50 dark:bg-gray-800/60 rounded-xl flex items-center justify-center relative overflow-hidden p-2 group-hover:bg-orange-50/30 transition-colors">
                    <img
                      src={mainImgUrl}
                      alt={prod.name || 'Product'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Multi-image indicator badge */}
                    {hasMultipleImages && (
                      <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 opacity-90">
                        <Images className="w-2.5 h-2.5" />
                        {prod.images?.length} Photos
                      </span>
                    )}

                    {prod.isOutOfStock && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-white bg-rose-600 px-2 py-0.5 rounded">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ETA pill */}
                  <div className="flex items-center justify-between">
                    <span className="bg-orange-50 dark:bg-orange-950/60 w-fit px-2 py-0.5 rounded text-[10px] font-bold text-orange-700 dark:text-orange-300 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-orange-600" />
                      {deliveryMins} MINS
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5 font-bold">
                      <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                      {ratingVal}
                    </span>
                  </div>

                  {/* Title & Weight */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                      {prod.name || 'Grocery Item'}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {prod.weightUnit || '1 unit'}
                    </span>
                  </div>

                  {/* Price & Action */}
                  <div
                    className="mt-auto pt-2 flex items-center justify-between border-t border-gray-50 dark:border-gray-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-900 dark:text-gray-100">
                        ₹{priceVal}
                      </span>
                      {origPriceVal > priceVal && (
                        <span className="text-[10px] text-gray-400 line-through leading-none">
                          ₹{origPriceVal}
                        </span>
                      )}
                    </div>

                    {cartItem ? (
                      <div className="flex items-center bg-orange-500 text-white rounded-lg border border-orange-600 shadow-sm">
                        <button
                          onClick={() => updateQuantity(prod.id, (cartItem.quantity || 1) - 1)}
                          className="px-2 py-1 hover:bg-orange-600 rounded-l-lg"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-black">
                          {cartItem.quantity || 1}
                        </span>
                        <button
                          onClick={() => updateQuantity(prod.id, (cartItem.quantity || 0) + 1)}
                          className="px-2 py-1 hover:bg-orange-600 rounded-r-lg"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(prod)}
                        disabled={prod.isOutOfStock}
                        className={`font-black px-3.5 py-1 rounded-lg text-xs transition-all ${
                          prod.isOutOfStock
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 shadow-sm'
                        }`}
                      >
                        ADD
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedDetailProduct && (
        <ProductDetailModal
          product={selectedDetailProduct}
          onClose={() => setSelectedDetailProduct(null)}
        />
      )}

      {/* Floating AI Support Launcher Button */}
      {onOpenAiAssistant && (
        <button
          onClick={onOpenAiAssistant}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full p-3.5 shadow-2xl border-2 border-yellow-300 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 group"
          title="Ask QuickPal AI Support Assistant"
        >
          <div className="w-8 h-8 rounded-full bg-orange-950 text-yellow-300 flex items-center justify-center font-black text-base shadow-inner">
            🤖
          </div>
          <span className="text-xs font-black tracking-tight pr-1 hidden sm:inline">
            AI Assistant
          </span>
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border-2 border-white animate-pulse">
            24/7
          </span>
        </button>
      )}

      {/* Floating Active Order Widget (Live Order Tracking - Scoped & Non-Blinking) */}
      {activeOrder && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-gray-900/95 dark:bg-gray-900/95 backdrop-blur-md text-white rounded-2xl px-4 py-3 shadow-2xl border-2 border-orange-500/80 flex items-center gap-3 max-w-md w-[92vw] transition-all">
          <div className="relative flex items-center justify-center shrink-0">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-400 absolute animate-ping opacity-75"></span>
          </div>

          <div
            className="flex-1 text-left cursor-pointer min-w-0"
            onClick={() => onTrackOrder(activeOrder.id)}
          >
            <p className="text-xs font-black text-amber-300 truncate">
              Order #{activeOrder.id} arriving in {activeOrder.deliveryTimeMins} mins!
            </p>
            <p className="text-[10px] text-gray-300 font-semibold capitalize truncate">
              Status: <span className="text-emerald-400 font-bold">{activeOrder.status.replace('_', ' ')}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onTrackOrder(activeOrder.id)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1"
            >
              Track Live ➔
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDismissedOrderId(activeOrder.id);
              }}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Dismiss tracking pill"
              aria-label="Dismiss tracking pill"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Delivery Address Modal */}
      <AddAddressModal
        isOpen={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
      />

      {/* Delete Address Confirmation Modal */}
      {addressToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs font-bold border border-rose-200 dark:border-rose-900/50 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100">
                Remove Saved Address?
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold leading-relaxed">
              Are you sure you want to remove <span className="text-orange-600 dark:text-orange-400 font-black">'{addressToDelete.label}'</span> ({addressToDelete.addressLine}) from your saved delivery locations?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddressToDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAddress(addressToDelete.id);
                  setAddressToDelete(null);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black px-4 py-2 rounded-xl shadow-md flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
