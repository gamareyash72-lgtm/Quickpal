import * as XLSX from 'xlsx';
import { Order, Product, Category, DeliveryPartner, AppUser, SupportTicket, ServicePincode, EmailAlertLog } from '../types';

/**
 * Helper to calculate dynamic column widths so Excel columns aren't cramped
 */
function getAutoColumnWidths(data: Record<string, any>[]): { wch: number }[] {
  if (!data || data.length === 0) return [];
  const keys = Object.keys(data[0]);
  return keys.map((key) => {
    let maxLen = key.length;
    data.forEach((row) => {
      const val = row[key];
      const str = val !== null && val !== undefined ? String(val) : '';
      if (str.length > maxLen) {
        maxLen = str.length;
      }
    });
    return { wch: Math.min(Math.max(maxLen + 3, 10), 60) };
  });
}

/**
 * Format Order items into a clean readable string
 */
function formatOrderItems(items: Order['items']): string {
  if (!items || !Array.isArray(items)) return '';
  return items.map((it) => `${it.product?.name || 'Item'} (${it.product?.weightUnit || ''}) x${it.quantity} @ ₹${it.product?.price || 0}`).join(' | ');
}

/**
 * Transform Orders into Excel-ready flat row objects
 */
export function transformOrdersForExcel(orders: Order[]): Record<string, any>[] {
  return orders.map((o) => {
    const totalItemsCount = o.items ? o.items.reduce((sum, it) => sum + (it.quantity || 1), 0) : 0;
    const itemsSummary = formatOrderItems(o.items);
    
    // Delivery address details
    const addr = o.address;
    const addressStr = typeof addr === 'string' 
      ? addr 
      : addr 
        ? `${addr.addressLine || ''}, ${addr.area || ''}, ${addr.city || 'Saphale'} - ${addr.pincode || '401102'}`
        : o.deliveryAddress || 'Saphale (401102)';

    return {
      'Order ID': `#${o.id}`,
      'Date & Time': o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : 'N/A',
      'Order Status': (o.status || 'placed').toUpperCase().replace(/_/g, ' '),
      'Customer Name': o.customerName || 'Customer',
      'Customer Phone': o.customerPhone || 'N/A',
      'Delivery Address': addressStr,
      'Area / Landmark': addr && typeof addr === 'object' ? `${addr.area || ''} ${addr.landmark ? `(Near ${addr.landmark})` : ''}`.trim() : 'Saphale',
      'Pincode': addr && typeof addr === 'object' ? addr.pincode : (o.deliveryPincode || '401102'),
      'Total Items Qty': totalItemsCount,
      'Items Breakdown': itemsSummary,
      'Subtotal (₹)': Number(o.subtotal || 0).toFixed(2),
      'Delivery Fee (₹)': Number(o.deliveryFee || 0).toFixed(2),
      'Handling Fee (₹)': Number(o.handlingFee || 0).toFixed(2),
      'Discount Applied (₹)': Number(o.discount || 0).toFixed(2),
      'Grand Total (₹)': Number(o.total || 0).toFixed(2),
      'Payment Method': (o.paymentMethod || 'cod').toUpperCase().replace(/_/g, ' '),
      'Payment Status': (o.paymentStatus || 'pending').toUpperCase(),
      'Transaction / UTR ID': o.paymentTransactionId || 'N/A',
      'Assigned Rider / Partner': o.deliveryPartnerName || (o.assignedPartnerId ? `Partner #${o.assignedPartnerId}` : 'Unassigned'),
      'Delivery OTP': o.deliveryOtp || 'N/A',
      'Delivered With OTP?': o.deliveryCompletedWithOtp ? 'YES' : 'NO',
      'Store Accepted At': o.storeAcceptedAt ? new Date(o.storeAcceptedAt).toLocaleTimeString('en-IN') : '-',
      'Partner Accepted At': o.partnerAcceptedAt ? new Date(o.partnerAcceptedAt).toLocaleTimeString('en-IN') : '-',
      'Delivered At': o.deliveredAt ? new Date(o.deliveredAt).toLocaleTimeString('en-IN') : '-',
      'Customer Note': o.notes || '-'
    };
  });
}

