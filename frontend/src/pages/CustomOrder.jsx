import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CustomOrder() {
  const [form, setForm] = useState({ name: '', description: '', measurements: '' });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append('name', form.name);
    payload.append('description', form.description);
    payload.append('measurements', form.measurements);
    if (file) payload.append('referenceImage', file);

    try {
      const res = await fetch('http://localhost:5000/api/requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: payload,
      });

      if (!res.ok) throw new Error('Request failed');
      setStatus('Request submitted successfully!');
      setForm({ name: '', description: '', measurements: '' });
      setFile(null);
    } catch (err) {
      console.error(err);
      setStatus('Could not submit request.');
    }
  };

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="pt-24 min-h-screen max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Custom Request</h1>
        <p className="text-brand-600 mb-8">Got a design in mind? Let us craft it for you. Fill out the form below to get started.</p>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-900" htmlFor="name">Full Name</label>
            <input 
              id="name"
              value={form.name}
              onChange={(e)=>handleChange('name', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50"
              placeholder="Jane Doe"
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-900" htmlFor="description">Design Description</label>
            <textarea 
              id="description"
              value={form.description}
              onChange={(e)=>handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50"
              placeholder="Describe the crochet piece you want..."
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-900" htmlFor="measurements">Measurements (Optional)</label>
            <textarea 
              id="measurements"
              value={form.measurements}
              onChange={(e)=>handleChange('measurements', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50"
              placeholder="e.g., Bust, Waist, Length..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-900" htmlFor="reference">Reference Image</label>
            <input
              id="reference"
              type="file"
              accept="image/*"
              onChange={(e)=>setFile(e.target.files?.[0] || null)}
              className="w-full"
            />
          </div>

          {status && <p className="text-center text-brand-600 font-medium">{status}</p>}

          <button 
            type="submit"
            className="w-full py-4 bg-brand-900 text-white rounded-xl font-bold hover:bg-brand-800 hover:shadow-lg transition-all"
          >
            Submit Request
          </button>
        </form>
    </div>
  );
}
