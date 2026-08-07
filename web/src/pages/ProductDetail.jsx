import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`)
      .then((data) => {
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleAddToCart() {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedVariant) {
      setMessage('This item has no available sizes yet.');
      return;
    }

    setAdding(true);
    setMessage('');
    try {
      await api.post('/cart/items', { variantId: selectedVariant.id, quantity: 1 });
      setMessage('Added to cart.');
    } catch (err) {
      setMessage('Could not add to cart.');
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-6 py-12 text-graphite">Loading...</div>;
  }

  if (!product) {
    return <div className="max-w-7xl mx-auto px-6 py-12">Product not found.</div>;
  }

  const image = product.imageUrls && product.imageUrls.length > 0
  ? `http://localhost:8080${product.imageUrls[0]}`
  : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-16">
        <div className="aspect-square bg-hairline">
          {image ? (
            <img src={image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-graphite text-sm">
              No image
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-graphite mb-2">{product.brand}</p>
          <h1 className="font-display font-black text-4xl uppercase tracking-tight mb-4">
            {product.name}
          </h1>
          <p className="font-semibold text-2xl mb-6">${product.basePrice.toFixed(2)}</p>
          <p className="text-graphite mb-8">{product.description}</p>

          {product.variants && product.variants.length > 0 && (
            <div className="mb-8">
              <p className="font-display font-bold text-sm uppercase tracking-wide mb-3">Size</p>
              <div className="flex gap-2 flex-wrap">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    disabled={variant.stockQty === 0}
                    className={`px-4 py-2 border text-sm font-medium
                      ${selectedVariant?.id === variant.id ? 'border-ink bg-ink text-paper' : 'border-hairline hover:border-ink'}
                      ${variant.stockQty === 0 ? 'opacity-30 cursor-not-allowed' : ''}
                    `}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="w-full bg-ink text-paper font-display font-bold uppercase tracking-wide py-4 hover:bg-accent transition-colors disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>

          {message && <p className="mt-4 text-sm text-graphite">{message}</p>}
        </div>
      </div>
    </div>
  );
}