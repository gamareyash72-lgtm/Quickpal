import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Order, Category, DietaryTag } from '../types';
import { ProductDetailModal } from './ProductDetailModal';
import { AddAddressModal } from './AddAddressModal';
import { EmailSupportModal } from './EmailSupportModal';
import { filterAndRankProducts } from '../utils/searchHelper';
import {
  Search,
  Zap,
  Plus,
  Minus,
  Heart,
  ShoppingBag,
  Star,
  Clock,
  ArrowRight,
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
  Instagram,
  Filter
} from 'lucide-react';
import { DEFAULT_CUSTOMER_CARE_EMAIL, DEFAULT_WHATSAPP_SUPPORT_URL, DEFAULT_INSTAGRAM_URL } from '../utils/phonePrivacy';

export const DIETARY_TAG_OPTIONS: Array<{
  tag: DietaryTag;
  label: string;
  icon: string;
  description: string;
}> = [
  { tag: 'Vegan', label: 'Vegan', icon: '🌱', description: '100% plant-based, no dairy or animal by-products' },
  { tag: 'Gluten-Free', label: 'Gluten-Free', icon: '🌾', description: 'Free from wheat, barley, rye & gluten proteins' },
  { tag: 'Organic', label: 'Organic', icon: '🌿', description: 'Certified chemical-free & pesticide-free produce' },
  { tag: 'Dairy-Free', label: 'Dairy-Free', icon: '🥛', description: 'Lactose-free & completely free from animal milk' },
  { tag: 'Sugar-Free', label: 'Sugar-Free', icon: '🚫', description: 'Zero added refined sugars or artificial syrups' },
  { tag: 'Pure Veg', label: 'Pure Veg', icon: '🟢', description: 'Traditional 100% vegetarian Indian green dot items' },
];

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
  onFilterDietaryTag?: (tag: DietaryTag) => void;
}

const BlinkitProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onFilterDietaryTag,
}) => {
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
      className="bg-white dark:bg-gray-900 rounded-2xl p-2.5 sm:p-3 border border-gray-100 dark:border-gray-800 flex flex-col justify-between shadow-2xs hover:shadow-lg transition-all relative group cursor-pointer h-full select-none hover:border-orange-400 dark:hover:border-orange-500"
    >
      {/* Top Badges: Discount on Left, Wishlist on Right */}
      <div className="flex items-center justify-between w-full relative z-10">
        {discountPercent > 0 ? (
          <span className="bg-[#FF6A00] text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight shadow-xs shadow-orange-500/30">
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
      <div className="h-28 sm:h-36 bg-gray-50/60 dark:bg-gray-800/40 rounded-xl flex items-center justify-center relative overflow-hidden p-2 my-1 group-hover:bg-orange-50/30 transition-colors">
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
        <span className="bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded text-[9px] font-bold text-orange-700 dark:text-orange-300 flex items-center gap-1 border border-orange-200/50 dark:border-orange-800/40">
          <Clock className="w-2.5 h-2.5 text-[#FF6A00]" />
          {deliveryMins} MINS
        </span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-0.5 font-bold">
          <Star className="w-2.5 h-2.5 text-[#FF6A00] fill-[#FF6A00]" />
          {ratingVal}
        </span>
      </div>

      {/* Product Name & Weight + Dietary Indicator (Orange & White Theme, Clickable) */}
      <div className="mb-2">
        <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-[#FF6A00] transition-colors min-h-[2rem]">
          {product.name || 'Grocery Item'}
        </h4>
        <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium mt-1 gap-1 flex-wrap">
          <span className="truncate">{product.weightUnit || '1 unit'}</span>
          {Array.isArray(product.dietaryTags) && product.dietaryTags.length > 0 && (
            <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
              {product.dietaryTags.slice(0, 2).map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onFilterDietaryTag) onFilterDietaryTag(tag);
                  }}
                  className="bg-orange-50 hover:bg-[#FF6A00] text-[#FF6A00] hover:text-white border border-orange-200/90 font-black text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                  title={`Filter store items by ${tag}`}
                >
                  <span>{tag === 'Vegan' ? '🌱' : tag === 'Organic' ? '🌿' : tag === 'Gluten-Free' ? '🌾' : tag === 'Sugar-Free' ? '🚫' : tag === 'Dairy-Free' ? '🥛' : '🟢'}</span>
                  <span>{tag}</span>
                </button>
              ))}
              {product.dietaryTags.length > 2 && (
                <span className="text-[8px] text-orange-600 font-black bg-orange-100/80 px-1 py-0.5 rounded">
                  +{product.dietaryTags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Price & QuickPal Orange ADD Button */}
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
          <div className="flex items-center bg-[#FF6A00] text-white rounded-xl border border-orange-600 shadow-md shadow-orange-500/20">
            <button
              type="button"
              onClick={() => updateQuantity(product.id, (cartItem.quantity || 1) - 1)}
              className="px-2 py-1 hover:bg-[#e05e00] rounded-l-xl transition-colors active:scale-90"
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
              className="px-2 py-1 hover:bg-[#e05e00] rounded-r-xl transition-colors active:scale-90"
              title="Increase quantity"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              addToCart(product);
            }}
            disabled={isOutOfStock}
            className={`font-black px-3.5 sm:px-4 py-1.5 rounded-xl text-xs transition-all uppercase shadow-xs active:scale-95 ${
              isOutOfStock
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-700'
                : 'border-2 border-[#FF6A00] text-[#FF6A00] bg-orange-50/70 dark:bg-orange-950/30 hover:bg-[#FF6A00] hover:text-white dark:hover:bg-[#FF6A00] dark:hover:text-white shadow-xs'
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
  onFilterDietaryTag?: (tag: DietaryTag) => void;
}

const BlinkitCategoryShelf: React.FC<ShelfProps> = ({
  category,
  products,
  onSelectCategory,
  onSelectProduct,
  onFilterDietaryTag,
}) => {
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
            className="text-xs sm:text-sm font-black text-[#FF6A00] dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors uppercase tracking-tight"
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
            <BlinkitProductCard
              product={prod}
              onSelectProduct={onSelectProduct}
              onFilterDietaryTag={onFilterDietaryTag}
            />
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
    currentUser,
    isDiwaliTheme
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'under10' | 'deals'>('all');
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<DietaryTag[]>([]);
  const [dietaryFilterMode, setDietaryFilterMode] = useState<'all' | 'any'>('all');
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<{ id: string; label: string; addressLine: string } | null>(null);
  const [dismissedOrderId, setDismissedOrderId] = useState<string | null>(null);

  const dashboardContainerRef = useRef<HTMLDivElement>(null);

  const handleToggleDietaryTag = (tag: DietaryTag) => {
    setSelectedDietaryTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleClearDietaryTags = () => {
    setSelectedDietaryTags([]);
  };

  // Auto-scroll to top when a search query or dietary filter is activated
  useEffect(() => {
    if ((searchQuery.trim() || selectedDietaryTags.length > 0) && dashboardContainerRef.current) {
      dashboardContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchQuery, selectedDietaryTags]);

  // Compute live product counts for each dietary tag option in the current scope
  const dietaryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    DIETARY_TAG_OPTIONS.forEach(opt => {
      let baseProds = products.filter(p => !p.isHidden);
      if (searchQuery.trim()) {
        baseProds = filterAndRankProducts(baseProds, searchQuery, categories);
      } else if (selectedCategoryId) {
        baseProds = baseProds.filter(p => p.category === selectedCategoryId);
      }
      counts[opt.tag] = baseProds.filter(p => p.dietaryTags?.includes(opt.tag)).length;
    });
    return counts;
  }, [products, searchQuery, categories, selectedCategoryId]);

  // Filter products by search, category, dietary tags, and tab
  const filteredProducts = useMemo(() => {
    let prods = products.filter(prod => !prod.isHidden);

    // Search query filter (searches across entire store with token & alias support)
    if (searchQuery.trim()) {
      prods = filterAndRankProducts(prods, searchQuery, categories);
    } else if (selectedCategoryId) {
      prods = prods.filter(prod => prod.category === selectedCategoryId);
    }

    // Apply active dietary tag filters (e.g. Vegan, Gluten-Free, Organic)
    if (selectedDietaryTags.length > 0) {
      prods = prods.filter(prod => {
        if (!Array.isArray(prod.dietaryTags) || prod.dietaryTags.length === 0) return false;
        return dietaryFilterMode === 'all'
          ? selectedDietaryTags.every(tag => prod.dietaryTags?.includes(tag))
          : selectedDietaryTags.some(tag => prod.dietaryTags?.includes(tag));
      });
    }

    // Support quick tabs on search/catalog results if customer toggles them
    if (activeTab === 'featured') {
      prods = prods.filter(p => p.isFeatured);
    } else if (activeTab === 'under10') {
      prods = prods.filter(p => p.deliveryTimeMins <= 30);
    } else if (activeTab === 'deals') {
      prods = prods.filter(p => p.price < p.originalPrice);
    }

    return prods;
  }, [products, categories, searchQuery, selectedCategoryId, selectedDietaryTags, dietaryFilterMode, activeTab]);

  // Group products by category for Blinkit shelves
  const categorizedProducts = useMemo(() => {
    const map: Record<string, Product[]> = {};
    categories.forEach(cat => {
      let prods = products.filter(p => !p.isHidden && p.category === cat.id);
      if (selectedDietaryTags.length > 0) {
        prods = prods.filter(p => {
          if (!Array.isArray(p.dietaryTags) || p.dietaryTags.length === 0) return false;
          return dietaryFilterMode === 'all'
            ? selectedDietaryTags.every(tag => p.dietaryTags?.includes(tag))
            : selectedDietaryTags.some(tag => p.dietaryTags?.includes(tag));
        });
      }
      map[cat.id] = prods;
    });
    return map;
  }, [categories, products, selectedDietaryTags, dietaryFilterMode]);

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

  const isBrowsingAll = !searchQuery.trim() && !selectedCategoryId && activeTab === 'all' && selectedDietaryTags.length === 0;

  return (
    <div ref={dashboardContainerRef} className="flex-1 overflow-y-auto bg-[#f4f6fb]/50 dark:bg-gray-950 p-3 sm:p-6 space-y-6 pb-28">
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

      {/* Prominent Active Search Banner (Visible to Customer What They Search) */}
      {searchQuery.trim() && (
        <div className="bg-white border-2 border-[#FF6A00] p-4 sm:p-5 rounded-3xl shadow-md space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border-2 border-orange-200 text-[#FF6A00] flex items-center justify-center shrink-0 shadow-xs">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase font-black text-gray-500 tracking-wider">Active Search</span>
                  <span className="bg-[#FF6A00] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Found
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                  Showing results for &ldquo;<span className="text-[#FF6A00] underline decoration-orange-300 decoration-2">{searchQuery}</span>&rdquo;
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryId(null);
                  setActiveTab('all');
                }}
                className="w-full sm:w-auto bg-orange-50 hover:bg-orange-100 text-[#FF6A00] font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-orange-200 transition-colors shadow-2xs cursor-pointer"
              >
                <X className="w-4 h-4" /> Clear Search
              </button>
            </div>
          </div>

          {/* Quick refinement tags */}
          <div className="flex items-center gap-2 pt-1 border-t border-orange-100 overflow-x-auto no-scrollbar text-xs">
            <span className="text-gray-500 font-bold shrink-0 text-[11px]">Popular Searches:</span>
            {['Milk', 'Bread', 'Eggs', 'Chips', 'Butter', 'Apples', 'Curd', 'Cold Drinks'].map(term => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setSearchQuery(term);
                  setSelectedCategoryId(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer border ${
                  searchQuery.toLowerCase() === term.toLowerCase()
                    ? 'bg-[#FF6A00] text-white border-[#FF6A00]'
                    : 'bg-orange-50/70 hover:bg-orange-100 text-orange-950 border-orange-200'
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Dietary & Lifestyle Filter Bar (Vegan, Gluten-Free, Organic, Dairy-Free, Sugar-Free, Pure Veg) */}
      <div className="bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-950/70 p-4 sm:p-4.5 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-[#FF6A00] flex items-center justify-center font-bold text-lg shadow-2xs shrink-0 border border-orange-200">
              🥗
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-900 dark:text-gray-100">
                  Dietary & Lifestyle Filters
                </h4>
                {selectedDietaryTags.length > 0 && (
                  <span className="bg-[#FF6A00] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                    {selectedDietaryTags.length} Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium hidden sm:block">
                Tap tags to filter instant store items by diet, allergen, or health preference
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Mode Toggle (AND vs OR) shown when multiple dietary tags are selected */}
            {selectedDietaryTags.length > 1 && (
              <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-950/40 p-1 rounded-2xl border border-orange-200 text-xs">
                <span className="text-[10px] font-black uppercase text-gray-400 px-1.5 hidden sm:inline">Mode:</span>
                <button
                  type="button"
                  onClick={() => setDietaryFilterMode('all')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    dietaryFilterMode === 'all'
                      ? 'bg-[#FF6A00] text-white shadow-2xs'
                      : 'text-gray-600 dark:text-gray-300 hover:text-[#FF6A00]'
                  }`}
                  title="Match products that have ALL selected tags (Strict)"
                >
                  Match All (AND)
                </button>
                <button
                  type="button"
                  onClick={() => setDietaryFilterMode('any')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    dietaryFilterMode === 'any'
                      ? 'bg-[#FF6A00] text-white shadow-2xs'
                      : 'text-gray-600 dark:text-gray-300 hover:text-[#FF6A00]'
                  }`}
                  title="Match products that have ANY selected tag (Broad)"
                >
                  Match Any (OR)
                </button>
              </div>
            )}

            {selectedDietaryTags.length > 0 && (
              <button
                type="button"
                onClick={handleClearDietaryTags}
                className="text-xs font-black text-[#FF6A00] hover:text-orange-700 flex items-center gap-1 cursor-pointer bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 px-3.5 py-1.5 rounded-xl border border-orange-200 dark:border-orange-900 transition-colors shadow-2xs active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear All Diets ({selectedDietaryTags.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Dietary Tag Interactive Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
          <button
            type="button"
            onClick={handleClearDietaryTags}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border active:scale-95 ${
              selectedDietaryTags.length === 0
                ? 'bg-[#FF6A00] text-white font-black border-[#FF6A00] shadow-xs shadow-orange-500/25'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 hover:text-[#FF6A00] border-orange-100 dark:border-gray-700'
            }`}
          >
            <span>All Diets</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-lg font-black transition-colors ${
                selectedDietaryTags.length === 0
                  ? 'bg-white/25 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {products.filter(p => !p.isHidden).length}
            </span>
          </button>

          {DIETARY_TAG_OPTIONS.map(opt => {
            const isSelected = selectedDietaryTags.includes(opt.tag);
            const count = dietaryCounts[opt.tag] || 0;
            return (
              <button
                key={opt.tag}
                type="button"
                onClick={() => handleToggleDietaryTag(opt.tag)}
                title={`${opt.label}: ${opt.description}`}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border active:scale-95 ${
                  isSelected
                    ? 'bg-[#FF6A00] text-white border-[#FF6A00] font-black shadow-xs shadow-orange-500/25 ring-2 ring-orange-400/30'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:border-orange-400 hover:bg-orange-50/70 border-orange-200 dark:border-gray-700'
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-lg font-black transition-colors ${
                    isSelected
                      ? 'bg-white/25 text-white'
                      : 'bg-orange-50 dark:bg-gray-700 text-orange-950 dark:text-gray-300'
                  }`}
                >
                  {count}
                </span>
                {isSelected && <X className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}
        </div>

        {/* Active Dietary Filter Quick Helper Banner */}
        {selectedDietaryTags.length > 0 && (
          <div className="pt-2 border-t border-orange-100 dark:border-orange-950/60 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-gray-500">Active Diets:</span>
              {selectedDietaryTags.map(tag => (
                <span
                  key={tag}
                  className="bg-orange-50 text-[#FF6A00] border border-orange-200 text-[11px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1"
                >
                  <span>{tag === 'Vegan' ? '🌱' : tag === 'Organic' ? '🌿' : tag === 'Gluten-Free' ? '🌾' : tag === 'Sugar-Free' ? '🚫' : tag === 'Dairy-Free' ? '🥛' : '🟢'}</span>
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleDietaryTag(tag)}
                    className="hover:text-red-500 cursor-pointer ml-0.5"
                    title={`Remove ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <span className="text-[11px] text-gray-500 font-semibold ml-1">
                ({dietaryFilterMode === 'all' ? 'Must match ALL selected tags' : 'Matches ANY selected tag'})
              </span>
            </div>
            <span className="text-[11px] font-black text-[#FF6A00]">
              {filteredProducts.length} items found
            </span>
          </div>
        )}
      </div>

      {/* Hero Promotional Grid & Category Squares - Shown when NOT actively searching AND no dietary filter */}
      {!searchQuery.trim() && selectedDietaryTags.length === 0 && (
        <>
          {/* QuickPal Hero Promotional Grid (Pure Orange & White Theme) */}
          <div className="space-y-3">
            {/* Top Wide Promotional Banner (Orange & White Theme) */}
            <div className="bg-gradient-to-r from-orange-600 via-[#FF6A00] to-orange-500 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-xl border-2 border-white gap-6">
              <div className="z-10 max-w-lg text-left">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-white text-[#FF6A00] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>30-Min Express Delivery</span>
                  </span>
                  <span className="bg-orange-700/50 text-white border border-white/30 text-xs font-black px-2.5 py-0.5 rounded-full">
                    Saphale 401102
                  </span>
                </div>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-3 tracking-tight drop-shadow-sm">
                  Saphale&apos;s Fastest <span className="bg-white text-[#FF6A00] px-2.5 py-0.5 rounded-xl inline-block mt-1">Online Delivery</span>
                </h2>
                <p className="text-xs sm:text-sm text-orange-50 font-medium mb-5 leading-relaxed">
                  Get farm-fresh vegetables, dairy, snacks, bakery, cold drinks & daily essentials delivered straight to your doorstep in 30 minutes in Saphale (401102).
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedCategoryId(null);
                      setActiveTab('all');
                    }}
                    className="bg-white hover:bg-orange-50 text-[#FF6A00] px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2 transform active:scale-95 cursor-pointer"
                  >
                    <span>Shop Fresh Groceries</span>
                    <ArrowRight className="w-4 h-4 text-[#FF6A00]" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategoryId('cat-dairy');
                      setActiveTab('all');
                    }}
                    className="bg-orange-700/40 hover:bg-orange-700/60 text-white border-2 border-white/40 px-5 py-3.5 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                  >
                    Milk & Dairy
                  </button>
                </div>
              </div>

              {/* QuickPal Express Delivery Feature Badge (Pure White Card on Orange) */}
              <div className="relative z-10 shrink-0 w-full sm:w-auto">
                <div className="bg-white text-gray-900 border-2 border-orange-200 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center justify-center text-center max-w-[260px] mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-[#FF6A00] flex items-center justify-center shadow-lg shadow-orange-500/30 mb-3 border-2 border-white">
                    <span className="font-black text-xl text-white tracking-tighter leading-none flex items-center select-none">
                      <span>q</span>
                      <span>p</span>
                    </span>
                  </div>
                  <span className="text-sm font-black uppercase text-gray-900 tracking-wide">
                    QuickPal Express
                  </span>
                  <span className="text-xs font-black text-[#FF6A00] mt-0.5">
                    ⚡ 30 Mins Guaranteed
                  </span>
                  <div className="w-full h-px bg-orange-100 my-3" />
                  <div className="text-[11px] text-gray-700 space-y-1.5 font-bold text-left w-full">
                    <p className="flex items-center gap-1.5"><span className="text-[#FF6A00] font-black">✓</span> Free Delivery on ₹99+</p>
                    <p className="flex items-center gap-1.5"><span className="text-[#FF6A00] font-black">✓</span> Live Order Tracking</p>
                    <p className="flex items-center gap-1.5"><span className="text-[#FF6A00] font-black">✓</span> Saphale East & West</p>
                  </div>
                </div>
              </div>

              {/* Ambient Glows */}
              <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-12 -top-12 w-64 h-64 bg-orange-700/30 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* 3-Column Promo Grid (Pure Orange & White Theme) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Card 1: Dairy, Bread & Eggs */}
              <div
                onClick={() => {
                  setSelectedCategoryId('cat-dairy');
                  setActiveTab('all');
                }}
                className="bg-white border-2 border-orange-200 hover:border-orange-500 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-xs hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="space-y-1 text-left max-w-[65%]">
                  <span className="text-[10px] font-black uppercase text-[#FF6A00] tracking-wider">
                    Dairy & Breakfast
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
                    Daily Fresh Milk & Bread
                  </h3>
                  <p className="text-[11px] text-gray-600 line-clamp-1">
                    Amul milk, butter, curd & eggs
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 bg-[#FF6A00] hover:bg-orange-600 text-white text-[11px] font-black px-3.5 py-1.5 rounded-xl shadow-xs transition-transform active:scale-95">
                      Order Now ➔
                    </span>
                  </div>
                </div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-3xl sm:text-4xl shrink-0 group-hover:scale-105 transition-transform">
                  🥛
                </div>
              </div>

              {/* Card 2: Snacks & Munchies */}
              <div
                onClick={() => {
                  setSelectedCategoryId('cat-snacks');
                  setActiveTab('all');
                }}
                className="bg-white border-2 border-orange-200 hover:border-orange-500 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-xs hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="space-y-1 text-left max-w-[65%]">
                  <span className="text-[10px] font-black uppercase text-[#FF6A00] tracking-wider">
                    Snacks & Munchies
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
                    Crispy Chips & Namkeen
                  </h3>
                  <p className="text-[11px] text-gray-600 line-clamp-1">
                    Lay's, Kurkure & biscuits
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 bg-[#FF6A00] hover:bg-orange-600 text-white text-[11px] font-black px-3.5 py-1.5 rounded-xl shadow-xs transition-transform active:scale-95">
                      Order Now ➔
                    </span>
                  </div>
                </div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-3xl sm:text-4xl shrink-0 group-hover:scale-105 transition-transform">
                  🥨
                </div>
              </div>

              {/* Card 3: Candies & Sweet Tooth */}
              <div
                onClick={() => {
                  setSelectedCategoryId('cat-candies');
                  setActiveTab('all');
                }}
                className="bg-white border-2 border-orange-200 hover:border-orange-500 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-xs hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="space-y-1 text-left max-w-[65%]">
                  <span className="text-[10px] font-black uppercase text-[#FF6A00] tracking-wider">
                    Candies & Sweet Tooth
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
                    Sweet Candies & Treats
                  </h3>
                  <p className="text-[11px] text-gray-600 line-clamp-1">
                    Chupa Chups, Pulse & treats
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 bg-[#FF6A00] hover:bg-orange-600 text-white text-[11px] font-black px-3.5 py-1.5 rounded-xl shadow-xs transition-transform active:scale-95">
                      Order Now ➔
                    </span>
                  </div>
                </div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-3xl sm:text-4xl shrink-0 group-hover:scale-105 transition-transform">
                  🍬
                </div>
              </div>
            </div>
          </div>

          {/* Category Grid (Pure Orange & White) */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-6 border border-orange-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>Explore Categories</span>
              </h3>
              {selectedCategoryId && (
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className="text-xs font-bold text-[#FF6A00] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Show All Categories <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 2-Row Multi-Column Category Squares Grid (Orange & White Theme) */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9 gap-2.5 sm:gap-3">
              {categories.map(cat => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(isSelected ? null : cat.id)}
                    className={`rounded-2xl p-2.5 flex flex-col items-center justify-between text-center cursor-pointer transition-all border relative ${
                      isSelected
                        ? 'bg-[#FF6A00] text-white border-orange-600 ring-4 ring-orange-500/25 shadow-lg scale-105'
                        : 'bg-white hover:bg-orange-50/70 border-orange-100 hover:border-orange-400 shadow-2xs'
                    }`}
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl overflow-hidden p-1 ${isSelected ? 'bg-white/20' : 'bg-orange-50/60'}`}>
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
                      className={`text-[10px] sm:text-[11px] mt-1 line-clamp-2 leading-tight ${
                        isSelected ? 'text-white font-black' : 'text-gray-800 dark:text-gray-200 font-bold'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

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
                onFilterDietaryTag={handleToggleDietaryTag}
              />
            );
          })}
        </div>
      ) : (
        /* Filtered Grid View */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xs">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {searchQuery.trim() && (
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#FF6A00] bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200">
                    Search Results
                  </span>
                )}
                {selectedDietaryTags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedDietaryTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleDietaryTag(tag)}
                        className="bg-orange-50 hover:bg-orange-100 text-[#FF6A00] border-2 border-orange-300 dark:border-orange-700 text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-2xs hover:scale-105 active:scale-95"
                        title={`Click to remove ${tag} filter`}
                      >
                        <span>{tag === 'Vegan' ? '🌱' : tag === 'Organic' ? '🌿' : tag === 'Gluten-Free' ? '🌾' : tag === 'Sugar-Free' ? '🚫' : tag === 'Dairy-Free' ? '🥛' : '🟢'}</span>
                        <span>{tag}</span>
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                    {selectedDietaryTags.length > 1 && (
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg">
                        {dietaryFilterMode === 'all' ? 'Mode: All Tags' : 'Mode: Any Tag'}
                      </span>
                    )}
                  </div>
                )}
                <h3 className="text-base sm:text-xl font-black text-gray-900 dark:text-gray-100">
                  {searchQuery.trim() ? (
                    <span>
                      Results for &ldquo;<span className="text-[#FF6A00]">{searchQuery}</span>&rdquo;
                    </span>
                  ) : selectedCategoryId ? (
                    categories.find(c => c.id === selectedCategoryId)?.name
                  ) : selectedDietaryTags.length > 0 ? (
                    <span>Dietary Filtered Store Items</span>
                  ) : (
                    'Products'
                  )}
                </h3>
                {(searchQuery.trim() || selectedCategoryId || selectedDietaryTags.length > 0) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategoryId(null);
                      setSelectedDietaryTags([]);
                      setActiveTab('all');
                    }}
                    className="bg-orange-50 hover:bg-orange-100 text-[#FF6A00] border border-orange-200 text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    Reset All <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mt-0.5">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                {searchQuery.trim() ? ` matching "${searchQuery}"` : ''}
                {selectedDietaryTags.length > 0 ? ` (${selectedDietaryTags.join(dietaryFilterMode === 'all' ? ' + ' : ' or ')})` : ''}
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
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-12 text-center border-2 border-orange-100 dark:border-orange-950 space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-orange-50 dark:bg-orange-950/40 border-2 border-orange-200 dark:border-orange-800 text-[#FF6A00] flex items-center justify-center text-3xl mx-auto shadow-xs">
                {selectedDietaryTags.length > 0 ? '🥗' : '🔍'}
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100">
                  {selectedDietaryTags.length > 0
                    ? `No products found matching ${selectedDietaryTags.join(' & ')} dietary filters`
                    : searchQuery.trim()
                    ? `No products found matching "${searchQuery}"`
                    : 'No products found in this category'}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-md mx-auto">
                  {selectedDietaryTags.length > 0
                    ? 'Try removing one or more dietary filters or explore our full catalog below:'
                    : 'Check your spelling or try searching for popular essentials below:'}
                </p>
              </div>

              {/* Quick Action / Search Chips */}
              <div className="flex flex-wrap justify-center gap-2 pt-1 max-w-lg mx-auto">
                {selectedDietaryTags.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearDietaryTags}
                    className="bg-[#FF6A00] hover:bg-orange-600 text-white border-2 border-orange-500 text-xs font-black px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" /> Clear Dietary Filters ({selectedDietaryTags.join(', ')})
                  </button>
                )}
                {['Milk', 'Bread', 'Eggs', 'Chips', 'Oats', 'Spinach', 'Apples'].map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term);
                      setSelectedCategoryId(null);
                    }}
                    className="bg-orange-50 hover:bg-orange-100 text-[#FF6A00] border border-orange-200 text-xs font-black px-3.5 py-1.5 rounded-xl transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    🔍 {term}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setSearchQuery('');
                    setSelectedDietaryTags([]);
                    setActiveTab('all');
                  }}
                  className="bg-orange-50 hover:bg-orange-100 text-[#FF6A00] border border-orange-200 text-xs font-black px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> Show All Store Items
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredProducts.map(prod => (
                <BlinkitProductCard
                  key={prod.id}
                  product={prod}
                  onSelectProduct={(p) => setSelectedDetailProduct(p)}
                  onFilterDietaryTag={handleToggleDietaryTag}
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
          onFilterByDietaryTag={(tag) => {
            handleToggleDietaryTag(tag);
            setSelectedDetailProduct(null);
          }}
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
            className="bg-[#FF6A00] hover:bg-[#e05e00] text-white rounded-full p-3 shadow-2xl border-2 border-white/80 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 group"
            title="Ask QuickPal AI Support Assistant"
          >
            <div className="w-8 h-8 rounded-full bg-neutral-900 text-orange-400 flex items-center justify-center font-black text-base shadow-inner">
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
            <p className="text-xs font-black text-orange-400 truncate">
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
