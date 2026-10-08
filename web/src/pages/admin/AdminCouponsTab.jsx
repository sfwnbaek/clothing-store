import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Plus, X, Trash2, Ban, Tag } from 'lucide-react';

export default function AdminCouponsTab() {
  const { showToast } = useToast();
  
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [form, setForm] = useState({ code: '', discountType: 'PERCENTAGE', discountValue: '', maxUses: '' });

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

  function handleOpenPanel() {
    setForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', maxUses: '' });
    setIsPanelOpen(true);
  }

  function closePanel() {
    setIsPanelOpen(false);
    setTimeout(() => {
      setForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', maxUses: '' });
    }, 300);
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
      showToast('Discount code created successfully.');
      closePanel();
      loadCoupons();
    } catch (err) {
      showToast('Could not create coupon. Code may already be in use.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(id) {
    if (!window.confirm('Are you sure you want to deactivate this coupon? Customers will no longer be able to use it.')) return;
    try {
      await api.patch(`/admin/coupons/${id}/deactivate`, {});
      showToast('Coupon deactivated.');
      loadCoupons();
    } catch (err) {
      showToast('Could not deactivate coupon.', 'error');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this coupon permanently?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      showToast('Coupon deleted.');
      loadCoupons();
    } catch (err) {
      showToast('Could not delete coupon.', 'error');
    }
  }

  const inputClass = "w-full border border-gray-300 rounded bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all";

  return (
    <div className="relative">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display font-bold text-lg uppercase tracking-wide">Discount Codes</h2>
        <button
          onClick={handleOpenPanel}
          className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-5 py-2.5 text-sm hover:bg-accent transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Add Coupon
        </button>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-hairline overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface border-b border-hairline">
              <tr>
                <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs">Code</th>
                <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs">Discount</th>
                <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs text-center">Usage</th>
                <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs">Status</th>
                <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-graphite">Loading coupons...</td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-graphite">
                    No discount codes found. Click "Add Coupon" to create one.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-surface border border-hairline rounded text-graphite">
                          <Tag size={16} />
                        </div>
                        <span className="font-mono font-bold text-ink tracking-widest">{coupon.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 font-semibold">
                      {coupon.discountType === 'PERCENTAGE' 
                        ? `${coupon.discountValue}% OFF` 
                        : `RM ${Number(coupon.discountValue).toFixed(2)} OFF`}
                    </td>
                    <td className="px-6 py-3 text-center text-graphite font-mono">
                      {coupon.timesUsed} / {coupon.maxUses || '∞'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wide rounded-full ${
                        coupon.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {coupon.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-3">
                        {coupon.active && (
                          <button onClick={() => handleDeactivate(coupon.id)} className="p-2 text-graphite hover:text-orange-600 bg-surface hover:bg-orange-50 rounded transition-colors" title="Deactivate">
                            <Ban size={16} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(coupon.id)} className="p-2 text-graphite hover:text-accent bg-surface hover:bg-red-50 rounded transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SLIDE-OUT FORM PANEL */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in" onClick={closePanel} />
          
          <div className="relative w-full max-w-sm bg-white shadow-2xl h-full flex flex-col animate-slide-in-right">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-hairline bg-surface">
              <h2 className="font-display font-bold text-lg uppercase tracking-wide">Create Discount Code</h2>
              <button onClick={closePanel} className="text-graphite hover:text-ink transition-colors p-1">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="coupon-form" onSubmit={handleCreate} className="flex flex-col gap-5">
                
                <div>
                  <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">Coupon Code</label>
                  <input
                    type="text" placeholder="e.g. SUMMER20" required
                    value={form.code} 
                    onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                    className={`${inputClass} font-mono uppercase tracking-widest`}
                  />
                  <p className="text-[10px] text-graphite mt-1">No spaces allowed.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">Discount Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value, discountValue: '' }))}
                    className={inputClass}
                  >
                    <option value="PERCENTAGE">Percentage (%) Off</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (RM) Off</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">Discount Value</label>
                  <input
                    type="number" step="0.01" min="0" required
                    placeholder={form.discountType === 'PERCENTAGE' ? 'e.g. 20 (for 20%)' : 'e.g. 15.00 (for RM 15)'}
                    value={form.discountValue}
                    onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">Maximum Uses (Optional)</label>
                  <input
                    type="number" min="1" placeholder="e.g. 100"
                    value={form.maxUses}
                    onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))}
                    className={inputClass}
                  />
                  <p className="text-[10px] text-graphite mt-1">Leave blank for unlimited uses.</p>
                </div>

              </form>
            </div>

            <div className="border-t border-hairline p-6 bg-surface flex gap-3">
              <button type="button" onClick={closePanel} className="flex-1 border border-hairline bg-white font-display font-bold uppercase tracking-wide py-3 text-sm hover:border-graphite transition-colors">
                Cancel
              </button>
              <button form="coupon-form" type="submit" disabled={saving} className="flex-1 bg-ink text-paper font-display font-bold uppercase tracking-wide py-3 text-sm hover:bg-accent transition-colors disabled:opacity-50">
                {saving ? 'Creating...' : 'Save Coupon'}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}