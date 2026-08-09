import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import ProductCard from '../components/product/ProductCard';
import ProductSkeleton from '../components/product/ProductSkeleton';

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'name';
  const direction = searchParams.get('direction') || 'asc';

  useEffect(() => {
    api.get('/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    params.set('sort', sort);
    params.set('direction', direction);

    api.get(`/products?${params.toString()}`)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, sort, direction]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  }

  const activeCategoryName = categories.find((c) => c.slug === category)?.name;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-display font-black text-4xl uppercase tracking-tight mb-2">
        {activeCategoryName || 'All Products'}
      </h1>
      <p className="text-graphite text-sm mb-8">
        {loading ? 'Loading products...' : `${products.length} ${products.length === 1 ? 'item' : 'items'}`}
      </p>

      <div className="flex gap-12">
        <aside className="w-48 shrink-0">
          <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">Category</h2>
          <div className="flex flex-col gap-2 mb-8">
            <button
              onClick={() => updateParam('category', '')}
              className={`text-left text-sm transition-colors ${
                !category ? 'text-accent font-semibold' : 'text-graphite hover:text-ink'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateParam('category', cat.slug)}
                className={`text-left text-sm transition-colors ${
                  category === cat.slug ? 'text-accent font-semibold' : 'text-graphite hover:text-ink'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">Sort By</h2>
          <select
            value={`${sort}-${direction}`}
            onChange={(e) => {
              const [s, d] = e.target.value.split('-');
              const next = new URLSearchParams(searchParams);
              next.set('sort', s);
              next.set('direction', d);
              setSearchParams(next);
            }}
            className="w-full border border-hairline px-3 py-2 text-sm focus:outline-none focus:border-ink transition-colors"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="newest-desc">Newest</option>
          </select>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-graphite mb-2">No products found.</p>
              <button
                onClick={() => updateParam('category', '')}
                className="text-accent text-sm underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 animate-fade-in">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}