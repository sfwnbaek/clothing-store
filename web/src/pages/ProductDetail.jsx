import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/format';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    setProduct(null);
    api.get(`/products/${slug}`)
      .then((data) => {
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          const inStock = data.variants.find((v) => v.stockQty > 0);
          setSelectedVariant(inStock || data.variants[0]);
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
      showToast('This item has no available sizes yet.', 'error');
      return;
    }

    setAdding(true);
    try {
      await api.post('/cart/items', { variantId: selectedVariant.id, quantity: 1 });
      showToast('Added to cart.');
    } catch (err) {
      showToast('Could not add to cart.', 'error');
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-16 animate-pulse">
          <div className="aspect-square bg-hairline" />
          <div>
            <div className="h-3 bg-hairline w-1/4 mb-4" />
            <div className="h-8 bg-hairline w-3/4 mb-4" />
            <div className="h-6 bg-hairline w-1/4 mb-8" />
            <div className="h-24 bg-hairline w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <p className="font-display font-bold text-2xl uppercase tracking-tight mb-2">Product not found</p>
        <p className="text-graphite text-sm">It may have been removed or the link is incorrect.</p>
      </div>
    );
  }

  const image = product.imageUrls && product.imageUrls.length > 0
    ? `http://localhost:8080${product.imageUrls[0]}`
    : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-16">
        <div className="aspect-square bg-hairline overflow-hidden">
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
          <p className="font-semibold text-2xl mb-6">{formatPrice(product.basePrice)}</p>
          <p className="text-graphite mb-8 leading-relaxed">{product.description}</p>

          {product.variants && product.variants.length > 0 && (
            <div className="mb-8">
              <p className="font-display font-bold text-sm uppercase tracking-wide mb-3">
                Size {selectedVariant && <span className="text-graphite font-normal normal-case">— {selectedVariant.size}</span>}
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    disabled={variant.stockQty === 0}
                    className={`px-4 py-2 border text-sm font-medium transition-all
                      ${selectedVariant?.id === variant.id
                        ? 'border-ink bg-ink text-paper'
                        : 'border-hairline hover:border-ink'}
                      ${variant.stockQty === 0 ? 'opacity-30 cursor-not-allowed line-through' : ''}
                    `}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
              {selectedVariant && selectedVariant.stockQty > 0 && selectedVariant.stockQty <= 5 && (
                <p className="text-xs text-accent mt-2">Only {selectedVariant.stockQty} left</p>
              )}
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={adding || !selectedVariant}
            className="w-full bg-ink text-paper font-display font-bold uppercase tracking-wide py-4 hover:bg-accent transition-colors disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}