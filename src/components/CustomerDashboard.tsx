import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Order, Category } from '../types';
import { ProductDetailModal } from './ProductDetailModal';
import { AddAddressModal } from './AddAddressModal';
import { AddressManagementModal } from './AddressManagementModal';
import { EmailSupportModal } from './EmailSupportModal';
import { filterAndRankProducts } from '../utils/searchHelper';
import {
  Search,
  Plus,
  Minus,
  Heart,
  ShoppingBag,
  Star,
  Clock,
  ArrowRight,
  X,
  Images,
  MapPin,
  AlertTriangle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Mail,
  ShieldCheck,
  MessageCircle,
  Instagram,
  Store,
  ArrowLeft,
  ChevronDown,
  Tag,
  HelpCircle,
  Store as StoreIcon
} from 'lucide-react';
import { DEFAULT_CUSTOMER_CARE_EMAIL, DEFAULT_WHATSAPP_SUPPORT_URL, DEFAULT_INSTAGRAM_URL } from '../utils/phonePrivacy';

interface CustomerDashboardProps {
  onOpenCart: () => void;
  onOpenCheckout: () => void;
  onTrackOrder: (orderId: string) => void;
  onOpenAiAssistant?: () => void;
  onOpenOrders?: () => void;
}

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'rating_desc' | 'discount_desc';
type SuperCategoryTab = 'all' | 'fresh' | 'snacks' | 'staples' | 'sweets' | 'deals';

const SUPER_CATEGORY_MAP: Record<SuperCategoryTab, string[]> = {
  all: [],
  fresh: ['cat-dairy', 'cat-veg', 'cat-bakery'],
  snacks: ['cat-snacks', 'cat-drinks', 'cat-instant', 'cat-tea'],
  staples: ['cat-atta', 'cat-masala', 'cat-sauces', 'cat-cleaning'],
  sweets: ['cat-candies', 'cat-sweets'],
  deals: []
};

// Blinkit-Style Compact Product Card
interface ProductCardProps {
  product: Product;
  onSelectProduct: (p: Product) => void;
  isBoughtEarlier?: boolean;
}

const BlinkitProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  isBoughtEarlier = false,
}) => {
  const { cartItems, addToCart, updateQuantity, wishlistProductIds, toggleWishlist } = useApp();

  const cartItem = cartItems?.find(item => item?.product?.id === product.id);
  const isWishlisted = wishlistProductIds?.includes(product.id);
  const mainImgUrl =
    product.image ||
    (product.images && product.images[0]) ||
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
  const hasMultipleImages = Array.isArray(product.images) && product.images.length > 1;
  const priceVal = Number(product.price) || 0;
  const origPriceVal = Number(product.originalPrice) || priceVal;
  const deliveryMins = Number(product.deliveryTimeMins) || 30;
  const ratingVal = Number(product.rating) || 4.8;
  const discountPercent =
    origPriceVal > priceVal ? Math.round(((origPriceVal - priceVal) / origPriceVal) * 100) : 0;
  const isOutOfStock = product.isOutOfStock || (typeof product.stock === 'number' && product.stock <= 0);

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="bg-white dark:bg-gray-900 rounded-2xl p-2.5 sm:p-3 border border-gray-100 dark:border-gray-800 flex flex-col justify-between shadow-2xs hover:shadow-lg transition-all relative group cursor-pointer h-full select-none hover:border-orange-400 dark:hover:border-orange-500"
    >
      {/* Top Row: Bought Earlier / Discount Badge + Wishlist Heart */}
      <div className="flex items-center justify-between w-full relative z-10 gap-1">
        <div className="flex items-center gap-1 flex-wrap">
          {discountPercent > 0 && (
            <span className="bg-[#FF6A00] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tight shadow-2xs">
              {discountPercent}% OFF
            </span>
          )}
          {isBoughtEarlier && (
            <span className="bg-orange-50 dark:bg-orange-950/60 text-[#FF6A00] border border-orange-200 dark:border-orange-800 text-[8px] font-black px-1.5 py-0.5 rounded-md">
              Bought Earlier
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-400 hover:text-rose-500 transition-colors shadow-2xs shrink-0"
          title="Add to Wishlist"
          aria-label="Add to Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'text-rose-500 fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Product Image */}
      <div className="h-24 sm:h-32 bg-gray-50/70 dark:bg-gray-800/40 rounded-xl flex items-center justify-center relative overflow-hidden p-2 my-1.5 group-hover:bg-orange-50/30 transition-colors">
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

      {/* ETA & Rating Row */}
      <div className="flex items-center justify-between mb-1">
        <span className="bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.5 rounded text-[9px] font-bold text-[#FF6A00] flex items-center gap-1 border border-orange-200/50 dark:border-orange-800/40">
          <Clock className="w-2.5 h-2.5 text-[#FF6A00]" />
          {deliveryMins} MINS
        </span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-0.5 font-bold">
          <Star className="w-2.5 h-2.5 text-[#FF6A00] fill-[#FF6A00]" />
          {ratingVal}
        </span>
      </div>

      {/* Title, Weight & Store Badge */}
      <div className="mb-2">
        <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-[#FF6A00] transition-colors min-h-[2rem]">
          {product.name || 'Grocery Item'}
        </h4>
        <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium mt-1 gap-1">
          <span className="truncate">{product.weightUnit || '1 unit'}</span>
          {product.storeName && (
            <span className="text-[9px] font-bold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.5 rounded truncate max-w-[95px]">
              {product.storeName.replace('QuickPal ', '')}
            </span>
          )}
        </div>
      </div>

      {/* Price & Blinkit Orange ADD / Stepper */}
      <div
        className="mt-auto pt-1 flex items-center justify-between gap-1.5"
        onClick={e => e.stopPropagation()}
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
              className="px-2 py-1 hover:bg-[#e05e00] rounded-l-xl transition-colors active:scale-90 cursor-pointer"
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
                if (cartItem.quantity >= (product.stock || 999)) return;
                updateQuantity(product.id, (cartItem.quantity || 0) + 1);
              }}
              className="px-2 py-1 hover:bg-[#e05e00] rounded-r-xl transition-colors active:scale-90 cursor-pointer"
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
            className={`font-black px-3.5 sm:px-4 py-1.5 rounded-xl text-xs transition-all uppercase shadow-xs active:scale-95 cursor-pointer ${
              isOutOfStock
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-700'
                : 'border-2 border-[#FF6A00] text-[#FF6A00] bg-orange-50/70 dark:bg-orange-950/30 hover:bg-[#FF6A00] hover:text-white'
            }`}
          >
            {isOutOfStock ? 'Out' : 'ADD'}
          </button>
        )}
      </div>
    </div>
  );
};

