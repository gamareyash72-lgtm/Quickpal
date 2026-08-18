import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  ShieldCheck,
  Lock,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Radio,
  Zap,
  CheckCircle2,
  AlertCircle,
  Headphones
} from 'lucide-react';
import { maskPhoneNumber, maskCustomerCarePhone, DEFAULT_CUSTOMER_CARE_PHONE } from '../utils/phonePrivacy';

interface SecureCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: 'customer' | 'partner' | 'store' | 'support' | 'customercare' | string;
  recipientRole?: string;
  targetName?: string;
  recipientName?: string;
  orderId?: string;
  targetPhone?: string;
  rawPhoneNumber?: string;
  userRole?: string;
}

export const SecureCallModal: React.FC<SecureCallModalProps> = ({
  isOpen,
  onClose,
  targetRole,
  recipientRole,
  targetName,
  recipientName,
  orderId,
  targetPhone,
  rawPhoneNumber,
  userRole = 'user'
}) => {
  const [callState, setCallState] = useState<'idle' | 'dialing' | 'ringing' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCallState('idle');
      setCallDuration(0);
      setIsMuted(false);
      setIsSpeaker(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callState === 'connected') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  if (!isOpen) return null;

  const effectivePhone = rawPhoneNumber || targetPhone || DEFAULT_CUSTOMER_CARE_PHONE;
  const effectiveRole = recipientRole || targetRole || 'support';
  const isSupportCall = effectiveRole === 'support' || effectiveRole === 'customercare' || String(effectiveRole).toLowerCase().includes('care') || String(effectiveRole).toLowerCase().includes('support');
  
  const effectiveName = recipientName || targetName || (isSupportCall ? 'QuickPal Customer Care Desk' : 'Contact');
  const maskedDisplay = isSupportCall
    ? maskCustomerCarePhone(effectivePhone)
    : maskPhoneNumber(effectivePhone, effectiveRole);

  const roleTitle = isSupportCall
    ? 'Official Customer Care Helpline'
    : effectiveRole === 'customer' 
    ? 'Customer' 
    : effectiveRole === 'partner' 
    ? 'Delivery Rider' 
    : 'Store Operations';

  const startSecureCall = () => {
    setCallState('dialing');
    
    // Simulate VoIP Gateway connection sequence
    setTimeout(() => {
      setCallState('ringing');
    }, 1200);

    setTimeout(() => {
      setCallState('connected');
    }, 3000);
  };

  const endSecureCall = () => {
    setCallState('ended');
    setTimeout(() => {
      onClose();
      setCallState('idle');
      setCallDuration(0);
    }, 1200);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-700/80 overflow-hidden relative p-6 space-y-5">
        
        {/* Close button if idle */}
        {callState === 'idle' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Privacy Header Badge */}
        <div className="flex items-center justify-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 py-1.5 px-3 rounded-full text-[11px] font-bold mx-auto w-fit">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>QuickPal 100% Number Masking Active</span>
        </div>

        {/* Target Profile Card */}
        <div className="text-center space-y-2">
          <div className="relative inline-block">
            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-black shadow-lg transition-all ${
              callState === 'connected'
                ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-400/40 animate-pulse'
                : callState === 'ringing' || callState === 'dialing'
                ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-400/40 animate-bounce'
                : isSupportCall
                ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white ring-2 ring-orange-400/30'
                : 'bg-gradient-to-br from-orange-500 to-amber-600 text-white'
            }`}>
              {isSupportCall && callState === 'idle' ? (
                <Headphones className="w-9 h-9" />
              ) : callState === 'connected' ? (
                <PhoneCall className="w-9 h-9" />
              ) : (
                <Phone className="w-9 h-9" />
              )}
            </div>
            {callState === 'connected' && (
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-400 border-2 border-slate-900 rounded-full flex items-center justify-center">
                <Radio className="w-3 h-3 text-slate-900 animate-spin" />
              </span>
            )}
          </div>

          <div>
            <h3 className="text-lg font-black text-white">{effectiveName}</h3>
            <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">
              {roleTitle} {orderId ? `• Order #${orderId}` : ''}
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-2xl inline-flex items-center gap-2 text-xs font-mono text-slate-300 max-w-full truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span className="truncate">Virtual Line: {maskedDisplay}</span>
          </div>
        </div>

        {/* Call State Feedback */}
        <div className="text-center py-2 min-h-[44px]">
          {callState === 'idle' && (
            <p className="text-xs text-slate-400 font-medium">
              {isSupportCall
                ? 'Your personal number is 100% private. The customer care agent will only see an encrypted proxy ID.'
                : `Neither you nor the ${roleTitle.toLowerCase()} will see real phone numbers. Your privacy is 100% protected.`}
            </p>
          )}

          {callState === 'dialing' && (
            <div className="space-y-1">
              <span className="text-sm font-black text-amber-400 animate-pulse block">
                Establishing Encrypted Voice Tunnel...
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Routing via Saphale Express IVR Node</span>
            </div>
          )}

          {callState === 'ringing' && (
            <div className="space-y-1">
              <span className="text-sm font-black text-amber-300 animate-pulse block">
                {isSupportCall ? 'Connecting to Customer Care Desk...' : 'Ringing Protected Device...'}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Masked Identity Confirmed</span>
            </div>
          )}

          {callState === 'connected' && (
            <div className="space-y-1">
              <span className="text-lg font-black text-emerald-400 font-mono">
                {formatTimer(callDuration)}
              </span>
              <p className="text-[11px] text-emerald-300 font-semibold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Call Active (Private VoIP Channel)
              </p>
            </div>
          )}

          {callState === 'ended' && (
            <span className="text-sm font-black text-rose-400 block">
              Call Ended
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          {callState === 'idle' && (
            <div className="space-y-2">
              <button
                onClick={startSecureCall}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <PhoneCall className="w-5 h-5" /> Start Private Helpline Call
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {(callState === 'dialing' || callState === 'ringing') && (
            <button
              onClick={endSecureCall}
              className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <PhoneOff className="w-4 h-4" /> Cancel Call
            </button>
          )}

          {callState === 'connected' && (
            <div className="space-y-3">
              {/* Call Utilities */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3.5 rounded-2xl text-xs font-bold transition-all ${
                    isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setIsSpeaker(!isSpeaker)}
                  className={`p-3.5 rounded-2xl text-xs font-bold transition-all ${
                    isSpeaker ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title={isSpeaker ? 'Speaker On' : 'Speaker Off'}
                >
                  {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>

              {/* End Call Button */}
              <button
                onClick={endSecureCall}
                className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <PhoneOff className="w-5 h-5" /> End Call
              </button>
            </div>
          )}
        </div>

        {/* Privacy Note Footer */}
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>QuickPal 256-bit VoIP Bridge • Privacy Guaranteed</span>
        </div>
      </div>
    </div>
  );
};
