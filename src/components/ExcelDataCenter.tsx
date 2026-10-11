import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Database,
  Calendar,
  CheckCircle2,
  Copy,
  ExternalLink,
  Table,
  Filter,
  RefreshCw,
  ShoppingBag,
  Package,
  Users,
  Truck,
  HelpCircle,
  TrendingUp,
  FileText,
  Layers,
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  exportMasterDatabaseToExcel,
  exportOrdersExcel,
  exportProductsExcel,
  exportPartnersExcel,
  exportUsersExcel,
  generateSalesSummaryForExcel
} from '../utils/excelExport';
import * as XLSX from 'xlsx';

export const ExcelDataCenter: React.FC = () => {
  const {
    orders,
    products,
    categories,
    partners,
    users,
    supportTickets
  } = useApp();

  const [activeTab, setActiveTab] = useState<'exports' | 'live_sync' | 'preview'>('exports');
  const [selectedPreview, setSelectedPreview] = useState<'orders' | 'products' | 'partners' | 'users' | 'summary'>('orders');
  
  // Date filter for orders export
  const [orderDateRange, setOrderDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [inventoryStockFilter, setInventoryStockFilter] = useState<'all' | 'low' | 'out'>('all');
  
  // Search state in preview
  const [previewSearch, setPreviewSearch] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Financial Stats
  const totalRevenue = useMemo(() => {
    return orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  const deliveredOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'delivered').length;
  }, [orders]);

  // Filtered Orders for Export / Preview
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      // Status filter
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
      
      // Date filter
      if (orderDateRange === 'today') {
        const oDate = new Date(o.createdAt);
        return oDate.toDateString() === now.toDateString();
      }
      if (orderDateRange === 'week') {
        const oDate = new Date(o.createdAt);
        const diffDays = (now.getTime() - oDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }
      if (orderDateRange === 'month') {
        const oDate = new Date(o.createdAt);
        return oDate.getMonth() === now.getMonth() && oDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [orders, orderDateRange, orderStatusFilter]);

  // Filtered Products for Export / Preview
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (inventoryStockFilter === 'low') return (p.stock || 0) > 0 && (p.stock || 0) <= 5;
      if (inventoryStockFilter === 'out') return p.isOutOfStock || (p.stock || 0) <= 0;
      return true;
    });
  }, [products, inventoryStockFilter]);

  // Live Sync Web Query URLs
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const ordersCsvUrl = `${baseUrl}/api/export/orders.csv`;
  const productsCsvUrl = `${baseUrl}/api/export/products.csv`;
  const masterJsonUrl = `${baseUrl}/api/export/master.json`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(key);
    setTimeout(() => setCopiedUrl(null), 3000);
  };

  const triggerMasterExcel = () => {
    try {
      exportMasterDatabaseToExcel({
        orders,
        products,
        categories,
        partners,
        users,
        tickets: supportTickets
      });
      setDownloadSuccessMessage('QuickPal Master Database Workbook (.xlsx) downloaded successfully!');
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Export error: ${err.message || err}`);
    }
  };

  const triggerOrdersExcel = (format: 'xlsx' | 'csv' = 'xlsx') => {
    try {
      exportOrdersExcel(filteredOrders, format);
      setDownloadSuccessMessage(`Orders Ledger (${format.toUpperCase()}) downloaded successfully!`);
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Export error: ${err.message || err}`);
    }
  };

  const triggerProductsExcel = (format: 'xlsx' | 'csv' = 'xlsx') => {
    try {
      exportProductsExcel(filteredProducts, categories, format);
      setDownloadSuccessMessage(`Inventory Stock (${format.toUpperCase()}) downloaded successfully!`);
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Export error: ${err.message || err}`);
    }
  };

  const triggerPartnersExcel = (format: 'xlsx' | 'csv' = 'xlsx') => {
    try {
      exportPartnersExcel(partners, format);
      setDownloadSuccessMessage(`Delivery Fleet (${format.toUpperCase()}) downloaded successfully!`);
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Export error: ${err.message || err}`);
    }
  };

  const triggerUsersExcel = (format: 'xlsx' | 'csv' = 'xlsx') => {
    try {
      exportUsersExcel(users, format);
      setDownloadSuccessMessage(`Staff Directory (${format.toUpperCase()}) downloaded successfully!`);
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Export error: ${err.message || err}`);
    }
  };

  const triggerSummaryExcel = () => {
    try {
      const summaryData = generateSalesSummaryForExcel(orders);
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws, 'Sales & Tax Summary');
      XLSX.writeFile(wb, `QuickPal_Accounting_Summary_${new Date().toISOString().split('T')[0]}.xlsx`);
      setDownloadSuccessMessage('Sales & Tax Accounting Summary (.xlsx) downloaded successfully!');
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Export error: ${err.message || err}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Master Action */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-green-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30">
                  Microsoft Excel & Google Sheets Hub
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                  QuickPal Live Excel Data Center
                </h2>
              </div>
            </div>
            <p className="text-xs text-emerald-100 max-w-2xl font-medium leading-relaxed">
              Export and synchronize all QuickPal store operations — Orders, 200+ Products Inventory, Delivery Fleet Payouts, Staff Accounts, and Tax Accounting Ledgers directly into Microsoft Excel (.xlsx / .csv) and Google Sheets in real-time.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={triggerMasterExcel}
              className="bg-white hover:bg-emerald-50 text-emerald-900 font-black text-xs px-5 py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 border border-white/80 cursor-pointer"
              title="Download full multi-sheet Excel Workbook"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Download Master Excel (.xlsx)</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                All Sheets
              </span>
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-500/40">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Total Orders</span>
            <span className="text-lg font-black text-white">{orders.length}</span>
            <span className="text-[10px] text-emerald-200 block mt-0.5">{deliveredOrdersCount} Delivered</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Total Revenue</span>
            <span className="text-lg font-black text-white">₹{totalRevenue.toFixed(2)}</span>
            <span className="text-[10px] text-emerald-200 block mt-0.5">Gross Sales</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Catalog Products</span>
            <span className="text-lg font-black text-white">{products.length}</span>
            <span className="text-[10px] text-emerald-200 block mt-0.5">{categories.length} Categories</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Active Fleet</span>
            <span className="text-lg font-black text-white">{partners.length} Riders</span>
            <span className="text-[10px] text-emerald-200 block mt-0.5">{users.length} Total Users</span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {downloadSuccessMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-200 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-bold">{downloadSuccessMessage}</span>
          </div>
          <span className="text-[10px] uppercase font-black bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 px-2 py-0.5 rounded-full">
            Export Ready
          </span>
        </div>
      )}

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('exports')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'exports'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Download className="w-4 h-4" /> Dedicated Excel Exports
        </button>
        <button
          onClick={() => setActiveTab('live_sync')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'live_sync'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <RefreshCw className="w-4 h-4" /> Live Web Query & Cloud Sync
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'preview'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Table className="w-4 h-4" /> Data Inspector & Preview
        </button>
      </div>

      {/* TAB 1: DEDICATED EXCEL EXPORTS */}
      {activeTab === 'exports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Master Workbook */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border-2 border-emerald-500/40 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                  All-in-One Workbook
                </span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Master Store Database
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Single multi-sheet Excel file containing Orders, Inventory, Delivery Partners, Staff Accounts, and Tax Accounting.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={triggerMasterExcel}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download .XLSX Workbook
              </button>
              <span className="text-[10px] text-gray-400 block text-center">
                Contains 6 separate worksheet tabs
              </span>
            </div>
          </div>

          {/* Card 2: Orders & Transactions Ledger */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 px-2.5 py-0.5 rounded-full">
                  {filteredOrders.length} Filtered Orders
                </span>
                <ShoppingBag className="w-4 h-4 text-orange-500" />
              </div>
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                Orders & Transactions Ledger
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Full order records with customer details, full address, line items, fees, discounts, and payment methods.
              </p>

              {/* Filters */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <label className="block text-[9px] font-black uppercase text-gray-400 mb-0.5">Time Period</label>
                  <select
                    value={orderDateRange}
                    onChange={e => setOrderDateRange(e.target.value as any)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 font-bold text-gray-800 dark:text-gray-200"
                  >
                    <option value="all">All Time ({orders.length})</option>
                    <option value="today">Today Only</option>
                    <option value="week">Past 7 Days</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-gray-400 mb-0.5">Order Status</label>
                  <select
                    value={orderStatusFilter}
                    onChange={e => setOrderStatusFilter(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 font-bold text-gray-800 dark:text-gray-200"
                  >
                    <option value="all">All Statuses</option>
                    <option value="delivered">Delivered Only</option>
                    <option value="in_transit">In Transit</option>
                    <option value="store_accepted">Store Accepted</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => triggerOrdersExcel('xlsx')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-2 px-3 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> .XLSX
              </button>
              <button
                onClick={() => triggerOrdersExcel('csv')}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-black text-xs py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> .CSV
              </button>
            </div>
          </div>

          {/* Card 3: Products Inventory Sheet */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 rounded-full">
                  {filteredProducts.length} Items
                </span>
                <Package className="w-4 h-4 text-blue-500" />
              </div>
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                Products & Inventory Stock
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Full catalog with SKU codes, categories, pricing, MRP, profit margins, stock quantities, and units.
              </p>

              <div>
                <label className="block text-[9px] font-black uppercase text-gray-400 mb-0.5">Stock Level Filter</label>
                <select
                  value={inventoryStockFilter}
                  onChange={e => setInventoryStockFilter(e.target.value as any)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 font-bold text-xs text-gray-800 dark:text-gray-200"
                >
                  <option value="all">All Products ({products.length})</option>
                  <option value="low">Low Stock (≤ 5 units)</option>
                  <option value="out">Out of Stock Only</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => triggerProductsExcel('xlsx')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2 px-3 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> .XLSX
              </button>
              <button
                onClick={() => triggerProductsExcel('csv')}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-black text-xs py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> .CSV
              </button>
            </div>
          </div>

          {/* Card 4: Delivery Fleet & Rider Payouts */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2.5 py-0.5 rounded-full">
                  {partners.length} Fleet Partners
                </span>
                <Truck className="w-4 h-4 text-purple-500" />
              </div>
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-500" />
                Delivery Fleet & Rider Payouts
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Partner IDs, contact details, vehicle registration, completed order counts, ratings, and total earnings ledger.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => triggerPartnersExcel('xlsx')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs py-2 px-3 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> .XLSX
              </button>
              <button
                onClick={() => triggerPartnersExcel('csv')}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-black text-xs py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> .CSV
              </button>
            </div>
          </div>

          {/* Card 5: Users & Staff Directory */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-2.5 py-0.5 rounded-full">
                  {users.length} Accounts
                </span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Staff & User Directory
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Staff IDs, role authorizations (Owner, Admin, Store Staff, Delivery Partner), contact info, and activity status.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => triggerUsersExcel('xlsx')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2 px-3 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> .XLSX
              </button>
              <button
                onClick={() => triggerUsersExcel('csv')}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-black text-xs py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> .CSV
              </button>
            </div>
          </div>

          {/* Card 6: Sales & Tax Accounting Sheet */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2.5 py-0.5 rounded-full">
                  CA / GST Filing
                </span>
                <TrendingUp className="w-4 h-4 text-rose-500" />
              </div>
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-rose-500" />
                Financial & GST Tax Summary
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Comprehensive accounting summary, payment channel breakdown (COD vs UPI), delivery fees, and estimated profit.
              </p>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={triggerSummaryExcel}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Accounting .XLSX
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE WEB QUERY & CLOUD SYNC */}
      {activeTab === 'live_sync' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 space-y-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  Live Web Query & Automated Sync URLs
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                You can link Microsoft Excel and Google Sheets directly to these live endpoints. When new orders come in or stock changes, your Excel workbook updates automatically on refresh without needing manual downloads!
              </p>
            </div>

            {/* Endpoint 1: Orders Live CSV */}
            <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-orange-500" />
                  1. Live Orders CSV Web Feed
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  Real-time Data
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={ordersCsvUrl}
                  className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-xs font-mono text-gray-800 dark:text-gray-200"
                />
                <button
                  onClick={() => copyToClipboard(ordersCsvUrl, 'orders_csv')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                >
                  {copiedUrl === 'orders_csv' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedUrl === 'orders_csv' ? 'Copied!' : 'Copy Link'}
                </button>
                <a
                  href={ordersCsvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded-xl"
                  title="Open live CSV in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Endpoint 2: Products Live CSV */}
            <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-blue-500" />
                  2. Live Products & Inventory CSV Web Feed
                </span>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                  Real-time Stock
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={productsCsvUrl}
                  className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-xs font-mono text-gray-800 dark:text-gray-200"
                />
                <button
                  onClick={() => copyToClipboard(productsCsvUrl, 'products_csv')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                >
                  {copiedUrl === 'products_csv' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedUrl === 'products_csv' ? 'Copied!' : 'Copy Link'}
                </button>
                <a
                  href={productsCsvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded-xl"
                  title="Open live CSV in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Endpoint 3: Master JSON Web Service */}
            <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-purple-500" />
                  3. Power Query / Master REST JSON Feed
                </span>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-full">
                  Power BI & Advanced Excel
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={masterJsonUrl}
                  className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-xs font-mono text-gray-800 dark:text-gray-200"
                />
                <button
                  onClick={() => copyToClipboard(masterJsonUrl, 'master_json')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                >
                  {copiedUrl === 'master_json' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedUrl === 'master_json' ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-gray-100 dark:border-gray-800">
              {/* Excel Guide */}
              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                <h4 className="text-xs font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  How to Connect in Microsoft Excel:
                </h4>
                <ol className="text-xs text-gray-700 dark:text-gray-300 space-y-1.5 list-decimal pl-4 font-medium">
                  <li>Open Microsoft Excel and create a blank sheet.</li>
                  <li>Click on the top menu: <span className="font-bold text-emerald-800 dark:text-emerald-300">Data &gt; From Web</span> (or <span className="font-bold text-emerald-800 dark:text-emerald-300">Get Data &gt; From Web</span>).</li>
                  <li>Paste the copied Live Feed URL and click <strong>OK</strong>.</li>
                  <li>Select <strong>Transform Data</strong> or click <strong>Load</strong>.</li>
                  <li>Whenever you want the latest live data, just click <span className="font-bold text-emerald-800 dark:text-emerald-300">Refresh All</span> in Excel!</li>
                </ol>
              </div>

              {/* Google Sheets Guide */}
              <div className="bg-blue-50/60 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-2">
                <h4 className="text-xs font-black text-blue-950 dark:text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  How to Connect in Google Sheets:
                </h4>
                <ol className="text-xs text-gray-700 dark:text-gray-300 space-y-1.5 list-decimal pl-4 font-medium">
                  <li>Open Google Sheets in your browser.</li>
                  <li>In cell <strong>A1</strong>, paste the formula:
                    <div className="mt-1 bg-white dark:bg-gray-900 p-2 rounded-lg font-mono text-[11px] border border-blue-200 dark:border-blue-800 select-all">
                      =IMPORTDATA("{ordersCsvUrl}")
                    </div>
                  </li>
                  <li>Press <strong>Enter</strong> — all live orders and columns will instantly appear and stay synchronized in the cloud!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATA INSPECTOR & PREVIEW */}
      {activeTab === 'preview' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-200 dark:border-gray-800 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-gray-400">Select Dataset:</span>
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                {(['orders', 'products', 'partners', 'users', 'summary'] as const).map(key => (
                  <button
                    key={key}
                    onClick={() => { setSelectedPreview(key); setPreviewSearch(''); }}
                    className={`text-xs font-black px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                      selectedPreview === key
                        ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Search ${selectedPreview}...`}
                value={previewSearch}
                onChange={e => setPreviewSearch(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-white"
              />
              <button
                onClick={() => {
                  if (selectedPreview === 'orders') triggerOrdersExcel('xlsx');
                  if (selectedPreview === 'products') triggerProductsExcel('xlsx');
                  if (selectedPreview === 'partners') triggerPartnersExcel('xlsx');
                  if (selectedPreview === 'users') triggerUsersExcel('xlsx');
                  if (selectedPreview === 'summary') triggerSummaryExcel();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export This View
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-x-auto max-h-96">
            {selectedPreview === 'orders' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/80 text-[10px] font-black uppercase text-gray-500 border-b border-gray-100 dark:border-gray-700 sticky top-0">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Items</th>
                    <th className="p-3">Total (₹)</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                  {orders
                    .filter(o => !previewSearch || o.id.includes(previewSearch) || o.customerName.toLowerCase().includes(previewSearch.toLowerCase()) || o.customerPhone.includes(previewSearch))
                    .slice(0, 50)
                    .map(o => (
                      <tr key={o.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50">
                        <td className="p-3 font-mono font-bold text-orange-600">#{o.id}</td>
                        <td className="p-3 font-bold text-gray-900 dark:text-white">{o.customerName}</td>
                        <td className="p-3 text-gray-500 font-mono">{o.customerPhone}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            o.status === 'cancelled' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {o.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                          {o.items?.length || 0} items ({o.items?.map(i => `${i.product.name} x${i.quantity}`).join(', ')})
                        </td>
                        <td className="p-3 font-black text-gray-900 dark:text-white">₹{o.total?.toFixed(2)}</td>
                        <td className="p-3">
                          <span className="text-[10px] font-mono font-bold uppercase">{o.paymentMethod}</span>
                        </td>
                        <td className="p-3 text-gray-400 text-[10px]">{new Date(o.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {selectedPreview === 'products' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/80 text-[10px] font-black uppercase text-gray-500 border-b border-gray-100 dark:border-gray-700 sticky top-0">
                  <tr>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">MRP</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                  {products
                    .filter(p => !previewSearch || p.name.toLowerCase().includes(previewSearch.toLowerCase()) || p.category.toLowerCase().includes(previewSearch.toLowerCase()))
                    .slice(0, 50)
                    .map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50">
                        <td className="p-3 font-mono text-gray-400">{p.id}</td>
                        <td className="p-3 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <img src={p.image} alt={p.name} className="w-6 h-6 rounded object-cover" />
                          {p.name}
                        </td>
                        <td className="p-3 text-gray-500 capitalize">{p.category}</td>
                        <td className="p-3 font-black text-emerald-600">₹{p.price}</td>
                        <td className="p-3 text-gray-400 line-through">₹{p.originalPrice || p.price}</td>
                        <td className="p-3 font-bold">{p.stock || 0}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            p.isOutOfStock || (p.stock || 0) <= 0
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {p.isOutOfStock || (p.stock || 0) <= 0 ? 'OUT OF STOCK' : 'IN STOCK'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {selectedPreview === 'partners' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/80 text-[10px] font-black uppercase text-gray-500 border-b border-gray-100 dark:border-gray-700 sticky top-0">
                  <tr>
                    <th className="p-3">Partner ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Completed Orders</th>
                    <th className="p-3">Total Earnings</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                  {partners.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50">
                      <td className="p-3 font-mono font-bold text-purple-600">#{p.id}</td>
                      <td className="p-3 font-bold text-gray-900 dark:text-white">{p.name}</td>
                      <td className="p-3 text-gray-500 font-mono">{p.phone}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-300">{p.vehicleType} ({p.vehicleNumber || 'N/A'})</td>
                      <td className="p-3 font-bold">{p.completedOrdersCount || 0}</td>
                      <td className="p-3 font-black text-emerald-600">₹{p.totalEarnings?.toFixed(2) || '0.00'}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          p.isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {p.isOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedPreview === 'users' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/80 text-[10px] font-black uppercase text-gray-500 border-b border-gray-100 dark:border-gray-700 sticky top-0">
                  <tr>
                    <th className="p-3">User ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50">
                      <td className="p-3 font-mono text-gray-400">{u.id}</td>
                      <td className="p-3 font-bold text-gray-900 dark:text-white">{u.name}</td>
                      <td className="p-3">
                        <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">{u.email || '-'}</td>
                      <td className="p-3 text-gray-500 font-mono">{u.phone || '-'}</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold text-emerald-600">{u.status || 'ACTIVE'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedPreview === 'summary' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/80 text-[10px] font-black uppercase text-gray-500 border-b border-gray-100 dark:border-gray-700 sticky top-0">
                  <tr>
                    <th className="p-3">Accounting Metric</th>
                    <th className="p-3">Calculated Value</th>
                    <th className="p-3">Accounting Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                  {generateSalesSummaryForExcel(orders).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50">
                      <td className="p-3 font-bold text-gray-900 dark:text-white">{row['Accounting Metric']}</td>
                      <td className="p-3 font-black text-emerald-600">{row['Value']}</td>
                      <td className="p-3 text-gray-500">{row['Notes']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
