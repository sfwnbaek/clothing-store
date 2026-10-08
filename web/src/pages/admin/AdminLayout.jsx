import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Tags, LayoutGrid, PackageSearch, Ticket, Image as ImageIcon } from 'lucide-react';

// Tab Components
import AdminOrdersTab from './AdminOrdersTab';
import AdminProductsTab from './AdminProductsTab';
import AdminCategoriesTab from './AdminCategoriesTab';
import AdminVariantsTab from './AdminVariantsTab';
import AdminCouponsTab from './AdminCouponsTab';
import AdminBannersTab from './AdminBannersTab';

// Added Lucide icons to each tab for a premium feel
const TABS = [
  { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'products', label: 'Products', icon: Tags },
  { key: 'categories', label: 'Categories', icon: LayoutGrid },
  { key: 'variants', label: 'Variants', icon: PackageSearch },
  { key: 'coupons', label: 'Coupons', icon: Ticket },
  { key: 'banners', label: 'Banners', icon: ImageIcon },
];

export default function AdminLayout() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('orders'); 

  if (!authLoading && (!user || user.role !== 'ADMIN')) {
    navigate('/');
    return null;
  }

  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 flex justify-center">
        <div className="w-8 h-8 border-2 border-hairline border-t-ink rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in">
      
      {/* Dashboard Header */}
      <div className="mb-10">
        <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-2">Admin Dashboard</h1>
      </div>

      {/* Modern Navigation Tabs with Icons */}
      <div className="flex gap-2 border-b border-hairline mb-8 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 font-display font-bold text-sm uppercase tracking-wide transition-all relative whitespace-nowrap
                ${isActive 
                  ? 'text-ink' 
                  : 'text-graphite hover:text-ink hover:bg-surface/50 rounded-t'
                }
              `}
            >
              <Icon size={16} className={isActive ? 'text-ink' : 'text-graphite'} />
              {tab.label}
              
              {/* Active Underline Indicator */}
              {isActive && (
                <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-ink" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <div className="min-h-[500px]">
        {activeTab === 'orders' && <AdminOrdersTab />}
        {activeTab === 'products' && <AdminProductsTab />}
        {activeTab === 'categories' && <AdminCategoriesTab />}
        {activeTab === 'variants' && <AdminVariantsTab />}
        {activeTab === 'coupons' && <AdminCouponsTab />}
        {activeTab === 'banners' && <AdminBannersTab />}
      </div>
      
    </div>
  );
}