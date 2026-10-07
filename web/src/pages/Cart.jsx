import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/format';

export default function Cart() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    loadCart();
  }, [user, authLoading]);

  function loadCart() {
    setLoading(true);
    api.get('/cart')
      .then(setCart)
      .catch(() => setCart(null))
      .finally(() => setLoading(false));
  }

  async function updateQuantity(itemId, quantity) {
    if (quantity < 1) return;
    setUpdatingId(itemId);
    try {
      const updated = await api.patch(`/cart/items/${itemId}`, { quantity });
      setCart(updated);
      window.dispatchEvent(new Event('cartUpdated')); // Broadcast change
    } catch (err) {
      showToast('Could not update quantity.', 'error');
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeItem(itemId) {
    setUpdatingId(itemId);
    try {
      const updated = await api.delete(`/cart/items/${itemId}`);
      setCart(updated);
      showToast('Item removed.');
      window.dispatchEvent(new Event('cartUpdated')); // Broadcast change
    } catch (err) {
      showToast('Could not remove item.', 'error');
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-pulse">
        <div className="h-8 bg-hairline w-1/3 mb-8" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 bg-hairline mb-4" />
        ))}
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center animate-fade-in">
        <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-4">Your Cart is Empty</h1>
        <p className="text-graphite text-sm mb-6">Looks like you haven't added anything yet.</p>
        <Link
          to="/products"
          className="inline-block bg-ink text-paper font-display font-bold uppercase tracking-wide px-8 py-3 hover:bg-accent transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-1">Your Cart</h1>
      <p className="text-graphite text-sm mb-8">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>

      <div className="flex flex-col gap-6 mb-8">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-6 border-b border-hairline pb-6 transition-opacity ${
              updatingId === item.id ? 'opacity-50' : 'opacity-100'
            }`}
          >
            <div className="flex-1">
              <p className="font-display font-bold">{item.productName}</p>
              <p className="text-sm text-graphite">Size {item.size} · {item.color}</p>
              <p className="text-sm font-semibold mt-1">{formatPrice(item.price)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={updatingId === item.id}
                className="w-8 h-8 border border-hairline hover:border-ink transition-colors disabled:opacity-50"
              >
                −
              </button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={updatingId === item.id}
                className="w-8 h-8 border border-hairline hover:border-ink transition-colors disabled:opacity-50"
              >
                +
              </button>
            </div>

            <button
              onClick={() => removeItem(item.id)}
              disabled={updatingId === item.id}
              className="text-sm text-graphite hover:text-accent underline transition-colors"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-8">
        <span className="font-display font-bold text-lg uppercase">Subtotal</span>
        <span className="font-semibold text-lg">{formatPrice(subtotal)}</span>
      </div>

      <Link
        to="/checkout"
        className="block text-center bg-ink text-paper font-display font-bold uppercase tracking-wide py-4 hover:bg-accent transition-colors"
      >
        Checkout
      </Link>
    </div>
  );
}