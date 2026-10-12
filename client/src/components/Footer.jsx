import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Cpu, Mail, Phone, MapPin, ShieldCheck, 
  Truck, RotateCcw, Clock, Award, Heart 
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 mt-auto border-t border-slate-900">
      {/* 1. Value Proposition Pillars */}
      <div className="border-b border-slate-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-950/80 border border-brand-800/40 text-brand-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Free Express Delivery</h4>
              <p className="text-xs text-slate-600">On all electronics orders over ₹1,000</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-950/80 border border-brand-800/40 text-brand-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">100% Genuine Products</h4>
              <p className="text-xs text-slate-600">Brand authorized 1-year official warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-950/80 border border-brand-800/40 text-brand-400 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">7-Day Hassle-Free Returns</h4>
              <p className="text-xs text-slate-600">Quick pickup & transparent exchange</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-950/80 border border-brand-800/40 text-brand-400 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">24/7 Dedicated Support</h4>
              <p className="text-xs text-slate-600">Expert tech assistance round the clock</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/30">
                <Cpu className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Harsh<span className="text-brand-500">Electronics</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              Harsh Electronics is India's leading consumer tech destination, offering genuine flagship smartphones, creator laptops, noise-cancelling studio monitors, smartwatches, and premium accessories with unmatched warranties.
            </p>
            <div className="pt-2 text-xs text-slate-600 space-y-1.5">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>MG Road Tech District, Bengaluru, Karnataka 560001, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>+91 98765 43210 / +91 80 4123 4567</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>support@harshelectronics.com</span>
              </p>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Top Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/products?category=smartphones" className="hover:text-white transition">Smartphones</Link></li>
              <li><Link to="/products?category=laptops" className="hover:text-white transition">Laptops & MacBooks</Link></li>
              <li><Link to="/products?category=headphones" className="hover:text-white transition">Wireless Headphones</Link></li>
              <li><Link to="/products?category=smartwatches" className="hover:text-white transition">Smartwatches</Link></li>
              <li><Link to="/products?category=cameras" className="hover:text-white transition">Mirrorless Cameras</Link></li>
              <li><Link to="/products?category=gaming-accessories" className="hover:text-white transition">Gaming Battlestation</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Customer Care</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/dashboard" className="hover:text-white transition">Track My Orders</Link></li>
              <li><Link to="/dashboard?tab=wishlist" className="hover:text-white transition">Saved Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-white transition">Shopping Cart</Link></li>
              <li><span className="text-slate-600">Warranty Registration</span></li>
              <li><span className="text-slate-600">Shipping & Delivery Policies</span></li>
              <li><span className="text-slate-600">Returns & Replacements</span></li>
            </ul>
          </div>

          {/* Learning Project & AWS EC2 info */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Cloud Deployment</h4>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-2">
              <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-brand-950 text-brand-400 border border-brand-800/60">
                AWS EC2 Architecture
              </span>
              <p className="text-slate-600">
                Crafted for manual deployment on Ubuntu EC2 with Nginx reverse proxy, PM2 cluster, and PostgreSQL on port 5432.
              </p>
              <div className="pt-1 text-slate-500 text-[10px]">
                Port 5000: Loopback Only (127.0.0.1)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Copyright & Badges */}
      <div className="border-t border-slate-900 bg-slate-950/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Harsh Electronics Inc. All rights reserved. Educational Full-Stack Project.</p>
          <div className="flex items-center gap-6">
            <span>Demonstration E-Commerce Platform</span>
            <span>Made with React, Node.js & PostgreSQL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
