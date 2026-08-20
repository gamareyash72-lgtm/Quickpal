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
  HelpCircle,
  Truck,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

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
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onOpenOrders,
  onOpenFaqDashboard
}) => {
  const { products, orders, selectedAddress, addToCart, cartItems, categories } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: "👋 Hi! I'm your QuickPal AI Support Assistant. How can I help you today? Ask me about order status, 30-minute delivery, product recommendations, or refunds!",
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
    { label: '📦 Where is my order?', query: 'What is the status of my live order?' },
    { label: '🥛 Recommend milk & bread', query: 'Recommend daily fresh milk and bread' },
    { label: '💰 Free delivery limit?', query: 'How do I get free express delivery?' },
    { label: '💳 Payment & UPI help', query: 'How does UPI QR code and Cash on Delivery work?' },
    { label: '🥑 Fresh fruits & snacks', query: 'Suggest fresh fruits and snacks under ₹100' },
  ];

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
      // Check for product keyword matching to attach rich product cards
      const queryLower = textToSend.toLowerCase();
      const matchedProds = products.filter(p => {
        if (p.isHidden || p.isOutOfStock) return false;
        if (queryLower.includes('milk') && p.name.toLowerCase().includes('milk')) return true;
        if (queryLower.includes('bread') && p.name.toLowerCase().includes('bread')) return true;
        if (queryLower.includes('snack') || queryLower.includes('chips')) {
          return p.category === 'cat-snacks' || p.name.toLowerCase().includes('chip');
        }
        if (queryLower.includes('fruit') || queryLower.includes('apple')) {
          return p.category === 'cat-fruits' || p.name.toLowerCase().includes('apple');
        }
        return false;
      }).slice(0, 3);

      // Send compact payload to prevent payload size issues
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
          deliveryTimeMins: o.deliveryTimeMins
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
        text: data.reply || "I'm here to assist you with QuickPal express delivery! What else can I help with?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedProducts: matchedProds.length > 0 ? matchedProds : undefined,
        isAiPowered: data.isAiPowered
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('AI chat request failed:', err);
      // Fallback
      setMessages(prev => [
        ...prev,
        {
          id: 'ast-' + Date.now(),
          sender: 'assistant',
          text: "QuickPal express delivery takes 10 to 15 minutes! Orders above ₹199 get FREE delivery. Is there a specific item or order you'd like me to help with?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-end sm:justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-lg h-[90vh] sm:h-[680px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 text-white p-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-950 text-yellow-300 flex items-center justify-center font-black text-lg shadow-md border border-yellow-300/30">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black italic tracking-tight">QuickPal AI Support</h3>
                <span className="bg-yellow-300 text-orange-950 text-[9px] font-black uppercase px-1.5 py-0.2 rounded">
                  24/7 LIVE
                </span>
              </div>
              <p className="text-[11px] text-orange-100 font-medium">
                Instant answers & product recommendations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-orange-700/50 hover:bg-orange-800 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Order Widget inside Chat Header */}
        {activeOrder && (
          <div
            onClick={() => {
              if (onOpenOrders) {
                onClose();
                onOpenOrders();
              }
            }}
            className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Live Order #{activeOrder.id}: <span className="uppercase font-black text-orange-600">{activeOrder.status.replace(/_/g, ' ')}</span>
              </span>
            </div>
            <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1">
              Track <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950/60">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs text-xs sm:text-sm leading-relaxed space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-orange-500 text-white rounded-tr-xs font-medium'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-black/5 dark:border-white/10 pb-1">
                  <span className="text-[10px] font-bold opacity-80 flex items-center gap-1">
                    {msg.sender === 'assistant' ? (
                      <>
                        <Sparkles className="w-3 h-3 text-orange-500" /> QuickPal Assistant
                      </>
                    ) : (
                      'You'
                    )}
                  </span>
                  <span className="text-[9px] opacity-60 font-mono">{msg.timestamp}</span>
                </div>

                <p className="whitespace-pre-line font-medium">{msg.text}</p>

                {/* Embedded Recommended Products Cards */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="pt-2 space-y-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 block">
                      🛒 Recommended Catalog Items:
                    </span>
                    <div className="space-y-1.5">
                      {msg.recommendedProducts.map(prod => {
                        const inCart = cartItems.find(item => item.product.id === prod.id);
                        return (
                          <div
                            key={prod.id}
                            className="bg-orange-50 dark:bg-gray-900 p-2 rounded-xl border border-orange-200 dark:border-gray-700 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-lg shrink-0">{prod.imageEmoji || '📦'}</span>
                              <div className="truncate">
                                <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                                  {prod.name}
                                </p>
                                <p className="text-[10px] text-gray-500 font-bold">
                                  ₹{prod.price} <span className="text-emerald-600 ml-1">⏱️ {prod.deliveryTimeMins} mins</span>
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => addToCart(prod)}
                              className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shrink-0 shadow-xs"
                            >
                              {inCart ? (
                                <>
                                  <Check className="w-3 h-3" /> ({inCart.quantity})
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" /> Add
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-gray-400 font-bold bg-white dark:bg-gray-800 p-3 rounded-2xl w-fit border border-gray-200 dark:border-gray-700 animate-pulse">
              <Bot className="w-4 h-4 text-orange-500 animate-spin" />
              QuickPal AI Assistant is typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions Chips */}
        <div className="p-2.5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 overflow-x-auto shrink-0 scrollbar-none">
          <div className="flex items-center gap-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.query)}
                className="text-[11px] font-bold bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-950/60 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 whitespace-nowrap transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shrink-0">
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
              placeholder="Ask QuickPal AI support anything..."
              className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl py-2.5 px-4 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white p-2.5 rounded-2xl transition-all shadow-md shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Quick FAQ Link */}
          <div className="flex items-center justify-between pt-2 px-1">
            <button
              onClick={() => {
                if (onOpenFaqDashboard) {
                  onClose();
                  onOpenFaqDashboard();
                }
              }}
              className="text-[10px] text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" /> Open FAQ Knowledge Base & Support
            </button>

            <span className="text-[9px] text-gray-400 font-medium">
              Powered by Gemini 3.6 Flash
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
