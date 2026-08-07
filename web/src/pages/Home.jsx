import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import ProductCard from '../components/product/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products?sort=newest&direction=desc')
      .then((data) => setProducts(data.slice(0, 4)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        <p className="text-accent font-display font-bold text-sm uppercase tracking-widest mb-4">
          New Arrivals
        </p>
        <h1 className="font-display font-black text-6xl md:text-8xl uppercase tracking-tight leading-none mb-8">
          Move<br />Different
        </h1>
        <Link
          to="/products"
          className="inline-block bg-ink text-paper font-display font-bold uppercase tracking-wide px-8 py-4 hover:bg-accent transition-colors"
        >
          Shop Now
        </Link>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="font-display font-bold text-2xl uppercase tracking-tight mb-8">
          Latest Drops
        </h2>
        {loading ? (
          <p className="text-graphite">Loading...</p>
        ) : products.length === 0 ? (
          <p className="text-graphite">No products yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}