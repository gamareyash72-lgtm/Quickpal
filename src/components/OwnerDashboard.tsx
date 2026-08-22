import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { UserRole } from '../types';
import {
  Crown,
  UserPlus,
  Users,
  TrendingUp,
  ShieldCheck,
  Bike,
  Package,
  Sparkles,
  Trash2,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  KeyRound,
  Shield
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const {
    orders,
    users,
    partners,
    products,
    createUserByAdmin,
    deleteUser,
    toggleUserStatus,
    currentUser
  } = useApp();

  const staffUsers = users.filter(u => u.role !== 'customer');
  const customerUsers = users.filter(u => u.role === 'customer');

  const [activeTab, setActiveTab] = useState<
    'overview' | 'accounts' | 'products' | 'categories' | 'orders' | 'payment_audit' | 'partners' | 'coupons' | 'banners' | 'payments' | 'faqs' | 'tickets' | 'reports'
  >('overview');

  // Staff Provisioning Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState<'all' | 'partner' | 'store' | 'admin' | 'owner' | 'customer'>('all');
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string; role: string } | null>(null);

  const [userForm, setUserForm] = useState({
    name: '',
    role: 'partner' as UserRole,
    username: '',
    phone: '',
    email: '',
    password: '',
    isActive: true
  });

  const totalGrossRevenue = orders.reduce(
    (acc, o) => acc + (o.status !== 'cancelled' ? o.total : 0),
    0
  );
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const estimatedProfit = Math.round(totalGrossRevenue * 0.22); // 22% estimated net profit margin

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.password.trim()) {
      alert('Please fill in Name and Password.');
      return;
    }

    const emailToUse = userForm.email.trim() || 
      (userForm.username.trim().includes('@') 
        ? userForm.username.trim() 
        : `${(userForm.username.trim() || userForm.name.trim().toLowerCase().replace(/\s+/g, '') || 'partner')}@partnerquickpal.in`);

    const res = await createUserByAdmin({
      name: userForm.name.trim(),
      role: userForm.role,
      username: userForm.username.trim() || emailToUse.split('@')[0],
      phone: userForm.phone.trim() || undefined,
      email: emailToUse,
      password: userForm.password.trim(),
      status: userForm.isActive ? 'ACTIVE' : 'INACTIVE',
      isActive: userForm.isActive,
      isVerified: true
    });

    if (res.success) {
      alert(res.message);
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
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 space-y-6 pb-24">
      {/* Top Owner Master Authority Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-purple-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-amber-400/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-300 text-amber-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Crown className="w-3 h-3 fill-amber-950" />
              Store Owner Master Access
            </span>
            <span className="bg-emerald-500/30 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-400/30">
              All Admin Authorities Enabled
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            QuickPal Store Executive & Operational Suite
          </h2>
          <p className="text-xs text-amber-100 font-medium max-w-xl">
            You hold complete store ownership: Add staff accounts, delete staff IDs, manage product catalogs, audit payments, configure gateways, and control dispatch fleet.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowUserModal(true)}
            className="bg-white text-orange-950 hover:bg-amber-100 font-black text-xs px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
          >
            <UserPlus className="w-4 h-4 text-orange-600" /> Provision Staff ID
          </button>
        </div>
      </div>

      {/* Executive Key Performance Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-3 right-3 text-orange-500/10 dark:text-orange-400/10">
            <TrendingUp className="w-10 h-10" />
          </div>
          <span className="text-[10px] font-black uppercase text-gray-400 block">Gross Revenue</span>
          <p className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">₹{totalGrossRevenue}</p>
          <span className="text-[10px] text-gray-500 font-medium">Est. Net Profit: ~₹{estimatedProfit}</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-3 right-3 text-purple-500/10">
            <Users className="w-10 h-10" />
          </div>
          <span className="text-[10px] font-black uppercase text-gray-400 block">Total Staff Accounts</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{staffUsers.length}</p>
          <span className="text-[10px] text-gray-500 font-medium">Admins, Store & Delivery Staff</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-3 right-3 text-blue-500/10">
            <Bike className="w-10 h-10" />
          </div>
          <span className="text-[10px] font-black uppercase text-gray-400 block">Active Delivery Fleet</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{partners.length}</p>
          <span className="text-[10px] text-gray-500 font-medium">Registered 30-min riders</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-3 right-3 text-emerald-500/10">
            <Package className="w-10 h-10" />
          </div>
          <span className="text-[10px] font-black uppercase text-gray-400 block">Fulfilled Orders</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{deliveredCount}</p>
          <span className="text-[10px] text-gray-500 font-medium">Out of {orders.length} total orders</span>
        </div>
      </div>

      {/* Staff ID & Team Control Center */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-xs font-black">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-2">
                Staff ID & Role Management
                <span className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                  {staffUsers.length} Staff Accounts
                </span>
                {customerUsers.length > 0 && (
                  <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                    {customerUsers.length} App Customers
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Provision new team members, manage credentials, or delete obsolete staff IDs directly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUserModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              + Add Staff ID
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Staff ID (#dp-1), Name, Role, or Email..."
              value={staffSearchQuery}
              onChange={e => setStaffSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: `All Staff (${staffUsers.length})` },
              { id: 'partner', label: `Partner (${users.filter(u => u.role === 'partner').length})` },
              { id: 'store', label: `Store (${users.filter(u => u.role === 'store').length})` },
              { id: 'admin', label: `Admin (${users.filter(u => u.role === 'admin').length})` },
              { id: 'owner', label: `Owner (${users.filter(u => u.role === 'owner').length})` },
              { id: 'customer', label: `Customers (${customerUsers.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStaffRoleFilter(tab.id as any)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black uppercase transition-all shrink-0 ${
                  staffRoleFilter === tab.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-black">
                <th className="py-2.5 px-3">Staff ID</th>
                <th className="py-2.5 px-3">Name & Contact</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Login Identifier</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users
                .filter(u => {
                  const q = staffSearchQuery.toLowerCase();
                  const matchesSearch =
                    u.name.toLowerCase().includes(q) ||
                    String(u.id).toLowerCase().includes(q) ||
                    (u.username && u.username.toLowerCase().includes(q)) ||
                    (u.email && u.email.toLowerCase().includes(q)) ||
                    (u.phone && u.phone.includes(q));

                  // 'all' shows all staff accounts, never mixing customers as staff
                  const matchesRole =
                    staffRoleFilter === 'all'
                      ? u.role !== 'customer'
                      : u.role === staffRoleFilter;

                  return matchesSearch && matchesRole;
                })
                .map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                    <td className="py-3 px-3 font-mono text-[11px] font-bold text-orange-600 dark:text-orange-400">
                      #{u.id}
                    </td>
                    <td className="py-3 px-3 font-bold">
                      <p className="text-gray-900 dark:text-gray-100">{u.name}</p>
                      <p className="text-[10px] text-gray-500 font-normal">{u.phone || u.email || 'No contact'}</p>
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
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        u.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5">
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
                        className="bg-rose-500 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black shadow-xs transition-colors flex-inline items-center gap-1"
                        title={`Delete ${u.role === 'customer' ? 'Customer' : 'Staff'} Account #${u.id}`}
                      >
                        <Trash2 className="w-3 h-3 inline mr-1" />
                        Delete {u.role === 'customer' ? 'User' : 'Staff ID'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Render Full Admin Dashboard Capabilities under Owner Authority */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-2 sm:p-4 space-y-4">
        <div className="px-2 pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-gray-100">
              Full Store Operations & Admin Management Panel
            </h3>
          </div>
          <span className="text-[11px] font-bold text-gray-400 hidden sm:block">
            Owner Authority: Full access to all 12 operational modules
          </span>
        </div>

        {/* Embedded AdminDashboard with full capabilities */}
        <AdminDashboard isOwnerMode={true} />
      </div>

      {/* Modal for Provisioning New Staff Account */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs font-bold border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-orange-500" />
                Provision New Staff ID Account
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg font-black"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-[11px] font-semibold">
              <p>👑 <strong>Owner Authority Rule</strong>: Directly create staff & store administrative IDs. Issue the generated login credentials to your team member.</p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block mb-1 uppercase text-gray-500 text-[10px] font-black">Full Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Verma"
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
                    placeholder="e.g. sameer@partnerquickpal.in"
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
                    placeholder="e.g. pass123"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheckOwnerModal"
                  checked={userForm.isActive}
                  onChange={e => setUserForm({ ...userForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <label htmlFor="isActiveCheckOwnerModal" className="text-xs text-gray-700 dark:text-gray-300 font-bold">
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
                  Create & Issue Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Staff ID Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs font-bold border border-rose-200 dark:border-rose-900/60 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100">
                Permanent Staff ID Deletion
              </h3>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800/50 text-rose-900 dark:text-rose-200 space-y-1">
              <p className="font-extrabold">
                Staff ID: <span className="font-mono">#{userToDelete.id}</span>
              </p>
              <p className="font-semibold">
                Name: {userToDelete.name} ({userToDelete.role.toUpperCase()})
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              Are you sure you want to delete this staff member? This will permanently revoke their access and remove their ID from both the active fleet and cloud database.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteUser(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
