import express from 'express';
import {
  getProducts,
  getProductByIdOrSlug,
  getCategories,
  getBrands,
  getSearchSuggestions
} from '../controllers/productController.js';

const router = express.Router();

router.get('/products', getProducts);
router.get('/products/:idOrSlug', getProductByIdOrSlug);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/search/suggestions', getSearchSuggestions);

export default router;
