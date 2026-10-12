import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  User, Package, Heart, MapPin, LogOut, 
  ChevronRight, Calendar, ShieldCheck, Trash2, ShoppingCart 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { formatINR } from '../utils/formatters';

export default function UserDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'orders';

  const { user, logout, updateProfile } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, phone: user.phone || '' });
    }
  }, [user]);

  useEffect(() => {
    if (currentTab === 'orders') {
      setLoadingOrders(true);
      api.get('/orders')
        .then(res => {
          if (res.success) setOrders(res.orders || []);
        })
        .catch(console.error)
        .finally(() => setLoadingOrders(false));
    }
  }, [currentTab]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      addToast('Profile updated successfully!');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      await removeFromWishlist(productId);
      addToast('Moved product from wishlist to cart!');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Summary */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white font-black text-2xl flex items-center justify-center uppercase shadow-md">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user?.name}</h1>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                Role: {user?.role}
              </span>
              <span className="text-[11px] text-slate-400">
                Joined: {new Date(user?.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold transition"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-3 space-y-1 shadow-sm">
          <button
            onClick={() => setSearchParams({ tab: 'orders' })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
              currentTab === 'orders' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4" /> My Orders ({orders.length})
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'wishlist' })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
              currentTab === 'wishlist' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Heart className="w-4 h-4" /> Saved Wishlist ({wishlist.length})
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'profile' })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
              currentTab === 'profile' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" /> Profile & Addresses
          </button>
        </div>

        {/* Tab Content Panel (9 Cols) */}
        <div className="lg:col-span-9 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          {/* TAB 1: ORDERS */}
          {currentTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">Your Orders & History</h2>
                <p className="text-xs text-slate-500">Track current status of shipments and review past orders</p>
              </div>

              {loadingOrders ? (
                <div className="text-center py-12 text-xs text-slate-400">Loading order history...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Package className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">You haven't placed any demonstration orders yet.</p>
                  <Link to="/products" className="inline-block px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl">
                    Explore Electronics
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <div key={o.id} className="py-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-900">{o.order_number}</span>
                          <span className="text-[11px] text-slate-400 ml-2">
                            Placed on {new Date(o.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                            o.status === 'Shipped' ? 'bg-sky-100 text-sky-800' :
                            o.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {o.status}
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            {formatINR(o.total_amount)}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 flex items-center justify-between">
                        <span>Items: {o.item_count} product(s)</span>
                        <Link
                          to={`/order-success/${o.id}`}
                          className="text-xs text-brand-600 font-bold hover:underline"
                        >
                          View Receipt Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WISHLIST */}
          {currentTab === 'wishlist' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">Saved Wishlist</h2>
                <p className="text-xs text-slate-500">Products you've bookmarked for later consideration</p>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Heart className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">Your wishlist is empty.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlist.map((item) => (
                    <div key={item.wishlist_id} className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                      <div>
                        <img src={item.image} alt={item.name} className="h-32 w-full object-contain mb-3" />
                        <Link to={`/products/${item.slug}`} className="text-xs font-bold text-slate-900 hover:text-brand-600 line-clamp-2">
                          {item.name}
                        </Link>
                        <div className="text-sm font-black text-slate-900 mt-2">{formatINR(item.price)}</div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                        <button
                          onClick={() => handleMoveToCart(item.product_id)}
                          className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.product_id)}
                          className="p-2 text-slate-400 hover:text-rose-600"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE */}
          {currentTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">Edit Profile</h2>
                <p className="text-xs text-slate-500">Manage your contact credentials and display name</p>
              </div>

              <form onSubmit={handleProfileSave} className="max-w-md space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Immutable)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow transition disabled:opacity-50"
                >
                  {savingProfile ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
