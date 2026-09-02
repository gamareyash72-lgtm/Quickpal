import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Order, Category } from '../types';
import { ProductDetailModal } from './ProductDetailModal';
import { AddAddressModal } from './AddAddressModal';
import { EmailSupportModal } from './EmailSupportModal';
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
  Layers,
  Mail,
  Phone,
  ShieldCheck,
  Headphones,
  ShoppingBasket,
  ChevronDown,
  MessageCircle,
  Instagram
} from 'lucide-react';
import { DEFAULT_CUSTOMER_CARE_EMAIL, DEFAULT_WHATSAPP_SUPPORT_URL, DEFAULT_INSTAGRAM_URL } from '../utils/phonePrivacy';

interface CustomerDashboardProps {
  onOpenCart: () => void;
  onOpenCheckout: () => void;
  onTrackOrder: (orderId: string) => void;
  onOpenAiAssistant?: () => void;
}

// Dedicated Blinkit-Style Product Card Sub-component
interface ProductCardProps {
  product: Product;
  onSelectProduct: (p: Product) => void;
}

const BlinkitProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const { cartItems, addToCart, updateQuantity, wishlistProductIds, toggleWishlist } = useApp();

  const cartItem = cartItems?.find(item => item?.product?.id === product.id);
  const isWishlisted = wishlistProductIds?.includes(product.id);
  const mainImgUrl = product.image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
  const hasMultipleImages = Array.isArray(product.images) && product.images.length > 1;
  const priceVal = Number(product.price) || 0;
  const origPriceVal = Number(product.originalPrice) || priceVal;
  const deliveryMins = Number(product.deliveryTimeMins) || 30;
  const ratingVal = Number(product.rating) || 4.8;
  const discountPercent = origPriceVal > priceVal ? Math.round(((origPriceVal - priceVal) / origPriceVal) * 100) : 0;
  const isOutOfStock = product.isOutOfStock || (typeof product.stock === 'number' && product.stock <= 0);

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="bg-white dark:bg-gray-900 rounded-2xl p-2.5 sm:p-3 border border-gray-100 dark:border-gray-800 flex flex-col justify-between shadow-2xs hover:shadow-lg transition-all relative group cursor-pointer h-full select-none"
    >
      {/* Top Badges: Discount on Left, Wishlist on Right */}
      <div className="flex items-center justify-between w-full relative z-10">
        {discountPercent > 0 ? (
          <span className="bg-blue-600 dark:bg-blue-500 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-tight shadow-2xs">
            {discountPercent}% OFF
          </span>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-400 hover:text-rose-500 transition-colors shadow-2xs"
          title="Add to Wishlist"
          aria-label="Add to Wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              isWishlisted ? 'text-rose-500 fill-rose-500' : ''
            }`}
          />
        </button>
      </div>

      {/* Product Image Frame */}
      <div className="h-28 sm:h-36 bg-gray-50/60 dark:bg-gray-800/40 rounded-xl flex items-center justify-center relative overflow-hidden p-2 my-1 group-hover:bg-orange-50/20 transition-colors">
        <img
          src={mainImgUrl}
          alt={product.name || 'Product'}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />

        {hasMultipleImages && (
          <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 opacity-90">
            <Images className="w-2.5 h-2.5" />
            {product.images?.length}
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-white bg-rose-600 px-2 py-0.5 rounded shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Delivery Time Pill */}
      <div className="flex items-center justify-between mb-1">
        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1">
          <Clock className="w-2.5 h-2.5 text-gray-500" />
          {deliveryMins} MINS
        </span>
        <span className="text-[10px] text-gray-400 flex items-center gap-0.5 font-bold">
          <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
          {ratingVal}
        </span>
      </div>

      {/* Product Name & Weight */}
      <div className="mb-2">
        <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors min-h-[2rem]">
          {product.name || 'Grocery Item'}
        </h4>
        <p className="text-[10px] text-gray-400 font-medium mt-0.5 truncate">
          {product.weightUnit || '1 unit'}
        </p>
      </div>

      {/* Price & Blinkit ADD Button */}
      <div
        className="mt-auto pt-1 flex items-center justify-between gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col text-left">
          <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-gray-100 leading-none">
            ₹{priceVal}
          </span>
          {origPriceVal > priceVal && (
            <span className="text-[10px] text-gray-400 line-through leading-none mt-0.5">
              ₹{origPriceVal}
            </span>
          )}
        </div>

        {cartItem ? (
          <div className="flex items-center bg-emerald-600 text-white rounded-lg border border-emerald-700 shadow-xs">
            <button
              type="button"
              onClick={() => updateQuantity(product.id, (cartItem.quantity || 1) - 1)}
              className="px-2 py-1 hover:bg-emerald-700 rounded-l-lg transition-colors active:scale-90"
              title="Decrease quantity"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-1.5 text-xs font-black min-w-[16px] text-center">
              {cartItem.quantity || 1}
            </span>
            <button
              type="button"
              onClick={() => {
                if (cartItem.quantity >= (product.stock || 999)) {
                  alert(`Only ${product.stock} units of ${product.name} are available.`);
                  return;
                }
                updateQuantity(product.id, (cartItem.quantity || 0) + 1);
              }}
              className="px-2 py-1 hover:bg-emerald-700 rounded-r-lg transition-colors active:scale-90"
              title="Increase quantity"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => addToCart(product)}
            disabled={isOutOfStock}
            className={`font-black px-3.5 sm:px-4 py-1.5 rounded-lg text-xs transition-all uppercase shadow-2xs active:scale-95 ${
              isOutOfStock
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-700'
                : 'border border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white'
            }`}
          >
            {isOutOfStock ? 'Out' : 'ADD'}
          </button>
        )}
      </div>
    </div>
  );
};

// Horizontal Shelf Component for Blinkit Category Rows
interface ShelfProps {
  category: Category;
  products: Product[];
  onSelectCategory: (id: string) => void;
  onSelectProduct: (p: Product) => void;
}

const BlinkitCategoryShelf: React.FC<ShelfProps> = ({ category, products, onSelectCategory, onSelectProduct }) => {
  const shelfRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (shelfRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      shelfRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="space-y-3 bg-white dark:bg-gray-900/60 p-4 sm:p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xs">
      {/* Shelf Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{category.iconEmoji || '📦'}</span>
          <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight">
            {category.name}
          </h3>
          <span className="text-xs text-gray-400 font-bold hidden sm:inline">
            ({products.length} items)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectCategory(category.id)}
            className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            see all
          </button>
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-colors"
              title="Scroll left"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-colors"
              title="Scroll right"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Product Carousel */}
      <div
        ref={shelfRef}
        className="flex gap-3.5 overflow-x-auto pb-2 pt-1 scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map(prod => (
          <div key={prod.id} className="w-40 sm:w-48 shrink-0 flex">
            <BlinkitProductCard product={prod} onSelectProduct={onSelectProduct} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onOpenCart,
  onOpenCheckout,
  onTrackOrder,
  onOpenAiAssistant,
}) => {
  const {
    products,
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    searchQuery,
    setSearchQuery,
    orders,
    cartCount,
    cartSubtotal,
    selectedAddress,
    addresses,
    paymentSettings,
    setSelectedAddress,
    deleteAddress,
    isPincodeApproved,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'under10' | 'deals'>('all');
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<{ id: string; label: string; addressLine: string } | null>(null);
  const [dismissedOrderId, setDismissedOrderId] = useState<string | null>(null);

  // Filter products by search, category, and tab
  const filteredProducts = useMemo(() => {
    return products.filter(prod => {
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
  }, [products, categories, searchQuery, selectedCategoryId, activeTab]);

  // Group products by category for Blinkit shelves
  const categorizedProducts = useMemo(() => {
    const map: Record<string, Product[]> = {};
    categories.forEach(cat => {
      map[cat.id] = products.filter(p => !p.isHidden && p.category === cat.id);
    });
    return map;
  }, [categories, products]);

  // Active trackable order for floating widget (scoped to customer)
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

  const isBrowsingAll = !searchQuery.trim() && !selectedCategoryId && activeTab === 'all';

  return (
    <div className="flex-1 overflow-y-auto bg-[#f4f6fb]/50 dark:bg-gray-950 p-3 sm:p-6 space-y-6 pb-28">
      {/* Saphale 401102 Service Area Notice if selected pin invalid */}
      {!isPincodeApproved(selectedAddress.pincode) && (
        <div className="bg-rose-500 text-white p-4 rounded-3xl shadow-md border-2 border-rose-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 text-xl font-bold">
              🚫
            </div>
            <div>
              <h4 className="font-black text-sm">Service Unavailable for PIN Code {selectedAddress.pincode}</h4>
              <p className="text-xs text-rose-100 font-medium">
                QuickPal grocery delivery is operating <strong>in Saphale East & West (PIN Code 401102)</strong>, Palghar District. Please add or select an address in PIN 401102.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddAddressModal(true)}
            className="bg-white text-rose-950 hover:bg-rose-100 px-4 py-2 rounded-xl text-xs font-black shrink-0 shadow-sm"
          >
            + Add Saphale Address
          </button>
        </div>
      )}

      {/* Blinkit Hero Promotional Grid (Top Banner + 3-Feature Cards as seen in Image 2) */}
      <div className="space-y-3">
        {/* Top Wide Promotional Banner */}
        <div className="bg-gradient-to-r from-amber-950 via-orange-900 to-amber-900 text-white rounded-3xl p-5 sm:p-7 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-lg border border-amber-500/30 gap-6">
          <div className="z-10 max-w-lg text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-500 text-amber-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs border border-yellow-300/60 flex items-center gap-1">
                <span>🌺</span>
                <span>Ganesh Utsav Special</span>
              </span>
              <span className="text-amber-300 text-xs font-bold">
                30 Mins in Saphale
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-amber-100 leading-tight mb-2 tracking-tight drop-shadow-sm">
              Happy Ganesh Chaturthi
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/90 font-medium mb-4">
              Get farm-fresh vegetables, dairy, Ukadiche Modaks, and Durva grass delivered straight to your doorstep.
            </p>
            <button
              onClick={() => {
                setSelectedCategoryId('cat-ganesh-special');
                setActiveTab('all');
              }}
              className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md border border-yellow-300/60 transition-all flex items-center gap-2 transform active:scale-95"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Ganpati Bappa Statue Visual Frame */}
          <div className="relative z-10 shrink-0 w-32 h-32 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-xl border-2 border-amber-400/50 group">
            <img
              src={ganpatiBappaImg}
              alt="Lord Ganesha - Ganpati Bappa Statue"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2">
              <span className="text-[11px] font-black text-yellow-300 drop-shadow-sm">
                🙏 बाप्पा मोरया
              </span>
            </div>
          </div>

          {/* Ambient Glows */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* 3-Column Promo Grid for Grocery & Essentials */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Dairy, Bread & Eggs */}
          <div
            onClick={() => {
              setSelectedCategoryId('cat-dairy');
              setActiveTab('all');
            }}
            className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="space-y-1 text-left max-w-[65%]">
              <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 tracking-wider">
                Dairy & Breakfast
              </span>
              <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-gray-100 leading-tight">
                Daily fresh milk & bread
              </h3>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-1">
                Amul milk, butter, curd & fresh eggs
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black px-3 py-1 rounded-xl shadow-xs transition-transform active:scale-95">
                  Order Now ➔
                </span>
              </div>
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-emerald-200/50 flex items-center justify-center text-3xl sm:text-4xl shrink-0 group-hover:scale-105 transition-transform">
              🥛
            </div>
          </div>

          {/* Card 2: Snacks & Munchies */}
          <div
            onClick={() => {
              setSelectedCategoryId('cat-snacks');
              setActiveTab('all');
            }}
            className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/60 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="space-y-1 text-left max-w-[65%]">
              <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300 tracking-wider">
                Snacks & Munchies
              </span>
              <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-gray-100 leading-tight">
                Crispy chips & snacks
              </h3>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-1">
                Lay's, Kurkure, namkeen & biscuits
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-black px-3 py-1 rounded-xl shadow-xs transition-transform active:scale-95">
                  Order Now ➔
                </span>
              </div>
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-amber-200/50 flex items-center justify-center text-3xl sm:text-4xl shrink-0 group-hover:scale-105 transition-transform">
              🥨
            </div>
          </div>

          {/* Card 3: Candies & Gums */}
          <div
            onClick={() => {
              setSelectedCategoryId('cat-candies');
              setActiveTab('all');
            }}
            className="bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:from-pink-950/40 dark:to-rose-950/30 border border-pink-200 dark:border-pink-800/60 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="space-y-1 text-left max-w-[65%]">
              <span className="text-[10px] font-black uppercase text-pink-800 dark:text-pink-300 tracking-wider">
                Candies & Sweet Tooth
              </span>
              <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-gray-100 leading-tight">
                Sweet candies & gums
              </h3>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-1">
                Chupa Chups, Pulse & Happydent
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-black px-3 py-1 rounded-xl shadow-xs transition-transform active:scale-95">
                  Order Now ➔
                </span>
              </div>
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-pink-200/50 flex items-center justify-center text-3xl sm:text-4xl shrink-0 group-hover:scale-105 transition-transform">
              🍬
            </div>
          </div>
        </div>
      </div>

      {/* Blinkit Category Grid (The 2-Row Category Tiles Grid as seen in Image 2) */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>Explore Categories</span>
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

        {/* 2-Row Multi-Column Category Squares Grid (Exact Blinkit Spec) */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9 gap-2.5 sm:gap-3">
          {categories.map(cat => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategoryId(isSelected ? null : cat.id)}
                className={`rounded-2xl p-2 flex flex-col items-center justify-between text-center cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-orange-100/80 dark:bg-orange-950/80 border-orange-500 ring-2 ring-orange-500 shadow-sm scale-105'
                    : 'bg-[#f4f6fb] dark:bg-gray-800/80 border-transparent hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 shadow-2xs'
                }`}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl overflow-hidden p-1">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain hover:scale-110 transition-transform"
                    />
                  ) : (
                    <span className="text-2xl sm:text-3xl">{cat.iconEmoji}</span>
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-bold mt-1 line-clamp-2 leading-tight ${
                    isSelected
                      ? 'text-orange-900 dark:text-orange-300 font-black'
                      : 'text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Catalog View: Either Blinkit Shelves (when browsing All) OR Full Responsive Grid (when filtering) */}
      {isBrowsingAll ? (
        /* Categorized Shelves View (Blinkit style) */
        <div className="space-y-6">
          {categories.map(cat => {
            const prods = categorizedProducts[cat.id] || [];
            return (
              <BlinkitCategoryShelf
                key={cat.id}
                category={cat}
                products={prods}
                onSelectCategory={(id) => setSelectedCategoryId(id)}
                onSelectProduct={(p) => setSelectedDetailProduct(p)}
              />
            );
          })}
        </div>
      ) : (
        /* Filtered Grid View */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100">
                  {searchQuery.trim()
                    ? `Search Results for "${searchQuery}"`
                    : selectedCategoryId
                    ? categories.find(c => c.id === selectedCategoryId)?.name
                    : 'Products'}
                </h3>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategoryId(null);
                    setActiveTab('all');
                  }}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 transition-colors"
                >
                  Clear Filters <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                Showing {filteredProducts.length} items
              </p>
            </div>

            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl gap-1">
              {(
                [
                  { id: 'all', label: 'All Items' },
                  { id: 'featured', label: '★ Featured' },
                  { id: 'under10', label: '⚡ 30 Mins Delivery' },
                  { id: 'deals', label: '🏷️ Deals' },
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-700 text-orange-800 dark:text-orange-300 shadow-xs font-black'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-10 text-center border border-gray-100 dark:border-gray-800 space-y-3">
              <div className="text-4xl">🥦</div>
              <h4 className="text-sm font-black text-gray-700 dark:text-gray-300">
                No products found matching your filter.
              </h4>
              <button
                onClick={() => {
                  setSelectedCategoryId(null);
                  setSearchQuery('');
                  setActiveTab('all');
                }}
                className="text-xs font-black text-orange-600 hover:underline"
              >
                Reset to All Items
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredProducts.map(prod => (
                <BlinkitProductCard
                  key={prod.id}
                  product={prod}
                  onSelectProduct={(p) => setSelectedDetailProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Blinkit Style Footer with Categories and Useful Links (as seen in Image 1) */}
      <footer className="mt-12 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-2xs space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
          {/* Useful Links Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100">
              Useful Links
            </h4>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
              <li><span className="hover:text-orange-600 cursor-pointer">About Us</span></li>
              <li><span className="hover:text-orange-600 cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-orange-600 cursor-pointer">Terms & Conditions</span></li>
              <li><span className="hover:text-orange-600 cursor-pointer">FAQs & Help Center</span></li>
              <li><span className="hover:text-orange-600 cursor-pointer">Delivery Partner Signup</span></li>
              <li><span className="hover:text-orange-600 cursor-pointer">Franchise & Dark Stores</span></li>
            </ul>
          </div>

          {/* Categories Columns */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100">
                Categories
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
              {categories.slice(0, 15).map(cat => (
                <span
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className="hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer truncate"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          </div>

          {/* Customer Care & Help */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100">
              24/7 Customer Support & Social
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Need help with your grocery order or delivery in Saphale? Connect with us:
            </p>

            {/* Direct WhatsApp Support Button */}
            <a
              href={paymentSettings?.whatsappSupportUrl || DEFAULT_WHATSAPP_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4 text-emerald-200" />
              <span>Chat on WhatsApp</span>
            </a>

            {/* Direct Instagram Handle Button */}
            <a
              href={paymentSettings?.instagramUrl || DEFAULT_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:opacity-90 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Instagram className="w-4 h-4 text-pink-200" />
              <span>Follow @quickpal.in</span>
            </a>

            {/* Direct Email Support Button */}
            <button
              onClick={() => setShowEmailModal(true)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Mail className="w-4 h-4 text-orange-200" />
              <span>Email Support Desk</span>
            </button>

            <div className="pt-1">
              <span className="text-[10px] text-gray-500 uppercase font-black">Support Email</span>
              <button
                onClick={() => setShowEmailModal(true)}
                className="font-mono text-xs font-black text-orange-600 dark:text-orange-400 hover:underline text-left block"
              >
                {paymentSettings?.customerCareEmail || DEFAULT_CUSTOMER_CARE_EMAIL}
              </button>
            </div>

            {onOpenAiAssistant && (
              <button
                onClick={onOpenAiAssistant}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95"
              >
                🤖 QuickPal AI Assistant
              </button>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400 gap-3">
          <p>
            © 2026 QuickPal Commerce Pvt Ltd. Saphale's 30-Minute Grocery Delivery Service (PIN Code 401102).
          </p>
          <div className="flex items-center gap-3">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> 100% Fresh & Authentic Guarantee
            </span>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {selectedDetailProduct && (
        <ProductDetailModal
          product={selectedDetailProduct}
          onClose={() => setSelectedDetailProduct(null)}
        />
      )}

      {/* Floating Support Triggers (WhatsApp + AI Support) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col sm:flex-row items-end sm:items-center gap-2.5">
        {/* Floating WhatsApp Support Button */}
        <a
          href={paymentSettings?.whatsappSupportUrl || DEFAULT_WHATSAPP_SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full p-3 shadow-2xl border-2 border-emerald-300 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 group"
          title="Chat with QuickPal Support on WhatsApp"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-black text-base shadow-inner">
            <MessageCircle className="w-5 h-5 text-emerald-100" />
          </div>
          <span className="text-xs font-black tracking-tight pr-1 hidden sm:inline">
            WhatsApp Support
          </span>
        </a>

        {/* Floating AI Support Launcher Button */}
        {onOpenAiAssistant && (
          <button
            onClick={onOpenAiAssistant}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full p-3 shadow-2xl border-2 border-yellow-300 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 group"
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
      </div>

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

      {/* Direct Email Support Modal */}
      <EmailSupportModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
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
