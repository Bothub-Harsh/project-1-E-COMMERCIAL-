import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { formatINR } from '../utils/formatters';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    shippingName: user?.name || '',
    shippingPhone: user?.phone || '+91 98765 43210',
    shippingAddress: '42, Cyber Hub Tech Park',
    shippingCity: 'Bengaluru',
    shippingState: 'Karnataka',
    shippingPostalCode: '560100'
  });

  const [placingOrder, setPlacingOrder] = useState(false);

  if (cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-4">
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <Link to="/products" className="text-xs text-brand-600 font-bold underline">
          Browse Products
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPlacingOrder(true);

    try {
      const orderPayload = {
        ...formData,
        items: cart.items.map(item => ({
          productId: item.product_id,
          quantity: item.quantity
        }))
      };

      const res = await api.post('/orders', orderPayload);
      if (res.success && res.order) {
        addToast('Order placed successfully!');
        await refreshCart();
        navigate(`/order-success/${res.order.id}`);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center gap-3">
        <Link to="/cart" className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Checkout & Shipping</h1>
          <p className="text-xs text-slate-500">Provide destination address for electronics delivery</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Form (7 Cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-base font-black text-slate-900">1. Delivery Address</h2>
            <span className="text-xs font-semibold text-brand-600">Simulated Express Logistics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.shippingName}
                onChange={(e) => setFormData({ ...formData, shippingName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={formData.shippingPhone}
                onChange={(e) => setFormData({ ...formData, shippingPhone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              required
              value={formData.shippingAddress}
              onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                required
                value={formData.shippingCity}
                onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
              <input
                type="text"
                required
                value={formData.shippingState}
                onChange={(e) => setFormData({ ...formData, shippingState: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code</label>
              <input
                type="text"
                required
                value={formData.shippingPostalCode}
                onChange={(e) => setFormData({ ...formData, shippingPostalCode: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Payment Method Option */}
          <div className="pt-4 border-t space-y-3">
            <h2 className="text-base font-black text-slate-900">2. Payment Method</h2>
            <div className="p-4 rounded-2xl border-2 border-brand-500 bg-brand-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Demo Instant Payment (Simulated)</div>
                  <div className="text-[11px] text-slate-500">
                    Safe testing environment. No real funds or credit cards processed.
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-brand-600 text-white text-[10px] font-black uppercase">
                Active Demo
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={placingOrder}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-600/20 transition active:scale-95 disabled:opacity-50"
          >
            {placingOrder ? 'Processing Demonstration Order...' : `Place Demo Order (${formatINR(cart.total)})`}
          </button>
        </form>

        {/* Sidebar Order Review (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <h2 className="text-base font-black text-slate-900 border-b pb-3">Items in Order</h2>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <div key={item.cart_item_id} className="py-3 flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 object-contain rounded-lg bg-slate-50 p-1" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900 truncate">{item.name}</div>
                  <div className="text-[11px] text-slate-500">Qty: {item.quantity} × {formatINR(item.price)}</div>
                </div>
                <div className="text-xs font-bold text-slate-900">{formatINR(item.total_price)}</div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Items Total:</span>
              <span className="font-bold text-slate-900">{formatINR(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee:</span>
              <span className="text-emerald-600 font-bold uppercase">FREE</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-base font-black text-slate-900">
              <span>Payable Total:</span>
              <span className="text-brand-600">{formatINR(cart.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
