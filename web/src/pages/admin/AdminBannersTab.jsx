import { useEffect, useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { useToast } from '../../context/ToastContext';
import { Plus, X, Trash2, Pencil, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';

// --- HELPER FUNCTIONS FOR CROPPING ---
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'cropped-banner.jpg', { type: 'image/jpeg' });
      resolve({ file, previewUrl: URL.createObjectURL(blob) });
    }, 'image/jpeg', 0.95);
  });
}
// -------------------------------------

export default function AdminBannersTab() {
  const { showToast } = useToast();
  
  // Data State
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [headline, setHeadline] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  
  // Cropper States
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [finalCroppedImage, setFinalCroppedImage] = useState(null); 
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadBanners();
  }, []);

  function loadBanners() {
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/api/admin/banners', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setBanners(data))
      .catch((err) => {
        console.error('Fetch error:', err);
        setBanners([]);
      })
      .finally(() => setLoading(false));
  }

  function handleOpenPanel() {
    setEditingId(null);
    setHeadline('');
    setLinkUrl('');
    cancelImageState();
    setIsPanelOpen(true);
  }

  function handleEditClick(banner) {
    setEditingId(banner.id);
    setHeadline(banner.headline || '');
    setLinkUrl(banner.linkUrl || '');
    cancelImageState();
    setIsPanelOpen(true);
  }

  function closePanel() {
    setIsPanelOpen(false);
    setTimeout(() => {
      setEditingId(null);
      setHeadline('');
      setLinkUrl('');
      cancelImageState();
    }, 300);
  }

  function cancelImageState() {
    setImageSrc(null);
    setFinalCroppedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleFileChange(e) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImageSrc(imageUrl);
      setFinalCroppedImage(null);
    }
  }

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  async function handleConfirmCrop() {
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
      setFinalCroppedImage(cropped);
      setImageSrc(null); // Close the cropper UI, return to form
    } catch (e) {
      console.error(e);
      showToast('Error cropping image', 'error');
    }
  }

  function handleCancelCrop() {
    setImageSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Require a file ONLY if creating new
    if (!editingId && !finalCroppedImage) {
      showToast('Please choose and crop an image first.', 'error');
      return;
    }

    const formData = new FormData();
    if (finalCroppedImage) formData.append('file', finalCroppedImage.file);
    formData.append('headline', headline || '');
    formData.append('linkUrl', linkUrl || '');

    setUploading(true);
    const token = localStorage.getItem('token');
    
    try {
      const url = editingId 
        ? `http://localhost:8080/api/admin/banners/${editingId}` 
        : 'http://localhost:8080/api/admin/banners';
        
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      if (!res.ok) throw new Error();
      
      showToast(editingId ? 'Banner updated successfully.' : 'Banner uploaded successfully.');
      closePanel();
      loadBanners();
    } catch (err) {
      showToast('Could not save banner.', 'error');
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
    if (!window.confirm('Are you sure you want to delete this banner permanently?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:8080/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Banner deleted.');
      loadBanners();
    } catch (err) {
      showToast('Could not delete banner.', 'error');
    }
  }

  const inputClass = "w-full border border-gray-300 rounded bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all";

  return (
    <div className="relative">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display font-bold text-lg uppercase tracking-wide">Homepage Banners</h2>
        <button
          onClick={handleOpenPanel}
          className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-5 py-2.5 text-sm hover:bg-accent transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Add Banner
        </button>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-hairline overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface border-b border-hairline">
              <tr>
                <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs">Banner Image</th>
                <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs">Headline & Link</th>
                <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs">Status</th>
                <th className="px-6 py-4 font-bold text-graphite uppercase tracking-wide text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-graphite">Loading banners...</td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-graphite">
                    No banners found. Click "Add Banner" to create one.
                  </td>
                </tr>
              ) : (
                banners.map((banner) => (
                  <tr key={banner.id} className={`transition-colors ${!banner.active && 'bg-gray-50/50 opacity-75'}`}>
                    <td className="px-6 py-3">
                      <img
                        src={`http://localhost:8080${banner.imageUrl}`}
                        alt={banner.headline || 'Banner'}
                        className="w-40 h-auto aspect-[21/9] object-cover bg-hairline rounded border border-gray-200"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <p className="font-bold text-ink truncate max-w-xs">{banner.headline || '(No headline)'}</p>
                      <p className="text-xs text-graphite truncate max-w-xs">{banner.linkUrl || '(No link)'}</p>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wide rounded-full ${
                        banner.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {banner.active ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleToggle(banner.id)} 
                          className="p-2 text-graphite hover:text-ink bg-surface hover:bg-gray-200 rounded transition-colors" 
                          title={banner.active ? "Hide Banner" : "Show Banner"}
                        >
                          {banner.active ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button 
                          onClick={() => handleEditClick(banner)} 
                          className="p-2 text-graphite hover:text-ink bg-surface hover:bg-gray-200 rounded transition-colors" 
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(banner.id)} 
                          className="p-2 text-graphite hover:text-accent bg-surface hover:bg-red-50 rounded transition-colors" 
                          title="Delete"
                        >
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
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in" onClick={closePanel} />
          
          <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-slide-in-right">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-hairline bg-surface">
              <h2 className="font-display font-bold text-lg uppercase tracking-wide">
                {editingId ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <button onClick={closePanel} className="text-graphite hover:text-ink transition-colors p-1">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              
              {/* Cropper UI replaces the form temporarily when an image is selected */}
              {imageSrc ? (
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon size={18} className="text-ink" />
                    <h3 className="font-bold text-sm uppercase tracking-wide">Crop Your Image</h3>
                  </div>
                  
                  <div className="relative w-full h-64 bg-surface rounded overflow-hidden mb-6 border border-hairline">
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={21 / 9} 
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  </div>
                  
                  <div className="flex gap-3 mt-auto">
                    <button
                      type="button"
                      onClick={handleCancelCrop}
                      className="flex-1 border border-hairline bg-white font-bold uppercase tracking-wide py-3 text-sm hover:border-graphite transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCrop}
                      className="flex-1 bg-ink text-paper font-bold uppercase tracking-wide py-3 text-sm hover:bg-accent transition-colors"
                    >
                      Confirm Crop
                    </button>
                  </div>
                </div>
              ) : (
                
                /* Standard Form */
                <form id="banner-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                  
                  <div>
                    <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">
                      {editingId ? 'Update Banner Image (Optional)' : 'Upload Banner Image'}
                    </label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="w-full border border-gray-300 rounded bg-gray-50 px-3 py-2 text-sm file:mr-4 file:py-1.5 file:px-4 file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wide file:bg-surface file:text-ink hover:file:bg-gray-200 transition-colors focus:outline-none"
                    />
                  </div>

                  {/* Preview Cropped Image */}
                  {finalCroppedImage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded">
                      <span className="text-xs text-emerald-700 mb-2 block font-bold uppercase tracking-wide">✓ Image Cropped & Ready</span>
                      <img 
                        src={finalCroppedImage.previewUrl} 
                        alt="Cropped preview" 
                        className="w-full border border-emerald-200 rounded object-cover aspect-[21/9]" 
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">Headline (Optional)</label>
                    <input
                      type="text" placeholder="e.g. Summer Collection 2026"
                      value={headline} onChange={(e) => setHeadline(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-graphite uppercase tracking-wide mb-2">Button Link URL (Optional)</label>
                    <input
                      type="text" placeholder="e.g. /products?category=shoes"
                      value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
                      className={inputClass}
                    />
                    <p className="text-[10px] text-graphite mt-1">Where customers go when they click the banner.</p>
                  </div>

                </form>
              )}
            </div>

            {/* Footer only shows if not actively cropping */}
            {!imageSrc && (
              <div className="border-t border-hairline p-6 bg-surface flex gap-3">
                <button type="button" onClick={closePanel} className="flex-1 border border-hairline bg-white font-display font-bold uppercase tracking-wide py-3 text-sm hover:border-graphite transition-colors">
                  Cancel
                </button>
                <button form="banner-form" type="submit" disabled={uploading} className="flex-1 bg-ink text-paper font-display font-bold uppercase tracking-wide py-3 text-sm hover:bg-accent transition-colors disabled:opacity-50">
                  {uploading ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}