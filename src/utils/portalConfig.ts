export type PortalMode = 'customer' | 'partner' | 'admin' | 'owner' | 'unified';

export interface PortalMetadata {
  id: PortalMode;
  name: string;
  shortName: string;
  tagline: string;
  icon: string;
  recommendedDomain: string;
  envVariableValue: string;
  themeColor: string;
  description: string;
  targetRole: string;
}

export const PORTAL_METADATA: Record<PortalMode, PortalMetadata> = {
  customer: {
    id: 'customer',
    name: 'QuickPal Express Grocery Store',
    shortName: 'Customer Store',
    tagline: '10-Minute Grocery Delivery in Saphale',
    icon: '🛒',
    recommendedDomain: 'quickpal.in (or customer.quickpal.in)',
    envVariableValue: 'VITE_PORTAL_MODE=customer',
    themeColor: 'from-orange-500 to-amber-600',
    description: 'Public storefront for customers to browse catalogue, add to cart, pay via UPI/COD, and live track delivery.',
    targetRole: 'customer'
  },
  partner: {
    id: 'partner',
    name: 'QuickPal Delivery Rider Fleet',
    shortName: 'Rider App',
    tagline: 'Hyperlocal Rider Order Pickup & OTP Delivery',
    icon: '🛵',
    recommendedDomain: 'rider.quickpal.in (or partner.quickpal.in)',
    envVariableValue: 'VITE_PORTAL_MODE=partner',
    themeColor: 'from-blue-600 to-indigo-700',
    description: 'Dedicated portal for delivery partners to receive order dispatches, accept/reject pickups, verify customer OTP, and track daily earnings.',
    targetRole: 'partner'
  },
  admin: {
    id: 'admin',
    name: 'QuickPal Store Operations & Admin',
    shortName: 'Admin Portal',
    tagline: 'Inventory, Orders Dispatch & Partner Management',
    icon: '🛡️',
    recommendedDomain: 'admin.quickpal.in',
    envVariableValue: 'VITE_PORTAL_MODE=admin',
    themeColor: 'from-emerald-600 to-teal-700',
    description: 'Backoffice management dashboard for store managers to accept orders, manage catalog prices & stock, assign riders, and handle support tickets.',
    targetRole: 'admin'
  },
  owner: {
    id: 'owner',
    name: 'QuickPal Executive Owner Suite',
    shortName: 'Owner Hub',
    tagline: 'Executive Analytics, Financials & Master Settings',
    icon: '👑',
    recommendedDomain: 'owner.quickpal.in',
    envVariableValue: 'VITE_PORTAL_MODE=owner',
    themeColor: 'from-purple-700 to-violet-900',
    description: 'Executive command center with real-time revenue analytics, profit margins, staff account provisioning, UPI QR controls, and PIN code serviceable area management.',
    targetRole: 'owner'
  },
  unified: {
    id: 'unified',
    name: 'QuickPal Unified Multi-Portal Platform',
    shortName: 'All Portals (Preview)',
    tagline: 'Integrated Suite with Role Switcher Bar',
    icon: '⚡',
    recommendedDomain: 'dev.quickpal.in',
    envVariableValue: 'VITE_PORTAL_MODE=unified',
    themeColor: 'from-orange-600 to-amber-700',
    description: 'Development and testing workspace with top RoleBar to preview and switch between Customer, Rider, Admin, and Owner views.',
    targetRole: 'all'
  }
};

/**
 * Detects the active portal based on:
 * 1. Build-time / Vercel Environment Variable: VITE_PORTAL_MODE
 * 2. URL search parameters: ?portal=customer | ?portal=partner | ?portal=admin | ?portal=owner
 * 3. URL hash routing: #/customer | #/partner | #/admin | #/owner
 * 4. Subdomain matching: partner.*, rider.*, admin.*, owner.*, customer.*
 */
export function getDetectedPortalMode(): { mode: PortalMode; isLockedStandalone: boolean } {
  if (typeof window === 'undefined') {
    return { mode: 'unified', isLockedStandalone: false };
  }

  // 1. Check explicit build-time / runtime environment variable
  const envMode = (import.meta as any).env?.VITE_PORTAL_MODE as string | undefined;
  if (envMode && (envMode === 'customer' || envMode === 'partner' || envMode === 'admin' || envMode === 'owner')) {
    return { mode: envMode, isLockedStandalone: true };
  }

  // 2. Check URL Search Parameters (e.g. ?portal=admin)
  const urlParams = new URLSearchParams(window.location.search);
  const portalParam = urlParams.get('portal')?.toLowerCase() || urlParams.get('role')?.toLowerCase() || urlParams.get('app')?.toLowerCase();
  if (portalParam === 'customer' || portalParam === 'partner' || portalParam === 'admin' || portalParam === 'owner' || portalParam === 'rider') {
    const mapped = portalParam === 'rider' ? 'partner' : (portalParam as PortalMode);
    return { mode: mapped, isLockedStandalone: true };
  }

  // 3. Check URL Hash (e.g. #/partner, #/admin)
  const hash = window.location.hash.toLowerCase();
  if (hash.includes('partner') || hash.includes('rider')) {
    return { mode: 'partner', isLockedStandalone: true };
  }
  if (hash.includes('admin')) {
    return { mode: 'admin', isLockedStandalone: true };
  }
  if (hash.includes('owner')) {
    return { mode: 'owner', isLockedStandalone: true };
  }
  if (hash.includes('customer') || hash.includes('store')) {
    return { mode: 'customer', isLockedStandalone: true };
  }

  // 4. Check Subdomain (e.g. partner.quickpal.in, admin.quickpal.in, owner.quickpal.in)
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.startsWith('partner.') || hostname.startsWith('rider.') || hostname.includes('rider-') || hostname.includes('partner-')) {
    return { mode: 'partner', isLockedStandalone: true };
  }
  if (hostname.startsWith('admin.') || hostname.includes('admin-')) {
    return { mode: 'admin', isLockedStandalone: true };
  }
  if (hostname.startsWith('owner.') || hostname.includes('owner-')) {
    return { mode: 'owner', isLockedStandalone: true };
  }
  if (hostname.startsWith('customer.') || hostname.startsWith('store.') || hostname.includes('customer-')) {
    return { mode: 'customer', isLockedStandalone: true };
  }

  // Default: Unified multi-portal mode with role switcher
  return { mode: 'unified', isLockedStandalone: false };
}
