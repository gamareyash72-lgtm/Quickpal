import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FAQItem } from '../types';
import {
  HelpCircle,
  Search,
  Sparkles,
  ThumbsUp,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Truck,
  CreditCard,
  ShoppingBag,
  Package,
  ShieldCheck,
  Send,
  CheckCircle2,
  Bot
} from 'lucide-react';

interface FaqDashboardProps {
  onOpenAiAssistant: () => void;
  onOpenOrders?: () => void;
}

export const FaqDashboard: React.FC<FaqDashboardProps> = ({
  onOpenAiAssistant,
  onOpenOrders
}) => {
  const { faqs, voteFAQHelpful, submitSupportTicket, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');
  const [votedIds, setVotedIds] = useState<Record<string, boolean>>({});

  // Ticket Form State
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    message: '',
    phone: currentUser?.phone || '',
    orderId: ''
  });

  const categories = [
    { id: 'all', label: 'All Topics', icon: HelpCircle },
    { id: 'delivery', label: 'Express Delivery & ETA', icon: Truck },
    { id: 'payments', label: 'Payments & Refunds', icon: CreditCard },
    { id: 'orders', label: 'Orders & Tracking', icon: ShoppingBag },
    { id: 'products', label: 'Products & Quality', icon: Package },
    { id: 'account', label: 'Account & Safety', icon: ShieldCheck }
  ];

  const filteredFaqs = faqs.filter(faq => {
    if (selectedCategory !== 'all' && faq.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQ = faq.question.toLowerCase().includes(q);
      const matchA = faq.answer.toLowerCase().includes(q);
      const matchC = faq.category.toLowerCase().includes(q);
      return matchQ || matchA || matchC;
    }
    return true;
  });

  const handleVote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (votedIds[id]) return;
    voteFAQHelpful(id);
    setVotedIds(prev => ({ ...prev, [id]: true }));
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.message) return;
    submitSupportTicket({
      customerName: currentUser ? currentUser.name : 'Guest Customer',
      customerPhone: ticketForm.phone,
      subject: ticketForm.subject,
      message: ticketForm.message,
      orderId: ticketForm.orderId || undefined
    });
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setShowTicketModal(false);
      setTicketForm({ subject: '', message: '', phone: currentUser?.phone || '', orderId: '' });
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 px-4 sm:px-6 pt-4">
      {/* Banner / Hero Header */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="z-10 max-w-xl text-left space-y-2">
          <span className="bg-orange-950/20 text-orange-950 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-orange-950/20 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-200 fill-yellow-200" /> QuickPal Help Center
          </span>
          <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight text-white leading-tight">
            How can we help you today?
          </h2>
          <p className="text-xs sm:text-sm text-orange-100 font-semibold leading-relaxed">
            Find instant answers regarding 30-minute delivery, payment verification, refunds, or ask our 24/7 AI Assistant!
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAiAssistant}
              className="bg-orange-950 text-yellow-300 hover:bg-orange-900 px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg border border-yellow-300/30 transition-transform active:scale-95"
            >
              <Bot className="w-4 h-4 text-yellow-300" />
              Ask AI Support Assistant
            </button>
            <button
              onClick={() => setShowTicketModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 backdrop-blur-md border border-white/30"
            >
              <MessageSquare className="w-4 h-4" />
              Contact Store Support
            </button>
          </div>
        </div>

        {/* Decorative AI Card */}
        <div
          onClick={onOpenAiAssistant}
          className="bg-white/10 dark:bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-left max-w-xs w-full cursor-pointer hover:bg-white/20 transition-all shadow-inner"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-yellow-300 text-orange-950 flex items-center justify-center font-black">
              🤖
            </div>
            <div>
              <p className="text-xs font-black text-white">Instant AI Assistant</p>
              <p className="text-[10px] text-yellow-200 font-bold">Online 24/7 • Real-time status</p>
            </div>
          </div>
          <p className="text-[11px] text-orange-100 italic bg-black/20 p-2 rounded-xl">
            "Ask me to find products, verify order refund status, or check delivery times!"
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search FAQs (e.g., 'delivery fee', 'refund', 'UPI QR', 'minimum order')..."
          className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold border border-gray-200 dark:border-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md scale-102'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-orange-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-orange-500'}`} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Popular Question Pills */}
      <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-2xl border border-orange-200 dark:border-orange-900/50 space-y-2">
        <span className="text-[10px] font-black uppercase text-orange-800 dark:text-orange-300 tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" /> Popular Quick Questions
        </span>
        <div className="flex flex-wrap gap-2">
          {faqs.filter(f => f.isPopular).map(f => (
            <button
              key={f.id}
              onClick={() => {
                setSearchQuery(f.question);
                setExpandedFaqId(f.id);
              }}
              className="text-xs bg-white dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-xl border border-orange-200 dark:border-orange-800 font-bold transition-all shadow-xs"
            >
              {f.question}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Frequently Asked Questions ({filteredFaqs.length})
          </h3>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-orange-600 font-bold hover:underline"
            >
              Clear search
            </button>
          )}
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl text-center border border-gray-200 dark:border-gray-800 space-y-3">
            <HelpCircle className="w-12 h-12 text-orange-400 mx-auto" />
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
              No matching FAQ found for "{searchQuery}"
            </h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              You can ask our AI Customer Assistant directly or send a message to store staff!
            </p>
            <button
              onClick={onOpenAiAssistant}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Ask AI Assistant
            </button>
          </div>
        ) : (
          filteredFaqs.map(faq => {
            const isExpanded = expandedFaqId === faq.id;
            const isVoted = votedIds[faq.id];
            return (
              <div
                key={faq.id}
                className={`bg-white dark:bg-gray-900 rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-orange-400 shadow-md dark:border-orange-500'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                }`}
              >
                <div
                  onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                  className="p-4 cursor-pointer flex items-center justify-between gap-3 select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 flex items-center justify-center shrink-0 font-bold text-xs">
                      ?
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-gray-100">
                        {faq.question}
                      </h4>
                      <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                        {faq.category}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-orange-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-800 space-y-3 bg-gray-50/50 dark:bg-gray-950/50">
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                      {faq.answer}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400">
                          Was this answer helpful?
                        </span>
                        <button
                          onClick={e => handleVote(faq.id, e)}
                          disabled={isVoted}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                            isVoted
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-400'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3 text-orange-500" />
                          {isVoted ? 'Thanks for voting!' : `Helpful (${(faq.helpfulCount || 0) + (isVoted ? 1 : 0)})`}
                        </button>
                      </div>

                      <button
                        onClick={onOpenAiAssistant}
                        className="text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                      >
                        Need more help? Ask AI →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Submit Support Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-500" />
                Contact QuickPal Support Staff
              </h3>
              <button
                onClick={() => setShowTicketModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                ✕
              </button>
            </div>

            {ticketSubmitted ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-100">
                  Ticket Submitted Successfully!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Our store team has received your query and will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                    Your Subject / Issue
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketForm.subject}
                    onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    placeholder="e.g. Need refund status update for milk item"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={ticketForm.phone}
                    onChange={e => setTicketForm({ ...ticketForm, phone: e.target.value })}
                    placeholder="+91 98989 12345"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                    Order ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={ticketForm.orderId}
                    onChange={e => setTicketForm({ ...ticketForm, orderId: e.target.value })}
                    placeholder="e.g. QP-9283"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                    Detailed Message
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={ticketForm.message}
                    onChange={e => setTicketForm({ ...ticketForm, message: e.target.value })}
                    placeholder="Describe what you need help with..."
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTicketModal(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Ticket
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
