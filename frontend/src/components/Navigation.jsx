import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, User, X } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useCart();
  const { user } = useAuth();

  return (
    <nav className="fixed w-full z-50 glass top-0 shadow-lg backdrop-blur-xl border-b border-brand-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl sm:text-2xl lg:text-3xl font-black text-brand-900 tracking-tight">
              The Cozy Coccoon
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-6 lg:space-x-8 items-center text-sm lg:text-base">
            <Link to="/" className="px-3 py-2 rounded-xl text-brand-800 hover:text-brand-600 hover:bg-brand-50 transition-colors font-medium">Home</Link>
            <Link to="/products" className="px-3 py-2 rounded-xl text-brand-800 hover:text-brand-600 hover:bg-brand-50 transition-colors font-medium">Shop Collection</Link>
            <Link to="/custom-order" className="px-3 py-2 rounded-xl text-brand-800 hover:text-brand-600 hover:bg-brand-50 transition-colors font-medium">Custom Request</Link>
            
            <Link to={user ? "/profile" : "/auth"} className="px-2 py-2 text-brand-900 hover:text-brand-600 transition-colors" title={user ? "Profile" : "Sign In"} aria-label={user ? "Profile" : "Sign In"}>
              <User size={20} />
            </Link>
            
            <Link to="/checkout" className="relative p-2 text-brand-900 hover:text-accent-dark transition-colors" aria-label="View cart">
              <ShoppingBag size={20} />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold leading-none text-white bg-brand-600 rounded-full shadow-sm">
                {cartCount}
              </span>
            </Link>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <Link to="/checkout" className="relative p-2 text-brand-900" aria-label="Cart">
              <ShoppingBag size={24} />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white transform bg-brand-600 rounded-full shadow-sm">
                {cartCount}
              </span>
            </Link>
            <button
              className="text-brand-900 hover:text-brand-600 p-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-3xl border-b border-brand-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2 text-center flex flex-col">
              <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-4 rounded-xl text-base font-bold text-brand-900 hover:bg-brand-50">Home</Link>
              <Link to="/products" onClick={() => setIsOpen(false)} className="block px-3 py-4 rounded-xl text-base font-bold text-white bg-brand-800 hover:bg-brand-700">Shop Collection</Link>
              <Link to="/custom-order" onClick={() => setIsOpen(false)} className="block px-3 py-4 rounded-xl text-base font-bold text-brand-900 hover:bg-brand-50">Custom Request</Link>
              <div className="border-t border-brand-100 my-2"></div>
              <Link to={user ? "/profile" : "/auth"} onClick={() => setIsOpen(false)} className="block px-3 py-4 rounded-xl text-base font-bold text-brand-900 flex items-center justify-center gap-2 hover:bg-brand-50">
                <User size={18} /> {user ? "Your Profile" : "Sign In"}
              </Link>
              <Link to="/admin-login" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-brand-400 mt-4 text-center">
                Admin Portal
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