// Horizontal Shelf Component for Home Rows
interface ShelfProps {
  category: Category;
  products: Product[];
  onSelectCategory: (id: string) => void;
  onSelectProduct: (p: Product) => void;
  boughtProductIds: Set<string>;
}

const BlinkitCategoryShelf: React.FC<ShelfProps> = ({
  category,
  products,
  onSelectCategory,
  onSelectProduct,
  boughtProductIds,
}) => {
  const shelfRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (shelfRef.current) {
      shelfRef.current.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="space-y-3 bg-white dark:bg-gray-900/60 p-4 sm:p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xs">
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
            className="text-xs sm:text-sm font-black text-[#FF6A00] hover:text-orange-700 transition-colors uppercase tracking-tight cursor-pointer flex items-center gap-0.5"
          >
            see all <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

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
              isBoughtEarlier={boughtProductIds.has(prod.id)}
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
  onOpenOrders,
}) => {
  const {
    products,
    categories,
    stores,
    selectedStoreId,
    setSelectedStoreId,
    selectedCategoryId,
    setSelectedCategoryId,
    searchQuery,
    setSearchQuery,
    orders,
    cartItems,
    cartCount,
    cartSubtotal,
    selectedAddress,
    paymentSettings,
    deleteAddress,
    isPincodeApproved,
    currentUser
  } = useApp();

  const [superTab, setSuperTab] = useState<SuperCategoryTab>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [dealsOnly, setDealsOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showAddressPickerModal, setShowAddressPickerModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<{ id: string; label: string; addressLine: string } | null>(null);
  const [dismissedOrderId, setDismissedOrderId] = useState<string | null>(null);

  const dashboardContainerRef = useRef<HTMLDivElement>(null);

  // Scroll unified customer container to top cleanly when switching views
  useEffect(() => {
    const scrollRoot = document.getElementById('customer-scroll-root');
    if (scrollRoot) {
      scrollRoot.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (dashboardContainerRef.current) {
      dashboardContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchQuery, selectedCategoryId, selectedStoreId]);

  const activeStores = useMemo(() => stores.filter(s => s.isActive !== false), [stores]);
  const disabledStoreIds = useMemo(
    () => new Set(stores.filter(s => s.isActive === false).map(s => s.id)),
    [stores]
  );

  useEffect(() => {
    if (selectedStoreId && disabledStoreIds.has(selectedStoreId)) {
      setSelectedStoreId(null);
    }
  }, [selectedStoreId, disabledStoreIds, setSelectedStoreId]);

  const selectedStore = useMemo(
    () => activeStores.find(s => s.id === selectedStoreId) || null,
    [activeStores, selectedStoreId]
  );

  // Determine products previously bought by this customer for "Bought Earlier" badges
  const boughtProductIds = useMemo(() => {
    const ids = new Set<string>();
    orders.forEach(order => {
      const isMine =
        (currentUser && (order.customerId === currentUser.id || (currentUser.phone && order.customerPhone === currentUser.phone))) ||
        false;
      if (isMine || order.status === 'delivered') {
        order.items.forEach(item => {
          if (item?.product?.id) ids.add(item.product.id);
        });
      }
    });
    return ids;
  }, [orders, currentUser]);

  // Helper to apply sort & quick filters
  const applySortAndQuickFilters = (list: Product[]) => {
    let res = [...list];
    if (dealsOnly || superTab === 'deals') {
      res = res.filter(p => p.price < p.originalPrice);
    }
    if (inStockOnly) {
      res = res.filter(p => !p.isOutOfStock && (typeof p.stock !== 'number' || p.stock > 0));
    }
    if (sortBy === 'price_asc') {
      res.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      res.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating_desc') {
      res.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'discount_desc') {
      res.sort((a, b) => {
        const discA = a.originalPrice > a.price ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const discB = b.originalPrice > b.price ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return discB - discA;
      });
    }
    return res;
  };

  // Filtered products for Explorer, Store, Search, and Super-Tab Views
  const filteredProducts = useMemo(() => {
    let prods = products.filter(
      prod => !prod.isHidden && (!prod.storeId || !disabledStoreIds.has(prod.storeId))
    );

    if (searchQuery.trim()) {
      prods = filterAndRankProducts(prods, searchQuery, categories);
    } else if (selectedCategoryId) {
      prods = prods.filter(prod => prod.category === selectedCategoryId);
    } else if (superTab !== 'all' && superTab !== 'deals') {
      const allowedCats = SUPER_CATEGORY_MAP[superTab];
      prods = prods.filter(prod => allowedCats.includes(prod.category));
    }

    if (selectedStoreId) {
      prods = prods.filter(prod => (prod.storeId || 'store-saphale-central') === selectedStoreId);
    }

    return applySortAndQuickFilters(prods);
  }, [products, categories, searchQuery, selectedCategoryId, selectedStoreId, superTab, sortBy, dealsOnly, inStockOnly, disabledStoreIds]);

  // Group products by category for Home shelves
  const categorizedProducts = useMemo(() => {
    const map: Record<string, Product[]> = {};
    categories.forEach(cat => {
      let prods = products.filter(
        p => !p.isHidden && p.category === cat.id && (!p.storeId || !disabledStoreIds.has(p.storeId))
      );
      if (selectedStoreId) {
        prods = prods.filter(p => (p.storeId || 'store-saphale-central') === selectedStoreId);
      }
      map[cat.id] = prods;
    });
    return map;
  }, [categories, products, selectedStoreId, disabledStoreIds]);

  // Frequently Bought Groups (Blinkit Video 00:11–00:14)
  const frequentlyBoughtCards = useMemo(() => {
    const visibleProds = products.filter(
      p => !p.isHidden && (!p.storeId || !disabledStoreIds.has(p.storeId))
    );
    const favProds = visibleProds.filter(p => boughtProductIds.has(p.id) || p.isFeatured);
    const drinksProds = visibleProds.filter(p => p.category === 'cat-drinks');
    const candySweetProds = visibleProds.filter(p => p.category === 'cat-candies' || p.category === 'cat-sweets');
    const snacksProds = visibleProds.filter(p => p.category === 'cat-snacks' || p.category === 'cat-bakery');

    return [
      {
        id: 'fav',
        title: 'Favourites',
        subtitle: 'Most ordered items',
        targetCategoryId: categories[0]?.id || 'cat-dairy',
        items: favProds.length > 0 ? favProds : visibleProds.slice(0, 6)
      },
      {
        id: 'drinks',
        title: 'Drinks & Juices',
        subtitle: 'Chilled in 30 mins',
        targetCategoryId: 'cat-drinks',
        items: drinksProds
      },
      {
        id: 'candies',
        title: 'Candies & Sweets',
        subtitle: 'Instant cravings',
        targetCategoryId: 'cat-candies',
        items: candySweetProds
      },
      {
        id: 'snacks',
        title: 'Snacks & Bakery',
        subtitle: 'Tea-time crunch',
        targetCategoryId: 'cat-snacks',
        items: snacksProds
      }
    ].filter(card => card.items.length > 0);
  }, [products, boughtProductIds, categories, disabledStoreIds]);

  // Grouped Category Sections (Blinkit Video 00:15)
  const groceryKitchenIds = ['cat-dairy', 'cat-veg', 'cat-atta', 'cat-masala', 'cat-instant', 'cat-sauces', 'cat-tea', 'cat-cleaning'];
  const snacksDrinksIds = ['cat-snacks', 'cat-drinks', 'cat-candies', 'cat-sweets', 'cat-bakery'];

  const groceryKitchenCats = categories.filter(c => groceryKitchenIds.includes(c.id));
  const snacksDrinksCats = categories.filter(c => snacksDrinksIds.includes(c.id));
  const otherCats = categories.filter(c => !groceryKitchenIds.includes(c.id) && !snacksDrinksIds.includes(c.id));

  // Active trackable order
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

  const isServiceable = isPincodeApproved(selectedAddress.pincode);
  const isSearching = searchQuery.trim().length > 0;
  const isExplorerMode = !isSearching && !!selectedCategoryId;
  const isStoreOrTabFiltered = !isSearching && !selectedCategoryId && (!!selectedStoreId || superTab !== 'all' || dealsOnly || inStockOnly);
  const isHomeView = !isSearching && !isExplorerMode && !isStoreOrTabFiltered;

  // Compute store product counts
  const storeProductCounts = useMemo(() => {
    const map: Record<string, number> = {};
    products
      .filter(p => !p.isHidden)
      .forEach(p => {
        const sid = p.storeId || 'store-saphale-central';
        map[sid] = (map[sid] || 0) + 1;
      });
    return map;
  }, [products]);

  // 1. BLINKIT UNSERVICEABLE AREA SCREEN (Video 00:05–00:10 UX in Orange & White)
  if (!isServiceable) {
    return (
      <div ref={dashboardContainerRef} className="flex-1 bg-white dark:bg-gray-950 p-4 sm:p-8 flex flex-col items-center justify-between pb-24">
        <div className="max-w-lg w-full mx-auto space-y-6 my-auto py-4">
          {/* Location Switcher Pill at Top */}
          <button
            type="button"
            onClick={() => setShowAddressPickerModal(true)}
            className="w-full bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0 text-left">
              <div className="w-9 h-9 rounded-xl bg-[#FF6A00] text-white flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase text-[#FF6A00] block">
                  Selected Delivery Location (Unserviceable)
                </span>
                <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                  {selectedAddress.label} - {selectedAddress.addressLine}, {selectedAddress.area} ({selectedAddress.pincode})
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#FF6A00] shrink-0" />
          </button>

          {/* Store Closed Illustration Card */}
          <div className="bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-950 border-2 border-orange-200 dark:border-orange-900/60 rounded-3xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-24 h-24 rounded-3xl bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 shadow-md mx-auto flex flex-col items-center justify-center relative">
              <StoreIcon className="w-10 h-10 text-[#FF6A00]" />
              <span className="mt-1 bg-[#FF6A00] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                Closed
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Hello! It&apos;s not you, it&apos;s us.
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
                We are not serving PIN <strong className="text-[#FF6A00]">{selectedAddress.pincode}</strong> at the moment.
                QuickPal 30-Min Delivery is currently live across <strong>Saphale East &amp; West (401102)</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2 justify-center">
              <button
                type="button"
                onClick={() => setShowAddressPickerModal(true)}
                className="bg-[#FF6A00] hover:bg-orange-600 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-4 h-4" /> Change Delivery Location
              </button>
              <button
                type="button"
                onClick={() => setShowAddAddressModal(true)}
                className="bg-white hover:bg-orange-50 dark:bg-gray-800 text-[#FF6A00] border-2 border-[#FF6A00] font-black text-xs px-5 py-3 rounded-2xl transition-colors cursor-pointer"
              >
                + Add Saphale (401102) Address
              </button>
            </div>
          </div>

          {/* Blinkit-style Bottom Quick Links */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl divide-y divide-gray-200 dark:divide-gray-800 overflow-hidden text-xs font-bold">
            <button
              type="button"
              onClick={() => onOpenOrders?.()}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-orange-50/70 dark:hover:bg-gray-800 transition-colors cursor-pointer text-left"
            >
              <span className="flex items-center gap-2.5 text-gray-800 dark:text-gray-200">
                <HelpCircle className="w-4 h-4 text-[#FF6A00]" />
                Need help with your previous orders?
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <a
              href={paymentSettings?.whatsappSupportUrl || DEFAULT_WHATSAPP_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-orange-50/70 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="flex items-center gap-2.5 text-gray-800 dark:text-gray-200">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                Request your area on WhatsApp
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </a>

            <a
              href={paymentSettings?.instagramUrl || DEFAULT_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-orange-50/70 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="flex items-center gap-2.5 text-gray-800 dark:text-gray-200">
                <Instagram className="w-4 h-4 text-pink-600" />
                Follow us on Instagram (@quickpal.in)
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </a>
          </div>
        </div>

        <AddressManagementModal
          isOpen={showAddressPickerModal}
          onClose={() => setShowAddressPickerModal(false)}
        />
        <AddAddressModal
          isOpen={showAddAddressModal}
          onClose={() => setShowAddAddressModal(false)}
        />
      </div>
    );
  }

  return (
    <div
      ref={dashboardContainerRef}
      className="flex-1 bg-[#f4f6fb]/50 dark:bg-gray-950 p-3 sm:p-5 space-y-5 pb-32 relative"
    >
      {/* Super-Category Quick Tabs (Blinkit Video 00:02–00:14 Navigation Strip) */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-1.5 border border-orange-100 dark:border-gray-800 shadow-2xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All', emoji: '🛍️' },
          { id: 'fresh', label: 'Fresh & Dairy', emoji: '🥛' },
          { id: 'snacks', label: 'Snacks & Drinks', emoji: '🥤' },
          { id: 'staples', label: 'Kitchen Staples', emoji: '🌾' },
          { id: 'sweets', label: 'Sweets & Candies', emoji: '🍬' },
          { id: 'deals', label: 'Deals & Offers', emoji: '🏷️' },
        ].map(tab => {
          const isActive = superTab === tab.id && !selectedCategoryId;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedCategoryId(null);
                setSuperTab(tab.id as SuperCategoryTab);
                if (tab.id === 'all') {
                  setDealsOnly(false);
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#FF6A00] text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 hover:text-[#FF6A00]'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Prominent Active Search Banner */}
      {isSearching && (
        <div className="bg-white dark:bg-gray-900 border-2 border-[#FF6A00] p-4 sm:p-5 rounded-3xl shadow-md space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 border-2 border-orange-200 text-[#FF6A00] flex items-center justify-center shrink-0 shadow-xs">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase font-black text-gray-500 tracking-wider">Active Search</span>
                  <span className="bg-[#FF6A00] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Found
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white leading-tight">
                  Results for &ldquo;<span className="text-[#FF6A00] underline decoration-orange-300 decoration-2">{searchQuery}</span>&rdquo;
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryId(null);
              }}
              className="w-full sm:w-auto bg-orange-50 hover:bg-orange-100 text-[#FF6A00] font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-orange-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" /> Clear Search
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================
          MODE 1: BLINKIT HOME VIEW
      ========================================================================= */}
      {isHomeView && (
        <div className="space-y-6">
          {/* 1. Hero Banner (Pure Orange & White) */}
          <div className="bg-gradient-to-r from-orange-600 via-[#FF6A00] to-orange-500 text-white rounded-3xl p-5 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-xl border-2 border-white gap-5">
            <div className="z-10 max-w-lg text-left">
              <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                <span className="bg-white text-[#FF6A00] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  ⚡ 30-Min Express Delivery
                </span>
                <span className="bg-orange-700/50 text-white border border-white/30 text-xs font-black px-2.5 py-0.5 rounded-full">
                  Saphale 401102
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-2 tracking-tight">
                Saphale&apos;s Fastest <span className="bg-white text-[#FF6A00] px-2.5 py-0.5 rounded-xl inline-block mt-1">Online Delivery</span>
              </h2>
              <p className="text-xs sm:text-sm text-orange-50 font-medium mb-4 leading-relaxed">
                Fresh groceries, dairy, snacks & local partner store essentials delivered to your doorstep in 30 minutes.
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setSelectedCategoryId(categories[0]?.id || 'cat-dairy')}
                  className="bg-white hover:bg-orange-50 text-[#FF6A00] px-5 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Explore All Categories</span>
                  <ArrowRight className="w-4 h-4 text-[#FF6A00]" />
                </button>
                <button
                  onClick={() => setSuperTab('deals')}
                  className="bg-orange-700/40 hover:bg-orange-700/60 text-white border-2 border-white/40 px-4 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer"
                >
                  🏷️ Today&apos;s Deals
                </button>
              </div>
            </div>

            <div className="relative z-10 shrink-0 w-full sm:w-auto">
              <div className="bg-white text-gray-900 border-2 border-orange-200 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col items-center justify-center text-center max-w-[240px] mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-[#FF6A00] flex items-center justify-center shadow-lg mb-2.5 border-2 border-white">
                  <span className="font-black text-lg text-white tracking-tighter">qp</span>
                </div>
                <span className="text-xs font-black uppercase text-gray-900">QuickPal Express</span>
                <span className="text-xs font-black text-[#FF6A00] mt-0.5">⚡ 30 Mins Guaranteed</span>
                <div className="w-full h-px bg-orange-100 my-2.5" />
                <div className="text-[11px] text-gray-700 space-y-1 font-bold text-left w-full">
                  <p className="flex items-center gap-1.5"><span className="text-[#FF6A00]">✓</span> Free Delivery ₹299+</p>
                  <p className="flex items-center gap-1.5"><span className="text-[#FF6A00]">✓</span> {activeStores.length} Local Partner Stores</p>
                  <p className="flex items-center gap-1.5"><span className="text-[#FF6A00]">✓</span> Code: QUICK50</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. SHOP BY YOUR FAVOURITE STORE (Replaced Dietary & Lifestyle Filter!) */}
          <div className="bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-900/60 p-4 sm:p-5 rounded-3xl shadow-sm space-y-3.5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FF6A00] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white tracking-tight">
                    Shop by Your Favourite Store
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    Pick a trusted Saphale partner store for 30-min doorstep delivery
                  </p>
                </div>
              </div>
              <span className="bg-orange-50 dark:bg-orange-950/50 text-[#FF6A00] border border-orange-200 dark:border-orange-800 text-[11px] font-black px-3 py-1 rounded-full">
                {activeStores.length} Active Stores
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {activeStores.map(store => {
                const count = storeProductCounts[store.id] || 0;
                return (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => {
                      setSelectedStoreId(store.id);
                      setSelectedCategoryId(null);
                    }}
                    className="bg-orange-50/40 dark:bg-gray-800/70 hover:bg-orange-50 dark:hover:bg-gray-800 border-2 border-orange-100 dark:border-gray-700 hover:border-[#FF6A00] rounded-2xl p-3 text-left transition-all flex items-center gap-3 group cursor-pointer shadow-2xs hover:shadow-md"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-900 border border-orange-200 dark:border-gray-700 overflow-hidden shrink-0 flex items-center justify-center">
                      {store.image ? (
                        <img
                          src={store.image}
                          alt={store.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <Store className="w-6 h-6 text-[#FF6A00]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black text-gray-900 dark:text-white truncate group-hover:text-[#FF6A00] transition-colors">
                        {store.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold truncate">
                        {store.categorySpecialty || store.area}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-black">
                        <span className="bg-white dark:bg-gray-900 text-[#FF6A00] px-1.5 py-0.5 rounded border border-orange-200 dark:border-gray-700 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-[#FF6A00]" /> {store.rating || 4.8}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {store.deliveryTimeMins || 30}m • {count} items
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. BLINKIT "FREQUENTLY BOUGHT" COLLAGE CARDS (Video 00:11–00:14) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
                Frequently bought
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCategoryId(categories[0]?.id || 'cat-dairy')}
                className="text-xs font-black text-[#FF6A00] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                See all products <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {frequentlyBoughtCards.map(card => {
                const thumbs = card.items.slice(0, 3);
                const extraCount = Math.max(0, card.items.length - 3);
                return (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCategoryId(card.targetCategoryId)}
                    className="bg-white dark:bg-gray-900 rounded-3xl p-3.5 border border-orange-100 dark:border-gray-800 shadow-2xs hover:shadow-lg hover:border-[#FF6A00] transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="grid grid-cols-2 gap-1.5 bg-orange-50/60 dark:bg-gray-800/60 p-2 rounded-2xl mb-2.5">
                      {thumbs.map(p => (
                        <div
                          key={p.id}
                          className="aspect-square bg-white dark:bg-gray-900 rounded-xl p-1 flex items-center justify-center overflow-hidden border border-orange-100/80 dark:border-gray-700"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ))}
                      <div className="aspect-square bg-orange-100/80 dark:bg-orange-950/50 rounded-xl flex flex-col items-center justify-center text-[#FF6A00] font-black text-xs border border-orange-200 dark:border-orange-900">
                        <span>+{extraCount || card.items.length}</span>
                        <span className="text-[9px] font-bold">more</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white group-hover:text-[#FF6A00] transition-colors">
                        {card.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                        {card.subtitle}
                      </p>
                      <span className="mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-black text-[#FF6A00]">
                        See all products <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. COMPACT OFFERS & DEALS STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => setSuperTab('deals')}
              className="bg-white dark:bg-gray-900 border border-orange-200 dark:border-gray-800 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer hover:border-[#FF6A00] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6A00] flex items-center justify-center font-black shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-gray-900 dark:text-white">Flat ₹50 OFF • QUICK50</p>
                <p className="text-[10px] text-gray-500 font-semibold">Apply at checkout on orders ₹299+</p>
              </div>
            </div>
            <div
              onClick={() => setSelectedCategoryId('cat-dairy')}
              className="bg-white dark:bg-gray-900 border border-orange-200 dark:border-gray-800 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer hover:border-[#FF6A00] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6A00] flex items-center justify-center text-lg shrink-0">
                🥛
              </div>
              <div>
                <p className="text-xs font-black text-gray-900 dark:text-white">Morning Dairy Express</p>
                <p className="text-[10px] text-gray-500 font-semibold">Fresh milk, bread, butter & eggs</p>
              </div>
            </div>
            <div
              onClick={() => setSuperTab('deals')}
              className="bg-white dark:bg-gray-900 border border-orange-200 dark:border-gray-800 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer hover:border-[#FF6A00] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6A00] flex items-center justify-center text-lg shrink-0">
                ⚡
              </div>
              <div>
                <p className="text-xs font-black text-gray-900 dark:text-white">Free Delivery Above ₹299</p>
                <p className="text-[10px] text-gray-500 font-semibold">UPI, GPay, PhonePe & COD available</p>
              </div>
            </div>
          </div>

          {/* 5. GROUPED CATEGORY GRIDS (Video 00:15 - Grocery & Kitchen / Snacks, Drinks & Sweets) */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-6 border border-orange-100 dark:border-gray-800 shadow-2xs space-y-6">
            {/* Group A: Grocery & Kitchen */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                  Grocery &amp; Kitchen
                </h3>
                <button
                  onClick={() => setSelectedCategoryId(groceryKitchenCats[0]?.id || null)}
                  className="text-xs font-black text-[#FF6A00] hover:underline cursor-pointer"
                >
                  Open Category Explorer →
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 sm:gap-3">
                {groceryKitchenCats.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className="rounded-2xl p-2 flex flex-col items-center text-center cursor-pointer transition-all border border-orange-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:bg-orange-50/70 hover:border-[#FF6A00] shadow-2xs group"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-orange-50/70 dark:bg-gray-900 flex items-center justify-center overflow-hidden p-1">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <span className="text-2xl">{cat.iconEmoji}</span>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 dark:text-gray-200 mt-1.5 line-clamp-2 leading-tight">
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Group B: Snacks, Drinks & Sweets */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                Snacks, Drinks &amp; Sweets
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-2.5 sm:gap-3">
                {snacksDrinksCats.concat(otherCats).map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className="rounded-2xl p-2 flex flex-col items-center text-center cursor-pointer transition-all border border-orange-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:bg-orange-50/70 hover:border-[#FF6A00] shadow-2xs group"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-orange-50/70 dark:bg-gray-900 flex items-center justify-center overflow-hidden p-1">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <span className="text-2xl">{cat.iconEmoji}</span>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 dark:text-gray-200 mt-1.5 line-clamp-2 leading-tight">
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6. HORIZONTAL PRODUCT SHELVES BY CATEGORY */}
          <div className="space-y-5">
            {categories.map(cat => (
              <BlinkitCategoryShelf
                key={cat.id}
                category={cat}
                products={categorizedProducts[cat.id] || []}
                onSelectCategory={id => setSelectedCategoryId(id)}
                onSelectProduct={p => setSelectedDetailProduct(p)}
                boughtProductIds={boughtProductIds}
              />
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================
          MODE 2: BLINKIT TWO-PANE CATEGORY EXPLORER (Video 00:17–00:41)
      ========================================================================= */}
      {isExplorerMode && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-orange-100 dark:border-gray-800 shadow-sm flex min-h-[72vh] items-start">
          {/* LEFT VERTICAL CATEGORY RAIL */}
          <aside className="w-20 sm:w-28 md:w-36 shrink-0 border-r border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950/60 overflow-y-auto max-h-[calc(100vh-140px)] sticky top-[66px] sm:top-[72px] py-2 space-y-1 rounded-l-3xl">
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryId(null);
                setSortBy('default');
              }}
              className="w-full px-2 py-2 text-[10px] sm:text-xs font-black text-[#FF6A00] hover:bg-orange-50 flex items-center justify-center gap-1 border-b border-gray-200 dark:border-gray-800 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            {categories.map(cat => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`w-full px-1.5 sm:px-2.5 py-2.5 flex flex-col items-center text-center gap-1 relative transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-50/90 dark:bg-orange-950/40 text-[#FF6A00] font-black'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900 font-semibold'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#FF6A00]" />
                  )}
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center overflow-hidden p-1 border transition-transform ${
                      isSelected
                        ? 'bg-white border-[#FF6A00] scale-105 shadow-xs'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xl">{cat.iconEmoji}</span>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-[11px] line-clamp-2 leading-tight">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </aside>

          {/* RIGHT PRODUCT FEED PANE */}
          <div className="flex-1 min-w-0 p-3 sm:p-5 space-y-4 overflow-y-auto">
            {/* Active Category Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-base sm:text-xl font-black text-gray-900 dark:text-white">
                  {categories.find(c => c.id === selectedCategoryId)?.name || 'Category'}
                </h2>
                <p className="text-[11px] text-gray-500 font-bold">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} • 30-min doorstep delivery
                </p>
              </div>

              {selectedStore && (
                <button
                  type="button"
                  onClick={() => setSelectedStoreId(null)}
                  className="bg-orange-50 text-[#FF6A00] border border-orange-200 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <span>🏪 {selectedStore.name}</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sticky Sort & Quick Filter Bar (Video 00:22–00:36) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <div className="flex items-center gap-1 bg-orange-50 dark:bg-gray-800 border border-orange-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF6A00]" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent text-xs font-black text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
                >
                  <option value="default">Sort: Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Top Rated</option>
                  <option value="discount_desc">Biggest Discount</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setDealsOnly(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border shrink-0 transition-colors cursor-pointer ${
                  dealsOnly
                    ? 'bg-[#FF6A00] text-white border-[#FF6A00]'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#FF6A00]'
                }`}
              >
                🏷️ Deals Only
              </button>

              <button
                type="button"
                onClick={() => setInStockOnly(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border shrink-0 transition-colors cursor-pointer ${
                  inStockOnly
                    ? 'bg-[#FF6A00] text-white border-[#FF6A00]'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#FF6A00]'
                }`}
              >
                ✓ In Stock
              </button>

              {/* Store filter chips inside explorer */}
              {activeStores.map(store => (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => setSelectedStoreId(selectedStoreId === store.id ? null : store.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 transition-colors cursor-pointer ${
                    selectedStoreId === store.id
                      ? 'bg-[#FF6A00] text-white border-[#FF6A00] font-black'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#FF6A00]'
                  }`}
                >
                  🏪 {store.name.replace('QuickPal ', '')}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center space-y-3 border-2 border-dashed border-orange-100 rounded-3xl">
                <p className="text-sm font-black text-gray-800 dark:text-gray-200">
                  No products found with current filters
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStoreId(null);
                    setDealsOnly(false);
                    setInStockOnly(false);
                    setSortBy('default');
                  }}
                  className="bg-[#FF6A00] text-white font-black text-xs px-4 py-2 rounded-xl cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5">
                {filteredProducts.map(prod => (
                  <BlinkitProductCard
                    key={prod.id}
                    product={prod}
                    onSelectProduct={p => setSelectedDetailProduct(p)}
                    isBoughtEarlier={boughtProductIds.has(prod.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================
          MODE 3: SEARCH RESULTS / SELECTED STORE / SUPER-CATEGORY GRID
      ========================================================================= */}
      {(isSearching || isStoreOrTabFiltered) && (
        <div className="space-y-4">
          {/* Selected Store Hero Banner */}
          {selectedStore && !isSearching && (
            <div className="bg-white dark:bg-gray-900 border-2 border-[#FF6A00] rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {selectedStore.image ? (
                    <img
                      src={selectedStore.image}
                      alt={selectedStore.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-7 h-7 text-[#FF6A00]" />
                  )}
                </div>
                <div>
                  <span className="bg-[#FF6A00] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    Partner Store
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mt-0.5">
                    {selectedStore.name}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                    {selectedStore.area} • {selectedStore.deliveryTimeMins || 30} mins delivery • ★ {selectedStore.rating || 4.8}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStoreId(null)}
                className="bg-orange-50 hover:bg-orange-100 text-[#FF6A00] border border-orange-200 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
              >
                <ArrowLeft className="w-4 h-4" /> All Stores &amp; Home
              </button>
            </div>
          )}

          {/* Filter / Sort Strip */}
          <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
                {isSearching
                  ? `Showing ${filteredProducts.length} matches for "${searchQuery}"`
                  : selectedStore
                  ? `${selectedStore.name} Products (${filteredProducts.length})`
                  : `${superTab === 'deals' ? 'Deals & Offers' : 'Filtered Catalog'} (${filteredProducts.length})`}
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="bg-orange-50 dark:bg-gray-800 border border-orange-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs font-black text-gray-800 dark:text-gray-200 cursor-pointer"
              >
                <option value="default">Sort: Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Top Rated</option>
                <option value="discount_desc">Biggest Discount</option>
              </select>

              {(isSearching || selectedStoreId || superTab !== 'all' || dealsOnly || inStockOnly) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStoreId(null);
                    setSelectedCategoryId(null);
                    setSuperTab('all');
                    setDealsOnly(false);
                    setInStockOnly(false);
                    setSortBy('default');
                  }}
                  className="bg-orange-50 hover:bg-orange-100 text-[#FF6A00] border border-orange-200 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-10 text-center border-2 border-orange-100 dark:border-gray-800 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF6A00] flex items-center justify-center text-2xl mx-auto">
                🔍
              </div>
              <h4 className="text-base font-black text-gray-900 dark:text-white">
                No products matched your selection
              </h4>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStoreId(null);
                  setSelectedCategoryId(null);
                  setSuperTab('all');
                  setDealsOnly(false);
                  setInStockOnly(false);
                }}
                className="bg-[#FF6A00] text-white font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Back to Home Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredProducts.map(prod => (
                <BlinkitProductCard
                  key={prod.id}
                  product={prod}
                  onSelectProduct={p => setSelectedDetailProduct(p)}
                  isBoughtEarlier={boughtProductIds.has(prod.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Info & Useful Links */}
      <footer className="mt-10 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100">
              Partner Stores
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 font-medium">
              {activeStores.map(st => (
                <li key={st.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStoreId(st.id);
                      setSelectedCategoryId(null);
                    }}
                    className="hover:text-[#FF6A00] cursor-pointer text-left"
                  >
                    🏪 {st.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100">
              Categories
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
              {categories.slice(0, 15).map(cat => (
                <span
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className="hover:text-[#FF6A00] cursor-pointer truncate"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100">
              24/7 Customer Support
            </h4>
            <a
              href={paymentSettings?.whatsappSupportUrl || DEFAULT_WHATSAPP_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
            <button
              onClick={() => setShowEmailModal(true)}
              className="w-full bg-[#FF6A00] hover:bg-orange-600 text-white text-xs font-black px-4 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Email Support</span>
            </button>
            <button
              onClick={() => setShowEmailModal(true)}
              className="font-mono text-[11px] font-black text-[#FF6A00] hover:underline block cursor-pointer"
            >
              {paymentSettings?.customerCareEmail || DEFAULT_CUSTOMER_CARE_EMAIL}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <p>© 2026 QuickPal Commerce Pvt Ltd. Saphale&apos;s 30-Minute Grocery Delivery (PIN 401102).</p>
          <span className="font-bold text-emerald-600 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> 100% Fresh &amp; Authentic Guarantee
          </span>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {selectedDetailProduct && (
        <ProductDetailModal
          product={selectedDetailProduct}
          onClose={() => setSelectedDetailProduct(null)}
        />
      )}

      {/* BLINKIT FLOATING CENTERED "VIEW CART" PILL (Video 00:45–00:50 UX in Pure Orange) */}
      {cartCount > 0 && (
        <div
          className={`fixed left-1/2 -translate-x-1/2 z-40 transition-all ${
            activeOrder ? 'bottom-28' : 'bottom-16 sm:bottom-20'
          }`}
        >
          <button
            type="button"
            onClick={onOpenCheckout}
            className="bg-[#FF6A00] hover:bg-orange-600 text-white rounded-full pl-2 pr-4 py-2 shadow-2xl border-2 border-white flex items-center gap-3 cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
          >
            {/* Stacked circular item thumbnails */}
            <div className="flex -space-x-2">
              {cartItems.slice(0, 3).map(item => (
                <div
                  key={item.product.id}
                  className="w-8 h-8 rounded-full bg-white border-2 border-[#FF6A00] overflow-hidden p-0.5 flex items-center justify-center shrink-0"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>

            <div className="text-left leading-tight">
              <p className="text-xs font-black tracking-tight">View cart</p>
              <p className="text-[10px] font-bold text-orange-100">
                {cartCount} {cartCount === 1 ? 'item' : 'items'} • ₹{cartSubtotal}
              </p>
            </div>

            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>
      )}

      {/* Floating Support Triggers (WhatsApp + AI Support) */}
      <div className="fixed bottom-16 right-4 sm:right-6 z-30 flex flex-col sm:flex-row items-end sm:items-center gap-2">
        <a
          href={paymentSettings?.whatsappSupportUrl || DEFAULT_WHATSAPP_SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full p-2.5 shadow-xl border-2 border-white flex items-center gap-1.5 transition-all hover:scale-105"
          title="Chat with QuickPal Support on WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs font-black pr-1 hidden lg:inline">WhatsApp</span>
        </a>

        {onOpenAiAssistant && (
          <button
            onClick={onOpenAiAssistant}
            className="bg-[#FF6A00] hover:bg-orange-600 text-white rounded-full p-2.5 shadow-xl border-2 border-white flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
            title="Ask QuickPal AI Assistant"
          >
            <span className="text-sm">🤖</span>
            <span className="text-xs font-black pr-1 hidden lg:inline">AI Help</span>
          </button>
        )}
      </div>

      {/* Floating Active Order Live Tracking Pill */}
      {activeOrder && (
        <div className="fixed bottom-14 sm:bottom-16 left-1/2 -translate-x-1/2 z-40 bg-gray-900/95 backdrop-blur-md text-white rounded-2xl px-4 py-2.5 shadow-2xl border-2 border-[#FF6A00] flex items-center gap-3 max-w-md w-[92vw]">
          <div className="relative flex items-center justify-center shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute animate-ping opacity-75" />
          </div>
          <div className="flex-1 text-left cursor-pointer min-w-0" onClick={() => onTrackOrder(activeOrder.id)}>
            <p className="text-xs font-black text-orange-400 truncate">
              Order #{activeOrder.id} arriving in {activeOrder.deliveryTimeMins} mins
            </p>
            <p className="text-[10px] text-gray-300 font-semibold capitalize truncate">
              Status: <span className="text-emerald-400 font-bold">{activeOrder.status.replace('_', ' ')}</span>
            </p>
          </div>
          <button
            onClick={() => onTrackOrder(activeOrder.id)}
            className="bg-[#FF6A00] hover:bg-orange-600 text-white font-black text-xs px-3 py-1.5 rounded-xl shrink-0 cursor-pointer"
          >
            Track ➔
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              setDismissedOrderId(activeOrder.id);
            }}
            className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer"
            aria-label="Dismiss tracking pill"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modals */}
      <AddressManagementModal
        isOpen={showAddressPickerModal}
        onClose={() => setShowAddressPickerModal(false)}
      />
      <AddAddressModal
        isOpen={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
      />
      <EmailSupportModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />

      {addressToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs font-bold border border-rose-200">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100">
                Remove Saved Address?
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold">
              Remove <span className="text-[#FF6A00] font-black">'{addressToDelete.label}'</span> ({addressToDelete.addressLine})?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddressToDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAddress(addressToDelete.id);
                  setAddressToDelete(null);
                }}
                className="bg-rose-600 text-white font-black px-4 py-2 rounded-xl flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
