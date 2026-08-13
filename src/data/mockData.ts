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
  { id: 'cat-veg', name: 'Vegetables & Herbs', iconEmoji: '🥬', bgLight: 'bg-orange-100 text-orange-800', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-dairy', name: 'Dairy, Bread & Eggs', iconEmoji: '🥛', bgLight: 'bg-amber-100 text-amber-800', image: 'https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-drinks', name: 'Cold Drinks & Juices', iconEmoji: '🥤', bgLight: 'bg-yellow-100 text-yellow-800', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-fruits', name: 'Fresh Fruits', iconEmoji: '🍎', bgLight: 'bg-orange-100 text-orange-900', image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-snacks', name: 'Snacks & Munchies', iconEmoji: '🥨', bgLight: 'bg-amber-100 text-amber-900', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-bath', name: 'Bath & Body Care', iconEmoji: '🧼', bgLight: 'bg-yellow-100 text-yellow-900', image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-beauty', name: 'Beauty & Cosmetics', iconEmoji: '💄', bgLight: 'bg-orange-100 text-amber-800', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-kitchen', name: 'Kitchen & Staples', iconEmoji: '🍳', bgLight: 'bg-yellow-100 text-amber-900', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Amul Gold Full Cream Milk',
    category: 'cat-dairy',
    price: 33,
    originalPrice: 35,
    weightUnit: '500 ml',
    imageEmoji: '🥛',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 45,
    isOutOfStock: false,
    isHidden: false,
    rating: 4.8,
    reviewsCount: 1240,
    description: 'Pasteurised full cream milk packed with wholesome nutrients for daily vitality and rich taste.',
    isFeatured: true,
    deliveryTimeMins: 8,
  },
  {
    id: 'prod-2',
    name: 'Harvest Gold Whole Wheat Bread',
    category: 'cat-dairy',
    price: 45,
    originalPrice: 50,
    weightUnit: '400 g',
    imageEmoji: '🍞',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 30,
    isOutOfStock: false,
    isHidden: false,
    rating: 4.7,
    reviewsCount: 890,
    description: 'Freshly baked 100% whole wheat bread loaf, rich in dietary fiber and soft texture.',
    isFeatured: true,
    deliveryTimeMins: 10,
  },
  {
    id: 'prod-3',
    name: 'Fresh Red Onion (Pyaz)',
    category: 'cat-veg',
    price: 42,
    originalPrice: 65,
    weightUnit: '1 kg',
    imageEmoji: '🧅',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 80,
    isOutOfStock: false,
    isHidden: false,
    rating: 4.6,
    reviewsCount: 520,
    description: 'Farm-fresh premium red onions carefully sorted for superior taste and freshness.',
    isFeatured: true,
    deliveryTimeMins: 12,
  },
  {
    id: 'prod-4',
    name: 'Oreo Vanilla Crème Biscuits',
    category: 'cat-snacks',
    price: 20,
    originalPrice: 25,
    weightUnit: '120 g',
    imageEmoji: '🍪',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 100,
    isOutOfStock: false,
    isHidden: false,
    rating: 4.9,
    reviewsCount: 2300,
    description: 'Rich chocolate cookie sandwich with smooth vanilla cream inside.',
    isFeatured: true,
    deliveryTimeMins: 9,
  },
  {
    id: 'prod-5',
    name: 'Farm Fresh White Eggs (6 Pack)',
    category: 'cat-dairy',
    price: 54,
    originalPrice: 60,
    weightUnit: '6 pcs',
    imageEmoji: '🥚',
    image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 25,
    isOutOfStock: false,
    isHidden: false,
    rating: 4.8,
    reviewsCount: 1100,
    description: 'High protein farm fresh eggs, clean, hygienic and quality checked.',
    isFeatured: true,
    deliveryTimeMins: 10,
  },
  {
    id: 'prod-6',
    name: 'Fresh Hybrid Tomato',
    category: 'cat-veg',
    price: 28,
    originalPrice: 40,
    weightUnit: '500 g',
    imageEmoji: '🍅',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546470427-0d4db154ceb7?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 50,
    isOutOfStock: false,
    isHidden: false,
    rating: 4.5,
    reviewsCount: 430,
    description: 'Juicy, farm-plucked red tomatoes perfect for curries, salads, and gravies.',
    isFeatured: false,
    deliveryTimeMins: 10,
  },
  {
    id: 'prod-7',
    name: 'Coca-Cola Zero Sugar Drink',
    category: 'cat-drinks',
    price: 40,
    originalPrice: 40,
    weightUnit: '300 ml can',
    imageEmoji: '🥤',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 60,
    isOutOfStock: false,
    isHidden: false,
    rating: 4.7,
    reviewsCount: 950,
    description: 'Chilled sparkling soft drink with iconic cola taste and zero sugar.',
    isFeatured: true,
    deliveryTimeMins: 7,
  },
  {
    id: 'prod-8',
    name: 'Shimla Fresh Apples',
    category: 'cat-fruits',
    price: 135,
    originalPrice: 160,
    weightUnit: '4 pcs (~500g)',
    imageEmoji: '🍎',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 20,
    isOutOfStock: false,
    isHidden: false,
    rating: 4.9,
    reviewsCount: 610,
    description: 'Crisp and sweet Shimla apples packed with natural antioxidants.',
    isFeatured: true,
    deliveryTimeMins: 11,
  },
  {
    id: 'prod-9',
    name: 'Real Fruit Power Alphonso Mango Juice',
    category: 'cat-drinks',
    price: 110,
    originalPrice: 125,
    weightUnit: '1 Litre',
    imageEmoji: '🧃',
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 18,
    isOutOfStock: false,
    isHidden: false,
    rating: 4.8,
    reviewsCount: 480,
    description: 'Rich mango nectar made from handpicked king Alphonso mangoes.',
    isFeatured: false,
    deliveryTimeMins: 9,
  },
  {
    id: 'prod-10',
    name: 'Dove Cream Beauty Bath Bar',
    category: 'cat-bath',
    price: 68,
    originalPrice: 75,
    weightUnit: '125 g',
    imageEmoji: '🧼',
    image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 40,
    isOutOfStock: false,
    isHidden: false,
    rating: 4.8,
    reviewsCount: 880,
    description: 'Contains 1/4th moisturizing cream for soft, smooth and radiant skin.',
    isFeatured: false,
    deliveryTimeMins: 12,
  },
  {
    id: 'prod-11',
    name: 'Lays Potato Chips - India Magic Masala',
    category: 'cat-snacks',
    price: 20,
    originalPrice: 20,
    weightUnit: '50 g',
    imageEmoji: '🍟',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 120,
    isOutOfStock: false,
    isHidden: false,
    rating: 4.9,
    reviewsCount: 3100,
    description: 'Crunchy potato chips infused with aromatic Indian spices.',
    isFeatured: true,
    deliveryTimeMins: 8,
  },
  {
    id: 'prod-12',
    name: 'Fortune Sunlite Refined Sunflower Oil',
    category: 'cat-kitchen',
    price: 145,
    originalPrice: 165,
    weightUnit: '1 Litre Pouch',
    imageEmoji: '🌻',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 35,
    isOutOfStock: false,
    isHidden: false,
    rating: 4.7,
    reviewsCount: 720,
    description: 'Light and healthy refined sunflower oil enriched with Vitamin A & D.',
    isFeatured: false,
    deliveryTimeMins: 12,
  }
];

