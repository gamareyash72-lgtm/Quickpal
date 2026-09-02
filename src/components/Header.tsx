import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AddAddressModal } from './AddAddressModal';
import { AddressManagementModal } from './AddressManagementModal';
import { EmailSupportModal } from './EmailSupportModal';
import { QuickPalEmblem } from './QuickPalLogo';
import { DEFAULT_WHATSAPP_SUPPORT_URL, DEFAULT_INSTAGRAM_URL } from '../utils/phonePrivacy';
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
  Sparkles,
  MessageCircle,
  Instagram,
  Mail
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
    setSelectedCategoryId,
    paymentSettings
  } = useApp();

  const whatsappUrl = paymentSettings?.whatsappSupportUrl || DEFAULT_WHATSAPP_SUPPORT_URL;
  const instagramUrl = paymentSettings?.instagramUrl || DEFAULT_INSTAGRAM_URL;

  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showAddressManagementModal, setShowAddressManagementModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const addressContainerRef = useRef<HTMLDivElement>(null);

  const searchPlaceholders = [
    'Search "milk"',
    'Search "bread"',
    'Search "modak"',
    'Search "chips"',
    'Search "candies"',
    'Search "curd"',
    'Search "cold drinks"',
    'Search "butter"',
    'Search "eggs"',
    'Search "chupa chups"'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % searchPlaceholders.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [searchPlaceholders.length]);

  const isCurrentPincodeValid = isPincodeApproved(selectedAddress.pincode);

  // Close search dropdown & address dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (addressContainerRef.current && !addressContainerRef.current.contains(event.target as Node)) {
        setShowAddressDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products for instant dropdown results
  const matchingProducts = searchQuery.trim()
    ? products.filter(p => {
        if (!p || p.isHidden) return false;
        const q = searchQuery.toLowerCase().trim();
        const prodName = p.name ? p.name.toLowerCase() : '';
        const prodDesc = p.description ? p.description.toLowerCase() : '';
        const prodCat = p.category ? p.category.toLowerCase() : '';
        const catObj = categories.find(c => c.id === p.category);
        const catName = catObj ? catObj.name.toLowerCase() : '';
        const prodWeight = p.weightUnit ? p.weightUnit.toLowerCase() : '';
        return (
          prodName.includes(q) ||
          prodDesc.includes(q) ||
          prodCat.includes(q) ||
          catName.includes(q) ||
          prodWeight.includes(q)
        );
      }).slice(0, 6)
    : [];

  const matchingCategories = searchQuery.trim()
    ? categories.filter(c => c && c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    : [];

  const unreadNotifs = notifications.filter(
    n => !n.read && (n.targetRole === currentRole || n.targetRole === 'all')
  ).length;

  return (
    <>
      {/* Subtle Ganapati Chaturthi Festive Top Accent Line */}
      <div className="w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shrink-0 shadow-xs" />

      <header className="bg-gradient-to-r from-amber-900 via-orange-900 to-amber-950 dark:from-amber-950 dark:via-stone-950 dark:to-amber-950 text-white px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md shrink-0 border-b border-amber-500/20 transition-colors relative">
        {/* Subtle Non-Intrusive Floral Garland Motif in Background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none overflow-hidden rounded-none" />

        <div className="flex items-center justify-between w-full md:w-auto gap-3 sm:gap-5 relative z-10">
          {/* QuickPal Branding Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategoryId(null);
            }}
          >
            {/* Official QuickPal Orange Badge Emblem */}
            <div className="w-10 h-10 rounded-2xl bg-[#FF6A00] flex items-center justify-center shadow-md shrink-0 border border-amber-300/40 p-1 group-hover:scale-105 transition-transform">
              <span className="font-black text-base text-white tracking-tighter leading-none flex items-center select-none">
                <span className="text-[#1A1A1A]">q</span>
                <span className="text-white">p</span>
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-200 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                  <span>🌸</span>
                  <span>Ganesh Utsav</span>
                </span>
                <span className="text-[9px] font-serif text-amber-100/90 hidden lg:inline tracking-tight font-medium">
                  • Saphale 401102
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-baseline leading-none text-white drop-shadow-sm">
                <span className="text-[#1A1A1A] bg-amber-100/90 px-1.5 py-0.5 rounded-l-lg">quick</span>
                <span className="text-white bg-[#FF6A00] px-1.5 py-0.5 rounded-r-lg">pal</span>
                <div className="ml-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse self-center"></div>
              </h1>
            </div>
          </div>

          {/* Blinkit Style 2-Tier Location & ETA Selector */}
          <div ref={addressContainerRef} className="relative z-40">
            <button
              type="button"
              onClick={() => setShowAddressManagementModal(true)}
              className="bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/40 border border-white/25 rounded-2xl px-3 py-1.5 flex items-center gap-2 cursor-pointer transition-all shadow-xs text-left group"
              title="Click to change or edit delivery address"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute top-2 left-2 opacity-75 pointer-events-none" />
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] sm:text-xs font-black text-white tracking-tight leading-tight flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                    Delivery in 30 minutes
                  </span>
                </div>
                <p className="text-[10px] text-amber-200/95 font-extrabold truncate max-w-[140px] sm:max-w-[180px] flex items-center gap-0.5 leading-tight mt-0.5 group-hover:text-white transition-colors">
                  <span className="truncate">{selectedAddress.pincode}, {selectedAddress.area}</span>
                  <ChevronDown className="w-3 h-3 text-amber-200 group-hover:text-white shrink-0" />
                </p>
              </div>
            </button>
          </div>
        </div>

      <AddressManagementModal
        isOpen={showAddressManagementModal}
        onClose={() => setShowAddressManagementModal(false)}
      />

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
            placeholder={searchPlaceholders[placeholderIndex]}
            className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl py-3 pl-11 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-xs border border-orange-300/40 placeholder-gray-400 font-medium transition-all"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchFocused(false);
              }}
              className="absolute right-3.5 top-3 p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 transition-colors"
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

        {/* WhatsApp Support Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-white bg-emerald-500/30 hover:bg-emerald-500/50 rounded-xl transition-all border border-emerald-400/40 flex items-center gap-1.5 shadow-2xs hover:scale-105"
          title="WhatsApp Support & Community"
          aria-label="WhatsApp Support"
        >
          <MessageCircle className="w-4 h-4 text-emerald-300" />
          <span className="text-[11px] font-black text-emerald-200 hidden xl:inline">WhatsApp</span>
        </a>

        {/* Instagram Profile */}
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-white bg-pink-500/20 hover:bg-pink-500/40 rounded-xl transition-all border border-pink-400/30 flex items-center gap-1.5 shadow-2xs hover:scale-105"
          title="Follow QuickPal on Instagram (@quickpal.in)"
          aria-label="Instagram Handle"
        >
          <Instagram className="w-4 h-4 text-pink-300" />
          <span className="text-[11px] font-black text-pink-200 hidden 2xl:inline">@quickpal.in</span>
        </a>

        {/* Email Support Button */}
        <button
          onClick={() => setShowEmailModal(true)}
          className="p-2 text-white bg-orange-500/30 hover:bg-orange-500/50 rounded-xl transition-all border border-orange-400/40 flex items-center gap-1.5 shadow-2xs hover:scale-105"
          title="Contact Email Support (quickpal.in@outlook.com)"
          aria-label="Email Support"
        >
          <Mail className="w-4 h-4 text-yellow-200" />
          <span className="text-[11px] font-black text-yellow-100 hidden 2xl:inline">Email</span>
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
          className="bg-white/10 hover:bg-white/20 text-white px-3 sm:px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 backdrop-blur-sm border border-white/20 transition-all shadow-xs"
        >
          <div className="w-6 h-6 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
            {currentUser ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
          </div>
          <span className="hidden sm:inline font-bold">
            {currentUser ? currentUser.name.split(' ')[0] : 'Login'}
          </span>
        </button>

        {/* Blinkit Iconic My Cart Button */}
        <button
          onClick={onOpenCart}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 sm:px-4 py-2 rounded-2xl font-black flex items-center gap-2.5 shadow-md border border-emerald-400/40 transition-all transform active:scale-95 shrink-0 group"
          title="Open Shopping Cart"
        >
          <div className="relative flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-300 text-amber-950 text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-emerald-700 font-black animate-pulse">
                {cartCount}
              </span>
            )}
          </div>
          <div className="flex flex-col text-left leading-none">
            {cartCount > 0 ? (
              <>
                <span className="text-[10px] uppercase font-black text-emerald-100 tracking-tight">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
                <span className="text-xs sm:text-sm font-black text-white mt-0.5">
                  ₹{cartSubtotal}
                </span>
              </>
            ) : (
              <span className="text-xs sm:text-sm font-black text-white">
                My Cart
              </span>
            )}
          </div>
        </button>
      </div>
    </header>

    {/* Email Support Modal */}
    <EmailSupportModal
      isOpen={showEmailModal}
      onClose={() => setShowEmailModal(false)}
    />
    </>
  );
};
