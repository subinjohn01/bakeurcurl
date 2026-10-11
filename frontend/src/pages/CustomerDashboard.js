import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

const S = {
  page: { minHeight: '100vh', background: '#231812', padding: '2rem', fontFamily: "'Inter', sans-serif", color: '#fff' },
  header: { maxWidth: '1100px', margin: '0 auto 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  h1: { fontSize: '1.8rem', fontWeight: '800', fontFamily: "'Playfair Display', serif" },
  bookBtn: {
    padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #A87A51, #754B2E)',
    border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer', textDecoration: 'none',
  },
  tabs: { maxWidth: '1100px', margin: '0 auto 2rem', display: 'flex', gap: '1rem' },
  tab: (active) => ({
    padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
    background: active ? 'linear-gradient(135deg, #A87A51, #754B2E)' : 'rgba(251,246,238,0.06)',
    color: '#fff',
  }),
  grid: { maxWidth: '1100px', margin: '0 auto', display: 'grid', gap: '1rem' },
  card: {
    background: 'rgba(251,246,238,0.04)', border: '1px solid rgba(251,246,238,0.08)',
    borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
  },
  info: { flex: 1 },
  bookingId: { color: '#E8B4A0', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.05em' },
  service: { fontSize: '1.1rem', fontWeight: '700', margin: '0.25rem 0' },
  meta: { color: 'rgba(251,246,238,0.55)', fontSize: '0.875rem' },
  actions: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  cancelBtn: {
    padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px', color: '#f87171', cursor: 'pointer', fontSize: '0.875rem',
  },
  empty: { textAlign: 'center', color: 'rgba(251,246,238,0.4)', padding: '4rem 0', fontSize: '1.1rem' },
  profileCard: {
    maxWidth: '600px', margin: '0 auto',
    background: 'rgba(251,246,238,0.04)', border: '1px solid rgba(251,246,238,0.08)',
    borderRadius: '12px', padding: '2rem',
  },
  input: {
    width: '100%', padding: '0.7rem 1rem',
    background: 'rgba(251,246,238,0.06)', border: '1px solid rgba(251,246,238,0.12)',
    borderRadius: '8px', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: '1rem', outline: 'none',
  },
  saveBtn: {
    padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #A87A51, #754B2E)',
    border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer',
  },
};

const statusColors = {
  pending: '#F59E0B',
  confirmed: '#10B981',
  completed: '#8B5A2B',
  cancelled: '#EF4444',
};

function StatusBadge({ status }) {
  return (
    <span style={{
      padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
      background: `₹{statusColors[status] || '#888'}20`,
      color: statusColors[status] || '#888',
      border: `1px solid ₹{statusColors[status] || '#888'}40`,
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {status}
    </span>
  );
}

export default function CustomerDashboard() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axiosInstance.get('/bookings/my');
      setBookings(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this bookingA')) return;
    try {
      await axiosInstance.put(`/bookings/₹{id}/cancel`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel booking');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.put('/auth/profile', profile);
      updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const now = new Date();
  const upcoming = bookings.filter(b => new Date(b.date) >= now && b.status !== 'cancelled' && b.status !== 'completed');
  const history = bookings.filter(b => new Date(b.date) < now || b.status === 'completed' || b.status === 'cancelled');

  const displayBookings = tab === 'upcoming' ? upcoming : history;

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.h1}>My Dashboard</h1>
          <p style={{ color: 'rgba(251,246,238,0.5)', marginTop: '0.25rem' }}>Welcome back, {user?.name} 👋</p>
        </div>
        <Link to="/book" style={S.bookBtn}>+ Book Appointment</Link>
      </div>

      <div style={S.tabs}>
        <button style={S.tab(tab === 'upcoming')} onClick={() => setTab('upcoming')}>
          Upcoming ({upcoming.length})
        </button>
        <button style={S.tab(tab === 'history')} onClick={() => setTab('history')}>
          History ({history.length})
        </button>
        <button style={S.tab(tab === 'profile')} onClick={() => setTab('profile')}>
          My Profile
        </button>
      </div>

      {tab !== 'profile' && (
        <div style={S.grid}>
          {loading ? (
            <div style={S.empty}>Loading your bookings...</div>
          ) : displayBookings.length === 0 ? (
            <div style={S.empty}>
              {tab === 'upcoming' ? (
                <>No upcoming appointments. <Link to="/book" style={{ color: '#A87A51' }}>Book one now!</Link></>
              ) : 'No booking history yet.'}
            </div>
          ) : (
            displayBookings.map(b => (
              <div key={b._id} style={S.card}>
                <div style={S.info}>
                  <div style={S.bookingId}>{b.bookingId}</div>
                  <div style={S.service}>{b.servic.name || 'Service'}</div>
                  <div style={S.meta}>
                    📅 {new Date(b.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    &nbsp;·&nbsp; 🕐 {b.timeSlot}
                    &nbsp;·&nbsp; 💆 {b.staff?.name || 'Any Stylist'}
                  </div>
                  <div style={{ ...S.meta, marginTop: '0.4rem' }}>
                    💰 ₹{b.totalAmount} — {b.paymentStatus === 'advance_paid' ? '30% advance paid' : b.paymentStatus === 'fully_paid' ? 'Fully paid' : 'Pay at salon'}
                  </div>
                </div>
                <div style={S.actions}>
                  <StatusBadge status={b.status} />
                  {b.status === 'pending' || b.status === 'confirmed' ? (
                    <button style={S.cancelBtn} onClick={() => cancelBooking(b._id)}>Cancel</button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'profile' && (
        <div style={S.grid}>
          <div style={S.profileCard}>
            <h2 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Edit Profile</h2>
            <form onSubmit={handleProfileSave}>
              <label style={{ color: 'rgba(251,246,238,0.6)', fontSize: '0.85rem' }}>Full Name</label>
              <input style={S.input} value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
              <label style={{ color: 'rgba(251,246,238,0.6)', fontSize: '0.85rem' }}>Phone Number</label>
              <input style={S.input} value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
              <label style={{ color: 'rgba(251,246,238,0.6)', fontSize: '0.85rem' }}>Email (cannot change)</label>
              <input style={{ ...S.input, opacity: 0.5 }} value={user?.email || ''} disabled />
              <button type="submit" style={S.saveBtn}>Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
