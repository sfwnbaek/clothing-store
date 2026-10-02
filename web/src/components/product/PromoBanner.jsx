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

  if (banners.length === 0) return null;

  const banner = banners[index];
  const image = `http://localhost:8080${banner.imageUrl}`;

  const content = (
    <div className="relative w-full aspect-[21/9] md:aspect-[3/1] overflow-hidden bg-hairline">
      <img src={image} alt={banner.headline || 'Promotion'} className="w-full h-full object-cover" />
      {banner.headline && (
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/60 via-transparent to-transparent">
          <p className="font-display font-black text-2xl md:text-4xl uppercase tracking-tight text-paper p-6 md:p-10">
            {banner.headline}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <section className="max-w-7xl mx-auto px-6 pt-8">
      {banner.linkUrl ? (
        <Link to={banner.linkUrl} className="block group">
          {content}
        </Link>
      ) : (
        content
      )}

      {banners.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to banner ${i + 1}`}
              className={`h-1.5 transition-all ${i === index ? 'w-6 bg-ink' : 'w-1.5 bg-hairline'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}   