/**
 * Transform Products into Excel-ready flat row objects
 */
export function transformProductsForExcel(products: Product[], categories: Category[]): Record<string, any>[] {
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  return products.map((p) => {
    const catName = categoryMap.get(p.category) || p.category || 'General';
    const discountPercent = p.originalPrice && p.originalPrice > p.price
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : 0;
    const estimatedMargin = p.price > 0 ? (p.price * 0.18).toFixed(2) : '0.00';

    return {
      'Product SKU / ID': p.id,
      'Product Name': p.name,
      'Category': catName,
      'Selling Price (₹)': Number(p.price || 0).toFixed(2),
      'MRP / Original Price (₹)': Number(p.originalPrice || p.price || 0).toFixed(2),
      'Discount (%)': `${discountPercent}%`,
      'Estimated Margin (₹)': estimatedMargin,
      'Stock Quantity': p.stock || 0,
      'Stock Status': p.isOutOfStock || (p.stock || 0) <= 0 ? 'OUT OF STOCK' : 'IN STOCK',
      'Unit / Weight': p.weightUnit || '1 unit',
      'Is Featured': p.isFeatured ? 'YES' : 'NO',
      'Is Hidden': p.isHidden ? 'YES' : 'NO',
      'Delivery Time (Mins)': p.deliveryTimeMins || 10,
      'Customer Rating': p.rating || 4.5,
      'Total Reviews': p.reviewsCount || 0,
      'Description': p.description || ''
    };
  });
}

/**
 * Transform Delivery Partners into Excel-ready flat row objects
 */
export function transformPartnersForExcel(partners: DeliveryPartner[]): Record<string, any>[] {
  return partners.map((dp) => ({
    'Partner ID': dp.id,
    'Partner Full Name': dp.name,
    'Phone Number': dp.phone,
    'Vehicle Type': (dp.vehicleType || 'Bike').toUpperCase(),
    'Vehicle Number': dp.vehicleNumber || 'N/A',
    'Current Fleet Status': dp.isOnline ? 'ONLINE (ACTIVE)' : 'OFFLINE',
    'Completed Orders': dp.completedOrdersCount || 0,
    'Total Earnings (₹)': Number(dp.totalEarnings || 0).toFixed(2),
    'Customer Rating': `${dp.rating || 5.0} ⭐`,
    'Assigned Hub / Area': dp.currentLocationName || 'Saphale East & West',
    'Service Pincode': dp.pinCode || '401102'
  }));
}

/**
 * Transform Users / Staff accounts into Excel-ready flat row objects
 */
export function transformUsersForExcel(users: AppUser[]): Record<string, any>[] {
  return users.map((u) => ({
    'User ID': u.id,
    'Full Name': u.name,
    'Role': (u.role || 'customer').toUpperCase(),
    'Email Address': u.email || 'N/A',
    'Phone Number': u.phone || 'N/A',
    'Username / Staff ID': u.username || 'N/A',
    'Account Status': u.status || 'ACTIVE',
    'Assigned Store / Hub': u.storeId || 'QuickPal Dark Store Saphale (401102)',
    'Assigned Service Area': u.serviceArea || 'Saphale (401102)',
    'Created Date': u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'N/A'
  }));
}

/**
 * Transform Support Tickets into Excel-ready flat row objects
 */
export function transformTicketsForExcel(tickets: SupportTicket[]): Record<string, any>[] {
  return tickets.map((t) => ({
    'Ticket ID': t.id,
    'Date Submitted': t.createdAt ? new Date(t.createdAt).toLocaleString('en-IN') : 'N/A',
    'Customer Name': t.customerName,
    'Customer Phone': t.customerPhone || 'N/A',
    'Customer Email': t.customerEmail || 'N/A',
    'Subject': t.subject,
    'Message / Complaint': t.message,
    'Related Order ID': t.orderId ? `#${t.orderId}` : 'N/A',
    'Ticket Status': (t.status || 'open').toUpperCase().replace(/_/g, ' ')
  }));
}

/**
 * Generate High-Level Sales & Accounting Summary Data for Excel
 */
