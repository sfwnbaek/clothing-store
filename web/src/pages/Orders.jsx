import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const statusStyles = {
  PAID: 'text-green-700 bg-green-50',
  PENDING: 'text-graphite bg-hairline',
  PAYMENT_FAILED: 'text-accent bg-orange-50',
};

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    api.get('/orders')
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-6 py-12 text-graphite">Loading...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-4">No Orders Yet</h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-8">Your Orders</h1>

      <div className="flex flex-col gap-6">
        {orders.map((order) => (
          <div key={order.id} className="border border-hairline p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-graphite uppercase tracking-wide mb-1">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="font-display font-bold text-sm">Order #{order.id.slice(0, 8)}</p>
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wide px-3 py-1 ${statusStyles[order.status] || 'text-graphite bg-hairline'}`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.productName} · Size {item.size} · Qty {item.quantity}</span>
                  <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-semibold pt-4 border-t border-hairline">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}