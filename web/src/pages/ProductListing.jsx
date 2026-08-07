import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import ProductCard from '../components/product/ProductCard';

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'name';
  const direction = searchParams.get('direction') || 'asc';

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

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-display font-black text-4xl uppercase tracking-tight mb-8">
        {category ? category : 'All Products'}
      </h1>

      <div className="flex gap-12">
        <aside className="w-48 shrink-0">
          <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">Category</h2>
          <div className="flex flex-col gap-2 mb-8">
            <button
              onClick={() => updateParam('category', '')}
              className={`text-left text-sm ${!category ? 'text-accent font-semibold' : 'text-graphite hover:text-ink'}`}
            >
              All
            </button>
            <button
              onClick={() => updateParam('category', 'shoes')}
              className={`text-left text-sm ${category === 'shoes' ? 'text-accent font-semibold' : 'text-graphite hover:text-ink'}`}
            >
              Shoes
            </button>
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
            className="w-full border border-hairline px-3 py-2 text-sm"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="newest-desc">Newest</option>
          </select>
        </aside>

        <div className="flex-1">
          {loading ? (
            <p className="text-graphite">Loading...</p>
          ) : products.length === 0 ? (
            <p className="text-graphite">No products found.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
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