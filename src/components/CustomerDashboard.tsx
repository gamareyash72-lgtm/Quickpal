import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { ProductDetailModal } from './ProductDetailModal';
import { AddAddressModal } from './AddAddressModal';
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
  AlertTriangle
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
    isPincodeApproved
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'under10' | 'deals'>('all');
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);

  // Active trackable order for floating widget
  const activeOrder = orders.find(
    o => o.status !== 'delivered' && o.status !== 'cancelled'
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
            <button
              key={addr.id}
              onClick={() => setSelectedAddress(addr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 flex items-center gap-1.5 ${
                selectedAddress.id === addr.id
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{addr.label}</span>
              <span className="opacity-75 font-normal text-[10px]">({addr.pincode})</span>
            </button>
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

      {/* Hero Banners Section with Tiranga Theme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Banner - Saffron, White, Navy Blue & India Green Tiranga Banner */}
        <div className="md:col-span-2 bg-gradient-to-r from-orange-600 via-slate-900 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden flex items-center shadow-xl border border-white/20">
          <div className="z-10 max-w-md">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-xs">
                Saffron
              </span>
              <span className="bg-white text-blue-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-xs">
                White
              </span>
              <span className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-xs">
                Green
              </span>
              <span className="text-blue-300 text-[10px] font-bold ml-1">
                🇮🇳 Tiranga Express
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-2 tracking-tight drop-shadow-md">
              FRESH GROCERY &<br />DAILY ESSENTIALS
            </h2>
            <p className="text-xs sm:text-sm text-slate-100 font-bold mb-5">
              Saphale (401102) Express Delivery in 30 Mins with Best Tiranga Offers!
            </p>
            <button
              onClick={() => setActiveTab('deals')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-lg border border-orange-300/40 transition-all flex items-center gap-2 transform active:scale-95"
            >
              Shop Express Offers <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none">
            <div className="w-64 h-64 bg-white rounded-full border-8 border-blue-900"></div>
          </div>
        </div>

        {/* Fastest Delivery Badge Card with Tiranga Accent */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl p-6 border-2 border-emerald-300 dark:border-emerald-800 flex flex-col justify-center items-center text-center shadow-sm">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-orange-500 text-white rounded-2xl flex items-center justify-center mb-3 shadow-md">
            <Clock className="w-9 h-9" />
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
            <h3 className="font-black text-orange-950 dark:text-orange-100 text-lg">
              Within 30 Minutes
            </h3>
          </div>
          <p className="text-xs text-orange-700 dark:text-orange-300 font-semibold mb-3">
            Ultra-fast dark store fulfillment nearby
          </p>
          <div className="bg-orange-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            100% On Time Guarantee
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
              const cartItem = cartItems.find(item => item.product.id === prod.id);
              const isWishlisted = wishlistProductIds.includes(prod.id);
              const mainImgUrl = prod.image || (prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
              const hasMultipleImages = prod.images && prod.images.length > 1;

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
                      alt={prod.name}
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
                      {prod.deliveryTimeMins} MINS
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5 font-bold">
                      <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                      {prod.rating}
                    </span>
                  </div>

                  {/* Title & Weight */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                      {prod.name}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {prod.weightUnit}
                    </span>
                  </div>

                  {/* Price & Action */}
                  <div
                    className="mt-auto pt-2 flex items-center justify-between border-t border-gray-50 dark:border-gray-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-900 dark:text-gray-100">
                        ₹{prod.price}
                      </span>
                      {prod.originalPrice > prod.price && (
                        <span className="text-[10px] text-gray-400 line-through leading-none">
                          ₹{prod.originalPrice}
                        </span>
                      )}
                    </div>

                    {cartItem ? (
                      <div className="flex items-center bg-orange-500 text-white rounded-lg border border-orange-600 shadow-sm">
                        <button
                          onClick={() => updateQuantity(prod.id, cartItem.quantity - 1)}
                          className="px-2 py-1 hover:bg-orange-600 rounded-l-lg"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-black">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(prod.id, cartItem.quantity + 1)}
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

      {/* Floating Active Order Widget (Live Order Tracking) */}
      {activeOrder && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-orange-950 text-white rounded-2xl px-4 py-2.5 shadow-2xl border border-orange-500/50 flex items-center gap-3 animate-pulse cursor-pointer max-w-md w-[92vw]">
          <div className="w-3 h-3 rounded-full bg-yellow-400 shrink-0"></div>
          <div
            className="flex-1 text-left"
            onClick={() => onTrackOrder(activeOrder.id)}
          >
            <p className="text-xs font-extrabold italic text-yellow-300">
              Order #{activeOrder.id} arriving in {activeOrder.deliveryTimeMins} mins!
            </p>
            <p className="text-[10px] text-orange-200 capitalize">
              Status: {activeOrder.status.replace('_', ' ')}
            </p>
          </div>
          <button
            onClick={() => onTrackOrder(activeOrder.id)}
            className="bg-yellow-400 hover:bg-yellow-500 text-orange-950 font-black text-xs px-3 py-1.5 rounded-xl shadow shrink-0"
          >
            Track Live ➔
          </button>
        </div>
      )}

      {/* Add Delivery Address Modal */}
      <AddAddressModal
        isOpen={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
      />
    </div>
  );
};
