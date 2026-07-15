import React, { useState } from 'react';
import { authApi } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', username: '', student_id: '', password: '', password_confirmation: ''
  });
  const [error, setError] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError({});
    try {
      await authApi.csrf();
      await authApi.register(formData);
      await refresh();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.errors || { _global: [err.response?.data?.message || 'Registration failed.'] });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Create an Account</h2>
        
        {error._global && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error._global[0]}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {['name', 'email', 'username', 'student_id'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 capitalize">{field.replace('_', ' ')}</label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                name={field}
                required
                value={(formData as any)[field]}
                onChange={handleChange}
                className={`w-full rounded-xl border ${error[field] ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} text-sm px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {error[field] && <p className="text-red-500 text-xs mt-1">{error[field][0]}</p>}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input type="password" name="password" required value={formData.password} onChange={handleChange} className={`w-full rounded-xl border ${error.password ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} text-sm px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500`} />
              {error.password && <p className="text-red-500 text-xs mt-1">{error.password[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm</label>
              <input type="password" name="password_confirmation" required value={formData.password_confirmation} onChange={handleChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 text-sm px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 mt-2">
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
