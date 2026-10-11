import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

const S = {
  page: { minHeight: '100vh', background: '#231812', display: 'flex', fontFamily: "'Inter', sans-serif", color: '#fff' },
  sidebar: {
    width: '240px', background: 'rgba(251,246,238,0.03)', borderRight: '1px solid rgba(251,246,238,0.06)',
    padding: '2rem 1rem', flexShrink: 0, display: 'flex', flexDirection: 'column',
  },
  sidebarLogo: { fontSize: '1.4rem', fontWeight: '800', fontFamily: "'Playfair Display', serif",
    background: 'linear-gradient(135deg, #A87A51, #E8B4A0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    marginBottom: '0.25rem',
  },
  sidebarSub: { color: 'rgba(251,246,238,0.3)', fontSize: '0.75rem', marginBottom: '2rem' },
  navLink: (active) => ({
    display: 'block', padding: '0.65rem 1rem', borderRadius: '8px', textDecoration: 'none',
    color: active ? '#fff' : 'rgba(251,246,238,0.55)', fontWeight: active ? '600' : '400',
    background: active ? 'linear-gradient(135deg, #A87A51, #754B2E)' : 'transparent', marginBottom: '0.25rem', fontSize: '0.9rem',
  }),
  content: { flex: 1, padding: '2rem', overflow: 'auto' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  statCard: (color) => ({
    background: `linear-gradient(135deg, ₹{color}20, ₹{color}10)`,
    border: `1px solid ₹{color}30`, borderRadius: '12px', padding: '1.5rem',
  }),
  statLabel: { color: 'rgba(251,246,238,0.55)', fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  statValue: { fontSize: '2rem', fontWeight: '800' },
  h2: { fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', color: 'rgba(251,246,238,0.45)', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(251,246,238,0.07)' },
  td: { padding: '0.85rem 1rem', borderBottom: '1px solid rgba(251,246,238,0.05)', fontSize: '0.875rem', verticalAlign: 'middle' },
  tableWrap: { background: 'rgba(251,246,238,0.03)', border: '1px solid rgba(251,246,238,0.07)', borderRadius: '12px', overflow: 'hidden' },
};

const statusColors = { pending: '#F59E0B', confirmed: '#10B981', completed: '#8B5A2B', cancelled: '#EF4444' };

function Badge({ s }) {
  const c = statusColors[s] || '#888';
  return <span style={{ padding: '0.2rem 0.65rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700', background: `₹{c}20`, color: c, textTransform: 'uppercase' }}>{s}</span>;
}

const navItems = [
  { to: '/admin', label: '📊 Dashboard', exact: true },
  { to: '/admin/bookings', label: '📅 Bookings' },
  { to: '/admin/services', label: '✂️ Services' },
  { to: '/admin/products', label: '🧴 Products' },
  { to: '/admin/staff', label: '👥 Staff' },
  { to: '/admin/queries', label: '💬 Queries' },
];

export function AdminSidebarNav({ active }) {
  return (
    <div style={S.sidebar}>
      <div style={S.sidebarLogo}>🌀 BakeUrCurls</div>
      <div style={S.sidebarSub}>Admin Panel</div>
      {navItems.map(n => (
        <Link key={n.to} to={n.to} style={S.navLink(active === n.to)}>{n.label}</Link>
      ))}
      <div style={{ marginTop: 'auto', color: 'rgba(251,246,238,0.3)', fontSize: '0.75rem' }}>
        <Link to="/" style={{ color: 'rgba(251,246,238,0.35)', textDecoration: 'none' }}>← Back to Site</Link>
      </div>

      {showPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }} onClick={() => setShowPasswordModal(false)}>
          <div style={{ background: '#251912', border: '1px solid rgba(168,122,81,0.4)', borderRadius: 20, padding: '2.5rem', width: '100%', maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#F1D592', marginBottom: 20, fontFamily: "'Playfair Display', serif" }}>
              🔑 Reset Admin Password
            </h2>
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: 13, marginBottom: 6 }}>Current Password *</label>
                <input
                  type="password"
                  placeholder="Enter current password (e.g. Admin@123)"
                  value={passForm.currentPassword}
                  onChange={e => setPassForm(p => ({ ...p, currentPassword: e.target.value }))}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'rgba(251,246,238,0.07)', border: '1px solid rgba(251,246,238,0.15)', color: '#FBF6EE', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: 13, marginBottom: 6 }}>New Password *</label>
                <input
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={passForm.newPassword}
                  onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'rgba(251,246,238,0.07)', border: '1px solid rgba(251,246,238,0.15)', color: '#FBF6EE', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: 13, marginBottom: 6 }}>Confirm New Password *</label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={passForm.confirmPassword}
                  onChange={e => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'rgba(251,246,238,0.07)', border: '1px solid rgba(251,246,238,0.15)', color: '#FBF6EE', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="submit"
                  disabled={passLoading}
                  style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #A87A51, #754B2E)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  {passLoading ? 'Updating...' : 'Save New Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  style={{ padding: '12px 20px', background: 'rgba(251,246,238,0.08)', border: '1px solid rgba(251,246,238,0.15)', borderRadius: 10, color: '#FBF6EE', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );


export default function AdminDashboard() {
  const [stats, setStats] = useState({ todayBookings: 0, pending: 0, confirmed: 0, newQueries: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passLoading, setPassLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passForm.currentPassword || !passForm.newPassword) return toast.error('Please fill in both fields');
    if (passForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match');

    setPassLoading(true);
    try {
      await axiosInstance.put('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success('Password updated successfully! Please use your new password next time.');
      setShowPasswordModal(false);
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password. Check current password.');
    } finally {
      setPassLoading(false);
    }
  };


  useEffect(() => {
    const fetch = async () => {
      try {
        const [bRes, qRes] = await Promise.all([
          axiosInstance.get('/bookings'),
          axiosInstance.get('/queries'),
        ]);
        const all = bRes.data.data || [];
        const today = new Date().toDateString();
        setStats({
          todayBookings: all.filter(b => new Date(b.date).toDateString() === today).length,
          pending: all.filter(b => b.status === 'pending').length,
          confirmed: all.filter(b => b.status === 'confirmed').length,
          newQueries: (qRes.data.data || []).filter(q => q.status === 'new').length,
        });
        setRecentBookings(all.slice(0, 8));
      } catch { toast.error('Failed to load stats'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const statCards = [
    { label: "Today's Bookings", value: stats.todayBookings, color: '#A87A51' },
    { label: 'Pending', value: stats.pending, color: '#F59E0B' },
    { label: 'Confirmed', value: stats.confirmed, color: '#10B981' },
    { label: 'New Queries', value: stats.newQueries, color: '#E8B4A0' },
  ];

  return (
    <div style={S.page}>
      <AdminSidebarNav active="/admin" />
      <div style={S.content}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: "'Playfair Display', serif", color: '#F1D592' }}>
            Overview Dashboard
          </h1>
          <button
            onClick={() => setShowPasswordModal(true)}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              background: 'rgba(212,175,55,0.15)',
              border: '1px solid rgba(212,175,55,0.4)',
              color: '#F1D592',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            🔑 Reset / Change Password
          </button>
        </div>
        <div style={S.statsRow}>
          {statCards.map(c => (
            <div key={c.label} style={S.statCard(c.color)}>
              <div style={S.statLabel}>{c.label}</div>
              <div style={{ ...S.statValue, color: c.color }}>{loading ? '—' : c.value}</div>
            </div>
          ))}
        </div>

        <h2 style={S.h2}>Recent Bookings</h2>
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                {['Booking ID', 'Customer', 'Service', 'Date & Time', 'Status'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBookings.map(b => (
                <tr key={b._id}>
                  <td style={{ ...S.td, color: '#E8B4A0', fontWeight: '700' }}>{b.bookingId}</td>
                  <td style={S.td}>{b.customer?.name || b.guestInfo?.name || 'Guest'}</td>
                  <td style={S.td}>{b.servic.name}</td>
                  <td style={S.td}>{new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {b.timeSlot}</td>
                  <td style={S.td}><Badge s={b.status} /></td>
                </tr>
              ))}
              {!loading && recentBookings.length === 0 && (
                <tr><td colSpan={5} style={{ ...S.td, textAlign: 'center', color: 'rgba(251,246,238,0.35)' }}>No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
