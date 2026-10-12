import { pool, query } from '../db/pool.js';

export const createOrder = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const {
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPostalCode,
      items // Array of { productId, quantity }
    } = req.body;

    if (!shippingName || !shippingPhone || !shippingAddress || !shippingCity || !shippingState || !shippingPostalCode) {
      return res.status(400).json({
        success: false,
        message: 'All shipping address fields are required.'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one product.'
      });
    }

    await client.query('BEGIN');

    // 1. Fetch products & validate stock with Row-Level Locking (FOR UPDATE)
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prodRes = await client.query(
        'SELECT id, name, price, original_price, stock_quantity FROM products WHERE id = $1 FOR UPDATE',
        [item.productId]
      );

      if (prodRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: `Product ID ${item.productId} was not found.`
        });
      }

      const product = prodRes.rows[0];
      const qty = parseInt(item.quantity, 10);

      if (qty <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for "${product.name}".`
        });
      }

      if (product.stock_quantity < qty) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}, Requested: ${qty}.`
        });
      }

      const itemTotal = parseFloat(product.price) * qty;
      subtotal += itemTotal;

      validatedItems.push({
        product,
        quantity: qty,
        unitPrice: parseFloat(product.price),
        totalPrice: itemTotal
      });
    }

    const shippingCharge = subtotal > 1000 ? 0 : 99;
    const finalTotal = subtotal + shippingCharge;

    // Generate readable Unique Order Number
    const orderNumber = `HE-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Insert into orders table
    const orderInsertRes = await client.query(`
      INSERT INTO orders (
        order_number, user_id, total_amount, shipping_amount, discount_amount,
        status, payment_method, payment_status,
        shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_postal_code
      )
      VALUES ($1, $2, $3, $4, 0.00, 'Confirmed', 'Demo Payment', 'Paid', $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `, [
      orderNumber,
      userId,
      finalTotal,
      shippingCharge,
      shippingName.trim(),
      shippingPhone.trim(),
      shippingAddress.trim(),
      shippingCity.trim(),
      shippingState.trim(),
      shippingPostalCode.trim()
    ]);

    const createdOrder = orderInsertRes.rows[0];

    // 3. Insert order items & safely deduct inventory stock
    for (const vItem of validatedItems) {
      await client.query(`
        INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
        VALUES ($1, $2, $3, $4, $5);
      `, [createdOrder.id, vItem.product.id, vItem.quantity, vItem.unitPrice, vItem.totalPrice]);

      await client.query(`
        UPDATE products
        SET stock_quantity = stock_quantity - $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2;
      `, [vItem.quantity, vItem.product.id]);
    }

    // 4. Clear user's shopping cart items since order succeeded
    await client.query(`
      DELETE FROM cart_items ci
      USING carts c
      WHERE ci.cart_id = c.id AND c.user_id = $1;
    `, [userId]);

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Demo order placed successfully!',
      order: createdOrder
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const ordersRes = await query(`
      SELECT 
        o.*,
        COUNT(oi.id) AS item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC;
    `, [userId]);

    return res.json({
      success: true,
      orders: ordersRes.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const { id } = req.params;

    const orderSql = isAdmin
      ? 'SELECT * FROM orders WHERE id = $1'
      : 'SELECT * FROM orders WHERE id = $1 AND user_id = $2';
    
    const params = isAdmin ? [id] : [id, userId];
    const orderRes = await query(orderSql, params);

    if (orderRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const order = orderRes.rows[0];

    const itemsRes = await query(`
      SELECT 
        oi.id, oi.quantity, oi.unit_price, oi.total_price,
        p.id AS product_id, p.name, p.slug,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1),
          'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80'
        ) AS image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
      ORDER BY oi.id ASC;
    `, [order.id]);

    order.items = itemsRes.rows;

    return res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};
