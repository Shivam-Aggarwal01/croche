import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function OrderTracking() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const orderId = params.get('orderId');

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError('Order ID missing');
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}`);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const statusSteps = ['Processing', 'In Production', 'Shipped', 'Delivered'];
  const statusIndex = statusSteps.indexOf(order?.status || 'Processing');

  const steps = statusSteps.map((label, index) => {
    let status = 'upcoming';
    if (index < statusIndex) status = 'completed';
    if (index === statusIndex) status = 'current';
    return {
      title: label,
      time: order?.createdAt ? new Date(order.createdAt).toLocaleString() : 'Pending',
      status,
      icon: index === 0 ? Package : index === 1 ? Clock : index === 2 ? Truck : CheckCircle,
    };
  });

  if (loading) {
    return <div className="pt-24 min-h-screen text-center text-brand-900 font-bold">Loading order...</div>;
  }

  if (error) {
    return <div className="pt-24 min-h-screen text-center text-red-600 font-bold">{error}</div>;
  }

  return (
    <div className="pt-24 min-h-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="section-card"
      >
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-brand-900 mb-2">Order #{order._id}</h1>
          <p className="text-brand-600">Status: {order.status}</p>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-brand-100"></div>

          <div className="space-y-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative flex items-start gap-6">
                  <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 z-10
                    ${step.status === 'completed' ? 'bg-brand-900 text-white' : ''}
                    ${step.status === 'current' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : ''}
                    ${step.status === 'upcoming' ? 'bg-brand-50 text-brand-800 border-2 border-brand-100' : ''}
                  `}>
                    <Icon size={28} />
                  </div>

                  <div className="pt-4">
                    <h3 className={`text-xl font-bold ${step.status === 'upcoming' ? 'text-brand-800/50' : 'text-brand-900'}`}>
                      {step.title}
                    </h3>
                    <p className={`mt-1 ${step.status === 'upcoming' ? 'text-brand-800/40' : 'text-brand-600'}`}>
                      {step.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 p-6 bg-brand-50 rounded-2xl">
          <h3 className="font-bold text-brand-900 mb-3">Items in order:</h3>
          {order.items.map((item) => (
            <div key={`${item.product}-${item.size}`} className="flex justify-between mb-2">
              <span>{item.size} x {item.quantity}</span>
              <span>₹{item.priceAtTime * item.quantity}</span>
            </div>
          ))}
          <div className="mt-4 font-bold flex justify-between">
            <span>Total</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
