import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../stripe';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

function CheckoutForm({ orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError('');

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders`,
      },
    });

    if (confirmError) {
      setError(confirmError.message);
      setSubmitting(false);
    }
    // On success, Stripe redirects to return_url automatically
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PaymentElement />
      {error && <p className="text-sm text-accent">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="bg-ink text-paper font-display font-bold uppercase tracking-wide py-4 hover:bg-accent transition-colors disabled:opacity-50"
      >
        {submitting ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

export default function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '',
  });
  const [clientSecret, setClientSecret] = useState(null);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useNewAddress, setUseNewAddress] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    api.get('/addresses').then((addrs) => {
      setSavedAddresses(addrs);
      const defaultAddr = addrs.find((a) => a.defaultAddress);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        applyAddress(defaultAddr);
      } else if (addrs.length === 0) {
        setUseNewAddress(true);
      }
    }).catch(() => setUseNewAddress(true));
  }, [user, authLoading]);

  function applyAddress(addr) {
    setAddress({
      addressLine1: addr.line1,
      addressLine2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
    });
  }

  function selectSavedAddress(id) {
    setSelectedAddressId(id);
    setUseNewAddress(false);
    const addr = savedAddresses.find((a) => a.id === id);
    if (addr) applyAddress(addr);
  }

  function updateField(key, value) {
    setAddress((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setPlacing(true);
    setError('');
    try {
      const result = await api.post('/checkout', { ...address, couponCode: couponCode || undefined });
      setOrder(result.order);
      setClientSecret(result.clientSecret);
    } catch (err) {
      setError(err.message || 'Checkout failed.');
    } finally {
      setPlacing(false);
    }
  }

  if (clientSecret) {
    return (
      <div className="max-w-md mx-auto px-6 py-16">
        <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-2">Payment</h1>
        {order.discountAmount > 0 && (
          <p className="text-sm text-accent mb-2">
            Discount ({order.couponCode}): -${order.discountAmount.toFixed(2)}
          </p>
        )}
        <p className="text-graphite text-sm mb-8">Order total: ${order.total.toFixed(2)}</p>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm orderId={order.id} />
        </Elements>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-8">Shipping</h1>

      {savedAddresses.length > 0 && (
        <div className="mb-6">
          <p className="font-display font-bold text-sm uppercase tracking-wide mb-3">Shipping Address</p>
          <div className="flex flex-col gap-2 mb-3">
            {savedAddresses.map((addr) => (
              <label
                key={addr.id}
                className={`border p-3 text-sm cursor-pointer flex items-start gap-3 ${
                  selectedAddressId === addr.id && !useNewAddress ? 'border-ink' : 'border-hairline'
                }`}
              >
                <input
                  type="radio"
                  checked={selectedAddressId === addr.id && !useNewAddress}
                  onChange={() => selectSavedAddress(addr.id)}
                  className="mt-1"
                />
                <span>
                  <span className="font-semibold">{addr.label || 'Address'}</span>
                  {addr.defaultAddress && (
                    <span className="ml-2 text-[10px] uppercase tracking-wide bg-ink text-paper px-2 py-0.5">Default</span>
                  )}
                  <br />
                  <span className="text-graphite">
                    {addr.line1}, {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                  </span>
                </span>
              </label>
            ))}
            <label className={`border p-3 text-sm cursor-pointer flex items-center gap-3 ${useNewAddress ? 'border-ink' : 'border-hairline'}`}>
              <input
                type="radio"
                checked={useNewAddress}
                onChange={() => {
                  setUseNewAddress(true);
                  setSelectedAddressId('');
                  setAddress({ addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '' });
                }}
              />
              Use a new address
            </label>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="flex flex-col gap-4">
        {(useNewAddress || savedAddresses.length === 0) && (
          <>
            <input
              type="text" placeholder="Address Line 1" required
              value={address.addressLine1}
              onChange={(e) => updateField('addressLine1', e.target.value)}
              className="border border-hairline px-4 py-3 text-sm"
            />
            <input
              type="text" placeholder="Address Line 2 (optional)"
              value={address.addressLine2}
              onChange={(e) => updateField('addressLine2', e.target.value)}
              className="border border-hairline px-4 py-3 text-sm"
            />
            <div className="flex gap-4">
              <input
                type="text" placeholder="City" required
                value={address.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="border border-hairline px-4 py-3 text-sm flex-1"
              />
              <input
                type="text" placeholder="State" required
                value={address.state}
                onChange={(e) => updateField('state', e.target.value)}
                className="border border-hairline px-4 py-3 text-sm flex-1"
              />
            </div>
            <div className="flex gap-4">
              <input
                type="text" placeholder="Postal Code" required
                value={address.postalCode}
                onChange={(e) => updateField('postalCode', e.target.value)}
                className="border border-hairline px-4 py-3 text-sm flex-1"
              />
              <input
                type="text" placeholder="Country" required
                value={address.country}
                onChange={(e) => updateField('country', e.target.value)}
                className="border border-hairline px-4 py-3 text-sm flex-1"
              />
            </div>
          </>
        )}

        {error && <p className="text-sm text-accent">{error}</p>}

        <input
          type="text" placeholder="Discount code (optional)"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          className="border border-hairline px-4 py-3 text-sm"
        />

        <button
          type="submit"
          disabled={placing}
          className="bg-ink text-paper font-display font-bold uppercase tracking-wide py-4 hover:bg-accent transition-colors disabled:opacity-50"
        >
          {placing ? 'Placing Order...' : 'Continue to Payment'}
        </button>
      </form>
    </div>
  );
}