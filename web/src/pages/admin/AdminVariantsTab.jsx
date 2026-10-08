import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Plus, X, Trash2, PackageSearch } from 'lucide-react';

const SIZE_OPTIONS = {
  SHOE: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
  APPAREL: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  ONE_SIZE: ['One Size'],
};

export default function AdminVariantsTab() {
  const { showToast } = useToast();
  
  // Data State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [productId, setProductId] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Form State
  const [form, setForm] = useState({ sku: '', size: '', color: '', stockQty: '' });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/products').catch(() => []),
      api.get('/categories').catch(() => [])
    ]).then(([prodData, catData]) => {
      setProducts(prodData);
      setCategories(catData);
      setLoading(false);
    });
  }, []);

  function loadVariants(id) {
    setProductId(id);
    if (!id) {
      setVariants([]);
      return;
    }
    api.get(`/admin/variants/product/${id}`).then(setVariants).catch(() => setVariants([]));
  }

  function getSizeOptions() {
    const product = products.find((p) => p.id === productId);
    const category = categories.find((c) => c.id === product?.categoryId);
    return SIZE_OPTIONS[category?.sizeType] || SIZE_OPTIONS.APPAREL;
  }

  function handleOpenPanel() {
    setForm({ sku: '', size: '', color: '', stockQty: '' });
    setIsPanelOpen(true);
  }

  function closePanel() {
    setIsPanelOpen(false);
    setTimeout(() => setForm({ sku: '', size: '', color: '', stockQty: '' }), 300);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/variants', {
        productId,
        sku: form.sku,
        size: form.size,
        color: form.color,
        stockQty: parseInt(form.stockQty),
      });
      showToast('Variant added.');
      loadVariants(productId);
      closePanel();
    } catch (err) {
      showToast('Could not create variant. SKU may already be in use.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteVariant(id) {
    if (!window.confirm('Are you sure you want to delete this variant?')) return;
    try {
      await api.delete(`/admin/variants/${id}`);
      showToast('Variant deleted.');
      loadVariants(productId);
    } catch (err) {
      showToast('Could not delete variant.', 'error');
    }
  }

  async function handleUpdateStock(id, newStock) {
    try {
      await api.patch(`/admin/variants/${id}/stock?stockQty=${newStock}`, {});
      showToast('Stock updated successfully.');
      loadVariants(productId);
    } catch (err) {
      showToast('Could not update stock.', 'error');
    }
  }

  const inputClass = "w-full border border-gray-300 rounded bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all";

  return (
    <div className="relative">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-lg uppercase tracking-wide">Variant & Stock Management</h2>
        <button
          onClick={handleOpenPanel}
          disabled={!productId}
          className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-5 py-2.5 text-sm hover:bg-accent transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title={!productId ? "Select a product first" : ""}
        >
          <Plus size={18} /> Add Variant
        </button>
      </div>

      {/* PRODUCT SELECTOR */}
      <div className="bg-surface border border-hairline p-5 mb-8 flex items-center gap-4">
        <div className="p-3 bg-white border border-hairline rounded-full text-graphite hidden md:block">
          <PackageSearch size={24} />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">
            Select Product to Manage
          </label>
          <select
            value={productId}
            onChange={(e) => loadVariants(e.target.value)}
            className="w-full border border-gray-300 rounded bg-white px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ink"
          >
            <option value="">-- Choose a product --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DATA TABLE */}
      {productId && (
        <div className="bg-white border border-hairline overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface border-b border-hairline">
                <tr>
                  <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs">SKU</th>
                  <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs">Size</th>
                  <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs">Color</th>
                  <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs">Stock Qty</th>
                  <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {variants.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-graphite">
                      No variants exist for this product yet. Click "Add Variant" to create one.
                    </td>
                  </tr>
                ) : (
                  variants.map((v) => (
                    <tr key={v.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-3 font-mono font-medium text-ink">{v.sku}</td>
                      <td className="px-6 py-3 font-semibold">{v.size}</td>
                      <td className="px-6 py-3 text-graphite">{v.color || '-'}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {/* Quick inline stock editing! */}
                          <input
                            type="number"
                            defaultValue={v.stockQty}
                            onBlur={(e) => {
                              const newVal = parseInt(e.target.value);
                              if (!isNaN(newVal) && newVal !== v.stockQty) handleUpdateStock(v.id, newVal);
                            }}
                            className="w-20 border border-gray-300 rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ink"
                            title="Click to quickly update stock"
                          />
                          {v.stockQty <= 5 && <span className="text-[10px] uppercase font-bold text-accent bg-red-50 px-2 py-1 rounded">Low</span>}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => handleDeleteVariant(v.id)} className="p-2 text-graphite hover:text-accent bg-surface hover:bg-red-50 rounded transition-colors" title="Delete">
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
      )}

      {/* SLIDE-OUT FORM PANEL */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in" onClick={closePanel} />
          
          <div className="relative w-full max-w-sm bg-white shadow-2xl h-full flex flex-col animate-slide-in-right">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-hairline bg-surface">
              <h2 className="font-display font-bold text-lg uppercase tracking-wide">Add New Variant</h2>
              <button onClick={closePanel} className="text-graphite hover:text-ink transition-colors p-1">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="variant-form" onSubmit={handleCreate} className="flex flex-col gap-5">
                
                <div>
                  <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">SKU (Stock Keeping Unit)</label>
                  <input
                    type="text" placeholder="e.g. NIKE-AF1-BLK-10" required
                    value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">Size</label>
                    <select
                      value={form.size} required
                      onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      {getSizeOptions().map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">Color (Optional)</label>
                    <input
                      type="text" placeholder="e.g. Black"
                      value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">Initial Stock Qty</label>
                  <input
                    type="number" placeholder="0" required min="0"
                    value={form.stockQty} onChange={(e) => setForm((p) => ({ ...p, stockQty: e.target.value }))}
                    className={inputClass}
                  />
                  <p className="text-xs text-graphite mt-2">You can easily update this later directly from the table.</p>
                </div>

              </form>
            </div>

            <div className="border-t border-hairline p-6 bg-surface flex gap-3">
              <button type="button" onClick={closePanel} className="flex-1 border border-hairline bg-white font-display font-bold uppercase tracking-wide py-3 text-sm hover:border-graphite transition-colors">
                Cancel
              </button>
              <button form="variant-form" type="submit" disabled={saving} className="flex-1 bg-ink text-paper font-display font-bold uppercase tracking-wide py-3 text-sm hover:bg-accent transition-colors disabled:opacity-50">
                {saving ? 'Adding...' : 'Save Variant'}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}