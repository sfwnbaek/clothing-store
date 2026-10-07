import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Shield, Package, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [cartItemCount, setCartItemCount] = useState(0);
  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    api.get('/categories').then(setCategories).catch(() => setCategories([]));
    
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function fetchCartCount() {
    if (!user) {
      setCartItemCount(0);
      return;
    }
    api.get('/cart')
      .then(cart => {
        if (cart && cart.items) {
          const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
          setCartItemCount(count);
        }
      })
      .catch(() => setCartItemCount(0));
  }

  useEffect(() => {
    fetchCartCount();
    window.addEventListener('cartUpdated', fetchCartCount);
    return () => window.removeEventListener('cartUpdated', fetchCartCount);
  }, [user]);

  // LIVE SEARCH LOGIC (Crash-proofed)
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    const timer = setTimeout(() => {
      setIsSearching(true);
      api.get(`/products?search=${encodeURIComponent(searchQuery)}`)
        .then(data => {
          // SAFE CHECK: Ensure data is an array before trying to slice it
          const resultsArray = Array.isArray(data) ? data : (data?.content || []);
          setSearchResults(resultsArray.slice(0, 4)); 
        })
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  function handleLogoutClick() {
    setIsDropdownOpen(false);
    setConfirmingLogout(true);
  }

  function confirmLogout() {
    logout();
    setConfirmingLogout(false);
    showToast('Signed out.');
    navigate('/');
  }

  function handleSearchSubmit(e) {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      closeSearch();
    }
  }

  function closeSearch() {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  }

  function toggleSearch() {
    if (isSearchOpen) {
      closeSearch();
    } else {
      setIsSearchOpen(true);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-hairline relative">
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

          <div className="flex items-center gap-5">
            <button 
              onClick={toggleSearch}
              aria-label="Search" 
              className="text-ink hover:text-accent transition-colors mt-1"
            >
              {isSearchOpen ? <X strokeWidth={2} size={22} /> : <Search strokeWidth={2} size={22} />}
            </button>

            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => user ? setIsDropdownOpen(!isDropdownOpen) : navigate('/login')}
                aria-label="Profile"
                className="text-ink hover:text-accent transition-colors mt-1"
              >
                <User strokeWidth={2} size={22} />
              </button>

              {user && isDropdownOpen && (
                <div className="absolute right-0 mt-4 w-48 bg-paper border border-hairline shadow-sm py-2 flex flex-col z-50 animate-fade-in font-display">
                  <div className="px-4 py-2 border-b border-hairline mb-1">
                    <p className="text-xs text-graphite uppercase tracking-wide">Signed in as</p>
                    <p className="text-sm font-bold truncate">{user.email || 'User'}</p>
                  </div>

                  {user.role === 'ADMIN' && (
                    <Link to="/admin" onClick={() => setIsDropdownOpen(false)} className="px-4 py-2 text-sm font-semibold hover:bg-surface flex items-center gap-3 transition-colors">
                      <Shield size={16} /> Admin Panel
                    </Link>
                  )}
                  
                  <Link to="/orders" onClick={() => setIsDropdownOpen(false)} className="px-4 py-2 text-sm font-semibold hover:bg-surface flex items-center gap-3 transition-colors">
                    <Package size={16} /> My Orders
                  </Link>

                  <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="px-4 py-2 text-sm font-semibold hover:bg-surface flex items-center gap-3 transition-colors">
                    <User size={16} /> Profile
                  </Link>
                  
                  <div className="border-t border-hairline mt-1 pt-1">
                    <button onClick={handleLogoutClick} className="w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-surface flex items-center gap-3 transition-colors">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link to="/cart" aria-label="Cart" className="relative text-ink hover:text-accent transition-colors">
              <ShoppingBag strokeWidth={2} size={22} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-paper">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* --- BEAUTIFUL & MINIMALIST LIVE SEARCH BAR --- */}
        {isSearchOpen && (
          <div className="absolute top-16 left-0 w-full bg-paper border-b border-hairline shadow-lg animate-fade-in z-30">
            <div className="max-w-3xl mx-auto px-6 py-6">
              
              {/* Scaled-down Minimalist Input Field */}
              <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-ink pb-2">
                <Search className="text-graphite mr-3" size={20} />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="What are you looking for?" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-base md:text-lg font-display outline-none placeholder:text-hairline focus:ring-0"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-graphite hover:text-ink transition-colors ml-3">
                    <X size={20} />
                  </button>
                )}
              </form>

              {/* Live Search Results Dropdown */}
              {searchQuery.trim().length >= 2 && (
                <div className="mt-6 animate-fade-in">
                  {isSearching ? (
                    <div className="text-xs font-semibold text-graphite uppercase tracking-wide">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      <h3 className="text-[10px] font-bold text-graphite uppercase tracking-wider mb-3">Top Results</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {searchResults.map(product => {
                          // Copied exactly from your ProductCard logic!
                          const imgSrc = product.imageUrls && product.imageUrls.length > 0
                            ? `http://localhost:8080${product.imageUrls[0]}`
                            : null;

                          return (
                            <Link 
                              key={product.id} 
                              to={`/products/${product.slug}`} // <-- Changed to use .slug!
                              onClick={closeSearch}
                              className="flex items-center gap-3 group p-2 rounded hover:bg-surface transition-colors"
                            >
                              {/* Product Thumbnail */}
                              {imgSrc ? (
                                <img 
                                  src={imgSrc} 
                                  alt={product.name} 
                                  className="w-12 h-12 object-cover bg-surface"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-surface flex items-center justify-center text-[9px] text-graphite uppercase text-center leading-none">No<br/>Img</div>
                              )}
                              
                              {/* Product Info */}
                              <div>
                                <p className="font-display font-semibold text-sm group-hover:text-accent transition-colors leading-tight mb-1">
                                  {product.name}
                                </p>
                                <p className="text-xs text-graphite">RM {Number(product.basePrice || 0).toFixed(2)}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                      
                      <button 
                        onClick={handleSearchSubmit}
                        className="mt-4 text-xs font-bold uppercase tracking-wide text-ink hover:text-accent transition-colors flex items-center gap-1"
                      >
                        View all results <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-graphite">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* LOGOUT CONFIRMATION MODAL */}
      {confirmingLogout && (
        <div className="fixed inset-0 z-[200] bg-ink/40 flex items-center justify-center px-6">
          <div className="bg-paper max-w-sm w-full p-6 animate-fade-in">
            <h2 className="font-display font-bold text-lg uppercase tracking-tight mb-2">Sign Out?</h2>
            <p className="text-sm text-graphite mb-6">You'll need to sign in again to view your cart, orders, and profile.</p>
            <div className="flex gap-3">
              <button onClick={confirmLogout} className="flex-1 bg-ink text-paper font-display font-bold uppercase tracking-wide py-3 text-sm hover:bg-accent transition-colors">
                Sign Out
              </button>
              <button onClick={() => setConfirmingLogout(false)} className="flex-1 border border-hairline font-display font-bold uppercase tracking-wide py-3 text-sm hover:border-ink transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}