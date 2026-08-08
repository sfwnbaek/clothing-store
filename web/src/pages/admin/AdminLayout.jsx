import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminCategoriesTab from './AdminCategoriesTab';
import AdminProductsTab from './AdminProductsTab';
import AdminVariantsTab from './AdminVariantsTab';
import AdminCouponsTab from './AdminCouponsTab';

const TABS = [
  { key: 'products', label: 'Products' },
  { key: 'categories', label: 'Categories' },
  { key: 'variants', label: 'Variants' },
  { key: 'coupons', label: 'Coupons' },
];

export default function AdminLayout() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');

  if (!authLoading && (!user || user.role !== 'ADMIN')) {
    navigate('/');
    return null;
  }

  if (authLoading) {
    return <div className="max-w-6xl mx-auto px-6 py-12 text-graphite">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-8">Manage Store</h1>

      <div className="flex gap-1 border-b border-hairline mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 font-display font-bold text-sm uppercase tracking-wide transition-colors relative
              ${activeTab === tab.key ? 'text-ink' : 'text-graphite hover:text-ink'}
            `}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'products' && <AdminProductsTab />}
      {activeTab === 'categories' && <AdminCategoriesTab />}
      {activeTab === 'variants' && <AdminVariantsTab />}
      {activeTab === 'coupons' && <AdminCouponsTab />}
    </div>
  );
}