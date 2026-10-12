import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

const S = {
  page: { minHeight: '100vh', background: '#231812', padding: '2rem', fontFamily: "'Inter', sans-serif", color: '#fff' },
  h1: { fontSize: '1.8rem', fontWeight: '800', fontFamily: "'Playfair Display', serif", marginBottom: '0.25rem' },
  sub: { color: 'rgba(251,246,238,0.5)', marginBottom: '2rem' },
  tabs: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
  tab: (a) => ({
    padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem',
    background: a ? 'linear-gradient(135deg, #A87A51, #754B2E)' : 'rgba(251,246,238,0.06)', color: '#fff',
  }),
  card: {
    background: 'rgba(251,246,238,0.04)', border: '1px solid rgba(251,246,238,0.08)',
    borderRadius: '12px', padding: '1.25rem', marginBottom: '0.75rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem',
  },
  bookingId: { color: '#E8B4A0', fontSize: '0.75rem', fontWeight: '700' },
  service: { fontWeight: '700', fontSize: '1rem', margin: '0.2rem 0' },
  meta: { color: 'rgba(251,246,238,0.5)', fontSize: '0.8rem' },
  actions: { display: 'flex', gap: '0.5rem' },
  btn: (color) => ({
    padding: '0.4rem 0.9rem', background: `${color}20`, border: `1px solid ${color}40`,
    borderRadius: '6px', color, cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600',
  }),
  queryCard: {
    background: 'rgba(251,246,238,0.04)', border: '1px solid rgba(251,246,238,0.08)',
    borderRadius: '12px', padding: '1.5rem', marginBottom: '0.75rem',
  },
  queryName: { fontWeight: '700', marginBottom: '0.25rem' },
  queryMeta: { color: 'rgba(251,246,238,0.4)', fontSize: '0.8rem', marginBottom: '0.75rem' },
  queryMsg: { color: 'rgba(251,246,238,0.7)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1rem' },
  replyBox: { background: 'rgba(168,122,81,0.08)', border: '1px solid rgba(168,122,81,0.2)', borderRadius: '8px', padding: '1rem' },
  textarea: {
    width: '100%', minHeight: '80px', padding: '0.6rem', resize: 'vertical',
    background: 'rgba(251,246,238,0.06)', border: '1px solid rgba(251,246,238,0.12)',
    borderRadius: '6px', color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none',
  },
  replyBtn: {
    marginTop: '0.5rem', padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #A87A51, #754B2E)',
    border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem',
  },
  empty: { textAlign: 'center', color: 'rgba(251,246,238,0.35)', padding: '3rem 0' },
};

const statusColors = { pending: '#F59E0B', confirmed: '#10B981', completed: '#8B5A2B', cancelled: '#EF4444' };

