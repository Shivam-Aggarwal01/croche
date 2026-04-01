import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, LogOut, ChevronRight } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

export default function CustomerDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) {
      navigate('/auth');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/user/${user._id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-brand-900 mb-2">Welcome, {user.name.split(' ')[0]}</h1>
          <p className="text-lg text-brand-600 font-medium">Manage your orders and account details.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-colors"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-brand-900 flex items-center gap-2">
          <Package size={24} /> Your Order History
        </h2>
        
        {loading ? (
          <div className="p-10 text-center font-bold text-brand-500">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-brand-100 text-center">
            <h3 className="text-xl font-bold text-brand-900 mb-2">No orders yet.</h3>
            <p className="text-brand-600 mb-6">Looks like you haven't crafted anything with us yet.</p>
            <button 
              onClick={() => navigate('/products')}
              className="px-8 py-3 bg-brand-900 text-white font-bold rounded-xl"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-3xl border border-brand-100 shadow-sm overflow-hidden">
                <div className="bg-brand-50 p-5 px-6 border-b border-brand-100 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="text-sm font-bold text-brand-500 uppercase tracking-widest mb-1">Order Placed</p>
                    <p className="font-bold text-brand-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-500 uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="font-bold text-brand-900">₹{order.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-500 uppercase tracking-widest mb-1">Order #</p>
                    <p className="font-bold text-brand-900">{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="md:ml-auto">
                    <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Processing' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-5 items-center">
                        <img 
                          src={getImageUrl(item.product?.images?.[0])} 
                          alt="product" 
                          className="w-20 h-20 rounded-xl object-cover bg-brand-50 border border-brand-100"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-lg text-brand-900">{item.product?.name || 'Item Removed'}</p>
                          <p className="text-brand-600 font-medium">Size: {item.size} • Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-brand-900 text-lg">₹{item.priceAtTime * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-brand-100 flex justify-end">
                    <button 
                      onClick={() => navigate(`/order-tracking?orderId=${order._id}`)}
                      className="flex items-center gap-1 font-bold text-brand-900 hover:text-brand-600 transition-colors"
                    >
                      Track Order <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
