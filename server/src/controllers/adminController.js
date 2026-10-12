import { query } from '../db/pool.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const userCount = await query('SELECT COUNT(id) AS total_users FROM users WHERE role = $1', ['customer']);
    const productCount = await query('SELECT COUNT(id) AS total_products FROM products');
    const orderCount = await query('SELECT COUNT(id) AS total_orders FROM orders');
    const salesSum = await query("SELECT COALESCE(SUM(total_amount), 0) AS total_sales FROM orders WHERE status != 'Cancelled'");
    const lowStockCount = await query('SELECT COUNT(id) AS low_stock FROM products WHERE stock_quantity <= 10');

    // Recent 5 orders
    const recentOrders = await query(`
      SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at, u.name AS customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5;
    `);

    return res.json({
      success: true,
      stats: {
        totalUsers: parseInt(userCount.rows[0].total_users, 10),
        totalProducts: parseInt(productCount.rows[0].total_products, 10),
        totalOrders: parseInt(orderCount.rows[0].total_orders, 10),
        totalSales: parseFloat(salesSum.rows[0].total_sales).toFixed(2),
        lowStockProducts: parseInt(lowStockCount.rows[0].low_stock, 10),
        recentOrders: recentOrders.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      brand_id,
      category_id,
      price,
      original_price,
      discount_percentage,
      stock_quantity,
      short_description,
      description,
      specifications,
      is_featured,
      is_best_seller,
      is_new_arrival,
      image_urls // Array of strings
    } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required.'
      });
    }

    const autoSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

    const result = await query(`
      INSERT INTO products (
        name, slug, brand_id, category_id, price, original_price,
        discount_percentage, stock_quantity, short_description, description,
        specifications, is_featured, is_best_seller, is_new_arrival
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `, [
      name.trim(),
      autoSlug,
      brand_id || null,
      category_id,
      parseFloat(price),
      original_price ? parseFloat(original_price) : parseFloat(price),
      discount_percentage || 0,
      stock_quantity ? parseInt(stock_quantity, 10) : 0,
      short_description || null,
      description || name,
      JSON.stringify(specifications || {}),
      Boolean(is_featured),
      Boolean(is_best_seller),
      Boolean(is_new_arrival)
    ]);

    const createdProduct = result.rows[0];

    // Insert images if provided
    if (image_urls && Array.isArray(image_urls) && image_urls.length > 0) {
      for (let i = 0; i < image_urls.length; i++) {
        if (image_urls[i]) {
          await query(`
            INSERT INTO product_images (product_id, image_url, is_primary, display_order)
            VALUES ($1, $2, $3, $4);
          `, [createdProduct.id, image_urls[i].trim(), i === 0, i]);
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      product: createdProduct
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      brand_id,
      category_id,
      price,
      original_price,
      discount_percentage,
      stock_quantity,
      short_description,
      description,
      specifications,
      is_featured,
      is_best_seller,
      is_new_arrival,
      image_urls
    } = req.body;

    const result = await query(`
      UPDATE products
      SET
        name = COALESCE($1, name),
        brand_id = COALESCE($2, brand_id),
        category_id = COALESCE($3, category_id),
        price = COALESCE($4, price),
        original_price = COALESCE($5, original_price),
        discount_percentage = COALESCE($6, discount_percentage),
        stock_quantity = COALESCE($7, stock_quantity),
        short_description = COALESCE($8, short_description),
        description = COALESCE($9, description),
        specifications = COALESCE($10, specifications),
        is_featured = COALESCE($11, is_featured),
        is_best_seller = COALESCE($12, is_best_seller),
        is_new_arrival = COALESCE($13, is_new_arrival),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *;
    `, [
      name ? name.trim() : null,
      brand_id || null,
      category_id || null,
      price ? parseFloat(price) : null,
      original_price ? parseFloat(original_price) : null,
      discount_percentage !== undefined ? discount_percentage : null,
      stock_quantity !== undefined ? parseInt(stock_quantity, 10) : null,
      short_description || null,
      description || null,
      specifications ? JSON.stringify(specifications) : null,
      is_featured !== undefined ? Boolean(is_featured) : null,
      is_best_seller !== undefined ? Boolean(is_best_seller) : null,
      is_new_arrival !== undefined ? Boolean(is_new_arrival) : null,
      id
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Replace images if an image array is supplied
    if (image_urls && Array.isArray(image_urls)) {
      await query('DELETE FROM product_images WHERE product_id = $1', [id]);
      for (let i = 0; i < image_urls.length; i++) {
        if (image_urls[i]) {
          await query(`
            INSERT INTO product_images (product_id, image_url, is_primary, display_order)
            VALUES ($1, $2, $3, $4);
          `, [id, image_urls[i].trim(), i === 0, i]);
        }
      }
    }

    return res.json({
      success: true,
      message: 'Product updated successfully!',
      product: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id, name', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    return res.json({
      success: true,
      message: `Product "${result.rows[0].name}" deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`o.status = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(id) AS total FROM orders o ${whereClause}`, params);
    const total = parseInt(countRes.rows[0].total, 10);

    const dataSql = `
      SELECT 
        o.*,
        u.name AS customer_name,
        u.email AS customer_email,
        COUNT(oi.id) AS item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;

    const dataRes = await query(dataSql, [...params, parseInt(limit, 10), offset]);

    return res.json({
      success: true,
      total,
      orders: dataRes.rows
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowed.join(', ')}`
      });
    }

    const result = await query(`
      UPDATE orders
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `, [status, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    return res.json({
      success: true,
      message: `Order status updated to "${status}".`,
      order: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT id, name, email, role, phone, created_at,
        (SELECT COUNT(id) FROM orders WHERE user_id = u.id) AS order_count
      FROM users u
      ORDER BY created_at DESC;
    `);

    return res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    next(error);
  }
};