export const INITIAL_BANNERS: PromoBanner[] = [
  {
    id: 'banner-1',
    title: 'UP TO 50% OFF ON FRESH GROCERY',
    subtitle: 'QuickPal Summer Essentials Sale is Live!',
    tag: 'LIMITED TIME',
    bgGradient: 'from-amber-400 via-orange-500 to-yellow-500 text-orange-950',
    ctaText: 'Shop Sale',
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

export const INITIAL_PARTNERS: DeliveryPartner[] = [
  {
    id: 'partner-yash',
    name: 'Yash Gamare',
    phone: '+91 98765 40110',
    vehicleType: 'EV Bike',
    vehicleNumber: 'MH-04-QP-4011',
    isOnline: true,
    totalEarnings: 1420,
    completedOrdersCount: 28,
    rating: 4.9,
    currentLocationName: 'Saphale East Express Hub',
    pinCode: '401102',
  },
  {
    id: 'partner-1',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    vehicleType: 'EV Scooter',
    vehicleNumber: 'MH-04-QP-1001',
    isOnline: true,
    totalEarnings: 1420,
    completedOrdersCount: 28,
    rating: 4.9,
    currentLocationName: 'Saphale East Express Hub',
    pinCode: '401102',
  },
  {
    id: 'partner-2',
    name: 'Vikram Singh',
    phone: '+91 98123 76543',
    vehicleType: 'Motorcycle',
    vehicleNumber: 'MH-04-QP-2045',
    isOnline: true,
    totalEarnings: 980,
    completedOrdersCount: 19,
    rating: 4.8,
    currentLocationName: 'Saphale Station Road Hub',
    pinCode: '401102',
  },
  {
    id: 'partner-3',
    name: 'Amit Kumar',
    phone: '+91 97110 88234',
    vehicleType: 'E-Bicycle',
    vehicleNumber: 'MH-04-QP-8801',
    isOnline: false,
    totalEarnings: 650,
    completedOrdersCount: 12,
    rating: 4.7,
    currentLocationName: 'Saphale West Hub',
    pinCode: '401102',
  },
];

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

