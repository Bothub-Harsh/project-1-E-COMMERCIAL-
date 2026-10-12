import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, ShoppingCart, Heart, ShieldCheck, Truck, 
  RotateCcw, Check, ChevronRight, MessageSquare 
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { formatINR } from '../utils/formatters';

export default function ProductDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadProductData() {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        if (res.success && res.product) {
          setProduct(res.product);
          setActiveImage(res.product.images?.[0] || '');

          // Fetch reviews for this product
          const revRes = await api.get(`/reviews/${res.product.id}`);
          if (revRes.success) {
            setReviews(revRes.reviews || []);
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-96 bg-slate-200 rounded-3xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
            <div className="h-12 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500">The requested electronics product could not be found.</p>
        <Link to="/products" className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const inStock = product.stock_quantity > 0;

  const handleAddToCart = async () => {
    if (!user) {
      addToast('Please log in to add products to your cart.', 'info');
      return;
    }
    if (!inStock) {
      addToast('Sorry, this product is currently out of stock.', 'error');
      return;
    }
    try {
      await addToCart(product.id, quantity);
      addToast(`Added ${quantity} unit(s) of "${product.name}" to cart!`);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      addToast('Please log in to save to your wishlist.', 'info');
      return;
    }
    try {
      await toggleWishlist(product.id);
      addToast(isFavorited ? 'Removed from wishlist.' : 'Saved to wishlist!');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please sign in to write a product review.', 'info');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/reviews/${product.id}`, newReview);
      addToast('Review submitted successfully!');
      // Refresh reviews list
      const revRes = await api.get(`/reviews/${product.id}`);
      if (revRes.success) setReviews(revRes.reviews);
      setNewReview({ rating: 5, title: '', comment: '' });
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const specs = typeof product.specifications === 'object' ? product.specifications : {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/products?category=${product.category_slug}`} className="hover:text-slate-900">
          {product.category_name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 flex items-center justify-center relative overflow-hidden shadow-sm">
            <img
              src={activeImage || product.images?.[0]}
              alt={product.name}
              className="max-h-[380px] w-auto object-contain transition duration-300 hover:scale-105"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-xl border p-1 bg-white overflow-hidden transition ${
                    activeImage === img ? 'border-brand-600 ring-2 ring-brand-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover rounded-lg" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-3 text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
              <span>{product.brand_name || 'Brand'}</span>
              <span>•</span>
              <span>{product.category_name}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-black border border-emerald-200">
                <span>{parseFloat(product.rating || 0).toFixed(1)}</span>
                <Star className="w-3.5 h-3.5 fill-emerald-600" />
              </div>
              <span className="text-xs text-slate-500">
                {product.rating_count} Ratings & {reviews.length} Verified Reviews
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {formatINR(product.price)}
              </span>
              {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                <>
                  <span className="text-base text-slate-400 line-through">
                    {formatINR(product.original_price)}
                  </span>
                  <span className="text-sm font-black text-rose-600">
                    {product.discount_percentage}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Inclusive of all taxes. Free express shipping across India.
            </p>
          </div>

          {/* Stock availability */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            {inStock ? (
              <span className="text-emerald-600 flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[2.5]" />
                In Stock ({product.stock_quantity} available for instant dispatch)
              </span>
            ) : (
              <span className="text-rose-600 font-bold">Currently Out of Stock</span>
            )}
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-2">
            {inStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-slate-900 min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= product.stock_quantity}
                    onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                    className="px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 py-3.5 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/20 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>

              <button
                onClick={handleWishlistToggle}
                className={`p-3.5 rounded-2xl border transition shadow-sm ${
                  isFavorited
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-50'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Highlights checklist */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>Fast 2-3 Day Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>1 Year Official Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>7 Days Return Policy</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>100% Genuine Guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Technical Specifications */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 space-y-8 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-3">Product Description</h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-4xl whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {Object.keys(specs).length > 0 && (
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-4">Technical Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
              {Object.entries(specs).map(([key, val]) => (
                <div key={key} className="flex p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="w-1/3 font-bold text-slate-700">{key}</span>
                  <span className="w-2/3 text-slate-600">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 space-y-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">Customer Reviews & Ratings</h2>
            <p className="text-xs text-slate-500">Real feedback from verified purchasers</p>
          </div>
        </div>

        {/* Submit Review Form */}
        <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Write a Review</h3>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">Rating:</span>
            <select
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
              className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
            >
              <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
              <option value="3">⭐⭐⭐ (3 Stars)</option>
              <option value="2">⭐⭐ (2 Stars)</option>
              <option value="1">⭐ (1 Star)</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Review Title (e.g. Excellent battery life and display!)"
            value={newReview.title}
            onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500"
          />

          <textarea
            rows="3"
            required
            placeholder="Share details of your experience with this product..."
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500"
          ></textarea>

          <button
            type="submit"
            disabled={submittingReview}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
          >
            {submittingReview ? 'Submitting...' : 'Post Review'}
          </button>
        </form>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No reviews yet. Be the first to share your thoughts!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{rev.user_name}</span>
                    <div className="flex items-center gap-0.5 px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                      <span>{rev.rating}</span>
                      <Star className="w-2.5 h-2.5 fill-emerald-600" />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
                {rev.title && <h4 className="text-xs font-bold text-slate-900">{rev.title}</h4>}
                <p className="text-xs text-slate-600">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Related Products Carousel */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-900">Customers Also Viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {product.relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
