import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const MIN_PASSWORD_LENGTH = 8;

export default function Register() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error as user modifies it
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const errors = {};
    const trimmedName = formData.name.trim();
    const trimmedUsername = formData.username.trim().toLowerCase();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName) {
      errors.name = 'Name is required';
    }

    if (!trimmedUsername) {
      errors.username = 'Username is required';
    } else if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      errors.username = 'Username must be between 3 and 30 characters';
    } else if (!/^[a-z0-9_-]+$/.test(trimmedUsername)) {
      errors.username =
        'Username can only contain lowercase letters, numbers, hyphens, and underscores';
    }

    if (!trimmedEmail) {
      errors.email = 'Email is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setError('');
    setLoading(true);

    const trimmedName = formData.name.trim();
    const cleanUsername = formData.username.trim().toLowerCase();
    const trimmedEmail = formData.email.trim();

    try {
      await register(trimmedName, cleanUsername, trimmedEmail, formData.password);
      // Navigation is handled automatically by GuestRoute once auth state updates
    } catch (err) {
      // Use backend error message if available, otherwise display a fallback
      setError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const displayUsername = formData.username.trim().toLowerCase() || '<username>';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 sm:p-8 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 text-center">
          Create your account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            name="name"
            type="text"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            error={fieldErrors.name}
            placeholder="Jane Doe"
            autoComplete="name"
            required
          />

          <div>
            <Input
              id="username"
              name="username"
              type="text"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              error={fieldErrors.username}
              placeholder="janedoe"
              autoComplete="username"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Your public portfolio URL will be: /u/{displayUsername}
            </p>
          </div>

          <Input
            id="email"
            name="email"
            type="email"
            label="Email address"
            value={formData.email}
            onChange={handleChange}
            error={fieldErrors.email}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            error={fieldErrors.password}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword}
            placeholder="••••••••"
            autoComplete="new-password"
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
            Create account
          </Button>
        </form>

        <p className="text-sm text-center text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
