import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // wait until we know if the user is actually logged in
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
    const updated = await api.patch(`/cart/items/${itemId}`, { quantity });
    setCart(updated);
  }

  async function removeItem(itemId) {
    const updated = await api.delete(`/cart/items/${itemId}`);
    setCart(updated);
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto px-6 py-12 text-graphite">Loading...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-4">Your Cart is Empty</h1>
        <Link to="/products" className="text-accent font-semibold underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-8">Your Cart</h1>

      <div className="flex flex-col gap-6 mb-8">
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center gap-6 border-b border-hairline pb-6">
            <div className="flex-1">
              <p className="font-display font-bold">{item.productName}</p>
              <p className="text-sm text-graphite">Size {item.size} · {item.color}</p>
              <p className="text-sm font-semibold mt-1">${item.price.toFixed(2)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-8 h-8 border border-hairline hover:border-ink"
              >
                −
              </button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 border border-hairline hover:border-ink"
              >
                +
              </button>
            </div>

            <button
              onClick={() => removeItem(item.id)}
              className="text-sm text-graphite hover:text-accent underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-8">
        <span className="font-display font-bold text-lg uppercase">Subtotal</span>
        <span className="font-semibold text-lg">${subtotal.toFixed(2)}</span>
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