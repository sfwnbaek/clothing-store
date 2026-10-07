import { useRef } from 'react';
import { Link } from 'react-router-dom';

export default function CategoryCarousel({ categories }) {
  const scrollRef = useRef(null);

  function scroll(direction) {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }

  if (categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 pt-12 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-2xl uppercase tracking-tight">Shop by Category</h2>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="w-9 h-9 border border-hairline hover:border-ink transition-colors flex items-center justify-center"
          >
            ←
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="w-9 h-9 border border-hairline hover:border-ink transition-colors flex items-center justify-center"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2"
      >
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${cat.slug}`}
            className="group relative shrink-0 w-64 md:w-72 aspect-[3/4] snap-start overflow-hidden bg-ink"
          >
            {cat.imageUrl ? (
              <img
                src={`http://localhost:8080${cat.imageUrl}`}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover opacity-70 transition-all duration-700 ease-out group-hover:opacity-90 group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-ink to-graphite" />
            )}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <span className="font-display font-black text-2xl uppercase tracking-tight text-paper mb-1">
                {cat.name}
              </span>
              <span className="text-paper/70 text-xs uppercase tracking-wide flex items-center gap-1 group-hover:gap-2 transition-all">
                Shop Now <span aria-hidden>→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}