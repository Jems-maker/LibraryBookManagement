import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userResponse = await login(email, password);
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(userResponse.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <img src="/images/LBMS.png" alt="LBMS Logo" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 mt-1">Sign in to your library account</p>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Student ID</label>
            <input
              type="text"
              required
              placeholder="Enter your Student ID"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
