import React from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';
import { printOrderReceipt } from '../utils/printReceipt';
import {
  X,
  Bike,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  ShieldCheck,
  Zap,
  Navigation,
  Printer
} from 'lucide-react';

interface LiveOrderTrackingModalProps {
  orderId: string | null;
  onClose: () => void;
}

export const LiveOrderTrackingModal: React.FC<LiveOrderTrackingModalProps> = ({
  orderId,
  onClose,
}) => {
  const { orders, partners } = useApp();

  if (!orderId) return null;

  const order = orders.find(o => o.id === orderId);
  if (!order) return null;

  const partner = partners.find(p => p.id === order.deliveryPartnerId);

  const steps: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'placed', label: 'Order Confirmed', desc: 'Received at dark store' },
    { status: 'accepted', label: 'Partner Assigned', desc: partner ? `${partner.name} accepted order` : 'Finding nearby rider...' },
    { status: 'picked_up', label: 'Items Packed & Picked Up', desc: 'Quality checked at warehouse' },
    { status: 'out_for_delivery', label: 'Out for Express Delivery', desc: 'Rider is on the way to your door' },
    { status: 'delivered', label: 'Order Delivered', desc: 'Handed over at doorstep' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'placed': return 0;
      case 'accepted': return 1;
      case 'picked_up': return 2;
      case 'out_for_delivery': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-lg shadow-md">
              <Zap className="w-6 h-6 fill-emerald-950" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                Live Order Tracker
              </span>
              <h3 className="text-base sm:text-lg font-black leading-tight">
                Order #{order.id}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-emerald-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* ETA Card */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800 rounded-3xl p-5 text-center relative overflow-hidden">
            <div className="relative z-10 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                Estimated Express Arrival
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-emerald-900 dark:text-emerald-100 tracking-tight">
                {order.status === 'delivered' ? 'DELIVERED 🎉' : `Arriving in ${order.deliveryTimeMins} Mins`}
              </h2>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                Delivering to {order.address.label}: {order.address.addressLine}
              </p>
            </div>
          </div>

          {/* Delivery Rider Card */}
          {partner && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-xl shadow">
                  <Bike className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-gray-900 dark:text-gray-100">
                      {partner.name}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                      ★ {partner.rating}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Vehicle: {partner.vehicleType} ({partner.vehicleNumber})
                  </p>
                </div>
              </div>

              <a
                href={`tel:${partner.phone}`}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow"
              >
                <Phone className="w-3.5 h-3.5" /> Call Rider
              </a>
            </div>
          )}

          {/* Progress Timeline */}
          <div className="space-y-4 px-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Delivery Progress
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800">
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.status} className="relative flex items-start gap-3.5">
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black z-10 transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-400'
                      }`}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>

                    <div className="flex-1">
                      <h5
                        className={`text-xs font-black ${
                          isCurrent
                            ? 'text-emerald-700 dark:text-emerald-400 text-sm'
                            : isCompleted
                            ? 'text-gray-800 dark:text-gray-200'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </h5>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ordered Items Summary */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
            <span className="font-black uppercase text-gray-500 block pb-1 border-b border-gray-200 dark:border-gray-700">
              Ordered Items ({order.items.length})
            </span>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center font-medium">
                <span>
                  {item.product.imageEmoji} {item.product.name} x {item.quantity}
                </span>
                <span className="font-bold">₹{item.product.price * item.quantity}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center font-black text-sm text-emerald-700 dark:text-emerald-400">
              <span>Paid Total ({order.paymentMethod.toUpperCase()})</span>
              <span>₹{order.total}</span>
            </div>

            <button
              onClick={() => printOrderReceipt(order)}
              className="w-full mt-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4 text-orange-600 dark:text-orange-400" /> Print Official Order Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
