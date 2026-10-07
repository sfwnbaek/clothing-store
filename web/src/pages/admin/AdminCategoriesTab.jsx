import { useEffect, useState, useRef } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function AdminCategoriesTab() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({ name: '', slug: '', sizeType: 'APPAREL', image: null });
  const [editingId, setEditingId] = useState(null); // Tracks which category we are editing
  const [saving, setSaving] = useState(false);
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

      // Step 1: Either Update existing or Create new
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, categoryPayload);
      } else {
        const categoryRes = await api.post('/admin/categories', categoryPayload);
        categoryId = categoryRes.id; // Get the new ID so we can attach the image to it
      }
      
      // Step 2: Upload the image if a new one was selected
      if (form.image) {
        const formData = new FormData();
        formData.append('file', form.image);
        
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:8080/api/admin/categories/${categoryId}/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      }

      showToast(editingId ? 'Category updated successfully.' : 'Category created successfully.');
      cancelEdit();
      loadCategories();
    } catch (err) {
      console.error(err);
      showToast('Could not save category. Slug may already be in use.', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleEditClick(cat) {
    setForm({
      name: cat.name,
      slug: cat.slug,
      sizeType: cat.sizeType,
      image: null // Reset image input so they only upload if they want to change it
    });
    setEditingId(cat.id);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Smooth scroll to the form
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  function cancelEdit() {
    setForm({ name: '', slug: '', sizeType: 'APPAREL', image: null });
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setForm(prev => ({ ...prev, image: e.target.files[0] }));
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
      <div className="flex flex-wrap gap-4 mb-12">
        {categories.length === 0 && <p className="text-sm text-graphite">No categories yet.</p>}
        
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="group flex items-center gap-3 border border-hairline p-3 text-sm hover:border-ink transition-colors min-w-[240px]"
          >
            {/* Thumbnail */}
            {cat.imageUrl ? (
              <img 
                src={`http://localhost:8080${cat.imageUrl}`} 
                alt={cat.name} 
                className="w-12 h-12 object-cover bg-surface"
              />
            ) : (
              <div className="w-12 h-12 bg-surface flex items-center justify-center text-graphite text-xs text-center leading-tight">
                No<br/>Img
              </div>
            )}
            
            {/* Info */}
            <div className="flex-1">
              <div className="font-medium">{cat.name}</div>
              <div className="text-graphite text-xs">{sizeTypeLabel[cat.sizeType] || cat.sizeType}</div>
            </div>
            
            {/* Actions (Edit & Delete) */}
            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity pr-1">
              <button
                onClick={() => handleEditClick(cat)}
                className="text-graphite hover:text-ink text-xs underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-graphite hover:text-accent text-xl leading-none"
                aria-label="Delete category"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border border-hairline p-6 max-w-2xl bg-white shadow-sm">
        <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">
          {editingId ? 'Edit Category' : 'Add Category'}
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text" placeholder="Name" required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="border border-hairline px-4 py-2 text-sm focus:outline-none focus:border-ink transition-colors"
          />
          <input
            type="text" placeholder="Slug (e.g., mens-tops)" required
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            className="border border-hairline px-4 py-2 text-sm focus:outline-none focus:border-ink transition-colors"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6 items-center">
          <select
            value={form.sizeType}
            onChange={(e) => setForm((p) => ({ ...p, sizeType: e.target.value }))}
            className="border border-hairline px-4 py-2 text-sm focus:outline-none focus:border-ink transition-colors"
          >
            <option value="APPAREL">Apparel (S/M/L/XL)</option>
            <option value="SHOE">Shoe Sizes</option>
            <option value="ONE_SIZE">One Size Fits All</option>
          </select>
          
          <div className="flex flex-col">
            <span className="text-xs text-graphite mb-1">
              {editingId ? 'Upload new image (optional)' : 'Category Image'}
            </span>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="border border-hairline px-4 py-1 text-sm file:mr-4 file:py-1 file:px-3 file:border-0 file:text-xs file:bg-surface file:text-ink hover:file:bg-hairline transition-colors focus:outline-none focus:border-ink w-full"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            type="submit" disabled={saving}
            className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-6 py-2.5 text-sm hover:bg-accent transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : (editingId ? 'Update Category' : 'Add Category')}
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm font-medium text-graphite hover:text-ink transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}