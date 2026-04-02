import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server Error. Ensure backend is running.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-12 px-8 shadow-2xl rounded-3xl border border-brand-100">
          <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
            <h2 className="text-center text-3xl font-bold tracking-tight text-brand-900">Sign in to console</h2>
          </div>
          
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}
            
            <div>
              <label className="block text-sm font-bold text-brand-900">Username</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-brand-200 px-4 py-3 bg-brand-50 placeholder-brand-400 focus:border-brand-500 focus:outline-none focus:ring-brand-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-brand-900">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-brand-200 px-4 py-3 bg-brand-50 placeholder-brand-400 focus:border-brand-500 focus:outline-none focus:ring-brand-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-xl bg-brand-900 py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-brand-800 transition-colors"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
