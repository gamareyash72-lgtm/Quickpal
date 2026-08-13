import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Category, DeliveryPartner, Coupon, PromoBanner, PaymentSettings, OrderStatus, UserRole, FAQItem, SupportTicket } from '../types';
import { PincodeManagementModal } from './PincodeManagementModal';
import { printOrderReceipt } from '../utils/printReceipt';
import {
  Package,
  Plus,
  Trash2,
  Edit,
  Users,
  Bike,
  QrCode,
  TrendingUp,
  Tag,
  Eye,
  EyeOff,
  Layers,
  CheckCircle,
  XCircle,
  Settings,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  DollarSign,
  X,
  UserPlus,
  Lock,
  UserCheck,
  ShieldCheck,
  KeyRound,
  Grid,
  HelpCircle,
  MessageSquare,
  ThumbsUp,
  Check,
  MapPin,
  Building2,
  CreditCard,
  Banknote,
  Upload,
  Printer
} from 'lucide-react';

interface AdminDashboardProps {
  isOwnerMode?: boolean;
  initialTab?: 'products' | 'categories' | 'orders' | 'payment_audit' | 'partners' | 'coupons' | 'banners' | 'reports' | 'accounts' | 'faqs' | 'tickets' | 'pincodes' | 'payments';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOwnerMode = false, initialTab }) => {
  const {
    products,
    categories,
    partners,
    orders,
    coupons,
    banners,
    paymentSettings,
    users,
    createUserByAdmin,
    toggleUserStatus,
    deleteUser,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleOutOfStock,
    toggleHideProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    registerPartner,
    storeAcceptOrder,
    updateOrderStatusByAdmin,
    addBanner,
    toggleBannerActive,
    addCoupon,
    toggleCouponActive,
    updatePaymentSettings,
    adminReviewPayment,
    faqs,
    supportTickets,
    addFAQ,
    updateFAQ,
    deleteFAQ,
    updateTicketStatus
  } = useApp();

  const [adminTab, setAdminTab] = useState<
    'products' | 'categories' | 'orders' | 'payment_audit' | 'partners' | 'coupons' | 'banners' | 'reports' | 'accounts' | 'faqs' | 'tickets' | 'pincodes' | 'payments'
  >(initialTab || 'products');

  useEffect(() => {
    setPaySettingsForm(paymentSettings);
  }, [paymentSettings]);

  // Delete User Confirm State
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string; role: string } | null>(null);

  // FAQ Modal state
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [faqForm, setFaqForm] = useState({
    category: 'delivery' as FAQItem['category'],
    question: '',
    answer: '',
    isPopular: false
  });

  // Account Creation Form State (Admin / Owner Provisioning)
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    role: 'partner' as UserRole,
    username: '',
    phone: '',
    email: '',
    password: '',
    isActive: true
  });

  // New Product Modal Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: categories[0]?.id || 'cat-veg',
    price: 30,
    originalPrice: 40,
    weightUnit: '500 g',
    imageEmoji: '🥬',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'
    ] as string[],
    stock: 50,
    description: '',
    deliveryTimeMins: 10,
    isFeatured: false
  });
  const [newImageUrlInput, setNewImageUrlInput] = useState('');

  // Category Form State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catEmoji, setCatEmoji] = useState('🍎');
  const [catImageUrl, setCatImageUrl] = useState('');
  const [catBgLight, setCatBgLight] = useState('bg-orange-100 text-orange-800');

  // Register Partner Form State
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    phone: '',
    vehicleType: 'EV Scooter',
    vehicleNumber: 'DL-01-QP-9900',
    currentLocationName: 'Saphale East Express Hub',
    pinCode: '401102',
    isOnline: true
  });

  // Payment Settings Form State
  const [paySettingsForm, setPaySettingsForm] = useState<PaymentSettings>(paymentSettings);

  // New Coupon Form State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountAmount: 50,
    minOrderValue: 199,
    description: '',
    isActive: true
  });

  // Calculate Metrics
  const totalSales = orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? o.total : 0), 0);
  const totalOrdersCount = orders.length;
  const activePartnersCount = partners.filter(p => p.isOnline).length;
  const outOfStockCount = products.filter(p => p.isOutOfStock).length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        setProductForm(prev => {
          const currentImages = prev.images || [];
          const updatedImages = [...currentImages, resultStr];
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
      const currentImages = prev.images || [];
      const updatedImages = [...currentImages, url];
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
    const finalImages = (productForm.images && productForm.images.length > 0) ? productForm.images : [finalImage];

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...productForm,
        image: finalImage,
        images: finalImages,
        isOutOfStock: editingProduct.isOutOfStock,
        isHidden: editingProduct.isHidden,
        rating: editingProduct.rating,
        reviewsCount: editingProduct.reviewsCount
      });
    } else {
      addProduct({
        ...productForm,
        image: finalImage,
        images: finalImages,
        isOutOfStock: false,
        isHidden: false,
        rating: 5.0,
        reviewsCount: 1
      });
    }
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    const pImages = p.images && p.images.length > 0
      ? p.images
      : [p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'];

    setProductForm({
      name: p.name,
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice,
      weightUnit: p.weightUnit,
      imageEmoji: p.imageEmoji || '📦',
      image: p.image || pImages[0],
      images: pImages,
      stock: p.stock,
      description: p.description,
      deliveryTimeMins: p.deliveryTimeMins,
      isFeatured: !!p.isFeatured
    });
    setShowProductModal(true);
  };

  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatEmoji('🍎');
    setCatImageUrl('https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=400&q=80');
    setCatBgLight('bg-orange-100 text-orange-800');
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatEmoji(cat.iconEmoji || '📦');
    setCatImageUrl(cat.image || '');
    setCatBgLight(cat.bgLight || 'bg-orange-100 text-orange-800');
    setShowCategoryModal(true);
  };

  const handleCategoryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCatImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name: catName.trim(),
        iconEmoji: catEmoji.trim() || '📦',
        image: catImageUrl.trim() || undefined,
        bgLight: catBgLight
      });
    } else {
      addCategory({
        name: catName.trim(),
        iconEmoji: catEmoji.trim() || '📦',
        image: catImageUrl.trim() || undefined,
        bgLight: catBgLight
      });
    }
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (confirm(`Are you sure you want to delete category "${cat?.name || catId}"?`)) {
      deleteCategory(catId);
    }
  };

  const handleRegisterPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.name || !partnerForm.phone) return;
    registerPartner(partnerForm);
    setShowPartnerModal(false);
    setPartnerForm({
      name: '',
      phone: '',
      vehicleType: 'EV Scooter',
      vehicleNumber: 'DL-01-QP-9900',
      currentLocationName: 'Dark Store #1',
      pinCode: '110016',
      isOnline: true
    });
  };

  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentSettings(paySettingsForm);
    alert('Payment Settings, Dynamic QR Manager & Bank Gateway configurations saved successfully!');
  };

  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaySettingsForm(prev => ({
          ...prev,
          qrImageUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code) return;
    addCoupon(couponForm);
    setShowCouponModal(false);
    setCouponForm({
      code: '',
      discountAmount: 50,
      minOrderValue: 199,
      description: '',
      isActive: true
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.role) return;
    if (userForm.role !== 'customer' && !userForm.password) {
      alert('Password is required for staff/partner accounts!');
      return;
    }

    const emailToUse = userForm.email?.trim() || 
      (userForm.username?.trim().includes('@') 
        ? userForm.username.trim() 
        : `${(userForm.username?.trim() || userForm.name.trim().toLowerCase().replace(/\s+/g, '') || 'partner')}@partnerquickpal.in`);

    const res = await createUserByAdmin({
      name: userForm.name,
      role: userForm.role,
      username: userForm.username || emailToUse.split('@')[0],
      phone: userForm.phone,
      email: emailToUse,
      password: userForm.password,
      isActive: userForm.isActive
    });
    alert(res.message);
    if (res.success) {
      setShowUserModal(false);
      setUserForm({
        name: '',
        role: 'partner',
        username: '',
        phone: '',
        email: '',
        password: '',
        isActive: true
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 space-y-6 pb-24">
      {/* Top Admin Header & KPI Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
            Full Control System
          </span>
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-1">
            QuickPal Admin Control Dashboard
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Manage Inventory, Orders, Partners, Coupons, and Payments
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <span className="text-[10px] font-black uppercase text-gray-400 block">Total Revenue</span>
          <p className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">₹{totalSales}</p>
          <span className="text-[10px] text-gray-500 font-medium">From {totalOrdersCount} orders</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <span className="text-[10px] font-black uppercase text-gray-400 block">Active Orders</span>
          <p className="text-2xl font-black text-amber-500 mt-1">
            {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}
          </p>
          <span className="text-[10px] text-gray-500 font-medium">Real-time status</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <span className="text-[10px] font-black uppercase text-gray-400 block">On-Duty Partners</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {activePartnersCount} / {partners.length}
          </p>
          <span className="text-[10px] text-gray-500 font-medium">Ready for dispatch</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <span className="text-[10px] font-black uppercase text-gray-400 block">Inventory Alerts</span>
          <p className="text-2xl font-black text-rose-500 mt-1">{outOfStockCount}</p>
          <span className="text-[10px] text-gray-500 font-medium">Items out of stock</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-2xl gap-1 overflow-x-auto">
        {(
          [
            { id: 'products', label: '📦 Products', icon: Package },
            { id: 'categories', label: '🏷️ Categories', icon: Layers },
            { id: 'orders', label: '🛒 Orders & Dispatch', icon: TrendingUp },
            { id: 'payment_audit', label: '🛡️ Payment Audits & Reconciliation', icon: ShieldCheck },
            { id: 'partners', label: '🛵 Partners Reg.', icon: Bike },
            { id: 'coupons', label: '🎟️ Coupons', icon: Tag },
            { id: 'banners', label: '🖼️ Promo Banners', icon: Sparkles },
            { id: 'accounts', label: '👥 User & Staff Accounts', icon: Users },
            { id: 'faqs', label: '❓ FAQ Dashboard', icon: HelpCircle },
            { id: 'tickets', label: '💬 Support Tickets', icon: MessageSquare },
            { id: 'reports', label: '📊 Sales Reports', icon: FileSpreadsheet },
            { id: 'pincodes', label: '📍 Service Areas & PINs', icon: MapPin },
            { id: 'payments', label: '💳 Payment Settings & QR', icon: QrCode },
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              adminTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-orange-700 dark:text-orange-300 shadow-sm font-black'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Products Management */}
      {adminTab === 'products' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200">
              Inventory & Products ({products.length})
            </h3>
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowProductModal(true);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add New Product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-black">
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Stock</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                {products.map(prod => {
                  const mainPhoto = prod.image || (prod.images && prod.images[0]);
                  return (
                    <tr key={prod.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-3 flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 shrink-0 flex items-center justify-center overflow-hidden">
                          {mainPhoto ? (
                            <img
                              src={mainPhoto}
                              alt={prod.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-lg">{prod.imageEmoji || '📦'}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold">{prod.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                            <span>{prod.weightUnit}</span>
                            {prod.images && prod.images.length > 1 && (
                              <span className="bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 px-1.5 py-0.2 rounded font-black">
                                {prod.images.length} Photos
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 capitalize">
                        {categories.find(c => c.id === prod.category)?.name || prod.category}
                      </td>
                      <td className="py-3 px-3 font-bold">
                        ₹{prod.price}{' '}
                        <span className="text-[10px] text-gray-400 line-through">
                          ₹{prod.originalPrice}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold">{prod.stock} units</td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => toggleOutOfStock(prod.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            prod.isOutOfStock
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {prod.isOutOfStock ? 'Out Of Stock' : 'In Stock'}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1">
                        <button
                          onClick={() => toggleHideProduct(prod.id)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
                          title={prod.isHidden ? 'Show Product' : 'Hide Product'}
                        >
                          {prod.isHidden ? (
                            <EyeOff className="w-4 h-4 text-rose-500" />
                          ) : (
                            <Eye className="w-4 h-4 text-orange-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(prod.id)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Category Management */}
      {adminTab === 'categories' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200">
                Product Categories ({categories.length})
              </h3>
              <p className="text-[11px] text-gray-400 font-medium">
                Add, edit real images, rename, or delete store categories.
              </p>
            </div>
            <button
              onClick={handleOpenCreateCategory}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" /> Create Category
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(cat => {
              const itemCount = products.filter(p => p.category === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/60 shadow-sm flex flex-col justify-between gap-3 group hover:border-orange-400 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-700 shrink-0 overflow-hidden relative border border-gray-200 dark:border-gray-600 flex items-center justify-center p-1 shadow-inner">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-3xl">{cat.iconEmoji}</span>
                      )}
                      <span className="absolute top-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                        {cat.iconEmoji}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-gray-900 dark:text-gray-100 truncate">
                        {cat.name}
                      </h4>
                      <span className="text-[10px] font-bold text-gray-400 block font-mono">
                        {cat.id}
                      </span>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-2.5 border-t border-gray-200 dark:border-gray-700/80">
                    <button
                      onClick={() => handleOpenEditCategory(cat)}
                      className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg flex items-center gap-1 transition-colors"
                      title="Edit Category Details & Image"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg flex items-center gap-1 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Orders & Dispatch Management */}
      {adminTab === 'orders' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 space-y-4">
          <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200">
            Live Customer Orders & Partner Response Logs ({orders.length})
          </h3>

          <div className="space-y-3">
            {orders.map(ord => (
              <div
                key={ord.id}
                className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 space-y-3 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-orange-700 dark:text-orange-400">
                      Order #{ord.id}
                    </span>
                    <span className="bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      ₹{ord.total} ({ord.paymentMethod.toUpperCase()})
                    </span>
                  </div>

                  {/* Manual Status Override Selector & Print Receipt */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => printOrderReceipt(ord)}
                      className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-extrabold text-[11px] flex items-center gap-1 transition-all"
                      title="Print Official Order Receipt"
                    >
                      <Printer className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> Print Receipt
                    </button>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Set Status:</span>
                    <select
                      value={ord.status}
                      onChange={e => updateOrderStatusByAdmin(ord.id, e.target.value as OrderStatus)}
                      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-xs font-bold px-2 py-1 rounded-lg"
                    >
                      <option value="placed">Placed (Pending Store Check)</option>
                      <option value="store_accepted">Store Accepted & In Stock</option>
                      <option value="accepted">Accepted by Delivery Partner</option>
                      <option value="picked_up">Picked Up from Store</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Store Stock Confirmation Banner if status is 'placed' */}
                {ord.status === 'placed' && (
                  <div className="bg-amber-50 dark:bg-amber-950/50 p-3 rounded-2xl border border-amber-200 dark:border-amber-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-black text-amber-900 dark:text-amber-200 block">
                        🛍️ Action Required: Confirm Store Product Availability
                      </span>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300">
                        Items: {ord.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                      </p>
                    </div>
                    <button
                      onClick={() => storeAcceptOrder(ord.id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-black px-4 py-2 rounded-xl text-xs shadow-md shrink-0 flex items-center gap-1.5 transition-transform active:scale-95"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirm Stock & Accept Order
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Customer</span>
                    <p className="font-bold">{ord.customerName}</p>
                    <p className="text-gray-500 text-[11px]">{ord.deliveryLocation}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Assigned Partner</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {ord.deliveryPartnerName || 'Unassigned'}
                      </span>
                      {/* Manual Partner Assign */}
                      <select
                        value={ord.deliveryPartnerId || ''}
                        onChange={e => updateOrderStatusByAdmin(ord.id, ord.status, e.target.value)}
                        className="bg-white dark:bg-gray-800 border border-gray-300 text-[10px] font-bold px-1.5 py-0.5 rounded"
                      >
                        <option value="">Assign Partner...</option>
                        {partners.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Partner Accept/Reject Audit Logs
                    </span>
                    {ord.partnerResponseLogs.length === 0 ? (
                      <p className="text-[10px] text-gray-400 italic">No partner response logged yet.</p>
                    ) : (
                      <div className="space-y-1 mt-1">
                        {ord.partnerResponseLogs.map((log, idx) => (
                          <div
                            key={idx}
                            className={`p-1 rounded text-[10px] font-bold flex items-center justify-between ${
                              log.action === 'accepted'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            <span>
                              {log.partnerName} {log.action.toUpperCase()}
                            </span>
                            <span>{log.timestamp}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Payment Verification & Security Audits */}
      {adminTab === 'payment_audit' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black uppercase text-gray-900 dark:text-gray-100">
                  Payment Verification & Fraud Audit Portal
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                Real-time NPCI settlement ledger verification, UTR reconciliation, and manual override controls.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl text-emerald-800 dark:text-emerald-300">
                Verified: <strong>{orders.filter(o => o.paymentStatus === 'paid').length}</strong>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-3 py-1.5 rounded-xl text-rose-800 dark:text-rose-300">
                Failed/Flagged: <strong>{orders.filter(o => o.paymentStatus === 'failed').length}</strong>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-xl text-amber-800 dark:text-amber-300">
                Under Audit: <strong>{orders.filter(o => o.paymentStatus === 'under_review').length}</strong>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-xs">No payment records found.</p>
            ) : (
              orders.map(ord => (
                <div
                  key={ord.id}
                  className={`p-4 rounded-2xl border ${
                    ord.paymentStatus === 'failed'
                      ? 'border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20'
                      : ord.paymentStatus === 'paid'
                      ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50'
                  } space-y-3 text-xs`}
                >
                  {/* Order & Payment Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-gray-900 dark:text-gray-100">
                          Order #{ord.id}
                        </span>
                        <span className="text-[11px] font-bold text-gray-500">
                          by {ord.customerName} ({ord.customerPhone})
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400">
                        Placed on {new Date(ord.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-orange-600 dark:text-orange-400">
                        ₹{ord.total}
                      </span>
                      <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${
                        ord.paymentStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : ord.paymentStatus === 'failed'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {ord.paymentStatus === 'paid' && '✅ Verified Paid'}
                        {ord.paymentStatus === 'failed' && '❌ Verification Failed'}
                        {ord.paymentStatus === 'pending' && '⏳ COD Pending'}
                        {ord.paymentStatus === 'under_review' && '🔍 Under Audit'}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-black text-gray-400 block mb-0.5">Payment Details</span>
                      <p className="font-bold uppercase text-gray-800 dark:text-gray-200">
                        Method: {ord.paymentMethod.replace('_', ' ')}
                      </p>
                      <p className="font-mono text-xs font-bold text-orange-700 dark:text-orange-300 mt-0.5">
                        Submitted Ref: {ord.paymentTransactionId || 'None'}
                      </p>
                      {ord.submittedAmount && (
                        <p className="text-[11px] text-gray-500 font-medium">
                          Submitted Amount: ₹{ord.submittedAmount} (Order Total: ₹{ord.total})
                        </p>
                      )}
                      {ord.paymentScreenshotUrl && (
                        <div className="mt-1.5">
                          <span className="text-[9px] uppercase font-black text-emerald-600 dark:text-emerald-400 block mb-0.5">📸 Payment Receipt Screenshot Attached</span>
                          <a href={ord.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer">
                            <img src={ord.paymentScreenshotUrl} alt="Payment Screenshot Proof" className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm hover:opacity-90 transition-opacity" />
                          </a>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-black text-gray-400 block mb-0.5">Verification Diagnostic</span>
                      {ord.paymentStatus === 'paid' ? (
                        <p className="text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                          ✅ Genuine payment receipt matched with payee ledger.
                        </p>
                      ) : ord.paymentFailureReason ? (
                        <p className="text-rose-700 dark:text-rose-300 font-bold text-[11px] leading-snug">
                          ⚠️ {ord.paymentFailureReason}
                        </p>
                      ) : (
                        <p className="text-gray-500 text-[11px] italic">Cash on Delivery order pending delivery confirmation.</p>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-black text-gray-400 block mb-1">Admin Manual Override</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adminReviewPayment(ord.id, 'approve', 'Store admin manually confirmed bank ledger credit.')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase px-3 py-1.5 rounded-xl shadow-sm transition-all"
                        >
                          Approve & Mark Paid
                        </button>
                        <button
                          onClick={() => adminReviewPayment(ord.id, 'reject', 'Store admin rejected unverified payment proof.')}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase px-3 py-1.5 rounded-xl shadow-sm transition-all"
                        >
                          Reject / Flag Fraud
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Audit Logs History */}
                  {ord.paymentAuditLogs && ord.paymentAuditLogs.length > 0 && (
                    <div className="bg-white/80 dark:bg-gray-800/80 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 space-y-1 mt-2">
                      <span className="text-[9px] uppercase font-black text-gray-400 block">Security Audit History Trail</span>
                      <div className="space-y-1">
                        {ord.paymentAuditLogs.map((log, idx) => (
                          <div key={idx} className="text-[10px] font-mono flex items-start justify-between gap-2 text-gray-600 dark:text-gray-300 border-b border-gray-50 dark:border-gray-700/50 pb-1 last:border-none">
                            <span>
                              <strong className="text-gray-900 dark:text-gray-100">[{log.action}]</strong> {log.note} ({log.actor})
                            </span>
                            <span className="text-gray-400 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Delivery Partners Registration (No Self Registration) */}
      {adminTab === 'partners' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200">
                Registered Delivery Partners ({partners.length})
              </h3>
              <p className="text-xs text-gray-400">
                Strict Security: Delivery partners can only be onboarded by Admin credentials.
              </p>
            </div>
            <button
              onClick={() => setShowPartnerModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Register Delivery Partner
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {partners.map(p => (
              <div
                key={p.id}
                className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm">{p.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      p.isOnline ? 'bg-orange-100 text-orange-800' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {p.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <p className="text-gray-500">Phone: {p.phone}</p>
                <p className="text-gray-500">Vehicle: {p.vehicleType} ({p.vehicleNumber})</p>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold text-orange-700 dark:text-orange-400">
                  <span>Earnings: ₹{p.totalEarnings}</span>
                  <span>Rating: ★ {p.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: User Accounts & Staff Provisioning */}
      {adminTab === 'accounts' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-500" />
                Staff Accounts & Role Management ({users.length})
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage Delivery Partners, Store Users, and Admin credentials. Self-registration is strictly disabled for non-customers.
              </p>
            </div>
            <button
              onClick={() => setShowUserModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" /> Provision New Staff/Partner Account
            </button>
          </div>

          {/* Access Policy Banner */}
          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 p-3.5 rounded-2xl flex items-start gap-3 text-xs text-purple-900 dark:text-purple-200">
            <Lock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-purple-950 dark:text-purple-100">
                Enforced Role Access Control
              </p>
              <p className="text-[11px] text-purple-800 dark:text-purple-300 mt-0.5">
                Customers self-register via Phone OTP / Email. Delivery Partners, Store Users, and Admins can only log in using credentials issued in this panel. Deactivated accounts immediately lose login access across all portals.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-black">
                  <th className="py-2.5 px-3">Staff ID</th>
                  <th className="py-2.5 px-3">Name & Contact</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Username / Identifier</th>
                  <th className="py-2.5 px-3">Password</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-3 font-mono text-[11px] font-bold text-orange-600 dark:text-orange-400">
                      #{u.id}
                    </td>
                    <td className="py-3 px-3 font-bold">
                      <p className="text-gray-900 dark:text-gray-100">{u.name}</p>
                      <p className="text-[10px] text-gray-500 font-normal">{u.phone || u.email || 'No phone'}</p>
                    </td>
                    <td className="py-3 px-3 font-extrabold uppercase">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                        u.role === 'customer' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' :
                        u.role === 'partner' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        u.role === 'store' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] font-bold text-gray-700 dark:text-gray-300">
                      {u.username || u.phone || u.email}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-gray-500">
                      {u.password ? u.password : 'OTP Verification'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        u.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          u.isActive
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => setUserToDelete({ id: u.id, name: u.name, role: u.role })}
                        className="bg-rose-500 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs transition-colors"
                        title="Delete Staff ID"
                      >
                        Delete Staff ID
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: FAQ Dashboard Management */}
      {adminTab === 'faqs' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-orange-500" />
                Customer FAQ Knowledge Base ({faqs.length})
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage frequently asked questions shown to customers and used by the AI Customer Support Assistant.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingFaq(null);
                setFaqForm({ category: 'delivery', question: '', answer: '', isPopular: false });
                setShowFaqModal(true);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Add New FAQ
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map(faq => (
              <div
                key={faq.id}
                className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/80 space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300">
                    {faq.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {faq.isPopular && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setEditingFaq(faq);
                        setFaqForm({
                          category: faq.category,
                          question: faq.question,
                          answer: faq.answer,
                          isPopular: !!faq.isPopular
                        });
                        setShowFaqModal(true);
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500"
                      title="Edit FAQ"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteFAQ(faq.id)}
                      className="p-1 hover:bg-rose-100 text-rose-500 rounded"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  {faq.question}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
                <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1 pt-1">
                  <ThumbsUp className="w-3 h-3 text-orange-500" />
                  <span>{faq.helpfulCount || 0} customer votes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Customer Support Tickets */}
      {adminTab === 'tickets' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 space-y-4">
          <div>
            <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-orange-500" />
              Customer Support Inbox & Tickets ({supportTickets.length})
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Customer tickets submitted via FAQ Dashboard support form or escalated by AI Assistant.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-black">
                  <th className="py-2.5 px-3">Ticket ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Subject & Details</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Submitted At</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {supportTickets.map(tkt => (
                  <tr key={tkt.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-3 font-mono font-bold text-orange-600">
                      #{tkt.id}
                      {tkt.orderId && (
                        <span className="block text-[10px] text-gray-400 font-normal">
                          Order: {tkt.orderId}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold">
                      {tkt.customerName}
                      {tkt.customerPhone && (
                        <span className="block text-[10px] text-gray-400 font-normal">
                          {tkt.customerPhone}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <p className="font-bold text-gray-800 dark:text-gray-200">{tkt.subject}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                        {tkt.message}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        tkt.status === 'open' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        tkt.status === 'in_progress' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {tkt.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-gray-400 font-mono">
                      {new Date(tkt.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right space-x-1">
                      {tkt.status !== 'resolved' && (
                        <button
                          onClick={() => updateTicketStatus(tkt.id, 'resolved')}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded text-[10px] font-bold"
                        >
                          Mark Resolved
                        </button>
                      )}
                      {tkt.status === 'open' && (
                        <button
                          onClick={() => updateTicketStatus(tkt.id, 'in_progress')}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded text-[10px] font-bold"
                        >
                          In Progress
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FAQ Creation/Edit Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">
                {editingFaq ? 'Edit FAQ Item' : 'Add New FAQ Item'}
              </h3>
              <button
                onClick={() => setShowFaqModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!faqForm.question || !faqForm.answer) return;
                if (editingFaq) {
                  updateFAQ({
                    ...editingFaq,
                    category: faqForm.category,
                    question: faqForm.question,
                    answer: faqForm.answer,
                    isPopular: faqForm.isPopular
                  });
                } else {
                  addFAQ({
                    category: faqForm.category,
                    question: faqForm.question,
                    answer: faqForm.answer,
                    isPopular: faqForm.isPopular
                  });
                }
                setShowFaqModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                  Category
                </label>
                <select
                  value={faqForm.category}
                  onChange={e => setFaqForm({ ...faqForm, category: e.target.value as any })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="delivery">Express Delivery & Tracking</option>
                  <option value="payments">Payments & Refunds</option>
                  <option value="orders">Orders & Cancellations</option>
                  <option value="products">Products & Quality</option>
                  <option value="account">Account & Safety</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                  Question
                </label>
                <input
                  type="text"
                  required
                  value={faqForm.question}
                  onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
                  placeholder="e.g. How fast is QuickPal delivery?"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                  Answer
                </label>
                <textarea
                  required
                  rows={3}
                  value={faqForm.answer}
                  onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
                  placeholder="Clear and concise answer for customers..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs"
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={faqForm.isPopular}
                  onChange={e => setFaqForm({ ...faqForm, isPopular: e.target.checked })}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="isPopular" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Highlight as Popular FAQ
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFaqModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-md"
                >
                  {editingFaq ? 'Save FAQ' : 'Add FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 6: Sales Reports */}
      {adminTab === 'reports' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 space-y-4">
          <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200">
            Sales & Delivery Analytics
          </h3>
          <div className="p-6 bg-orange-50 dark:bg-orange-950/30 rounded-2xl text-center space-y-2 border border-orange-200">
            <TrendingUp className="w-8 h-8 text-orange-600 mx-auto" />
            <h4 className="text-sm font-black text-orange-900 dark:text-orange-200">
              Generated Live Report Summary
            </h4>
            <p className="text-xs text-orange-700 dark:text-orange-300 max-w-md mx-auto">
              Total Order Volume: {orders.length} orders | Total Revenue: ₹{totalSales} | Average Delivery Time: 8.5 Mins
            </p>
          </div>
        </div>
      )}

      {/* Tab 12: Service Areas & PIN Codes */}
      {adminTab === 'pincodes' && (
        <PincodeManagementModal />
      )}

      {/* Tab 13: Payment Settings, QR Managing, Net Banking & Gateways */}
      {adminTab === 'payments' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <QrCode className="w-6 h-6 text-orange-500" />
                <h3 className="text-base font-black uppercase text-gray-900 dark:text-gray-100">
                  Payment Settings, QR Code & Gateway Manager
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                Configure store payee details, dynamic UPI QR generation, Net Banking account details, Credit/Debit cards, and Cash on Delivery rules.
              </p>
            </div>
            <span className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-amber-300 dark:border-amber-800 shrink-0">
              👑 Owner & Admin Authority
            </span>
          </div>

          <form onSubmit={handleSavePaymentSettings} className="space-y-6 text-xs font-bold">
            {/* SECTION 1: UPI & QR CODE MANAGING */}
            <div className="bg-gradient-to-br from-orange-50/80 to-amber-50/50 dark:from-orange-950/30 dark:to-amber-950/20 p-5 rounded-3xl border border-orange-200/80 dark:border-orange-800/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-orange-600" />
                  <h4 className="text-sm font-black text-orange-950 dark:text-orange-200 uppercase tracking-wider">
                    1. UPI & Dynamic QR Code Managing
                  </h4>
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-orange-300 dark:border-orange-700 shadow-xs">
                  <input
                    type="checkbox"
                    checked={paySettingsForm.allowUpiQR ?? true}
                    onChange={e => setPaySettingsForm({ ...paySettingsForm, allowUpiQR: e.target.checked })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="text-xs font-black text-gray-800 dark:text-gray-200">Enable UPI QR Payments</span>
                </label>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Inputs */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">
                        Payee / Business Name *
                      </label>
                      <input
                        type="text"
                        value={paySettingsForm.payeeName}
                        onChange={e => setPaySettingsForm({ ...paySettingsForm, payeeName: e.target.value })}
                        placeholder="e.g. Yash Gamare / QuickPal Retail"
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">
                        Payee UPI VPA / ID *
                      </label>
                      <input
                        type="text"
                        value={paySettingsForm.upiId}
                        onChange={e => setPaySettingsForm({ ...paySettingsForm, upiId: e.target.value })}
                        placeholder="e.g. gamareyash72-1@oksbi"
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-orange-700 dark:text-orange-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">
                      Custom QR Code Image URL (Optional Override)
                    </label>
                    <input
                      type="url"
                      value={paySettingsForm.qrImageUrl || ''}
                      onChange={e => setPaySettingsForm({ ...paySettingsForm, qrImageUrl: e.target.value })}
                      placeholder="Paste image URL (https://...) or leave empty for auto-generated QR"
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 bg-white/80 dark:bg-gray-800/80 p-3 rounded-2xl border border-orange-200 dark:border-orange-800/50">
                    <div>
                      <span className="text-xs font-black text-gray-900 dark:text-gray-100 block">
                        Upload Store QR Code Image File
                      </span>
                      <span className="text-[10px] text-gray-500 font-normal">
                        Select a saved QR image from your device (PNG/JPG/JPEG).
                      </span>
                    </div>
                    <label className="cursor-pointer bg-orange-600 hover:bg-orange-700 text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-sm transition-colors shrink-0 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" /> Browse QR File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* QR Code Live Preview Card */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-orange-300 dark:border-orange-700 shadow-md flex flex-col items-center justify-center text-center space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950 px-2.5 py-0.5 rounded-full">
                    Live QR Code Preview
                  </span>
                  <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-inner">
                    <img
                      src={
                        paySettingsForm.qrImageUrl ||
                        `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                          `upi://pay?pa=${paySettingsForm.upiId}&pn=${paySettingsForm.payeeName}&cu=INR`
                        )}`
                      }
                      alt="Store UPI QR Preview"
                      className="w-32 h-32 object-contain mx-auto rounded-lg"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-black text-xs text-gray-900 dark:text-white">{paySettingsForm.payeeName || 'Store Payee'}</p>
                    <p className="font-mono text-[11px] font-bold text-orange-600 dark:text-orange-400">{paySettingsForm.upiId || 'not configured'}</p>
                  </div>
                  <span className="text-[9px] text-gray-400 font-medium">
                    Customers scan this QR code directly during checkout to complete instant payments.
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 2: NET BANKING & BANK ACCOUNT DETAILS */}
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 p-5 rounded-3xl border border-blue-200/80 dark:border-blue-800/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h4 className="text-sm font-black text-blue-950 dark:text-blue-200 uppercase tracking-wider">
                    2. Net Banking & Direct Bank Account Settings
                  </h4>
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-blue-300 dark:border-blue-700 shadow-xs">
                  <input
                    type="checkbox"
                    checked={paySettingsForm.allowNetBanking ?? true}
                    onChange={e => setPaySettingsForm({ ...paySettingsForm, allowNetBanking: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-xs font-black text-gray-800 dark:text-gray-200">Enable Net Banking Option</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">
                    Bank Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={paySettingsForm.bankAccountName || ''}
                    onChange={e => setPaySettingsForm({ ...paySettingsForm, bankAccountName: e.target.value })}
                    placeholder="e.g. QuickPal Retail Private Limited"
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={paySettingsForm.bankName || ''}
                    onChange={e => setPaySettingsForm({ ...paySettingsForm, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank Ltd / State Bank of India"
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={paySettingsForm.bankAccountNumber || ''}
                    onChange={e => setPaySettingsForm({ ...paySettingsForm, bankAccountNumber: e.target.value })}
                    placeholder="e.g. 921020045612390"
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-700 dark:text-blue-300"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={paySettingsForm.bankIfscCode || ''}
                    onChange={e => setPaySettingsForm({ ...paySettingsForm, bankIfscCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. HDFC0000123"
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase text-gray-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block mb-1 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">
                    Branch Location & Address
                  </label>
                  <input
                    type="text"
                    value={paySettingsForm.bankBranchName || ''}
                    onChange={e => setPaySettingsForm({ ...paySettingsForm, bankBranchName: e.target.value })}
                    placeholder="e.g. Palghar Main Station Road Branch, Palghar - 401102"
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Supported Banks Badges */}
              <div className="pt-2 border-t border-blue-200/60 dark:border-blue-800/60">
                <span className="text-[10px] font-black uppercase text-blue-800 dark:text-blue-300 block mb-1.5">
                  Supported Net Banking Gateways:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['State Bank of India (SBI)', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank (PNB)', 'Bank of Baroda', 'Canara Bank', 'Union Bank of India', 'IndusInd Bank'].map(bank => (
                    <span key={bank} className="bg-white dark:bg-gray-800 text-blue-900 dark:text-blue-200 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-700 shadow-2xs">
                      🏛️ {bank}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 3: CREDIT/DEBIT CARDS & GATEWAY KEYS */}
            <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/50 dark:from-purple-950/30 dark:to-pink-950/20 p-5 rounded-3xl border border-purple-200/80 dark:border-purple-800/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <h4 className="text-sm font-black text-purple-950 dark:text-purple-200 uppercase tracking-wider">
                    3. Credit & Debit Cards & Payment Gateway API Keys
                  </h4>
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-purple-300 dark:border-purple-700 shadow-xs">
                  <input
                    type="checkbox"
                    checked={paySettingsForm.allowCards ?? true}
                    onChange={e => setPaySettingsForm({ ...paySettingsForm, allowCards: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-xs font-black text-gray-800 dark:text-gray-200">Enable Card Payments</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">
                    Razorpay Merchant Key ID
                  </label>
                  <input
                    type="text"
                    value={paySettingsForm.razorpayKeyId || ''}
                    onChange={e => setPaySettingsForm({ ...paySettingsForm, razorpayKeyId: e.target.value })}
                    placeholder="e.g. rzp_live_QP991208"
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-purple-700 dark:text-purple-300"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">
                    Stripe Publishable Key
                  </label>
                  <input
                    type="text"
                    value={paySettingsForm.stripePublicKey || ''}
                    onChange={e => setPaySettingsForm({ ...paySettingsForm, stripePublicKey: e.target.value })}
                    placeholder="e.g. pk_live_QP88123"
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-purple-700 dark:text-purple-300"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: CASH ON DELIVERY (COD) RULES */}
            <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/20 p-5 rounded-3xl border border-emerald-200/80 dark:border-emerald-800/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                    4. Cash on Delivery (COD) Rules & Limits
                  </h4>
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 shadow-xs">
                  <input
                    type="checkbox"
                    checked={paySettingsForm.allowCOD}
                    onChange={e => setPaySettingsForm({ ...paySettingsForm, allowCOD: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-xs font-black text-gray-800 dark:text-gray-200">Allow Cash on Delivery (COD)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">
                    Minimum COD Order Total (₹)
                  </label>
                  <input
                    type="number"
                    value={paySettingsForm.codMin}
                    onChange={e => setPaySettingsForm({ ...paySettingsForm, codMin: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">
                    Maximum COD Order Limit (₹)
                  </label>
                  <input
                    type="number"
                    value={paySettingsForm.codMax}
                    onChange={e => setPaySettingsForm({ ...paySettingsForm, codMax: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: CUSTOM CHECKOUT NOTE */}
            <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-2">
              <label className="block text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">
                Customer Checkout Payment Policy / Guidance Note
              </label>
              <textarea
                rows={2}
                value={paySettingsForm.checkoutNote || ''}
                onChange={e => setPaySettingsForm({ ...paySettingsForm, checkoutNote: e.target.value })}
                placeholder="Guidance shown to customers during payment selection..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-medium"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-black text-sm px-8 py-3 rounded-2xl shadow-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Check className="w-5 h-5" />
                Save Payment Settings & Gateway Configurations
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4 text-xs font-bold">
            <h3 className="text-base font-black text-gray-900 dark:text-gray-100">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-[10px] font-black uppercase text-gray-500">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[10px] font-black uppercase text-orange-600 dark:text-orange-400">
                    Choose Product Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-orange-50 dark:bg-gray-800 border border-orange-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-gray-100 shadow-sm"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.iconEmoji} {cat.name} ({cat.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Real High-Quality Product Photographs Manager */}
              <div className="bg-orange-50/60 dark:bg-orange-950/30 p-3.5 rounded-2xl border border-orange-200/80 dark:border-orange-800/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-orange-950 dark:text-orange-200 uppercase tracking-wider flex items-center gap-1.5">
                    📸 Product Photographs (High-Res Photos)
                  </label>
                  <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300">
                    {(productForm.images || []).length} photo(s) added
                  </span>
                </div>

                {/* Primary Image Preview & Gallery Thumbnails */}
                {productForm.images && productForm.images.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {productForm.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`relative w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 group bg-white dark:bg-gray-800 ${
                          productForm.image === imgUrl
                            ? 'border-orange-500 ring-2 ring-orange-500/30'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Product photo ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain p-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5 shadow hover:scale-110 transition-transform"
                          title="Remove Photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {productForm.image === imgUrl && (
                          <span className="absolute bottom-0 inset-x-0 bg-orange-500 text-white text-[8px] font-black text-center py-0.5">
                            PRIMARY
                          </span>
                        )}
                        {productForm.image !== imgUrl && (
                          <button
                            type="button"
                            onClick={() => setProductForm({ ...productForm, image: imgUrl })}
                            className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-bold text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Set Primary
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Photo controls: URL Entry & File Upload */}
                <div className="space-y-2 pt-1">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste photo URL (https://...)"
                      value={newImageUrlInput}
                      onChange={e => setNewImageUrlInput(e.target.value)}
                      className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition-colors shrink-0"
                    >
                      + Add URL
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-orange-200/50 dark:border-orange-800/50">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                      Or upload photo file directly:
                    </span>
                    <label className="cursor-pointer bg-white dark:bg-gray-800 border border-orange-300 dark:border-orange-700 hover:bg-orange-100 text-orange-800 dark:text-orange-200 text-xs font-bold px-3 py-1 rounded-xl shadow-sm transition-colors flex items-center gap-1">
                      📁 Browse & Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={e => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1">Weight / Unit</label>
                  <input
                    type="text"
                    value={productForm.weightUnit}
                    onChange={e => setProductForm({ ...productForm, weightUnit: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1">Delivery ETA (Mins)</label>
                  <input
                    type="number"
                    value={productForm.deliveryTimeMins}
                    onChange={e => setProductForm({ ...productForm, deliveryTimeMins: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl border text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black px-6 py-2 rounded-xl"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Creation & Editing Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs font-bold border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-base font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Grid className="w-5 h-5 text-orange-500" />
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block mb-1 text-[10px] font-black uppercase text-gray-500">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  placeholder="e.g. Organic Herbs & Spices"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-[10px] font-black uppercase text-gray-500">
                    Emoji Icon
                  </label>
                  <input
                    type="text"
                    value={catEmoji}
                    onChange={e => setCatEmoji(e.target.value)}
                    placeholder="e.g. 🥬"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-center text-xl"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[10px] font-black uppercase text-gray-500">
                    Badge Theme
                  </label>
                  <select
                    value={catBgLight}
                    onChange={e => setCatBgLight(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2 text-xs font-bold"
                  >
                    <option value="bg-orange-100 text-orange-800">Fresh Orange</option>
                    <option value="bg-amber-100 text-amber-800">Milk Amber</option>
                    <option value="bg-yellow-100 text-yellow-800">Juice Yellow</option>
                    <option value="bg-emerald-100 text-emerald-800">Herbal Green</option>
                    <option value="bg-blue-100 text-blue-800">Aqua Clean</option>
                    <option value="bg-purple-100 text-purple-800">Purple Beauty</option>
                    <option value="bg-rose-100 text-rose-800">Rose Snacks</option>
                  </select>
                </div>
              </div>

              {/* Real Category Image Section */}
              <div className="bg-orange-50/60 dark:bg-orange-950/30 p-3.5 rounded-2xl border border-orange-200/80 dark:border-orange-800/50 space-y-2.5">
                <label className="text-xs font-black text-orange-950 dark:text-orange-200 uppercase tracking-wider flex items-center gap-1.5">
                  🖼️ Real Category Image (Card Photo)
                </label>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  Add a high-res photo URL or upload a real image file to display on customer store cards.
                </p>

                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="Paste Image URL (https://images.unsplash.com/...)"
                    value={catImageUrl}
                    onChange={e => setCatImageUrl(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-medium"
                  />

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                      Or upload photo file directly:
                    </span>
                    <label className="cursor-pointer bg-white dark:bg-gray-800 border border-orange-300 dark:border-orange-700 hover:bg-orange-100 text-orange-800 dark:text-orange-200 text-xs font-bold px-3 py-1 rounded-xl shadow-sm transition-colors flex items-center gap-1">
                      📁 Browse & Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCategoryFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Live Category Image Preview */}
                {catImageUrl && (
                  <div className="mt-2 flex items-center gap-3 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <img
                      src={catImageUrl}
                      alt="Category preview"
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-cover rounded-lg border border-orange-300 shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-[10px]">
                      <span className="font-bold text-emerald-600 block">✓ Real Image Attached</span>
                      <span className="text-gray-400 truncate block font-mono">{catImageUrl}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCatImageUrl('')}
                      className="text-rose-500 hover:text-rose-700 text-[10px] font-bold px-2 py-1 bg-rose-50 dark:bg-rose-950/40 rounded-lg shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black px-6 py-2 rounded-xl shadow-md transition-transform active:scale-95"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partner Onboarding Modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs font-bold">
            <h3 className="text-base font-black">Register New Delivery Partner</h3>
            <p className="text-gray-400 font-normal">
              Direct Admin Registration (Self-registration is disabled for security).
            </p>

            <form onSubmit={handleRegisterPartner} className="space-y-3">
              <div>
                <label className="block mb-1">Full Name</label>
                <input
                  type="text"
                  value={partnerForm.name}
                  onChange={e => setPartnerForm({ ...partnerForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Verma"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={partnerForm.phone}
                  onChange={e => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                  placeholder="+91 98000 00000"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1">Vehicle Type</label>
                  <select
                    value={partnerForm.vehicleType}
                    onChange={e => setPartnerForm({ ...partnerForm, vehicleType: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-xl px-2 py-2 text-xs"
                  >
                    <option value="EV Scooter">EV Scooter</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="E-Bicycle">E-Bicycle</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Vehicle No.</label>
                  <input
                    type="text"
                    value={partnerForm.vehicleNumber}
                    onChange={e => setPartnerForm({ ...partnerForm, vehicleNumber: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPartnerModal(false)}
                  className="px-4 py-2 rounded-xl border text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black px-5 py-2 rounded-xl"
                >
                  Register Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Account Provisioning Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4 text-xs font-bold">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-orange-500" />
                Provision Staff / Partner Account
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-[11px] font-semibold">
              <p>🔒 <strong>Access Control Rule</strong>: Self-registration is strictly blocked for staff accounts. Provide these login details directly to the assigned staff member.</p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block mb-1 uppercase text-gray-500 text-[10px] font-black">Full Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 uppercase text-gray-500 text-[10px] font-black">Account Role</label>
                  <select
                    value={userForm.role}
                    onChange={e => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2 text-xs font-bold"
                  >
                    <option value="partner">Delivery Partner</option>
                    <option value="store">Store User</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 uppercase text-gray-500 text-[10px] font-black">Email / Identifier</label>
                  <input
                    type="email"
                    value={userForm.email || userForm.username}
                    onChange={e => setUserForm({ ...userForm, email: e.target.value, username: e.target.value })}
                    placeholder="e.g. rahul@partnerquickpal.in"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 uppercase text-gray-500 text-[10px] font-black">Phone Number</label>
                  <input
                    type="tel"
                    value={userForm.phone}
                    onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1 uppercase text-gray-500 text-[10px] font-black">Account Password</label>
                  <input
                    type="text"
                    value={userForm.password}
                    onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="e.g. partner123"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={userForm.isActive}
                  onChange={e => setUserForm({ ...userForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <label htmlFor="isActiveCheck" className="text-xs text-gray-700 dark:text-gray-300 font-bold">
                  Account Activated (Can log in immediately)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black px-5 py-2 rounded-xl shadow-md"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Staff ID Custom Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs font-bold border border-rose-200 dark:border-rose-900/50">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100">Confirm Delete Staff ID</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold leading-relaxed">
              Are you sure you want to permanently delete staff account <span className="text-rose-600 dark:text-rose-400 font-black">'{userToDelete.name}'</span> (ID: <span className="font-mono text-orange-600 dark:text-orange-400 font-bold">#{userToDelete.id}</span>, Role: <span className="uppercase text-purple-600">{userToDelete.role}</span>)?
            </p>
            <p className="text-[11px] text-gray-500 font-normal">
              This action will permanently delete this staff ID and revoke all system access credentials immediately.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteUser(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black px-4 py-2 rounded-xl shadow-md flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
