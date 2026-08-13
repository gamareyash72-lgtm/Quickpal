export type UserRole = 'customer' | 'partner' | 'admin' | 'owner' | 'store';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isActive?: boolean;
  isVerified?: boolean;
  avatar?: string;
  createdAt: string;
  storeId?: string;
  serviceArea?: string;
  availability?: boolean;
}

export interface DeliveryLocationCoords {
  latitude: number;
  longitude: number;
}

export interface DeliveryAddress {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  addressLine: string;
  area: string;
  city: string;
  pincode: string;
  landmark?: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface Category {
  id: string;
  name: string;
  iconEmoji: string;
  bgLight: string;
  image?: string;
  itemCount?: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  weightUnit: string;
  imageEmoji?: string;
  image: string;
  images?: string[];
  stock: number;
  isOutOfStock: boolean;
  isHidden: boolean;
  rating: number;
  reviewsCount: number;
  description: string;
  isFeatured?: boolean;
  deliveryTimeMins: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'upi_qr' | 'online_banking' | 'debit_card' | 'credit_card' | 'upi_app' | 'cod';

export type OrderStatus = 
  | 'placed' 
  | 'store_accepted'
  | 'READY_FOR_DELIVERY'
  | 'PARTNER_ACCEPTED'
  | 'accepted' 
  | 'rejected' 
  | 'picked_up' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled';

export interface StoreInfo {
  id: string;
  name: string;
  address: string;
  area: string;
  pincode: string;
  contactPhone: string;
  lat: number;
  lng: number;
}

export interface PartnerResponseLog {
  partnerId: string;
  partnerName: string;
  action: 'accepted' | 'rejected';
  timestamp: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: DeliveryAddress;
  deliveryAddress?: string;
  deliveryPincode?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  handlingFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'under_review';
  paymentTransactionId?: string;
  paymentFailureReason?: string;
  paymentScreenshotUrl?: string;
  submittedAmount?: number;
  paymentAuditLogs?: { timestamp: string; action: string; note: string; actor: string }[];
  status: OrderStatus;
  storeInfo?: StoreInfo;
  storeAcceptedAt?: string;
  acceptedAt?: string;
  partnerAcceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  deliveryPartnerId?: string;
  assignedPartnerId?: string;
  deliveryPartnerName?: string;
  partnerResponseLogs: PartnerResponseLog[];
  createdAt: string;
  pickupLocation: string | { latitude: number; longitude: number };
  deliveryLocation: string | { latitude: number; longitude: number };
  deliveryTimeMins: number;
  notes?: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  isOnline: boolean;
  totalEarnings: number;
  completedOrdersCount: number;
  rating: number;
  currentLocationName: string;
  pinCode: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minOrderValue: number;
  description: string;
  isActive: boolean;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  bgGradient: string;
  ctaText: string;
  categoryLink?: string;
  active: boolean;
}

export interface AppNotification {
  id: string;
  targetRole: UserRole | 'all';
  targetUserId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
  type: 'order' | 'system' | 'promo';
}

export interface PaymentSettings {
  upiId: string;
  payeeName: string;
  qrImageUrl?: string;
  allowUpiQR?: boolean;
  codMin: number;
  codMax: number;
  allowCOD: boolean;
  allowNetBanking?: boolean;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  bankName?: string;
  bankBranchName?: string;
  allowCards?: boolean;
  razorpayKeyId?: string;
  stripePublicKey?: string;
  checkoutNote?: string;
}

export interface FAQItem {
  id: string;
  category: 'delivery' | 'payments' | 'orders' | 'products' | 'account';
  question: string;
  answer: string;
  isPopular?: boolean;
  helpfulCount?: number;
}

export interface SupportTicket {
  id: string;
  customerName: string;
  customerPhone?: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  orderId?: string;
}

export interface ServicePincode {
  id: string;
  pincode: string;
  areaName: string;
  district: string;
  isActive: boolean;
  deliveryFee: number;
  minOrderValue: number;
  estimatedTimeMins: number;
}

