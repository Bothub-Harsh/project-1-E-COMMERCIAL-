import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/formatters';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { addToast } = useToast();

  const handleQtyChange = async (itemId, newQty) => {
    try {
      await updateQuantity(itemId, newQty);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
      addToast('Item removed from cart.');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Your Shopping Cart is Empty</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Explore our curated range of smartphones, laptops, smart accessories and top electronics.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition"
        >
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Shopping Cart</h1>
          <p className="text-xs text-slate-500">{cart.itemCount} item(s) selected for purchase</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:underline font-semibold"
        >
          Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Cart Items List (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.cart_item_id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 shadow-sm"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-contain rounded-xl bg-slate-50 p-2 flex-shrink-0"
              />

              <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                <Link
                  to={`/products/${item.slug}`}
                  className="text-sm font-bold text-slate-900 hover:text-brand-600 transition line-clamp-2"
                >
                  {item.name}
                </Link>
                <div className="text-xs text-slate-400">
                  Unit Price: <span className="font-semibold text-slate-700">{formatINR(item.price)}</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">
                  {item.stock_quantity > 0 ? `In Stock (${item.stock_quantity} left)` : 'Out of Stock'}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                  <button
                    disabled={item.quantity <= 1}
                    onClick={() => handleQtyChange(item.cart_item_id, item.quantity - 1)}
                    className="p-1.5 hover:bg-slate-200 text-slate-600 disabled:opacity-30 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                  <button
                    disabled={item.quantity >= item.stock_quantity}
                    onClick={() => handleQtyChange(item.cart_item_id, item.quantity + 1)}
                    className="p-1.5 hover:bg-slate-200 text-slate-600 disabled:opacity-30 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[90px]">
                  <div className="text-sm font-black text-slate-900">
                    {formatINR(item.total_price)}
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(item.cart_item_id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition"
                  title="Remove from cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <h2 className="text-base font-black text-slate-900 border-b pb-3">Order Summary</h2>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal ({cart.itemCount} items)</span>
              <span className="font-bold text-slate-900">{formatINR(cart.subtotal)}</span>
            </div>

            {parseFloat(cart.discount) > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount Applied</span>
                <span>-{formatINR(cart.discount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span>
                {parseFloat(cart.shipping) === 0 ? (
                  <span className="text-emerald-600 font-bold uppercase">FREE</span>
                ) : (
                  formatINR(cart.shipping)
                )}
              </span>
            </div>

            <div className="border-t pt-3 flex justify-between text-base font-black text-slate-900">
              <span>Grand Total</span>
              <span className="text-brand-600">{formatINR(cart.total)}</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="w-full py-3.5 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-brand-600/20 text-center flex items-center justify-center gap-2 transition"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Simulated checkout for learning and testing. No real card details charged.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
