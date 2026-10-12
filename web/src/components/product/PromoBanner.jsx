import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function PromoBanner() {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    api.get('/banners').then(setBanners).catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners]);

  function goTo(i) {
    setIndex(((i % banners.length) + banners.length) % banners.length);
  }

  if (banners.length === 0) return null;

  const banner = banners[index];
  const image = `http://localhost:8080${banner.imageUrl}`;

  const content = (
    <div className="relative w-full h-[380px] md:h-[560px] overflow-hidden bg-hairline">
      <img src={image} alt={banner.headline || 'Promotion'} className="w-full h-full object-cover" />
      {banner.headline && (
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/70 via-transparent to-transparent">
          <p className="font-display font-black text-3xl md:text-5xl uppercase tracking-tight text-paper p-8 md:p-14">
            {banner.headline}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <section className="relative w-full">
      {banner.linkUrl ? (
        <Link to={banner.linkUrl} className="block group">
          {content}
        </Link>
      ) : (
        content
      )}

      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); goTo(index - 1); }}
            aria-label="Previous banner"
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-paper/90 hover:bg-paper flex items-center justify-center shadow-lg transition-colors z-10"
          >
            ←
          </button>
          <button
            onClick={(e) => { e.preventDefault(); goTo(index + 1); }}
            aria-label="Next banner"
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-paper/90 hover:bg-paper flex items-center justify-center shadow-lg transition-colors z-10"
          >
            →
          </button>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); goTo(i); }}
                aria-label={`Go to banner ${i + 1}`}
                className={`h-1.5 transition-all ${i === index ? 'w-6 bg-paper' : 'w-1.5 bg-paper/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}