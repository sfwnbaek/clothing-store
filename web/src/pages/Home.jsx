import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { api } from '../api/client';
import ProductCard from '../components/product/ProductCard';
import ProductSkeleton from '../components/product/ProductSkeleton';
import CategoryCarousel from '../components/product/CategoryCarousel';
import PromoBanner from '../components/product/PromoBanner';
import { useMagnetic } from '../hooks/useMagnetic';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const heroRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const ctaRef = useRef(null);
  const tagRef = useRef(null);
  const magneticRef = useMagnetic(0.25);

  useEffect(() => {
    api.get('/products?sort=newest&direction=desc')
      .then((data) => setProducts(data.slice(0, 4)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));

    api.get('/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.set([tagRef.current, line1Ref.current, line2Ref.current, ctaRef.current], { opacity: 0 });
    tl.fromTo(tagRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 })
      .fromTo(line1Ref.current, { yPercent: 110 }, { yPercent: 0, opacity: 1, duration: 0.8 }, '-=0.2')
      .fromTo(line2Ref.current, { yPercent: 110 }, { yPercent: 0, opacity: 1, duration: 0.8 }, '-=0.6')
      .fromTo(ctaRef.current, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.3');
  }, []);

  return (
    <div>
      <section ref={heroRef} className="max-w-7xl mx-auto px-6 pt-16 pb-24 overflow-hidden">
        <p ref={tagRef} className="text-accent font-display font-bold text-sm uppercase tracking-widest mb-4">
          New Arrivals
        </p>
        <h1 className="font-display font-black text-6xl md:text-8xl uppercase tracking-tight leading-none mb-8">
          <span className="block overflow-hidden">
            <span ref={line1Ref} className="block">Move</span>
          </span>
          <span className="block overflow-hidden">
            <span ref={line2Ref} className="block">Different</span>
          </span>
        </h1>
        <Link
          ref={(node) => { ctaRef.current = node; magneticRef.current = node; }}
          to="/products"
          className="inline-block bg-ink text-paper font-display font-bold uppercase tracking-wide px-8 py-4 hover:bg-accent transition-colors"
        >
          Shop Now
        </Link>
      </section>

      <PromoBanner />
      <CategoryCarousel categories={categories} />

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="font-display font-bold text-2xl uppercase tracking-tight mb-8">
          Latest Drops
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <p className="text-graphite">No products yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}