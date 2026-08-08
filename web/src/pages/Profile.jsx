import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addressForm, setAddressForm] = useState({
    label: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '', defaultAddress: false,
  });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressError, setAddressError] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  const [emailForm, setEmailForm] = useState({ newEmail: '', currentPassword: '' });
  const [emailError, setEmailError] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    loadAddresses();
  }, [user, authLoading]);

  function loadAddresses() {
    setLoading(true);
    api.get('/addresses')
      .then(setAddresses)
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }

  function updateAddressField(key, value) {
    setAddressForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetAddressForm() {
    setAddressForm({ label: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '', defaultAddress: false });
    setEditingAddressId(null);
  }

  function startEditAddress(addr) {
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label || '', line1: addr.line1, line2: addr.line2 || '',
      city: addr.city, state: addr.state, postalCode: addr.postalCode, country: addr.country,
      defaultAddress: addr.defaultAddress,
    });
  }

  async function handleAddressSubmit(e) {
    e.preventDefault();
    setSavingAddress(true);
    setAddressError('');
    try {
      if (editingAddressId) {
        await api.put(`/addresses/${editingAddressId}`, addressForm);
      } else {
        await api.post('/addresses', addressForm);
      }
      resetAddressForm();
      loadAddresses();
    } catch (err) {
      setAddressError('Could not save address.');
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleSetDefault(id) {
    await api.patch(`/addresses/${id}/default`, {});
    loadAddresses();
  }

  async function handleDeleteAddress(id) {
    if (!confirm('Delete this address?')) return;
    await api.delete(`/addresses/${id}`);
    loadAddresses();
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setSavingEmail(true);
    setEmailError('');
    setEmailMessage('');
    try {
      const result = await api.post('/profile/change-email', emailForm);
      localStorage.setItem('token', result.token);
      localStorage.setItem('userEmail', result.email);
      setEmailMessage('Email updated successfully.');
      setEmailForm({ newEmail: '', currentPassword: '' });
    } catch (err) {
      setEmailError('Could not update email. Check your password and that the email isn\'t already in use.');
    } finally {
      setSavingEmail(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordError('');
    setPasswordMessage('');
    try {
      await api.post('/profile/change-password', passwordForm);
      setPasswordMessage('Password updated successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPasswordError('Could not update password. Check your current password.');
    } finally {
      setSavingPassword(false);
    }
  }

  if (authLoading || loading) {
    return <div className="max-w-3xl mx-auto px-6 py-12 text-graphite">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-10">Account Settings</h1>

      {/* Addresses */}
      <section className="mb-12">
        <h2 className="font-display font-bold text-lg uppercase tracking-tight mb-4">Saved Addresses</h2>

        <div className="flex flex-col gap-3 mb-6">
          {addresses.length === 0 && <p className="text-sm text-graphite">No saved addresses yet.</p>}
          {addresses.map((addr) => (
            <div key={addr.id} className="border border-hairline p-4 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm">{addr.label || 'Address'}</p>
                  {addr.defaultAddress && (
                    <span className="text-[10px] uppercase tracking-wide bg-ink text-paper px-2 py-0.5">Default</span>
                  )}
                </div>
                <p className="text-sm text-graphite">
                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                  {addr.city}, {addr.state} {addr.postalCode}<br />
                  {addr.country}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 text-sm">
                {!addr.defaultAddress && (
                  <button onClick={() => handleSetDefault(addr.id)} className="text-graphite hover:text-ink underline">
                    Set Default
                  </button>
                )}
                <button onClick={() => startEditAddress(addr)} className="text-graphite hover:text-ink underline">
                  Edit
                </button>
                <button onClick={() => handleDeleteAddress(addr.id)} className="text-graphite hover:text-accent underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddressSubmit} className="border border-hairline p-6">
          <h3 className="font-display font-bold text-sm uppercase tracking-wide mb-4">
            {editingAddressId ? 'Edit Address' : 'Add Address'}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text" placeholder="Label (e.g. Home, Work)"
              value={addressForm.label}
              onChange={(e) => updateAddressField('label', e.target.value)}
              className="border border-hairline px-4 py-2 text-sm col-span-2"
            />
            <input
              type="text" placeholder="Address Line 1" required
              value={addressForm.line1}
              onChange={(e) => updateAddressField('line1', e.target.value)}
              className="border border-hairline px-4 py-2 text-sm col-span-2"
            />
            <input
              type="text" placeholder="Address Line 2 (optional)"
              value={addressForm.line2}
              onChange={(e) => updateAddressField('line2', e.target.value)}
              className="border border-hairline px-4 py-2 text-sm col-span-2"
            />
            <input
              type="text" placeholder="City" required
              value={addressForm.city}
              onChange={(e) => updateAddressField('city', e.target.value)}
              className="border border-hairline px-4 py-2 text-sm"
            />
            <input
              type="text" placeholder="State" required
              value={addressForm.state}
              onChange={(e) => updateAddressField('state', e.target.value)}
              className="border border-hairline px-4 py-2 text-sm"
            />
            <input
              type="text" placeholder="Postal Code" required
              value={addressForm.postalCode}
              onChange={(e) => updateAddressField('postalCode', e.target.value)}
              className="border border-hairline px-4 py-2 text-sm"
            />
            <input
              type="text" placeholder="Country" required
              value={addressForm.country}
              onChange={(e) => updateAddressField('country', e.target.value)}
              className="border border-hairline px-4 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm mb-4">
            <input
              type="checkbox"
              checked={addressForm.defaultAddress}
              onChange={(e) => updateAddressField('defaultAddress', e.target.checked)}
            />
            Set as default address
          </label>
          {addressError && <p className="text-sm text-accent mb-4">{addressError}</p>}
          <div className="flex gap-3">
            <button
              type="submit" disabled={savingAddress}
              className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-6 py-3 text-sm hover:bg-accent transition-colors disabled:opacity-50"
            >
              {savingAddress ? 'Saving...' : editingAddressId ? 'Update Address' : 'Add Address'}
            </button>
            {editingAddressId && (
              <button type="button" onClick={resetAddressForm} className="text-sm text-graphite hover:text-ink underline">
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Change Email */}
      <section className="mb-12">
        <h2 className="font-display font-bold text-lg uppercase tracking-tight mb-4">Change Email</h2>
        <form onSubmit={handleEmailSubmit} className="border border-hairline p-6 flex flex-col gap-4">
          <input
            type="email" placeholder="New Email" required
            value={emailForm.newEmail}
            onChange={(e) => setEmailForm((p) => ({ ...p, newEmail: e.target.value }))}
            className="border border-hairline px-4 py-2 text-sm"
          />
          <input
            type="password" placeholder="Current Password" required
            value={emailForm.currentPassword}
            onChange={(e) => setEmailForm((p) => ({ ...p, currentPassword: e.target.value }))}
            className="border border-hairline px-4 py-2 text-sm"
          />
          {emailError && <p className="text-sm text-accent">{emailError}</p>}
          {emailMessage && <p className="text-sm text-graphite">{emailMessage}</p>}
          <button
            type="submit" disabled={savingEmail}
            className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-6 py-3 text-sm hover:bg-accent transition-colors disabled:opacity-50 self-start"
          >
            {savingEmail ? 'Updating...' : 'Update Email'}
          </button>
        </form>
      </section>

      {/* Change Password */}
      <section>
        <h2 className="font-display font-bold text-lg uppercase tracking-tight mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="border border-hairline p-6 flex flex-col gap-4">
          <input
            type="password" placeholder="Current Password" required
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
            className="border border-hairline px-4 py-2 text-sm"
          />
          <input
            type="password" placeholder="New Password (min. 8 characters)" required minLength={8}
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
            className="border border-hairline px-4 py-2 text-sm"
          />
          {passwordError && <p className="text-sm text-accent">{passwordError}</p>}
          {passwordMessage && <p className="text-sm text-graphite">{passwordMessage}</p>}
          <button
            type="submit" disabled={savingPassword}
            className="bg-ink text-paper font-display font-bold uppercase tracking-wide px-6 py-3 text-sm hover:bg-accent transition-colors disabled:opacity-50 self-start"
          >
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </section>
    </div>
  );
}