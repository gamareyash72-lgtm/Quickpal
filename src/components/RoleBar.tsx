import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { ShoppingBag, Bike, ShieldCheck, Store, Moon, Sun, Lock, LogOut, UserCheck } from 'lucide-react';

interface RoleBarProps {
  onOpenAuth?: (role?: UserRole) => void;
}

export const RoleBar: React.FC<RoleBarProps> = ({ onOpenAuth }) => {
  const { currentRole, setCurrentRole, themeMode, toggleTheme, currentUser, logoutUser } = useApp();

  const isStaffAuthenticated = currentUser && currentUser.role !== 'customer';

  // Allowed tabs based on staff user role
  const getAuthorizedRoles = (): { id: UserRole; label: string; icon: React.ReactNode }[] => {
    if (!isStaffAuthenticated) return [];

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

  return (
    <div className="bg-slate-950 text-white text-xs py-2 px-4 flex flex-wrap items-center justify-between border-b border-slate-800 shrink-0 gap-2 relative">
      <div className="flex items-center gap-3">
        {/* Tiranga Flag Pill */}
        <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 shadow-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
        </div>

        <span className="font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
          QuickPal Saphale (401102)
        </span>

        {isStaffAuthenticated ? (
          <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1 rounded-lg border border-orange-500/30 text-[11px]">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-slate-200">
              {currentUser.name} <span className="text-orange-400 font-mono text-[10px]">({currentUser.role.toUpperCase()})</span>
            </span>
          </div>
        ) : (
          <span className="hidden md:inline text-slate-400 text-[11px] font-bold">
            🇮🇳 Tiranga Theme | Hyperlocal Express Delivery
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* If Staff Authenticated: Render Authorized Portal Tabs */}
        {isStaffAuthenticated && authorizedRoles.length > 0 && (
          <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
            <button
              onClick={() => setCurrentRole('customer')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition-all text-[11px] ${
                currentRole === 'customer'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Storefront View</span>
            </button>

            {authorizedRoles.map(r => (
              <button
                key={r.id}
                onClick={() => setCurrentRole(r.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition-all text-[11px] ${
                  currentRole === r.id
                    ? 'bg-amber-500 text-gray-950 shadow-md font-extrabold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Sign Out Button for Staff */}
        {isStaffAuthenticated && (
          <button
            onClick={() => {
              logoutUser();
              setCurrentRole('customer');
            }}
            className="p-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/50 transition-colors flex items-center gap-1 text-[11px] font-bold"
            title="Sign Out Staff Account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-700 transition-colors"
          title="Toggle Light/Dark Theme"
        >
          {themeMode === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-orange-400" />}
        </button>
      </div>
    </div>
  );
};
