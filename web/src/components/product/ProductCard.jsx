import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format';

export default function ProductCard({ product }) {
  const image = product.imageUrls && product.imageUrls.length > 0
    ? `http://localhost:8080${product.imageUrls[0]}`
    : null;

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="aspect-square bg-hairline overflow-hidden mb-4 relative">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-graphite text-sm">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/5 transition-colors duration-500" />
      </div>
      <p className="text-xs uppercase tracking-wide text-graphite mb-1">{product.brand}</p>
      <h3 className="font-display font-bold text-lg leading-tight mb-1 group-hover:text-accent transition-colors">
        {product.name}
      </h3>
      <p className="font-semibold">{formatPrice(product.basePrice)}</p>
    </Link>
  );
}