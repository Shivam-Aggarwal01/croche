import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { getFirstImage, getImageUrl } from '../utils/imageUtils';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [size, setSize] = useState('M');
  const [isCustom, setIsCustom] = useState(false);
  const [comments, setComments] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState('');
  
  useEffect(() => {
    const getProduct = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, [id]);

  if (loading) {
     return <div className="min-h-screen pt-32 text-center text-brand-900 font-bold">Loading Details...</div>;
  }

  if (!product) {
     return <div className="min-h-screen pt-32 text-center text-brand-900 font-bold">Product not found. <Link to="/products" className="underline hover:text-brand-600">Back to shop.</Link></div>;
  }
  
  return (
    <div className="pt-32 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Images Column */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="w-full aspect-[4/5] bg-brand-100 rounded-[2rem] overflow-hidden relative shadow-2xl shadow-brand-900/10">
             {(() => {
               const mainImage = getFirstImage(product.images) || product.image || product.thumbnail;
               return mainImage ? (
                 <img src={getImageUrl(mainImage)} alt={product.name} className="w-full h-full object-cover" />
               ) : null;
             })()}
          </div>
        </motion.div>

        {/* Details Column */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center"
        >
          <span className="text-brand-500 font-bold tracking-widest uppercase text-sm mb-3">New Arrival</span>
          <h1 className="text-4xl md:text-6xl font-bold text-brand-900 mb-4 tracking-tight">{product.name}</h1>
          <p className="text-3xl font-medium text-brand-600 mb-8 tracking-tighter">₹{product.price}</p>
          
          <div className="prose prose-lg prose-brand mb-10 text-brand-800 leading-relaxed font-secondary text-lg">
            <p>{product.description}</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-100 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-brand-900">Select Fit</h3>
              <button 
                onClick={() => setIsCustom(!isCustom)}
                className="text-sm font-bold text-brand-600 underline underline-offset-4 hover:text-brand-900 transition-colors"
              >
                {isCustom ? 'Use Standard Sizes' : 'Need Custom Measurements?'}
              </button>
            </div>
            
            {!isCustom ? (
              <div className="grid grid-cols-4 gap-4 mb-6">
                {['XS', 'S', 'M', 'L'].map((s) => (
                  <button 
                    key={s}
                    onClick={() => setSize(s)}
                    className={`py-4 rounded-xl border-2 text-center font-bold transition-all ${
                      size === s 
                        ? 'border-brand-900 bg-brand-900 text-white shadow-lg' 
                        : 'border-brand-200 hover:border-brand-600 text-brand-900 bg-brand-50 hover:bg-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-brand-600 uppercase ml-1 mb-1 block">Bust (in)</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50 transition-shadow" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-brand-600 uppercase ml-1 mb-1 block">Waist (in)</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50 transition-shadow" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-brand-600 uppercase ml-1 mb-1 block">Length (in)</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50 transition-shadow" />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-900 ml-1">Custom Size Notes / Comments</label>
              <textarea 
                rows="2"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="E.g., I'd like the sleeves to be slightly longer..."
                className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50 transition-shadow"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 mb-4">
            <button
              type="button"
              className="px-5 py-3 bg-brand-100 text-brand-800 rounded-xl font-bold hover:bg-brand-200 transition"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              -
            </button>
            <span className="font-bold text-lg">{quantity}</span>
            <button
              type="button"
              className="px-5 py-3 bg-brand-100 text-brand-800 rounded-xl font-bold hover:bg-brand-200 transition"
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </button>
          </div>

          <button
            type="button"
            className="w-full py-5 bg-brand-900 text-white rounded-2xl font-bold hover:bg-brand-800 hover:shadow-xl hover:-translate-y-1 transition-all text-xl mb-3 shadow-brand-900/20"
            onClick={() => {
              if (!user) {
                navigate('/auth');
                return;
              }
              if (!product.inStock) return;
              addItem({
                productId: product._id,
                name: product.name,
                price: product.price,
                size: isCustom ? 'Custom' : size,
                quantity,
                image: getFirstImage(product.images) || product.image || product.thumbnail || '',
                comments
              });
              setFeedback('Added to cart successfully!');
              setTimeout(() => setFeedback(''), 2500);
            }}
          >
            Add to Bag — ₹{product.price * quantity}
          </button>

          {feedback && <p className="text-center text-sm text-green-600 font-medium mb-4">{feedback}</p>}

          <div className="text-sm text-brand-600 text-center flex items-center justify-center gap-2 font-medium">
             <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span> {product.inStock ? 'Available to craft' : 'Out of stock'}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
