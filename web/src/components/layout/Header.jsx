import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export default function Header() {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  return (
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
              <button onClick={logout} className="hover:text-accent transition-colors">Sign Out</button>
            </>
          ) : (
            <Link to="/login" className="hover:text-accent transition-colors">Sign In</Link>
          )}
          <Link to="/cart" className="hover:text-accent transition-colors">Cart</Link>
        </div>
      </div>
    </header>
  );
}