export function generateSalesSummaryForExcel(orders: Order[]): Record<string, any>[] {
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  const pendingOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
  
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const codRevenue = orders
    .filter(o => o.status !== 'cancelled' && o.paymentMethod === 'cod')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const onlineRevenue = orders
    .filter(o => o.status !== 'cancelled' && o.paymentMethod !== 'cod')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const deliveryFeeCollected = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

  const discountsGiven = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.discount || 0), 0);

  const avgOrderValue = totalOrders > 0 ? (totalRevenue / (totalOrders - cancelledOrders || 1)).toFixed(2) : '0.00';
  const estimatedGST = (totalRevenue * 0.05).toFixed(2); // 5% GST on essentials avg
  const estimatedNetProfit = (totalRevenue * 0.18).toFixed(2); // 18% grocery margin avg

  return [
    { 'Accounting Metric': 'Total Store Orders Placed', 'Value': totalOrders, 'Notes': 'All time recorded volume' },
    { 'Accounting Metric': 'Delivered Orders', 'Value': deliveredOrders, 'Notes': 'Successfully fulfilled' },
    { 'Accounting Metric': 'Active / Pending Orders', 'Value': pendingOrders, 'Notes': 'In processing, transit, or dispatch' },
    { 'Accounting Metric': 'Cancelled Orders', 'Value': cancelledOrders, 'Notes': 'Void / refunded' },
    { 'Accounting Metric': 'Gross Revenue (₹)', 'Value': `₹${totalRevenue.toFixed(2)}`, 'Notes': 'Excluding cancelled orders' },
    { 'Accounting Metric': 'Average Order Value (AOV)', 'Value': `₹${avgOrderValue}`, 'Notes': 'Per successful order' },
    { 'Accounting Metric': 'Cash On Delivery (COD) Revenue', 'Value': `₹${codRevenue.toFixed(2)}`, 'Notes': 'Collected by riders' },
    { 'Accounting Metric': 'Online UPI & Card Revenue', 'Value': `₹${onlineRevenue.toFixed(2)}`, 'Notes': 'Direct gateway / verified QR' },
    { 'Accounting Metric': 'Delivery Fees Collected', 'Value': `₹${deliveryFeeCollected.toFixed(2)}`, 'Notes': 'Logistics revenue' },
    { 'Accounting Metric': 'Total Discounts & Promo Subsidies', 'Value': `₹${discountsGiven.toFixed(2)}`, 'Notes': 'Coupons and promotional savings' },
    { 'Accounting Metric': 'Estimated GST Tax Liability (5% avg)', 'Value': `₹${estimatedGST}`, 'Notes': 'For CA / GST return filing' },
    { 'Accounting Metric': 'Estimated Gross Margin (18% avg)', 'Value': `₹${estimatedNetProfit}`, 'Notes': 'Estimated operational profit' }
  ];
}

/**
 * MASTER EXPORT: Export Everything to a Comprehensive Multi-Tab Excel (.xlsx) Workbook
 */
