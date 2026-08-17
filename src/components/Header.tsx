import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AddAddressModal } from './AddAddressModal';
import {
  Search,
  MapPin,
  ShoppingBag,
  Heart,
  Bell,
  User,
  X,
  ChevronDown,
  Check,
  Zap,
  Bot,
  HelpCircle,
  Plus,
  ShoppingBasket,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onOpenAuth: () => void;
  onOpenAiAssistant?: () => void;
  onOpenFaqDashboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenNotifications,
  onOpenWishlist,
  onOpenOrders,
  onOpenAuth,
  onOpenAiAssistant,
  onOpenFaqDashboard,
}) => {
  const {
    cartCount,
    cartSubtotal,
    wishlistProductIds,
    searchQuery,
    setSearchQuery,
    selectedAddress,
    addresses,
    setSelectedAddress,
    notifications,
    currentRole,
    currentUser,
    isPincodeApproved,
    products,
    categories,
    addToCart,
    selectedCategoryId,
    setSelectedCategoryId
  } = useApp();

  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const isCurrentPincodeValid = isPincodeApproved(selectedAddress.pincode);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products for instant dropdown results
  const matchingProducts = searchQuery.trim()
    ? products.filter(p => {
        if (p.isHidden) return false;
        const q = searchQuery.toLowerCase().trim();
        const catObj = categories.find(c => c.id === p.category);
        const catName = catObj ? catObj.name.toLowerCase() : '';
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          catName.includes(q) ||
          (p.weightUnit && p.weightUnit.toLowerCase().includes(q))
        );
      }).slice(0, 6)
    : [];

  const matchingCategories = searchQuery.trim()
    ? categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    : [];

  const unreadNotifs = notifications.filter(
    n => !n.read && (n.targetRole === currentRole || n.targetRole === 'all')
  ).length;

  return (
    <>
      {/* Subtle Ganapati Chaturthi Festive Top Accent Line */}
      <div className="w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shrink-0 shadow-xs" />

      <header className="bg-gradient-to-r from-amber-900 via-orange-900 to-amber-950 dark:from-amber-950 dark:via-stone-950 dark:to-amber-950 text-white px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md shrink-0 border-b border-amber-500/20 transition-colors relative overflow-hidden">
        {/* Subtle Non-Intrusive Floral Garland Motif in Background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="flex items-center justify-between w-full md:w-auto gap-4 relative z-10">
          {/* QuickPal Branding Logo with Subtle Festive Floral Touch */}
          <div className="flex items-center gap-2.5">
            {/* Elegant Diya / Lotus Icon Container */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-amber-50 flex items-center justify-center shadow-md shrink-0 border border-amber-300/40">
              <span className="text-base select-none" title="गणेशोत्सव विशेष">🌺</span>
            </div>

            <div className="flex flex-col cursor-pointer select-none" onClick={() => setSearchQuery('')}>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-200 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                  <span>🌸</span>
                  <span>Ganesh Utsav</span>
                </span>
                <span className="text-[9px] font-bold text-amber-100/90 hidden sm:inline">
                  • 10-Min Delivery
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black italic tracking-tight flex items-center text-white drop-shadow-sm">
                Quick<span className="text-amber-400">Pal</span>
                <div className="ml-1.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
              </h1>
            </div>
          </div>

        {/* Address & ETA Selector */}
        <div className="relative">
          <div
            onClick={() => setShowAddressDropdown(!showAddressDropdown)}
            className={`rounded-xl px-3 py-1.5 border flex items-center gap-2 cursor-pointer transition-all shadow-inner ${
              isCurrentPincodeValid
                ? 'bg-orange-700/60 dark:bg-orange-950/70 hover:bg-orange-700/80 border-orange-300/40'
                : 'bg-rose-900/80 dark:bg-rose-950/90 hover:bg-rose-900/90 border-rose-300'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
              isCurrentPincodeValid ? 'bg-yellow-300' : 'bg-rose-400'
            }`}>
              <Zap className="w-4 h-4 text-orange-950 fill-orange-950" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[10px] text-orange-100 font-bold uppercase tracking-wider flex items-center gap-1">
                <span>📍 Saphale (401102)</span>
                <span className={`px-1.5 rounded text-[9px] font-black ${
                  isCurrentPincodeValid ? 'bg-yellow-300 text-orange-950' : 'bg-rose-200 text-rose-950'
                }`}>
                  {isCurrentPincodeValid ? '30 MINS' : 'UNAVAILABLE'}
                </span>
              </div>
              <p className="text-xs text-white font-extrabold truncate max-w-[170px] flex items-center gap-1">
                {selectedAddress.label}: {selectedAddress.area} ({selectedAddress.pincode})
                <ChevronDown className="w-3.5 h-3.5 text-yellow-200" />
              </p>
            </div>
          </div>

          {/* Address Dropdown */}
          {showAddressDropdown && (
            <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-xs font-black uppercase text-orange-600 dark:text-orange-400">
                  Select Delivery Location
                </span>
                <button
                  onClick={() => setShowAddressDropdown(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {addresses.map(addr => (
                  <div
                    key={addr.id}
                    onClick={() => {
                      setSelectedAddress(addr);
                      setShowAddressDropdown(false);
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                      selectedAddress.id === addr.id
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                        : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{addr.label}</span>
                        {selectedAddress.id === addr.id && (
                          <Check className="w-3.5 h-3.5 text-orange-600 font-bold" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                        {addr.addressLine}, {addr.area} ({addr.pincode})
                      </p>
                      <div className="mt-1">
                        {isPincodeApproved(addr.pincode) ? (
                          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                            ✓ Serviceable (Saphale 401102)
                          </span>
                        ) : (
                          <span className="text-[9px] font-extrabold text-rose-700 bg-rose-100 dark:bg-rose-950/80 dark:text-rose-300 px-1.5 py-0.5 rounded">
                            ✕ Service Not Available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2.5 mt-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowAddressDropdown(false);
                    setShowAddAddressModal(true);
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-2 px-3 rounded-xl shadow flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Delivery Address
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddAddressModal
        isOpen={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
      />

      {/* Global Search Bar with Live Instant Autocomplete Dropdown */}
      <div ref={searchContainerRef} className="w-full md:flex-1 max-w-xl mx-0 md:mx-4 relative z-30">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={e => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
              // Clear category filter so search queries search across ALL products in store!
              if (selectedCategoryId) {
                setSelectedCategoryId(null);
              }
            }}
            placeholder="Search 'milk', 'bread', 'chips', 'curd', or 'cold drinks'..."
            className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl py-2.5 pl-11 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm border border-orange-300/40 placeholder-gray-400 transition-all"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchFocused(false);
              }}
              className="absolute right-3 top-2.5 p-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchFocused && searchQuery.trim() !== '' && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50 max-h-[75vh] flex flex-col animate-in fade-in duration-150">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
              <span className="font-extrabold text-gray-500 uppercase tracking-wider">
                Instant Search Results
              </span>
              <span className="bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                {matchingProducts.length} items
              </span>
            </div>

            <div className="overflow-y-auto p-2 space-y-2">
              {/* Matching Categories Quick Filters */}
              {matchingCategories.length > 0 && (
                <div className="p-2 bg-orange-50/60 dark:bg-orange-950/20 rounded-xl space-y-1.5 border border-orange-100 dark:border-orange-900/40">
                  <span className="text-[10px] font-black uppercase text-orange-800 dark:text-orange-300 block">
                    Matching Categories
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchingCategories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategoryId(cat.id);
                          setSearchQuery('');
                          setIsSearchFocused(false);
                        }}
                        className="px-2.5 py-1 bg-white dark:bg-gray-800 hover:bg-orange-500 hover:text-white text-gray-800 dark:text-gray-200 rounded-lg text-xs font-bold border border-orange-200 dark:border-orange-800 flex items-center gap-1 transition-colors shadow-xs"
                      >
                        <span>{cat.iconEmoji}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Matches */}
              {matchingProducts.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400 space-y-2">
                  <p className="text-sm font-bold">No products found matching "{searchQuery}"</p>
                  <p className="text-xs text-gray-400">Try searching for milk, bread, chips, curd, soda or apples!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {matchingProducts.map(prod => (
                    <div
                      key={prod.id}
                      className="p-2 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/70 rounded-xl transition-colors group cursor-pointer"
                      onClick={() => {
                        setIsSearchFocused(false);
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 flex items-center justify-center p-1">
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-2xl">{prod.imageEmoji}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400">
                            {prod.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                            <span className="font-black text-gray-900 dark:text-gray-100">
                              ₹{prod.price}
                            </span>
                            {prod.originalPrice > prod.price && (
                              <span className="line-through text-gray-400 text-[10px]">
                                ₹{prod.originalPrice}
                              </span>
                            )}
                            {prod.weightUnit && (
                              <span className="text-gray-400 text-[10px]">
                                ({prod.weightUnit})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(prod, 1);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-sm shrink-0 flex items-center gap-1 transition-transform active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-2.5 bg-gray-100 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs">
              <span className="text-gray-500 font-semibold text-[11px]">
                Showing search results in main catalog
              </span>
              <button
                onClick={() => setIsSearchFocused(false)}
                className="text-orange-600 dark:text-orange-400 font-extrabold hover:underline"
              >
                Close Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-end gap-2.5 sm:gap-3.5 w-full md:w-auto">
        {/* FAQ Dashboard Button */}
        {onOpenFaqDashboard && (
          <button
            onClick={onOpenFaqDashboard}
            className="p-2 text-white hover:bg-orange-500 dark:hover:bg-orange-800 rounded-xl transition-colors flex items-center gap-1"
            title="FAQ Dashboard & Help"
          >
            <HelpCircle className="w-5 h-5 text-yellow-300" />
            <span className="text-xs font-bold hidden xl:inline">FAQs</span>
          </button>
        )}

        {/* AI Support Assistant Button */}
        {onOpenAiAssistant && (
          <button
            onClick={onOpenAiAssistant}
            className="bg-yellow-300 hover:bg-yellow-400 text-orange-950 font-black px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md border border-yellow-200 transition-all active:scale-95 shrink-0"
            title="Ask AI Assistant 24/7"
          >
            <Bot className="w-4 h-4 text-orange-950" />
            <span className="hidden sm:inline">AI Help</span>
          </button>
        )}

        {/* Wishlist */}
        <button
          onClick={onOpenWishlist}
          className="p-2 text-white hover:bg-orange-500 dark:hover:bg-orange-800 rounded-xl transition-colors relative"
          title="Wishlist"
        >
          <Heart className="w-5 h-5" />
          {wishlistProductIds.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-300 text-orange-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-orange-600">
              {wishlistProductIds.length}
            </span>
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="p-2 text-white hover:bg-orange-500 dark:hover:bg-orange-800 rounded-xl transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifs > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-orange-600 animate-pulse">
              {unreadNotifs}
            </span>
          )}
        </button>

        {/* Orders History */}
        <button
          onClick={onOpenOrders}
          className="p-2 text-white hover:bg-orange-500 dark:hover:bg-orange-800 rounded-xl transition-colors hidden sm:flex items-center gap-1.5"
          title="My Orders"
        >
          <User className="w-5 h-5" />
          <span className="text-xs font-bold hidden lg:inline">Orders</span>
        </button>

        {/* User Login & Profile Button */}
        <button
          onClick={onOpenAuth}
          className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 backdrop-blur-sm border border-white/30 transition-all shadow-sm"
        >
          <div className="w-6 h-6 rounded-lg bg-yellow-300 text-orange-950 flex items-center justify-center font-black text-[10px] shrink-0">
            {currentUser ? currentUser.name.charAt(0) : '🔑'}
          </div>
          <div className="text-left hidden lg:block">
            <span className="block text-[9px] uppercase text-yellow-200 leading-none">
              {currentUser ? currentUser.role : 'Guest'}
            </span>
            <span className="block font-extrabold max-w-[90px] truncate leading-tight">
              {currentUser ? currentUser.name : 'Sign In / Register'}
            </span>
          </div>
        </button>

        {/* Cart Button */}
        <button
          onClick={onOpenCart}
          className="bg-orange-900 dark:bg-orange-950 hover:bg-orange-950 text-white px-4 py-2 rounded-xl font-black flex items-center gap-2.5 shadow-lg border border-yellow-300/40 transition-all transform active:scale-95"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-yellow-300" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-300 text-orange-950 text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-orange-900 font-black">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-xs sm:text-sm tracking-tight text-white font-extrabold">
            ₹{cartSubtotal}
          </span>
        </button>
      </div>
    </header>
    </>
  );
};
