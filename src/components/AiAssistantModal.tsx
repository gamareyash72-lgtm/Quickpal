import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import {
  Bot,
  X,
  Send,
  Sparkles,
  ShoppingBag,
  Clock,
  Plus,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Truck,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Copy,
  Zap,
  CornerDownRight,
  MessageSquare
} from 'lucide-react';
import { triggerSparkleBlast } from './SparkleBlast';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrders?: () => void;
  onOpenFaqDashboard?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedProducts?: Product[];
  isAiPowered?: boolean;
  liked?: boolean;
  disliked?: boolean;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onOpenOrders,
  onOpenFaqDashboard
}) => {
  const { products, orders, selectedAddress, addToCart, cartItems } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: "👋 Hello! I'm your QuickPal AI Customer Support Assistant.\n\nHow can I help you today? Ask me anything about:\n• ⚡ 30-minute delivery in Saphale (PIN 401102)\n• 💳 Google Pay instant UPI & Cash on Delivery\n• 📦 Live order tracking & Doorstep Delivery OTP\n• 🥦 Fresh milk, vegetables, bakery & daily essentials\n• 🛡️ Instant refunds & quality replacements",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAiPowered: true
    }
  ]);

  const activeOrder = orders.find(
    o => o.status !== 'delivered' && o.status !== 'cancelled'
  );

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    { label: '⚡ Google Pay UPI Flow', query: 'How does Google Pay UPI payment work on QuickPal?' },
    { label: '📦 Live Order Status', query: 'Where is my order and what is my delivery OTP?' },
    { label: '🛵 30-Min Delivery in Saphale', query: 'What are your delivery areas, timings, and fees in Saphale?' },
    { label: '🥛 Daily Milk & Bread', query: 'Recommend fresh Amul milk, curd, and bakery bread' },
    { label: '💰 Free Delivery & Coupons', query: 'How do I get free delivery and apply discount coupons?' },
    { label: '🛡️ Quality & Refund Policy', query: 'What is your refund and return policy for damaged items?' },
    { label: '💬 मराठी / हिंदी सहायता', query: 'सफाळे मध्ये डिलिव्हरी किती वेळात मिळेल आणि पेमेंट कसे करावे?' },
    { label: '✉️ Support Email & Phone', query: 'What is QuickPal customer support email and WhatsApp number?' },
  ];

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (msgId: string, type: 'like' | 'dislike') => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id === msgId) {
          return {
            ...m,
            liked: type === 'like' ? !m.liked : false,
            disliked: type === 'dislike' ? !m.disliked : false
          };
        }
        return m;
      })
    );
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-welcome-' + Date.now(),
        sender: 'assistant',
        text: "👋 Chat reset! I'm ready to answer any questions about QuickPal 30-minute delivery, Google Pay UPI, fresh products, or order status.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAiPowered: true
      }
    ]);
  };

  const handleSendMessage = async (customQuery?: string) => {
    const textToSend = customQuery || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customQuery) setInputMessage('');
    setLoading(true);

    try {
      // Find relevant products from catalog to attach
      const queryLower = textToSend.toLowerCase();
      const matchedProds = products.filter(p => {
        if (p.isHidden || p.isOutOfStock) return false;
        const pName = p.name.toLowerCase();
        if (queryLower.includes('milk') && pName.includes('milk')) return true;
        if (queryLower.includes('bread') && pName.includes('bread')) return true;
        if (queryLower.includes('egg') && pName.includes('egg')) return true;
        if (queryLower.includes('butter') && pName.includes('butter')) return true;
        if ((queryLower.includes('snack') || queryLower.includes('chips')) && (p.category === 'cat-snacks' || pName.includes('chip') || pName.includes('kurkure'))) return true;
        if ((queryLower.includes('fruit') || queryLower.includes('apple') || queryLower.includes('banana')) && (p.category === 'cat-fruits' || pName.includes('apple') || pName.includes('banana'))) return true;
        if ((queryLower.includes('vegetable') || queryLower.includes('onion') || queryLower.includes('potato')) && (p.category === 'cat-veggies' || pName.includes('onion') || pName.includes('potato'))) return true;
        return false;
      }).slice(0, 3);

      const compactCatalog = products.slice(0, 30).map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        category: p.category,
        stock: p.stock,
        deliveryTimeMins: p.deliveryTimeMins,
        description: p.description?.slice(0, 100) || ''
      }));

      const compactOrders = orders
        .filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
        .slice(0, 5)
        .map(o => ({
          id: o.id,
          status: o.status,
          total: o.total,
          itemCount: o.items?.length || 0,
          area: o.address?.area || '',
          deliveryTimeMins: o.deliveryTimeMins,
          deliveryOtp: o.deliveryOtp
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          catalog: compactCatalog,
          activeOrders: compactOrders,
          userAddress: selectedAddress ? {
            label: selectedAddress.label,
            area: selectedAddress.area,
            city: selectedAddress.city,
            pincode: selectedAddress.pincode
          } : undefined
        })
      });

      let data: any = {};
      if (response.ok) {
        try {
          data = await response.json();
        } catch {
          data = {};
        }
      }

      const assistantMsg: ChatMessage = {
        id: 'ast-' + Date.now(),
        sender: 'assistant',
        text: data.reply || "I'm here to assist you with QuickPal express delivery in Saphale! What else can I help with?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedProducts: matchedProds.length > 0 ? matchedProds : undefined,
        isAiPowered: data.isAiPowered
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('AI chat request failed:', err);
      setMessages(prev => [
        ...prev,
        {
          id: 'ast-' + Date.now(),
          sender: 'assistant',
          text: "QuickPal express delivery takes 30 minutes in Saphale (PIN 401102)! Orders above ₹199 get FREE delivery. Google Pay automatically opens with your exact total. Email us anytime at quickpal.in@outlook.com!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-end sm:items-center justify-end sm:justify-center p-0 sm:p-4">
      {/* 20% Black, 40% Orange, 40% White Color Palette Modal Shell */}
      <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-lg h-[92vh] sm:h-[690px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header (20% Black / Obsidian with 40% Orange Brand Accent) */}
        <div className="bg-[#121212] text-white p-4 flex items-center justify-between shrink-0 shadow-lg border-b border-orange-500/30 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#FF6A00]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6A00] text-white flex items-center justify-center font-black text-lg shadow-lg shadow-orange-500/40 border border-orange-300/40 animate-sparkle">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                  QuickPal AI Assistant
                </h3>
                <span className="bg-[#FF6A00] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                  24/7 LIVE
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 font-medium">
                Gemini 3.8 Flash • Saphale Store Support
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 relative z-10">
            <button
              onClick={handleClearChat}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors text-xs font-bold flex items-center gap-1"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Order Banner (High Contrast Dark-Orange Strip) */}
        {activeOrder && (
          <div
            onClick={() => {
              if (onOpenOrders) {
                onClose();
                onOpenOrders();
              }
            }}
            className="bg-[#18181b] border-b border-orange-500/40 px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6A00] animate-ping" />
              <span className="text-xs font-bold text-zinc-200">
                Live Order #{activeOrder.id}: <span className="uppercase font-black text-[#FF6A00]">{activeOrder.status.replace(/_/g, ' ')}</span>
              </span>
            </div>
            <span className="text-[10px] text-orange-400 font-black flex items-center gap-1">
              Track Order <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        )}

        {/* Message Stream (40% Crisp White Background Canvas) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-zinc-950">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-4 shadow-sm text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                  msg.sender === 'user'
                    ? 'bg-[#FF6A00] text-white rounded-tr-xs font-medium shadow-orange-500/20'
                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-tl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-black/5 dark:border-white/10 pb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 opacity-90">
                    {msg.sender === 'assistant' ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" /> QuickPal AI Agent
                      </>
                    ) : (
                      'You'
                    )}
                  </span>
                  <span className="text-[9px] opacity-70 font-mono">{msg.timestamp}</span>
                </div>

                <p className="whitespace-pre-line font-medium leading-relaxed">{msg.text}</p>

                {/* Embedded Recommended Products Cards */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="pt-2 space-y-2 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] font-black uppercase text-[#FF6A00] block tracking-wide">
                      🛒 Add to QuickPal Cart (30-Min Delivery):
                    </span>
                    <div className="space-y-1.5">
                      {msg.recommendedProducts.map(prod => {
                        const inCart = cartItems.find(item => item.product.id === prod.id);
                        return (
                          <div
                            key={prod.id}
                            className="bg-white dark:bg-zinc-800 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-2 shadow-2xs hover:border-orange-400 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <span className="text-xl shrink-0">{prod.imageEmoji || '📦'}</span>
                              <div className="truncate">
                                <p className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate">
                                  {prod.name}
                                </p>
                                <p className="text-[11px] text-zinc-500 font-extrabold flex items-center gap-1.5">
                                  <span className="text-[#FF6A00]">₹{prod.price}</span>
                                  <span>•</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">⏱️ {prod.deliveryTimeMins} mins</span>
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                addToCart(prod);
                                triggerSparkleBlast({ originX: 0.5, originY: 0.6 });
                              }}
                              className="bg-[#FF6A00] hover:bg-[#e05e00] text-white text-[11px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0 shadow-sm transition-transform active:scale-95"
                            >
                              {inCart ? (
                                <>
                                  <Check className="w-3.5 h-3.5" /> Added ({inCart.quantity})
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" /> Add ₹{prod.price}
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Assistant Message Actions (Copy & Helpful Feedback) */}
                {msg.sender === 'assistant' && (
                  <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5 text-[10px] text-zinc-400 font-bold">
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedId === msg.id ? 'Copied!' : 'Copy'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleFeedback(msg.id, 'like')}
                        className={`hover:text-emerald-600 transition-colors ${msg.liked ? 'text-emerald-600 font-black' : ''}`}
                        title="Helpful"
                      >
                        <ThumbsUp className="w-3 h-3 inline mr-0.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFeedback(msg.id, 'dislike')}
                        className={`hover:text-rose-600 transition-colors ${msg.disliked ? 'text-rose-600 font-black' : ''}`}
                        title="Not helpful"
                      >
                        <ThumbsDown className="w-3 h-3 inline mr-0.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 text-xs text-zinc-500 font-extrabold bg-zinc-50 dark:bg-zinc-900 p-3.5 rounded-2xl w-fit border border-zinc-200 dark:border-zinc-800 animate-pulse">
              <Bot className="w-4 h-4 text-[#FF6A00] animate-spin" />
              QuickPal AI is checking store records and typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips (20% Black / 40% Orange Accents) */}
        <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-800 overflow-x-auto shrink-0 scrollbar-none">
          <div className="flex items-center gap-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(p.query)}
                className="text-[11px] font-black bg-white dark:bg-zinc-800 hover:bg-orange-50 hover:text-[#FF6A00] dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 whitespace-nowrap transition-all shadow-2xs hover:border-orange-400"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar (40% Crisp White Background Canvas with 40% Orange CTA) */}
        <div className="p-3.5 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shrink-0 space-y-2">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Ask anything about groceries, orders, Google Pay..."
              className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl py-3 px-4 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6A00] border border-transparent focus:border-orange-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="bg-[#FF6A00] hover:bg-[#e05e00] disabled:opacity-40 text-white p-3 rounded-2xl transition-all shadow-lg shadow-orange-500/30 shrink-0 font-black"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Bottom Bar: FAQ Link + Celebrate Sparkles Button */}
          <div className="flex items-center justify-between pt-1 px-1">
            <button
              type="button"
              onClick={() => {
                if (onOpenFaqDashboard) {
                  onClose();
                  onOpenFaqDashboard();
                }
              }}
              className="text-[11px] text-[#FF6A00] font-black hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Open FAQ Knowledge Base
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
