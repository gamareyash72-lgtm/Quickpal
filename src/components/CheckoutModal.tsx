import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import { registerAuthorizedUtr } from '../utils/paymentVerifier';
import { AddAddressModal } from './AddAddressModal';
import {
  X,
  MapPin,
  QrCode,
  CreditCard,
  Building2,
  Banknote,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Tag,
  Clock,
  ArrowRight,
  Lock,
  Check,
  Sparkles,
  KeyRound,
  ShieldAlert,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  XCircle,
  Plus,
  Navigation,
  Trash2
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const {
    cartItems,
    cartSubtotal,
    selectedAddress,
    addresses,
    setSelectedAddress,
    deleteAddress,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    paymentSettings,
    placeOrder,
    isPincodeApproved
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi_qr');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  
  // Checkout Multi-Step State: 'details' | 'verify_payment' | 'transaction_failed'
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'verify_payment' | 'transaction_failed'>('details');
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<{ id: string; label: string; addressLine: string } | null>(null);

  // Payment Verification Fields
  const [utrNumber, setUtrNumber] = useState('');
  const [customSubmittedAmount, setCustomSubmittedAmount] = useState<number | null>(null);
  const [isPaymentConfirmedChecked, setIsPaymentConfirmedChecked] = useState(true);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');
  
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    otp: ''
  });
  const [selectedBank, setSelectedBank] = useState('State Bank of India (SBI)');
  const [netBankingOtp, setNetBankingOtp] = useState('');

  // Verification Progress & Failed Screen State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStage, setVerificationStage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [launchAppNotice, setLaunchAppNotice] = useState<string>('');
  
  const [failedPaymentInfo, setFailedPaymentInfo] = useState<{
    orderId?: string;
    failureReason: string;
    submittedRef?: string;
    submittedAmt?: number;
  } | null>(null);

  if (!isOpen) return null;

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

  // Cash on delivery rule checks
  const isCodEligible =
    paymentSettings.allowCOD &&
    total >= paymentSettings.codMin &&
    total <= paymentSettings.codMax;

  // Image Upload Handler
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // UPI Deep Linking Handler
  const handleLaunchUpiApp = (appName: string, customScheme?: string) => {
    const upiUri = `upi://pay?pa=${encodeURIComponent(
      paymentSettings.upiId
    )}&pn=${encodeURIComponent(paymentSettings.payeeName)}&am=${total}&cu=INR&tn=QuickPal%20Order`;

    let launchUrl = upiUri;
    if (customScheme === 'gpay') {
      launchUrl = `gpay://upi/pay?pa=${encodeURIComponent(paymentSettings.upiId)}&pn=${encodeURIComponent(paymentSettings.payeeName)}&am=${total}&cu=INR`;
    } else if (customScheme === 'phonepe') {
      launchUrl = `phonepe://upi/pay?pa=${encodeURIComponent(paymentSettings.upiId)}&pn=${encodeURIComponent(paymentSettings.payeeName)}&am=${total}&cu=INR`;
    } else if (customScheme === 'paytm') {
      launchUrl = `paytmmp://pay?pa=${encodeURIComponent(paymentSettings.upiId)}&pn=${encodeURIComponent(paymentSettings.payeeName)}&am=${total}&cu=INR`;
    }

    setLaunchAppNotice(`🚀 Redirecting to ${appName}... Pay ₹${total} to ${paymentSettings.upiId}. After payment, paste the 12-digit UTR below.`);

    try {
      window.location.href = launchUrl;
    } catch {
      window.open(upiUri, '_blank');
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const res = applyCoupon(couponCode);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCode('');
    }
  };

  // Step 1 -> Step 2: Proceed to Payment Verification
  const handleProceedToVerification = () => {
    setErrorMsg('');

    if (!isPincodeApproved(selectedAddress.pincode)) {
      setErrorMsg(
        `Sorry! QuickPal is currently available only in the 401102 service area (Saphale East & West). Delivery is not available for PIN Code ${selectedAddress.pincode}.`
      );
      return;
    }

    if (paymentMethod === 'cod' && !isCodEligible) {
      setErrorMsg(
        `Cash on Delivery is available only for orders between ₹${paymentSettings.codMin} and ₹${paymentSettings.codMax}. Your total is ₹${total}. Please select Online Payment.`
      );
      return;
    }

    setCheckoutStep('verify_payment');
  };

  // Step 2: Confirm Payment & Finalize Order Placement
  const handleConfirmAndPay = () => {
    setErrorMsg('');

    if (!isPincodeApproved(selectedAddress.pincode)) {
      setErrorMsg(
        `Sorry! QuickPal is currently available only in the 401102 service area (Saphale East & West). Delivery is not available for PIN Code ${selectedAddress.pincode}.`
      );
      return;
    }

    // Validation for online payment verification
    if (paymentMethod === 'upi_qr' || paymentMethod === 'upi_app') {
      if (!utrNumber.trim() || utrNumber.trim().length < 6) {
        setErrorMsg('Please enter a valid 12-digit UTR / UPI Transaction Reference number.');
        return;
      }
      if (!isPaymentConfirmedChecked) {
        setErrorMsg('Please confirm that you have scanned the QR code or sent payment to the UPI ID.');
        return;
      }
    } else if (paymentMethod === 'debit_card' || paymentMethod === 'credit_card') {
      if (!cardDetails.otp.trim()) {
        setErrorMsg('Please enter the 6-digit 3D-Secure Bank OTP.');
        return;
      }
    } else if (paymentMethod === 'online_banking') {
      if (!netBankingOtp.trim()) {
        setErrorMsg('Please enter your NetBanking Bank Security OTP.');
        return;
      }
    }

    // Start payment verification simulation with NPCI ledger rules
    setIsVerifying(true);
    setVerificationStage('Connecting to NPCI & Bank Payment Gateway...');

    setTimeout(() => {
      setVerificationStage(`Querying bank settlement ledger for payee ${paymentSettings.upiId}...`);
    }, 1000);

    setTimeout(() => {
      setVerificationStage('Reconciling UTR transaction reference & paid amount...');
    }, 2000);

    setTimeout(() => {
      const activeSubmittedAmt = customSubmittedAmount !== null ? customSubmittedAmount : total;
      const rawRef = paymentMethod === 'cod'
        ? undefined
        : paymentMethod === 'upi_qr' || paymentMethod === 'upi_app'
        ? utrNumber.trim()
        : cardDetails.otp;

      const res = placeOrder(paymentMethod, orderNotes, rawRef, activeSubmittedAmt, screenshotUrl || undefined);
      setIsVerifying(false);

      if (res.success && res.orderId) {
        setVerificationStage('✅ Payment Verified & Order Confirmed!');
        onOrderSuccess(res.orderId);
      } else {
        // Show dedicated Transaction Failed Screen
        setFailedPaymentInfo({
          orderId: res.orderId,
          failureReason: res.failureReason || res.message || 'Payment verification failed.',
          submittedRef: rawRef,
          submittedAmt: activeSubmittedAmt
        });
        setCheckoutStep('transaction_failed');
      }
    }, 3000);
  };

  // Switch Order to COD from Failed Screen
  const handleSwitchToCODAndPlace = () => {
    if (!isCodEligible) {
      setErrorMsg(`Cash on Delivery is unavailable for total ₹${total}.`);
      return;
    }
    const res = placeOrder('cod', orderNotes);
    if (res.success && res.orderId) {
      onOrderSuccess(res.orderId);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Dynamic UPI String for QR Code & Apps
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(
    paymentSettings.upiId
  )}&pn=${encodeURIComponent(paymentSettings.payeeName)}&am=${total}&cu=INR&tn=QuickPal%20Grocery%20Order`;
  
  const qrCodeImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    upiPayUrl
  )}`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-auto max-h-[92vh] flex flex-col relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-600 to-yellow-600 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {checkoutStep === 'verify_payment' && !isVerifying && (
              <button
                onClick={() => setCheckoutStep('details')}
                className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white mr-1 transition-colors"
                title="Back to details"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-amber-300 text-orange-950 flex items-center justify-center font-black shadow-md">
              QP
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                {checkoutStep === 'details' ? 'Checkout & Payment' : 'Confirm & Verify Payment'}
              </h2>
              <p className="text-xs text-orange-100 font-medium">
                {checkoutStep === 'details'
                  ? `Delivering to ${selectedAddress.area} within 30 mins`
                  : `Secured Online Payment Verification (${paymentMethod.toUpperCase()})`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isVerifying}
            className="p-2 rounded-full hover:bg-white/10 text-orange-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VERIFICATION OVERLAY SPINNER */}
        {isVerifying && (
          <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div className="space-y-2 max-w-md">
              <span className="bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-200 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Real-Time Gateway Check
              </span>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Verifying Payment of ₹{total}
              </h3>
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400 min-h-[30px] transition-all">
                {verificationStage}
              </p>
              <p className="text-[11px] text-gray-400">
                Please do not refresh or close this window while we confirm receipt with bank servers.
              </p>
            </div>
          </div>
        )}

        {/* STEP 1: CHECKOUT DETAILS & METHOD SELECTION */}
        {checkoutStep === 'details' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Delivery Address */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-black uppercase text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  Delivery Address
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(true)}
                  className="text-xs text-orange-600 hover:text-orange-700 font-extrabold flex items-center gap-1 bg-orange-50 dark:bg-orange-950/60 px-2.5 py-1 rounded-xl border border-orange-200 dark:border-orange-800 transition-transform active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Address
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {addresses.map(addr => {
                  const isApproved = isPincodeApproved(addr.pincode);
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all relative group ${
                        selectedAddress.id === addr.id
                          ? isApproved
                            ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-900/20 ring-2 ring-orange-500/20'
                            : 'border-rose-500 bg-rose-50/60 dark:bg-rose-900/20 ring-2 ring-rose-500/20'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-orange-800 dark:text-orange-300">
                          {addr.label}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                              isApproved
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                            }`}
                          >
                            {isApproved ? '✓ Serviceable' : '✕ Unserviceable'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAddressToDelete({ id: addr.id, label: addr.label, addressLine: addr.addressLine });
                            }}
                            className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-gray-400 hover:text-rose-600 transition-colors"
                            title={`Delete ${addr.label} address`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs font-semibold">{addr.addressLine}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {addr.area}, {addr.city} - <strong className={isApproved ? 'text-gray-700 dark:text-gray-200' : 'text-rose-600 dark:text-rose-400'}>{addr.pincode}</strong>
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Selected Location Confirmation Badge */}
              {selectedAddress && (
                <div className="mt-2.5 p-3 bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs font-black">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-orange-950 dark:text-orange-200">
                        Delivery Coordinates Confirmed
                      </p>
                      <p className="text-[11px] font-mono text-gray-600 dark:text-gray-300">
                        Lat: {(selectedAddress.latitude || 19.5785).toFixed(5)}, Lng: {(selectedAddress.longitude || 72.8220).toFixed(5)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!navigator.geolocation) return;
                      navigator.geolocation.getCurrentPosition((pos) => {
                        const updated = {
                          ...selectedAddress,
                          latitude: pos.coords.latitude,
                          longitude: pos.coords.longitude
                        };
                        setSelectedAddress(updated);
                      });
                    }}
                    className="text-[11px] font-black text-orange-700 dark:text-orange-300 hover:text-orange-800 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-xl border border-orange-200 dark:border-orange-800 shadow-2xs flex items-center gap-1 shrink-0"
                  >
                    <Navigation className="w-3 h-3 text-orange-600" />
                    Confirm Current GPS
                  </button>
                </div>
              )}

              {!isPincodeApproved(selectedAddress.pincode) && (
                <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-200 text-xs font-bold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold">Service Unavailable in {selectedAddress.pincode}</p>
                    <p className="text-[11px] font-medium text-rose-700 dark:text-rose-300">
                      Sorry! QuickPal is currently available only in the 401102 service area (Saphale East & West). We will expand to your location soon.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Coupon Section */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-amber-600" />
                  Offers & Promo Coupons
                </span>
                {appliedCoupon && (
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Remove Coupon
                  </button>
                )}
              </div>

              {appliedCoupon ? (
                <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-amber-300 flex items-center justify-between text-xs font-bold text-orange-700 dark:text-orange-400">
                  <span>
                    🎉 Applied <strong>{appliedCoupon.code}</strong> ({appliedCoupon.description})
                  </span>
                  <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-lg text-[10px] font-black">
                    -₹{discount} OFF
                  </span>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code e.g. QUICK50"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    className="flex-1 bg-white dark:bg-gray-800 border border-amber-300 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-black px-4 py-1.5 rounded-xl text-xs shadow-sm transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-600 font-bold mt-1.5">{couponError}</p>}
            </div>

            {/* Payment Method Selection */}
            <div>
              <h3 className="text-sm font-black uppercase text-gray-700 dark:text-gray-300 mb-2.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                Select Payment Method
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                {/* UPI QR Code */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi_qr')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'upi_qr'
                      ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/30 ring-2 ring-orange-500/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <QrCode className="w-5 h-5 text-orange-600" />
                    <span className="bg-orange-100 text-orange-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                      RECOMMENDED
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-black">UPI QR Code</p>
                    <p className="text-[10px] text-gray-500">Scan & Pay via GPay, PhonePe</p>
                  </div>
                </button>

                {/* UPI Apps */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi_app')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'upi_app'
                      ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/30 ring-2 ring-orange-500/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-blue-600 mb-2" />
                  <div>
                    <p className="text-xs font-black">UPI ID / Apps</p>
                    <p className="text-[10px] text-gray-500">Paytm, BHIM, Cred</p>
                  </div>
                </button>

                {/* Debit / Credit Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('debit_card')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'debit_card' || paymentMethod === 'credit_card'
                      ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/30 ring-2 ring-orange-500/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-purple-600 mb-2" />
                  <div>
                    <p className="text-xs font-black">Cards</p>
                    <p className="text-[10px] text-gray-500">Visa, Mastercard, RuPay</p>
                  </div>
                </button>

                {/* Online Banking */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('online_banking')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'online_banking'
                      ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/30 ring-2 ring-orange-500/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-amber-600 mb-2" />
                  <div>
                    <p className="text-xs font-black">Net Banking</p>
                    <p className="text-[10px] text-gray-500">All Major Banks</p>
                  </div>
                </button>

                {/* Cash On Delivery (COD) */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/30 ring-2 ring-orange-500/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                  } ${!isCodEligible ? 'opacity-80' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Banknote className="w-5 h-5 text-orange-700" />
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        isCodEligible ? 'bg-orange-100 text-orange-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isCodEligible ? '₹10-₹200' : 'COD LIMIT'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-black">Cash on Delivery</p>
                    <p className="text-[10px] text-gray-500">Pay cash upon arrival</p>
                  </div>
                </button>
              </div>

              {/* COD Notice */}
              {paymentMethod === 'cod' && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                    isCodEligible
                      ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-200'
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                  }`}
                >
                  <div className="flex items-start gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <span className="font-extrabold uppercase tracking-wide">
                        Cash on Delivery Rule Notice:
                      </span>
                      <p className="mt-0.5">
                        COD is strictly allowed <strong>ONLY for orders between ₹{paymentSettings.codMin} and ₹{paymentSettings.codMax}</strong>.
                      </p>
                      {!isCodEligible && (
                        <p className="mt-1 font-extrabold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 p-1.5 rounded-lg border border-rose-200">
                          ❌ Your order total is ₹{total}. Since it exceeds ₹{paymentSettings.codMax}, COD cannot be selected. Please choose UPI QR or Card payment above.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Special Instructions */}
            <div>
              <label className="text-xs font-black uppercase text-gray-700 dark:text-gray-300 block mb-1">
                Delivery Notes / Instructions
              </label>
              <input
                type="text"
                value={orderNotes}
                onChange={e => setOrderNotes(e.target.value)}
                placeholder="e.g. Leave at door, do not ring bell..."
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Bill Summary */}
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
              <h4 className="font-black uppercase text-gray-700 dark:text-gray-300 pb-1 border-b border-gray-200 dark:border-gray-700">
                Bill Details ({cartItems.length} Items)
              </h4>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Item Total</span>
                <span className="font-bold">₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Delivery Charge (10 Mins Express)
                </span>
                <span className="font-bold">
                  {deliveryFee === 0 ? <span className="text-orange-600 font-extrabold">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Handling Fee</span>
                <span className="font-bold">₹{handlingFee}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-orange-600 font-bold">
                  <span>Discount Promo</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm font-black">
                <span>Grand Total</span>
                <span className="text-lg text-orange-600 dark:text-orange-400">₹{total}</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PAYMENT VERIFICATION SCREEN */}
        {checkoutStep === 'verify_payment' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Payment Summary Header */}
            <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200 dark:border-orange-800/60 p-4 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-black uppercase text-orange-800 dark:text-orange-300">
                  Selected Payment Mode
                </span>
                <p className="text-sm font-black uppercase">{paymentMethod.replace('_', ' ')}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-gray-400">Amount Payable</span>
                <p className="text-lg font-black text-orange-600 dark:text-orange-400">₹{total}</p>
              </div>
            </div>

            {/* UPI QR Code & App Direct Launch Verification */}
            {(paymentMethod === 'upi_qr' || paymentMethod === 'upi_app') && (
              <div className="space-y-4">
                <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-gray-200 shrink-0 text-center">
                    <img
                      src={qrCodeImgUrl}
                      alt="QuickPal UPI QR Code"
                      className="w-40 h-40 rounded-xl mx-auto"
                    />
                    <span className="text-[9px] font-black text-gray-500 mt-1 block">Scan with any UPI App</span>
                  </div>
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div className="inline-flex items-center gap-1 bg-amber-400 text-orange-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      <Sparkles className="w-3 h-3" /> Official Store Payee
                    </div>
                    <h4 className="text-base font-black text-gray-900 dark:text-white">
                      {paymentSettings.payeeName}
                    </h4>
                    <div className="bg-white/90 dark:bg-gray-800 p-2 rounded-xl border border-orange-200 dark:border-orange-700">
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Payee UPI ID</p>
                      <p className="text-xs font-mono font-black text-orange-700 dark:text-orange-300">
                        {paymentSettings.upiId}
                      </p>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                      Send exact amount <strong className="text-orange-800 dark:text-orange-300 font-extrabold text-xs">₹{total}</strong> to this UPI ID.
                    </p>

                    {/* Direct App Launchers */}
                    <div className="pt-1">
                      <span className="text-[10px] uppercase font-black text-gray-400 block mb-1">
                        📲 Tap to Open UPI App Directly:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleLaunchUpiApp('Google Pay', 'gpay')}
                          className="bg-white dark:bg-gray-800 hover:bg-gray-100 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 font-extrabold text-[10px] py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <ExternalLink className="w-3 h-3 text-blue-600" /> GPay
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLaunchUpiApp('PhonePe', 'phonepe')}
                          className="bg-white dark:bg-gray-800 hover:bg-gray-100 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 font-extrabold text-[10px] py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <ExternalLink className="w-3 h-3 text-purple-600" /> PhonePe
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLaunchUpiApp('Paytm', 'paytm')}
                          className="bg-white dark:bg-gray-800 hover:bg-gray-100 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 font-extrabold text-[10px] py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <ExternalLink className="w-3 h-3 text-cyan-600" /> Paytm
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLaunchUpiApp('BHIM UPI')}
                          className="bg-white dark:bg-gray-800 hover:bg-gray-100 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 font-extrabold text-[10px] py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <ExternalLink className="w-3 h-3 text-emerald-600" /> BHIM
                        </button>
                      </div>
                    </div>

                    {launchAppNotice && (
                      <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/60 p-1.5 rounded-lg border border-amber-200 dark:border-amber-800 mt-1">
                        {launchAppNotice}
                      </p>
                    )}
                  </div>
                </div>

                {/* UTR Reference & Reconciliation Input Form */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 space-y-1.5">
                    <p className="font-extrabold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        Strict NPCI Store Bank Ledger Reconciliation
                      </span>
                    </p>
                    <p className="text-[10px] leading-relaxed">
                      • <strong>Strict Security Rule:</strong> Randomly typed 12-digit numbers or external URLs will be <strong>REJECTED</strong> because they are not present in the store's official bank account payee ledger (<code>qpstore@icici</code>).<br />
                      • Click below to simulate an authorized merchant settlement token.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const generatedAuthorizedUtr = '42' + Math.floor(1000000021 + Math.random() * 8999999900).toString().slice(0, 10);
                        registerAuthorizedUtr(generatedAuthorizedUtr);
                        setUtrNumber(generatedAuthorizedUtr);
                        setCustomSubmittedAmount(total);
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-1.5 px-3 rounded-lg text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      ⚡ Simulate Instant GPay/PhonePe Bank Settlement (Generates Verified UTR)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-extrabold uppercase text-gray-800 dark:text-gray-200 block mb-1">
                        12-Digit UPI UTR Reference No. <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g. 423891827364"
                          value={utrNumber}
                          onChange={e => setUtrNumber(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl pl-10 pr-3 py-2.5 text-xs font-mono font-black tracking-widest focus:ring-2 focus:ring-orange-500"
                        />
                        <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-extrabold uppercase text-gray-800 dark:text-gray-200 block mb-1">
                        Amount Paid (₹) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={customSubmittedAmount !== null ? customSubmittedAmount : total}
                        onChange={e => setCustomSubmittedAmount(Number(e.target.value))}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs font-black text-orange-600 dark:text-orange-400 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* Payment Receipt Screenshot Upload */}
                  <div className="bg-gray-50 dark:bg-gray-900/60 p-3 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                    <label className="text-xs font-extrabold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-orange-500" />
                      Attach Payment Receipt Screenshot (Optional)
                    </label>
                    <p className="text-[10px] text-gray-500">
                      Upload GPay, PhonePe, or Paytm payment success screenshot for instant manual admin approval.
                    </p>
                    
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-950 dark:text-orange-200 font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors">
                        <ImageIcon className="w-3.5 h-3.5" />
                        Choose Screenshot File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          className="hidden"
                        />
                      </label>
                      
                      {screenshotUrl && (
                        <div className="flex items-center gap-2">
                          <img src={screenshotUrl} alt="Receipt preview" className="w-10 h-10 object-cover rounded-lg border border-orange-300" />
                          <span className="text-[10px] font-bold text-emerald-600 truncate max-w-[140px]">{screenshotFileName || 'Screenshot attached'}</span>
                          <button
                            type="button"
                            onClick={() => { setScreenshotUrl(null); setScreenshotFileName(''); }}
                            className="text-[10px] text-rose-500 hover:underline font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="paymentCheck"
                      checked={isPaymentConfirmedChecked}
                      onChange={e => setIsPaymentConfirmedChecked(e.target.checked)}
                      className="w-4 h-4 text-orange-500 rounded border-gray-300 mt-0.5 cursor-pointer"
                    />
                    <label htmlFor="paymentCheck" className="text-xs text-gray-700 dark:text-gray-300 font-bold cursor-pointer">
                      I confirm that I have sent ₹{customSubmittedAmount !== null ? customSubmittedAmount : total} to UPI ID {paymentSettings.upiId}.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Card Payment Verification */}
            {(paymentMethod === 'debit_card' || paymentMethod === 'credit_card') && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3 text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700 font-black text-purple-700 dark:text-purple-300">
                  <Lock className="w-4 h-4" /> 3D-Secure Bank Payment Authorization
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardDetails.number}
                      onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">3D Secure Bank OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={cardDetails.otp}
                      onChange={e => setCardDetails({ ...cardDetails, otp: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 font-mono font-black tracking-widest text-center"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500">Enter the 3D-Secure OTP sent by your issuing bank.</p>
              </div>
            )}

            {/* Netbanking Verification */}
            {paymentMethod === 'online_banking' && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700 font-black text-amber-700 dark:text-amber-300">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Bank NetBanking Direct Checkout
                  </span>
                  <span className="text-[10px] font-bold text-gray-500">
                    IMPS / NEFT / NetBanking
                  </span>
                </div>

                {paymentSettings.bankAccountNumber && (
                  <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800/60 space-y-1 text-[11px]">
                    <span className="font-extrabold uppercase text-amber-900 dark:text-amber-200 block text-[10px]">
                      Store Bank Transfer Payee Account
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-gray-800 dark:text-gray-200 font-semibold">
                      <div>
                        <span className="text-gray-400 text-[10px] block font-medium">Bank:</span>
                        {paymentSettings.bankName || 'HDFC Bank'}
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block font-medium">Account Name:</span>
                        {paymentSettings.bankAccountName || 'QuickPal Retail Pvt Ltd'}
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block font-medium">Account No:</span>
                        <span className="font-mono font-bold text-orange-600 dark:text-orange-400">{paymentSettings.bankAccountNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block font-medium">IFSC Code:</span>
                        <span className="font-mono font-bold">{paymentSettings.bankIfscCode || 'HDFC0000123'}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Select Bank</label>
                  <select
                    value={selectedBank}
                    onChange={e => setSelectedBank(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 font-bold"
                  >
                    <option>State Bank of India (SBI)</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Punjab National Bank</option>
                    <option>Kotak Mahindra Bank</option>
                    <option>Bank of Baroda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Bank High-Security OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={netBankingOtp}
                    onChange={e => setNetBankingOtp(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 font-mono font-black tracking-widest text-center"
                  />
                </div>
              </div>
            )}

            {/* COD Confirmation Screen */}
            {paymentMethod === 'cod' && (
              <div className="bg-orange-50 dark:bg-orange-950/40 p-4 rounded-2xl border border-orange-200 dark:border-orange-800 text-xs text-orange-950 dark:text-orange-200 space-y-2">
                <p className="font-extrabold uppercase text-orange-800 dark:text-orange-300 flex items-center gap-1.5">
                  <Banknote className="w-4 h-4" /> Cash on Delivery Confirmation
                </p>
                <p className="leading-relaxed font-medium">
                  You have chosen to pay cash when your order arrives. Please keep exact change of <strong>₹{total}</strong> ready for the delivery partner upon arrival.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: DEDICATED TRANSACTION FAILED / VERIFICATION REJECTED SCREEN */}
        {checkoutStep === 'transaction_failed' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
            <div className="bg-rose-500 text-white p-4 rounded-2xl shadow-lg space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="w-6 h-6 shrink-0 text-white" />
                <h3 className="font-black text-base uppercase tracking-wide">
                  Transaction Failed / Payment Rejected
                </h3>
              </div>
              <p className="text-xs text-rose-100 leading-relaxed font-medium">
                The payment details you submitted could not be verified against the official bank account settlement ledger.
              </p>
            </div>

            {/* Error & Diagnostic Card */}
            <div className="bg-white dark:bg-gray-800 border-2 border-rose-200 dark:border-rose-900 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-black text-rose-500 block mb-0.5">Failure Reason</span>
                  <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
                    {failedPaymentInfo?.failureReason || 'Invalid, fake, or un-settled transaction reference submitted.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="bg-gray-50 dark:bg-gray-900 p-2.5 rounded-xl">
                  <span className="text-[9px] uppercase font-black text-gray-400 block">Submitted Ref / UTR</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {failedPaymentInfo?.submittedRef || utrNumber || 'None'}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-2.5 rounded-xl">
                  <span className="text-[9px] uppercase font-black text-gray-400 block">Attempted Amount</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    ₹{failedPaymentInfo?.submittedAmt || total} (Required: ₹{total})
                  </span>
                </div>
              </div>

              {failedPaymentInfo?.orderId && (
                <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                  <span className="font-black">Note:</span> Order <strong>#{failedPaymentInfo.orderId}</strong> has been saved as <strong>Pending / Payment Failed</strong>. You can re-verify payment or attach proof.
                </div>
              )}
            </div>

            {/* Recovery Action Options */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">
                Resolve Payment & Proceed:
              </h4>

              {/* Action 1: Re-verify with Genuine UTR */}
              <button
                type="button"
                onClick={() => setCheckoutStep('verify_payment')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-between shadow-md transition-all"
              >
                <span className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4" /> Re-enter Genuine 12-Digit UTR Number
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Action 2: Upload Payment Receipt Screenshot */}
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                <label className="text-xs font-black text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-orange-500" />
                  Upload GPay/PhonePe Payment Receipt Screenshot
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-orange-100 hover:bg-orange-200 text-orange-800 font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Select Image File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      className="hidden"
                    />
                  </label>
                  {screenshotUrl && (
                    <div className="flex items-center gap-2">
                      <img src={screenshotUrl} alt="Receipt preview" className="w-9 h-9 object-cover rounded border border-orange-300" />
                      <span className="text-[10px] font-bold text-emerald-600 truncate max-w-[140px]">Proof attached</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action 3: Launch UPI Apps directly */}
              <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-800 space-y-2 text-xs">
                <span className="font-black text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  Launch UPI App to Pay Again:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleLaunchUpiApp('Google Pay', 'gpay')}
                    className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-extrabold py-1.5 px-2 rounded-lg border border-gray-300 text-[10px] flex items-center justify-center gap-1"
                  >
                    GPay
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLaunchUpiApp('PhonePe', 'phonepe')}
                    className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-extrabold py-1.5 px-2 rounded-lg border border-gray-300 text-[10px] flex items-center justify-center gap-1"
                  >
                    PhonePe
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLaunchUpiApp('Paytm', 'paytm')}
                    className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-extrabold py-1.5 px-2 rounded-lg border border-gray-300 text-[10px] flex items-center justify-center gap-1"
                  >
                    Paytm
                  </button>
                </div>
              </div>

              {/* Action 4: Switch to Cash on Delivery */}
              {isCodEligible && (
                <button
                  type="button"
                  onClick={handleSwitchToCODAndPlace}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Banknote className="w-4 h-4" /> Switch to Cash on Delivery (COD) & Place Order
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer / Action Buttons */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 shrink-0 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400">Total Amount</span>
            <p className="text-xl font-black text-orange-600 dark:text-orange-400 leading-none">
              ₹{total}
            </p>
          </div>

          {checkoutStep === 'details' ? (
            <button
              onClick={handleProceedToVerification}
              disabled={paymentMethod === 'cod' && !isCodEligible}
              className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl transition-all transform active:scale-95 ${
                paymentMethod === 'cod' && !isCodEligible
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30'
              }`}
            >
              <span>Proceed to Pay & Verify</span> <ArrowRight className="w-4 h-4" />
            </button>
          ) : checkoutStep === 'verify_payment' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCheckoutStep('details')}
                className="px-4 py-3 rounded-2xl font-bold text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Change Method
              </button>
              <button
                onClick={handleConfirmAndPay}
                disabled={isVerifying}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all transform active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" /> Verify & Complete Order
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCheckoutStep('verify_payment')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-2xl font-extrabold text-xs flex items-center gap-1.5 shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Try Again
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-2xl font-bold text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Delivery Address Modal */}
      <AddAddressModal
        isOpen={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
      />

      {/* Delete Address Confirmation Modal */}
      {addressToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs font-bold border border-rose-200 dark:border-rose-900/50 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100">
                Remove Saved Address?
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold leading-relaxed">
              Are you sure you want to remove <span className="text-orange-600 dark:text-orange-400 font-black">'{addressToDelete.label}'</span> ({addressToDelete.addressLine}) from your delivery addresses?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddressToDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAddress(addressToDelete.id);
                  setAddressToDelete(null);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black px-4 py-2 rounded-xl shadow-md flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
