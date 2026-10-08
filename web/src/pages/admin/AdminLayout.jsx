import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminCategoriesTab from './AdminCategoriesTab';
import AdminProductsTab from './AdminProductsTab';
import AdminVariantsTab from './AdminVariantsTab';
import AdminCouponsTab from './AdminCouponsTab';
import AdminBannersTab from './AdminBannersTab';
import AdminOrdersTab from './AdminOrdersTab'; // <-- 1. Imported the new tab

const TABS = [
  { key: 'orders', label: 'Orders' }, // <-- 2. Added Orders to the menu
  { key: 'products', label: 'Products' },
  { key: 'categories', label: 'Categories' },
  { key: 'variants', label: 'Variants' },
  { key: 'coupons', label: 'Coupons' },
  { key: 'banners', label: 'Banners' },
];

export default function AdminLayout() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Changed the default starting tab to 'orders' since you'll check this most often
  const [activeTab, setActiveTab] = useState('orders'); 

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

      <div className="flex gap-1 border-b border-hairline mb-8 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 font-display font-bold text-sm uppercase tracking-wide transition-colors relative whitespace-nowrap
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

      {/* 3. Added the conditional render for the Orders tab */}
      {activeTab === 'orders' && <AdminOrdersTab />}
      {activeTab === 'products' && <AdminProductsTab />}
      {activeTab === 'categories' && <AdminCategoriesTab />}
      {activeTab === 'variants' && <AdminVariantsTab />}
      {activeTab === 'coupons' && <AdminCouponsTab />}
      {activeTab === 'banners' && <AdminBannersTab />}
    </div>
  );
}