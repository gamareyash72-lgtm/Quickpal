import { Category, Product, DeliveryPartner, Coupon, PromoBanner, PaymentSettings, DeliveryAddress, FAQItem, SupportTicket, ServicePincode } from '../types';

export const INITIAL_SERVICE_PINCODES: ServicePincode[] = [
  {
    id: 'pin-401102',
    pincode: '401102',
    areaName: 'Saphale East & West',
    district: 'Palghar',
    isActive: true,
    deliveryFee: 15,
    minOrderValue: 99,
    estimatedTimeMins: 30,
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-ganesh-special', name: 'Ganesh Utsav Special 🌺', iconEmoji: '🥟', bgLight: 'bg-amber-100 text-amber-900', image: 'https://images.unsplash.com/photo-1599818818556-91e843f545a9?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-veg', name: 'Vegetables & Herbs', iconEmoji: '🥬', bgLight: 'bg-orange-100 text-orange-800', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-dairy', name: 'Dairy, Bread & Eggs', iconEmoji: '🥛', bgLight: 'bg-amber-100 text-amber-800', image: 'https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-drinks', name: 'Cold Drinks & Juices', iconEmoji: '🥤', bgLight: 'bg-yellow-100 text-yellow-800', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-fruits', name: 'Fresh Fruits', iconEmoji: '🍎', bgLight: 'bg-orange-100 text-orange-900', image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-snacks', name: 'Snacks & Munchies', iconEmoji: '🥨', bgLight: 'bg-amber-100 text-amber-900', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-kitchen', name: 'Kitchen & Staples', iconEmoji: '🍳', bgLight: 'bg-yellow-100 text-amber-900', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-modak-1',
    name: 'Fresh Ukadiche Modak (Steam Modak - 5 Pcs)',
    category: 'cat-ganesh-special',
    price: 120,
    originalPrice: 150,
    weightUnit: '5 pcs pack',
    imageEmoji: '🥟',
    image: 'https://images.unsplash.com/photo-1599818818556-91e843f545a9?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1599818818556-91e843f545a9?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 50,
    isOutOfStock: false,
    isHidden: false,
    rating: 5.0,
    reviewsCount: 45,
    description: 'Authentic traditional hot steamed rice flour modak filled with fresh grated coconut, organic jaggery, cardamom and nutmeg for Ganpati Bappa Naivedya.',
    isFeatured: true,
    deliveryTimeMins: 10,
  },
  {
    id: 'prod-pooja-kit',
    name: 'Ganpati Bappa Pooja Samagri Kit with Durva & Flowers',
    category: 'cat-ganesh-special',
    price: 199,
    originalPrice: 250,
    weightUnit: '1 Complete Kit',
    imageEmoji: '🌺',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 35,
    isOutOfStock: false,
    isHidden: false,
    rating: 4.9,
    reviewsCount: 38,
    description: 'Complete Puja Kit including 21 fresh Durva grass sprigs, 11 fresh Red Hibiscus (Jaswand) flowers, pure agarbatti, camphor, roli, chandan, janeu, and diya wicks.',
    isFeatured: true,
    deliveryTimeMins: 10,
  }
];

export const INITIAL_BANNERS: PromoBanner[] = [
  {
    id: 'banner-1',
    title: '🌺 HAPPY GANESH CHATURTHI SALE',
    subtitle: 'Flat ₹50 OFF on Fresh Ukadiche Modaks, Durva & Pooja Samagri! Use code BAPPA50',
    tag: 'GANESHOTSAV 2026',
    bgGradient: 'from-amber-500 via-orange-600 to-amber-700 text-white',
    ctaText: 'Shop Bappa Special',
    active: true,
  },
  {
    id: 'banner-2',
    title: 'SUPER FAST 10-MIN DELIVERY',
    subtitle: 'Fresh Dairy, Vegetables & Snacks delivered hot & fast.',
    tag: 'EXPRESS',
    bgGradient: 'from-orange-600 via-amber-600 to-yellow-600 text-white',
    ctaText: 'Order Now',
    active: true,
  },
  {
    id: 'banner-3',
    title: 'FLAT ₹50 OFF ON FIRST 3 ORDERS',
    subtitle: 'Use code QUICK50 at checkout for instant savings.',
    tag: 'NEW USER OFFER',
    bgGradient: 'from-yellow-500 via-orange-600 to-amber-700 text-white',
    ctaText: 'Apply Offer',
    active: true,
  },
];

export const INITIAL_PARTNERS: DeliveryPartner[] = [];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'QUICK50',
    discountAmount: 50,
    minOrderValue: 149,
    description: 'Flat ₹50 OFF on orders above ₹149',
    isActive: true,
  },
  {
    id: 'coup-2',
    code: 'FREESHIP',
    discountAmount: 15,
    minOrderValue: 99,
    description: 'Free Delivery Fee on orders above ₹99',
    isActive: true,
  },
  {
    id: 'coup-3',
    code: 'PAL20',
    discountPercent: 20,
    minOrderValue: 200,
    description: '20% OFF on fresh vegetables & fruits',
    isActive: true,
  },
];

