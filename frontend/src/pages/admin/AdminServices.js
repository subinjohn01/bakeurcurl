import React, { useState, useEffect } from 'react';
import { AdminSidebarNav } from './AdminDashboard';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

const S = {
  page: { minHeight: '100vh', background: '#231812', display: 'flex', fontFamily: "'Inter', sans-serif", color: '#fff' },
  content: { flex: 1, padding: '2rem', overflow: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  h1: { fontSize: '1.6rem', fontWeight: '800', fontFamily: "'Playfair Display', serif" },
  addBtn: { padding: '0.7rem 1.4rem', background: 'linear-gradient(135deg, #A87A51, #754B2E)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' },
  card: { background: 'rgba(251,246,238,0.04)', border: '1px solid rgba(251,246,238,0.08)', borderRadius: '12px', overflow: 'hidden' },
  cardImg: { width: '100%', height: '160px', objectFit: 'cover', background: 'rgba(168,122,81,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' },
  cardBody: { padding: '1.25rem' },
  cardTitle: { fontWeight: '700', fontSize: '1rem', marginBottom: '0.35rem' },
  cardMeta: { color: 'rgba(251,246,238,0.5)', fontSize: '0.8rem', marginBottom: '0.75rem' },
  cardPrice: { color: '#E8B4A0', fontWeight: '700', fontSize: '1.1rem', marginBottom: '1rem' },
  cardActions: { display: 'flex', gap: '0.5rem' },
  editBtn: { flex: 1, padding: '0.5rem', background: 'rgba(168,122,81,0.15)', border: '1px solid rgba(168,122,81,0.3)', borderRadius: '6px', color: '#D4AF8F', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' },
  delBtn: { flex: 1, padding: '0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px', color: '#f87171', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' },
  catBadge: { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700', background: 'rgba(168,122,81,0.15)', color: '#D4AF8F', marginBottom: '0.5rem' },
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

const emptyForm = { name: '', description: '', price: '', duration: '', category: 'haircut', image: '', isActive: true };

const catEmoji = { haircut: '✂️', treatment: '💆', styling: '💇', coloring: '🎨' };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await axiosInstance.get('/services');
      setServices(res.data.data || []);
    } catch { toast.error('Failed to load services'); }
  };

  const openAdd = () => { setForm(emptyForm); setEditing(null); setShowModal(true); };
  const openEdit = (s) => { setForm({ name: s.name, description: s.description, price: s.price, duration: s.duration, category: s.category, image: s.image || '', isActive: s.isActive }); setEditing(s._id); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.duration) return toast.error('Name, price & duration required');
    setLoading(true);
    try {
      if (editing) {
        await axiosInstance.put(`/services/${editing}`, form);
        toast.success('Service updated!');
      } else {
        await axiosInstance.post('/services', form);
        toast.success('Service added!');
      }
      setShowModal(false);
      fetchServices();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this serviceA')) return;
    try {
      await axiosInstance.delete(`/services/${id}`);
      toast.success('Service deleted');
      fetchServices();
    } catch { toast.error('Failed to delete'); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <div style={S.page}>
      <AdminSidebarNav active="/admin/services" />
      <div style={S.content}>
        <div style={S.header}>
          <h1 style={S.h1}>Services Management</h1>
          <button style={S.addBtn} onClick={openAdd}>+ Add Service</button>
        </div>

        <div style={S.grid}>
          {services.map(s => (
            <div key={s._id} style={S.card}>
              <div style={S.cardImg}>
                {s.image ? <img src={s.image} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : catEmoji[s.category] || '✂️'}
              </div>
              <div style={S.cardBody}>
                <div style={S.catBadge}>{s.category}</div>
                <div style={S.cardTitle}>{s.name}</div>
                <div style={S.cardMeta}>{s.duration} min &nbsp;·&nbsp; {s.descriptio.slice(0, 60)}{s.descriptio.length > 60 ? '...' : ''}</div>
                <div style={S.cardPrice}>${s.price}</div>
                <div style={S.cardActions}>
                  <button style={S.editBtn} onClick={() => openEdit(s)}>✏️ Edit</button>
                  <button style={S.delBtn} onClick={() => handleDelete(s._id)}>🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div style={{ color: 'rgba(251,246,238,0.35)', gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>
              No services yet. Click "+ Add Service" to get started.
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={S.overlay} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h2 style={S.mh2}>{editing ? 'Edit Service' : 'Add New Service'}</h2>
            <form onSubmit={handleSave}>
              <label style={S.label}>Service Name *</label>
              <input style={S.minput} name="name" value={form.name} onChange={handleChange} placeholder="e.g. Curly Hair Cut & Style" />
              <label style={S.label}>Description</label>
              <input style={S.minput} name="description" value={form.description} onChange={handleChange} placeholder="Brief description..." />
              <div style={S.row2}>
                <div>
                  <label style={S.label}>Price (₹) *</label>
                  <input style={S.minput} name="price" type="number" value={form.price} onChange={handleChange} placeholder="1500" />
                </div>
                <div>
                  <label style={S.label}>Duration (mins) *</label>
                  <input style={S.minput} name="duration" type="number" value={form.duration} onChange={handleChange} placeholder="60" />
                </div>
              </div>
              <label style={S.label}>Category</label>
              <select style={S.mselect} name="category" value={form.category} onChange={handleChange}>
                <option value="haircut">Haircut</option>
                <option value="treatment">Treatment</option>
                <option value="styling">Styling</option>
                <option value="coloring">Coloring</option>
              </select>
              <label style={S.label}>Image URL</label>
              <input style={S.minput} name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
              <label style={{ ...S.label, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                Active (visible to customers)
              </label>
              <div style={S.mBtns}>
                <button type="submit" style={{ ...S.saveBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                  {loading ? 'Saving...' : editing ? 'Update Service' : 'Add Service'}
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
