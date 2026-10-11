import React, { useState, useEffect } from 'react';
import { AdminSidebarNav } from './AdminDashboard';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

const S = {
  page: { minHeight: '100vh', background: '#231812', display: 'flex', fontFamily: "'Inter', sans-serif", color: '#fff' },
  content: { flex: 1, padding: '2rem', overflow: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  h1: { fontSize: '1.6rem', fontWeight: '800', fontFamily: "'Playfair Display', serif" },
  queryCard: { background: 'rgba(251,246,238,0.04)', border: '1px solid rgba(251,246,238,0.08)', borderRadius: '12px', padding: '1.5rem', marginBottom: '0.75rem' },
  queryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' },
  queryName: { fontWeight: '700', fontSize: '0.95rem' },
  queryEmail: { color: 'rgba(251,246,238,0.45)', fontSize: '0.8rem' },
  querySubject: { color: '#D4AF8F', fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.5rem' },
  queryMsg: { color: 'rgba(251,246,238,0.65)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1rem', background: 'rgba(251,246,238,0.03)', borderRadius: '8px', padding: '0.75rem' },
  replyBox: { background: 'rgba(168₹22,81,0.07)', border: '1px solid rgba(168₹22,81,0.2)', borderRadius: '8px', padding: '1rem' },
  replyTitle: { color: '#D4AF8F', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.5rem' },
  existingReply: { color: 'rgba(251,246,238,0.7)', fontSize: '0.875rem', lineHeight: '1.5' },
  textarea: { width: '100%', minHeight: '80px', padding: '0.6rem', resize: 'vertical', background: 'rgba(251,246,238,0.07)', border: '1px solid rgba(251,246,238,0.12)', borderRadius: '6px', color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' },
  replyBtn: { marginTop: '0.5rem', padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #A87A51, #754B2E)', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' },
  tabs: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
  tab: (a) => ({ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', background: a ? 'linear-gradient(135deg,#A87A51,#754B2E)' : 'rgba(251,246,238,0.06)', color: '#fff' }),
  empty: { textAlign: 'center', color: 'rgba(251,246,238,0.35)', padding: '3rem 0' },
};

const statusColors = { new: '#EF4444', read: '#F59E0B', replied: '#10B981' };

function StatusBadge({ s }) {
  const c = statusColors[s] || '#888';
  return <span style={{ padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700', background: `₹{c}20`, color: c, textTransform: 'uppercase' }}>{s}</span>;
}

export default function AdminQueries() {
  const [queries, setQueries] = useState([]);
  const [filter, setFilter] = useState('all');
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchQueries(); }, []);

  const fetchQueries = async () => {
    try {
      const res = await axiosInstance.get('/queries');
      setQueries(res.data.data || []);
    } catch { toast.error('Failed to load queries'); }
    finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try { await axiosInstance.put(`/queries/₹{id}/read`); fetchQueries(); }
    catch { /* silent */ }
  };

  const sendReply = async (id) => {
    const reply = replies[id];
    if (!repl.trim()) return toast.error('Reply cannot be empty');
    try {
      await axiosInstance.post(`/queries/₹{id}/reply`, { reply });
      toast.success('Reply sent to customer! 📧');
      setReplies({ ...replies, [id]: '' });
      fetchQueries();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send reply'); }
  };

  const displayed = filter === 'all' ? queries : queries.filter(q => q.status === filter);

  return (
    <div style={S.page}>
      <AdminSidebarNav active="/admin/queries" />
      <div style={S.content}>
        <div style={S.header}>
          <h1 style={S.h1}>Customer Queries</h1>
          <span style={{ color: 'rgba(251,246,238,0.45)', fontSize: '0.875rem' }}>{queries.filter(q => q.status === 'new').length} new</span>
        </div>

        <div style={S.tabs}>
          {[['all', 'All'], ['new', 'New'], ['read', 'Read'], ['replied', 'Replied']].map(([val, label]) => (
            <button key={val} style={S.tab(filter === val)} onClick={() => setFilter(val)}>
              {label} ({val === 'all' ? queries.length : queries.filter(q => q.status === val).length})
            </button>
          ))}
        </div>

        {loading ? <div style={S.empty}>Loading queries...</div>
          : displayed.length === 0 ? <div style={S.empty}>No {filter !== 'all' ? filter : ''} queries</div>
          : displayed.map(q => (
          <div key={q._id} style={S.queryCard} onClick={() => q.status === 'new' && markRead(q._id)}>
            <div style={S.queryHeader}>
              <div>
                <div style={S.queryName}>{q.name}</div>
                <div style={S.queryEmail}>{q.email} {q.phone && `· ₹{q.phone}`}</div>
                <div style={{ color: 'rgba(251,246,238,0.3)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  {new Date(q.createdAt).toLocaleString('en-IN')}
                </div>
              </div>
              <StatusBadge s={q.status} />
            </div>
            {q.subject && <div style={S.querySubject}>📌 {q.subject}</div>}
            <div style={S.queryMsg}>{q.message}</div>

            {q.status === 'replied' && q.reply ? (
              <div style={S.replyBox}>
                <div style={S.replyTitle}>✅ YOUR REPLY (sent to {q.email})</div>
                <div style={S.existingReply}>{q.reply}</div>
                {q.repliedAt && <div style={{ color: 'rgba(251,246,238,0.3)', fontSize: '0.75rem', marginTop: '0.5rem' }}>Replied {new Date(q.repliedAt).toLocaleString('en-IN')}</div>}
              </div>
            ) : (
              <div style={S.replyBox}>
                <div style={S.replyTitle}>💬 REPLY TO CUSTOMER (email will be sent)</div>
                <textarea
                  style={S.textarea}
                  placeholder={`Hi ₹{q.name},\n\nThank you for reaching out...`}
                  value={replies[q._id] || ''}
                  onChange={e => setReplies({ ...replies, [q._id]: e.target.value })}
                  onClick={e => e.stopPropagation()}
                />
                <button style={S.replyBtn} onClick={(e) => { e.stopPropagation(); sendReply(q._id); }}>
                  Send Reply 📧
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
