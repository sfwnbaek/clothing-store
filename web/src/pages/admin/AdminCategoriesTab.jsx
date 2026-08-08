import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function AdminCategoriesTab() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', slug: '', sizeType: 'APPAREL' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  function loadCategories() {
    setLoading(true);
    api.get('/categories')
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/categories', form);
      setForm({ name: '', slug: '', sizeType: 'APPAREL' });
      loadCategories();
      showToast('Category created.');
    } catch (err) {
      showToast('Could not create category. Slug may already be in use.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category? Products using it may be affected.')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      loadCategories();
      showToast('Category deleted.');
    } catch (err) {
      showToast('Could not delete category.', 'error');
    }
  }

  const sizeTypeLabel = { SHOE: 'Shoe Sizes', APPAREL: 'Apparel (S/M/L)', ONE_SIZE: 'One Size' };

  if (loading) {
    return <div className="text-graphite text-sm">Loading categories...</div>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.length === 0 && <p className="text-sm text-graphite">No categories yet.</p>}
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="group flex items-center gap-2 border border-hairline px-3 py-2 text-sm hover:border-ink transition-colors"
          >
            <div>
              <span className="font-medium">{cat.name}</span>
              <span className="text-graphite text-xs ml-2">{sizeTypeLabel[cat.sizeType] || cat.sizeType}</span>
            </div>
            <button
              onClick={() => handleDelete(cat.id)}
              className="text-graphite hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Delete category"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleCreate} className="border border-hairline p-6 max-w-2xl">
        <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">Add Category</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <input
            type="text" placeholder="Name" required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="border border-hairline px-4 py-2 text-sm focus:outline-none focus:border-ink transition-colors"
          />
          <input
            type="text" placeholder="Slug" required
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            className="border border-hairline px-4 py-2 text-sm focus:outline-none focus:border-ink transition-colors"
          />
          <select
            value={form.sizeType}
            onChange={(e) => setForm((p) => ({ ...p, sizeType: e.target.value }))}
            className="border border-hairline px-4 py-2 text-sm focus:outline-none focus:border-ink transition-colors"
          >
            <option value="APPAREL">Apparel (S/M/L/XL)</option>
            <option value="SHOE">Shoe Sizes</option>
            <option value="ONE_SIZE">One Size</option>
          </select>
        </div>
        <button
          type="submit" disabled={saving}
          className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-6 py-2.5 text-sm hover:bg-accent transition-colors disabled:opacity-50"
        >
          {saving ? 'Adding...' : 'Add Category'}
        </button>
      </form>
    </div>
  );
}