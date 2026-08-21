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
import { getDetectedPortalMode, PortalMode } from './utils/portalConfig';
import { UserRole } from './types';
import {
  Home,
  Grid,
  Heart,
  ShoppingBag,
  HelpCircle,
  Smartphone,
  Apple,
  Globe
} from 'lucide-react';

function AppContent() {
  const { currentRole, setCurrentRole, currentUser, orders, setSelectedCategoryId } = useApp();

  const { mode: detectedPortalMode, isLockedStandalone } = getDetectedPortalMode();
  const isCustomerPortal = detectedPortalMode === 'customer';

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
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
    <div className="h-screen w-full flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors">
      {/* Role Switcher Top Bar */}
      <RoleBar
        onOpenAuth={handleOpenAuth}
        onOpenDeploymentGuide={() => {
          if (!isCustomerPortal) {
            setIsDeploymentGuideOpen(true);
          }
        }}
      />

      {/* Main App Header - ONLY shown in customer storefront */}
      {currentRole === 'customer' && (
        <Header
          onOpenCart={() => setIsCartOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenOrders={() => setIsOrderHistoryOpen(true)}
          onOpenAuth={() => handleOpenAuth('customer')}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          onOpenFaqDashboard={() => setCustomerMainView(prev => prev === 'faqs' ? 'store' : 'faqs')}
        />
      )}

      {/* Main App Navigation Bar for Customer View Switch */}
      {currentRole === 'customer' && (
        <div className="bg-orange-600 dark:bg-orange-950 text-white px-4 py-1.5 flex items-center justify-between text-xs font-bold border-b border-orange-500/30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCustomerMainView('store')}
              className={`px-3 py-1 rounded-lg transition-all ${
                customerMainView === 'store'
                  ? 'bg-white text-orange-700 font-black shadow-xs'
                  : 'text-orange-100 hover:text-white'
              }`}
            >
              🛒 Grocery Store
            </button>
            <button
              onClick={() => setCustomerMainView('faqs')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                customerMainView === 'faqs'
                  ? 'bg-white text-orange-700 font-black shadow-xs'
                  : 'text-orange-100 hover:text-white'
              }`}
            >
              ❓ Help & FAQ Dashboard
            </button>
          </div>

          <button
            onClick={() => setIsAiAssistantOpen(true)}
            className="text-yellow-300 hover:text-white font-black text-[11px] flex items-center gap-1"
          >
            🤖 AI Customer Assistant (24/7 Live) →
          </button>
        </div>
      )}

      {/* Active Role Dashboard Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        {currentRole === 'customer' && (
          customerMainView === 'faqs' ? (
            <div className="flex-1 overflow-y-auto">
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
            />
          )
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

      {/* Footer Navigation & Brand Footer - ONLY for Customer View */}
      {currentRole === 'customer' && (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 sm:px-8 py-2.5 flex items-center justify-between shrink-0 shadow-lg z-30">
          <div className="flex items-center gap-6 sm:gap-8">
            <div
              onClick={() => setSelectedCategoryId(null)}
              className="flex flex-col items-center gap-0.5 cursor-pointer text-emerald-600 dark:text-emerald-400 hover:scale-105 transition-transform"
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-bold">Home</span>
            </div>

            <div
              onClick={() => {
                setSelectedCategoryId(null);
              }}
              className="flex flex-col items-center gap-0.5 cursor-pointer text-gray-400 hover:text-emerald-600 transition-colors"
            >
              <Grid className="w-5 h-5" />
              <span className="text-[10px] font-bold">Categories</span>
            </div>

            <div
              onClick={() => setIsWishlistOpen(true)}
              className="flex flex-col items-center gap-0.5 cursor-pointer text-gray-400 hover:text-emerald-600 transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span className="text-[10px] font-bold">Wishlist</span>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <button
              onClick={() => setIsAiAssistantOpen(true)}
              className="text-xs text-orange-600 dark:text-orange-400 font-bold italic hover:underline hidden sm:block"
            >
              🤖 24/7 AI Customer Support
            </button>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 hidden sm:block">
              Download App:
            </span>
            <div className="flex gap-1.5">
              <div
                className="w-7 h-7 bg-gray-800 text-white rounded-lg flex items-center justify-center text-xs shadow cursor-pointer hover:bg-gray-700"
                title="iOS App Store"
              >
                🍎
              </div>
              <div
                className="w-7 h-7 bg-gray-800 text-white rounded-lg flex items-center justify-center text-xs shadow cursor-pointer hover:bg-gray-700"
                title="Android Play Store"
              >
                ▶
              </div>
            </div>
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
