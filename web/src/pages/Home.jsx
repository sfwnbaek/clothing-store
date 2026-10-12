      import { useEffect, useRef, useState } from 'react';
      import { Link } from 'react-router-dom';
      import gsap from 'gsap';
      import { api } from '../api/client';
      import ProductCard from '../components/product/ProductCard';
      import ProductSkeleton from '../components/product/ProductSkeleton';
      import CategoryCarousel from '../components/product/CategoryCarousel';
      import PromoBanner from '../components/product/PromoBanner';
      import { useMagnetic } from '../hooks/useMagnetic';
      import { formatPrice } from '../utils/format';

      export default function Home() {
        const [products, setProducts] = useState([]);
        const [categories, setCategories] = useState([]);
        const [loading, setLoading] = useState(true);

        const heroImgRef = useRef(null);
        const line1Ref = useRef(null);
        const line2Ref = useRef(null);
        const ctaRef = useRef(null);
        const tagRef = useRef(null);
        const priceTagRef = useRef(null);
        const magneticRef = useMagnetic(0.25);

        useEffect(() => {
          api.get('/products?sort=newest&direction=desc')
            .then((data) => setProducts(data.slice(0, 4)))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));

          api.get('/categories').then(setCategories).catch(() => setCategories([]));
        }, []);

        const heroProduct = products[0];

        useEffect(() => {
          if (loading) return; // wait for hero image/product to exist before animating it in

          const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
          tl.set([tagRef.current, line1Ref.current, line2Ref.current, ctaRef.current, priceTagRef.current], { opacity: 0 });
          tl.set(heroImgRef.current, { clipPath: 'inset(0 100% 0 0)' });

          tl.fromTo(tagRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 })
            .fromTo(line1Ref.current, { yPercent: 110 }, { yPercent: 0, opacity: 1, duration: 0.8 }, '-=0.2')
            .fromTo(line2Ref.current, { yPercent: 110 }, { yPercent: 0, opacity: 1, duration: 0.8 }, '-=0.6')
            .to(heroImgRef.current, { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'power3.inOut' }, '-=0.9')
            .fromTo(ctaRef.current, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.4')
            .fromTo(priceTagRef.current, { y: 10, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.5 }, '-=0.3');
        }, [loading]);

        return (
          <div>
            {/* HERO — split layout, real product image, diagonal wipe reveal */}
            <section className="max-w-6xl mx-auto px-8 pt-2 pb-10 md:pt-6 md:pb-11">
              <div className="grid md:grid-cols-[1.1fr_1fr] gap-8 md:gap-4 items-center">
                <div className="overflow-hidden order-2 md:order-1 md:-ml-4 lg:-ml-30">
                  <p ref={tagRef} className="text-accent font-display font-bold text-sm uppercase tracking-widest mb-4">
                    New Arrivals
                  </p>
                  <h1 className="font-display font-black text-6xl md:text-7xl lg:text-8xl uppercase tracking-tight leading-[0.9] mb-8">
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
                </div>

                <div className="relative order-1 md:order-2">
                  <div
                    ref={heroImgRef}
                    className="relative aspect-[4/5] bg-ink overflow-hidden"
                    style={{ clipPath: 'polygon(35% 0, 100% 0, 100% 100%, 0% 100%)' }}
                  >
                    {heroProduct?.imageUrls?.[0] ? (
                      <img
        src={`http://localhost:8080${heroProduct.imageUrls[0]}`}
        alt={heroProduct.name}
        className="w-full h-full object-cover"
      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-ink to-graphite" />
                    )}
                  </div>

                  {heroProduct && (
                    <div
                      ref={priceTagRef}
                      className="absolute bottom-4 left-4 md:-left-6 bg-paper px-5 py-3 shadow-lg max-w-[80%]"
                    >
                      <p className="font-display font-bold text-sm uppercase tracking-tight truncate">
                        {heroProduct.name}
                      </p>
                      <p className="text-accent font-semibold text-sm">
                        {formatPrice(heroProduct.basePrice)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

                  {/* MARQUEE — real category names, infinite loop, self-contained animation */}
            {categories.length > 0 && (
              <div className="bg-ink text-paper py-3 overflow-hidden border-y border-hairline">
                <style>{`
                  @keyframes stride-marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-16.6667%); }
                  }
                  .stride-marquee-track {
                    animation: stride-marquee 22s linear infinite;
                  }
                `}</style>
                <div className="flex whitespace-nowrap stride-marquee-track font-display font-bold uppercase tracking-wide text-sm w-max">
                  {Array.from({ length: 6 }).map((_, loop) => (
                    <span key={loop} className="flex items-center shrink-0">
                      {categories.map((cat) => (
                        <span key={`${loop}-${cat.id}`} className="flex items-center">
                          <Link to={`/products?category=${cat.slug}`} className="px-6 hover:text-accent transition-colors">
                            Shop {cat.name}
                          </Link>
                          <span className="text-accent">●</span>
                        </span>
                      ))}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <PromoBanner />

            {/* CATEGORY CAROUSEL — dark band so the page isn't one long white scroll */}
            <section className="bg-ink text-paper py-16">
              <CategoryCarousel categories={categories} />
            </section>

            {/* LATEST DROPS — asymmetric when there's enough stock, plain grid otherwise */}
            <section className="max-w-7xl mx-auto px-6 py-24">
              <h2 className="font-display font-bold text-2xl uppercase tracking-tight mb-8">
                Latest Drops
              </h2>
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <p className="text-graphite">No products yet.</p>
              ) : products.length >= 4 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in">
                  <div className="col-span-2 row-span-2">
                    <ProductCard product={products[0]} />
                  </div>
                  {products.slice(1).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
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