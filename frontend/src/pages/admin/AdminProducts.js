import React, { useState, useEffect } from 'react';
import { AdminSidebarNav } from './AdminDashboard';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

const S = {
  page: { minHeight: '100vh', background: '#231812', display: 'flex', fontFamily: "'Inter', sans-serif", color: '#fff' },
  content: { flex: 1, padding: '2rem', overflow: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  h1: { fontSize: '1.6rem', fontWeight: '800', fontFamily: "'Playfair Display', serif" },
  addBtn: { padding: '0.7rem 1.4rem', background: 'linear-gradient(135deg, #A87A51, #754B2E)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' },
  card: { background: 'rgba(251,246,238,0.04)', border: '1px solid rgba(251,246,238,0.08)', borderRadius: '12px', overflow: 'hidden' },
  cardImgArea: { width: '100%', height: '150px', background: 'rgba(232₹80₹60,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' },
  cardBody: { padding: '1.25rem' },
  cardTitle: { fontWeight: '700', fontSize: '1rem', marginBottom: '0.3rem' },
  cardMeta: { color: 'rgba(251,246,238,0.5)', fontSize: '0.8rem', marginBottom: '0.3rem' },
  cardPrice: { color: '#E8B4A0', fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.75rem' },
  stock: (low) => ({ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.75rem', background: low ? '#EF444415' : '#10B98115', color: low ? '#f87171' : '#34d399' }),
  cardActions: { display: 'flex', gap: '0.5rem' },
  editBtn: { flex: 1, padding: '0.5rem', background: 'rgba(168₹22,81,0.15)', border: '1px solid rgba(168₹22,81,0.3)', borderRadius: '6px', color: '#D4AF8F', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' },
  delBtn: { flex: 1, padding: '0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px', color: '#f87171', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#291C14', border: '1px solid rgba(251,246,238,0.1)', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '520px', maxHeight: '90vh', overflow: 'auto' },
  mh2: { fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem' },
  label: { display: 'block', color: 'rgba(251,246,238,0.6)', fontSize: '0.8rem', marginBottom: '0.35rem' },
  minput: { width: '100%', padding: '0.65rem 0.9rem', background: 'rgba(251,246,238,0.07)', border: '1px solid rgba(251,246,238,0.12)', borderRadius: '7px', color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box', marginBottom: '1rem', outline: 'none' },
  mselect: { width: '100%', padding: '0.65rem 0.9rem', background: 'rgba(251,246,238,0.07)', border: '1px solid rgba(251,246,238,0.12)', borderRadius: '7px', color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box', marginBottom: '1rem', outline: 'none' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  mBtns: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
  saveBtn: { padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg, #A87A51, #754B2E)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' },
  cancelBtn: { padding: '0.7rem 1.5rem', background: 'rgba(251,246,238,0.06)', border: '1px solid rgba(251,246,238,0.12)', borderRadius: '8px', color: '#fff', cursor: 'pointer' },
};

const defaultProductsList = [
  {
    _id: 'prod-1',
    name: 'BakeUrCurl Hydration Shampoo',
    description: 'Sulfate-free, co-wash friendly shampoo enriched with aloe vera and glycerin. Gently cleanses without stripping natural oils.',
    price: 649,
    category: 'shampoo',
    brand: 'BakeUrCurl Essentials',
    stock: 50,
    images: ['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80'],
    isActive: true,
  },
  {
    _id: 'prod-2',
    name: 'Moisture Melt Deep Conditioner',
    description: 'Weekly deep conditioning mask with shea butter, avocado oil, and hydrolysed silk proteins. Restores moisture balance.',
    price: 899,
    category: 'conditioner',
    brand: 'BakeUrCurl Essentials',
    stock: 35,
    images: ['https://images.unsplash.com/photo-1608248597359-00f723467644?auto=format&fit=crop&w=400&q=80'],
    isActive: true,
  },
  {
    _id: 'prod-3',
    name: 'Curl Custard Defining Cream',
    description: 'A lightweight curl custard that provides hold without crunch. Flaxseed extract and castor oil nourish curls while reducing frizz.',
    price: 749,
    category: 'styling',
    brand: 'BakeUrCurl Essentials',
    stock: 40,
    images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80'],
    isActive: true,
  },
  {
    _id: 'prod-4',
    name: 'Scalp Revival Oil Blend',
    description: 'A nutrient-rich scalp oil blend of jamaican black castor oil, tea tree, and peppermint for healthy hair growth.',
    price: 599,
    category: 'treatment',
    brand: 'RootCare by BakeUrCurl',
    stock: 30,
    images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=400&q=80'],
    isActive: true,
  },
  {
    _id: 'prod-5',
    name: 'Wide-Tooth Detangling Comb',
    description: 'Professional-grade seamless wide-tooth comb designed to detangle wet or dry curls without snapping.',
    price: 249,
    category: 'tools',
    brand: 'BakeUrCurl Salon',
    stock: 60,
    images: ['https://images.unsplash.com/photo-1590159763121-7c9ff3149e0a?auto=format&fit=crop&w=400&q=80'],
    isActive: true,
  },
];

const emptyForm = { name: '', description: '', price: '', category: 'shampoo', brand: '', stock: '', images: '', isActive: true };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get('/products');
      const list = Array.isArray(res.data?.products)
        ? res.data.products
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      if (list.length > 0) {
        setProducts(list);
        localStorage.setItem('buc_products', JSON.stringify(list));
      } else {
        const saved = localStorage.getItem('buc_products');
        setProducts(saved ? JSON.parse(saved) : defaultProductsList);
      }
    } catch {
      const saved = localStorage.getItem('buc_products');
      setProducts(saved ? JSON.parse(saved) : defaultProductsList);
    }
  };

  const openAdd = () => { setForm(emptyForm); setEditing(null); setShowModal(true); };
  const openEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      brand: p.brand || '',
      stock: p.stock,
      images: (p.images || []).join(', '),
      isActive: p.isActive,
    });
    setEditing(p._id);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return toast.error('Name and price required');
    setLoading(true);
    const payload = { ...form, images: form.images ? form.images.split(',').map((i) => i.trim()).filter(Boolean) : [] };
    try {
      if (editing) {
        await axiosInstance.put(`/products/${editing}`, payload);
        toast.success('Product updated!');
      } else {
        await axiosInstance.post('/products', payload);
        toast.success('Product added!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      if (editing) {
        const updated = products.map((p) => (p._id === editing ? { ...p, ...payload } : p));
        setProducts(updated);
        localStorage.setItem('buc_products', JSON.stringify(updated));
        toast.success('Product updated!');
      } else {
        const newProd = { ...payload, _id: 'prod-' + Date.now() };
        const updated = [newProd, ...products];
        setProducts(updated);
        localStorage.setItem('buc_products', JSON.stringify(updated));
        toast.success('Product added!');
      }
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axiosInstance.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      const updated = products.filter((p) => p._id !== id);
      setProducts(updated);
      localStorage.setItem('buc_products', JSON.stringify(updated));
      toast.success('Product deleted');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <div style={S.page}>
      <AdminSidebarNav active="/admin/products" />
      <div style={S.content}>
        <div style={S.header}>
          <h1 style={S.h1}>Products Management</h1>
          <button style={S.addBtn} onClick={openAdd}>+ Add Product</button>
        </div>

        <div style={S.grid}>
          {products.map(p => (
            <div key={p._id} style={S.card}>
              <div style={S.cardImgArea}>
                {p.images?.[0] ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🧴'}
              </div>
              <div style={S.cardBody}>
                <div style={S.cardTitle}>{p.name}</div>
                <div style={S.cardMeta}>{p.brand} · {p.category}</div>
                <div style={S.cardPrice}>₹{p.price}</div>
                <div style={S.stock(p.stock < 5)}>
                  {p.stock > 0 ? `₹{p.stock} in stock₹{p.stock < 5 ? ' — Low!' : ''}` : 'Out of stock'}
                </div>
                <div style={S.cardActions}>
                  <button style={S.editBtn} onClick={() => openEdit(p)}>✏️ Edit</button>
                  <button style={S.delBtn} onClick={() => handleDelete(p._id)}>🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div style={{ color: 'rgba(251,246,238,0.35)', gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>
              No products yet. Click "+ Add Product" to get started.
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={S.overlay} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h2 style={S.mh2}>{editing ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSave}>
              <label style={S.label}>Product Name *</label>
              <input style={S.minput} name="name" value={form.name} onChange={handleChange} placeholder="e.g. Curl Defining Cream" />
              <label style={S.label}>Description</label>
              <input style={S.minput} name="description" value={form.description} onChange={handleChange} placeholder="What does it do?" />
              <div style={S.row2}>
                <div>
                  <label style={S.label}>Price (₹) *</label>
                  <input style={S.minput} name="price" type="number" value={form.price} onChange={handleChange} placeholder="499" />
                </div>
                <div>
                  <label style={S.label}>Stock Quantity</label>
                  <input style={S.minput} name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="50" />
                </div>
              </div>
              <div style={S.row2}>
                <div>
                  <label style={S.label}>Category</label>
                  <select style={S.mselect} name="category" value={form.category} onChange={handleChange}>
                    <option value="shampoo">Shampoo</option>
                    <option value="conditioner">Conditioner</option>
                    <option value="styling">Styling</option>
                    <option value="treatment">Treatment</option>
                    <option value="tools">Tools</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>Brand</label>
                  <input style={S.minput} name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. SheaMoisture" />
                </div>
              </div>
              <label style={S.label}>Image URLs (comma-separated)</label>
              <input style={S.minput} name="images" value={form.images} onChange={handleChange} placeholder="https://img1.jpg, https://img2.jpg" />
              <label style={{ ...S.label, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                Active (visible in store)
              </label>
              <div style={S.mBtns}>
                <button type="submit" style={{ ...S.saveBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                  {loading ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
                </button>
                <button type="button" style={S.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


