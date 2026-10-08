import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Plus, X, Pencil, Trash2, ImagePlus } from 'lucide-react';

export default function AdminProductsTab() {
  const { showToast } = useToast();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', basePrice: '', brand: '', categoryId: '' });

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

  function handleOpenNewProduct() {
    setEditingId(null);
    setForm({ name: '', slug: '', description: '', basePrice: '', brand: '', categoryId: '' });
    setIsPanelOpen(true);
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
    setIsPanelOpen(true);
  }

  function closePanel() {
    setIsPanelOpen(false);
    setTimeout(() => {
      setEditingId(null);
      setForm({ name: '', slug: '', description: '', basePrice: '', brand: '', categoryId: '' });
    }, 300); // Wait for slide-out animation to finish before clearing
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
      closePanel();
      loadProducts();
    } catch (err) {
      showToast('Could not save product. Check all fields are valid.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
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

  // Helper to find category name for the table
  const getCategoryName = (id) => {
    return categories.find(c => c.id === id)?.name || '-';
  };

  const inputClass = "w-full border border-gray-300 rounded bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all";

  return (
    <div className="relative">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display font-bold text-lg uppercase tracking-wide">Product Inventory</h2>
        <button
          onClick={handleOpenNewProduct}
          className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-5 py-2.5 text-sm hover:bg-accent transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-hairline overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface border-b border-hairline">
              <tr>
                <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs">Product</th>
                <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs">Brand</th>
                <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs">Category</th>
                <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs">Base Price</th>
                <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-graphite">Loading inventory...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-graphite">
                    No products found. Click "Add Product" to get started.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-4">
                        {product.imageUrls && product.imageUrls.length > 0 ? (
                          <img
                            src={`http://localhost:8080${product.imageUrls[0]}`}
                            alt={product.name}
                            className="w-10 h-10 object-cover bg-surface border border-hairline"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-surface border border-hairline flex items-center justify-center text-[9px] text-graphite uppercase text-center leading-none">
                            No<br/>Img
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-ink">{product.name}</p>
                          <p className="text-xs text-graphite">/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-graphite">{product.brand || '-'}</td>
                    <td className="px-6 py-3 text-graphite">{getCategoryName(product.categoryId)}</td>
                    <td className="px-6 py-3 font-semibold text-ink">RM {Number(product.basePrice).toFixed(2)}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-3">
                        
                        {/* Custom Image Upload Button */}
                        <label className="p-2 text-graphite hover:text-ink bg-surface hover:bg-gray-200 rounded cursor-pointer transition-colors" title="Upload Image">
                          <ImagePlus size={16} />
                          <input
                            type="file" accept="image/*" className="hidden"
                            onChange={(e) => e.target.files[0] && handleImageUpload(product.id, e.target.files[0])}
                          />
                        </label>
                        
                        <button onClick={() => startEdit(product)} className="p-2 text-graphite hover:text-ink bg-surface hover:bg-gray-200 rounded transition-colors" title="Edit">
                          <Pencil size={16} />
                        </button>
                        
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-graphite hover:text-accent bg-surface hover:bg-red-50 rounded transition-colors" title="Delete">
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
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in" 
            onClick={closePanel}
          />
          
          {/* Panel */}
          <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-slide-in-right">
            
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-hairline bg-surface">
              <h2 className="font-display font-bold text-lg uppercase tracking-wide">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={closePanel} className="text-graphite hover:text-ink transition-colors p-1">
                <X size={24} />
              </button>
            </div>

            {/* Panel Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6">
              <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                <div>
                  <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">Product Name</label>
                  <input
                    type="text" placeholder="e.g. Classic High-Top" required
                    value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">URL Slug</label>
                  <input
                    type="text" placeholder="e.g. classic-high-top" required
                    value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">Base Price (RM)</label>
                    <input
                      type="number" step="0.01" placeholder="0.00" required
                      value={form.basePrice} onChange={(e) => setForm((p) => ({ ...p, basePrice: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">Brand</label>
                    <input
                      type="text" placeholder="e.g. Nike"
                      value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">Category</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">Select a category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">Description</label>
                  <textarea
                    placeholder="Write a brief description..."
                    value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    className={inputClass}
                    rows={4}
                  />
                </div>
              </form>
            </div>

            {/* Panel Footer (Sticky) */}
            <div className="border-t border-hairline p-6 bg-surface flex gap-3">
              <button
                type="button" 
                onClick={closePanel}
                className="flex-1 border border-hairline bg-white font-display font-bold uppercase tracking-wide py-3 text-sm hover:border-graphite transition-colors"
              >
                Cancel
              </button>
              <button
                form="product-form"
                type="submit" 
                disabled={saving}
                className="flex-1 bg-ink text-paper font-display font-bold uppercase tracking-wide py-3 text-sm hover:bg-accent transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Product'}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}