export function exportMasterDatabaseToExcel(params: {
  orders: Order[];
  products: Product[];
  categories: Category[];
  partners: DeliveryPartner[];
  users: AppUser[];
  tickets?: SupportTicket[];
  filename?: string;
}): void {
  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toISOString().split('T')[0];

  // 1. Sales & Accounting Summary Sheet
  const summaryData = generateSalesSummaryForExcel(params.orders);
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = getAutoColumnWidths(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Sales Summary & Tax');

  // 2. Orders Sheet
  const ordersData = transformOrdersForExcel(params.orders);
  if (ordersData.length > 0) {
    const wsOrders = XLSX.utils.json_to_sheet(ordersData);
    wsOrders['!cols'] = getAutoColumnWidths(ordersData);
    XLSX.utils.book_append_sheet(wb, wsOrders, 'All Orders');
  } else {
    const wsEmptyOrders = XLSX.utils.json_to_sheet([{ 'Status': 'No orders recorded yet' }]);
    XLSX.utils.book_append_sheet(wb, wsEmptyOrders, 'All Orders');
  }

  // 3. Products & Stock Sheet
  const productsData = transformProductsForExcel(params.products, params.categories);
  const wsProducts = XLSX.utils.json_to_sheet(productsData);
  wsProducts['!cols'] = getAutoColumnWidths(productsData);
  XLSX.utils.book_append_sheet(wb, wsProducts, 'Inventory & Products');

  // 4. Delivery Fleet Sheet
  const partnersData = transformPartnersForExcel(params.partners);
  const wsPartners = XLSX.utils.json_to_sheet(partnersData);
  wsPartners['!cols'] = getAutoColumnWidths(partnersData);
  XLSX.utils.book_append_sheet(wb, wsPartners, 'Delivery Fleet');

  // 5. Staff & Users Directory Sheet
  const usersData = transformUsersForExcel(params.users);
  const wsUsers = XLSX.utils.json_to_sheet(usersData);
  wsUsers['!cols'] = getAutoColumnWidths(usersData);
  XLSX.utils.book_append_sheet(wb, wsUsers, 'Staff & Users');

  // 6. Support Tickets Sheet (if any)
  if (params.tickets && params.tickets.length > 0) {
    const ticketsData = transformTicketsForExcel(params.tickets);
    const wsTickets = XLSX.utils.json_to_sheet(ticketsData);
    wsTickets['!cols'] = getAutoColumnWidths(ticketsData);
    XLSX.utils.book_append_sheet(wb, wsTickets, 'Support Complaints');
  }

  // Generate and trigger download
  const outputFilename = params.filename || `QuickPal_Master_Database_${dateStr}.xlsx`;
  XLSX.writeFile(wb, outputFilename);
}

/**
 * Dedicated Export: Orders only (.xlsx or .csv)
 */
export function exportOrdersExcel(orders: Order[], format: 'xlsx' | 'csv' = 'xlsx', customFilename?: string): void {
  const data = transformOrdersForExcel(orders);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = customFilename || `QuickPal_Orders_Report_${dateStr}.${format}`;
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data.length > 0 ? data : [{ 'Message': 'No orders in selected filter' }]);
  ws['!cols'] = getAutoColumnWidths(data.length > 0 ? data : [{ 'Message': 'No orders' }]);
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  
  XLSX.writeFile(wb, filename, { bookType: format === 'csv' ? 'csv' : 'xlsx' });
}

/**
 * Dedicated Export: Products only (.xlsx or .csv)
 */
export function exportProductsExcel(products: Product[], categories: Category[], format: 'xlsx' | 'csv' = 'xlsx', customFilename?: string): void {
  const data = transformProductsForExcel(products, categories);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = customFilename || `QuickPal_Inventory_Stock_${dateStr}.${format}`;

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = getAutoColumnWidths(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Products Inventory');

  XLSX.writeFile(wb, filename, { bookType: format === 'csv' ? 'csv' : 'xlsx' });
}

/**
 * Dedicated Export: Delivery Partners only (.xlsx or .csv)
 */
export function exportPartnersExcel(partners: DeliveryPartner[], format: 'xlsx' | 'csv' = 'xlsx', customFilename?: string): void {
  const data = transformPartnersForExcel(partners);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = customFilename || `QuickPal_Fleet_Payouts_${dateStr}.${format}`;

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data.length > 0 ? data : [{ 'Message': 'No delivery partners registered' }]);
  ws['!cols'] = getAutoColumnWidths(data.length > 0 ? data : [{ 'Message': 'No delivery partners' }]);
  XLSX.utils.book_append_sheet(wb, ws, 'Delivery Partners');

  XLSX.writeFile(wb, filename, { bookType: format === 'csv' ? 'csv' : 'xlsx' });
}

/**
 * Dedicated Export: Users Directory (.xlsx or .csv)
 */
export function exportUsersExcel(users: AppUser[], format: 'xlsx' | 'csv' = 'xlsx', customFilename?: string): void {
  const data = transformUsersForExcel(users);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = customFilename || `QuickPal_Staff_Directory_${dateStr}.${format}`;

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data.length > 0 ? data : [{ 'Message': 'No users registered' }]);
  ws['!cols'] = getAutoColumnWidths(data.length > 0 ? data : [{ 'Message': 'No users' }]);
  XLSX.utils.book_append_sheet(wb, ws, 'Staff Directory');

  XLSX.writeFile(wb, filename, { bookType: format === 'csv' ? 'csv' : 'xlsx' });
}
