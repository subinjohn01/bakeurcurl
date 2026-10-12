import React, { useState, useEffect } from 'react';
import { AdminSidebarNav } from './AdminDashboard';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

import { exportToCSV, exportToPDF } from '../../utils/exportUtils';

const S = {
  page: { minHeight: '100vh', background: '#231812', display: 'flex', fontFamily: "'Inter', sans-serif", color: '#fff' },
  content: { flex: 1, padding: '2rem', overflow: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  h1: { fontSize: '1.6rem', fontWeight: '800', fontFamily: "'Playfair Display', serif" },
  toolbar: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' },
  select: {
    padding: '0.6rem 1rem', background: 'rgba(251,246,238,0.06)', border: '1px solid rgba(251,246,238,0.12)',
    borderRadius: '8px', color: '#fff', fontSize: '0.875rem', outline: 'none', cursor: 'pointer',
  },
  input: {
    padding: '0.6rem 1rem', background: 'rgba(251,246,238,0.06)', border: '1px solid rgba(251,246,238,0.12)',
    borderRadius: '8px', color: '#fff', fontSize: '0.875rem', outline: 'none',
  },
  exportBtn: {
    padding: '0.55rem 1rem',
    borderRadius: '8px',
    border: '1px solid rgba(241,213,146,0.3)',
    background: 'rgba(251,246,238,0.06)',
    color: '#F1D592',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  },
  tableWrap: { background: 'rgba(251,246,238,0.03)', border: '1px solid rgba(251,246,238,0.07)', borderRadius: '12px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', color: 'rgba(251,246,238,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(251,246,238,0.07)' },
  td: { padding: '0.85rem 1rem', borderBottom: '1px solid rgba(251,246,238,0.05)', fontSize: '0.85rem', verticalAlign: 'middle' },
  actionBtn: (color) => ({
    padding: '0.35rem 0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600',
    background: `${color}20`, color, marginLeft: '0.4rem',
  }),
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#2E1E14', border: '1px solid rgba(251,246,238,0.1)', borderRadius: '16px',
    padding: '2rem', width: '90%', maxWidth: '600px', maxHeight: '85vh', overflow: 'auto',
  },
  mh2: { fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem' },
  label: { display: 'block', color: 'rgba(251,246,238,0.6)', fontSize: '0.8rem', marginBottom: '0.35rem' },
  minput: {
    width: '100%', padding: '0.65rem 0.9rem',
    background: 'rgba(251,246,238,0.07)', border: '1px solid rgba(251,246,238,0.12)',
    borderRadius: '7px', color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box', marginBottom: '1rem', outline: 'none',
  },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  mBtns: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
  saveBtn: { padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg, #A87A51, #754B2E)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' },
  cancelBtn: { padding: '0.7rem 1.5rem', background: 'rgba(251,246,238,0.06)', border: '1px solid rgba(251,246,238,0.12)', borderRadius: '8px', color: '#fff', cursor: 'pointer' },
};

const statusColors = { pending: '#F59E0B', confirmed: '#10B981', completed: '#8B5A2B', cancelled: '#EF4444' };
const paymentColors = { unpaid: '#9CA3AF', advance_paid: '#F59E0B', fully_paid: '#10B981' };

function Badge({ s, colorMap }) {
  const c = colorMap[s] || '#888';
  return <span style={{ padding: '0.2rem 0.65rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700', background: `${c}20`, color: c, textTransform: 'uppercase' }}>{(s || '').replace('_', ' ')}</span>;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);
  useEffect(() => {
    let f = bookings;
    if (filter !== 'all') f = f.filter(b => b.status === filter);
    if (search) f = f.filter(b =>
      (b.bookingId || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.customer?.name || b.guestInfo?.name || '').toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
  }, [bookings, filter, search]);

  const fetchBookings = async () => {
    try {
      const res = await axiosInstance.get('/bookings');
      setBookings(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      setSelected(null);
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleExportCSV = () => {
    if (!filtered.length) return toast.error('No bookings to export');
    const headers = ['Booking ID', 'Customer Name', 'Customer Email', 'Customer Phone', 'Service', 'Stylist', 'Date', 'Time Slot', 'Total Amount', 'Advance Paid', 'Payment Status', 'Booking Status'];
    const rows = filtered.map((b) => [
      b.bookingId,
      b.customer?.name || b.guestInfo?.name || 'Guest',
      b.customer?.email || b.guestInfo?.email || 'N/A',
      b.customer?.phone || b.guestInfo?.phone || 'N/A',
      b.service?.name || 'Service',
      b.staff?.name || 'Any Stylist',
      new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      b.timeSlot,
      b.totalAmount,
      b.advanceAmount || 0,
      b.paymentStatus,
      b.status,
    ]);
    exportToCSV('BakeUrCurls_Bookings_Report', headers, rows);
    toast.success('Bookings exported to Excel (CSV)! 📊');
  };

  const handleExportPDF = () => {
    if (!filtered.length) return toast.error('No bookings to export');
    const columns = ['Booking ID', 'Customer', 'Service', 'Date & Time', 'Amount', 'Payment', 'Status'];
    const data = filtered.map((b) => [
      b.bookingId,
      `${b.customer?.name || b.guestInfo?.name || 'Guest'}\n${b.customer?.phone || b.guestInfo?.phone || ''}`,
      b.service?.name || 'Service',
      `${new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}\n${b.timeSlot}`,
      `₹${b.totalAmount}`,
      (b.paymentStatus || '').replace('_', ' ').toUpperCase(),
      (b.status || '').toUpperCase(),
    ]);

    const totalRevenue = filtered.reduce((acc, b) => acc + (Number(b.totalAmount) || 0), 0);
    const summaryStats = [
      { label: 'Total Bookings', value: filtered.length },
      { label: 'Confirmed', value: filtered.filter((b) => b.status === 'confirmed').length },
      { label: 'Pending', value: filtered.filter((b) => b.status === 'pending').length },
      { label: 'Total Value', value: `₹${totalRevenue.toLocaleString('en-IN')}` },
    ];

    exportToPDF({
      title: 'Salon Bookings & Appointments Report',
      subtitle: `Filtered: ${filter.toUpperCase()} | Total Count: ${filtered.length}`,
      columns,
      data,
      summaryStats,
    });
  };

  return (
    <div style={S.page}>
      <AdminSidebarNav active="/admin/bookings" />
      <div style={S.content}>
        <div style={S.header}>
          <div>
            <h1 style={S.h1}>Manage Bookings</h1>
            <span style={{ color: 'rgba(251,246,238,0.45)', fontSize: '0.875rem' }}>
              {filtered.length} booking records found
            </span>
          </div>

          {/* Export Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleExportCSV} style={S.exportBtn}>
              📊 Export to Excel
            </button>
            <button onClick={handleExportPDF} style={S.exportBtn}>
              📄 Export to PDF
            </button>
          </div>
        </div>

        <div style={S.toolbar}>
          <input style={S.input} placeholder="🔍 Search by ID or name..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={S.select} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>{['Booking ID', 'Customer & Contact', 'Service', 'Date & Time', 'Amount', 'Payment', 'Status', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ ...S.td, textAlign: 'center', color: 'rgba(251,246,238,0.4)' }}>Loading...</td></tr>
              ) : filtered.map(b => {
                const customerName = b.customer?.name || b.guestInfo?.name || 'Guest';
                const customerEmail = b.customer?.email || b.guestInfo?.email || '';
                const customerPhone = b.customer?.phone || b.guestInfo?.phone || '';
                return (
                  <tr key={b._id}>
                    <td style={{ ...S.td, color: '#E8B4A0', fontWeight: '700' }}>{b.bookingId}</td>
                    <td style={S.td}>
                      <div style={{ fontWeight: '600', color: '#FBF6EE' }}>{customerName}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4, fontSize: '0.8rem' }}>
                        {customerPhone ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: '#F1D592' }}>📞 {customerPhone}</span>
                            <a
                              href={`tel:${customerPhone}`}
                              style={{ color: '#10B981', fontSize: '0.75rem', textDecoration: 'underline' }}
                              title="Call customer"
                            >
                              Call
                            </a>
                            <a
                              href={`https://wa.me/${customerPhone.replace(/[^\d]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#34D399', fontSize: '0.75rem', textDecoration: 'underline' }}
                              title="WhatsApp customer"
                            >
                              WhatsApp
                            </a>
                          </div>
                        ) : (
                          <span style={{ color: 'rgba(251,246,238,0.3)', fontSize: '0.75rem' }}>No phone provided</span>
                        )}
                        {customerEmail ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: 'rgba(251,246,238,0.6)' }}>✉️ {customerEmail}</span>
                            <a
                              href={`mailto:${customerEmail}`}
                              style={{ color: '#E8B4A0', fontSize: '0.75rem', textDecoration: 'underline' }}
                              title="Email customer"
                            >
                              Email
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td style={S.td}>{b.service?.name || 'Service'}</td>
                    <td style={S.td}>{new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {b.timeSlot}</td>
                    <td style={S.td}>₹{b.totalAmount}</td>
                    <td style={S.td}><Badge s={b.paymentStatus} colorMap={paymentColors} /></td>
                    <td style={S.td}><Badge s={b.status} colorMap={statusColors} /></td>
                    <td style={S.td}>
                      <button style={S.actionBtn('#D4AF8F')} onClick={() => setSelected(b)}>View</button>
                      {b.status === 'pending' && <button style={S.actionBtn('#10B981')} onClick={() => updateStatus(b._id, 'confirmed')}>Confirm</button>}
                      {b.status === 'confirmed' && <button style={S.actionBtn('#8B5A2B')} onClick={() => updateStatus(b._id, 'completed')}>Complete</button>}
                      {(b.status === 'pending' || b.status === 'confirmed') && <button style={S.actionBtn('#EF4444')} onClick={() => updateStatus(b._id, 'cancelled')}>Cancel</button>}
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} style={{ ...S.td, textAlign: 'center', color: 'rgba(251,246,238,0.35)' }}>No bookings found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div style={S.overlay} onClick={() => setSelected(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h2 style={S.mh2}>Booking Details — {selected.bookingId}</h2>
            {[
              ['Customer', selected.customer?.name || selected.guestInfo?.name || 'Guest'],
              ['Email', selected.customer?.email || selected.guestInfo?.email || 'Not provided'],
              ['Phone', selected.customer?.phone || selected.guestInfo?.phone || 'Not provided'],
              ['Service', selected.service?.name || 'Service'],
              ['Stylist', selected.staff?.name || 'Any Stylist'],
              ['Date', new Date(selected.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
              ['Time', selected.timeSlot],
              ['Total', `₹${selected.totalAmount}`],
              ['Advance', selected.advanceAmount ? `₹${selected.advanceAmount}` : 'None'],
              ['Payment', (selected.paymentStatus || '').replace('_', ' ')],
              ['Status', selected.status],
              ['Notes', selected.notes || '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', marginBottom: '0.6rem' }}>
                <span style={{ color: 'rgba(251,246,238,0.45)', width: '110px', flexShrink: 0, fontSize: '0.85rem' }}>{k}:</span>
                <span style={{ fontSize: '0.9rem' }}>{v}</span>
              </div>
            ))}

            {/* Quick Contact Action Bar */}
            {(selected.customer?.phone || selected.guestInfo?.phone || selected.customer?.email || selected.guestInfo?.email) && (
              <div style={{ marginTop: '1.25rem', padding: '12px', background: 'rgba(251,246,238,0.05)', borderRadius: '10px', border: '1px solid rgba(241,213,146,0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: '#F1D592', fontWeight: '700', marginBottom: '8px' }}>
                  💬 CONNECT WITH CUSTOMER
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {(selected.customer?.phone || selected.guestInfo?.phone) && (
                    <>
                      <a
                        href={`tel:${selected.customer?.phone || selected.guestInfo?.phone}`}
                        style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(16,185,129,0.15)', color: '#34D399', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600' }}
                      >
                        📞 Call Customer
                      </a>
                      <a
                        href={`https://wa.me/${(selected.customer?.phone || selected.guestInfo?.phone).replace(/[^\d]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(52,211,153,0.15)', color: '#10B981', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600' }}
                      >
                        💬 WhatsApp
                      </a>
                    </>
                  )}
                  {(selected.customer?.email || selected.guestInfo?.email) && (
                    <a
                      href={`mailto:${selected.customer?.email || selected.guestInfo?.email}?subject=Regarding your BakeUrCurls Booking ${selected.bookingId}`}
                      style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(241,213,146,0.15)', color: '#F1D592', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600' }}
                    >
                      ✉️ Send Email
                    </a>
                  )}
                </div>
              </div>
            )}

            <div style={{ ...S.mBtns, marginTop: '1.5rem' }}>
              {selected.status === 'pending' && <button style={S.saveBtn} onClick={() => updateStatus(selected._id, 'confirmed')}>✅ Confirm</button>}
              {selected.status === 'confirmed' && <button style={S.saveBtn} onClick={() => updateStatus(selected._id, 'completed')}>✔️ Complete</button>}
              <button style={S.cancelBtn} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

