import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../stripe';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/format';

// 1. Pass the 'order' object into this form so we have its ID
function CheckoutForm({ order }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError('');

    // 2. Prevent the automatic Stripe redirect so we can handle success manually
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', 
    });

    if (confirmError) {
      setError(confirmError.message);
      setSubmitting(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      
      // 3. Payment worked! Tell our Spring Boot backend to change status from PENDING to PROCESSING
      try {
        await api.post(`/orders/${order.id}/confirm-payment`);
        
        // Let the Header know the cart is now empty
        window.dispatchEvent(new Event('cartUpdated')); 
        
        showToast('Payment successful!');
        navigate('/orders'); // Redirect the user to their orders page
      } catch (err) {
        setError('Payment succeeded, but failed to update order status.');
        setSubmitting(false);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PaymentElement />
      {error && <p className="text-sm text-accent">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="bg-ink text-paper font-display font-bold uppercase tracking-wide py-4 hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting && (
          <span className="w-4 h-4 border-2 border-paper/40 border-t-paper rounded-full animate-spin" />
        )}
        {submitting ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

export default function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '',
  });
  const [clientSecret, setClientSecret] = useState(null);
  const [order, setOrder] = useState(null);
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
    try {
      const result = await api.post('/checkout', { ...address, couponCode: couponCode || undefined });
      setOrder(result.order);
      setClientSecret(result.clientSecret);
    } catch (err) {
      showToast(err.message || 'Checkout failed.', 'error');
    } finally {
      setPlacing(false);
    }
  }

  const inputClass = "border border-hairline px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors";

  if (clientSecret) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 animate-fade-in">
        <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-4">Payment</h1>

        <div className="border border-hairline p-4 mb-8 text-sm flex flex-col gap-1">
          <div className="flex justify-between text-graphite">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-accent">
              <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
              <span>-{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-graphite">
            <span>Shipping</span>
            <span>{formatPrice(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between text-graphite">
            <span>Tax</span>
            <span>{formatPrice(order.tax)}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 mt-1 border-t border-hairline">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          {/* 4. Pass the order down into the form */}
          <CheckoutForm order={order} /> 
        </Elements>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16 animate-fade-in">
      <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-8">Shipping</h1>

      {savedAddresses.length > 0 && (
        <div className="mb-6">
          <p className="font-display font-bold text-sm uppercase tracking-wide mb-3">Shipping Address</p>
          <div className="flex flex-col gap-2 mb-3">
            {savedAddresses.map((addr) => (
              <label
                key={addr.id}
                className={`border p-3 text-sm cursor-pointer flex items-start gap-3 transition-colors ${
                  selectedAddressId === addr.id && !useNewAddress ? 'border-ink' : 'border-hairline hover:border-graphite'
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
            <label className={`border p-3 text-sm cursor-pointer flex items-center gap-3 transition-colors ${
              useNewAddress ? 'border-ink' : 'border-hairline hover:border-graphite'
            }`}>
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
              className={inputClass}
            />
            <input
              type="text" placeholder="Address Line 2 (optional)"
              value={address.addressLine2}
              onChange={(e) => updateField('addressLine2', e.target.value)}
              className={inputClass}
            />
            <div className="flex gap-4">
              <input
                type="text" placeholder="City" required
                value={address.city}
                onChange={(e) => updateField('city', e.target.value)}
                className={`${inputClass} flex-1`}
              />
              <input
                type="text" placeholder="State" required
                value={address.state}
                onChange={(e) => updateField('state', e.target.value)}
                className={`${inputClass} flex-1`}
              />
            </div>
            <div className="flex gap-4">
              <input
                type="text" placeholder="Postal Code" required
                value={address.postalCode}
                onChange={(e) => updateField('postalCode', e.target.value)}
                className={`${inputClass} flex-1`}
              />
              <input
                type="text" placeholder="Country" required
                value={address.country}
                onChange={(e) => updateField('country', e.target.value)}
                className={`${inputClass} flex-1`}
              />
            </div>
          </>
        )}

        <input
          type="text" placeholder="Discount code (optional)"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          className={inputClass}
        />

        <button
          type="submit"
          disabled={placing}
          className="bg-ink text-paper font-display font-bold uppercase tracking-wide py-4 hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {placing && (
            <span className="w-4 h-4 border-2 border-paper/40 border-t-paper rounded-full animate-spin" />
          )}
          {placing ? 'Placing Order...' : 'Continue to Payment'}
        </button>
      </form>
    </div>
  );
}