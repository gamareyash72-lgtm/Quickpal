import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AddAddressModal } from './AddAddressModal';
import { AddressManagementModal } from './AddressManagementModal';
import { EmailSupportModal } from './EmailSupportModal';
import { QuickPalEmblem } from './QuickPalLogo';
import { DEFAULT_WHATSAPP_SUPPORT_URL, DEFAULT_INSTAGRAM_URL } from '../utils/phonePrivacy';
import { filterAndRankProducts, matchCategoryWithQuery } from '../utils/searchHelper';
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
  onNavigateToStore?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenNotifications,
  onOpenWishlist,
  onOpenOrders,
  onOpenAuth,
  onOpenAiAssistant,
  onOpenFaqDashboard,
  onNavigateToStore,
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
    paymentSettings,
    isDiwaliTheme,
    toggleDiwaliTheme
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

  // Filter products for instant dropdown results using robust token and alias matching
  const matchingProducts = searchQuery.trim()
    ? filterAndRankProducts(products, searchQuery, categories).slice(0, 8)
    : [];

  const matchingCategories = searchQuery.trim()
    ? categories.filter(c => matchCategoryWithQuery(c, searchQuery))
    : [];

  const unreadNotifs = notifications.filter(
    n => !n.read && (n.targetRole === currentRole || n.targetRole === 'all')
  ).length;

  return (
    <>
      <header className="bg-[#FF6A00] text-white px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4 shadow-md shrink-0 transition-colors relative border-b border-orange-600 z-30">
        {/* Subtle Ambient Glows clipped inside background container */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-28 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-24 bg-orange-700/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Left Side: Brand Logo + Location & Delivery ETA */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2.5 sm:gap-4 relative z-10 shrink-0">
          {/* QuickPal Branding Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategoryId(null);
              onNavigateToStore?.();
            }}
          >
            {/* Official QuickPal Emblem in White & Orange */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white text-[#FF6A00] flex items-center justify-center shadow-md shrink-0 border border-white p-1 group-hover:scale-105 transition-transform">
              <span className="font-black text-sm sm:text-base text-[#FF6A00] tracking-tighter leading-none flex items-center select-none">
                <span>q</span>
                <span>p</span>
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[#FF6A00] bg-white px-1.5 py-0.5 rounded shadow-2xs">
                  <span>⚡</span>
                  <span>30-Min Delivery</span>
                </span>
                <span className="text-[9px] text-white/90 hidden xl:inline tracking-tight font-medium">
                  • Saphale 401102
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight flex items-baseline leading-none text-white drop-shadow-sm mt-0.5">
                <span className="text-[#FF6A00] bg-white px-1.5 py-0.5 rounded-l-lg">quick</span>
                <span className="text-white bg-orange-700 px-1.5 py-0.5 rounded-r-lg shadow-sm">pal</span>
                <div className="ml-1.5 w-2 h-2 rounded-full bg-white animate-pulse self-center"></div>
              </h1>
            </div>
          </div>

          {/* Location & ETA Selector */}
          <div ref={addressContainerRef} className="relative z-40 shrink-0">
            <button
              type="button"
              onClick={() => setShowAddressManagementModal(true)}
              className="bg-white/20 hover:bg-white/30 border border-white/40 rounded-2xl px-2.5 sm:px-3 py-1 sm:py-1.5 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs text-left group"
              title="Click to change or edit delivery address"
            >
              <div className="w-2 h-2 rounded-full bg-white animate-ping absolute top-2 left-2 opacity-75 pointer-events-none" />
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] sm:text-xs font-black text-white tracking-tight leading-tight flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white inline-block shadow-xs"></span>
                    Delivery in 30 mins
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-orange-100 font-extrabold truncate max-w-[120px] sm:max-w-[160px] flex items-center gap-0.5 leading-tight mt-0.5 group-hover:text-white transition-colors">
                  <span className="truncate">{selectedAddress.pincode}, {selectedAddress.area}</span>
                  <ChevronDown className="w-3 h-3 text-white group-hover:text-white shrink-0" />
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

        {/* Global Search Bar - Maximized Length Across Entire Center for Web and Mobile */}
        <div ref={searchContainerRef} className="w-full flex-1 mx-0 sm:mx-1 md:mx-2 lg:mx-4 relative z-30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsSearchFocused(false);
              onNavigateToStore?.();
            }}
            className="relative flex items-center w-full"
          >
            <input
              type="text"
              value={searchQuery}
              onFocus={() => {
                setIsSearchFocused(true);
                onNavigateToStore?.();
              }}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
                if (selectedCategoryId) {
                  setSelectedCategoryId(null);
                }
                onNavigateToStore?.();
              }}
              placeholder={searchPlaceholders[placeholderIndex]}
              className="w-full bg-white text-gray-900 rounded-2xl py-2.5 sm:py-3.5 pl-11 sm:pl-12 pr-24 sm:pr-32 text-sm sm:text-base focus:outline-none border-2 border-orange-200 focus:border-white focus:ring-4 focus:ring-white/30 shadow-lg placeholder-gray-400 font-bold transition-all"
            />
            <Search className="w-5 h-5 text-[#FF6A00] absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery ? (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchFocused(false);
                    onNavigateToStore?.();
                  }}
                  className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  onClick={() => {
                    setIsSearchFocused(false);
                    onNavigateToStore?.();
                  }}
                  className="bg-[#FF6A00] hover:bg-orange-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
                </button>
              </div>
            ) : (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[11px] font-bold text-gray-400 pointer-events-none">
                <span className="bg-orange-50 text-[#FF6A00] px-2 py-0.5 rounded-md text-[10px] font-black border border-orange-200">
                  Instant Search
                </span>
              </div>
            )}
          </form>

          {/* Live Search Results Dropdown - Full Visibility Floating Above Store */}
          {isSearchFocused && searchQuery.trim() !== '' && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-orange-300 overflow-hidden z-50 max-h-[75vh] flex flex-col animate-in fade-in duration-150 text-gray-900">
              {/* Visible Search Query Header */}
              <div className="p-3 sm:p-3.5 bg-orange-50 border-b border-orange-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-black text-gray-600 uppercase tracking-wider text-[11px]">
                    Searching For:
                  </span>
                  <span className="bg-[#FF6A00] text-white text-xs sm:text-sm font-black px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1">
                    <span>&ldquo;{searchQuery}&rdquo;</span>
                  </span>
                </div>
                <span className="bg-white text-orange-800 text-xs font-black px-2.5 py-1 rounded-lg border border-orange-200 shadow-2xs">
                  {matchingProducts.length} {matchingProducts.length === 1 ? 'item found' : 'items found'}
                </span>
              </div>

              <div className="overflow-y-auto p-2 space-y-2">
                {/* Matching Categories Quick Filters */}
                {matchingCategories.length > 0 && (
                  <div className="p-2.5 bg-orange-50/70 rounded-xl space-y-1.5 border border-orange-200/80">
                    <span className="text-[10px] font-black uppercase text-orange-800 tracking-wider block">
                      Matching Categories
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchingCategories.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategoryId(cat.id);
                            setSearchQuery('');
                            setIsSearchFocused(false);
                            onNavigateToStore?.();
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-[#FF6A00] hover:text-white text-gray-800 rounded-lg text-xs font-bold border border-orange-200 flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
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
                  <div className="p-6 text-center text-gray-600 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF6A00] flex items-center justify-center text-2xl mx-auto shadow-2xs">
                      🔍
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">No direct products found matching &ldquo;{searchQuery}&rdquo;</p>
                      <p className="text-xs text-gray-500 font-medium mt-1">Try one of our popular Saphale groceries:</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                      {['Milk', 'Bread', 'Eggs', 'Chips', 'Butter', 'Apples', 'Curd', 'Cold Drinks'].map(term => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => {
                            setSearchQuery(term);
                            onNavigateToStore?.();
                          }}
                          className="bg-orange-50 hover:bg-[#FF6A00] hover:text-white text-[#FF6A00] border border-orange-200 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {matchingProducts.map(prod => (
                      <div
                        key={prod.id}
                        className="p-2.5 flex items-center justify-between gap-3 hover:bg-orange-50/70 rounded-xl transition-colors group cursor-pointer"
                        onClick={() => {
                          setSearchQuery(prod.name);
                          setIsSearchFocused(false);
                          onNavigateToStore?.();
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-orange-50/60 border border-orange-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
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
                            <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-[#FF6A00] transition-colors">
                              {prod.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                              <span className="font-black text-[#FF6A00]">
                                ₹{prod.price}
                              </span>
                              {prod.originalPrice > prod.price && (
                                <span className="line-through text-gray-400 text-[10px]">
                                  ₹{prod.originalPrice}
                                </span>
                              )}
                              {prod.weightUnit && (
                                <span className="text-gray-500 text-[10px] font-medium">
                                  • {prod.weightUnit}
                                </span>
                              )}
                            </div>
                            {Array.isArray(prod.dietaryTags) && prod.dietaryTags.length > 0 && (
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                {prod.dietaryTags.slice(0, 2).map(tag => (
                                  <span
                                    key={tag}
                                    className="text-[9px] font-bold bg-orange-50 text-[#FF6A00] border border-orange-200 px-1.5 py-0.2 rounded"
                                  >
                                    {tag === 'Vegan' ? '🌱' : tag === 'Organic' ? '🌿' : tag === 'Gluten-Free' ? '🌾' : tag === 'Sugar-Free' ? '🚫' : tag === 'Dairy-Free' ? '🥛' : '🟢'} {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(prod, 1);
                          }}
                          className="bg-[#FF6A00] hover:bg-orange-600 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs shrink-0 flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 bg-gray-50 border-t border-orange-200 flex justify-between items-center text-xs">
                <span className="text-gray-600 font-bold text-[11px]">
                  Showing top instant matches • Press Enter to view in catalog
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchFocused(false);
                    onNavigateToStore?.();
                  }}
                  className="bg-[#FF6A00] hover:bg-orange-600 text-white font-black px-3 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1"
                >
                  <span>View All In Store</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Essential Actions: Login & Iconic Cart Button */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
          {/* User Login & Profile Button */}
          <button
            onClick={onOpenAuth}
            className="bg-white/15 hover:bg-white/25 text-white px-3 sm:px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 backdrop-blur-sm border border-white/30 transition-all shadow-xs shrink-0"
          >
            <div className="w-6 h-6 rounded-xl bg-white text-[#FF6A00] flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5 text-[#FF6A00]" />}
            </div>
            <span className="hidden sm:inline font-bold">
              {currentUser ? currentUser.name.split(' ')[0] : 'Login'}
            </span>
          </button>

          {/* QuickPal Crisp White & Orange My Cart Button */}
          <button
            onClick={onOpenCart}
            className="bg-white hover:bg-orange-50 text-[#FF6A00] px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-black flex items-center gap-2 sm:gap-2.5 shadow-lg border-2 border-white transition-all transform active:scale-95 shrink-0 group"
            title="Open Shopping Cart"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF6A00] group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FF6A00] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white font-black animate-pulse shadow-sm">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="flex flex-col text-left leading-none">
              {cartCount > 0 ? (
                <>
                  <span className="text-[9px] sm:text-[10px] uppercase font-black text-orange-600 tracking-tight">
                    {cartCount} {cartCount === 1 ? 'item' : 'items'}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-[#FF6A00] mt-0.5">
                    ₹{cartSubtotal}
                  </span>
                </>
              ) : (
                <span className="text-xs sm:text-sm font-black text-[#FF6A00]">
                  My Cart
                </span>
              )}
            </div>
          </button>
        </div>
      </header>

      {/* Down-Shifted Secondary Action Bar: All Utility Buttons Shifted Below with Quick Category Shortcuts */}
      <div className="w-full bg-white dark:bg-stone-900 border-b border-orange-200 dark:border-orange-950 px-3 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs font-bold transition-colors shadow-2xs z-20 shrink-0">
        {/* Left Side: Store & Category Quick Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => {
              setSelectedCategoryId(null);
              onNavigateToStore?.();
            }}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 font-bold flex items-center gap-1.5 cursor-pointer ${
              !selectedCategoryId
                ? 'bg-[#FF6A00] text-white font-black shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:text-[#FF6A00] hover:bg-orange-50 dark:hover:bg-orange-950/40 border border-transparent'
            }`}
          >
            <span>🏪</span>
            <span>All Groceries</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategoryId('cat-dairy');
              onNavigateToStore?.();
            }}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 text-xs font-bold flex items-center gap-1 cursor-pointer border ${
              selectedCategoryId === 'cat-dairy'
                ? 'bg-[#FF6A00] text-white border-[#FF6A00] font-black'
                : 'bg-orange-50/70 hover:bg-orange-100 dark:bg-orange-950/30 text-stone-700 dark:text-stone-300 border-orange-200/80 hover:text-[#FF6A00]'
            }`}
          >
            <span>🥛</span>
            <span>Dairy & Bread</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategoryId('cat-veg');
              onNavigateToStore?.();
            }}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 text-xs font-bold items-center gap-1 cursor-pointer border hidden md:flex ${
              selectedCategoryId === 'cat-veg'
                ? 'bg-[#FF6A00] text-white border-[#FF6A00] font-black'
                : 'bg-orange-50/70 hover:bg-orange-100 dark:bg-orange-950/30 text-stone-700 dark:text-stone-300 border-orange-200/80 hover:text-[#FF6A00]'
            }`}
          >
            <span>🥬</span>
            <span>Veggies & Fruits</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategoryId('cat-snacks');
              onNavigateToStore?.();
            }}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 text-xs font-bold items-center gap-1 cursor-pointer border hidden lg:flex ${
              selectedCategoryId === 'cat-snacks'
                ? 'bg-[#FF6A00] text-white border-[#FF6A00] font-black'
                : 'bg-orange-50/70 hover:bg-orange-100 dark:bg-orange-950/30 text-stone-700 dark:text-stone-300 border-orange-200/80 hover:text-[#FF6A00]'
            }`}
          >
            <span>🥨</span>
            <span>Snacks & Munchies</span>
          </button>
        </div>

        {/* Right Side: Shifted Other App Buttons (AI Help, Wishlist, Notifications, Orders, WhatsApp, Instagram, Email, FAQs) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar shrink-0 justify-end">
          {/* AI Support Assistant Button */}
          {onOpenAiAssistant && (
            <button
              onClick={onOpenAiAssistant}
              className="bg-gradient-to-r from-orange-500 to-[#FF6A00] hover:from-orange-600 hover:to-orange-500 text-white font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
              title="Ask AI Assistant 24/7"
            >
              <Bot className="w-3.5 h-3.5 text-white" />
              <span>AI Help</span>
            </button>
          )}


          {/* Wishlist */}
          <button
            onClick={onOpenWishlist}
            className="p-1.5 sm:px-2 sm:py-1.5 text-stone-700 dark:text-stone-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-xl transition-colors relative flex items-center gap-1 cursor-pointer"
            title="Wishlist"
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold hidden sm:inline">Wishlist</span>
            {wishlistProductIds.length > 0 && (
              <span className="bg-[#FF6A00] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                {wishlistProductIds.length}
              </span>
            )}
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="p-1.5 sm:px-2 sm:py-1.5 text-stone-700 dark:text-stone-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-xl transition-colors relative flex items-center gap-1 cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#FF6A00]" />
            <span className="text-xs font-bold hidden md:inline">Alerts</span>
            {unreadNotifs > 0 && (
              <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                {unreadNotifs}
              </span>
            )}
          </button>

          {/* Orders Button */}
          <button
            onClick={onOpenOrders}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-stone-700 dark:text-stone-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-xl transition-all flex items-center gap-1 shadow-2xs border border-orange-100 dark:border-orange-950 cursor-pointer"
            title="My Orders"
          >
            <User className="w-4 h-4 text-[#FF6A00]" />
            <span className="text-xs font-bold">Orders</span>
          </button>

          {/* WhatsApp Support Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 sm:px-2 sm:py-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 rounded-xl transition-all border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shadow-2xs hover:scale-105"
            title="WhatsApp Support & Community"
            aria-label="WhatsApp Support"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-black hidden xl:inline">WhatsApp</span>
          </a>

          {/* Instagram Handle */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 sm:px-2 sm:py-1.5 text-pink-700 bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/30 rounded-xl transition-all border border-pink-200 dark:border-pink-800 flex items-center gap-1 shadow-2xs hover:scale-105 hidden 2xl:flex"
            title="Follow QuickPal on Instagram (@quickpal.in)"
            aria-label="Instagram Handle"
          >
            <Instagram className="w-3.5 h-3.5 text-pink-600" />
            <span className="text-[11px] font-black">@quickpal.in</span>
          </a>

          {/* Email Support Button */}
          <button
            onClick={() => setShowEmailModal(true)}
            className="p-1.5 sm:px-2 sm:py-1.5 text-stone-700 dark:text-stone-300 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 rounded-xl transition-all border border-orange-200 dark:border-orange-900 flex items-center gap-1 shadow-2xs hover:scale-105 cursor-pointer hidden xl:flex"
            title="Contact Email Support (quickpal.in@outlook.com)"
            aria-label="Email Support"
          >
            <Mail className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span className="text-[11px] font-black">Email</span>
          </button>

          {/* FAQ Dashboard Button */}
          {onOpenFaqDashboard && (
            <button
              onClick={onOpenFaqDashboard}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-stone-700 dark:text-stone-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-xl transition-colors flex items-center gap-1 cursor-pointer border border-transparent hover:border-orange-200"
              title="FAQ Dashboard & Help"
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold hidden lg:inline">Help</span>
            </button>
          )}
        </div>
      </div>

    {/* Email Support Modal */}
    <EmailSupportModal
      isOpen={showEmailModal}
      onClose={() => setShowEmailModal(false)}
    />
    </>
  );
};
