import React, { useState } from 'react';
import {
  Mail,
  X,
  Copy,
  Check,
  ExternalLink,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEFAULT_CUSTOMER_CARE_EMAIL } from '../utils/phonePrivacy';

interface EmailSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
  defaultOrderId?: string;
}

export const EmailSupportModal: React.FC<EmailSupportModalProps> = ({
  isOpen,
  onClose,
  defaultSubject = '',
  defaultOrderId = ''
}) => {
  const { currentUser, submitSupportTicket, paymentSettings } = useApp();

  const supportEmail = paymentSettings?.customerCareEmail || DEFAULT_CUSTOMER_CARE_EMAIL;

  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState(defaultSubject || 'QuickPal Order & Customer Support');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState(currentUser?.name || '');
  const [senderEmail, setSenderEmail] = useState(currentUser?.email || '');
  const [senderPhone, setSenderPhone] = useState(currentUser?.phone || '');
  const [orderId, setOrderId] = useState(defaultOrderId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(supportEmail);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback copy
      const textarea = document.createElement('textarea');
      textarea.value = supportEmail;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const encodedSubject = encodeURIComponent(subject || 'QuickPal Customer Support');
  const emailBodyText = `Hello QuickPal Support Team,

Name: ${senderName || 'Customer'}
Phone: ${senderPhone || 'N/A'}
Order ID: ${orderId || 'N/A'}

Message:
${message || 'I would like assistance with my QuickPal order.'}
`;
  const encodedBody = encodeURIComponent(emailBodyText);

  const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(supportEmail)}&su=${encodedSubject}&body=${encodedBody}`;
  const outlookWebUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(supportEmail)}&subject=${encodedSubject}&body=${encodedBody}`;
  const yahooWebUrl = `https://compose.mail.yahoo.com/?to=${encodeURIComponent(supportEmail)}&subj=${encodedSubject}&body=${encodedBody}`;
  const mailtoUrl = `mailto:${supportEmail}?subject=${encodedSubject}&body=${encodedBody}`;

  const handleSubmitInApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Please enter your support message.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const ticket = await submitSupportTicket({
        customerName: senderName || 'Customer',
        customerEmail: senderEmail || supportEmail,
        customerPhone: senderPhone || '',
        subject: subject || 'Customer Support Request',
        message: message.trim(),
        orderId: orderId.trim() || undefined
      });

      setSubmittedTicketId(ticket.id);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit email message. Please try opening Gmail or copying our address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedTicketId(null);
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 p-5 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight leading-tight">
                QuickPal Email Support
              </h3>
              <p className="text-xs text-orange-100 font-medium">
                Official 24/7 Desk: <span className="font-mono font-bold text-yellow-200">{supportEmail}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors relative z-10"
            aria-label="Close Email Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {submittedTicketId ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-4 border-emerald-500/20 shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-gray-900 dark:text-gray-100">
                  Support Email Dispatched!
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
                  Your message has been logged under Ticket Reference ID:
                </p>
                <p className="font-mono text-sm font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 py-1 px-3 rounded-lg inline-block border border-orange-200 dark:border-orange-800">
                  #{submittedTicketId}
                </p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-2xl text-left text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  Guaranteed Support SLA
                </p>
                <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300">
                  Our customer service team monitors <span className="font-mono font-bold">{supportEmail}</span> 24/7. You will receive an update within 15 minutes.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-black py-3 rounded-xl shadow-md transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Instant Webmail Launchers (Works 100% even if default mail app is not configured) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider flex items-center justify-between">
                  <span>1-Click Launch Webmail or App</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold normal-case text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Guaranteed to open
                  </span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* Gmail Web */}
                  <a
                    href={gmailWebUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-2xs hover:scale-102"
                  >
                    <Mail className="w-4 h-4 text-red-600" />
                    <span>Gmail Web</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>

                  {/* Outlook Web */}
                  <a
                    href={outlookWebUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-2xs hover:scale-102"
                  >
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>Outlook Web</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>

                  {/* Default App / Mailto */}
                  <a
                    href={mailtoUrl}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-2xs hover:scale-102 col-span-2 sm:col-span-1"
                  >
                    <Mail className="w-4 h-4 text-gray-600" />
                    <span>Mail App</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </div>
              </div>

              {/* Copy Email Address Pill */}
              <div className="bg-gray-50 dark:bg-gray-800/80 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-wider block">
                    Support Email Address
                  </span>
                  <span className="font-mono text-xs font-bold text-gray-900 dark:text-gray-100 truncate block">
                    {supportEmail}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                    copied
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 shadow-2xs'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Email'}
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-200 dark:border-gray-800 w-full"></div>
                <span className="bg-white dark:bg-gray-900 px-3 text-[10px] uppercase font-black text-gray-400 tracking-wider shrink-0">
                  Or Send Directly In-App
                </span>
                <div className="border-t border-gray-200 dark:border-gray-800 w-full"></div>
              </div>

              {/* Form to submit direct message / ticket */}
              <form onSubmit={handleSubmitInApp} className="space-y-3">
                {errorMsg && (
                  <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 p-2.5 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-gray-100 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 block mb-1">
                      Your Email / Phone
                    </label>
                    <input
                      type="text"
                      value={senderEmail || senderPhone}
                      onChange={e => {
                        const val = e.target.value;
                        if (val.includes('@')) {
                          setSenderEmail(val);
                        } else {
                          setSenderPhone(val);
                        }
                      }}
                      placeholder="e.g. rahul@example.com or phone"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-gray-100 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 block mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="e.g. Delayed Order / Item Missing"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-gray-100 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 block mb-1">
                      Order ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={e => setOrderId(e.target.value)}
                      placeholder="e.g. ord-1234"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-gray-100 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 block mb-1">
                    Your Message / Complaint *
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Describe how we can assist you with your grocery delivery in Saphale..."
                    required
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs text-gray-900 dark:text-gray-100 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>

                <div className="pt-1 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all transform active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? 'Sending...' : 'Send Message to Support'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