export const INITIAL_PAYMENT_SETTINGS: PaymentSettings = {
  upiId: 'gamareyash72-1@oksbi',
  payeeName: 'Yash Gamare',
  qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi%3A%2F%2Fpay%3Fpa%3Dgamareyash72-1%40oksbi%26pn%3DYash%2520Gamare%26cu%3DINR',
  allowUpiQR: true,
  codMin: 10,
  codMax: 200,
  allowCOD: true,
  allowNetBanking: true,
  bankAccountName: 'QuickPal Retail Pvt Ltd',
  bankAccountNumber: '921020045612390',
  bankIfscCode: 'HDFC0000123',
  bankName: 'HDFC Bank Ltd',
  bankBranchName: 'Palghar Main Branch',
  allowCards: true,
  razorpayKeyId: 'rzp_live_QP991208',
  stripePublicKey: 'pk_live_QP88123',
  checkoutNote: 'Please verify payment details before completing order. Instant approval for UPI QR transactions.'
};

export const INITIAL_ADDRESSES: DeliveryAddress[] = [
  {
    id: 'addr-1',
    label: 'Home',
    addressLine: 'Station Road, Near Railway Station',
    area: 'Saphale East',
    city: 'Palghar',
    pincode: '401102',
    landmark: 'Opposite Bus Stand',
    isDefault: true,
    latitude: 19.5785,
    longitude: 72.8220
  },
  {
    id: 'addr-2',
    label: 'Work',
    addressLine: 'Market Yard, Main Bazaar',
    area: 'Saphale West',
    city: 'Palghar',
    pincode: '401102',
    landmark: 'Near Gram Panchayat',
    latitude: 19.5802,
    longitude: 72.8195
  },
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'delivery',
    question: 'How fast is QuickPal delivery?',
    answer: 'QuickPal delivers groceries and daily essentials in 10 to 15 minutes! We dispatch orders directly from our local neighborhood micro-fulfillment centers.',
    isPopular: true,
    helpfulCount: 245
  },
  {
    id: 'faq-2',
    category: 'delivery',
    question: 'Is there a minimum order value for Free Delivery?',
    answer: 'Yes! Orders above ₹199 qualify for Free Express Delivery. For orders below ₹199, a nominal delivery fee of ₹15 applies.',
    isPopular: true,
    helpfulCount: 189
  },
  {
    id: 'faq-3',
    category: 'payments',
    question: 'What payment modes are accepted on QuickPal?',
    answer: 'We accept instant UPI payments (Google Pay, PhonePe, Paytm, BHIM), Debit & Credit Cards, NetBanking, UPI QR scan on delivery, and Cash on Delivery (COD).',
    isPopular: true,
    helpfulCount: 312
  },
  {
    id: 'faq-4',
    category: 'payments',
    question: 'How does UPI payment verification work?',
    answer: 'When you select UPI Payment, you will receive a QR code and UPI ID. Once paid, you submit the 12-digit UPI UTR Transaction ID or upload a payment screenshot for instant verification.',
    isPopular: false,
    helpfulCount: 94
  },
  {
    id: 'faq-5',
    category: 'orders',
    question: 'How can I track my live delivery order?',
    answer: 'You can click on "Track Order" in the Header or Customer Dashboard to view live partner assignment, map location updates, delivery countdown, and call the delivery partner directly.',
    isPopular: true,
    helpfulCount: 420
  },
  {
    id: 'faq-6',
    category: 'orders',
    question: 'Can I cancel my order after placing it?',
    answer: 'Yes! You can cancel your order free of cost before it is picked up by the delivery partner. Once picked up, cancellation is subject to partner confirmation.',
    isPopular: false,
    helpfulCount: 156
  },
  {
    id: 'faq-7',
    category: 'products',
    question: 'What if I receive damaged or incorrect items?',
    answer: 'QuickPal has a 100% Quality & Freshness Guarantee. If any item is damaged, expired, or incorrect, request a refund or instant replacement in My Orders or ask our AI Support Assistant.',
    isPopular: true,
    helpfulCount: 380
  },
  {
    id: 'faq-8',
    category: 'account',
    question: 'How do I change my saved delivery address?',
    answer: 'Click on the location pill at the top header of QuickPal to switch between your saved addresses (Home, Work, Other) or add a new delivery address.',
    isPopular: false,
    helpfulCount: 78
  }
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-101',
    customerName: 'Aarav Sharma',
    customerPhone: '+91 98765 43210',
    subject: 'Delayed delivery query for Order #ORD-101',
    message: 'My order was placed 12 mins ago, just wanted to confirm delivery estimate.',
    status: 'resolved',
    createdAt: '2026-07-30T10:30:00Z',
    orderId: 'ORD-101'
  },
  {
    id: 'tkt-102',
    customerName: 'Priya Verma',
    customerPhone: '+91 91234 56789',
    subject: 'Request for organic spice category addition',
    message: 'Can you please stock organic turmeric and whole black pepper?',
    status: 'open',
    createdAt: '2026-07-31T09:15:00Z'
  }
];

