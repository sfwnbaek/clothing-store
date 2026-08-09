import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  useEffect(() => {
    api.get('/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  function handleLogoutClick() {
    setConfirmingLogout(true);
  }

  function confirmLogout() {
    logout();
    setConfirmingLogout(false);
    showToast('Signed out.');
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur border-b border-hairline">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display font-black text-2xl tracking-tight uppercase">
            Stride
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-display font-semibold text-sm uppercase tracking-wide">
            <Link to="/products" className="hover:text-accent transition-colors">Shop All</Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="hover:text-accent transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6 font-display font-semibold text-sm uppercase tracking-wide">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="hover:text-accent transition-colors">Admin</Link>
                )}
                <Link to="/orders" className="hover:text-accent transition-colors">Orders</Link>
                <Link to="/profile" className="hover:text-accent transition-colors">Profile</Link>
                <Link to="/cart" className="hover:text-accent transition-colors">Cart</Link>
                <button onClick={handleLogoutClick} className="text-graphite hover:text-accent transition-colors">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-accent transition-colors">Sign In</Link>
                <Link to="/cart" className="hover:text-accent transition-colors">Cart</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {confirmingLogout && (
        <div className="fixed inset-0 z-[200] bg-ink/40 flex items-center justify-center px-6">
          <div className="bg-paper max-w-sm w-full p-6 animate-fade-in">
            <h2 className="font-display font-bold text-lg uppercase tracking-tight mb-2">Sign Out?</h2>
            <p className="text-sm text-graphite mb-6">You'll need to sign in again to view your cart, orders, and profile.</p>
            <div className="flex gap-3">
              <button
                onClick={confirmLogout}
                className="flex-1 bg-ink text-paper font-display font-bold uppercase tracking-wide py-3 text-sm hover:bg-accent transition-colors"
              >
                Sign Out
              </button>
              <button
                onClick={() => setConfirmingLogout(false)}
                className="flex-1 border border-hairline font-display font-bold uppercase tracking-wide py-3 text-sm hover:border-ink transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}