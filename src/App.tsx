import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RoleBar } from './components/RoleBar';
import { Header } from './components/Header';
import { CustomerDashboard } from './components/CustomerDashboard';
import { DeliveryPartnerDashboard } from './components/DeliveryPartnerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { OwnerDashboard } from './components/OwnerDashboard';
import { StoreStaffDashboard } from './components/StoreStaffDashboard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { LiveOrderTrackingModal } from './components/LiveOrderTrackingModal';
import { NotificationsModal } from './components/NotificationsModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { WishlistModal } from './components/WishlistModal';
import { AuthModal } from './components/AuthModal';
import { FaqDashboard } from './components/FaqDashboard';
import { AiAssistantModal } from './components/AiAssistantModal';
import { MultiSiteDeploymentModal } from './components/MultiSiteDeploymentModal';
import { DiwaliCelebration } from './components/DiwaliCelebration';
import { getDetectedPortalMode } from './utils/portalConfig';
import { UserRole, Product } from './types';
import {
  Home,
  Grid,
  Heart,
  ShoppingBag,
  RotateCcw,
  Plus,
  Minus,
  X
} from 'lucide-react';

function AppContent() {
  const {
    currentRole,
    setCurrentRole,
    currentUser,
    orders,
    products,
    categories,
    cartItems,
    addToCart,
    updateQuantity,
    selectedCategoryId,
    setSelectedCategoryId,
    setSelectedStoreId,
    setSearchQuery,
    searchQuery
  } = useApp();

  const { mode: detectedPortalMode, isLockedStandalone } = getDetectedPortalMode();
  const isCustomerPortal = detectedPortalMode === 'customer';

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isOrderAgainOpen, setIsOrderAgainOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<UserRole>('customer');
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [isDeploymentGuideOpen, setIsDeploymentGuideOpen] = useState(false);

  // FAQ Dashboard & AI Assistant States
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [customerMainView, setCustomerMainView] = useState<'store' | 'faqs'>('store');

  // Automatic portal detection based on Vercel Env Var or Subdomain/Query Parameter
  useEffect(() => {
    const { mode, isLockedStandalone } = getDetectedPortalMode();
    if (isLockedStandalone && mode !== 'unified') {
      setCurrentRole(mode as UserRole);
    }
  }, [setCurrentRole]);

  // When searching, guarantee customer view switches to the store
  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== '' && customerMainView !== 'store') {
      setCustomerMainView('store');
    }
  }, [searchQuery, customerMainView]);

  const handleOpenAuth = (role?: UserRole) => {
    if (isCustomerPortal) {
      setAuthDefaultRole('customer');
    } else if (role) {
      setAuthDefaultRole(role);
    }
    setIsAuthModalOpen(true);
  };

  const isStaffRoleRequested = !isCustomerPortal && (currentRole === 'partner' || currentRole === 'admin' || currentRole === 'store' || currentRole === 'owner');

  const isAuthorizedForRequestedRole = () => {
    if (!currentUser || isCustomerPortal) return false;
    if (currentRole === 'partner' && currentUser.role === 'partner') return true;
    if (currentRole === 'store' && (currentUser.role === 'store' || currentUser.role === 'admin' || currentUser.role === 'owner')) return true;
    if (currentRole === 'admin' && (currentUser.role === 'admin' || currentUser.role === 'owner')) return true;
    if (currentRole === 'owner' && currentUser.role === 'owner') return true;
    return false;
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-[#FF6A00] selection:text-white transition-colors">
      {/* Role Switcher Top Bar */}
      <RoleBar
        onOpenAuth={handleOpenAuth}
        onOpenDeploymentGuide={() => {
          if (!isCustomerPortal) {
            setIsDeploymentGuideOpen(true);
          }
        }}
      />

      {/* Main App Content */}
      <main
        id="customer-scroll-root"
        className={`flex-1 flex flex-col relative ${
          currentRole === 'customer' ? 'overflow-y-auto' : 'overflow-hidden'
        }`}
      >
        {/* Main App Header + Customer Storefront share unified scroll root so Orange bar scrolls away & Search Bar sticks cleanly to top */}
        {currentRole === 'customer' && (
          <>
            <Header
              onOpenCart={() => setIsCartOpen(true)}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onOpenWishlist={() => setIsWishlistOpen(true)}
              onOpenOrders={() => setIsOrderHistoryOpen(true)}
              onOpenAuth={() => handleOpenAuth('customer')}
              onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
              onOpenFaqDashboard={() => setCustomerMainView(prev => prev === 'faqs' ? 'store' : 'faqs')}
              onNavigateToStore={() => setCustomerMainView('store')}
            />

            {customerMainView === 'faqs' ? (
              <div className="flex-1">
                <FaqDashboard
                  onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
                  onOpenOrders={() => setIsOrderHistoryOpen(true)}
                />
              </div>
            ) : (
              <CustomerDashboard
                onOpenCart={() => setIsCartOpen(true)}
                onOpenCheckout={() => setIsCheckoutOpen(true)}
                onTrackOrder={orderId => setTrackingOrderId(orderId)}
                onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
                onOpenOrders={() => setIsOrderHistoryOpen(true)}
              />
            )}
          </>
        )}

        {/* Staff Role Access Control & Sign-In Screen */}
        {isStaffRoleRequested && !isAuthorizedForRequestedRole() && (
          <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-stone-900 to-black text-white">
            <div className="max-w-md w-full bg-gray-900/90 border border-amber-500/30 rounded-3xl p-8 text-center shadow-2xl space-y-5 backdrop-blur-md">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center font-black text-3xl shadow-inner">
                {currentRole === 'partner' ? '🛵' : currentRole === 'admin' ? '🛡️' : currentRole === 'owner' ? '👑' : '🏬'}
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {currentRole === 'partner'
                    ? 'QuickPal Rider Fleet Portal'
                    : currentRole === 'admin'
                    ? 'QuickPal Admin Console'
                    : currentRole === 'owner'
                    ? 'QuickPal Owner Operations'
                    : 'QuickPal Store Operations'}
                </h2>
                <p className="text-xs text-amber-300 font-bold mt-1">
                  Saphale (401102) Hyperlocal Network
                </p>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                {currentUser ? (
                  <>
                    Logged in as <strong>{currentUser.name}</strong> ({currentUser.role?.toUpperCase()}). You do not have permission for the <strong>{currentRole.toUpperCase()}</strong> portal.
                  </>
                ) : (
                  <>
                    Please sign in with your registered <strong>{currentRole.toUpperCase()}</strong> staff credentials to manage orders, live dispatch, and shift status.
                  </>
                )}
              </p>
              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={() => handleOpenAuth(currentRole)}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black text-xs rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  🔑 Sign In as {currentRole === 'partner' ? 'Delivery Partner' : currentRole === 'admin' ? 'Administrator' : currentRole === 'owner' ? 'Store Owner' : 'Store Staff'}
                </button>
                {!isLockedStandalone && (
                  <button
                    onClick={() => setCurrentRole('customer')}
                    className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-2xl transition-colors"
                  >
                    Go to Customer Storefront
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Authorized Staff Dashboards */}
        {isStaffRoleRequested && isAuthorizedForRequestedRole() && (
          <>
            {currentRole === 'partner' && <DeliveryPartnerDashboard />}
            {currentRole === 'admin' && <AdminDashboard />}
            {currentRole === 'store' && <StoreStaffDashboard />}
            {currentRole === 'owner' && <OwnerDashboard />}
          </>
        )}
      </main>

      {/* Blinkit-Style Bottom Navigation Bar - ONLY for Customer View */}
      {currentRole === 'customer' && (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-3 sm:px-8 py-2 flex items-center justify-between shrink-0 shadow-lg z-30">
          <div className="flex items-center justify-around sm:justify-start w-full sm:w-auto gap-4 sm:gap-8">
            <button
              type="button"
              onClick={() => {
                setCustomerMainView('store');
                setSelectedCategoryId(null);
                setSelectedStoreId(null);
                setSearchQuery('');
              }}
              className={`flex flex-col items-center gap-0.5 cursor-pointer transition-transform hover:scale-105 ${
                !selectedCategoryId && customerMainView === 'store' ? 'text-[#FF6A00]' : 'text-gray-500 hover:text-[#FF6A00]'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-black">Home</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOrderAgainOpen(true)}
              className="flex flex-col items-center gap-0.5 cursor-pointer text-gray-500 hover:text-[#FF6A00] transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="text-[10px] font-bold">Order Again</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCustomerMainView('store');
                setSearchQuery('');
                setSelectedCategoryId(selectedCategoryId || categories[0]?.id || 'cat-dairy');
              }}
              className={`flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                selectedCategoryId ? 'text-[#FF6A00]' : 'text-gray-500 hover:text-[#FF6A00]'
              }`}
            >
              <Grid className="w-5 h-5" />
              <span className="text-[10px] font-black">Categories</span>
            </button>

            <button
              type="button"
              onClick={() => setIsWishlistOpen(true)}
              className="flex flex-col items-center gap-0.5 cursor-pointer text-gray-500 hover:text-[#FF6A00] transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span className="text-[10px] font-bold">Wishlist</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOrderHistoryOpen(true)}
              className="flex flex-col items-center gap-0.5 cursor-pointer text-gray-500 hover:text-[#FF6A00] transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[10px] font-bold">Orders</span>
            </button>
          </div>

          <div className="hidden md:flex gap-4 items-center">
            <button
              onClick={() => setIsAiAssistantOpen(true)}
              className="text-xs text-[#FF6A00] font-bold italic hover:underline cursor-pointer"
            >
              🤖 24/7 AI Customer Support
            </button>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
              Saphale 30-Min Express
            </span>
          </div>
        </footer>
      )}

      {/* Global Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={orderId => {
          setIsCheckoutOpen(false);
          setTrackingOrderId(orderId);
        }}
      />

      <LiveOrderTrackingModal
        orderId={trackingOrderId}
        onClose={() => setTrackingOrderId(null)}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onTrackOrder={orderId => setTrackingOrderId(orderId)}
      />

      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        onTrackOrder={orderId => setTrackingOrderId(orderId)}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultRole={authDefaultRole}
      />

      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onOpenOrders={() => setIsOrderHistoryOpen(true)}
        onOpenFaqDashboard={() => setCustomerMainView('faqs')}
      />

      {!isCustomerPortal && (
        <MultiSiteDeploymentModal
          isOpen={isDeploymentGuideOpen}
          onClose={() => setIsDeploymentGuideOpen(false)}
          onSelectPortal={portal => {
            if (portal === 'unified') {
              setCurrentRole('customer');
            } else {
              setCurrentRole(portal as UserRole);
            }
          }}
        />
      )}

      {/* Order Again Quick Reorder Modal (Blinkit Bottom Nav Tab) */}
      {isOrderAgainOpen && (() => {
        const pastMap = new Map<string, Product>();
        orders.forEach(o => {
          const isMine =
            (currentUser && (o.customerId === currentUser.id || (currentUser.phone && o.customerPhone === currentUser.phone))) ||
            o.status === 'delivered';
          if (isMine) {
            o.items.forEach(item => {
              if (item?.product?.id && !pastMap.has(item.product.id)) {
                const liveProd = products.find(p => p.id === item.product.id) || item.product;
                if (!liveProd.isHidden) pastMap.set(liveProd.id, liveProd);
              }
            });
          }
        });
        const reorderProducts =
          pastMap.size > 0
            ? Array.from(pastMap.values())
            : products.filter(p => !p.isHidden && p.isFeatured).slice(0, 8);

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-orange-200 dark:border-gray-800">
              <div className="bg-[#FF6A00] text-white px-5 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Order Again</h3>
                    <p className="text-[11px] text-orange-100 font-bold">
                      1-tap reorder from your past Saphale baskets
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOrderAgainOpen(false)}
                  className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
                {reorderProducts.map(prod => {
                  const cItem = cartItems.find(i => i.product.id === prod.id);
                  return (
                    <div
                      key={prod.id}
                      className="bg-white dark:bg-gray-800 border border-orange-100 dark:border-gray-700 rounded-2xl p-3 flex flex-col justify-between gap-2 shadow-2xs"
                    >
                      <div className="h-24 bg-gray-50 dark:bg-gray-900 rounded-xl p-1.5 flex items-center justify-center overflow-hidden">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <span className="inline-block bg-orange-50 text-[#FF6A00] text-[9px] font-black px-1.5 py-0.5 rounded mb-1">
                          Bought Earlier
                        </span>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                          {prod.name}
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">{prod.weightUnit}</p>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-black text-gray-900 dark:text-white">
                          ₹{prod.price}
                        </span>
                        {cItem ? (
                          <div className="flex items-center bg-[#FF6A00] text-white rounded-xl">
                            <button
                              type="button"
                              onClick={() => updateQuantity(prod.id, cItem.quantity - 1)}
                              className="px-2 py-1 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-1.5 text-xs font-black">{cItem.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(prod.id, cItem.quantity + 1)}
                              className="px-2 py-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(prod, 1)}
                            className="border-2 border-[#FF6A00] text-[#FF6A00] hover:bg-[#FF6A00] hover:text-white bg-orange-50/70 font-black text-[11px] px-3 py-1 rounded-xl transition-colors cursor-pointer"
                          >
                            ADD
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setIsOrderAgainOpen(false);
                    setIsOrderHistoryOpen(true);
                  }}
                  className="text-xs font-black text-[#FF6A00] hover:underline cursor-pointer"
                >
                  View Full Order History →
                </button>
                <button
                  type="button"
                  onClick={() => setIsOrderAgainOpen(false)}
                  className="bg-[#FF6A00] text-white font-black text-xs px-5 py-2 rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Interactive Diwali Animation, Diya Lighting & Cracker Engine */}
      <DiwaliCelebration />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
