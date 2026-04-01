import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInput = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/signup';
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      login(data.user, data.token);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-brand-100"
      >
        <h2 className="text-3xl font-bold text-brand-900 text-center mb-6">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInput}
              required={!isLogin}
              className="w-full px-4 py-3 rounded-xl border border-brand-200 bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleInput}
            required
            className="w-full px-4 py-3 rounded-xl border border-brand-200 bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
          />
          {!isLogin && (
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number (Optional)"
              value={formData.phone}
              onChange={handleInput}
              className="w-full px-4 py-3 rounded-xl border border-brand-200 bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
            />
          )}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInput}
            required
            className="w-full px-4 py-3 rounded-xl border border-brand-200 bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-900 text-white rounded-xl font-bold hover:bg-brand-800 transition-colors mt-2 disabled:opacity-70"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center text-brand-600 font-medium tracking-tight">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-brand-900 font-bold underline underline-offset-4"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
