import { query } from '../db/pool.js';

export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await query(`
      SELECT 
        w.id AS wishlist_id,
        w.created_at,
        p.id AS product_id,
        p.name,
        p.slug,
        p.price,
        p.original_price,
        p.discount_percentage,
        p.stock_quantity,
        p.rating,
        p.rating_count,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1),
          'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80'
        ) AS image
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC;
    `, [userId]);

    return res.json({
      success: true,
      wishlist: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.'
      });
    }

    const prodRes = await query('SELECT id, name FROM products WHERE id = $1', [productId]);
    if (prodRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    await query(`
      INSERT INTO wishlists (user_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, product_id) DO NOTHING;
    `, [userId, productId]);

    return res.json({
      success: true,
      message: `"${prodRes.rows[0].name}" added to wishlist!`
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const result = await query(
      'DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2 RETURNING id',
      [userId, productId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist.'
      });
    }

    return res.json({
      success: true,
      message: 'Product removed from wishlist.'
    });
  } catch (error) {
    next(error);
  }
};
