import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function AdminCouponsTab() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: '', discountType: 'PERCENTAGE', discountValue: '', maxUses: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  function loadCoupons() {
    setLoading(true);
    api.get('/admin/coupons')
      .then(setCoupons)
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/coupons', {
        code: form.code,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      });
      setForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', maxUses: '' });
      loadCoupons();
      showToast('Discount code created.');
    } catch (err) {
      showToast('Could not create coupon. Code may already be in use.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(id) {
    try {
      await api.patch(`/admin/coupons/${id}/deactivate`, {});
      loadCoupons();
      showToast('Coupon deactivated.');
    } catch (err) {
      showToast('Could not deactivate coupon.', 'error');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this coupon permanently?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      loadCoupons();
      showToast('Coupon deleted.');
    } catch (err) {
      showToast('Could not delete coupon.', 'error');
    }
  }

  const inputClass = "border border-hairline px-4 py-2 text-sm focus:outline-none focus:border-ink transition-colors";

  if (loading) {
    return <div className="text-graphite text-sm">Loading coupons...</div>;
  }

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleCreate} className="border border-hairline p-6 mb-10">
        <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">Create Code</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text" placeholder="Code (e.g. SAVE20)" required
            value={form.code}
            onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
            className={inputClass}
          />
          <select
            value={form.discountType}
            onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value }))}
            className={inputClass}
          >
            <option value="PERCENTAGE">Percentage Off</option>
            <option value="FIXED_AMOUNT">Fixed Amount Off</option>
          </select>
          <input
            type="number" step="0.01"
            placeholder={form.discountType === 'PERCENTAGE' ? 'e.g. 20 (for 20%)' : 'e.g. 10 (for $10)'}
            required
            value={form.discountValue}
            onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))}
            className={inputClass}
          />
          <input
            type="number" placeholder="Max uses (optional)"
            value={form.maxUses}
            onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))}
            className={inputClass}
          />
        </div>
        <button
          type="submit" disabled={saving}
          className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-6 py-2.5 text-sm hover:bg-accent transition-colors disabled:opacity-50"
        >
          {saving ? 'Creating...' : 'Create Code'}
        </button>
      </form>

      <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">All Codes</h2>
      <div className="flex flex-col">
        {coupons.length === 0 && <p className="text-sm text-graphite">No discount codes yet.</p>}
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="flex items-center justify-between border-b border-hairline py-3 hover:bg-hairline/30 transition-colors px-2 -mx-2"
          >
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
                <button onClick={() => handleDeactivate(coupon.id)} className="text-sm text-graphite hover:text-ink underline transition-colors">
                  Deactivate
                </button>
              )}
              <button onClick={() => handleDelete(coupon.id)} className="text-sm text-graphite hover:text-accent underline transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}