function Badge({ status }) {
  const c = statusColors[status] || '#888';
  return (
    <span style={{ padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', background: `${c}20`, color: c, border: `1px solid ${c}40`, textTransform: 'uppercase' }}>
      {status}
    </span>
  );
}

export default function StaffDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('today');
  const [bookings, setBookings] = useState([]);
  const [queries, setQueries] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [bRes, qRes] = await Promise.all([
        axiosInstance.get('/bookings'),
        axiosInstance.get('/queries'),
      ]);
      setBookings(bRes.data.data || []);
      setQueries(qRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      fetchAll();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const sendReply = async (queryId) => {
    const reply = replyText[queryId];
    if (!reply || !reply.trim()) return toast.error('Reply cannot be empty');
    try {
      await axiosInstance.post(`/queries/${queryId}/reply`, { reply });
      toast.success('Reply sent!');
      setReplyText({ ...replyText, [queryId]: '' });
      fetchAll();
    } catch (err) {
      toast.error('Failed to send reply');
    }
  };

  const today = new Date().toDateString();
  const todayBookings = bookings.filter(b => new Date(b.date).toDateString() === today);
  const upcomingBookings = bookings.filter(b => new Date(b.date) > new Date() && b.status !== 'cancelled');
  const newQueries = queries.filter(q => q.status === 'new' || q.status === 'read');

  const displayBookings = tab === 'today' ? todayBookings : upcomingBookings;

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Staff Dashboard</h1>
      <p style={S.sub}>Welcome, {user?.name} — {user?.specialization || 'Stylist'}</p>

      <div style={S.tabs}>
        <button style={S.tab(tab === 'today')} onClick={() => setTab('today')}>Today ({todayBookings.length})</button>
        <button style={S.tab(tab === 'upcoming')} onClick={() => setTab('upcoming')}>Upcoming ({upcomingBookings.length})</button>
        <button style={S.tab(tab === 'queries')} onClick={() => setTab('queries')}>
          Queries {newQueries.length > 0 && <span style={{ background: '#EF4444', borderRadius: '50%', padding: '0 5px', fontSize: '0.7rem', marginLeft: '4px' }}>{newQueries.length}</span>}
        </button>
      </div>

      {tab !== 'queries' && (
        <div>
          {loading ? <div style={S.empty}>Loading...</div>
            : displayBookings.length === 0 ? <div style={S.empty}>No bookings {tab === 'today' ? 'today' : 'upcoming'} 🎉</div>
            : displayBookings.map(b => (
              <div key={b._id} style={S.card}>
                <div>
                  <div style={S.bookingId}>{b.bookingId}</div>
                  <div style={S.service}>{b.servic.name}</div>
                  <div style={S.meta}>
                    👤 {b.customer?.name || b.guestInfo?.name} &nbsp;·&nbsp;
                    📅 {new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at {b.timeSlot} &nbsp;·&nbsp;
                    📞 {b.customer?.phone || b.guestInfo?.phone || 'N/A'}
                  </div>
                </div>
                <div style={S.actions}>
                  <Badge status={b.status} />
                  {b.status === 'pending' && (
                    <button style={S.btn('#10B981')} onClick={() => updateStatus(b._id, 'confirmed')}>Confirm</button>
                  )}
                  {b.status === 'confirmed' && (
                    <button style={S.btn('#8B5A2B')} onClick={() => updateStatus(b._id, 'completed')}>Complete</button>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      )}

      {tab === 'queries' && (
        <div>
          {loading ? <div style={S.empty}>Loading...</div>
            : queries.length === 0 ? <div style={S.empty}>No queries yet</div>
            : queries.map(q => (
              <div key={q._id} style={S.queryCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={S.queryName}>{q.name} &lt;{q.email}&gt;</div>
                    <div style={S.queryMeta}>
                      {q.subject && <strong>{q.subject} · </strong>}
                      {new Date(q.createdAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700',
                    background: q.status === 'new' ? '#EF444420' : q.status === 'replied' ? '#10B98120' : '#F59E0B20',
                    color: q.status === 'new' ? '#EF4444' : q.status === 'replied' ? '#10B981' : '#F59E0B',
                    textTransform: 'uppercase' }}>
                    {q.status}
                  </span>
                </div>
                <div style={S.queryMsg}>{q.message}</div>
                {q.status === 'replied' && q.reply && (
                  <div style={{ ...S.replyBox, marginBottom: '0.75rem' }}>
                    <div style={{ color: '#D4AF8F', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.25rem' }}>YOUR REPLY</div>
                    <div style={{ color: 'rgba(251,246,238,0.7)', fontSize: '0.875rem' }}>{q.reply}</div>
                  </div>
                )}
                {q.status !== 'replied' && (
                  <div style={S.replyBox}>
                    <div style={{ color: '#D4AF8F', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>REPLY TO CUSTOMER</div>
                    <textarea
                      style={S.textarea}
                      placeholder="Type your reply..."
                      value={replyText[q._id] || ''}
                      onChange={e => setReplyText({ ...replyText, [q._id]: e.target.value })}
                    />
                    <button style={S.replyBtn} onClick={() => sendReply(q._id)}>Send Reply</button>
                  </div>
                )}
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
