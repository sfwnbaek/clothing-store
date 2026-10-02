import { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';

export default function AdminBannersTab() {
  const { showToast } = useToast();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [headline, setHeadline] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  function loadBanners() {
  setLoading(true);
  const token = localStorage.getItem('token');
  console.log('Fetching admin banners with token:', token);
  fetch('http://localhost:8080/api/admin/banners', {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      console.log('Response status:', res.status);
      return res.json();
    })
    .then((data) => {
      console.log('Response data:', data);
      setBanners(data);
    })
    .catch((err) => {
      console.error('Fetch error:', err);
      setBanners([]);
    })
    .finally(() => setLoading(false));
}

  async function handleUpload(e) {
    e.preventDefault();
    const fileInput = e.target.elements.file;
    const file = fileInput.files[0];
    if (!file) {
      showToast('Please choose an image first.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    if (headline) formData.append('headline', headline);
    if (linkUrl) formData.append('linkUrl', linkUrl);

    setUploading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8080/api/admin/banners', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error();
      setHeadline('');
      setLinkUrl('');
      fileInput.value = '';
      loadBanners();
      showToast('Banner uploaded.');
    } catch (err) {
      showToast('Could not upload banner.', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleToggle(id) {
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:8080/api/admin/banners/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      loadBanners();
    } catch (err) {
      showToast('Could not update banner.', 'error');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this banner permanently?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:8080/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      loadBanners();
      showToast('Banner deleted.');
    } catch (err) {
      showToast('Could not delete banner.', 'error');
    }
  }

  const inputClass = "border border-hairline px-4 py-2 text-sm focus:outline-none focus:border-ink transition-colors";

  if (loading) {
    return <div className="text-graphite text-sm">Loading banners...</div>;
  }

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleUpload} className="border border-hairline p-6 mb-10">
        <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">Add Banner</h2>
        <div className="flex flex-col gap-4 mb-4">
          <input type="file" name="file" accept="image/*" className={inputClass} />
          <input
            type="text" placeholder="Headline (optional)"
            value={headline} onChange={(e) => setHeadline(e.target.value)}
            className={inputClass}
          />
          <input
            type="text" placeholder="Link URL (e.g. /products or /products?category=shoes)"
            value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
            className={inputClass}
          />
        </div>
        <button
          type="submit" disabled={uploading}
          className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-6 py-2.5 text-sm hover:bg-accent transition-colors disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Banner'}
        </button>
      </form>

      <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">All Banners</h2>
      <div className="flex flex-col gap-4">
        {banners.length === 0 && <p className="text-sm text-graphite">No banners yet.</p>}
        {banners.map((banner) => (
          <div key={banner.id} className="flex items-center gap-4 border border-hairline p-3">
            <img
              src={`http://localhost:8080${banner.imageUrl}`}
              alt={banner.headline || 'Banner'}
              className="w-32 h-16 object-cover bg-hairline shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{banner.headline || '(no headline)'}</p>
              <p className="text-xs text-graphite truncate">{banner.linkUrl || '(no link)'}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 ${banner.active ? 'bg-ink text-paper' : 'bg-hairline text-graphite'}`}>
                {banner.active ? 'Active' : 'Hidden'}
              </span>
              <button onClick={() => handleToggle(banner.id)} className="text-sm text-graphite hover:text-ink underline transition-colors">
                {banner.active ? 'Hide' : 'Show'}
              </button>
              <button onClick={() => handleDelete(banner.id)} className="text-sm text-graphite hover:text-accent underline transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}