import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, ShoppingCart, Heart, User, ShieldAlert, 
  Menu, X, ChevronDown, Cpu, Truck, Headphones, RotateCcw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';
import { formatINR } from '../utils/formatters';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Fetch categories for category bar
    api.get('/categories')
      .then(res => {
        if (res.success) setCategories(res.categories);
      })
      .catch(() => {});
  }, []);

  // Search autocomplete debouncing
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      api.get(`/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
        .then(res => {
          if (res.success) setSuggestions(res.suggestions);
        })
        .catch(() => {});
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* 1. Promotional Announcement Bar */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Truck className="w-3.5 h-3.5" /> FREE Express Shipping on orders over ₹1,000
            </span>
            <span className="hidden md:inline text-slate-300">
              ⚡ Festive Mega Electronics Sale: Up to 40% OFF Flagships
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 text-[11px]">
            <span className="hidden sm:inline">24x7 Customer Support: +91 98765 43210</span>
            <Link to="/products" className="hover:text-white underline">Shop All Deals</Link>
          </div>
        </div>
      </div>

      {/* 2. Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 sm:gap-8">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition transform">
              <Cpu className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-brand-600 transition">
                Harsh<span className="text-brand-600">Electronics</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 -mt-1">
                Premium Tech Hub
              </span>
            </div>
          </Link>

          {/* Search Bar with Autocomplete Dropdown */}
          <div ref={searchRef} className="relative flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex">
              <input
                type="text"
                placeholder="Search smartphones, laptops, headphones, 4K cameras..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-11 pr-24 py-2.5 bg-slate-100 hover:bg-slate-50 focus:bg-white text-sm rounded-full border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-full transition shadow-sm"
              >
                Search
              </button>
            </form>

            {/* Suggestions Overlay */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                <div className="p-2 text-xs font-semibold text-slate-600 bg-slate-50 border-b border-slate-100">
                  Product Suggestions
                </div>
                <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setShowSuggestions(false);
                        navigate(`/products/${item.slug}`);
                      }}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition"
                    >
                      <img src={item.primary_image} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-slate-100" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">{item.name}</div>
                        <div className="text-xs font-bold text-brand-600">{formatINR(item.price)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions (Wishlist, Cart, User) */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wishlist */}
            <Link
              to="/dashboard?tab=wishlist"
              className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-3 py-2 rounded-full hover:bg-brand-50 text-slate-700 hover:text-brand-600 transition"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-slate-800" />
                {cart.itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-brand-600 text-white text-[11px] font-extrabold rounded-full px-1.5 py-0.2 min-w-[18px] text-center shadow">
                    {cart.itemCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline text-xs font-bold text-slate-800">
                {formatINR(cart.total)}
              </span>
            </Link>

            {/* User Account / Login */}
            {user ? (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-full border border-slate-200 hover:bg-slate-50 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-600 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full bg-brand-50 text-brand-700">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <User className="w-4 h-4 text-slate-600" /> My Account & Orders
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-brand-600 hover:bg-brand-50 font-semibold"
                      >
                        <ShieldAlert className="w-4 h-4 text-brand-600" /> Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium transition"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-brand-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-block px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-full transition shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-20 py-2 bg-slate-100 text-sm rounded-full border border-slate-200 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-brand-600 text-white text-xs font-bold rounded-full"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* 3. Category Horizontal Ribbon */}
      <nav className="bg-slate-900 text-slate-200 text-xs border-t border-slate-800 hidden md:block overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 py-2.5 whitespace-nowrap scrollbar-none">
          <Link to="/products" className="font-bold text-white hover:text-brand-400 flex items-center gap-1.5">
            <Menu className="w-3.5 h-3.5" /> All Electronics
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="hover:text-white transition font-medium hover:underline"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider text-slate-600">Categories</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/products?category=${c.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 px-2 rounded-md hover:bg-slate-100 text-slate-700"
              >
                {c.name}
              </Link>
            ))}
          </div>
          {isAdmin && (
            <div className="border-t border-slate-100 pt-3">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-brand-600 font-bold text-sm"
              >
                <ShieldAlert className="w-4 h-4" /> Go to Admin Dashboard
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
