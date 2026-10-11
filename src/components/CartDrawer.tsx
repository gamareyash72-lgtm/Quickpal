import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Clock,
  Sparkles,
  Tag
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const {
    cartItems,
    cartSubtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    appliedCoupon,
    removeCoupon
  } = useApp();

  if (!isOpen) return null;

  const deliveryFee = cartSubtotal > 299 ? 0 : 15;
  const handlingFee = 4;
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountAmount) {
      discount = appliedCoupon.discountAmount;
    } else if (appliedCoupon.discountPercent) {
      discount = Math.round((cartSubtotal * appliedCoupon.discountPercent) / 100);
    }
  }
  const total = Math.max(0, cartSubtotal + deliveryFee + handlingFee - discount);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-gray-100 dark:border-gray-800">
        {/* Drawer Header */}
        <div className="bg-orange-500 dark:bg-orange-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-amber-200" />
            <h3 className="text-base font-black">My Shopping Cart ({cartItems.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-orange-100 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Express Delivery Banner */}
        <div className="bg-amber-400 text-orange-950 px-4 py-2 text-xs font-black flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 fill-orange-950" /> Express 30 Mins Delivery
          </span>
          <span className="bg-orange-950 text-amber-300 px-2 py-0.5 rounded text-[10px] uppercase">
            Dark Store #1
          </span>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="text-5xl">🛒</div>
              <h4 className="text-sm font-black text-gray-700 dark:text-gray-300">
                Your cart is empty!
              </h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Explore fresh groceries, milk, vegetables and snacks delivered within 30 minutes.
              </p>
              <button
                onClick={onClose}
                className="bg-orange-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-400">Items in Cart</span>
                <button
                  onClick={clearCart}
                  className="text-xs font-bold text-rose-500 hover:underline"
                >
                  Clear All
                </button>
              </div>

              {cartItems
                .filter(item => item && item.product && item.product.id)
                .map(item => {
                  const itemPrice = Number(item.product.price) || 0;
                  const itemQty = Number(item.quantity) || 1;
                  const mainImg = item.product.image || (Array.isArray(item.product.images) && item.product.images[0]);

                  return (
                    <div
                      key={item.product.id}
                      className="p-3 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-700 p-1 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600 shrink-0">
                          {mainImg ? (
                            <img
                              src={mainImg}
                              alt={item.product.name || 'Product'}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-2xl">{item.product.imageEmoji || '📦'}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold line-clamp-1 truncate">{item.product.name || 'Product'}</h5>
                          <span className="text-[10px] text-gray-400 block">{item.product.weightUnit || '1 unit'}</span>
                          <p className="text-xs font-black text-orange-600 dark:text-orange-400 mt-0.5">
                            ₹{itemPrice * itemQty}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-1 shadow-sm shrink-0">
                        <button
                          onClick={() => updateQuantity(item.product.id, itemQty - 1)}
                          className="p-1 text-gray-600 dark:text-gray-300 hover:text-orange-600"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-black">{itemQty}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, itemQty + 1)}
                          className="p-1 text-gray-600 dark:text-gray-300 hover:text-orange-600"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </>
          )}
        </div>

        {/* Drawer Footer Bill Summary */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700 space-y-3 shrink-0">
            {appliedCoupon && (
              <div className="bg-amber-100 dark:bg-amber-950 p-2 rounded-xl flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                <span>Coupon Applied: {appliedCoupon.code}</span>
                <button onClick={removeCoupon} className="text-rose-600 text-[10px]">
                  Remove
                </button>
              </div>
            )}

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Charge</span>
                <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-orange-600 font-bold">
                  <span>Promo Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-gray-900 dark:text-gray-100 pt-1 border-t border-gray-200 dark:border-gray-700">
                <span>Total Amount</span>
                <span className="text-orange-600 dark:text-orange-400">₹{total}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30 transition-all transform active:scale-95"
            >
              Proceed to Pay ₹{total} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
