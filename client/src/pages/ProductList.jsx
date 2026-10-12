import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Search, RotateCcw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { formatINR } from '../utils/formatters';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter state synced with URL params
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Load Categories and Brands metadata
  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/brands')]).then(([catRes, brandRes]) => {
      if (catRes.success) setCategories(catRes.categories);
      if (brandRes.success) setBrands(brandRes.brands);
    });
  }, []);

  // Fetch Products based on current params
  useEffect(() => {
    async function fetchFilteredProducts() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (categoryParam) query.append('category', categoryParam);
        if (brandParam) query.append('brand', brandParam);
        if (searchParam) query.append('search', searchParam);
        if (sortParam) query.append('sort', sortParam);
        if (minPriceParam) query.append('minPrice', minPriceParam);
        if (maxPriceParam) query.append('maxPrice', maxPriceParam);
        query.append('page', pageParam);
        query.append('limit', 12);

        const res = await api.get(`/products?${query.toString()}`);
        if (res.success) {
          setProducts(res.products);
          setTotal(res.total);
          setTotalPages(res.totalPages);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFilteredProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryParam, brandParam, searchParam, sortParam, minPriceParam, maxPriceParam, pageParam]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Filter Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {searchParam
              ? `Search Results for "${searchParam}"`
              : categoryParam
              ? categories.find(c => c.slug === categoryParam)?.name || 'Electronics Catalog'
              : 'All Electronics Products'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {products.length} of {total} products found
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-xs">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortParam}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="">Sort: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="popularity">Most Popular</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" /> Filter Catalog
            </span>
            {(categoryParam || brandParam || minPriceParam || maxPriceParam || searchParam) && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset All
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Category</h3>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              <button
                onClick={() => updateFilter('category', '')}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition ${
                  !categoryParam ? 'bg-brand-50 text-brand-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateFilter('category', c.slug)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                    categoryParam === c.slug ? 'bg-brand-50 text-brand-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] text-slate-400">({c.product_count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Brand</h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => updateFilter('brand', '')}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition ${
                  !brandParam ? 'bg-brand-50 text-brand-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Brands
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => updateFilter('brand', b.slug)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                    brandParam === b.slug ? 'bg-brand-50 text-brand-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{b.name}</span>
                  <span className="text-[10px] text-slate-400">({b.product_count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Price Range</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPriceParam}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                className="p-2 border border-slate-200 rounded-lg outline-none focus:border-brand-500"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPriceParam}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="p-2 border border-slate-200 rounded-lg outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="md:col-span-3">
          {loading ? (
            <LoadingSkeleton count={9} />
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <Search className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No products match your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting or resetting your search filters to find what you are looking for.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8 border-t border-slate-200">
                  <button
                    disabled={pageParam <= 1}
                    onClick={() => updateFilter('page', (pageParam - 1).toString())}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-medium text-slate-600 px-3">
                    Page {pageParam} of {totalPages}
                  </span>
                  <button
                    disabled={pageParam >= totalPages}
                    onClick={() => updateFilter('page', (pageParam + 1).toString())}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Drawer Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-4/5 max-w-sm bg-white h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <span className="font-bold text-base">Filters</span>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Category */}
            <div>
              <h4 className="text-xs font-bold uppercase mb-2">Category</h4>
              <div className="space-y-1">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      updateFilter('category', c.slug);
                      setMobileFilterOpen(false);
                    }}
                    className="block w-full text-left py-1 text-xs text-slate-700"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                resetFilters();
                setMobileFilterOpen(false);
              }}
              className="w-full py-2 bg-slate-100 text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
