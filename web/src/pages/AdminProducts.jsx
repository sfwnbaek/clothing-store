import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AdminProducts() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '', slug: '', description: '', basePrice: '', brand: '', categoryId: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '' });
  const [categoryError, setCategoryError] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    loadProducts();
    loadCategories();
  }, [user, authLoading]);

  function loadProducts() {
    setLoading(true);
    api.get('/products')
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }

  function loadCategories() {
    api.get('/categories').then(setCategories).catch(() => setCategories([]));
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/admin/products', {
        ...form,
        basePrice: parseFloat(form.basePrice),
      });
      setForm({ name: '', slug: '', description: '', basePrice: '', brand: '', categoryId: '' });
      loadProducts();
    } catch (err) {
      setError('Could not create product. Check all fields are valid.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/admin/products/${id}`);
    loadProducts();
  }

  async function handleCreateCategory(e) {
    e.preventDefault();
    setSavingCategory(true);
    setCategoryError('');
    try {
      await api.post('/admin/categories', categoryForm);
      setCategoryForm({ name: '', slug: '' });
      loadCategories();
    } catch (err) {
      setCategoryError('Could not create category. Slug may already be in use.');
    } finally {
      setSavingCategory(false);
    }
  }

  async function handleImageUpload(productId, file) {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:8080/api/admin/products/${productId}/images`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    alert('Image upload failed.');
    return;
  }

  loadProducts();
}

  async function handleDeleteCategory(id) {
    if (!confirm('Delete this category? Products using it may be affected.')) return;
    await api.delete(`/admin/categories/${id}`);
    loadCategories();
  }

  if (authLoading || loading) {
    return <div className="max-w-5xl mx-auto px-6 py-12 text-graphite">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-8">Manage Store</h1>

      <section className="border border-hairline p-6 mb-8">
        <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">Categories</h2>

        <form onSubmit={handleCreateCategory} className="flex gap-4 mb-6">
          <input
            type="text" placeholder="Name" required
            value={categoryForm.name}
            onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))}
            className="border border-hairline px-4 py-2 text-sm flex-1"
          />
          <input
            type="text" placeholder="Slug" required
            value={categoryForm.slug}
            onChange={(e) => setCategoryForm((p) => ({ ...p, slug: e.target.value }))}
            className="border border-hairline px-4 py-2 text-sm flex-1"
          />
          <button
            type="submit" disabled={savingCategory}
            className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-6 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {savingCategory ? 'Adding...' : 'Add Category'}
          </button>
        </form>
        {categoryError && <p className="text-sm text-accent mb-4">{categoryError}</p>}

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 border border-hairline px-3 py-1 text-sm">
              <span>{cat.name}</span>
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="text-graphite hover:text-accent"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </section>

      <form onSubmit={handleCreate} className="border border-hairline p-6 mb-12">
        <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">Add Product</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text" placeholder="Name" required
            value={form.name} onChange={(e) => updateField('name', e.target.value)}
            className="border border-hairline px-4 py-2 text-sm"
          />
          <input
            type="text" placeholder="Slug (url-friendly)" required
            value={form.slug} onChange={(e) => updateField('slug', e.target.value)}
            className="border border-hairline px-4 py-2 text-sm"
          />
          <input
            type="number" step="0.01" placeholder="Base Price" required
            value={form.basePrice} onChange={(e) => updateField('basePrice', e.target.value)}
            className="border border-hairline px-4 py-2 text-sm"
          />
          <input
            type="text" placeholder="Brand"
            value={form.brand} onChange={(e) => updateField('brand', e.target.value)}
            className="border border-hairline px-4 py-2 text-sm"
          />
          <select
            value={form.categoryId}
            onChange={(e) => updateField('categoryId', e.target.value)}
            className="border border-hairline px-4 py-2 text-sm col-span-2"
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <textarea
            placeholder="Description"
            value={form.description} onChange={(e) => updateField('description', e.target.value)}
            className="border border-hairline px-4 py-2 text-sm col-span-2"
            rows={3}
          />
        </div>
        {error && <p className="text-sm text-accent mb-4">{error}</p>}
        <button
          type="submit" disabled={saving}
          className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-6 py-3 text-sm hover:bg-accent transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Add Product'}
        </button>
      </form>

      <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">All Products</h2>
      <div className="flex flex-col gap-2">
        {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between border-b border-hairline py-3">
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
                <label className="text-sm text-graphite hover:text-ink underline cursor-pointer">
                Upload Image
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                    if (e.target.files[0]) {
                        handleImageUpload(product.id, e.target.files[0]);
                    }
                    }}
                />
                </label>
                <button
                onClick={() => handleDelete(product.id)}
                className="text-sm text-graphite hover:text-accent underline"
                >
                Delete
                </button>
            </div>
            </div>
        ))}
        </div>
    </div>
  );
}