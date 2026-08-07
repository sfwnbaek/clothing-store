import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-8">Sign In</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-hairline px-4 py-3 text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border border-hairline px-4 py-3 text-sm"
        />

        {error && <p className="text-sm text-accent">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-ink text-paper font-display font-bold uppercase tracking-wide py-4 hover:bg-accent transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-sm text-graphite mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-ink font-semibold underline">
          Register
        </Link>
      </p>
    </div>
  );
}