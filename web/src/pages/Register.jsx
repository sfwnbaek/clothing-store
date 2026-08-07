import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.email, form.password, form.firstName, form.lastName);
      navigate('/');
    } catch (err) {
      setError('Could not create account. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-8">Create Account</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={form.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            className="border border-hairline px-4 py-3 text-sm flex-1"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={form.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            className="border border-hairline px-4 py-3 text-sm flex-1"
          />
        </div>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          required
          className="border border-hairline px-4 py-3 text-sm"
        />
        <input
          type="password"
          placeholder="Password (min. 8 characters)"
          value={form.password}
          onChange={(e) => updateField('password', e.target.value)}
          required
          minLength={8}
          className="border border-hairline px-4 py-3 text-sm"
        />

        {error && <p className="text-sm text-accent">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-ink text-paper font-display font-bold uppercase tracking-wide py-4 hover:bg-accent transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-sm text-graphite mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-ink font-semibold underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}