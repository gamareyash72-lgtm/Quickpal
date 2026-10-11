import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { ShoppingBag, Bike, ShieldCheck, Store, Moon, Sun, Lock, LogOut, UserCheck, Globe } from 'lucide-react';
import { getDetectedPortalMode } from '../utils/portalConfig';

interface RoleBarProps {
  onOpenAuth?: (role?: UserRole) => void;
  onOpenDeploymentGuide?: () => void;
}

export const RoleBar: React.FC<RoleBarProps> = ({ onOpenAuth, onOpenDeploymentGuide }) => {
  const { currentRole, setCurrentRole, themeMode, toggleTheme, currentUser, logoutUser } = useApp();
  const { mode: detectedMode, isLockedStandalone } = getDetectedPortalMode();

  const isCustomerPortal = detectedMode === 'customer';
  const isStaffAuthenticated = currentUser && currentUser.role !== 'customer';
  const isOwnerOrAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  // Allowed tabs based on staff user role - NEVER shown in Customer Portal
  const getAuthorizedRoles = (): { id: UserRole; label: string; icon: React.ReactNode }[] => {
    if (isCustomerPortal || !isStaffAuthenticated) return [];

    const userRole = currentUser.role;
    const allRoles: { id: UserRole; label: string; icon: React.ReactNode }[] = [
      { id: 'partner', label: 'Delivery Partner', icon: <Bike className="w-3.5 h-3.5" /> },
      { id: 'store', label: 'Store Staff', icon: <Store className="w-3.5 h-3.5" /> },
      { id: 'admin', label: 'Admin Dashboard', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
      { id: 'owner', label: 'Store Owner', icon: <Store className="w-3.5 h-3.5" /> },
    ];

    if (userRole === 'partner') {
      return allRoles.filter(r => r.id === 'partner');
    }
    if (userRole === 'store') {
      return allRoles.filter(r => r.id === 'store');
    }
    if (userRole === 'admin') {
      return allRoles.filter(r => r.id === 'admin' || r.id === 'store' || r.id === 'partner');
    }
    if (userRole === 'owner') {
      return allRoles;
    }
    return [];
  };

  const authorizedRoles = getAuthorizedRoles();

  // Completely hidden on customer portal or from regular customers
  const showDeploymentGuideButton = Boolean(
    !isCustomerPortal && onOpenDeploymentGuide && (!isLockedStandalone || isOwnerOrAdmin)
  );

  // When browsing customer storefront without staff privileges, hide top role bar completely
  if (currentRole === 'customer' && !isStaffAuthenticated) {
    return null;
  }

  return (
    <div className="bg-orange-700 text-white text-xs py-2 px-4 flex flex-wrap items-center justify-between border-b border-orange-800 shrink-0 gap-2 relative">
      <div className="flex items-center gap-3 relative z-10">
        {/* Speed Pill */}
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#FF6A00] text-[10px] font-black shadow-xs">
          <span>⚡</span>
          <span>30-MIN DELIVERY</span>
        </div>

        <span className="font-black tracking-wide text-white flex items-center gap-1.5">
          QuickPal Saphale <span className="text-orange-200 font-mono text-[10px]">(401102)</span>
        </span>

        {currentUser && !isCustomerPortal && isStaffAuthenticated ? (
          <div className="flex items-center gap-2 bg-orange-800 px-2.5 py-1 rounded-lg border border-orange-600 text-[11px]">
            <UserCheck className="w-3.5 h-3.5 text-white" />
            <span className="font-bold text-white">
              {currentUser.name} <span className="text-orange-200 font-mono text-[10px]">({currentUser.role.toUpperCase()})</span>
            </span>
          </div>
        ) : currentUser && currentUser.role === 'customer' ? (
          <span className="hidden md:inline text-orange-100 text-[11px] font-semibold">
            Welcome, {currentUser.name}! 🚀 30-Min Delivery in Saphale
          </span>
        ) : detectedMode === 'partner' ? (
          <span className="hidden md:inline text-white font-bold text-[11px]">
            🛵 Rider Fleet & Delivery Partner Portal (401102)
          </span>
        ) : detectedMode === 'admin' ? (
          <span className="hidden md:inline text-white font-bold text-[11px]">
            🛡️ Admin Dispatch & Inventory Operations (401102)
          </span>
        ) : detectedMode === 'owner' ? (
          <span className="hidden md:inline text-white font-bold text-[11px]">
            👑 Owner Business Suite & P&L Analytics (401102)
          </span>
        ) : (
          <span className="hidden md:inline text-orange-100 text-[11px] font-medium">
            Fresh Groceries & Daily Essentials in 30 Mins • Hyperlocal Saphale
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* If Staff Authenticated in non-customer portal: Render Authorized Portal Tabs */}
        {!isCustomerPortal && isStaffAuthenticated && authorizedRoles.length > 0 && (
          <div className="flex bg-orange-800 p-1 rounded-lg border border-orange-600">
            {!isLockedStandalone && (
              <button
                onClick={() => setCurrentRole('customer')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition-all text-[11px] ${
                  currentRole === 'customer'
                    ? 'bg-white text-[#FF6A00] shadow-md font-extrabold'
                    : 'text-orange-100 hover:text-white hover:bg-orange-700/50'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Storefront View</span>
              </button>
            )}

            {authorizedRoles.map(r => (
              <button
                key={r.id}
                onClick={() => setCurrentRole(r.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition-all text-[11px] ${
                  currentRole === r.id
                    ? 'bg-white text-[#FF6A00] shadow-md font-extrabold'
                    : 'text-orange-100 hover:text-white hover:bg-orange-700/50'
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Sign Out Button for Staff in non-customer portal */}
        {!isCustomerPortal && isStaffAuthenticated && (
          <button
            onClick={() => {
              logoutUser();
              if (!isLockedStandalone) {
                setCurrentRole('customer');
              }
            }}
            className="p-1.5 rounded-lg bg-orange-800 hover:bg-orange-900 text-white border border-orange-600 transition-colors flex items-center gap-1 text-[11px] font-bold"
            title="Sign Out Staff Account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        )}

        {/* 4 Websites & Vercel Guide Trigger - Strictly hidden from Customer Portal */}
        {showDeploymentGuideButton && (
          <button
            onClick={onOpenDeploymentGuide}
            className="px-2.5 py-1 rounded-lg bg-orange-800 hover:bg-orange-900 text-white border border-orange-600 text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs"
            title="Open 4 Websites & Vercel Deployment Guide"
          >
            <Globe className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">4 Portals Architecture</span>
            <span className="sm:hidden">4 Sites</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg bg-orange-800 text-white hover:bg-orange-900 border border-orange-600 transition-colors"
          title="Toggle Light/Dark Theme"
        >
          {themeMode === 'dark' ? <Sun className="w-4 h-4 text-yellow-300" /> : <Moon className="w-4 h-4 text-white" />}
        </button>
      </div>
    </div>
  );
};

