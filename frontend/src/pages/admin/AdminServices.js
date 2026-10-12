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

const initialCategories = ['Hair', 'Coloring', 'Treatments', 'Skincare', 'Waxing', 'Threading', 'Bridal & Makeup'];

const catEmoji = {
  'Hair': '✂️',
  'Coloring': '🎨',
  'Treatments': '💆‍♀️',
  'Skincare': '✨',
  'Waxing': '🍯',
  'Threading': '🪡',
  'Bridal & Makeup': '👑',
  'haircut': '✂️',
  'treatment': '💆‍♀️',
  'styling': '💇‍♀️',
  'coloring': '🎨',
};

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('buc_custom_categories');
      return saved ? JSON.parse(saved) : initialCategories;
    } catch {
      return initialCategories;
    }
  });
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [isAddingCustomCat, setIsAddingCustomCat] = useState(false);
  const [customCatInput, setCustomCatInput] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', duration: '', category: 'Hair', image: '', isActive: true });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await axiosInstance.get('/services', { params: { includeInactive: true } });
      const list = Array.isArray(res.data?.services)
        ? res.data.services
        : Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setServices(list);

      // Merge any new categories found in backend with active categories list
      const fromServices = Array.from(new Set(list.map((s) => s.category).filter(Boolean)));
      setCategories((prev) => {
        const merged = Array.from(new Set([...prev, ...fromServices]));
        localStorage.setItem('buc_custom_categories', JSON.stringify(merged));
        return merged;
      });
    } catch { toast.error('Failed to load services'); }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const trimmed = newCatInput.trim();
    if (!trimmed) return toast.error('Please enter a category name');
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      return toast.error('Category already exists');
    }
    const updated = [...categories, trimmed];
    setCategories(updated);
    localStorage.setItem('buc_custom_categories', JSON.stringify(updated));
    setNewCatInput('');
    toast.success(`Category "${trimmed}" added! ✨`);
  };

  const handleDeleteCategory = (catToDelete) => {
    if (categories.length <= 1) return toast.error('At least one category must remain');
    const inUse = services.filter((s) => s.category?.toLowerCase() === catToDelete.toLowerCase()).length;
    if (inUse > 0) {
      if (!window.confirm(`Category "${catToDelete}" is currently used by ${inUse} service(s). Remove anyway?`)) {
        return;
      }
    }
    const updated = categories.filter((c) => c !== catToDelete);
    setCategories(updated);
    localStorage.setItem('buc_custom_categories', JSON.stringify(updated));
    toast.success(`Category "${catToDelete}" removed`);
  };

  const openAdd = () => {
    setForm({ name: '', description: '', price: '', duration: '', category: categories[0] || 'Hair', image: '', isActive: true });
    setIsAddingCustomCat(false);
    setCustomCatInput('');
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setForm({
      name: s.name,
      description: s.description,
      price: s.price,
      duration: s.duration,
      category: s.category || categories[0] || 'Hair',
      image: s.image || '',
      isActive: s.isActive !== false,
    });
    setIsAddingCustomCat(false);
    setCustomCatInput('');
    setEditing(s._id);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.duration) return toast.error('Name, price & duration required');

    let finalCategory = form.category;
    if (isAddingCustomCat) {
      const customTrimmed = customCatInput.trim();
      if (!customTrimmed) return toast.error('Please enter a custom category name or select existing');
      finalCategory = customTrimmed;
      if (!categories.includes(customTrimmed)) {
        const updated = [...categories, customTrimmed];
        setCategories(updated);
        localStorage.setItem('buc_custom_categories', JSON.stringify(updated));
      }
    }

    setLoading(true);
    try {
      const payload = { ...form, category: finalCategory };
      if (editing) {
        await axiosInstance.put(`/services/${editing}`, payload);
        toast.success('Service updated!');
      } else {
        await axiosInstance.post('/services', payload);
        toast.success('Service added!');
      }
      setShowModal(false);
      fetchServices();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service? It will be removed from the services page.')) return;
    try {
      await axiosInstance.delete(`/services/${id}`);
      toast.success('Service deleted successfully');
      fetchServices();
    } catch { toast.error('Failed to delete service'); }
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
          <div>
            <h1 style={S.h1}>Services Management</h1>
            <p style={{ color: 'rgba(251,246,238,0.5)', fontSize: '0.85rem', marginTop: 4 }}>
              Configure salon services and categories. All updates reflect live across the site.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowCatModal(true)}
              style={{
                padding: '0.7rem 1.2rem',
                borderRadius: '8px',
                background: 'rgba(251,246,238,0.06)',
                border: '1px solid rgba(241,213,146,0.3)',
                color: '#F1D592',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              🏷️ Manage Categories ({categories.length})
            </button>
            <button style={S.addBtn} onClick={openAdd}>+ Add Service</button>
          </div>
        </div>

        <div style={S.grid}>
          {services.map(s => (
            <div key={s._id} style={S.card}>
              <div style={S.cardImg}>
                {s.image ? <img src={s.image} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : catEmoji[s.category] || '✂️'}
              </div>
              <div style={S.cardBody}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={S.catBadge}>{s.category}</div>
                  {!s.isActive && (
                    <span style={{ fontSize: '0.7rem', color: '#F87171', background: 'rgba(248,113,113,0.15)', padding: '2px 8px', borderRadius: 10 }}>
                      Hidden
                    </span>
                  )}
                </div>
                <div style={S.cardTitle}>{s.name}</div>
                <div style={S.cardMeta}>
                  {s.duration} min &nbsp;·&nbsp; {s.description ? (s.description.length > 60 ? `${s.description.slice(0, 60)}...` : s.description) : 'No description'}
                </div>
                <div style={S.cardPrice}>₹{s.price}</div>
                <div style={S.cardActions}>
                  <button style={S.editBtn} onClick={() => openEdit(s)}>✏️ Edit</button>
                  <button style={S.delBtn} onClick={() => handleDelete(s._id)}>🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div style={{ color: 'rgba(251,246,238,0.35)', gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>
              No services found. Click "+ Add Service" to add one!
            </div>
          )}
        </div>
      </div>

      {/* Service Add/Edit Modal */}
      {showModal && (
        <div style={S.overlay} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h2 style={S.mh2}>{editing ? 'Edit Service' : 'Add New Service'}</h2>
            <form onSubmit={handleSave}>
              <label style={S.label}>Service Name *</label>
              <input style={S.minput} name="name" value={form.name} onChange={handleChange} placeholder="e.g. Curly Hair Dry Cut & Styling" required />
              <label style={S.label}>Description *</label>
              <input style={S.minput} name="description" value={form.description} onChange={handleChange} placeholder="Describe the service..." required />
              <div style={S.row2}>
                <div>
                  <label style={S.label}>Price (₹) *</label>
                  <input style={S.minput} name="price" type="number" value={form.price} onChange={handleChange} placeholder="1499" required />
                </div>
                <div>
                  <label style={S.label}>Duration (mins) *</label>
                  <input style={S.minput} name="duration" type="number" value={form.duration} onChange={handleChange} placeholder="60" required />
                </div>
              </div>

              {/* Configurable Category Selection */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ ...S.label, marginBottom: 0 }}>Category *</label>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomCat(!isAddingCustomCat)}
                    style={{ fontSize: '0.75rem', color: '#F1D592', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    {isAddingCustomCat ? '← Select from list' : '+ Type new category'}
                  </button>
                </div>

                {!isAddingCustomCat ? (
                  <select
                    style={{
                      ...S.mselect,
                      marginBottom: 0,
                      backgroundColor: '#231812',
                      color: '#FBF6EE',
                    }}
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c} style={{ background: '#231812', color: '#FBF6EE' }}>
                        {c}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    style={{ ...S.minput, marginBottom: 0 }}
                    value={customCatInput}
                    onChange={(e) => setCustomCatInput(e.target.value)}
                    placeholder="Enter new category name (e.g. Scalp Spa, Highlights)"
                    autoFocus
                  />
                )}
              </div>

              <label style={S.label}>Image URL (optional)</label>
              <input style={S.minput} name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
              <label style={{ ...S.label, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                Active (visible on website & booking page)
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

      {/* Category Manager Modal */}
      {showCatModal && (
        <div style={S.overlay} onClick={() => setShowCatModal(false)}>
          <div style={{ ...S.modal, maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ ...S.mh2, marginBottom: 0 }}>🏷️ Manage Categories</h2>
              <button
                onClick={() => setShowCatModal(false)}
                style={{ color: 'rgba(251,246,238,0.5)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <p style={{ color: 'rgba(251,246,238,0.6)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Add new categories or delete unused ones. Categories organize services on your public website.
            </p>

            {/* Add Category Input */}
            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
              <input
                style={{ ...S.minput, marginBottom: 0, flex: 1 }}
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                placeholder="New category name..."
              />
              <button type="submit" style={S.saveBtn}>+ Add</button>
            </form>

            {/* Category List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {categories.map((cat) => {
                const count = services.filter((s) => s.category?.toLowerCase() === cat.toLowerCase()).length;
                return (
                  <div
                    key={cat}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: 'rgba(251,246,238,0.05)',
                      border: '1px solid rgba(251,246,238,0.1)',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: '#F1D592', fontSize: '0.9rem' }}>{cat}</span>
                      <span style={{ color: 'rgba(251,246,238,0.4)', fontSize: '0.75rem', marginLeft: 8 }}>
                        ({count} {count === 1 ? 'service' : 'services'})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      style={{ color: '#F87171', fontSize: '0.85rem', cursor: 'pointer', padding: '4px 8px', borderRadius: 4 }}
                      title="Remove category"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button style={S.cancelBtn} onClick={() => setShowCatModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
