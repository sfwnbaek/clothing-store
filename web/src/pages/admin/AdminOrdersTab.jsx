import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/format';

export default function AdminOrdersTab() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  function loadOrders() {
    setLoading(true);
    // USING YOUR API CLIENT SO YOU ARE PROPERLY AUTHENTICATED
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

  // Updated colors to include PAID
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-emerald-100 text-emerald-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800'
  };

  if (loading) {
    return <div className="text-graphite text-sm">Loading orders...</div>;
  }

  return (
    <div className="max-w-5xl">
      <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-6">Customer Orders</h2>
      
      {orders.length === 0 ? (
        <p className="text-sm text-graphite">No orders have been placed yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-hairline p-6 bg-white">
              
              <div className="flex flex-wrap justify-between items-start mb-4 pb-4 border-b border-hairline gap-4">
                <div>
                  <p className="text-xs text-graphite uppercase tracking-wide mb-1">Order #{order.id.slice(0, 8)}</p>
                  <p className="font-bold">{order.userEmail || 'Guest Customer'}</p>
                  <p className="text-sm text-graphite">
                    {new Date(order.createdAt).toLocaleDateString('en-MY', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-graphite uppercase tracking-wide mb-1">Total</p>
                    <p className="font-bold text-lg">{formatPrice(order.total || order.totalAmount)}</p>
                  </div>
                  
                  <div className="ml-4 flex flex-col items-end">
                    <p className="text-xs text-graphite uppercase tracking-wide mb-1">Status</p>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-sm font-bold uppercase tracking-wide px-3 py-1.5 border-none outline-none cursor-pointer ${statusColors[order.status] || 'bg-surface text-ink'}`}
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

              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-3">Items Ordered</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-surface p-2">
                      {item.imageUrl ? (
                        <img src={`http://localhost:8080${item.imageUrl}`} alt="product" className="w-12 h-12 object-cover bg-paper" />
                      ) : (
                        <div className="w-12 h-12 bg-hairline flex items-center justify-center text-[10px] text-graphite">IMG</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{item.productName}</p>
                        <p className="text-xs text-graphite">Qty: {item.quantity} | Size: {item.size}</p>
                      </div>
                      <p className="text-sm font-semibold pr-2">{formatPrice(item.price || item.unitPrice || item.basePrice || 0)}</p>
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