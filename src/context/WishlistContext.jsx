import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.get('/wishlist');
      if (data.success) {
        setWishlist(data.wishlist || []);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product_id === productId);
  };

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      await api.delete(`/wishlist/${productId}`);
    } else {
      await api.post('/wishlist', { productId });
    }
    await fetchWishlist();
  };

  const removeFromWishlist = async (productId) => {
    await api.delete(`/wishlist/${productId}`);
    await fetchWishlist();
  };

  return (
    <WishlistContext.Provider value={{ wishlist, loading, isInWishlist, toggleWishlist, removeFromWishlist, refreshWishlist: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
