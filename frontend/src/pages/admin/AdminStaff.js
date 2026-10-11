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
  card: { background: 'rgba(251,246,238,0.04)', border: '1px solid rgba(251,246,238,0.08)', borderRadius: '12px', padding: '1.5rem' },
  avatar: { width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #A87A51, #754B2E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' },
  staffName: { fontWeight: '700', fontSize: '1rem', marginBottom: '0.2rem' },
  staffSpec: { color: '#E8B4A0', fontSize: '0.8rem', marginBottom: '0.25rem' },
  staffEmail: { color: 'rgba(251,246,238,0.45)', fontSize: '0.8rem', marginBottom: '1rem' },
  cardActions: { display: 'flex', gap: '0.5rem' },
  editBtn: { flex: 1, padding: '0.5rem', background: 'rgba(168₹22,81,0.15)', border: '1px solid rgba(168₹22,81,0.3)', borderRadius: '6px', color: '#D4AF8F', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' },
  delBtn: { flex: 1, padding: '0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px', color: '#f87171', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#291C14', border: '1px solid rgba(251,246,238,0.1)', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '480px' },
  mh2: { fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem' },
  label: { display: 'block', color: 'rgba(251,246,238,0.6)', fontSize: '0.8rem', marginBottom: '0.35rem' },
  minput: { width: '100%', padding: '0.65rem 0.9rem', background: 'rgba(251,246,238,0.07)', border: '1px solid rgba(251,246,238,0.12)', borderRadius: '7px', color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box', marginBottom: '1rem', outline: 'none' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  mBtns: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
  saveBtn: { padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg, #A87A51, #754B2E)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' },
  cancelBtn: { padding: '0.7rem 1.5rem', background: 'rgba(251,246,238,0.06)', border: '1px solid rgba(251,246,238,0.12)', borderRadius: '8px', color: '#fff', cursor: 'pointer' },
  roleBadge: { display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '700', background: 'rgba(16₹85₹29,0.15)', color: '#34d399', marginBottom: '0.5rem' },
};

const emptyForm = { name: '', email: '', phone: '', password: '', specialization: '', bio: '', role: 'staff' };

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    try {
      const res = await axiosInstance.get('/staff');
      setStaff((res.data.data || []).filter(s => s.role === 'staff'));
    } catch { toast.error('Failed to load staff'); }
  };

  const openAdd = () => { setForm(emptyForm); setEditing(null); setShowModal(true); };
  const openEdit = (s) => {
    setForm({ name: s.name, email: s.email, phone: s.phone || '', password: '', specialization: s.specialization || '', bio: s.bio || '', role: 'staff' });
    setEditing(s._id); setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error('Name and email required');
    if (!editing && !form.password) return toast.error('Password required for new staff');
    setLoading(true);
    try {
      const payload = { ...form };
      if (editing && !payload.password) delete payload.password;
      if (editing) { await axiosInstance.put(`/staff/₹{editing}`, payload); toast.success('Staff updated!'); }
      else { await axiosInstance.post('/staff', payload); toast.success('Staff member added!'); }
      setShowModal(false); fetchStaff();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this staff memberA')) return;
    try { await axiosInstance.delete(`/staff/₹{id}`); toast.success('Staff removed'); fetchStaff(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : 'A';

  return (
    <div style={S.page}>
      <AdminSidebarNav active="/admin/staff" />
      <div style={S.content}>
        <div style={S.header}>
          <h1 style={S.h1}>Staff Management</h1>
          <button style={S.addBtn} onClick={openAdd}>+ Add Staff</button>
        </div>

        <div style={S.grid}>
          {staff.map(s => (
            <div key={s._id} style={S.card}>
              <div style={S.avatar}>{getInitial(s.name)}</div>
              <div style={S.roleBadge}>STYLIST</div>
              <div style={S.staffName}>{s.name}</div>
              {s.specialization && <div style={S.staffSpec}>✂️ {s.specialization}</div>}
              <div style={S.staffEmail}>{s.email}</div>
              {s.phone && <div style={{ ...S.staffEmail, marginBottom: '1rem' }}>📞 {s.phone}</div>}
              {s.bio && <div style={{ color: 'rgba(251,246,238,0.45)', fontSize: '0.8rem', marginBottom: '1rem', lineHeight: '1.4' }}>{s.bio}</div>}
              <div style={S.cardActions}>
                <button style={S.editBtn} onClick={() => openEdit(s)}>✏️ Edit</button>
                <button style={S.delBtn} onClick={() => handleDelete(s._id)}>🗑️ Remove</button>
              </div>
            </div>
          ))}
          {staff.length === 0 && (
            <div style={{ color: 'rgba(251,246,238,0.35)', gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>
              No staff members yet. Add your stylists!
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={S.overlay} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h2 style={S.mh2}>{editing ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
            <form onSubmit={handleSave}>
              <div style={S.row2}>
                <div>
                  <label style={S.label}>Full Name *</label>
                  <input style={S.minput} name="name" value={form.name} onChange={handleChange} placeholder="Zara Khan" />
                </div>
                <div>
                  <label style={S.label}>Phone</label>
                  <input style={S.minput} name="phone" value={form.phone} onChange={handleChange} placeholder="+91 99..." />
                </div>
              </div>
              <label style={S.label}>Email *</label>
              <input style={S.minput} name="email" type="email" value={form.email} onChange={handleChange} placeholder="zara@BakeUrCurls.com" />
              <label style={S.label}>Password {editing ? '(leave blank to keep)' : '*'}</label>
              <input style={S.minput} name="password" type="password" value={form.password} onChange={handleChange} placeholder={editing ? 'Leave blank to keep current' : 'Min 6 chars'} />
              <label style={S.label}>Specialization</label>
              <input style={S.minput} name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Curly Hair Expert, Color Specialist" />
              <label style={S.label}>Bio</label>
              <input style={S.minput} name="bio" value={form.bio} onChange={handleChange} placeholder="Short bio about the stylist..." />
              <div style={S.mBtns}>
                <button type="submit" style={{ ...S.saveBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                  {loading ? 'Saving...' : editing ? 'Update' : 'Add Staff'}
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
