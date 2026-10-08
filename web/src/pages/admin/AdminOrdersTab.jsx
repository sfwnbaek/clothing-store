import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/format';
import { Package, Calendar, User, Hash } from 'lucide-react';

export default function AdminOrdersTab() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  function loadOrders() {
    setLoading(true);
    api.get('/admin/orders')
      .then((data) => {
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted);
      })
      .catch((err) => {
        console.error('Failed to load orders', err);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }

  async function handleStatusChange(orderId, newStatus) {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      showToast('Order status updated.');
      loadOrders(); 
    } catch (err) {
      showToast('Could not update order status.', 'error');
    }
  }

  // Premium Status Badges
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-emerald-100 text-emerald-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-gray-200 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800'
  };

  if (loading) {
    return <div className="text-graphite text-sm">Loading orders...</div>;
  }

  return (
    <div className="max-w-5xl">
      {/* HEADER - Now perfectly matches the other tabs */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display font-bold text-lg uppercase tracking-wide">Customer Orders</h2>
      </div>
      
      {orders.length === 0 ? (
        <p className="text-sm text-graphite">No orders have been placed yet.</p>
      ) : (
        <div className="flex flex-col gap-8 animate-fade-in">
          {orders.map((order) => (
            <div key={order.id} className="border border-hairline bg-white shadow-sm flex flex-col">
              
              {/* Order Card Header */}
              <div className="bg-surface border-b border-hairline p-5 flex flex-wrap justify-between items-center gap-6">
                
                <div className="flex flex-wrap gap-8">
                  {/* Order ID */}
                  <div>
                    <p className="text-[10px] text-graphite uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Hash size={12} /> Order ID
                    </p>
                    <p className="font-mono font-bold text-ink uppercase tracking-widest">{order.id.slice(0, 8)}</p>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <p className="text-[10px] text-graphite uppercase tracking-wide mb-1 flex items-center gap-1">
                      <User size={12} /> Customer
                    </p>
                    <p className="font-bold text-ink">{order.userEmail || 'Guest Customer'}</p>
                  </div>

                  {/* Date */}
                  <div className="hidden sm:block">
                    <p className="text-[10px] text-graphite uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Calendar size={12} /> Date
                    </p>
                    <p className="text-sm font-medium text-ink">
                      {new Date(order.createdAt).toLocaleDateString('en-MY', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Status & Total */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] text-graphite uppercase tracking-wide mb-1">Total</p>
                    <p className="font-bold text-lg text-ink">{formatPrice(order.total || order.totalAmount)}</p>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <p className="text-[10px] text-graphite uppercase tracking-wide mb-1">Status</p>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full outline-none cursor-pointer text-center appearance-none transition-colors border border-transparent hover:border-gray-300 ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Order Card Body (Items) */}
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-wide mb-4 text-graphite flex items-center gap-2">
                  <Package size={16} /> Items Ordered
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-white border border-hairline p-3 hover:border-graphite transition-colors">
                      {item.imageUrl ? (
                        <img 
                          src={`http://localhost:8080${item.imageUrl}`} 
                          alt="product" 
                          className="w-16 h-16 object-cover bg-surface border border-hairline" 
                        />
                      ) : (
                        <div className="w-16 h-16 bg-surface flex items-center justify-center text-[10px] text-graphite uppercase text-center border border-hairline">
                          No<br/>Img
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-ink truncate">{item.productName}</p>
                        <p className="text-xs text-graphite mt-1">Size: {item.size}</p>
                        <p className="text-xs text-graphite">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold pr-2 text-ink">
                        {formatPrice(item.price || item.unitPrice || item.basePrice || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}