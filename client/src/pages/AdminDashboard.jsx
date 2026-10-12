import React, { useState, useEffect } from 'react';
import { 
  Users, Package, ShoppingBag, DollarSign, Plus, 
  Trash2, Edit3, ShieldAlert, Check, RefreshCw 
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/formatters';

export default function AdminDashboard() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders, users

  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // New product form modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: '',
    price: '',
    original_price: '',
    stock_quantity: 10,
    short_description: '',
    description: '',
    is_featured: false,
    is_best_seller: false,
    image_url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80'
  });

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, ordRes, usersRes, catRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/products?limit=50'),
        api.get('/admin/orders?limit=50'),
        api.get('/admin/users'),
        api.get('/categories')
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (prodRes.success) setProducts(prodRes.products);
      if (ordRes.success) setOrders(ordRes.orders);
      if (usersRes.success) setUsers(usersRes.users);
      if (catRes.success) {
        setCategories(catRes.categories);
        if (catRes.categories[0] && !productForm.category_id) {
          setProductForm(prev => ({ ...prev, category_id: catRes.categories[0].id }));
        }
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        image_urls: [productForm.image_url]
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
        addToast('Product updated successfully!');
      } else {
        await api.post('/admin/products', payload);
        addToast('New product created successfully!');
      }

      setShowProductModal(false);
      setEditingProduct(null);
      await loadDashboardData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      addToast('Product deleted.');
      await loadDashboardData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      addToast(`Order updated to "${newStatus}"`);
      await loadDashboardData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      category_id: p.category_id || categories[0]?.id || '',
      price: p.price,
      original_price: p.original_price || p.price,
      stock_quantity: p.stock_quantity,
      short_description: p.short_description || '',
      description: p.description || p.name,
      is_featured: p.is_featured || false,
      is_best_seller: p.is_best_seller || false,
      image_url: p.primary_image || ''
    });
    setShowProductModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" /> Harsh Electronics Control Panel
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Admin Management Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setProductForm({
                name: '',
                category_id: categories[0]?.id || '',
                price: '',
                original_price: '',
                stock_quantity: 10,
                short_description: '',
                description: '',
                is_featured: false,
                is_best_seller: false,
                image_url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80'
              });
              setShowProductModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['overview', 'products', 'orders', 'users'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              activeTab === tab
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* 4 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{formatINR(stats.totalSales)}</div>
              <span className="text-[11px] text-emerald-600 font-semibold">Simulated demo gross revenue</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                <ShoppingBag className="w-5 h-5 text-brand-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stats.totalOrders}</div>
              <span className="text-[11px] text-slate-500">Processed in database</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
                <Package className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stats.totalProducts}</div>
              <span className="text-[11px] text-slate-500">Active catalog items</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
                <Users className="w-5 h-5 text-sky-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stats.totalUsers}</div>
              <span className="text-[11px] text-slate-500">Registered customers</span>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900">Recent Customer Orders</h2>
            <div className="divide-y divide-slate-100">
              {stats.recentOrders?.map((ro) => (
                <div key={ro.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{ro.order_number}</span>
                    <span className="text-slate-400 ml-2">by {ro.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{formatINR(ro.total_amount)}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {ro.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900">Products Catalog ({products.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.primary_image} alt={p.name} className="w-10 h-10 object-contain rounded bg-slate-50 p-1" />
                      <div>
                        <div className="font-bold text-slate-900 max-w-xs truncate">{p.name}</div>
                        <span className="text-[11px] text-slate-400">{p.brand_name || 'Generic'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{p.category_name}</td>
                    <td className="p-4 font-bold text-slate-900">{formatINR(p.price)}</td>
                    <td className="p-4">
                      <span className={`font-bold ${p.stock_quantity <= 10 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">⭐ {parseFloat(p.rating || 0).toFixed(1)}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-base font-black text-slate-900">Customer Orders ({orders.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900">{o.order_number}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{o.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{o.customer_email}</div>
                    </td>
                    <td className="p-4 font-black text-slate-900">{formatINR(o.total_amount)}</td>
                    <td className="p-4 text-slate-500">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        o.status === 'Shipped' ? 'bg-sky-100 text-sky-800' :
                        o.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-base font-black text-slate-900">Registered Users ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Total Orders</th>
                  <th className="p-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900">{u.name}</td>
                    <td className="p-4 text-slate-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800">{u.order_count || 0}</td>
                    <td className="p-4 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create or Edit Product */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Electronics Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.original_price}
                    onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                  />
                  <span>Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_best_seller}
                    onChange={(e) => setProductForm({ ...productForm, is_best_seller: e.target.checked })}
                  />
                  <span>Best Seller</span>
                </label>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 text-white rounded-xl font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
