import { query } from '../db/pool.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      sort,
      search,
      featured,
      bestSeller,
      newArrival,
      page = 1,
      limit = 12
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const conditions = [];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`c.slug = $${params.length}`);
    }

    if (brand) {
      params.push(brand);
      conditions.push(`b.slug = $${params.length}`);
    }

    if (minPrice) {
      params.push(parseFloat(minPrice));
      conditions.push(`p.price >= $${params.length}`);
    }

    if (maxPrice) {
      params.push(parseFloat(maxPrice));
      conditions.push(`p.price <= $${params.length}`);
    }

    if (search) {
      params.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(p.name) LIKE $${params.length} OR LOWER(p.description) LIKE $${params.length} OR LOWER(b.name) LIKE $${params.length} OR LOWER(c.name) LIKE $${params.length})`);
    }

    if (featured === 'true') {
      conditions.push(`p.is_featured = true`);
    }

    if (bestSeller === 'true') {
      conditions.push(`p.is_best_seller = true`);
    }

    if (newArrival === 'true') {
      conditions.push(`p.is_new_arrival = true`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'p.created_at DESC';
    if (sort === 'price_asc') {
      orderBy = 'p.price ASC';
    } else if (sort === 'price_desc') {
      orderBy = 'p.price DESC';
    } else if (sort === 'rating') {
      orderBy = 'p.rating DESC';
    } else if (sort === 'popularity') {
      orderBy = 'p.rating_count DESC';
    } else if (sort === 'discount') {
      orderBy = 'p.discount_percentage DESC';
    }

    // Count total products matching filters
    const countSql = `
      SELECT COUNT(DISTINCT p.id) AS total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause};
    `;
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0]?.total || 0, 10);

    // Fetch products with primary images
    const dataSql = `
      SELECT 
        p.id, p.name, p.slug, p.price, p.original_price, p.discount_percentage,
        p.stock_quantity, p.rating, p.rating_count, p.short_description,
        p.is_featured, p.is_best_seller, p.is_new_arrival, p.created_at,
        c.name AS category_name, c.slug AS category_slug,
        b.name AS brand_name, b.slug AS brand_slug,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1),
          'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80'
        ) AS primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;

    const dataParams = [...params, parseInt(limit, 10), offset];
    const dataRes = await query(dataSql, dataParams);

    return res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      products: dataRes.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getProductByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = /^\d+$/.test(idOrSlug);

    const productSql = `
      SELECT 
        p.id, p.name, p.slug, p.price, p.original_price, p.discount_percentage,
        p.stock_quantity, p.rating, p.rating_count, p.short_description, p.description,
        p.specifications, p.is_featured, p.is_best_seller, p.is_new_arrival, p.created_at,
        c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
        b.id AS brand_id, b.name AS brand_name, b.slug AS brand_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE ${isNumeric ? 'p.id = $1' : 'p.slug = $1'};
    `;

    const productRes = await query(productSql, [idOrSlug]);

    if (productRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const product = productRes.rows[0];

    // Fetch all images
    const imagesRes = await query(`
      SELECT id, image_url, is_primary, display_order
      FROM product_images
      WHERE product_id = $1
      ORDER BY is_primary DESC, display_order ASC;
    `, [product.id]);

    product.images = imagesRes.rows.map(r => r.image_url);
    if (product.images.length === 0) {
      product.images = ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80'];
    }

    // Fetch related products in same category
    const relatedRes = await query(`
      SELECT 
        p.id, p.name, p.slug, p.price, p.original_price, p.discount_percentage,
        p.rating, p.rating_count,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1),
          'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80'
        ) AS primary_image
      FROM products p
      WHERE p.category_id = $1 AND p.id != $2
      ORDER BY p.rating DESC
      LIMIT 4;
    `, [product.category_id, product.id]);

    product.relatedProducts = relatedRes.rows;

    return res.json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        c.id, c.name, c.slug, c.description, c.image_url,
        COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC;
    `);

    return res.json({
      success: true,
      categories: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getBrands = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        b.id, b.name, b.slug, b.logo_url,
        COUNT(p.id) AS product_count
      FROM brands b
      LEFT JOIN products p ON b.id = p.brand_id
      GROUP BY b.id
      ORDER BY b.name ASC;
    `);

    return res.json({
      success: true,
      brands: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ success: true, suggestions: [] });
    }

    const term = `%${q.trim().toLowerCase()}%`;
    const result = await query(`
      SELECT id, name, slug, price,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1),
          'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80'
        ) AS primary_image
      FROM products p
      WHERE LOWER(name) LIKE $1
      ORDER BY rating_count DESC
      LIMIT 6;
    `, [term]);

    return res.json({
      success: true,
      suggestions: result.rows
    });
  } catch (error) {
    next(error);
  }
};
