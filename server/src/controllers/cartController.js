import { query } from '../db/pool.js';

// Helper to get or create cart for user
async function getOrCreateCartId(userId) {
  const cartRes = await query('SELECT id FROM carts WHERE user_id = $1', [userId]);
  if (cartRes.rows.length > 0) {
    return cartRes.rows[0].id;
  }
  const createRes = await query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
  return createRes.rows[0].id;
}

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartId = await getOrCreateCartId(userId);

    const itemsRes = await query(`
      SELECT 
        ci.id AS cart_item_id,
        ci.quantity,
        ci.created_at,
        p.id AS product_id,
        p.name,
        p.slug,
        p.price,
        p.original_price,
        p.discount_percentage,
        p.stock_quantity,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1),
          'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80'
        ) AS image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at DESC;
    `, [cartId]);

    const items = itemsRes.rows.map(item => ({
      ...item,
      total_price: (parseFloat(item.price) * item.quantity).toFixed(2)
    }));

    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const originalSubtotal = items.reduce((sum, item) => sum + (parseFloat(item.original_price || item.price) * item.quantity), 0);
    const discount = originalSubtotal - subtotal;
    const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 99; // Free shipping above ₹1000
    const total = subtotal + shipping;

    return res.json({
      success: true,
      cart: {
        id: cartId,
        items,
        itemCount: items.reduce((cnt, item) => cnt + item.quantity, 0),
        subtotal: subtotal.toFixed(2),
        discount: discount > 0 ? discount.toFixed(2) : '0.00',
        shipping: shipping.toFixed(2),
        total: total.toFixed(2)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid Product ID and Quantity (>= 1) are required.'
      });
    }

    // Verify product exists and check stock
    const productRes = await query('SELECT id, name, stock_quantity, price FROM products WHERE id = $1', [productId]);
    if (productRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const product = productRes.rows[0];
    const cartId = await getOrCreateCartId(userId);

    // Check existing quantity in cart
    const existingRes = await query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, productId]
    );

    const currentQty = existingRes.rows.length > 0 ? existingRes.rows[0].quantity : 0;
    const newQty = currentQty + parseInt(quantity, 10);

    if (newQty > product.stock_quantity) {
      return res.status(400).json({
        success: false,
        message: `Cannot add more. Only ${product.stock_quantity} units available in stock.`
      });
    }

    if (existingRes.rows.length > 0) {
      await query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newQty, existingRes.rows[0].id]
      );
    } else {
      await query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
        [cartId, productId, parseInt(quantity, 10)]
      );
    }

    return res.json({
      success: true,
      message: `"${product.name}" added to cart!`
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1.'
      });
    }

    // Validate ownership
    const itemRes = await query(`
      SELECT ci.id, ci.product_id, p.stock_quantity, p.name
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = $1 AND c.user_id = $2;
    `, [itemId, userId]);

    if (itemRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found.'
      });
    }

    const item = itemRes.rows[0];
    if (quantity > item.stock_quantity) {
      return res.status(400).json({
        success: false,
        message: `Maximum available stock for ${item.name} is ${item.stock_quantity}.`
      });
    }

    await query('UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [quantity, itemId]);

    return res.json({
      success: true,
      message: 'Cart item quantity updated.'
    });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const result = await query(`
      DELETE FROM cart_items ci
      USING carts c
      WHERE ci.cart_id = c.id AND ci.id = $1 AND c.user_id = $2
      RETURNING ci.id;
    `, [itemId, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Item removed from cart.'
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await query(`
      DELETE FROM cart_items ci
      USING carts c
      WHERE ci.cart_id = c.id AND c.user_id = $1;
    `, [userId]);

    return res.json({
      success: true,
      message: 'Cart cleared.'
    });
  } catch (error) {
    next(error);
  }
};
