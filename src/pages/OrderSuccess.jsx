import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';
import api from '../services/api';
import { formatINR } from '../utils/formatters';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => {
        if (res.success) setOrder(res.order);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 text-xs text-slate-500">Loading order confirmation...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider">
          Demo Order Confirmed
        </span>
        <h1 className="text-3xl font-black text-slate-900">Thank You for Your Order!</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Your order #{order?.order_number || id} has been successfully registered in the database.
        </p>
      </div>

      {order && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-left space-y-6 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pb-6 border-b border-slate-100">
            <div>
              <span className="text-slate-400">Order Number</span>
              <div className="font-bold text-slate-900">{order.order_number}</div>
            </div>
            <div>
              <span className="text-slate-400">Status</span>
              <div className="font-bold text-emerald-600">{order.status}</div>
            </div>
            <div>
              <span className="text-slate-400">Total Paid</span>
              <div className="font-bold text-slate-900">{formatINR(order.total_amount)}</div>
            </div>
            <div>
              <span className="text-slate-400">Payment</span>
              <div className="font-bold text-slate-900">{order.payment_method}</div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Purchased Items</h3>
            <div className="divide-y divide-slate-100">
              {order.items?.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-contain rounded bg-slate-50 p-1" />
                    <div>
                      <span className="font-semibold text-slate-900">{item.name}</span>
                      <div className="text-[11px] text-slate-400">Quantity: {item.quantity}</div>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">{formatINR(item.total_price)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-1">
            <span className="font-bold text-slate-800">Delivering To:</span>
            <p className="text-slate-600">{order.shipping_name} ({order.shipping_phone})</p>
            <p className="text-slate-600">{order.shipping_address}, {order.shipping_city}, {order.shipping_state} - {order.shipping_postal_code}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        <Link
          to="/dashboard"
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition"
        >
          View My Orders
        </Link>
        <Link
          to="/"
          className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
