import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, Zap, Sparkles, TrendingUp, 
  Smartphone, Laptop, Headphones, Watch, Camera, 
  CheckCircle2, Mail, Flame, ChevronRight 
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailSub, setEmailSub] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [featRes, bestRes, catRes] = await Promise.all([
          api.get('/products?featured=true&limit=8'),
          api.get('/products?bestSeller=true&limit=8'),
          api.get('/categories')
        ]);

        if (featRes.success) setFeaturedProducts(featRes.products);
        if (bestRes.success) setBestSellers(bestRes.products);
        if (catRes.success) setCategories(catRes.categories);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (emailSub.trim()) {
      addToast('Thank you for subscribing! Check your inbox for exclusive electronics coupons.');
      setEmailSub('');
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 text-white py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" /> Next-Gen Technology Store 2026
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Empower Your World With <span className="bg-gradient-to-r from-sky-400 via-brand-400 to-indigo-300 bg-clip-text text-transparent">Flagship Tech.</span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
                Discover the latest titanium smartphones, creator laptops, studio noise-cancelling headphones, and smart devices at guaranteed best prices in India.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/products"
                  className="px-7 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl shadow-lg shadow-brand-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2 text-sm"
                >
                  Explore All Tech <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/products?category=smartphones"
                  className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-2xl backdrop-blur-md transition text-sm"
                >
                  View Smartphones
                </Link>
              </div>

              {/* Badges bar */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-xs text-slate-300">
                <div>
                  <div className="text-xl font-black text-white">100%</div>
                  <div className="text-slate-400">Genuine Brands</div>
                </div>
                <div>
                  <div className="text-xl font-black text-white">Same-Day</div>
                  <div className="text-slate-400">Dispatch Support</div>
                </div>
                <div>
                  <div className="text-xl font-black text-white">1-Year</div>
                  <div className="text-slate-400">Official Warranty</div>
                </div>
              </div>
            </div>

            {/* Hero Interactive Card Promo */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-800/60 to-slate-900/90 border border-slate-700/60 p-6 shadow-2xl backdrop-blur-xl">
                <div className="absolute top-4 right-4 bg-rose-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Featured Deal
                </div>
                <img
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80"
                  alt="Apple MacBook Pro"
                  className="w-full h-56 object-cover rounded-2xl mb-4 shadow-md"
                />
                <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">Apple Silicon M3 Max</span>
                <h3 className="text-xl font-bold text-white mt-1">MacBook Pro 16-inch</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Extreme performance for developers, 3D artists, and deep learning engineers.
                </p>
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400">Starting from</span>
                    <div className="text-xl font-black text-white">₹3,49,900</div>
                  </div>
                  <Link
                    to="/products/apple-macbook-pro-16-m3-max"
                    className="px-4 py-2 bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs rounded-xl transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Shop By Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Curated Collections</span>
            <h2 className="text-2xl font-black text-slate-900">Explore By Category</h2>
          </div>
          <Link to="/products" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            See All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-brand-500 hover:shadow-lg transition-all text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden mb-3 bg-slate-50 flex items-center justify-center p-2 group-hover:scale-105 transition">
                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover rounded-xl" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition">
                {cat.name}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {cat.product_count || '10+'} Products
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Flagship Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Handpicked Selections
            </span>
            <h2 className="text-2xl font-black text-slate-900">Featured Electronics</h2>
          </div>
          <Link to="/products?featured=true" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Browse Featured <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Special Promotion Banner: Sony Studio Audio & Gaming */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-navy-950 via-slate-900 to-brand-900 text-white p-8 sm:p-12 shadow-xl">
          <div className="max-w-xl space-y-4 relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider">
              Limited Time Special Offer
            </span>
            <h3 className="text-3xl font-black tracking-tight leading-tight">
              Studio Sound & Noise Cancellation That Shuts Out The World.
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Save up to ₹5,000 on Sony WH-1000XM5 and Bose QuietComfort Ultra with 12 months No Cost EMI.
            </p>
            <div className="pt-2">
              <Link
                to="/products?category=headphones"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Claim Headphone Deals <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Best-Selling Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-rose-600" /> Hot Right Now
            </span>
            <h2 className="text-2xl font-black text-slate-900">Best-Selling Electronics</h2>
          </div>
          <Link to="/products?bestSeller=true" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View All Best Sellers <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bestSellers.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Newsletter Subscription */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Subscribe To Harsh Electronics Insider
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Get instant price drop alerts, early access to flagship launches, and an exclusive ₹500 welcome voucher.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-2 pt-2">
            <input
              type="email"
              required
              placeholder="Enter your email address..."
              value={emailSub}
              onChange={(e) => setEmailSub(e.target.value)}
              className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
