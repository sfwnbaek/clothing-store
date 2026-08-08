import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

const SIZE_OPTIONS = {
  SHOE: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
  APPAREL: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  ONE_SIZE: ['One Size'],
};

export default function AdminVariantsTab() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productId, setProductId] = useState('');
  const [variants, setVariants] = useState([]);
  const [form, setForm] = useState({ sku: '', size: '', color: '', stockQty: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/products').then(setProducts).catch(() => setProducts([]));
    api.get('/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  function loadVariants(id) {
    setProductId(id);
    setForm({ sku: '', size: '', color: '', stockQty: '' });
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
      setForm({ sku: '', size: '', color: '', stockQty: '' });
      loadVariants(productId);
      showToast('Variant added.');
    } catch (err) {
      showToast('Could not create variant. SKU may already be in use.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteVariant(id) {
    if (!confirm('Delete this variant?')) return;
    try {
      await api.delete(`/admin/variants/${id}`);
      loadVariants(productId);
      showToast('Variant deleted.');
    } catch (err) {
      showToast('Could not delete variant.', 'error');
    }
  }

  async function handleUpdateStock(id, newStock) {
    try {
      await api.patch(`/admin/variants/${id}/stock?stockQty=${newStock}`, {});
      loadVariants(productId);
      showToast('Stock updated.');
    } catch (err) {
      showToast('Could not update stock.', 'error');
    }
  }

  const inputClass = "border border-hairline px-3 py-2 text-sm focus:outline-none focus:border-ink transition-colors";

  return (
    <div className="max-w-2xl">
      <select
        value={productId}
        onChange={(e) => loadVariants(e.target.value)}
        className={`${inputClass} w-full mb-6`}
      >
        <option value="">Select a product to manage variants...</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {productId && (
        <>
          <div className="flex flex-col mb-6">
            {variants.length === 0 && <p className="text-sm text-graphite mb-4">No variants yet for this product.</p>}
            {variants.map((v) => (
              <div key={v.id} className="flex items-center justify-between border-b border-hairline py-3 text-sm">
                <span>
                  <span className="font-mono font-medium">{v.sku}</span>
                  <span className="text-graphite"> · {v.size} · {v.color}</span>
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    defaultValue={v.stockQty}
                    onBlur={(e) => {
                      const newVal = parseInt(e.target.value);
                      if (!isNaN(newVal) && newVal !== v.stockQty) handleUpdateStock(v.id, newVal);
                    }}
                    className="border border-hairline w-16 px-2 py-1 text-sm focus:outline-none focus:border-ink transition-colors"
                  />
                  <button onClick={() => handleDeleteVariant(v.id)} className="text-graphite hover:text-accent underline transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleCreate} className="border border-hairline p-6">
            <h3 className="font-display font-bold text-sm uppercase tracking-wide mb-4">Add Variant</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input
                type="text" placeholder="SKU" required
                value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                className={inputClass}
              />
              <select
                value={form.size} required
                onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select size...</option>
                {getSizeOptions().map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input
                type="text" placeholder="Color"
                value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                className={inputClass}
              />
              <input
                type="number" placeholder="Stock Quantity" required
                value={form.stockQty} onChange={(e) => setForm((p) => ({ ...p, stockQty: e.target.value }))}
                className={inputClass}
              />
            </div>
            <button
              type="submit" disabled={saving}
              className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-6 py-2.5 text-sm hover:bg-accent transition-colors disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Variant'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}