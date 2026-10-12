import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Check, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/formatters';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast } = useToast();
  const { user } = useAuth();

  const isFavorited = isInWishlist(product.id);
  const inStock = product.stock_quantity > 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      addToast('Please sign in to add items to your cart.', 'info');
      return;
    }
    if (!inStock) {
      addToast('Sorry, this product is currently out of stock.', 'error');
      return;
    }
    try {
      await addToCart(product.id, 1);
      addToast(`Added "${product.name}" to cart!`);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      addToast('Please sign in to manage your wishlist.', 'info');
      return;
    }
    try {
      await toggleWishlist(product.id);
      addToast(isFavorited ? 'Removed from wishlist.' : 'Added to wishlist!');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-brand-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.discount_percentage > 0 && (
          <span className="bg-rose-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
            {product.discount_percentage}% OFF
          </span>
        )}
        {product.is_best_seller && (
          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            Best Seller
          </span>
        )}
      </div>

      {/* Wishlist floating button */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition shadow-sm ${
          isFavorited
            ? 'bg-rose-50 text-rose-600 border border-rose-200'
            : 'bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500'
        }`}
        title="Save to Wishlist"
      >
        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image Link */}
      <Link to={`/products/${product.slug}`} className="block relative pt-[75%] overflow-hidden bg-slate-50">
        <img
          src={product.primary_image}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Brand info */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span>{product.brand_name || 'Generic'}</span>
            <span className="text-slate-300">•</span>
            <span>{product.category_name}</span>
          </div>

          {/* Product Title */}
          <Link
            to={`/products/${product.slug}`}
            className="block text-sm font-semibold text-slate-900 group-hover:text-brand-600 line-clamp-2 leading-snug transition mb-2"
          >
            {product.name}
          </Link>

          {/* Star Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-bold border border-emerald-200/50">
              <span>{parseFloat(product.rating || 0).toFixed(1)}</span>
              <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
            </div>
            <span className="text-xs text-slate-400">
              ({product.rating_count ? product.rating_count.toLocaleString() : 0})
            </span>
          </div>
        </div>

        <div>
          {/* Price & Stock Display */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-black text-slate-900 tracking-tight">
              {formatINR(product.price)}
            </span>
            {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
              <span className="text-xs text-slate-400 line-through">
                {formatINR(product.original_price)}
              </span>
            )}
          </div>

          <div className="text-[11px] font-medium mb-4">
            {inStock ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> In Stock ({product.stock_quantity} left)
              </span>
            ) : (
              <span className="text-rose-600 font-semibold">Out of Stock</span>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition duration-200 shadow-sm ${
              inStock
                ? 'bg-brand-600 hover:bg-brand-700 text-white active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {inStock ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}
