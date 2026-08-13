import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  Plus,
  Minus,
  Star,
  Clock,
  Heart,
  ShieldCheck,
  Truck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ZoomIn
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const { cartItems, addToCart, updateQuantity, wishlistProductIds, toggleWishlist, categories } = useApp();

  if (!product) return null;

  const productImages = product.images && product.images.length > 0
    ? product.images
    : [product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const cartItem = cartItems.find(item => item.product.id === product.id);
  const isWishlisted = wishlistProductIds.includes(product.id);
  const categoryName = categories.find(c => c.id === product.category)?.name || 'Grocery Item';
  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex(prev => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex(prev => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl max-w-3xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-auto max-h-[92vh] flex flex-col md:flex-row relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Real Product Photo Gallery & Viewer */}
        <div className="md:w-1/2 bg-gray-50 dark:bg-gray-950 p-6 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 relative">
          
          {/* Wishlist Button */}
          <button
            onClick={() => toggleWishlist(product.id)}
            className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white dark:bg-gray-800 text-gray-400 hover:text-rose-500 shadow-md transition-all"
            title="Add to Wishlist"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'text-rose-500 fill-rose-500' : ''}`} />
          </button>

          {/* Main High-Res Image Frame */}
          <div className="w-full aspect-square relative flex items-center justify-center rounded-2xl overflow-hidden bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800 shadow-inner group">
            <img
              src={productImages[selectedImageIndex]}
              alt={`${product.name} Photo ${selectedImageIndex + 1}`}
              referrerPolicy="no-referrer"
              className={`max-h-full max-w-full object-contain transition-transform duration-300 ${
                isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in group-hover:scale-105'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            />

            {product.isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="text-xs font-black uppercase tracking-wider text-white bg-rose-600 px-3 py-1 rounded-lg">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Gallery Navigation Arrows if multiple images */}
            {productImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 hover:bg-white shadow-md transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 hover:bg-white shadow-md transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1 font-bold">
              <ZoomIn className="w-3 h-3" /> Tap to Zoom
            </div>
          </div>

          {/* Multiple Angle Gallery Thumbnails */}
          {productImages.length > 1 && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto max-w-full py-1">
              {productImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-14 h-14 rounded-xl border-2 overflow-hidden bg-white dark:bg-gray-900 p-1 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-orange-500 ring-2 ring-orange-500/30 scale-105'
                      : 'border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Purchase Actions */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-4 overflow-y-auto">
          <div className="space-y-3">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                {categoryName}
              </span>
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                <Truck className="w-3 h-3" /> {product.deliveryTimeMins} Mins Express
              </span>
              {discountPercent > 0 && (
                <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Title & Weight */}
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 leading-snug">
                {product.name}
              </h2>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5">
                Unit Size: {product.weightUnit}
              </p>
            </div>

            {/* Rating & Stock */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800 font-extrabold text-amber-800 dark:text-amber-300">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {product.rating} <span className="text-gray-400 font-normal">({product.reviewsCount} reviews)</span>
              </div>
              <span className={`font-extrabold text-[11px] ${product.stock > 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {product.isOutOfStock ? 'Currently Out of Stock' : `${product.stock} units left in Dark Store`}
              </span>
            </div>

            {/* Price Tag */}
            <div className="flex items-baseline gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-2xl font-black text-gray-900 dark:text-gray-100">
                ₹{product.price}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-gray-400 line-through font-bold">
                  ₹{product.originalPrice}
                </span>
              )}
              <span className="text-[11px] text-gray-400 font-semibold ml-auto">
                Inclusive of all taxes
              </span>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Product Description
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            {/* Quality & Express Guarantees */}
            <div className="bg-orange-50/70 dark:bg-orange-950/30 p-3 rounded-2xl border border-orange-200 dark:border-orange-800/50 space-y-1.5 text-[11px] font-bold text-orange-900 dark:text-orange-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                <span>100% Quality Checked & Farm Fresh Guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Super Fast 10-Min Doorstep Delivery</span>
              </div>
            </div>
          </div>

          {/* Action Button Footer */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold">Total Price</span>
              <p className="text-lg font-black text-orange-600 dark:text-orange-400 leading-none">
                ₹{product.price * (cartItem ? cartItem.quantity : 1)}
              </p>
            </div>

            {cartItem ? (
              <div className="flex items-center bg-orange-500 text-white rounded-2xl border border-orange-600 shadow-lg px-2 py-1.5">
                <button
                  onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                  className="p-1.5 hover:bg-orange-600 rounded-xl transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-black">
                  {cartItem.quantity} in Cart
                </span>
                <button
                  onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                  className="p-1.5 hover:bg-orange-600 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product)}
                disabled={product.isOutOfStock}
                className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl transition-all transform active:scale-95 ${
                  product.isOutOfStock
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30'
                }`}
              >
                <Plus className="w-4 h-4" /> Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
