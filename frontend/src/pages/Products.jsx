import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getFirstImage, getImageUrl } from '../utils/imageUtils';
import API_BASE_URL from '../config/api';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemAnim = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        
        const res = await fetch(`${API_BASE_URL}/api/products`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error('Database Offline');
        
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, []);

  return (
    <div className="pt-32 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-brand-900 mb-4 tracking-tight">Our Collection</h1>
        <p className="text-xl text-brand-600 max-w-2xl mx-auto">Discover our handcrafted masterpieces designed to bring out your inner elegance.</p>
      </motion.div>

      {loading ? (
        <div className="text-center text-brand-500 font-bold py-20 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-900 animate-spin mb-4"></div>
          Loading Collection...
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-20 bg-red-50 rounded-3xl border border-red-100 p-8 max-w-2xl mx-auto">
          <p className="text-2xl font-bold mb-2">Could not connect to database</p>
          <p className="text-brand-800">Please check your MongoDB Atlas Network IP settings or password. The server is offline.</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center text-brand-600 py-20">
          <p className="text-2xl font-medium">Coming soon!</p>
          <p>We are currently crafting new pieces. Check back later.</p>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
        >
          {products.map((p) => {
            const mainImage = getFirstImage(p.images) || p.image || p.thumbnail;
            return (
            <motion.div variants={itemAnim} key={p._id}>
              <Link to={`/products/${p._id}`} className="group block h-full">
                <div className="w-full aspect-[4/5] bg-brand-100 rounded-3xl mb-6 overflow-hidden relative section-card transition-all duration-500 hover:-translate-y-1 hover:shadow-strong">
                  {mainImage ? (
                    <img 
                      src={getImageUrl(mainImage)} 
                      alt={p.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-300">No Image</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="px-2">
                  <h3 className="text-2xl font-bold text-brand-900 mb-1 group-hover:text-brand-600 transition-colors truncate">{p.name}</h3>
                  <p className="text-lg text-brand-600 font-medium tracking-tight">₹{p.price}</p>
                </div>
              </Link>
            </motion.div>
          )})}
        </motion.div>
      )}
    </div>
  );
}
