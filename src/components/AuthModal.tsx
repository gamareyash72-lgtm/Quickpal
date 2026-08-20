import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { getDetectedPortalMode } from '../utils/portalConfig';
import {
  X,
  User,
  Bike,
  ShieldCheck,
  Store,
  Lock,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Smartphone,
  Info
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'customer'
}) => {
  const {
    currentRole,
    currentUser,
    loginUser,
    loginWithGoogle,
    customerSignup,
    setupInitialOwner,
    sendForgotPassword,
    logoutUser,
    isPincodeApproved
  } = useApp();

  const { mode: detectedMode } = getDetectedPortalMode();
  const isCustomerPortal = detectedMode === 'customer' || defaultRole === 'customer';

  const [portalType, setPortalType] = useState<'customer' | 'staff'>(
    isCustomerPortal ? 'customer' : 'staff'
  );
  const [staffRole, setStaffRole] = useState<UserRole>(
    defaultRole !== 'customer' ? defaultRole : 'admin'
  );

  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');

  // Form State
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [pincodeInput, setPincodeInput] = useState('401102');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const staffRolesConfig: { id: UserRole; label: string; icon: React.ReactNode }[] = [
    { id: 'partner', label: 'Delivery Partner', icon: <Bike className="w-4 h-4" /> },
    { id: 'store', label: 'Store Staff', icon: <Store className="w-4 h-4" /> },
    { id: 'admin', label: 'Admin', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'owner', label: 'Owner', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);
    const targetRole = isCustomerPortal ? 'customer' : (portalType === 'customer' ? 'customer' : staffRole);
    const res = await loginWithGoogle(targetRole);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!emailInput.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!passwordInput) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const res = await loginUser(emailInput, 'customer', passwordInput);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleCustomerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!nameInput.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!passwordInput || passwordInput.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (!pincodeInput.trim() || !isPincodeApproved(pincodeInput)) {
      setErrorMsg('Sorry! QuickPal is currently available only in the Saphale (401102) service area.');
      return;
    }

    setIsSubmitting(true);
    const res = await customerSignup({
      name: nameInput,
      email: emailInput,
      password: passwordInput,
      phone: phoneInput
    });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!emailInput.trim()) {
      setErrorMsg('Please enter your registered staff email address or username.');
      return;
    }
    if (!passwordInput) {
      setErrorMsg('Please enter your staff portal password.');
      return;
    }

    setIsSubmitting(true);
    const res = await loginUser(emailInput, staffRole, passwordInput);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!emailInput.trim() || !emailInput.includes('@')) {
      setErrorMsg('Please enter a valid email address to receive password reset link.');
      return;
    }

    setIsSubmitting(true);
    const res = await sendForgotPassword(emailInput);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-auto max-h-[92vh] flex flex-col relative">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-black shadow-md text-xl">
              {isCustomerPortal || portalType === 'customer' ? '🛒' : '🔐'}
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                {isCustomerPortal || portalType === 'customer' ? 'Customer Account & Login' : 'Operations & Staff Portal'}
              </h2>
              <p className="text-xs text-orange-100 font-medium">
                {isCustomerPortal || portalType === 'customer'
                  ? 'Sign in or create an account for 10-min grocery delivery'
                  : 'Authorized personnel login for Admin, Store & Delivery'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Logged In Banner */}
        {currentUser && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 p-3 px-5 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Logged in as <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()})</span>
            </div>
            <button
              onClick={() => {
                logoutUser();
                setSuccessMsg('Signed out successfully.');
              }}
              className="text-rose-600 dark:text-rose-400 hover:underline font-black"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Modal Body Container */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Main Portal Selector: ONLY shown on staff / non-customer portals */}
          {!isCustomerPortal && (
            <div className="flex bg-gray-100 dark:bg-gray-800/80 p-1 rounded-2xl border border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setPortalType('customer');
                  setAuthMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
                  portalType === 'customer'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer Account</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortalType('staff');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
                  portalType === 'staff'
                    ? 'bg-amber-500 text-gray-950 shadow-sm font-black'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Staff & Operations Login</span>
              </button>
            </div>
          )}

          {errorMsg && (
            errorMsg.includes('unauthorized-domain') || errorMsg.includes('Domain') ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 rounded-2xl text-amber-900 dark:text-amber-200 text-xs space-y-2.5 shadow-sm">
                <div className="flex items-center gap-2 font-black text-amber-900 dark:text-amber-200 text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Authorized Domain Setup Required</span>
                </div>
                <p className="leading-relaxed text-[11px] text-amber-800 dark:text-amber-300">
                  Google Sign-In requires your current app domain to be added to Firebase Console:
                </p>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                  <code className="text-[11px] font-mono text-orange-600 dark:text-orange-400 font-bold flex-1 truncate">
                    {typeof window !== 'undefined' ? window.location.hostname : ''}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(window.location.hostname);
                        alert(`Copied '${window.location.hostname}' to clipboard!`);
                      }
                    }}
                    className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[10px] font-black shrink-0 transition-colors shadow-xs"
                  >
                    Copy Domain
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal">
                  👉 Go to <strong>Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</strong> for project <strong>quickpal-new</strong>. Email/Password & Demo accounts work immediately below!
                </p>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <p className="flex-1">{errorMsg}</p>
              </div>
            )
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* CUSTOMER PORTAL UI */}
          {portalType === 'customer' && (
            <div className="space-y-4">
              {/* Tab Selector: Login vs Sign Up */}
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                    authMode === 'login'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Customer Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                    authMode === 'signup'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Create Account (Sign Up)
                </button>
              </div>

              {/* CUSTOMER LOGIN FORM */}
              {authMode === 'login' && (
                <form onSubmit={handleCustomerLogin} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300 block mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot');
                          setErrorMsg('');
                          setSuccessMsg('');
                        }}
                        className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passwordInput}
                        onChange={e => setPasswordInput(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? 'Authenticating...' : 'Sign In to QuickPal'} <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] font-bold uppercase">
                      <span className="bg-white dark:bg-gray-900 px-2 text-gray-400">Or continue with</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Sign in with Google
                  </button>
                </form>
              )}

              {/* CUSTOMER SIGNUP FORM */}
              {authMode === 'signup' && (
                <form onSubmit={handleCustomerSignup} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300 block mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. Yash Gamare"
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300 block mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300 block mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={passwordInput}
                        onChange={e => setPasswordInput(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300 block mb-1">
                      Mobile Phone Number
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        placeholder="+91 98000 00000"
                        value={phoneInput}
                        onChange={e => setPhoneInput(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
                        Delivery PIN Code *
                      </label>
                      <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold">
                        Service Area: Saphale (401102)
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="401102"
                      value={pincodeInput}
                      onChange={e => setPincodeInput(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Customer Account'} <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* FORGOT PASSWORD FORM */}
              {authMode === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs">
                    <p className="font-extrabold text-amber-900 dark:text-amber-200">
                      Reset Password Link
                    </p>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">
                      Enter your registered email address below and we will send you a secure Firebase link to reset your password.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300 block mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold"
                    >
                      Back to Login
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-md"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              )}

              {/* Footer Switcher for Staff Access: ONLY shown on staff / non-customer portals */}
              {!isCustomerPortal && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setPortalType('staff');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-xs font-bold text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                    Staff, Partner & Owner Login Portal →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STAFF & OPERATIONS PORTAL UI */}
          {portalType === 'staff' && (
            <div className="space-y-4">
              {/* Policy Banner */}
              <div className="bg-amber-50/80 dark:bg-amber-950/50 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs space-y-1">
                <div className="flex items-center gap-2 font-black uppercase text-amber-800 dark:text-amber-200">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>Operations Access Control</span>
                </div>
                <p className="font-semibold text-[11px] leading-relaxed text-amber-900 dark:text-amber-300">
                  Self-registration is disabled for Staff, Partner, Store & Admin accounts. Account credentials are generated exclusively by company management.
                </p>
              </div>

              {/* Staff Role Selector Tabs */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">
                  Select Target Portal Role:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {staffRolesConfig.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setStaffRole(r.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1 transition-all border ${
                        staffRole === r.id
                          ? 'bg-orange-500 text-white border-orange-600 shadow-md scale-102'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-950/30'
                      }`}
                    >
                      {r.icon}
                      <span className="text-[11px] truncate">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Staff Login Form */}
              <form onSubmit={handleStaffLogin} className="space-y-3">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300 block mb-1">
                    Staff Registered Email / Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder={`e.g. ${staffRole}@quickpal.com`}
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300 block mb-1">
                    Staff Portal Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? 'Authenticating Staff...' : `Login to ${staffRole.toUpperCase()} Portal`} <ArrowRight className="w-4 h-4" />
                </button>

                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-bold uppercase">
                    <span className="bg-white dark:bg-gray-900 px-2 text-gray-400">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Sign in with Google
                </button>
              </form>

              {/* Return to Customer Login */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setPortalType('customer');
                    setAuthMode('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-xs font-bold text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors inline-flex items-center gap-1.5"
                >
                  ← Return to Customer Grocery Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
