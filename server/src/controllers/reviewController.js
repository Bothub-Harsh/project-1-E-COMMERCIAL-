import { query } from '../db/pool.js';

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const result = await query(`
      SELECT 
        r.id, r.rating, r.title, r.comment, r.created_at,
        u.name AS user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC;
    `, [productId]);

    return res.json({
      success: true,
      reviews: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const submitReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    const numRating = parseInt(rating, 10);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.'
      });
    }

    // Upsert review
    await query(`
      INSERT INTO reviews (product_id, user_id, rating, title, comment)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (product_id, user_id) DO UPDATE SET
        rating = EXCLUDED.rating,
        title = EXCLUDED.title,
        comment = EXCLUDED.comment,
        created_at = CURRENT_TIMESTAMP;
    `, [productId, userId, numRating, title || null, comment || null]);

    // Recalculate product average rating and count
    const statsRes = await query(`
      SELECT AVG(rating)::numeric(3,2) AS avg_rating, COUNT(id) AS review_count
      FROM reviews
      WHERE product_id = $1;
    `, [productId]);

    const { avg_rating, review_count } = statsRes.rows[0];
    await query(`
      UPDATE products
      SET rating = $1, rating_count = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3;
    `, [avg_rating, review_count, productId]);

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your product review has been submitted.'
    });
  } catch (error) {
    next(error);
  }
};
