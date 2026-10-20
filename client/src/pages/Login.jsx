import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const trimmedEmail = email.trim();
    setError('');
    setLoading(true);

    try {
      await login(trimmedEmail, password);
      // Automatic redirect to /dashboard is handled by GuestRoute once auth state updates
    } catch (err) {
      // Use backend error message if available, otherwise display a fallback
      setError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 sm:p-8 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 text-center">Log in</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />

          {error && (
            <div
              role="alert"
              className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full"
          >
            Log in
          </Button>
        </form>

        <p className="text-sm text-center text-slate-600">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500 underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
