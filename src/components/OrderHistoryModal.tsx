import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Clock, RefreshCw, AlertTriangle, ShieldCheck, CheckCircle2, KeyRound, Upload, Image as ImageIcon, Printer } from 'lucide-react';
import { printOrderReceipt } from '../utils/printReceipt';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  onTrackOrder,
}) => {
  const { orders, addToCart, reverifyOrderPayment } = useApp();
  const [resubmitOrderId, setResubmitOrderId] = useState<string | null>(null);
  const [newUtr, setNewUtr] = useState('');
  const [newAmount, setNewAmount] = useState<number | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [resubmitMsg, setResubmitMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleScreenshotFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReverifySubmit = (orderId: string, orderTotal: number) => {
    setResubmitMsg(null);
    if (!newUtr.trim()) {
      setResubmitMsg({ type: 'error', text: 'Please enter a 12-digit UPI UTR number.' });
      return;
    }

    const res = reverifyOrderPayment(orderId, newUtr.trim(), newAmount !== null ? newAmount : orderTotal, screenshotUrl || undefined);
    if (res.success) {
      setResubmitMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        setResubmitOrderId(null);
        setNewUtr('');
        setNewAmount(null);
        setScreenshotUrl(null);
        setResubmitMsg(null);
      }, 2000);
    } else {
      setResubmitMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-auto max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-orange-500 dark:bg-orange-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-200" />
            <h3 className="text-base font-black">My Order History ({orders.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-orange-100 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              No orders placed yet.
            </div>
          ) : (
            orders.map(ord => (
              <div
                key={ord.id}
                className={`p-4 rounded-2xl border ${
                  ord.paymentStatus === 'failed'
                    ? 'border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20'
                    : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50'
                } space-y-2.5 text-xs`}
              >
                <div className="flex items-center justify-between font-black pb-2 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <span className="text-orange-700 dark:text-orange-400">
                      Order #{ord.id}
                    </span>
                    <p className="text-[10px] text-gray-400 font-normal">
                      {new Date(ord.createdAt).toLocaleDateString()} at{' '}
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-100 text-orange-800 text-[10px] uppercase font-black px-2 py-0.5 rounded">
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Failed Payment Warning Banner */}
                {ord.paymentStatus === 'failed' && (
                  <div className="p-3 bg-rose-100/90 dark:bg-rose-900/40 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-black">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        Payment Verification Failed / Kept on Hold
                      </span>
                      <button
                        onClick={() => {
                          setResubmitOrderId(resubmitOrderId === ord.id ? null : ord.id);
                          setNewUtr('');
                          setNewAmount(ord.total);
                          setResubmitMsg(null);
                        }}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] uppercase font-black px-2.5 py-1 rounded-lg transition-all"
                      >
                        {resubmitOrderId === ord.id ? 'Close' : 'Resubmit Valid UTR'}
                      </button>
                    </div>
                    {ord.paymentFailureReason && (
                      <p className="text-[11px] font-medium leading-relaxed">
                        <strong>Reason:</strong> {ord.paymentFailureReason}
                      </p>
                    )}
                  </div>
                )}

                {/* Inline Re-Submit UTR Form */}
                {resubmitOrderId === ord.id && (
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-orange-300 dark:border-orange-700 space-y-2.5 shadow-sm">
                    <h5 className="font-black text-xs text-orange-700 dark:text-orange-300 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5" /> Enter Genuine 12-Digit UPI UTR
                    </h5>

                    {resubmitMsg && (
                      <div className={`p-2 rounded-lg text-[11px] font-bold ${resubmitMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {resubmitMsg.text}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 block mb-0.5">12-Digit UTR</label>
                        <input
                          type="text"
                          placeholder="e.g. 423891827364"
                          value={newUtr}
                          onChange={e => setNewUtr(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 block mb-0.5">Paid Amount (₹)</label>
                        <input
                          type="number"
                          value={newAmount !== null ? newAmount : ord.total}
                          onChange={e => setNewAmount(Number(e.target.value))}
                          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-orange-600"
                        />
                      </div>
                    </div>

                    {/* Screenshot upload */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 block mb-0.5">
                        📸 Optional: Payment Screenshot Proof
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotFile}
                        className="text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-orange-100 file:text-orange-800 hover:file:bg-orange-200"
                      />
                      {screenshotUrl && (
                        <div className="mt-1 flex items-center gap-2">
                          <img src={screenshotUrl} alt="Preview" className="w-12 h-12 object-cover rounded border border-gray-300" />
                          <span className="text-[10px] text-emerald-600 font-bold">Screenshot Attached</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleReverifySubmit(ord.id, ord.total)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-1.5 rounded-lg text-xs shadow-sm transition-all"
                    >
                      Verify & Re-Submit Payment
                    </button>
                  </div>
                )}

                <div className="space-y-1">
                  {ord.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-[11px]">
                      <span>
                        {item.product.imageEmoji} {item.product.name} x {item.quantity}
                      </span>
                      <span className="font-bold">₹{item.product.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <span className="font-black text-sm text-gray-900 dark:text-gray-100 block">
                      Total: ₹{ord.total} ({ord.paymentMethod.toUpperCase()})
                    </span>
                    <span className={`text-[10px] font-bold ${
                      ord.paymentStatus === 'paid'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : ord.paymentStatus === 'failed'
                        ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                        : 'text-amber-600'
                    }`}>
                      {ord.paymentStatus === 'paid' && '✅ Payment Verified'}
                      {ord.paymentStatus === 'failed' && '❌ Payment Failed / Rejected'}
                      {ord.paymentStatus === 'pending' && '⏳ Cash on Delivery (Pending)'}
                      {ord.paymentStatus === 'under_review' && '🔍 Under Admin Audit'}
                      {ord.paymentTransactionId && ` (Ref: ${ord.paymentTransactionId})`}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {/* Print Receipt Button */}
                    <button
                      onClick={() => printOrderReceipt(ord)}
                      className="px-2.5 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 text-xs flex items-center gap-1 transition-all"
                      title="Print Receipt"
                    >
                      <Printer className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" /> Print Receipt
                    </button>

                    {/* Re-order items button */}
                    <button
                      onClick={() => {
                        ord.items.forEach(i => addToCart(i.product, i.quantity));
                        alert('Items re-added to your cart!');
                      }}
                      className="px-2.5 py-1.5 rounded-xl border border-orange-500 text-orange-700 dark:text-orange-300 font-bold hover:bg-orange-50 dark:hover:bg-orange-950/40 text-xs flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Reorder
                    </button>

                    {/* Live Track Button */}
                    <button
                      onClick={() => {
                        onClose();
                        onTrackOrder(ord.id);
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm"
                    >
                      Track Live
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
