import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Order, Product } from '../types';
import { printOrderReceipt } from '../utils/printReceipt';
import { orderAlertSound } from '../utils/orderAlertSound';
import {
  Store,
  CheckCircle2,
  Package,
  Clock,
  Bike,
  CheckCircle,
  Printer,
  Volume2,
  VolumeX,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  TrendingUp,
  ShoppingBag,
  MapPin,
  Phone,
  X,
  Upload
} from 'lucide-react';

export const StoreStaffDashboard: React.FC = () => {
  const {
    currentUser,
    stores,
    orders,
    products,
    categories,
    storeAcceptOrder,
    addProduct,
    updateProduct,
    updateProductStock,
    deleteProduct,
    toggleOutOfStock,
    toggleHideProduct
  } = useApp();

  const isStoreOwnerAccount = currentUser?.role === 'store';
  const [selectedAdminPreviewStoreId, setSelectedAdminPreviewStoreId] = useState<string>(
    currentUser?.storeId || stores[0]?.id || 'store-saphale-central'
  );

  const activeStore = useMemo(() => {
    if (isStoreOwnerAccount) {
      const cleanUsername = currentUser?.username?.trim().toLowerCase();
      const cleanEmail = currentUser?.email?.trim().toLowerCase();
      return (
        stores.find(
          s =>
            (currentUser?.storeId && s.id === currentUser.storeId) ||
            (cleanUsername && s.loginId?.toLowerCase() === cleanUsername) ||
            (cleanEmail && s.ownerEmail?.toLowerCase() === cleanEmail)
        ) || null
      );
    }
    return stores.find(s => s.id === selectedAdminPreviewStoreId) || stores[0] || null;
  }, [isStoreOwnerAccount, currentUser, stores, selectedAdminPreviewStoreId]);

  const activeStoreId = activeStore?.id || '';

  const [activeTab, setActiveTab] = useState<'sales' | 'orders' | 'products'>('sales');
  const [ordersSubTab, setOrdersSubTab] = useState<'pending' | 'accepted' | 'history'>('pending');
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(!orderAlertSound.isSoundActive());

  // Products Filter & Modal State
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [productForm, setProductForm] = useState({
    name: '',
    category: categories[0]?.id || 'cat-veg',
    price: 40,
    originalPrice: 50,
    weightUnit: '500 g',
    imageEmoji: '📦',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
    ] as string[],
    stock: 50,
    description: '',
    deliveryTimeMins: activeStore?.deliveryTimeMins || 25,
    isFeatured: false
  });

  const isProductInActiveStore = (prod?: Product | null): boolean => {
    if (!prod || !activeStoreId) return false;
    if (prod.storeId) return prod.storeId === activeStoreId;
    return activeStoreId === 'store-saphale-central';
  };

  // Scope products strictly to THIS store
  const storeProducts = useMemo(() => {
    if (!activeStoreId) return [];
    return products.filter(p => isProductInActiveStore(p));
  }, [products, activeStoreId]);

  // Scope items inside an order strictly to THIS store
  const getStoreItemsForOrder = (ord: Order) => {
    if (!activeStoreId) return [];
    const matchingItems = (ord.items || []).filter(item => isProductInActiveStore(item?.product));
    if (matchingItems.length > 0) return matchingItems;
    // Fallback only if order was explicitly assigned to this store and items lack storeId
    if (ord.storeInfo?.id === activeStoreId && !(ord.items || []).some(i => i?.product?.storeId)) {
      return ord.items || [];
    }
    return [];
  };

  // Scope orders strictly to orders containing items from THIS store or assigned to THIS store
  const storeOrders = useMemo(() => {
    if (!activeStoreId) return [];
    return orders.filter(ord => {
      if (getStoreItemsForOrder(ord).length > 0) return true;
      if (ord.storeInfo?.id === activeStoreId) return true;
      return false;
    });
  }, [orders, activeStoreId]);

  // Calculate THIS Store's item-level revenue ONLY (never overall QuickPal company profit)
  const getOrderStoreRevenue = (ord: Order): number => {
    if (ord.status === 'cancelled' || ord.status === 'rejected') return 0;
    const storeItems = getStoreItemsForOrder(ord);
    if (storeItems.length === 0) {
      return ord.storeInfo?.id === activeStoreId ? (ord.subtotal || ord.total || 0) : 0;
    }
    return storeItems.reduce((sum, item) => sum + ((item.product?.price || 0) * (item.quantity || 1)), 0);
  };

  const getStoreScopedOrderForReceipt = (ord: Order): Order => {
    const storeItems = getStoreItemsForOrder(ord);
    const storeSubtotal = getOrderStoreRevenue(ord);
    return {
      ...ord,
      items: storeItems,
      subtotal: storeSubtotal,
      total: storeSubtotal,
      deliveryFee: 0,
      handlingFee: 0,
      discount: 0,
      storeInfo: activeStore || ord.storeInfo
    };
  };

  const storeTotalSales = useMemo(() => {
    return storeOrders.reduce((acc, ord) => acc + getOrderStoreRevenue(ord), 0);
  }, [storeOrders, activeStoreId]);

  const storeDeliveredOrders = storeOrders.filter(o => (o.status || '').toLowerCase() === 'delivered');
  const storeUnitsSold = useMemo(() => {
    return storeOrders.reduce((totalUnits, ord) => {
      if (ord.status === 'cancelled' || ord.status === 'rejected') return totalUnits;
      const matchingItems = getStoreItemsForOrder(ord);
      return totalUnits + matchingItems.reduce((s, i) => s + (i.quantity || 0), 0);
    }, 0);
  }, [storeOrders, activeStoreId]);

  const topSellingStoreProducts = useMemo(() => {
    const map = new Map<string, { name: string; image: string; qty: number; revenue: number }>();
    storeOrders.forEach(ord => {
      if (ord.status === 'cancelled' || ord.status === 'rejected') return;
      getStoreItemsForOrder(ord).forEach(item => {
        if (!item?.product) return;
        const prev = map.get(item.product.id) || {
          name: item.product.name,
          image: item.product.image,
          qty: 0,
          revenue: 0
        };
        prev.qty += item.quantity || 1;
        prev.revenue += (item.product.price || 0) * (item.quantity || 1);
        map.set(item.product.id, prev);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  }, [storeOrders, activeStoreId]);

  const pendingOrders = storeOrders.filter(o => {
    const s = (o?.status || 'placed').toLowerCase().trim();
    const isConfirmedPayment = o?.paymentMethod === 'cod' || o?.paymentStatus === 'paid';
    return (s === 'placed' || s === 'pending' || !s) && isConfirmedPayment;
  });

  const activeAcceptedOrders = storeOrders.filter(o => {
    const s = (o?.status || '').toLowerCase().trim();
    return s === 'store_accepted' || s === 'partner_accepted' || s === 'accepted' || s === 'picked_up' || s === 'out_for_delivery' || s === 'ready_for_delivery' || s === 'processing';
  });

  const historyOrders = storeOrders.filter(o => {
    const s = (o?.status || '').toLowerCase().trim();
    return s === 'delivered' || s === 'cancelled' || s === 'rejected';
  });

  useEffect(() => {
    if (pendingOrders.length > 0 && !isSoundMuted) {
      orderAlertSound.playNotificationBell();
    }
  }, [pendingOrders.length, isSoundMuted]);

  const handleToggleSound = () => {
    const nextState = orderAlertSound.toggleSound();
    setIsSoundMuted(!nextState);
  };

  const formatLoc = (loc: any, fallback = 'Saphale Hub') => {
    if (!loc) return fallback;
    if (typeof loc === 'object') {
      if (typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
        return `GPS: ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`;
      }
      return fallback;
    }
    return String(loc);
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: categories[0]?.id || 'cat-veg',
      price: 40,
      originalPrice: 50,
      weightUnit: '500 g',
      imageEmoji: '📦',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
      ],
      stock: 50,
      description: '',
      deliveryTimeMins: activeStore?.deliveryTimeMins || 25,
      isFeatured: false
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    const pImages = p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : [];
    setProductForm({
      name: p.name,
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice,
      weightUnit: p.weightUnit,
      imageEmoji: p.imageEmoji || '📦',
      image: p.image || pImages[0] || '',
      images: pImages,
      stock: p.stock,
      description: p.description || '',
      deliveryTimeMins: p.deliveryTimeMins || 25,
      isFeatured: !!p.isFeatured
    });
    setShowProductModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        setProductForm(prev => {
          const updatedImages = [...(prev.images || []), resultStr];
          return {
            ...prev,
            image: prev.image || resultStr,
            images: updatedImages
          };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrlInput.trim()) return;
    const url = newImageUrlInput.trim();
    setProductForm(prev => {
      const updatedImages = [...(prev.images || []), url];
      return {
        ...prev,
        image: prev.image || url,
        images: updatedImages
      };
    });
    setNewImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setProductForm(prev => {
      const updatedImages = (prev.images || []).filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        image: updatedImages[0] || '',
        images: updatedImages
      };
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImage = productForm.image || (productForm.images && productForm.images[0]) || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
    const finalImages = productForm.images && productForm.images.length > 0 ? productForm.images : [finalImage];
    const pPrice = Number(productForm.price) || 0;
    const pOrigPrice = Number(productForm.originalPrice) || pPrice;
    const pStock = Number(productForm.stock) || 0;
    const pDelivery = Number(productForm.deliveryTimeMins) || 25;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...productForm,
        price: pPrice,
        originalPrice: pOrigPrice,
        stock: pStock,
        deliveryTimeMins: pDelivery,
        image: finalImage,
        images: finalImages,
        isOutOfStock: pStock <= 0,
        storeId: activeStoreId,
        storeName: activeStore?.name || 'QuickPal Partner Store'
      });
    } else {
      addProduct({
        ...productForm,
        price: pPrice,
        originalPrice: pOrigPrice,
        stock: pStock,
        deliveryTimeMins: pDelivery,
        image: finalImage,
        images: finalImages,
        isOutOfStock: pStock <= 0,
        isHidden: false,
        rating: 4.9,
        reviewsCount: 1,
        storeId: activeStoreId,
        storeName: activeStore?.name || 'QuickPal Partner Store'
      });
    }
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const filteredStoreProducts = storeProducts.filter(prod => {
    const matchesSearch = !productSearch.trim() ||
      prod.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      prod.weightUnit.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productCategoryFilter === 'all' || prod.category === productCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const outOfStockCount = storeProducts.filter(p => p.isOutOfStock || p.stock <= 0).length;

  // Strict Store Isolation Guards for logged-in Store Owners
  if (isStoreOwnerAccount && !activeStore) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-6 border border-rose-200 dark:border-rose-900 text-center space-y-3 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-gray-900 dark:text-gray-100">Store Profile Not Assigned</h3>
          <p className="text-xs text-gray-500">
            Your login account is not linked to an active partner store. Please contact QuickPal Admin to verify your Store ID.
          </p>
        </div>
      </div>
    );
  }

  if (isStoreOwnerAccount && activeStore && activeStore.isActive === false) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-6 border border-rose-300 dark:border-rose-900 text-center space-y-3 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-gray-900 dark:text-gray-100">
            Store Currently Disabled by Admin
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong>{activeStore.name}</strong> has been temporarily disabled by QuickPal Admin. Once re-enabled, your store catalog and orders will be accessible again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 space-y-6 pb-24">
      {/* Store Owner Top Header Banner */}
      <div className="bg-gradient-to-r from-[#FF6A00] via-orange-600 to-orange-700 text-white p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-orange-400/30">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-white text-[#FF6A00] text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Store className="w-3 h-3" />
              Store Owner Dashboard
            </span>
            {activeStore?.loginId && (
              <span className="bg-white/15 text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border border-white/25">
                ID: {activeStore.loginId}
              </span>
            )}
            <span className="bg-emerald-500/25 text-emerald-100 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-emerald-300/30">
              {activeStore?.isActive !== false ? 'Store Online' : 'Store Offline'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {activeStore?.name || 'QuickPal Store'}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-orange-100 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {activeStore?.address || 'Saphale 401102'}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              {activeStore?.contactPhone || '+91 98234 56789'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Admin/Owner preview selector if an Admin or QuickPal Owner is inspecting stores */}
          {!isStoreOwnerAccount && stores.length > 1 && (
            <select
              value={activeStoreId}
              onChange={e => setSelectedAdminPreviewStoreId(e.target.value)}
              className="bg-white text-gray-900 rounded-2xl px-3 py-2 text-xs font-black border-2 border-white shadow-md cursor-pointer"
              title="Switch Store View"
            >
              {stores.map(st => (
                <option key={st.id} value={st.id}>
                  🏪 {st.name}
                </option>
              ))}
            </select>
          )}

          {/* Sound Toggle */}
          <div className="flex items-center gap-1 bg-black/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
            <button
              onClick={handleToggleSound}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                !isSoundMuted ? 'bg-white text-[#FF6A00]' : 'text-orange-100'
              }`}
            >
              {!isSoundMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-[10px] font-black uppercase hidden sm:inline">
                {!isSoundMuted ? 'Alert ON' : 'Muted'}
              </span>
            </button>
          </div>

          <button
            onClick={handleOpenAddProduct}
            className="bg-white hover:bg-orange-50 text-[#FF6A00] font-black text-xs px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Store-Only KPIs (Strictly scoped to THIS store — NO overall QuickPal profit shown) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-orange-100 dark:border-gray-800 shadow-sm">
          <span className="text-[10px] font-black uppercase text-gray-400 block">My Store Total Sales</span>
          <p className="text-2xl font-black text-[#FF6A00] mt-1">₹{storeTotalSales.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-gray-500 font-medium">{storeUnitsSold} items sold across {storeOrders.length} orders</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-orange-100 dark:border-gray-800 shadow-sm">
          <span className="text-[10px] font-black uppercase text-gray-400 block">Completed Orders</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{storeDeliveredOrders.length}</p>
          <span className="text-[10px] text-gray-500 font-medium">Successfully delivered</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-orange-100 dark:border-gray-800 shadow-sm">
          <span className="text-[10px] font-black uppercase text-gray-400 block">Pending Stock Check</span>
          <p className="text-2xl font-black text-amber-500 mt-1">{pendingOrders.length}</p>
          <span className="text-[10px] text-gray-500 font-medium">Awaiting acceptance</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-orange-100 dark:border-gray-800 shadow-sm">
          <span className="text-[10px] font-black uppercase text-gray-400 block">My Store Catalog</span>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{storeProducts.length}</p>
          <span className="text-[10px] text-rose-500 font-bold">{outOfStockCount} out of stock</span>
        </div>
      </div>

      {/* Store Owner Navigation Tabs */}
      <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-2xl gap-1 overflow-x-auto max-w-2xl">
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'sales'
              ? 'bg-white dark:bg-gray-700 text-[#FF6A00] shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Store Sales & Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-white dark:bg-gray-700 text-[#FF6A00] shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Store Orders ({pendingOrders.length} New)</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'products'
              ? 'bg-white dark:bg-gray-700 text-[#FF6A00] shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Products ({storeProducts.length})</span>
        </button>
      </div>

      {/* TAB 1: Store Sales & Overview */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* My Store Details Card (Strictly THIS store's profile & details only) */}
          {activeStore && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-orange-200/80 dark:border-gray-800 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={activeStore.image || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=400&q=80'}
                    alt={activeStore.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-orange-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-gray-900 dark:text-gray-100 truncate">
                        My Store Details — {activeStore.name}
                      </h3>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        activeStore.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {activeStore.isActive !== false ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-[#FF6A00] font-bold truncate mt-0.5">
                      {activeStore.categorySpecialty || 'Local Store Essentials'}
                    </p>
                  </div>
                </div>
                <div className="text-xs font-mono font-bold bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 px-3 py-2 rounded-xl text-gray-800 dark:text-gray-200 shrink-0">
                  Store ID: <span className="text-[#FF6A00]">{activeStore.loginId || activeStore.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-gray-400 block">Store Owner</span>
                  <p className="font-bold text-gray-900 dark:text-gray-100 mt-0.5 truncate">{activeStore.ownerName || 'Owner'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-gray-400 block">Area & PIN</span>
                  <p className="font-bold text-gray-900 dark:text-gray-100 mt-0.5 truncate">{activeStore.area} ({activeStore.pincode})</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-gray-400 block">Contact Phone</span>
                  <p className="font-bold text-gray-900 dark:text-gray-100 mt-0.5 truncate">{activeStore.contactPhone}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-gray-400 block">Dispatch ETA</span>
                  <p className="font-bold text-[#FF6A00] mt-0.5">{activeStore.deliveryTimeMins || 25} mins</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-3 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#FF6A00] shrink-0" />
                {activeStore.address}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Selling Products in THIS store */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">
                    Top Selling Items — {activeStore?.name}
                  </h3>
                  <p className="text-xs text-gray-500">Product-wise sales breakdown for your store only</p>
                </div>
                <button
                  onClick={() => setActiveTab('products')}
                  className="text-xs font-black text-[#FF6A00] hover:underline"
                >
                  Manage Inventory →
                </button>
              </div>

              {topSellingStoreProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 font-bold">
                  No sales recorded for this store yet. Add products or accept incoming orders!
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {topSellingStoreProducts.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-orange-50 text-[#FF6A00] font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-contain bg-gray-50 p-1 border border-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                          <p className="text-[11px] text-gray-500">{item.qty} units sold</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-[#FF6A00] shrink-0">₹{item.revenue}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Store Orders Summary (Store items only) */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">
                    Recent Store Orders
                  </h3>
                  <p className="text-xs text-gray-500">Live sales activity for your store items only</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-black text-[#FF6A00] hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              {storeOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 font-bold">
                  No orders placed for your store yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {storeOrders.slice(0, 6).map(ord => {
                    const storeItems = getStoreItemsForOrder(ord);
                    return (
                      <div key={ord.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-black text-gray-900 dark:text-gray-100">
                            Order #{ord.id} · {ord.customerName}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {storeItems.length} store item(s) · {new Date(ord.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-[#FF6A00]">₹{getOrderStoreRevenue(ord)}</p>
                          <span className={`text-[10px] font-black uppercase ${
                            ord.status === 'delivered' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {ord.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Store Orders Management */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm gap-2 max-w-xl">
            <button
              onClick={() => setOrdersSubTab('pending')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                ordersSubTab === 'pending' ? 'bg-[#FF6A00] text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending ({pendingOrders.length})</span>
            </button>
            <button
              onClick={() => setOrdersSubTab('accepted')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                ordersSubTab === 'accepted' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>In Progress ({activeAcceptedOrders.length})</span>
            </button>
            <button
              onClick={() => setOrdersSubTab('history')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                ordersSubTab === 'history' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Completed ({historyOrders.length})</span>
            </button>
          </div>

          {ordersSubTab === 'pending' && (
            <div className="space-y-4">
              {pendingOrders.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-10 text-center border border-gray-200 dark:border-gray-800 space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">All Store Orders Verified</h3>
                  <p className="text-xs text-gray-500">New orders for {activeStore?.name} will appear here immediately.</p>
                </div>
              ) : (
                pendingOrders.map(ord => {
                  const storeItems = getStoreItemsForOrder(ord);
                  return (
                  <div key={ord.id} className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-orange-300 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-100 text-[#FF6A00] font-black text-[10px] px-2.5 py-1 rounded-lg uppercase">
                          Stock Check Required
                        </span>
                        <span className="text-sm font-black text-gray-900 dark:text-gray-100">Order #{ord.id}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-[#FF6A00]">
                          Store Sale: ₹{getOrderStoreRevenue(ord)}
                        </span>
                        <p className="text-[10px] text-gray-400">{new Date(ord.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <span className="font-black text-gray-400 uppercase text-[10px] block">Customer</span>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{ord.customerName}</p>
                        <p className="text-gray-500 text-[11px]">{ord.customerPhone}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <span className="font-black text-gray-400 uppercase text-[10px] block">Delivery Location</span>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{formatLoc(ord.deliveryLocation, ord.address?.addressLine)}</p>
                        <p className="text-gray-500 text-[11px]">Pin: {ord.address?.pincode || ord.deliveryPincode || '401102'}</p>
                      </div>
                    </div>

                    <div className="bg-orange-50/70 dark:bg-orange-950/30 p-3.5 rounded-2xl border border-orange-200 space-y-2 text-xs">
                      <span className="font-black text-orange-900 dark:text-orange-200 text-[11px] uppercase block">
                        Your Store Requested Items ({storeItems.length})
                      </span>
                      <div className="divide-y divide-orange-200/50">
                        {storeItems.map((item, idx) => (
                          <div key={idx} className="py-1.5 flex items-center justify-between">
                            <span className="font-bold">
                              {item.quantity}x {item.product?.name} ({item.product?.weightUnit})
                            </span>
                            <span className="font-black">₹{(item.product?.price || 0) * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => printOrderReceipt(getStoreScopedOrderForReceipt(ord))}
                        className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Printer className="w-4 h-4 text-[#FF6A00]" /> Print Store Receipt
                      </button>
                      <button
                        onClick={() => {
                          orderAlertSound.unlockAudio();
                          orderAlertSound.playOrderAcceptedSound();
                          storeAcceptOrder(ord.id);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-2.5 rounded-2xl text-xs shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Accept & Confirm Stock
                      </button>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          )}

          {ordersSubTab === 'accepted' && (
            <div className="space-y-3">
              {activeAcceptedOrders.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-10 text-center text-xs font-bold text-gray-500 border border-gray-200 dark:border-gray-800">
                  No orders currently in delivery transit.
                </div>
              ) : (
                activeAcceptedOrders.map(ord => {
                  const storeItems = getStoreItemsForOrder(ord);
                  return (
                  <div key={ord.id} className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-blue-200 dark:border-blue-900/50 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-blue-600">#{ord.id}</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-black uppercase text-[10px]">
                          {ord.status.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="font-black text-[#FF6A00]">Store Sale: ₹{getOrderStoreRevenue(ord)}</span>
                    </div>
                    {storeItems.length > 0 && (
                      <div className="text-[11px] text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-xl">
                        {storeItems.map((i, idx) => (
                          <span key={idx}>
                            {idx > 0 ? ', ' : ''}
                            <strong>{i.quantity}x</strong> {i.product?.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Bike className="w-4 h-4 text-[#FF6A00]" />
                        <span className="font-bold">
                          {ord.deliveryPartnerName ? `Rider: ${ord.deliveryPartnerName}` : 'Broadcasted to nearby riders...'}
                        </span>
                      </div>
                      <button
                        onClick={() => printOrderReceipt(getStoreScopedOrderForReceipt(ord))}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-[#FF6A00]"
                        title="Print Store Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          )}

          {ordersSubTab === 'history' && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-200 dark:border-gray-800 space-y-3">
              {historyOrders.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No completed orders yet for this store.</p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {historyOrders.map(ord => {
                    const storeItems = getStoreItemsForOrder(ord);
                    return (
                    <div key={ord.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-black">#{ord.id}</span>
                        <span className="ml-2 text-gray-500">{ord.customerName}</span>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {storeItems.map(i => `${i.quantity}x ${i.product?.name}`).join(', ') || `${storeItems.length} store item(s)`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-black text-[#FF6A00]">₹{getOrderStoreRevenue(ord)}</span>
                        <span className="text-[10px] font-black uppercase text-emerald-600">{ord.status}</span>
                        <button
                          onClick={() => printOrderReceipt(getStoreScopedOrderForReceipt(ord))}
                          className="p-1 text-gray-400 hover:text-[#FF6A00]"
                          title="Print Store Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Store Products Catalog (+ Add Product) */}
      {activeTab === 'products' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100">
                {activeStore?.name} — Product Inventory ({storeProducts.length})
              </h3>
              <p className="text-xs text-gray-500">
                Add new products, update prices/stock, or toggle availability directly for your store.
              </p>
            </div>
            <button
              onClick={handleOpenAddProduct}
              className="bg-[#FF6A00] hover:bg-orange-600 text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Add New Product
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="Search your store products..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold"
              />
            </div>
            <select
              value={productCategoryFilter}
              onChange={e => setProductCategoryFilter(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-black">
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Price / MRP</th>
                  <th className="py-2.5 px-3">Stock</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredStoreProducts.map(prod => (
                  <tr key={prod.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 rounded-xl object-contain bg-gray-50 p-1 border border-gray-100 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-gray-900 dark:text-gray-100">{prod.name}</p>
                          <p className="text-[10px] text-gray-500">{prod.weightUnit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-black text-[#FF6A00]">
                      ₹{prod.price}{' '}
                      {prod.originalPrice > prod.price && (
                        <span className="text-[10px] text-gray-400 line-through font-normal">₹{prod.originalPrice}</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateProductStock(prod.id, Math.max(0, prod.stock - 5))}
                          className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-black hover:bg-orange-100"
                        >
                          -5
                        </button>
                        <span className="font-mono font-black w-8 text-center">{prod.stock}</span>
                        <button
                          onClick={() => updateProductStock(prod.id, prod.stock + 10)}
                          className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-black hover:bg-orange-100"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => toggleOutOfStock(prod.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer ${
                          prod.isOutOfStock || prod.stock <= 0
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {prod.isOutOfStock || prod.stock <= 0 ? 'Out of Stock' : 'In Stock'}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="p-1.5 rounded-lg bg-orange-50 text-[#FF6A00] hover:bg-orange-100"
                        title="Edit Product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleHideProduct(prod.id)}
                        className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                        title={prod.isHidden ? 'Show Product' : 'Hide Product'}
                      >
                        {prod.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${prod.name}" from your store catalog?`)) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Store Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4 text-xs font-bold max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-gray-100">
                  {editingProduct ? 'Edit Store Product' : 'Add Product to Your Store'}
                </h3>
                <p className="text-[11px] text-[#FF6A00] font-bold">{activeStore?.name}</p>
              </div>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-[10px] font-black uppercase text-gray-500">Product Name *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Amul Fresh Paneer"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-black uppercase text-gray-500">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block mb-1 text-[10px] font-black uppercase text-gray-500">Selling Price (₹) *</label>
                  <input
                    type="number"
                    min={1}
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-black uppercase text-gray-500">MRP (₹)</label>
                  <input
                    type="number"
                    min={1}
                    value={productForm.originalPrice}
                    onChange={e => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-black uppercase text-gray-500">Stock Qty *</label>
                  <input
                    type="number"
                    min={0}
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-[10px] font-black uppercase text-gray-500">Pack / Weight Unit</label>
                  <input
                    type="text"
                    value={productForm.weightUnit}
                    onChange={e => setProductForm({ ...productForm, weightUnit: e.target.value })}
                    placeholder="e.g. 500 g / 1 L"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-black uppercase text-gray-500">Prep / ETA (mins)</label>
                  <input
                    type="number"
                    min={5}
                    value={productForm.deliveryTimeMins}
                    onChange={e => setProductForm({ ...productForm, deliveryTimeMins: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Product Photo Input */}
              <div className="bg-orange-50/60 dark:bg-orange-950/20 p-3 rounded-2xl border border-orange-200 space-y-2">
                <label className="text-[10px] font-black uppercase text-orange-900 dark:text-orange-200 block">
                  Product Photograph
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL..."
                    value={newImageUrlInput}
                    onChange={e => setNewImageUrlInput(e.target.value)}
                    className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="bg-[#FF6A00] text-white px-3 py-1.5 rounded-xl font-black text-xs"
                  >
                    Add URL
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="cursor-pointer bg-white border border-orange-300 text-orange-800 px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" /> Upload Image File
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <div className="flex gap-1.5">
                    {(productForm.images || []).map((imgUrl, idx) => (
                      <div key={idx} className="relative w-10 h-10 rounded-lg border border-orange-300 bg-white overflow-hidden">
                        <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-0 right-0 bg-rose-600 text-white rounded-full p-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[10px] font-black uppercase text-gray-500">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  rows={2}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#FF6A00] hover:bg-orange-600 text-white font-black px-5 py-2 rounded-xl shadow-md cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Add to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
