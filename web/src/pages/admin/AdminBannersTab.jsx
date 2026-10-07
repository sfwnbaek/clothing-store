import { useEffect, useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { useToast } from '../../context/ToastContext';

// --- HELPER FUNCTIONS FOR CROPPING ---
// These functions take the coordinates from the cropper and draw a new cropped image
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
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [headline, setHeadline] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Cropper States
  const [imageSrc, setImageSrc] = useState(null); // The raw image loaded for cropping
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [finalCroppedImage, setFinalCroppedImage] = useState(null); // The final file ready to upload
  
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

  // Handle file selection and pass it to the Cropper
  function handleFileChange(e) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImageSrc(imageUrl);
      setFinalCroppedImage(null); // Reset any previous crop
    }
  }

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Generate the actual cropped file from the coordinates
  async function handleConfirmCrop() {
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
      setFinalCroppedImage(cropped);
      setImageSrc(null); // Close the cropper UI
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
      
      cancelEdit();
      loadBanners();
      showToast(editingId ? 'Banner updated.' : 'Banner uploaded.');
    } catch (err) {
      showToast('Could not save banner.', 'error');
    } finally {
      setUploading(false);
    }
  }

  function handleEditClick(banner) {
    setEditingId(banner.id);
    setHeadline(banner.headline || '');
    setLinkUrl(banner.linkUrl || '');
    cancelImageState();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelImageState() {
    setImageSrc(null);
    setFinalCroppedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function cancelEdit() {
    setEditingId(null);
    setHeadline('');
    setLinkUrl('');
    cancelImageState();
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

  const inputClass = "border border-hairline px-4 py-2 text-sm focus:outline-none focus:border-ink transition-colors w-full";

  if (loading) {
    return <div className="text-graphite text-sm">Loading banners...</div>;
  }

  return (
    <div className="max-w-4xl">
      <form onSubmit={handleSubmit} className="border border-hairline p-6 mb-10 bg-white">
        <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">
          {editingId ? 'Edit Banner' : 'Add Banner'}
        </h2>
        
        {/* Step 1: Cropper UI (Shows only when an image is selected but not yet cropped) */}
        {imageSrc ? (
          <div className="mb-6">
            <div className="relative w-full h-64 bg-surface mb-4">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={21 / 9} // Standard ultra-wide banner ratio. Change to 16/9 if you prefer taller banners.
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleConfirmCrop}
                className="bg-ink text-paper font-bold uppercase tracking-wide px-4 py-2 text-xs hover:bg-accent transition-colors"
              >
                Confirm Crop
              </button>
              <button
                type="button"
                onClick={handleCancelCrop}
                className="border border-hairline text-ink font-bold uppercase tracking-wide px-4 py-2 text-xs hover:bg-surface transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mb-4">
            <div>
              <span className="text-xs text-graphite mb-1 block">
                {editingId ? 'Upload new image (optional)' : 'Banner Image'}
              </span>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className={`${inputClass} py-1 file:mr-4 file:py-1 file:px-3 file:border-0 file:text-xs file:bg-surface file:text-ink hover:file:bg-hairline`} 
              />
            </div>

            {/* Step 2: Show preview of the final cropped image before submitting */}
            {finalCroppedImage && (
              <div className="mb-2">
                <span className="text-xs text-accent mb-1 block font-bold">✓ Cropped Image Ready</span>
                <img 
                  src={finalCroppedImage.previewUrl} 
                  alt="Cropped preview" 
                  className="w-full max-w-sm border border-hairline object-cover aspect-[21/9]" 
                />
              </div>
            )}

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
        )}

        {/* Hide submit button while cropping is active */}
        {!imageSrc && (
          <div className="flex items-center gap-4">
            <button
              type="submit" disabled={uploading}
              className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-6 py-2.5 text-sm hover:bg-accent transition-colors disabled:opacity-50"
            >
              {uploading ? 'Saving...' : (editingId ? 'Update Banner' : 'Upload Banner')}
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
        )}
      </form>

      <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4">All Banners</h2>
      <div className="flex flex-col gap-4">
        {banners.length === 0 && <p className="text-sm text-graphite">No banners yet.</p>}
        {banners.map((banner) => (
          <div key={banner.id} className="flex items-center gap-4 border border-hairline p-3 group">
            <img
              src={`http://localhost:8080${banner.imageUrl}`}
              alt={banner.headline || 'Banner'}
              className="w-32 h-auto aspect-[21/9] object-cover bg-hairline shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{banner.headline || '(no headline)'}</p>
              <p className="text-xs text-graphite truncate">{banner.linkUrl || '(no link)'}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 ${banner.active ? 'bg-ink text-paper' : 'bg-hairline text-graphite'}`}>
                {banner.active ? 'Active' : 'Hidden'}
              </span>
              <button 
                onClick={() => handleToggle(banner.id)} 
                className="text-sm text-graphite hover:text-ink underline transition-colors"
              >
                {banner.active ? 'Hide' : 'Show'}
              </button>
              <button 
                onClick={() => handleEditClick(banner)} 
                className="text-sm text-graphite hover:text-ink underline transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(banner.id)} 
                className="text-sm text-graphite hover:text-accent underline transition-colors"
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