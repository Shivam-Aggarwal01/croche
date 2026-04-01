import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart, removeItem, updateQuantity } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', phone: '', firstName: '', lastName: '', address: '', city: '', postalCode: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (user) {
      setForm(prev => ({
        ...prev,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        firstName: user.name ? user.name.split(' ')[0] : prev.firstName,
        lastName: user.name ? user.name.split(' ').slice(1).join(' ') : prev.lastName,
        address: user.savedAddress?.address || prev.address,
        city: user.savedAddress?.city || prev.city,
        postalCode: user.savedAddress?.postalCode || prev.postalCode,
      }));
    }
  }, [user, navigate]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInput = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handlePlaceOrder = async () => {
    if (!form.email || !form.phone || !form.firstName || !form.lastName || !form.address || !form.city || !form.postalCode) {
      setError('All shipping and contact fields are required.');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty. Add items first.');
      return;
    }

    const orderPayload = {
      customerDetails: {
        email: form.email,
        phone: form.phone,
        firstName: form.firstName,
        lastName: form.lastName,
        address: form.address,
        city: form.city,
        postalCode: form.postalCode,
      },
      items: cartItems.map((item) => ({
        product: item.productId,
        sizeType: item.size === 'Custom' ? 'custom' : 'standard',
        size: item.size,
        comments: item.comments,
        quantity: item.quantity,
        priceAtTime: item.price,
      })),
      totalAmount: cartTotal,
    };

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload),
      });
      if (!res.ok) throw new Error('Order submission failed');

      const data = await res.json();
      clearCart();
      setSuccess('Order placed successfully! Redirecting to tracking...');
      setTimeout(() => navigate(`/order-tracking?orderId=${data._id}`), 1500);
    } catch (err) {
      console.error(err);
      setError('Could not place order. Please try again.');
    }
  };

  return (
    <div className="pt-24 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <h1 className="text-4xl font-bold text-brand-900 mb-6 text-center">Checkout</h1>

      {error && <div className="mb-6 text-center text-red-600 font-semibold">{error}</div>}
      {success && <div className="mb-6 text-center text-green-600 font-semibold">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="section-card">
            <h2 className="text-2xl font-bold text-brand-900 mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleInput('email', e.target.value)}
                placeholder="Email Address"
                className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50"
                required
              />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleInput('phone', e.target.value)}
                placeholder="Phone Number"
                className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50"
                required
              />
            </div>

            <h2 className="text-2xl font-bold text-brand-900 mb-6">Shipping Address</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                value={form.firstName}
                onChange={(e) => handleInput('firstName', e.target.value)}
                type="text"
                placeholder="First Name"
                className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50"
                required
              />
              <input
                value={form.lastName}
                onChange={(e) => handleInput('lastName', e.target.value)}
                type="text"
                placeholder="Last Name"
                className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50"
                required
              />
              <input
                value={form.address}
                onChange={(e) => handleInput('address', e.target.value)}
                type="text"
                placeholder="Address"
                className="col-span-2 w-full px-4 py-3 rounded-xl border border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50"
                required
              />
              <input
                value={form.city}
                onChange={(e) => handleInput('city', e.target.value)}
                type="text"
                placeholder="City"
                className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50"
                required
              />
              <input
                value={form.postalCode}
                onChange={(e) => handleInput('postalCode', e.target.value)}
                type="text"
                placeholder="Postal Code"
                className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50"
                required
              />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-2xl font-bold text-brand-900 mb-6">Payment</h2>
            <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl text-brand-800 text-center">
              Payment gateway intentionally disabled for development.
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-brand-900 text-brand-50 p-6 md:p-8 rounded-3xl shadow-2xl h-fit sticky top-24"
        >
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

          {cartItems.length === 0 ? (
            <p className="text-brand-200 mb-4">Your cart is empty. Add items in shop.</p>
          ) : (
            <div className="space-y-6 mb-6 border-b border-brand-800 pb-8">
              {cartItems.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="flex flex-col gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 relative group hover:bg-white/10 transition-all duration-300">
                  <div className="flex gap-4 items-center">
                    <img src={getImageUrl(item.image)} alt={item.name} className="w-20 h-20 rounded-xl object-cover shadow-md" />
                    <div className="flex-1">
                      <p className="text-lg font-bold text-white leading-tight mb-1">{item.name}</p>
                      <p className="text-sm text-brand-200">{item.size}</p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 bg-brand-800/50 rounded-lg p-1">
                          <button 
                            onClick={() => updateQuantity(item.productId, item.size, Math.max(1, item.quantity - 1))}
                            className="p-1 hover:bg-brand-700 rounded-md transition-colors text-white"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-semibold w-6 text-center text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            className="p-1 hover:bg-brand-700 rounded-md transition-colors text-white"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <p className="font-bold text-lg text-brand-accent">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeItem(item.productId, item.size)}
                    className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:scale-110 shadow-lg"
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 mb-6 text-brand-200">
            <div className="flex justify-between">
              <p>Subtotal</p>
              <p>₹{cartTotal}</p>
            </div>
            <div className="flex justify-between">
              <p>Shipping</p>
              <p className="text-brand-accent">Free</p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8 text-xl font-bold">
            <p>Total</p>
            <p>₹{cartTotal}</p>
          </div>

          <button
            type="button"
            onClick={handlePlaceOrder}
            className="block w-full py-4 bg-brand-50 text-brand-900 text-center rounded-xl font-bold hover:bg-white hover:shadow-lg transition-all"
          >
            Place Order
          </button>
        </motion.div>
      </div>
    </div>
  );
}
