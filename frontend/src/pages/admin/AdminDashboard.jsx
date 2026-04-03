import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Users, MessageSquare, Menu, Plus, Trash2, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getFirstImage, getImageUrl } from '../../utils/imageUtils';
import API_BASE_URL from '../../config/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    activeOrders: 0,
    totalCustomers: 0,
    pendingRequests: 0
  });
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });
  const [uploading, setUploading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Basic Auth Check
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin-login');
    }
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'requests') {
      fetchRequests();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const [orderStatsRes, requestStatsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/orders/stats`),
        fetch(`${API_BASE_URL}/api/requests/stats`)
      ]);

      const orderStats = orderStatsRes.ok ? await orderStatsRes.json() : { activeOrders: 0, totalCustomers: 0 };
      const requestStats = requestStatsRes.ok ? await requestStatsRes.json() : { pendingRequests: 0 };

      setStats({
        activeOrders: orderStats.activeOrders || 0,
        totalCustomers: orderStats.totalCustomers || 0,
        pendingRequests: requestStats.pendingRequests || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalSales: 0,
        activeOrders: 0,
        totalCustomers: 0,
        pendingRequests: 0
      });
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests`);
      const data = await res.json();
      setRequests(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadImage = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Image upload failed');
      const data = await res.json();
      setMessage('Image uploaded successfully');
      return data.imageUrl;
    } catch (err) {
      console.error(err);
      setMessage('Image upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    let imageUrl = '';
    if (newProduct.imageFile) {
      imageUrl = await handleUploadImage(newProduct.imageFile);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          price: Number(newProduct.price),
          description: newProduct.description,
          images: imageUrl ? [imageUrl] : []
        })
      });
      if (res.ok) {
        setNewProduct({ name: '', price: '', description: '', imageFile: null });
        fetchProducts();
        setMessage('Product created successfully.');
      }
    } catch (e) {
      console.error(e);
      setMessage('Failed to create product.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchProducts();
        setMessage('Product deleted successfully.');
      } else {
        setMessage('Failed to delete product.');
      }
    } catch (e) {
      console.error(e);
      setMessage('Error deleting product.');
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      if (status === 'Delivered') {
        const deleteRes = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
          method: 'DELETE',
        });

        if (!deleteRes.ok) {
          throw new Error('Failed to delete delivered order');
        }

        setOrders((prev) => prev.filter((order) => order._id !== id));
        if (activeTab === 'overview') {
          fetchStats();
        }
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchOrders();
        if (activeTab === 'overview') {
          fetchStats();
        }
      }
    } catch (e) {
      console.error(e);
      setMessage('Could not update order status.');
    }
  };

  const updateRequestStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchRequests();
        if (activeTab === 'overview') {
          fetchStats();
        }
        setMessage('Request status updated successfully.');
      } else {
        setMessage('Failed to update request status.');
      }
    } catch (e) {
      console.error(e);
      setMessage('Could not update request status.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-login');
  };

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'products', label: 'Manage Products' },
    { id: 'orders', label: 'Manage Orders' },
    { id: 'requests', label: 'Custom Requests' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center border-b border-slate-300">
        <h2 className="font-bold text-slate-900 tracking-tight">Admin Console</h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu size={24} className="text-slate-900" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        ${isMobileMenuOpen ? 'flex' : 'hidden'} 
        md:flex flex-col w-full md:w-64 bg-white border-r border-slate-300 md:h-screen md:sticky md:top-0 md:pt-20 z-40
      `}>
        <div className="px-6 py-6 md:py-8 flex-1">
          <h2 className="hidden md:block text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Admin Panel</h2>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors font-bold ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6 border-t border-slate-200">
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-bold hover:text-red-700 transition">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:pt-24 md:px-8 pb-12 w-full overflow-x-hidden">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 capitalize">{activeTab.replace('-', ' ')}</h1>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
              <button
                onClick={fetchStats}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium"
              >
                Refresh Stats
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: 'Active Orders', value: stats.activeOrders.toString(), icon: Package, color: 'text-slate-600 bg-slate-50' },
                { label: 'Pending Requests', value: stats.pendingRequests.toString(), icon: MessageSquare, color: 'text-accent-dark bg-slate-100' },
                { label: 'Total Customers', value: stats.totalCustomers.toString(), icon: Users, color: 'text-slate-800 bg-slate-200' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-white p-6 rounded-lg border-opacity-50 shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className={`p-4 rounded-md ${stat.color}`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                      <p className="text-xl md:text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-lg border-opacity-50 shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Plus size={20} /> Add New Product
              </h3>
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1">Product Name</label>
                  <input required value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name: e.target.value})} className="w-full px-4 py-3 rounded-md border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="e.g. Vintage Cardigan" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1">Price (₹)</label>
                  <input required type="number" value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price: e.target.value})} className="w-full px-4 py-3 rounded-md border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="4500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-900 mb-1">Description</label>
                  <textarea required rows="2" value={newProduct.description} onChange={e=>setNewProduct({...newProduct, description: e.target.value})} className="w-full px-4 py-3 rounded-md border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="A cozy standard fit..." />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1">Upload image from device</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewProduct({...newProduct, imageFile: e.target.files?.[0]})}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="submit" className="h-12 px-8 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 transition">Save Item</button>
                    {uploading && <p className="text-slate-600">Uploading image...</p>}
                    {message && <p className="text-slate-500">{message}</p>}
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-lg border-opacity-50 shadow-sm border border-slate-200">
               <h3 className="text-xl font-bold text-slate-900 mb-6">Database Items</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.length === 0 ? <p className="text-slate-500">No products found. Start by adding some.</p> : null}
                      {products.map(p => {
                        const mainImage = getFirstImage(p.images) || p.image || p.thumbnail;
                        return (
                        <div key={p._id} className="border border-slate-200 p-4 rounded-md flex items-center gap-4">
                      {mainImage ? (
                        <div className="w-16 h-16 rounded-md bg-slate-50 overflow-hidden"><img src={getImageUrl(mainImage)} className="w-full h-full object-cover"/></div>
                      ) : (
                        <div className="w-16 h-16 rounded-md bg-slate-100 flex items-center justify-center"><Package className="text-slate-400"/></div>
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 truncate">{p.name}</p>
                        <p className="text-slate-600 font-medium tracking-tight">₹{p.price}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteProduct(p._id)} 
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )})}
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white p-6 rounded-lg border-opacity-50 shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Orders ({orders.length})</h3>
              {orders.length === 0 ? (
                <p className="text-slate-500">No orders yet.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div key={o._id} className={`p-4 rounded-md border transition-all ${expandedOrderId === o._id ? 'border-brand-900 bg-white shadow-lg' : 'border-slate-200 bg-slate-50 hover:border-slate-400'}`}>
                      <div 
                        className="flex justify-between items-start gap-3 cursor-pointer select-none"
                        onClick={() => setExpandedOrderId(expandedOrderId === o._id ? null : o._id)}
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-lg mb-1">
                            Order #{o._id.slice(-6)}
                          </p>
                          <p className="text-sm text-slate-600 font-medium">
                            {o.customerDetails.firstName} {o.customerDetails.lastName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-slate-900">₹{o.totalAmount}</p>
                          <p className={`text-xs uppercase font-bold px-2 py-1 rounded-md inline-block mt-1 ${
                            o.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                            o.status === 'Processing' ? 'bg-amber-100 text-amber-700' : 
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {o.status}
                          </p>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedOrderId === o._id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: 'auto', opacity: 1 }} 
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 mt-4 border-t border-slate-200 space-y-6">
                              
                              <div className="bg-slate-50 p-4 rounded-md border border-slate-300">
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Customer Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-slate-500 font-medium">Name & Contact</p>
                                    <p className="font-bold text-slate-900">{o.customerDetails.firstName} {o.customerDetails.lastName}</p>
                                    <p className="text-slate-700">{o.customerDetails.email}</p>
                                    <p className="text-slate-700">{o.customerDetails.phone || 'Phone: N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500 font-medium">Shipping Address</p>
                                    <p className="text-slate-900">{o.customerDetails.address}</p>
                                    <p className="text-slate-900">{o.customerDetails.city} - {o.customerDetails.postalCode}</p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Order Items</h4>
                                <div className="space-y-3">
                                  {o.items?.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-3 bg-white border border-slate-200 rounded-md shadow-sm items-center">
                                      {getFirstImage(item.product?.images) ? (
                                        <img src={getImageUrl(getFirstImage(item.product.images))} className="w-16 h-16 rounded-lg object-cover bg-slate-50" />
                                      ) : (
                                        <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center"><Package className="text-slate-400" size={20}/></div>
                                      )}
                                      <div className="flex-1">
                                        <p className="font-bold text-slate-900">{item.product?.name || 'Unknown Product'}</p>
                                        <p className="text-sm text-slate-600">Size: <span className="font-bold">{item.size}</span> | Qty: <span className="font-bold">{item.quantity}</span></p>
                                        {item.comments && (
                                          <p className="text-xs text-slate-500 mt-1 italic tracking-tight bg-slate-50 p-1.5 rounded-md border border-slate-300">
                                            "{item.comments}"
                                          </p>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <p className="font-bold text-slate-900">₹{item.priceAtTime * item.quantity}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Update Status</h4>
                                <div className="flex flex-wrap gap-2">
                                  {['Processing', 'In Production', 'Shipped', 'Delivered'].map((status) => (
                                    <button
                                      key={`${o._id}-${status}`}
                                      className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                                        o.status === status 
                                          ? 'bg-indigo-600 text-white shadow-md' 
                                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                      }`}
                                      onClick={(e) => { e.stopPropagation(); updateOrderStatus(o._id, status); }}
                                    >
                                      {status}
                                    </button>
                                  ))}
                                </div>
                              </div>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'requests' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white p-6 rounded-lg border-opacity-50 shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Custom Requests ({requests.length})</h3>
              {requests.length === 0 ? (
                <p className="text-slate-500">No requests yet.</p>
              ) : (
                <div className="space-y-4">
                  {requests.map((r) => (
                    <div key={r._id} className="p-4 border border-slate-200 rounded-md">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-slate-900">{r.name}</p>
                          <p className="text-sm text-slate-600">{r.description}</p>
                          {r.measurements && (
                            <p className="text-sm text-slate-500">Measurements: {r.measurements}</p>
                          )}
                          <p className="text-xs text-slate-500">Created: {new Date(r.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            r.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            r.status === 'Reviewed' ? 'bg-blue-100 text-blue-800' :
                            r.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                      </div>
                      
                      {r.user && (
                        <div className="bg-slate-50 p-3 rounded-md border border-slate-300 mb-3">
                          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Customer Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-slate-500 font-medium">Name & Contact</p>
                              <p className="font-bold text-slate-900">{r.user.name}</p>
                              <p className="text-slate-700">{r.user.email}</p>
                              <p className="text-slate-700">{r.phone || r.user.phone || 'Phone: N/A'}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 font-medium">Address</p>
                              <p className="text-slate-900">{r.user.savedAddress || 'Address: N/A'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {r.referenceImage && (
                        <div className="mb-3">
                          <p className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Reference Image</p>
                          <img src={getImageUrl(r.referenceImage)} alt="Reference" className="w-32 h-32 object-cover rounded-md border border-slate-300" />
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Update Status</h4>
                        <div className="flex flex-wrap gap-2">
                          {['Pending', 'Reviewed', 'Accepted', 'Rejected'].map((status) => (
                            <button
                              key={`${r._id}-${status}`}
                              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                                r.status === status 
                                  ? 'bg-indigo-600 text-white shadow-md' 
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                              onClick={() => updateRequestStatus(r._id, status)}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
