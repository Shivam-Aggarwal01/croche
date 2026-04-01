import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navigation from './components/Navigation';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import CustomOrder from './pages/CustomOrder';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import Auth from './pages/Auth';
import CustomerDashboard from './pages/CustomerDashboard';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/custom-order" element={<CustomOrder />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-tracking" element={<OrderTracking />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<CustomerDashboard />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </AnimatePresence>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  
  return (
    <div className={`min-h-screen font-secondary selection:bg-accent selection:text-white relative ${isAdmin ? 'bg-white' : 'bg-brand-50 text-brand-900'}`}>
      {!isAdmin && <Navigation />}
      <main className={!isAdmin ? "pt-20 md:pt-24 lg:pt-28" : ""}>
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout>
            <AnimatedRoutes />
          </Layout>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
