import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const image = product.imageUrls && product.imageUrls.length > 0
  ? `http://localhost:8080${product.imageUrls[0]}`
  : null;

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="aspect-square bg-hairline overflow-hidden mb-4">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-graphite text-sm">
            No image
          </div>
        )}
      </div>
      <p className="text-xs uppercase tracking-wide text-graphite mb-1">{product.brand}</p>
      <h3 className="font-display font-bold text-lg leading-tight mb-1">{product.name}</h3>
      <p className="font-semibold">${product.basePrice.toFixed(2)}</p>
    </Link>
  );
}