import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function AdminProductsTab() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', slug: '', description: '', basePrice: '', brand: '', categoryId: '' });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
    api.get('/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  function loadProducts() {
    setLoading(true);
    api.get('/products')
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      basePrice: product.basePrice.toString(),
      brand: product.brand || '',
      categoryId: product.categoryId || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: '', slug: '', description: '', basePrice: '', brand: '', categoryId: '' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, basePrice: parseFloat(form.basePrice) };
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
        showToast('Product updated.');
      } else {
        await api.post('/admin/products', payload);
        showToast('Product created.');
      }
      cancelEdit();
      loadProducts();
    } catch (err) {
      showToast('Could not save product. Check all fields are valid.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      loadProducts();
      showToast('Product deleted.');
    } catch (err) {
      showToast('Could not delete product.', 'error');
    }
  }

  async function handleImageUpload(productId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:8080/api/admin/products/${productId}/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error();
      loadProducts();
      showToast('Image uploaded.');
    } catch (err) {
      showToast('Image upload failed.', 'error');
    }
  }

  const inputClass = "border border-hairline px-4 py-2 text-sm focus:outline-none focus:border-ink transition-colors";

  return (
    <div>
      <form onSubmit={handleSubmit} className="border border-hairline p-6 mb-10 max-w-3xl">
        <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">
          {editingId ? 'Edit Product' : 'Add Product'}
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text" placeholder="Name" required
            value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className={inputClass}
          />
          <input
            type="text" placeholder="Slug (url-friendly)" required
            value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            className={inputClass}
          />
          <input
            type="number" step="0.01" placeholder="Base Price" required
            value={form.basePrice} onChange={(e) => setForm((p) => ({ ...p, basePrice: e.target.value }))}
            className={inputClass}
          />
          <input
            type="text" placeholder="Brand"
            value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
            className={inputClass}
          />
          <select
            value={form.categoryId}
            onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
            className={`${inputClass} col-span-2`}
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <textarea
            placeholder="Description"
            value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className={`${inputClass} col-span-2`}
            rows={3}
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit" disabled={saving}
            className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-6 py-2.5 text-sm hover:bg-accent transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="text-sm text-graphite hover:text-ink underline">
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">All Products</h2>
      {loading ? (
        <p className="text-sm text-graphite">Loading...</p>
      ) : (
        <div className="flex flex-col">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between border-b border-hairline py-3 hover:bg-hairline/30 transition-colors px-2 -mx-2"
            >
              <div className="flex items-center gap-4">
                {product.imageUrls && product.imageUrls.length > 0 ? (
                  <img
                    src={`http://localhost:8080${product.imageUrls[0]}`}
                    alt={product.name}
                    className="w-12 h-12 object-cover bg-hairline"
                  />
                ) : (
                  <div className="w-12 h-12 bg-hairline flex items-center justify-center text-[10px] text-graphite">
                    No image
                  </div>
                )}
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-graphite">{product.slug} · ${product.basePrice.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="text-sm text-graphite hover:text-ink underline cursor-pointer transition-colors">
                  Upload Image
                  <input
                    type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files[0] && handleImageUpload(product.id, e.target.files[0])}
                  />
                </label>
                <button onClick={() => startEdit(product)} className="text-sm text-graphite hover:text-ink underline transition-colors">
                  Edit
                </button>
                <button onClick={() => handleDelete(product.id)} className="text-sm text-graphite hover:text-accent underline transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}