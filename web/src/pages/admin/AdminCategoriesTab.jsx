import { useEffect, useState, useRef } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';

export default function AdminCategoriesTab() {
  const { showToast } = useToast();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', sizeType: 'APPAREL', image: null });
  const fileInputRef = useRef(null);

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

  function handleOpenNewCategory() {
    setEditingId(null);
    setForm({ name: '', slug: '', sizeType: 'APPAREL', image: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsPanelOpen(true);
  }

  function startEdit(cat) {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      sizeType: cat.sizeType,
      image: null // Reset image so it only uploads if they pick a new one
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsPanelOpen(true);
  }

  function closePanel() {
    setIsPanelOpen(false);
    setTimeout(() => {
      setEditingId(null);
      setForm({ name: '', slug: '', sizeType: 'APPAREL', image: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 300);
  }

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setForm(prev => ({ ...prev, image: e.target.files[0] }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const categoryPayload = {
        name: form.name,
        slug: form.slug,
        sizeType: form.sizeType
      };
      
      let categoryId = editingId;

      // Step 1: Update existing or Create new
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, categoryPayload);
      } else {
        const categoryRes = await api.post('/admin/categories', categoryPayload);
        categoryId = categoryRes.id;
      }
      
      // Step 2: Upload the image if a new one was selected
      if (form.image) {
        const formData = new FormData();
        formData.append('file', form.image);
        const token = localStorage.getItem('token');
        
        await fetch(`http://localhost:8080/api/admin/categories/${categoryId}/image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      }

      showToast(editingId ? 'Category updated.' : 'Category created.');
      closePanel();
      loadCategories();
    } catch (err) {
      console.error(err);
      showToast('Could not save category. Slug may already be in use.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this category? Products using it may be affected.')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      loadCategories();
      showToast('Category deleted.');
    } catch (err) {
      showToast('Could not delete category.', 'error');
    }
  }

  const sizeTypeLabel = { SHOE: 'Shoe Sizes', APPAREL: 'Apparel (S/M/L/XL)', ONE_SIZE: 'One Size' };
  const inputClass = "w-full border border-gray-300 rounded bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all";

  return (
    <div className="relative">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display font-bold text-lg uppercase tracking-wide">Category Management</h2>
        <button
          onClick={handleOpenNewCategory}
          className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-5 py-2.5 text-sm hover:bg-accent transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-hairline overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface border-b border-hairline">
              <tr>
                <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs">Category</th>
                <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs">URL Slug</th>
                <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs">Size Type</th>
                <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-graphite">Loading categories...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-graphite">
                    No categories found. Click "Add Category" to create one.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-4">
                        {cat.imageUrl ? (
                          <img
                            src={`http://localhost:8080${cat.imageUrl}`}
                            alt={cat.name}
                            className="w-10 h-10 object-cover bg-surface border border-hairline"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-surface border border-hairline flex items-center justify-center text-[9px] text-graphite uppercase text-center leading-none">
                            No<br/>Img
                          </div>
                        )}
                        <span className="font-bold text-ink">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-graphite">/{cat.slug}</td>
                    <td className="px-6 py-3 text-graphite">{sizeTypeLabel[cat.sizeType] || cat.sizeType}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => startEdit(cat)} className="p-2 text-graphite hover:text-ink bg-surface hover:bg-gray-200 rounded transition-colors" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-2 text-graphite hover:text-accent bg-surface hover:bg-red-50 rounded transition-colors" title="Delete">
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
          <div className="relative w-full max-w-sm bg-white shadow-2xl h-full flex flex-col animate-slide-in-right">
            
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-hairline bg-surface">
              <h2 className="font-display font-bold text-lg uppercase tracking-wide">
                {editingId ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button onClick={closePanel} className="text-graphite hover:text-ink transition-colors p-1">
                <X size={24} />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form id="category-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                <div>
                  <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">Category Name</label>
                  <input
                    type="text" placeholder="e.g. Graphic Tees" required
                    value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">URL Slug</label>
                  <input
                    type="text" placeholder="e.g. graphic-tees" required
                    value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">Size Type</label>
                  <select
                    value={form.sizeType}
                    onChange={(e) => setForm((p) => ({ ...p, sizeType: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="APPAREL">Apparel (S/M/L/XL)</option>
                    <option value="SHOE">Shoe Sizes</option>
                    <option value="ONE_SIZE">One Size Fits All</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">
                    {editingId ? 'Update Image (Optional)' : 'Category Image'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 rounded bg-gray-50 px-3 py-2 text-sm file:mr-4 file:py-1.5 file:px-4 file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wide file:bg-surface file:text-ink hover:file:bg-gray-200 transition-colors focus:outline-none"
                  />
                </div>

              </form>
            </div>

            {/* Panel Footer */}
            <div className="border-t border-hairline p-6 bg-surface flex gap-3">
              <button
                type="button" 
                onClick={closePanel}
                className="flex-1 border border-hairline bg-white font-display font-bold uppercase tracking-wide py-3 text-sm hover:border-graphite transition-colors"
              >
                Cancel
              </button>
              <button
                form="category-form"
                type="submit" 
                disabled={saving}
                className="flex-1 bg-ink text-paper font-display font-bold uppercase tracking-wide py-3 text-sm hover:bg-accent transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Category'}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}