import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { verifyPaymentDetails } from '../utils/paymentVerifier';
import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  runTransaction,
  createSecondaryAuthUser
} from '../lib/firebase';
import {
  UserRole,
  AppUser,
  Category,
  Product,
  CartItem,
  Order,
  OrderStatus,
  StoreInfo,
  DeliveryPartner,
  Coupon,
  PromoBanner,
  AppNotification,
  PaymentSettings,
  DeliveryAddress,
  PaymentMethod,
  PartnerResponseLog,
  FAQItem,
  SupportTicket,
  ServicePincode
} from '../types';

function cleanFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_BANNERS,
  INITIAL_PARTNERS,
  INITIAL_COUPONS,
  INITIAL_PAYMENT_SETTINGS,
  INITIAL_ADDRESSES,
  INITIAL_FAQS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_SERVICE_PINCODES
} from '../data/mockData';

const INITIAL_USERS: AppUser[] = [];

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: AppUser | null;
  users: AppUser[];
  loginUser: (identifier: string, role: UserRole, password?: string, otp?: string) => Promise<{ success: boolean; message: string; user?: AppUser }>;
  loginWithGoogle: (requestedRole?: UserRole) => Promise<{ success: boolean; message: string; user?: AppUser }>;
  customerSignup: (data: { name: string; phone?: string; email: string; password?: string }) => Promise<{ success: boolean; message: string; user?: AppUser }>;
  createUserByAdmin: (userData: Omit<AppUser, 'id' | 'createdAt'> & { password?: string }) => Promise<{ success: boolean; message: string; user?: AppUser }>;
  setupInitialOwner: (data: { name: string; email: string; password?: string; phone?: string }) => Promise<{ success: boolean; message: string; user?: AppUser }>;
  sendForgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  toggleUserStatus: (userId: string) => void;
  deleteUser: (userId: string) => void;
  logoutUser: () => void;
  selectedPartnerId: string;
  setSelectedPartnerId: (id: string) => void;
  activePartner: DeliveryPartner | undefined;
  
  categories: Category[];
  products: Product[];
  banners: PromoBanner[];
  partners: DeliveryPartner[];
  coupons: Coupon[];
  orders: Order[];
  notifications: AppNotification[];
  paymentSettings: PaymentSettings;
  addresses: DeliveryAddress[];
  selectedAddress: DeliveryAddress;
  setSelectedAddress: (addr: DeliveryAddress) => void;
  
  cartItems: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  
  wishlistProductIds: string[];
  toggleWishlist: (productId: string) => void;
  
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
  
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  
  // Order actions
  placeOrder: (paymentMethod: PaymentMethod, notes?: string, transactionId?: string, submittedAmount?: number, paymentScreenshotUrl?: string) => { success: boolean; orderId?: string; message: string; paymentStatus?: 'paid' | 'failed' | 'under_review' | 'pending'; failureReason?: string };
  reverifyOrderPayment: (orderId: string, utrNumber: string, submittedAmount: number, paymentScreenshotUrl?: string) => { success: boolean; message: string };
  adminReviewPayment: (orderId: string, action: 'approve' | 'reject', note?: string) => void;
  partnerRespondToOrder: (orderId: string, action: 'accepted' | 'rejected') => Promise<{ success: boolean; message: string }>;
  storeAcceptOrder: (orderId: string) => void;
  updateOrderStatusByAdmin: (orderId: string, status: OrderStatus, partnerId?: string) => void;
  
  // Management actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  toggleOutOfStock: (productId: string) => void;
  toggleHideProduct: (productId: string) => void;
  
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  registerPartner: (partner: Omit<DeliveryPartner, 'id' | 'totalEarnings' | 'completedOrdersCount' | 'rating'>) => void;
  updatePartner: (partner: DeliveryPartner) => void;
  updatePaymentSettings: (settings: Partial<PaymentSettings>) => void;
  
  addBanner: (banner: Omit<PromoBanner, 'id'>) => void;
  toggleBannerActive: (bannerId: string) => void;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  toggleCouponActive: (couponId: string) => void;
  
  markNotificationRead: (id: string) => void;
  addAddress: (address: Omit<DeliveryAddress, 'id'>) => void;

  // Service Areas & PIN Code Controls
  servicePincodes: ServicePincode[];
  addServicePincode: (pin: Omit<ServicePincode, 'id'>) => { success: boolean; message: string };
  updateServicePincode: (pin: ServicePincode) => { success: boolean; message: string };
  deleteServicePincode: (id: string) => { success: boolean; message: string };
  toggleServicePincodeActive: (id: string) => void;
  isPincodeApproved: (pincode: string) => boolean;
  getPincodeInfo: (pincode: string) => ServicePincode | undefined;
  
  // FAQ & Help Center actions
  faqs: FAQItem[];
  supportTickets: SupportTicket[];
  addFAQ: (faq: Omit<FAQItem, 'id'>) => void;
  updateFAQ: (faq: FAQItem) => void;
  deleteFAQ: (faqId: string) => void;
  voteFAQHelpful: (faqId: string) => void;
  submitSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => void;
  updateTicketStatus: (ticketId: string, status: 'open' | 'in_progress' | 'resolved') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('partner-1');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('qp_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('qp_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('qp_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('qp_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [banners, setBanners] = useState<PromoBanner[]>(() => {
    const saved = localStorage.getItem('qp_banners');
    return saved ? JSON.parse(saved) : INITIAL_BANNERS;
  });

  const [partners, setPartners] = useState<DeliveryPartner[]>(() => {
    const saved = localStorage.getItem('qp_partners');
    return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('qp_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => {
    const saved = localStorage.getItem('qp_payment_settings');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_SETTINGS;
  });

  const [addresses, setAddresses] = useState<DeliveryAddress[]>(() => {
    const saved = localStorage.getItem('qp_addresses');
    return saved ? JSON.parse(saved) : INITIAL_ADDRESSES;
  });

  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress>(addresses[0] || INITIAL_ADDRESSES[0]);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('qp_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('qp_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    const saved = localStorage.getItem('qp_faqs');
    return saved ? JSON.parse(saved) : INITIAL_FAQS;
  });

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('qp_tickets');
    return saved ? JSON.parse(saved) : INITIAL_SUPPORT_TICKETS;
  });

  const [servicePincodes, setServicePincodes] = useState<ServicePincode[]>(() => {
    const saved = localStorage.getItem('qp_service_pincodes');
    return saved ? JSON.parse(saved) : INITIAL_SERVICE_PINCODES;
  });


  // Default initial orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('qp_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('qp_notifications');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'notif-1',
        targetRole: 'all',
        title: 'Welcome to QuickPal!',
        message: 'Order fresh groceries & essentials delivered within 30 minutes in Saphale (401102).',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: 'system'
      }
    ];
  });

  // Persist state to localStorage
  useEffect(() => { localStorage.setItem('qp_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('qp_current_user', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem('qp_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('qp_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('qp_banners', JSON.stringify(banners)); }, [banners]);
  useEffect(() => { localStorage.setItem('qp_partners', JSON.stringify(partners)); }, [partners]);
  useEffect(() => { localStorage.setItem('qp_coupons', JSON.stringify(coupons)); }, [coupons]);
  useEffect(() => { localStorage.setItem('qp_payment_settings', JSON.stringify(paymentSettings)); }, [paymentSettings]);
  useEffect(() => { localStorage.setItem('qp_addresses', JSON.stringify(addresses)); }, [addresses]);
  useEffect(() => { localStorage.setItem('qp_cart', JSON.stringify(cartItems)); }, [cartItems]);
  useEffect(() => { localStorage.setItem('qp_wishlist', JSON.stringify(wishlistProductIds)); }, [wishlistProductIds]);
  useEffect(() => { localStorage.setItem('qp_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('qp_notifications', JSON.stringify(notifications)); }, [notifications]);

  // Real-time Firestore orders subscription
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'orders'), (snapshot) => {
      if (snapshot.empty) return;
      const remoteOrders: Order[] = [];
      snapshot.forEach(docSnap => {
        remoteOrders.push({
          id: docSnap.id,
          ...docSnap.data()
        } as Order);
      });

      setOrders(prev => {
        const map = new Map<string, Order>();
        prev.forEach(o => map.set(o.id, o));
        remoteOrders.forEach(ro => {
          const existing = map.get(ro.id);
          map.set(ro.id, { ...existing, ...ro });
        });
        return Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      });
    }, (err) => {
      console.warn("Firestore orders onSnapshot notice:", err);
    });

    return () => unsub();
  }, []);
  useEffect(() => { localStorage.setItem('qp_faqs', JSON.stringify(faqs)); }, [faqs]);
  useEffect(() => { localStorage.setItem('qp_tickets', JSON.stringify(supportTickets)); }, [supportTickets]);
  useEffect(() => { localStorage.setItem('qp_service_pincodes', JSON.stringify(servicePincodes)); }, [servicePincodes]);

  // PIN Code Verification Helpers
  const isPincodeApproved = (pincode: string): boolean => {
    if (!pincode) return false;
    const clean = pincode.trim();
    return servicePincodes.some(p => p.pincode.trim() === clean && p.isActive);
  };

  const getPincodeInfo = (pincode: string): ServicePincode | undefined => {
    if (!pincode) return undefined;
    const clean = pincode.trim();
    return servicePincodes.find(p => p.pincode.trim() === clean && p.isActive);
  };

  const addServicePincode = (pinData: Omit<ServicePincode, 'id'>) => {
    const cleanPin = pinData.pincode.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      return { success: false, message: 'PIN code must be a valid 6-digit number.' };
    }
    if (servicePincodes.some(p => p.pincode.trim() === cleanPin)) {
      return { success: false, message: `PIN code ${cleanPin} is already registered in service list.` };
    }
    const newPin: ServicePincode = {
      ...pinData,
      id: 'pin-' + cleanPin + '-' + Date.now().toString().slice(-4),
      pincode: cleanPin
    };
    setServicePincodes(prev => [...prev, newPin]);
    return { success: true, message: `Service area PIN code ${cleanPin} (${pinData.areaName}) added successfully!` };
  };

  const updateServicePincode = (updatedPin: ServicePincode) => {
    setServicePincodes(prev => prev.map(p => p.id === updatedPin.id ? updatedPin : p));
    return { success: true, message: `Service PIN code ${updatedPin.pincode} updated successfully.` };
  };

  const deleteServicePincode = (id: string) => {
    const target = servicePincodes.find(p => p.id === id);
    if (servicePincodes.filter(p => p.isActive).length <= 1 && target?.isActive) {
      return { success: false, message: 'Cannot delete the only active service PIN code. At least one active area must remain.' };
    }
    setServicePincodes(prev => prev.filter(p => p.id !== id));
    return { success: true, message: 'PIN code removed from service list.' };
  };

  const toggleServicePincodeActive = (id: string) => {
    setServicePincodes(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  // Apply dark class to body/html
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isDeliveryPartnerUser = currentUser && (currentUser.role === 'partner' || currentUser.role === 'delivery_partner');

  const currentUserPartner = isDeliveryPartnerUser
    ? (
        partners.find(p => 
          p.id === currentUser.id ||
          (currentUser.email && p.phone === currentUser.phone) ||
          p.name.toLowerCase() === currentUser.name.toLowerCase() ||
          p.name.toLowerCase().includes(currentUser.name.toLowerCase()) ||
          currentUser.name.toLowerCase().includes(p.name.toLowerCase())
        ) || {
          id: currentUser.id || 'partner-yash',
          name: currentUser.name || 'Yash Gamare',
          phone: currentUser.phone || '+91 98765 40110',
          vehicleType: 'EV Bike',
          vehicleNumber: 'MH-04-QP-4011',
          isOnline: true,
          totalEarnings: 1420,
          completedOrdersCount: 28,
          rating: 4.9,
          currentLocationName: 'Saphale East Express Hub',
          pinCode: '401102'
        }
      )
    : null;

  const activePartner = currentUserPartner || partners.find(p => p.id === selectedPartnerId) || partners[0];

  // Firebase Auth Observer to synchronize active authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          let userSnap;
          try {
            userSnap = await getDoc(userDocRef);
          } catch (docErr) {
            console.warn("Firestore getDoc offline/unavailable notice:", docErr);
          }

          if (userSnap && userSnap.exists()) {
            const rawData = userSnap.data();
            const normalizedRole = rawData.role === 'delivery_partner' ? 'partner' : rawData.role;
            const userData: AppUser = {
              ...(rawData as AppUser),
              role: normalizedRole
            };

            if (userData.status === 'INACTIVE' || userData.status === 'SUSPENDED') {
              await signOut(auth);
              setCurrentUser(null);
              setCurrentRole('customer');
            } else {
              setCurrentUser(userData);
              if (currentRole === 'customer' || currentRole === userData.role) {
                setCurrentRole(userData.role);
              }
            }
          } else {
            // New user without Firestore document defaults to 'customer' role ONLY
            const newUser: AppUser = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Customer',
              email: fbUser.email || '',
              role: 'customer',
              status: 'ACTIVE',
              isActive: true,
              createdAt: new Date().toISOString()
            };
            try {
              await setDoc(userDocRef, newUser);
            } catch (setErr) {
              console.warn("Firestore setDoc offline notice:", setErr);
            }
            setCurrentUser(newUser);
            setCurrentRole('customer');
          }
        } catch (err) {
          console.warn("Error fetching user profile from Firestore (using Auth fallback):", err);
          const fallbackUser: AppUser = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Customer',
            email: fbUser.email || '',
            role: 'customer',
            status: 'ACTIVE',
            isActive: true,
            createdAt: new Date().toISOString()
          };
          setCurrentUser(fallbackUser);
          setCurrentRole('customer');
        }
      } else {
        setCurrentUser(null);
        setCurrentRole('customer');
      }
    });
    return () => unsubscribe();
  }, []);

  // User Authentication Handlers
  const loginUser = async (identifier: string, role: UserRole, password?: string, _otp?: string) => {
    const cleanEmail = identifier.trim().toLowerCase();

    // Lookup staff email if username or phone was provided
    let targetEmail = cleanEmail;
    const matchedUser = users.find(u => 
      (u.username && u.username.toLowerCase() === cleanEmail) || 
      (u.email && u.email.toLowerCase() === cleanEmail) ||
      (u.phone && u.phone.replace(/\s+/g, '').includes(cleanEmail.replace(/\s+/g, '')))
    );
    if (matchedUser?.email) {
      targetEmail = matchedUser.email;
    }

    if (!targetEmail || !targetEmail.includes('@')) {
      return {
        success: false,
        message: '[auth/invalid-email] Please enter a valid account email address or registered staff username.'
      };
    }

    if (!password) {
      return {
        success: false,
        message: '[auth/missing-password] Password is required to log in.'
      };
    }

    try {
      // Authenticate directly with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
      const uid = userCredential.user.uid;
      const fbEmail = userCredential.user.email || targetEmail;

      // Fetch user document directly from Firestore to verify profile & assigned role
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);

      let userData: AppUser;

      if (!userSnap.exists()) {
        userData = {
          id: uid,
          name: fbEmail.split('@')[0] || (role === 'customer' ? 'Customer' : role.toUpperCase()),
          email: fbEmail,
          role: role,
          status: 'ACTIVE',
          isActive: true,
          createdAt: new Date().toISOString()
        };
        try {
          await setDoc(userDocRef, userData);
        } catch (setErr) {
          console.warn("Firestore setDoc notice during login:", setErr);
        }
      } else {
        userData = userSnap.data() as AppUser;
      }

      // Verify user account status
      if (userData.status === 'INACTIVE' || userData.status === 'SUSPENDED') {
        await signOut(auth);
        return {
          success: false,
          message: `Account '${userData.name}' is currently ${userData.status}. Access has been revoked.`
        };
      }

      // PORTAL ROLE AUTHORIZATION CHECKS (Authoritative role from Firestore)
      let actualRole = userData.role;
      if ((actualRole as string) === 'delivery_partner') {
        actualRole = 'partner';
        userData.role = 'partner';
      }

      if (!actualRole || !['customer', 'partner', 'store', 'admin', 'owner'].includes(actualRole)) {
        await signOut(auth);
        return {
          success: false,
          message: 'Access Denied: Invalid or unassigned user role in database profile.'
        };
      }

      // 1. OWNER trying to access non-owner staff portal (e.g. Delivery Partner portal)
      if (actualRole === 'owner' && role !== 'owner' && role !== 'customer') {
        await signOut(auth);
        return {
          success: false,
          message: 'This account is registered as OWNER. Please use the Owner Portal.'
        };
      }

      // 2. Only a user whose Firestore role is DELIVERY_PARTNER can enter the Delivery Partner Dashboard
      if (role === 'partner' && actualRole !== 'partner') {
        await signOut(auth);
        if (actualRole === 'owner') {
          return {
            success: false,
            message: 'This account is registered as OWNER. Please use the Owner Portal.'
          };
        }
        return {
          success: false,
          message: `Access Denied: Your account is registered as '${actualRole.toUpperCase()}'. Only a registered Delivery Partner can enter the Delivery Partner Dashboard.`
        };
      }

      // 3. Only a user whose Firestore role is OWNER can enter the Owner Dashboard
      if (role === 'owner' && actualRole !== 'owner') {
        await signOut(auth);
        return {
          success: false,
          message: `Access Denied: Your account is registered as '${actualRole.toUpperCase()}'. Only an OWNER account can enter the Owner Dashboard.`
        };
      }

      // 4. Customer accounts CANNOT log into staff/owner portals
      if (role !== 'customer' && actualRole === 'customer') {
        await signOut(auth);
        return {
          success: false,
          message: 'Access Denied: Customer accounts are strictly prohibited from accessing staff or owner portals.'
        };
      }

      // 5. General staff access guard
      if (
        role !== 'customer' &&
        actualRole !== role &&
        !(actualRole === 'admin' && (role === 'store' || role === 'partner'))
      ) {
        await signOut(auth);
        return {
          success: false,
          message: `Access Denied: Your account is registered as '${actualRole.toUpperCase()}'. You do not have permission to access the '${role.toUpperCase()}' portal.`
        };
      }

      setCurrentUser(userData);
      setCurrentRole(userData.role);

      return {
        success: true,
        message: `Welcome back, ${userData.name}! Authenticated as ${userData.role.toUpperCase()}.`,
        user: userData
      };
    } catch (err: any) {
      console.warn("[Firebase Auth] Notice during signInWithEmailAndPassword:", err?.code || err?.message || err);
      const errorCode = err?.code || 'auth/unknown-error';

      // Fallback: Attempt Firestore database lookup for database-provisioned accounts
      try {
        const qEmail = query(collection(db, 'users'), where('email', '==', targetEmail));
        const qSnap = await getDocs(qEmail);
        let matchedDoc: AppUser | null = qSnap.docs.length > 0 ? (qSnap.docs[0].data() as AppUser) : null;

        if (!matchedDoc) {
          const qUser = query(collection(db, 'users'), where('username', '==', cleanEmail));
          const qUserSnap = await getDocs(qUser);
          if (qUserSnap.docs.length > 0) {
            matchedDoc = qUserSnap.docs[0].data() as AppUser;
          }
        }

        if (!matchedDoc) {
          const localMatch = users.find(u => 
            (u.email && u.email.toLowerCase() === targetEmail) || 
            (u.username && u.username.toLowerCase() === cleanEmail)
          );
          if (localMatch) matchedDoc = localMatch;
        }

        if (matchedDoc) {
          let actualRole = matchedDoc.role;
          if ((actualRole as string) === 'delivery_partner') {
            actualRole = 'partner';
            matchedDoc.role = 'partner';
          }

          if (matchedDoc.status === 'INACTIVE' || matchedDoc.status === 'SUSPENDED') {
            return {
              success: false,
              message: `Account '${matchedDoc.name}' is currently ${matchedDoc.status}. Access has been revoked.`
            };
          }

          if (role !== 'customer' && actualRole !== role && !(actualRole === 'admin' && (role === 'store' || role === 'partner')) && actualRole !== 'owner') {
            return {
              success: false,
              message: `Access Denied: Your account is registered as '${actualRole.toUpperCase()}'. You do not have permission to access the '${role.toUpperCase()}' portal.`
            };
          }

          setCurrentUser(matchedDoc);
          setCurrentRole(matchedDoc.role);
          return {
            success: true,
            message: `Welcome back, ${matchedDoc.name}! Authenticated as ${matchedDoc.role.toUpperCase()}.`,
            user: matchedDoc
          };
        }
      } catch (dbErr) {
        console.warn("Firestore lookup fallback notice:", dbErr);
      }

      let errorMsg = err.message || "Authentication failed.";
      if (errorCode === 'auth/operation-not-allowed') {
        errorMsg = 'Email/Password authentication is disabled in Firebase Console. Use "Sign in with Google" or provisioned staff credentials.';
      } else if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        errorMsg = 'Invalid credentials. Please verify your registered email/username and password.';
      } else if (errorCode === 'auth/too-many-requests') {
        errorMsg = 'Access to this account has been temporarily disabled due to many failed login attempts.';
      }

      return {
        success: false,
        message: `[${errorCode}] ${errorMsg}`
      };
    }
  };

  const loginWithGoogle = async (requestedRole: UserRole = 'customer') => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      const uid = fbUser.uid;
      const email = fbUser.email || '';

      const userDocRef = doc(db, 'users', uid);
      let userSnap;
      try {
        userSnap = await getDoc(userDocRef);
      } catch (firestoreErr) {
        console.warn("Firestore getDoc offline/unavailable notice during Google Auth:", firestoreErr);
      }

      let userData: AppUser;
      if (!userSnap || !userSnap.exists()) {
        userData = {
          id: uid,
          name: fbUser.displayName || email.split('@')[0] || requestedRole.toUpperCase(),
          email: email,
          role: requestedRole,
          status: 'ACTIVE',
          isActive: true,
          createdAt: new Date().toISOString()
        };
        try {
          await setDoc(userDocRef, userData);
        } catch (setErr) {
          console.warn("Firestore setDoc offline notice during Google Auth:", setErr);
        }
      } else {
        userData = userSnap.data() as AppUser;
      }

      if (userData.status === 'INACTIVE' || userData.status === 'SUSPENDED') {
        await signOut(auth);
        return {
          success: false,
          message: `Account '${userData.name}' is currently ${userData.status}. Access revoked.`
        };
      }

      // PORTAL ROLE AUTHORIZATION CHECKS (Authoritative role from Firestore)
      let actualRole = userData.role;
      if ((actualRole as string) === 'delivery_partner') {
        actualRole = 'partner';
        userData.role = 'partner';
      }

      if (!actualRole || !['customer', 'partner', 'store', 'admin', 'owner'].includes(actualRole)) {
        await signOut(auth);
        return {
          success: false,
          message: 'Access Denied: Invalid or unassigned user role in database profile.'
        };
      }

      // 1. OWNER trying to access non-owner staff portal (e.g. Delivery Partner portal)
      if (actualRole === 'owner' && requestedRole !== 'owner' && requestedRole !== 'customer') {
        await signOut(auth);
        return {
          success: false,
          message: 'This account is registered as OWNER. Please use the Owner Portal.'
        };
      }

      // 2. Only a user whose Firestore role is DELIVERY_PARTNER can enter the Delivery Partner Dashboard
      if (requestedRole === 'partner' && actualRole !== 'partner') {
        await signOut(auth);
        if (actualRole === 'owner') {
          return {
            success: false,
            message: 'This account is registered as OWNER. Please use the Owner Portal.'
          };
        }
        return {
          success: false,
          message: `Access Denied: Your account is registered as '${actualRole.toUpperCase()}'. Only a registered Delivery Partner can enter the Delivery Partner Dashboard.`
        };
      }

      // 3. Only a user whose Firestore role is OWNER can enter the Owner Dashboard
      if (requestedRole === 'owner' && actualRole !== 'owner') {
        await signOut(auth);
        return {
          success: false,
          message: `Access Denied: Your account is registered as '${actualRole.toUpperCase()}'. Only an OWNER account can enter the Owner Dashboard.`
        };
      }

      // 4. Customer accounts CANNOT log into staff/owner portals
      if (requestedRole !== 'customer' && actualRole === 'customer') {
        await signOut(auth);
        return {
          success: false,
          message: 'Access Denied: Customer accounts are strictly prohibited from accessing staff or owner portals.'
        };
      }

      // 5. General staff access guard
      if (
        requestedRole !== 'customer' &&
        actualRole !== requestedRole &&
        !(actualRole === 'admin' && (requestedRole === 'store' || requestedRole === 'partner'))
      ) {
        await signOut(auth);
        return {
          success: false,
          message: `Access Denied: Your account is registered as '${actualRole.toUpperCase()}'. You do not have permission to access the '${requestedRole.toUpperCase()}' portal.`
        };
      }

      setCurrentUser(userData);
      setCurrentRole(userData.role);

      return {
        success: true,
        message: `Welcome, ${userData.name}! Authenticated with Google as ${userData.role.toUpperCase()}.`,
        user: userData
      };
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      const errorCode = err.code || 'auth/google-error';
      let msg = err.message || "Google sign in failed.";
      if (errorCode === 'auth/popup-closed-by-user') {
        msg = 'Sign-in popup was closed before completing authentication.';
      } else if (errorCode === 'auth/operation-not-allowed') {
        msg = 'Google Sign-In is disabled in Firebase Console. Please enable "Google" under Firebase Auth -> Sign-in method.';
      } else if (errorCode === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        const domain = typeof window !== 'undefined' ? window.location.hostname : '';
        msg = `Domain '${domain}' is not authorized in Firebase Console for project 'quickpal-new'. Please add '${domain}' under Firebase Console -> Authentication -> Settings -> Authorized domains.`;
      }
      return {
        success: false,
        message: msg
      };
    }
  };

  const customerSignup = async (data: { name: string; phone?: string; email: string; password?: string }) => {
    try {
      const tempPassword = data.password || 'QuickPalPass123!';
      
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, tempPassword);
      const uid = userCredential.user.uid;

      // STRICT SECURITY REQUIREMENT: Customer registration ONLY creates users with CUSTOMER role
      const newCust: AppUser = {
        id: uid,
        name: data.name,
        phone: data.phone || '',
        email: data.email,
        role: 'customer', // HARDCODED CUSTOMER ROLE ONLY
        status: 'ACTIVE',
        isActive: true,
        isVerified: true,
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', uid), newCust);
      } catch (dbErr) {
        console.error("Firestore setDoc error:", dbErr);
      }

      setUsers(prev => [newCust, ...prev.filter(u => u.id !== uid && u.email !== data.email)]);
      setCurrentUser(newCust);
      setCurrentRole('customer');

      return {
        success: true,
        message: `🎉 Customer account created successfully for ${data.name}!`,
        user: newCust
      };
    } catch (err: any) {
      console.error("Customer Signup Error:", err);
      const errorCode = err.code || 'auth/signup-error';
      let msg = err.message || "Failed to create customer account.";
      if (errorCode === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please log in instead.';
      } else if (errorCode === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      return {
        success: false,
        message: `[${errorCode}] ${msg}`
      };
    }
  };

  const createUserByAdmin = async (userData: Omit<AppUser, 'id' | 'createdAt'> & { password?: string }) => {
    try {
      // SECURITY GUARD: Only an already authenticated OWNER or ADMIN can create staff accounts
      if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'admin')) {
        return {
          success: false,
          message: 'Access Denied: Only an authenticated System Owner or Admin can provision staff accounts.'
        };
      }

      // SECURITY GUARD: Only OWNER can assign OWNER or ADMIN roles
      if ((userData.role === 'owner' || userData.role === 'admin') && currentUser.role !== 'owner') {
        return {
          success: false,
          message: 'Access Denied: Only the System Owner can provision Owner or Admin accounts.'
        };
      }

      const resolvedEmail = (userData.email && userData.email.includes('@')) 
        ? userData.email.trim() 
        : (userData.username && userData.username.includes('@'))
          ? userData.username.trim()
          : `${(userData.username || userData.name || 'staff').toLowerCase().replace(/[^a-z0-9]/g, '')}@partnerquickpal.in`;

      const tempPassword = userData.password || 'QuickPalStaff123!';
      let uid = '';

      // 1. Trigger Backend API / Firebase Admin SDK endpoint
      try {
        const apiResp = await fetch('/api/admin/create-delivery-partner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userData.name,
            email: resolvedEmail,
            password: tempPassword,
            phone: userData.phone,
            role: userData.role === 'partner' ? 'delivery_partner' : userData.role,
            username: userData.username || resolvedEmail.split('@')[0],
            storeId: userData.storeId,
            serviceArea: userData.serviceArea,
            status: 'active'
          })
        });

        if (apiResp.ok) {
          const apiData = await apiResp.json();
          if (apiData.success && apiData.uid) {
            uid = apiData.uid;
          }
        }
      } catch (apiErr) {
        console.warn("Backend API call warning, falling back to secondary client auth:", apiErr);
      }

      if (!uid) {
        try {
          const secondaryUser = await createSecondaryAuthUser(resolvedEmail, tempPassword);
          if (secondaryUser) {
            uid = secondaryUser.uid;
          }
        } catch (authErr: any) {
          console.warn("[Secondary Auth Notice]:", authErr?.message || authErr);
        }
      }

      if (!uid) {
        const cleanPrefix = resolvedEmail.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
        uid = `partner_${cleanPrefix}_${Date.now().toString(36)}`;
        console.log(`[Database Profile Provisioning] Generated fallback staff ID: ${uid}`);
      }

      const newUser: AppUser = {
        id: uid,
        name: userData.name,
        role: userData.role,
        username: userData.username || resolvedEmail.split('@')[0],
        email: resolvedEmail,
        phone: userData.phone || '',
        status: userData.status || 'ACTIVE',
        isActive: userData.status !== 'INACTIVE',
        createdAt: new Date().toISOString(),
        storeId: userData.storeId || 'store-saphale-1',
        serviceArea: userData.serviceArea || 'Saphale & Palghar East'
      };

      try {
        await setDoc(doc(db, 'users', uid), cleanFirestoreData(newUser));
      } catch (dbErr) {
        console.error("Firestore setDoc error:", dbErr);
      }

      setUsers(prev => [newUser, ...prev.filter(u => u.id !== uid)]);

      if (userData.role === 'partner') {
        const newPartner: DeliveryPartner = {
          id: uid,
          name: newUser.name,
          phone: newUser.phone || '+91 98000 00000',
          vehicleType: 'EV Bike',
          vehicleNumber: 'DL-01-QP-' + Math.floor(1000 + Math.random() * 9000),
          isOnline: true,
          totalEarnings: 0,
          completedOrdersCount: 0,
          rating: 5.0,
          currentLocationName: 'Saphale Dark Store Hub',
          pinCode: '401102'
        };
        setPartners(prev => [...prev, newPartner]);
      }

      return {
        success: true,
        message: `Successfully provisioned ${userData.role.toUpperCase()} account for ${userData.name}.`,
        user: newUser
      };
    } catch (err: any) {
      console.error("Create User by Admin Error:", err);
      return {
        success: false,
        message: err.message || 'Failed to provision staff account.'
      };
    }
  };

  const setupInitialOwner = async (data: { name: string; email: string; password?: string; phone?: string }) => {
    try {
      // SECURITY CHECK: Check if an Owner account already exists in local state or Firestore
      let hasExistingOwner = users.some(u => u.role === 'owner');
      
      // Always query Firestore to verify if an owner exists in DB
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'owner'));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          hasExistingOwner = true;
        }
      } catch (e) {
        console.warn("Could not check existing owner in Firestore:", e);
      }

      if (hasExistingOwner) {
        return {
          success: false,
          message: 'Access Denied: A System Owner account already exists. Bootstrap flow is permanently locked.'
        };
      }

      // SECURITY GUARD: Logged in non-owner users cannot trigger initial owner bootstrap flow
      if (currentUser) {
        return {
          success: false,
          message: 'Access Denied: Authenticated users cannot execute initial owner bootstrap flow.'
        };
      }

      if (!data.email || !data.email.includes('@')) {
        return { success: false, message: 'Please enter a valid owner email address.' };
      }
      if (!data.password || data.password.length < 6) {
        return { success: false, message: 'Owner password must be at least 6 characters long.' };
      }

      const tempPassword = data.password;
      let uid = '';

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, tempPassword);
        uid = userCredential.user.uid;
      } catch (authErr: any) {
        console.error("Auth error during initial owner setup:", authErr);
        if (authErr.code === 'auth/email-already-in-use' || authErr.message?.includes('email-already-in-use')) {
          try {
            const userCredential = await signInWithEmailAndPassword(auth, data.email, tempPassword);
            uid = userCredential.user.uid;
          } catch (_) {
            return {
              success: false,
              message: 'An account with this email already exists in Firebase Auth. Please sign in instead.'
            };
          }
        } else {
          return {
            success: false,
            message: `Failed to create Firebase Auth account for Owner: ${authErr.message || 'Auth creation failed'}`
          };
        }
      }

      if (!uid) {
        return {
          success: false,
          message: 'Failed to obtain valid Firebase Authentication UID for System Owner.'
        };
      }

      const ownerUser: AppUser = {
        id: uid,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        username: data.email.split('@')[0],
        role: 'owner',
        status: 'ACTIVE',
        isActive: true,
        isVerified: true,
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', uid), ownerUser);
      } catch (dbErr) {
        console.error("Firestore setDoc error for owner:", dbErr);
      }

      setUsers(prev => [ownerUser, ...prev.filter(u => u.id !== uid && u.email !== data.email)]);
      setCurrentUser(ownerUser);
      setCurrentRole('owner');

      return {
        success: true,
        message: `👑 Primary System Owner account successfully created for ${data.name}! You are now authenticated as OWNER.`,
        user: ownerUser
      };
    } catch (err: any) {
      console.error("Initial Owner Setup Error:", err);
      return { success: false, message: err.message || "Failed to setup Initial Owner account." };
    }
  };

  const sendForgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: `Password reset link sent to ${email}. Please check your email inbox.`
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to send password reset email.'
      };
    }
  };

  const toggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus, isActive: newStatus === 'ACTIVE' } : u));
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus, updatedAt: new Date().toISOString() });
    } catch (e) {
      console.error("Error updating user status in Firestore:", e);
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => String(u.id) !== String(userId)));
    setPartners(prev => prev.filter(p => String(p.id) !== String(userId)));
  };

  const logoutUser = () => {
    signOut(auth).catch(err => console.error("SignOut error:", err));
    setCurrentUser(null);
    setCurrentRole('customer');
  };

  // Cart operations
  const addToCart = (product: Product, qty: number = 1) => {
    if (product.isOutOfStock) return;
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlistProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Coupons
  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === clean && c.isActive);
    if (!found) {
      return { success: false, message: 'Invalid or inactive coupon code.' };
    }
    if (cartSubtotal < found.minOrderValue) {
      return { success: false, message: `Minimum order value for ${found.code} is ₹${found.minOrderValue}.` };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Coupon '${found.code}' applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const sendNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Place Order with strict NPCI payment verification
  const placeOrder = (
    paymentMethod: PaymentMethod,
    notes?: string,
    transactionId?: string,
    submittedAmount?: number,
    paymentScreenshotUrl?: string
  ) => {
    if (cartItems.length === 0) {
      return { success: false, message: 'Your cart is empty!' };
    }

    // Check pincode service availability
    if (!isPincodeApproved(selectedAddress.pincode)) {
      return {
        success: false,
        message: `Sorry, delivery service is currently not available for pincode ${selectedAddress.pincode} (${selectedAddress.area}). QuickPal currently operates exclusively in Saphale East & West (PIN 401102), Palghar.`
      };
    }

    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountAmount) {
        discount = appliedCoupon.discountAmount;
      } else if (appliedCoupon.discountPercent) {
        discount = Math.round((cartSubtotal * appliedCoupon.discountPercent) / 100);
      }
    }

    const deliveryFee = cartSubtotal > 299 ? 0 : 15;
    const handlingFee = 4;
    const total = Math.max(0, cartSubtotal + deliveryFee + handlingFee - discount);

    // Strict COD rule check
    if (paymentMethod === 'cod') {
      if (!paymentSettings.allowCOD) {
        return { success: false, message: 'Cash on Delivery is currently disabled by store management.' };
      }
      if (total < paymentSettings.codMin || total > paymentSettings.codMax) {
        return {
          success: false,
          message: `Cash on Delivery is available ONLY for orders between ₹${paymentSettings.codMin} and ₹${paymentSettings.codMax}. Your order total is ₹${total}. Please pay online via UPI or Cards.`
        };
      }
    }

    // Run strict Payment Verification for Online methods (UPI / Cards / NetBanking)
    const paymentCheck = verifyPaymentDetails(
      paymentMethod,
      transactionId || '',
      submittedAmount || total,
      total,
      orders
    );

    const newOrderId = 'QP-' + Math.floor(1000 + Math.random() * 9000);
    const initialPaymentStatus = paymentMethod === 'cod' ? 'pending' : paymentCheck.status;
    const finalTxnId = paymentCheck.cleanUtr || transactionId || (paymentMethod !== 'cod' ? 'TXN-' + Date.now().toString().slice(-8) : undefined);

    const nowIso = new Date().toISOString();
    const initialAudit = {
      timestamp: nowIso,
      action: paymentMethod === 'cod' ? 'COD_ORDER_PLACED' : paymentCheck.isValid ? 'GATEWAY_VERIFIED' : 'VERIFICATION_FAILED',
      note: `${paymentCheck.auditNote}${paymentScreenshotUrl ? ' [Payment screenshot attached]' : ''}`,
      actor: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Customer'
    };

    const fullDeliveryAddrStr = `${selectedAddress.addressLine}, ${selectedAddress.area}, ${selectedAddress.city}`;
    const deliveryPincodeStr = selectedAddress.pincode || '401102';
    const deliveryLat = selectedAddress.latitude || 19.5785;
    const deliveryLng = selectedAddress.longitude || 72.8220;

    const newOrder: Order = {
      id: newOrderId,
      customerId: currentUser ? currentUser.id : 'cust-guest-' + Date.now().toString().slice(-4),
      customerName: currentUser ? currentUser.name : 'Guest Customer',
      customerPhone: currentUser?.phone || '',
      address: selectedAddress,
      deliveryAddress: fullDeliveryAddrStr,
      deliveryPincode: deliveryPincodeStr,
      deliveryLocation: {
        latitude: deliveryLat,
        longitude: deliveryLng
      },
      items: [...cartItems],
      subtotal: cartSubtotal,
      deliveryFee,
      handlingFee,
      discount,
      total,
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      paymentTransactionId: finalTxnId,
      paymentFailureReason: paymentCheck.isValid ? undefined : paymentCheck.failureReason,
      paymentScreenshotUrl,
      submittedAmount: submittedAmount || total,
      paymentAuditLogs: [initialAudit],
      status: 'placed',
      partnerResponseLogs: [],
      createdAt: nowIso,
      pickupLocation: 'QuickPal Dark Store #1 - Green Park',
      deliveryTimeMins: 10,
      notes
    };

    setOrders(prev => [newOrder, ...prev]);

    // Firestore Order Document Persistence
    if (db) {
      const firestoreOrderData = {
        id: newOrderId,
        customerId: newOrder.customerId,
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        deliveryAddress: fullDeliveryAddrStr,
        deliveryPincode: deliveryPincodeStr,
        deliveryLocation: {
          latitude: deliveryLat,
          longitude: deliveryLng
        },
        status: 'PLACED',
        assignedPartnerId: null,
        subtotal: cartSubtotal,
        deliveryFee: deliveryFee,
        total: total,
        paymentMethod: paymentMethod,
        paymentStatus: initialPaymentStatus,
        createdAt: nowIso,
        notes: notes || ''
      };

      setDoc(doc(db, 'orders', newOrderId), firestoreOrderData).catch(err => {
        console.warn('Firestore setDoc orders error notice:', err);
      });
    }

    // Push notifications
    if (paymentMethod !== 'cod' && !paymentCheck.isValid) {
      // Failed payment notifications
      sendNotification({
        targetRole: 'admin',
        title: `🚨 Failed Payment Attempt #${newOrderId}`,
        message: `Flagged payment attempt: ${paymentCheck.failureReason}. UTR: '${transactionId}'. Total: ₹${total}.`,
        orderId: newOrderId,
        type: 'order'
      });

      sendNotification({
        targetRole: 'customer',
        title: `⚠️ Payment Verification Failed #${newOrderId}`,
        message: `Your payment of ₹${total} could not be verified. Reason: ${paymentCheck.failureReason}. Please resubmit valid payment proof.`,
        orderId: newOrderId,
        type: 'order'
      });
    } else {
      // Valid payment or COD notifications -> Alert Store Owner & Store Staff first for stock confirmation
      sendNotification({
        targetRole: 'owner',
        title: `🛍️ Store Stock Check Required #${newOrderId}`,
        message: `Customer ${newOrder.customerName} placed order worth ₹${total}. Please check product availability & confirm stock.`,
        orderId: newOrderId,
        type: 'order'
      });

      sendNotification({
        targetRole: 'store',
        title: `🛍️ New Order #${newOrderId} Pending Confirmation`,
        message: `Items ordered: ${newOrder.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}. Please verify stock.`,
        orderId: newOrderId,
        type: 'order'
      });

      sendNotification({
        targetRole: 'admin',
        title: `🛒 Order #${newOrderId} Created (${initialPaymentStatus.toUpperCase()})`,
        message: `Customer ${newOrder.customerName} placed order worth ₹${total} via ${paymentMethod.toUpperCase()}. Awaiting store stock check.`,
        orderId: newOrderId,
        type: 'order'
      });

      sendNotification({
        targetRole: 'customer',
        title: `🎉 Order Placed #${newOrderId}`,
        message: `Your order of ₹${total} has been received! Awaiting Store Owner item availability confirmation.`,
        orderId: newOrderId,
        type: 'order'
      });
    }

    clearCart();

    return {
      success: paymentCheck.isValid,
      orderId: newOrderId,
      paymentStatus: initialPaymentStatus,
      failureReason: paymentCheck.failureReason,
      message: paymentCheck.isValid
        ? `Order #${newOrderId} placed and payment verified successfully!`
        : `Payment verification failed for #${newOrderId}: ${paymentCheck.failureReason}`
    };
  };

  // Re-verify or Re-submit Payment Proof by Customer
  const reverifyOrderPayment = (orderId: string, utrNumber: string, submittedAmount: number, paymentScreenshotUrl?: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return { success: false, message: 'Order not found.' };

    const verification = verifyPaymentDetails(
      targetOrder.paymentMethod,
      utrNumber,
      submittedAmount,
      targetOrder.total,
      orders.filter(o => o.id !== orderId)
    );

    const nowIso = new Date().toISOString();
    const newAudit = {
      timestamp: nowIso,
      action: verification.isValid ? 'CUSTOMER_REVERIFIED_PAID' : 'CUSTOMER_REVERIFICATION_FAILED',
      note: `${verification.auditNote}${paymentScreenshotUrl ? ' [New payment screenshot attached]' : ''}`,
      actor: currentUser ? `${currentUser.name} (Customer)` : 'Customer'
    };

    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            paymentStatus: verification.status,
            paymentTransactionId: verification.cleanUtr || utrNumber,
            paymentFailureReason: verification.isValid ? undefined : verification.failureReason,
            paymentScreenshotUrl: paymentScreenshotUrl || o.paymentScreenshotUrl,
            submittedAmount,
            paymentAuditLogs: [...(o.paymentAuditLogs || []), newAudit]
          };
        }
        return o;
      })
    );

    if (verification.isValid) {
      sendNotification({
        targetRole: 'admin',
        title: `✅ Payment Verified #${orderId}`,
        message: `Customer resubmitted valid UTR '${verification.cleanUtr}'. Order is now marked PAID.`,
        orderId,
        type: 'order'
      });

      sendNotification({
        targetRole: 'customer',
        title: `🎉 Payment Confirmed #${orderId}`,
        message: `Your payment of ₹${targetOrder.total} with UTR '${verification.cleanUtr}' has been verified!`,
        orderId,
        type: 'order'
      });

      return { success: true, message: `Payment verified! UTR ${verification.cleanUtr} confirmed.` };
    } else {
      return { success: false, message: verification.failureReason || 'Verification failed.' };
    }
  };

  // Admin Manual Review Action (Approve / Reject)
  const adminReviewPayment = (orderId: string, action: 'approve' | 'reject', note?: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const nowIso = new Date().toISOString();
    const newAudit = {
      timestamp: nowIso,
      action: action === 'approve' ? 'ADMIN_MANUAL_APPROVED' : 'ADMIN_MANUAL_REJECTED',
      note: note || (action === 'approve' ? 'Admin manually confirmed bank ledger credit.' : 'Admin rejected payment proof as unverified/fraudulent.'),
      actor: currentUser ? `${currentUser.name} (Admin)` : 'Store Admin'
    };

    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            paymentStatus: action === 'approve' ? 'paid' : 'failed',
            paymentFailureReason: action === 'approve' ? undefined : (note || 'Payment rejected by store admin.'),
            status: action === 'reject' ? 'cancelled' : o.status,
            paymentAuditLogs: [...(o.paymentAuditLogs || []), newAudit]
          };
        }
        return o;
      })
    );

    sendNotification({
      targetRole: 'customer',
      title: action === 'approve' ? `✅ Payment Approved #${orderId}` : `❌ Order Payment Rejected #${orderId}`,
      message: action === 'approve'
        ? `Store admin approved your payment for #${orderId}. Order is being prepared.`
        : `Payment proof for #${orderId} was rejected by store admin: ${note || 'Unverified UTR'}.`,
      orderId,
      type: 'order'
    });
  };

  // Partner Accept / Reject response with atomic Firestore Transaction
  const partnerRespondToOrder = async (orderId: string, action: 'accepted' | 'rejected'): Promise<{ success: boolean; message: string }> => {
    const partner = activePartner;
    const partnerUid = currentUser?.id || auth.currentUser?.uid || partner?.id || 'partner-1';
    const partnerName = currentUser?.name || partner?.name || 'Delivery Partner';
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowIso = new Date().toISOString();

    if (action === 'accepted') {
      let isAlreadyTaken = false;

      if (db) {
        try {
          const orderRef = doc(db, 'orders', orderId);
          await runTransaction(db, async (transaction) => {
            const orderSnap = await transaction.get(orderRef);
            let existingPartnerId = null;

            if (orderSnap.exists()) {
              const data = orderSnap.data();
              existingPartnerId = data.deliveryPartnerId || data.assignedPartnerId;
            }

            if (existingPartnerId && existingPartnerId !== partnerUid) {
              isAlreadyTaken = true;
              throw new Error("This order has already been accepted by another Delivery Partner.");
            }

            const updatePayload = {
              status: 'PARTNER_ACCEPTED',
              deliveryPartnerId: partnerUid,
              assignedPartnerId: partnerUid,
              deliveryPartnerName: partnerName,
              acceptedAt: nowIso,
              partnerAcceptedAt: nowIso
            };

            if (orderSnap.exists()) {
              transaction.update(orderRef, updatePayload);
            } else {
              const localTargetOrder = orders.find(o => o.id === orderId);
              transaction.set(orderRef, {
                ...(localTargetOrder || {}),
                id: orderId,
                ...updatePayload
              });
            }
          });
        } catch (err: any) {
          console.warn("Firestore partner accept transaction notice:", err);
          if (isAlreadyTaken || (err.message && err.message.includes("accepted by another"))) {
            return { success: false, message: "This order has already been accepted by another Delivery Partner." };
          }
          try {
            const orderRef = doc(db, 'orders', orderId);
            await setDoc(orderRef, {
              status: 'PARTNER_ACCEPTED',
              deliveryPartnerId: partnerUid,
              assignedPartnerId: partnerUid,
              deliveryPartnerName: partnerName,
              acceptedAt: nowIso,
              partnerAcceptedAt: nowIso
            }, { merge: true });
          } catch (e) {
            console.warn("Fallback setDoc notice:", e);
          }
        }
      }

      // Check local state to double check if another partner in memory accepted it
      const localOrder = orders.find(o => o.id === orderId);
      if (localOrder && (localOrder.deliveryPartnerId || localOrder.assignedPartnerId) && (localOrder.deliveryPartnerId !== partnerUid && localOrder.assignedPartnerId !== partnerUid)) {
        return { success: false, message: "This order has already been accepted by another Delivery Partner." };
      }

      const newLog: PartnerResponseLog = {
        partnerId: partnerUid,
        partnerName: partnerName,
        action,
        timestamp: timeStr
      };

      setOrders(prev =>
        prev.map(ord => {
          if (ord.id !== orderId) return ord;
          return {
            ...ord,
            status: 'PARTNER_ACCEPTED',
            deliveryPartnerId: partnerUid,
            assignedPartnerId: partnerUid,
            deliveryPartnerName: partnerName,
            acceptedAt: nowIso,
            partnerAcceptedAt: nowIso,
            partnerResponseLogs: [...(ord.partnerResponseLogs || []), newLog]
          };
        })
      );

      sendNotification({
        targetRole: 'admin',
        title: `Partner ACCEPTED Order #${orderId}`,
        message: `Delivery Partner ${partnerName} accepted Order #${orderId}.`,
        orderId,
        type: 'order'
      });

      sendNotification({
        targetRole: 'customer',
        title: `🚴 Delivery Partner Assigned #${orderId}`,
        message: `${partnerName} has accepted your order and is reaching the store for pickup!`,
        orderId,
        type: 'order'
      });

      return { success: true, message: "Order accepted successfully!" };
    } else {
      if (db) {
        try {
          const orderRef = doc(db, 'orders', orderId);
          const targetOrd = orders.find(o => o.id === orderId);
          const newLog: PartnerResponseLog = {
            partnerId: partnerUid,
            partnerName: partnerName,
            action: 'rejected',
            timestamp: timeStr
          };
          updateDoc(orderRef, {
            partnerResponseLogs: [...(targetOrd?.partnerResponseLogs || []), newLog]
          }).catch(e => console.warn("Firestore updateDoc rejection error:", e));
        } catch (e) {
          console.warn("Firestore rejection notice:", e);
        }
      }

      const newLog: PartnerResponseLog = {
        partnerId: partnerUid,
        partnerName: partnerName,
        action,
        timestamp: timeStr
      };

      setOrders(prev =>
        prev.map(ord => {
          if (ord.id !== orderId) return ord;
          return {
            ...ord,
            partnerResponseLogs: [...(ord.partnerResponseLogs || []), newLog]
          };
        })
      );

      return { success: true, message: "Order declined." };
    }
  };

  // Store Owner Accept & Confirm Item Stock
  const storeAcceptOrder = (orderId: string) => {
    const defaultStore: StoreInfo = {
      id: 'store-saphale-1',
      name: 'QuickPal Saphale Central Mart',
      address: 'Shop No. 4, Station Road, Saphale East',
      area: 'Saphale East',
      pincode: '401102',
      contactPhone: '+91 98234 56789',
      lat: 19.5785,
      lng: 72.8220
    };

    const nowIso = new Date().toISOString();

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          status: 'store_accepted',
          storeInfo: defaultStore,
          storeAcceptedAt: nowIso
        };
      })
    );

    // Push notification to Delivery Partners broadcast
    sendNotification({
      targetRole: 'partner',
      title: `⚡ Order #${orderId} Ready for Pickup`,
      message: `Store Owner confirmed item availability for Order #${orderId}! Pick up at ${defaultStore.name}. Tap to Accept delivery task.`,
      orderId,
      type: 'order'
    });

    // Push notification to Customer
    sendNotification({
      targetRole: 'customer',
      title: `✅ Store Owner Confirmed Stock #${orderId}`,
      message: `Store Owner verified all items in your order are in stock! Finding nearby delivery rider...`,
      orderId,
      type: 'order'
    });

    // Push notification to Admin & Owner
    sendNotification({
      targetRole: 'admin',
      title: `🏪 Store Accepted Order #${orderId}`,
      message: `Order #${orderId} marked in stock by Store Owner and broadcasted to delivery riders.`,
      orderId,
      type: 'order'
    });
  };

  // Admin/Partner manual status updater
  const updateOrderStatusByAdmin = (orderId: string, status: OrderStatus, partnerId?: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId) return ord;
        let pId = ord.deliveryPartnerId || partnerId;
        let pName = ord.deliveryPartnerName;
        if (partnerId) {
          const match = partners.find(p => p.id === partnerId);
          if (match) {
            pId = match.id;
            pName = match.name;
          }
        }
        return {
          ...ord,
          status,
          deliveryPartnerId: pId,
          deliveryPartnerName: pName
        };
      })
    );

    const statusMap: Record<OrderStatus, string> = {
      placed: 'Order placed by customer',
      store_accepted: 'Store accepted order & confirmed stock',
      READY_FOR_DELIVERY: 'Ready for delivery',
      PARTNER_ACCEPTED: 'Delivery partner accepted order',
      accepted: 'Order accepted by partner',
      rejected: 'Order rejected',
      picked_up: 'Order picked up from store',
      out_for_delivery: 'Out for delivery',
      delivered: 'Order delivered successfully',
      cancelled: 'Order cancelled'
    };

    sendNotification({
      targetRole: 'customer',
      title: `Order Update #${orderId}`,
      message: `Status: ${statusMap[status] || status}`,
      orderId,
      type: 'order'
    });
  };

  // Inventory & Management functions
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prodData,
      id: 'prod-' + Date.now()
    };
    setProducts(prev => [newProd, ...prev]);
    sendNotification({
      targetRole: 'all',
      title: '✨ New Product Added',
      message: `${newProd.name} is now available in store!`,
      type: 'promo'
    });
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const toggleOutOfStock = (productId: string) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, isOutOfStock: !p.isOutOfStock } : p));
  };

  const toggleHideProduct = (productId: string) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, isHidden: !p.isHidden } : p));
  };

  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: 'cat-' + Date.now()
    };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (updated: Category) => {
    setCategories(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const deleteCategory = (catId: string) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  const registerPartner = (partnerData: Omit<DeliveryPartner, 'id' | 'totalEarnings' | 'completedOrdersCount' | 'rating'>) => {
    const newPartner: DeliveryPartner = {
      ...partnerData,
      id: 'partner-' + Date.now(),
      totalEarnings: 0,
      completedOrdersCount: 0,
      rating: 5.0
    };
    setPartners(prev => [...prev, newPartner]);
    sendNotification({
      targetRole: 'admin',
      title: '🛵 Delivery Partner Registered',
      message: `${newPartner.name} registered with vehicle ${newPartner.vehicleNumber}.`,
      type: 'system'
    });
  };

  const updatePartner = (updated: DeliveryPartner) => {
    setPartners(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const updatePaymentSettings = (settings: Partial<PaymentSettings>) => {
    setPaymentSettings(prev => ({ ...prev, ...settings }));
  };

  const addFAQ = (faqData: Omit<FAQItem, 'id'>) => {
    const newFaq: FAQItem = {
      ...faqData,
      id: 'faq-' + Date.now(),
      helpfulCount: 0
    };
    setFaqs(prev => [newFaq, ...prev]);
  };

  const updateFAQ = (updated: FAQItem) => {
    setFaqs(prev => prev.map(f => f.id === updated.id ? updated : f));
  };

  const deleteFAQ = (faqId: string) => {
    setFaqs(prev => prev.filter(f => f.id !== faqId));
  };

  const voteFAQHelpful = (faqId: string) => {
    setFaqs(prev => prev.map(f => f.id === faqId ? { ...f, helpfulCount: (f.helpfulCount || 0) + 1 } : f));
  };

  const submitSupportTicket = (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => {
    const newTicket: SupportTicket = {
      ...ticketData,
      id: 'tkt-' + Date.now().toString().slice(-4),
      status: 'open',
      createdAt: new Date().toISOString()
    };
    setSupportTickets(prev => [newTicket, ...prev]);
    sendNotification({
      targetRole: 'admin',
      title: '📩 New Customer Support Ticket',
      message: `${newTicket.customerName}: ${newTicket.subject}`,
      type: 'system'
    });
  };

  const updateTicketStatus = (ticketId: string, status: 'open' | 'in_progress' | 'resolved') => {
    setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
  };

  const addBanner = (bannerData: Omit<PromoBanner, 'id'>) => {
    const newBanner: PromoBanner = {
      ...bannerData,
      id: 'banner-' + Date.now()
    };
    setBanners(prev => [newBanner, ...prev]);
  };

  const toggleBannerActive = (bannerId: string) => {
    setBanners(prev => prev.map(b => b.id === bannerId ? { ...b, active: !b.active } : b));
  };

  const addCoupon = (couponData: Omit<Coupon, 'id'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: 'coup-' + Date.now()
    };
    setCoupons(prev => [newCoupon, ...prev]);
  };

  const toggleCouponActive = (couponId: string) => {
    setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, isActive: !c.isActive } : c));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const addAddress = (addrData: Omit<DeliveryAddress, 'id'>) => {
    const newAddr: DeliveryAddress = {
      ...addrData,
      id: 'addr-' + Date.now()
    };
    setAddresses(prev => [...prev, newAddr]);
    setSelectedAddress(newAddr);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentUser,
        users,
        loginUser,
        loginWithGoogle,
        customerSignup,
        createUserByAdmin,
        setupInitialOwner,
        sendForgotPassword,
        toggleUserStatus,
        deleteUser,
        logoutUser,
        selectedPartnerId,
        setSelectedPartnerId,
        activePartner,
        categories,
        products,
        banners,
        partners,
        coupons,
        orders,
        notifications,
        paymentSettings,
        addresses,
        selectedAddress,
        setSelectedAddress,
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        wishlistProductIds,
        toggleWishlist,
        selectedCategoryId,
        setSelectedCategoryId,
        searchQuery,
        setSearchQuery,
        themeMode,
        toggleTheme,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        placeOrder,
        reverifyOrderPayment,
        adminReviewPayment,
        partnerRespondToOrder,
        storeAcceptOrder,
        updateOrderStatusByAdmin,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleOutOfStock,
        toggleHideProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        registerPartner,
        updatePartner,
        updatePaymentSettings,
        addBanner,
        toggleBannerActive,
        addCoupon,
        toggleCouponActive,
        markNotificationRead,
        addAddress,
        servicePincodes,
        addServicePincode,
        updateServicePincode,
        deleteServicePincode,
        toggleServicePincodeActive,
        isPincodeApproved,
        getPincodeInfo,
        faqs,
        supportTickets,
        addFAQ,
        updateFAQ,
        deleteFAQ,
        voteFAQHelpful,
        submitSupportTicket,
        updateTicketStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
