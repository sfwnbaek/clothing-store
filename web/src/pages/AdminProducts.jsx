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

  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', sizeType: 'APPAREL' });
  const [categoryError, setCategoryError] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [variantProductId, setVariantProductId] = useState('');
  const [variants, setVariants] = useState([]);
  const [variantForm, setVariantForm] = useState({ sku: '', size: '', color: '', stockQty: '' });
  const [variantError, setVariantError] = useState('');
  const [savingVariant, setSavingVariant] = useState(false);

  const SIZE_OPTIONS = {
    SHOE: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
    APPAREL: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    ONE_SIZE: ['One Size'],
};

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
}

function cancelEdit() {
  setEditingId(null);
  setForm({ name: '', slug: '', description: '', basePrice: '', brand: '', categoryId: '' });
}

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function getSizeOptionsForProduct(productId) {
  const product = products.find((p) => p.id === productId);
  const category = categories.find((c) => c.id === product?.categoryId);
  const sizeType = category?.sizeType || 'APPAREL';
  return SIZE_OPTIONS[sizeType] || SIZE_OPTIONS.APPAREL;
}

function loadVariants(productId) {
  setVariantProductId(productId);
  if (!productId) {
    setVariants([]);
    return;
  }
  api.get(`/admin/variants/product/${productId}`).then(setVariants).catch(() => setVariants([]));
}

async function handleCreateVariant(e) {
  e.preventDefault();
  setSavingVariant(true);
  setVariantError('');
  try {
    await api.post('/admin/variants', {
      productId: variantProductId,
      sku: variantForm.sku,
      size: variantForm.size,
      color: variantForm.color,
      stockQty: parseInt(variantForm.stockQty),
    });
    setVariantForm({ sku: '', size: '', color: '', stockQty: '' });
    loadVariants(variantProductId);
  } catch (err) {
    setVariantError('Could not create variant. SKU may already be in use.');
  } finally {
    setSavingVariant(false);
  }
}

async function handleDeleteVariant(id) {
  if (!confirm('Delete this variant?')) return;
  await api.delete(`/admin/variants/${id}`);
  loadVariants(variantProductId);
}

async function handleUpdateStock(id, newStock) {
  await api.patch(`/admin/variants/${id}/stock?stockQty=${newStock}`, {});
  loadVariants(variantProductId);
}

  async function handleSubmit(e) {
  e.preventDefault();
  setSaving(true);
  setError('');
  try {
    const payload = { ...form, basePrice: parseFloat(form.basePrice) };
    if (editingId) {
      await api.put(`/admin/products/${editingId}`, payload);
    } else {
      await api.post('/admin/products', payload);
    }
    setForm({ name: '', slug: '', description: '', basePrice: '', brand: '', categoryId: '' });
    setEditingId(null);
    loadProducts();
  } catch (err) {
    setError('Could not save product. Check all fields are valid.');
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
      setCategoryForm({ name: '', slug: '', sizeType: 'APPAREL' });
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

        <form onSubmit={handleCreateCategory} className="grid grid-cols-3 gap-4 mb-6">
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
          <select
            value={categoryForm.sizeType}
            onChange={(e) => setCategoryForm((p) => ({ ...p, sizeType: e.target.value }))}
            className="border border-hairline px-4 py-2 text-sm"
            >
            <option value="APPAREL">Apparel (S/M/L/XL)</option>
            <option value="SHOE">Shoe Sizes</option>
            <option value="ONE_SIZE">One Size</option>
            </select>
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

      <section className="border border-hairline p-6 mb-8">
  <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">Variants</h2>

  <select
    value={variantProductId}
    onChange={(e) => loadVariants(e.target.value)}
    className="border border-hairline px-4 py-2 text-sm mb-4 w-full"
  >
    <option value="">Select a product...</option>
    {products.map((p) => (
      <option key={p.id} value={p.id}>{p.name}</option>
    ))}
  </select>

  {variantProductId && (
    <>
      <div className="flex flex-col gap-2 mb-4">
        {variants.length === 0 && <p className="text-sm text-graphite">No variants yet.</p>}
        {variants.map((v) => (
          <div key={v.id} className="flex items-center justify-between border-b border-hairline py-2 text-sm">
            <span>{v.sku} · {v.size} · {v.color} · Stock: {v.stockQty}</span>
            <div className="flex items-center gap-3">
              <input
                type="number"
                defaultValue={v.stockQty}
                onBlur={(e) => {
                  const newVal = parseInt(e.target.value);
                  if (!isNaN(newVal) && newVal !== v.stockQty) handleUpdateStock(v.id, newVal);
                }}
                className="border border-hairline w-16 px-2 py-1 text-sm"
              />
              <button onClick={() => handleDeleteVariant(v.id)} className="text-graphite hover:text-accent underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleCreateVariant} className="grid grid-cols-2 gap-3">
        <input
          type="text" placeholder="SKU" required
          value={variantForm.sku}
          onChange={(e) => setVariantForm((p) => ({ ...p, sku: e.target.value }))}
          className="border border-hairline px-3 py-2 text-sm"
        />
        <select
          value={variantForm.size}
          onChange={(e) => setVariantForm((p) => ({ ...p, size: e.target.value }))}
          required
          className="border border-hairline px-3 py-2 text-sm"
        >
          <option value="">Select size...</option>
          {getSizeOptionsForProduct(variantProductId).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="text" placeholder="Color"
          value={variantForm.color}
          onChange={(e) => setVariantForm((p) => ({ ...p, color: e.target.value }))}
          className="border border-hairline px-3 py-2 text-sm"
        />
        <input
          type="number" placeholder="Stock Quantity" required
          value={variantForm.stockQty}
          onChange={(e) => setVariantForm((p) => ({ ...p, stockQty: e.target.value }))}
          className="border border-hairline px-3 py-2 text-sm"
        />
        {variantError && <p className="text-sm text-accent col-span-2">{variantError}</p>}
        <button
          type="submit" disabled={savingVariant}
          className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-4 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50 col-span-2"
        >
          {savingVariant ? 'Adding...' : 'Add Variant'}
        </button>
      </form>
    </>
  )}
</section>

      <form onSubmit={handleSubmit} className="border border-hairline p-6 mb-12">
            <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">
                {editingId ? 'Edit Product' : 'Add Product'}
            </h2>
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
            <div className="flex gap-3">
                <button
                type="submit" disabled={saving}
                className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-6 py-3 text-sm hover:bg-accent transition-colors disabled:opacity-50"
                >
                {saving ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
                </button>
                {editingId && (
                <button
                    type="button" onClick={cancelEdit}
                    className="text-sm text-graphite hover:text-ink underline"
                >
                    Cancel
                </button>
                )}
            </div>
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
                    <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files[0] && handleImageUpload(product.id, e.target.files[0])} />
                </label>
                <button onClick={() => startEdit(product)} className="text-sm text-graphite hover:text-ink underline">
                    Edit
                </button>
                <button onClick={() => handleDelete(product.id)} className="text-sm text-graphite hover:text-accent underline">
                    Delete
                </button>
                </div>
            </div>
        ))}
        </div>
    </div>
  );
}