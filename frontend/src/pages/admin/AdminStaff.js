import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { getServices } from '../../api/services';
import AdminSidebarNav from '../../components/admin/Sidebar';
import toast from 'react-hot-toast';

const S = {
  page: { minHeight: '100vh', background: '#231812', display: 'flex', fontFamily: "'Inter', sans-serif", color: '#FBF6EE' },
  content: { flex: 1, padding: '2.5rem', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' },
  h1: { fontSize: '2rem', fontWeight: '800', fontFamily: "'Playfair Display', serif", color: '#F1D592' },
  addBtn: {
    padding: '0.75rem 1.6rem',
    background: 'linear-gradient(135deg, #A87A51, #754B2E)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.95rem',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  card: {
    background: 'rgba(251,246,238,0.04)',
    border: '1px solid rgba(168,122,81,0.25)',
    borderRadius: '16px',
    padding: '1.75rem',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  avatarContainer: { width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '2px solid #D4AF37', marginBottom: '1rem', background: '#18100B' },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarFallback: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 800, color: '#F1D592', background: 'linear-gradient(135deg, #A87A51, #754B2E)' },
  staffName: { fontWeight: '700', fontSize: '1.2rem', color: '#F1D592', marginBottom: '0.3rem' },
  staffSpec: { color: '#E8B4A0', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' },
  staffContact: { color: 'rgba(251,246,238,0.75)', fontSize: '0.85rem', marginBottom: '0.35rem' },
  staffBio: { color: 'rgba(251,246,238,0.65)', fontSize: '0.85rem', lineHeight: '1.5', margin: '0.75rem 0', fontStyle: 'italic' },
  skillsContainer: { display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '0.85rem 0' },
  skillBadge: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.35)', color: '#F1D592' },
  cardActions: { display: 'flex', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid rgba(251,246,238,0.08)', paddingTop: '1rem' },
  editBtn: { flex: 1, padding: '0.6rem', background: 'rgba(168,122,81,0.2)', border: '1px solid rgba(168,122,81,0.4)', borderRadius: '8px', color: '#F1D592', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  delBtn: { flex: 1, padding: '0.6rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#F87171', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
  modal: { background: '#251912', border: '1px solid rgba(168,122,81,0.4)', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' },
  mh2: { fontSize: '1.4rem', fontWeight: '700', marginBottom: '1.5rem', color: '#F1D592', fontFamily: "'Playfair Display', serif" },
  label: { display: 'block', color: 'rgba(251,246,238,0.75)', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: '500' },
  minput: { width: '100%', padding: '0.75rem 1rem', background: 'rgba(251,246,238,0.06)', border: '1px solid rgba(251,246,238,0.15)', borderRadius: '8px', color: '#FBF6EE', fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: '1rem', outline: 'none' },
  textarea: { width: '100%', padding: '0.75rem 1rem', minHeight: '80px', background: 'rgba(251,246,238,0.06)', border: '1px solid rgba(251,246,238,0.15)', borderRadius: '8px', color: '#FBF6EE', fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: '1rem', outline: 'none', resize: 'vertical' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  mBtns: { display: 'flex', gap: '1rem', marginTop: '1.5rem' },
  saveBtn: { flex: 1, padding: '0.85rem', background: 'linear-gradient(135deg, #A87A51, #754B2E)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' },
  cancelBtn: { padding: '0.85rem 1.5rem', background: 'rgba(251,246,238,0.08)', border: '1px solid rgba(251,246,238,0.15)', borderRadius: '10px', color: '#FBF6EE', cursor: 'pointer', fontWeight: '600' },
};

const defaultExperienceOptions = [
  'Haircut',
  'Manicure/Pedicure',
  'Facial',
  'Hair Coloring',
  'Waxing',
  'Threading',
];

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  specialization: '',
  bio: '',
  avatar: '',
  skills: [],
};

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [availableServices, setAvailableServices] = useState(defaultExperienceOptions);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStaff();
    loadSalonServices();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axiosInstance.get('/staff');
      const list = res.data?.staff || res.data?.data || [];
      setStaff(list);
    } catch {
      toast.error('Failed to load stylists list');
    }
  };

  const loadSalonServices = async () => {
    try {
      const res = await getServices();
      const services = res.data?.services || [];
      const serviceNames = services.map(s => s.name);
      // Merge default options with any custom services added by admin
      const merged = Array.from(new Set([...defaultExperienceOptions, ...serviceNames]));
      setAvailableServices(merged);
    } catch {
      setAvailableServices(defaultExperienceOptions);
    }
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setForm({
      name: s.name,
      email: s.email,
      phone: s.phone || '',
      password: '',
      specialization: s.specialization || '',
      bio: s.bio || '',
      avatar: s.avatar || '',
      skills: Array.isArray(s.skills) ? s.skills : [],
    });
    setEditing(s._id);
    setShowModal(true);
  };

  const toggleSkill = (skill) => {
    setForm(prev => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill],
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error('Stylist name and email are required');
    if (!editing && !form.password) return toast.error('Password required for new stylist login');
    setLoading(true);
    try {
      const payload = { ...form };
      if (editing && !payload.password) delete payload.password;
      if (editing) {
        await axiosInstance.put(`/staff/${editing}`, payload);
        toast.success('Stylist profile updated!');
      } else {
        await axiosInstance.post('/staff', payload);
        toast.success('Stylist added successfully!');
      }
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save stylist');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this stylist?')) return;
    try {
      await axiosInstance.delete(`/staff/${id}`);
      toast.success('Stylist deactivated');
      fetchStaff();
    } catch {
      toast.error('Failed to remove stylist');
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div style={S.page}>
      <AdminSidebarNav active="/admin/staff" />
      <div style={S.content}>
        <div style={S.header}>
          <div>
            <h1 style={S.h1}>Stylists & Staff Management</h1>
            <p style={{ color: 'rgba(251,246,238,0.6)', marginTop: 4 }}>
              Configure your salon team, upload photos, contact info, biodata, and service skills.
            </p>
          </div>
          <button style={S.addBtn} onClick={openAdd}>+ Add Stylist</button>
        </div>

        <div style={S.grid}>
          {staff.map(s => (
            <div key={s._id} style={S.card}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={S.avatarContainer}>
                    {s.avatar ? (
                      <img src={s.avatar} alt={s.name} style={S.avatarImg} onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div style={S.avatarFallback}>{s.name?.charAt(0).toUpperCase()}</div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 8, background: 'rgba(52,211,153,0.15)', color: '#34D399', fontWeight: 700 }}>
                    ACTIVE
                  </span>
                </div>

                <div style={S.staffName}>{s.name}</div>
                <div style={S.staffSpec}>✨ {s.specialization || 'Curl Stylist'}</div>
                <div style={S.staffContact}>📞 {s.phone || 'No phone added'}</div>
                <div style={S.staffContact}>✉️ {s.email}</div>

                {s.bio && <div style={S.staffBio}>"{s.bio}"</div>}

                {/* Experience / Skills Badges */}
                <div style={{ marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(251,246,238,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Experience & Skills:
                  </span>
                  <div style={S.skillsContainer}>
                    {s.skills && s.skills.length > 0 ? (
                      s.skills.map(sk => <span key={sk} style={S.skillBadge}>{sk}</span>)
                    ) : (
                      <span style={{ color: 'rgba(251,246,238,0.4)', fontSize: '0.8rem' }}>All General Services</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={S.cardActions}>
                <button style={S.editBtn} onClick={() => openEdit(s)}>✏️ Edit Profile</button>
                <button style={S.delBtn} onClick={() => handleDelete(s._id)}>🗑️ Remove</button>
              </div>
            </div>
          ))}

          {staff.length === 0 && (
            <div style={{ color: 'rgba(251,246,238,0.4)', gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
              No stylists registered yet. Click <strong>+ Add Stylist</strong> to get started!
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={S.overlay} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h2 style={S.mh2}>{editing ? 'Edit Stylist Profile' : 'Add New Stylist'}</h2>
            <form onSubmit={handleSave}>
              <div style={S.row2}>
                <div>
                  <label style={S.label}>Stylist Full Name *</label>
                  <input style={S.minput} name="name" value={form.name} onChange={handleChange} placeholder="e.g. Zara Khan" required />
                </div>
                <div>
                  <label style={S.label}>Contact Phone Number *</label>
                  <input style={S.minput} name="phone" value={form.phone} onChange={handleChange} placeholder="+91 70120 00000" required />
                </div>
              </div>

              <div style={S.row2}>
                <div>
                  <label style={S.label}>Email Address *</label>
                  <input style={S.minput} name="email" type="email" value={form.email} onChange={handleChange} placeholder="stylist@bakeurcurls.com" required />
                </div>
                <div>
                  <label style={S.label}>Password {editing ? '(leave blank to keep current)' : '*'}</label>
                  <input style={S.minput} name="password" type="password" value={form.password} onChange={handleChange} placeholder={editing ? '••••••••' : 'Min 6 characters'} />
                </div>
              </div>

              <label style={S.label}>Profile Picture (Image URL)</label>
              <input style={S.minput} name="avatar" value={form.avatar} onChange={handleChange} placeholder="https://example.com/stylist-photo.jpg or leave blank for initials" />

              <label style={S.label}>Specialization Title</label>
              <input style={S.minput} name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Senior Curl Specialist & Bridal Artist" />

              <label style={S.label}>Biodata / Description</label>
              <textarea style={S.textarea} name="bio" value={form.bio} onChange={handleChange} placeholder="Enter stylist's background, curl certifications, years of experience, etc." />

              {/* Service Experience Checkboxes */}
              <div style={{ margin: '1rem 0' }}>
                <label style={{ ...S.label, marginBottom: '0.6rem', color: '#F1D592' }}>
                  Select Services Experience (Checkboxes):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px', background: 'rgba(251,246,238,0.03)', padding: '12px', borderRadius: 10, border: '1px solid rgba(251,246,238,0.1)' }}>
                  {availableServices.map(service => {
                    const checked = form.skills.includes(service);
                    return (
                      <label key={service} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: checked ? '#F1D592' : 'rgba(251,246,238,0.7)' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSkill(service)}
                          style={{ accentColor: '#D4AF37', cursor: 'pointer' }}
                        />
                        {service}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={S.mBtns}>
                <button type="submit" style={{ ...S.saveBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                  {loading ? 'Saving...' : editing ? 'Update Stylist' : 'Add Stylist'}
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
