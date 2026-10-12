import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    itemCount: 0,
    subtotal: '0.00',
    discount: '0.00',
    shipping: '0.00',
    total: '0.00'
  });
  const [loading, setLoading] = useState(false);

  // Fetch cart whenever logged in status changes
  const fetchCart = async () => {
    if (!user) {
      setCart({ items: [], itemCount: 0, subtotal: '0.00', discount: '0.00', shipping: '0.00', total: '0.00' });
      return;
    }
    setLoading(true);
    try {
      const data = await api.get('/cart');
      if (data.success && data.cart) {
        setCart(data.cart);
      }
    } catch (err) {
      console.error('Failed to load cart:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    const data = await api.post('/cart', { productId, quantity });
    await fetchCart();
    return data;
  };

  const updateQuantity = async (cartItemId, quantity) => {
    const data = await api.patch(`/cart/${cartItemId}`, { quantity });
    await fetchCart();
    return data;
  };

  const removeFromCart = async (cartItemId) => {
    const data = await api.delete(`/cart/${cartItemId}`);
    await fetchCart();
    return data;
  };

  const clearCart = async () => {
    const data = await api.delete('/cart');
    await fetchCart();
    return data;
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
