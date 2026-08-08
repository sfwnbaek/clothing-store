import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur border-b border-hairline">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display font-black text-2xl tracking-tight uppercase">
          Stride
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-display font-semibold text-sm uppercase tracking-wide">
          <Link to="/products" className="hover:text-accent transition-colors">Shop</Link>
          <Link to="/products?category=shoes" className="hover:text-accent transition-colors">Shoes</Link>
        </nav>

        <div className="flex items-center gap-6 font-display font-semibold text-sm uppercase tracking-wide">
          {user ? (
            <>
                {user.role === 'ADMIN' && (
            <>
                <Link to="/admin/products" className="hover:text-accent transition-colors">Admin</Link>
                <Link to="/admin/coupons" className="hover:text-accent transition-colors">Coupons</Link>
            </>
            )}
                <Link to="/orders" className="hover:text-accent transition-colors">Orders</Link>
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