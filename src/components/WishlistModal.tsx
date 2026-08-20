import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Heart, Plus, Trash2 } from 'lucide-react';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({ isOpen, onClose }) => {
  const { wishlistProductIds, products, toggleWishlist, addToCart } = useApp();

  if (!isOpen) return null;

  const wishlistedProducts = products.filter(p => p && p.id && wishlistProductIds?.includes(p.id));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-auto max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-rose-600 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-white" />
            <h3 className="text-base font-black">Saved Wishlist ({wishlistedProducts.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-rose-100 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {wishlistedProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs space-y-2">
              <div className="text-4xl">❤️</div>
              <p>Your wishlist is currently empty.</p>
            </div>
          ) : (
            wishlistedProducts.map(prod => {
              const mainImg = prod.image || (Array.isArray(prod.images) && prod.images[0]);
              const priceVal = Number(prod.price) || 0;

              return (
                <div
                  key={prod.id}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-between gap-3 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-700 p-1 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600 shrink-0">
                      {mainImg ? (
                        <img
                          src={mainImg}
                          alt={prod.name || 'Product'}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-2xl">{prod.imageEmoji || '📦'}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold truncate">{prod.name || 'Product'}</h5>
                      <span className="text-[10px] text-gray-400 block">{prod.weightUnit || '1 unit'}</span>
                      <p className="text-xs font-black text-orange-600 dark:text-orange-400 mt-0.5">
                        ₹{priceVal}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        addToCart(prod);
                        toggleWishlist(prod.id);
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>

                    <button
                      onClick={() => toggleWishlist(prod.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
