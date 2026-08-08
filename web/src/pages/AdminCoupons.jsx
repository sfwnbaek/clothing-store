import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AdminCoupons() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: '', discountType: 'PERCENTAGE', discountValue: '', maxUses: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    loadCoupons();
  }, [user, authLoading]);

  function loadCoupons() {
    setLoading(true);
    api.get('/admin/coupons')
      .then(setCoupons)
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/admin/coupons', {
        code: form.code,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      });
      setForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', maxUses: '' });
      loadCoupons();
    } catch (err) {
      setError('Could not create coupon. Code may already be in use.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(id) {
    await api.patch(`/admin/coupons/${id}/deactivate`, {});
    loadCoupons();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this coupon permanently?')) return;
    await api.delete(`/admin/coupons/${id}`);
    loadCoupons();
  }

  if (authLoading || loading) {
    return <div className="max-w-4xl mx-auto px-6 py-12 text-graphite">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-8">Discount Codes</h1>

      <form onSubmit={handleCreate} className="border border-hairline p-6 mb-12">
        <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">Create Code</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text" placeholder="Code (e.g. SAVE20)" required
            value={form.code}
            onChange={(e) => updateField('code', e.target.value.toUpperCase())}
            className="border border-hairline px-4 py-2 text-sm"
          />
          <select
            value={form.discountType}
            onChange={(e) => updateField('discountType', e.target.value)}
            className="border border-hairline px-4 py-2 text-sm"
          >
            <option value="PERCENTAGE">Percentage Off</option>
            <option value="FIXED_AMOUNT">Fixed Amount Off</option>
          </select>
          <input
            type="number" step="0.01"
            placeholder={form.discountType === 'PERCENTAGE' ? 'e.g. 20 (for 20%)' : 'e.g. 10 (for $10)'}
            required
            value={form.discountValue}
            onChange={(e) => updateField('discountValue', e.target.value)}
            className="border border-hairline px-4 py-2 text-sm"
          />
          <input
            type="number" placeholder="Max uses (optional)"
            value={form.maxUses}
            onChange={(e) => updateField('maxUses', e.target.value)}
            className="border border-hairline px-4 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-accent mb-4">{error}</p>}
        <button
          type="submit" disabled={saving}
          className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-6 py-3 text-sm hover:bg-accent transition-colors disabled:opacity-50"
        >
          {saving ? 'Creating...' : 'Create Code'}
        </button>
      </form>

      <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">All Codes</h2>
      <div className="flex flex-col gap-2">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="flex items-center justify-between border-b border-hairline py-3">
            <div>
              <p className="font-mono font-bold">{coupon.code}</p>
              <p className="text-xs text-graphite">
                {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% off` : `$${coupon.discountValue} off`}
                {' · '}{coupon.timesUsed} used{coupon.maxUses ? ` / ${coupon.maxUses} max` : ''}
                {!coupon.active && ' · Inactive'}
              </p>
            </div>
            <div className="flex gap-4">
              {coupon.active && (
                <button onClick={() => handleDeactivate(coupon.id)} className="text-sm text-graphite hover:text-ink underline">
                  Deactivate
                </button>
              )}
              <button onClick={() => handleDelete(coupon.id)} className="text-sm text-graphite hover:text-accent underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}