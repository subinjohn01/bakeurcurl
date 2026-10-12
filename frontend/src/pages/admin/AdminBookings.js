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
  createBtn: {
    padding: '0.6rem 1.25rem',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #A87A51, #754B2E)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '0.875rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 4px 12px rgba(168,122,81,0.3)',
    transition: 'all 0.2s',
  },
  tableWrap: { background: 'rgba(251,246,238,0.03)', border: '1px solid rgba(251,246,238,0.07)', borderRadius: '12px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', color: 'rgba(251,246,238,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(251,246,238,0.07)' },
  td: { padding: '0.85rem 1rem', borderBottom: '1px solid rgba(251,246,238,0.05)', fontSize: '0.85rem', verticalAlign: 'middle' },
  actionBtn: (color) => ({
    padding: '0.35rem 0.65rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600',
    background: `${color}20`, color, marginLeft: '0.35rem',
  }),
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#2E1E14', border: '1px solid rgba(251,246,238,0.12)', borderRadius: '16px',
    padding: '2rem', width: '92%', maxWidth: '640px', maxHeight: '88vh', overflow: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
  },
  mh2: { fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', color: '#F1D592', fontFamily: "'Playfair Display', serif" },
  label: { display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: '0.8rem', marginBottom: '0.35rem', fontWeight: '500' },
  minput: {
    width: '100%', padding: '0.65rem 0.9rem',
    background: 'rgba(251,246,238,0.07)', border: '1px solid rgba(251,246,238,0.14)',
    borderRadius: '7px', color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box', marginBottom: '0.85rem', outline: 'none',
  },
  mselect: {
    width: '100%', padding: '0.65rem 0.9rem',
    background: '#3A261A', border: '1px solid rgba(251,246,238,0.14)',
    borderRadius: '7px', color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box', marginBottom: '0.85rem', outline: 'none',
  },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' },
  mBtns: { display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' },
  saveBtn: { padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg, #A87A51, #754B2E)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer' },
  cancelBtn: { padding: '0.7rem 1.5rem', background: 'rgba(251,246,238,0.08)', border: '1px solid rgba(251,246,238,0.15)', borderRadius: '8px', color: '#fff', cursor: 'pointer' },
};

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM',
];

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
  const [phoneSearch, setPhoneSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // Aux state for creating/updating bookings
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Create Form State
  const initialCreateForm = {
    customerType: 'new', // 'new' | 'existing'
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    serviceId: '',
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 AM',
    totalAmount: '',
    advanceAmount: '0',
    paymentStatus: 'unpaid',
    status: 'confirmed',
    notes: '',
  };
  const [createForm, setCreateForm] = useState(initialCreateForm);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    serviceId: '',
    staffId: '',
    date: '',
    timeSlot: '',
    totalAmount: '',
    advanceAmount: '',
    paymentStatus: 'unpaid',
    status: 'pending',
    notes: '',
  });

  useEffect(() => {
    fetchBookings();
    loadAuxData();
  }, []);

  const loadAuxData = async () => {
    try {
      const [svcRes, staffRes, custRes] = await Promise.allSettled([
        axiosInstance.get('/services'),
        axiosInstance.get('/staff'),
        axiosInstance.get('/customers'),
      ]);
      if (svcRes.status === 'fulfilled') {
        const list = Array.isArray(svcRes.value.data?.services)
          ? svcRes.value.data.services
          : (Array.isArray(svcRes.value.data?.data) ? svcRes.value.data.data : (Array.isArray(svcRes.value.data) ? svcRes.value.data : []));
        setServices(list);
      }
      if (staffRes.status === 'fulfilled') {
        const list = Array.isArray(staffRes.value.data?.staff)
          ? staffRes.value.data.staff
          : (Array.isArray(staffRes.value.data?.data) ? staffRes.value.data.data : (Array.isArray(staffRes.value.data) ? staffRes.value.data : []));
        setStaffList(list);
      }
      if (custRes.status === 'fulfilled') {
        const list = Array.isArray(custRes.value.data?.customers)
          ? custRes.value.data.customers
          : (Array.isArray(custRes.value.data?.data) ? custRes.value.data.data : []);
        setCustomers(list);
      }
    } catch {
      // aux data load non-fatal
    }
  };

  useEffect(() => {
    let f = bookings;
    if (filter !== 'all') f = f.filter(b => b.status === filter);
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(b =>
        (b.bookingId || '').toLowerCase().includes(q) ||
        (b.customer?.name || b.guestInfo?.name || '').toLowerCase().includes(q) ||
        (b.customer?.email || b.guestInfo?.email || '').toLowerCase().includes(q) ||
        (b.customer?.phone || b.guestInfo?.phone || '').includes(q)
      );
    }
    if (phoneSearch) {
      const digits = phoneSearch.replace(/\D/g, '');
      f = f.filter(b => {
        const phone = (b.customer?.phone || b.guestInfo?.phone || '').replace(/\D/g, '');
        return phone.includes(digits);
      });
    }
    setFiltered(f);
  }, [bookings, filter, search, phoneSearch]);

  const fetchBookings = async () => {
    try {
      const res = await axiosInstance.get('/bookings');
      setBookings(Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data?.bookings) ? res.data.bookings : []));
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

  // --- Create Booking Handlers ---
  const handleServiceSelectInCreate = (serviceId) => {
    const s = services.find(item => item._id === serviceId);
    setCreateForm(prev => ({
      ...prev,
      serviceId,
      totalAmount: s ? s.price : prev.totalAmount,
      advanceAmount: s ? Math.round(s.price * 0.3) : prev.advanceAmount,
    }));
  };

  const handleCustomerSelectInCreate = (customerId) => {
    const c = customers.find(item => item._id === customerId);
    if (c) {
      setCreateForm(prev => ({
        ...prev,
        customerId,
        customerName: c.name || '',
        customerPhone: c.phone || '',
        customerEmail: c.email || '',
      }));
    }
  };

  const handleCreateBookingSubmit = async (e) => {
    e.preventDefault();
    if (createForm.customerType === 'new' && !createForm.customerName.trim()) {
      return toast.error('Please enter customer name');
    }
    if (createForm.customerType === 'existing' && !createForm.customerId) {
      return toast.error('Please select an existing customer');
    }
    if (!createForm.serviceId) {
      return toast.error('Please select a service');
    }
    if (!createForm.date || !createForm.timeSlot) {
      return toast.error('Please select date and time slot');
    }

    setSubmitting(true);
    try {
      const payload = {
        serviceId: createForm.serviceId,
        staffId: createForm.staffId || undefined,
        date: createForm.date,
        timeSlot: createForm.timeSlot,
        totalAmount: Number(createForm.totalAmount) || undefined,
        advanceAmount: Number(createForm.advanceAmount) || 0,
        paymentStatus: createForm.paymentStatus,
        status: createForm.status,
        notes: createForm.notes,
        customerId: createForm.customerType === 'existing' ? createForm.customerId : undefined,
        guestName: createForm.customerName,
        guestPhone: createForm.customerPhone,
        guestEmail: createForm.customerEmail,
      };

      const res = await axiosInstance.post('/bookings', payload);
      toast.success(`Booking created! ID: ${res.data?.booking?.bookingId || 'Success'}`);
      setShowCreateModal(false);
      setCreateForm(initialCreateForm);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Edit Booking Handlers ---
  const openEditModal = (b) => {
    const dateStr = b.date
      ? new Date(b.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    setEditForm({
      customerName: b.customer?.name || b.guestInfo?.name || '',
      customerPhone: b.customer?.phone || b.guestInfo?.phone || '',
      customerEmail: b.customer?.email || b.guestInfo?.email || '',
      serviceId: b.service?._id || b.service || '',
      staffId: b.staff?._id || b.staff || '',
      date: dateStr,
      timeSlot: b.timeSlot || '10:00 AM',
      totalAmount: b.totalAmount ?? '',
      advanceAmount: b.advanceAmount ?? '0',
      paymentStatus: b.paymentStatus || 'unpaid',
      status: b.status || 'confirmed',
      notes: b.notes || '',
    });
    setEditingBooking(b);
    setSelected(null);
  };

  const handleUpdateBookingSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.customerName.trim()) {
      return toast.error('Please enter customer name');
    }
    if (!editForm.serviceId) {
      return toast.error('Please select a service');
    }

    setSubmitting(true);
    try {
      await axiosInstance.put(`/bookings/${editingBooking._id}`, editForm);
      toast.success('Booking updated successfully! ✨');
      setEditingBooking(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update booking');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Export Handlers ---
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

  const [sendingReminders, setSendingReminders] = useState(false);

  const handleSendDailyReminders = async () => {
    if (!window.confirm("Send automated WhatsApp & Email appointment reminders to all customers with bookings today?")) return;
    try {
      setSendingReminders(true);
      const res = await axiosInstance.post('/bookings/send-daily-reminders?secret=buc_cron_secret_2024');
      if (res.data.success) {
        toast.success(res.data.message || `Processed ${res.data.count} reminders for today!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send daily reminders');
    } finally {
      setSendingReminders(false);
    }
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

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setShowCreateModal(true)}
              style={S.createBtn}
              title="Create a new booking directly for walk-in or phone customer"
            >
              ➕ New Booking
            </button>
            <button
              onClick={handleSendDailyReminders}
              disabled={sendingReminders}
              style={{
                ...S.exportBtn,
                background: 'rgba(52,211,153,0.12)',
                border: '1px solid rgba(52,211,153,0.3)',
                color: '#34D399',
              }}
              title="Trigger automated WhatsApp and email reminders to all customers having appointments today"
            >
              {sendingReminders ? 'Sending...' : '🔔 Send Today’s Reminders (WhatsApp)'}
            </button>
            <button onClick={handleExportCSV} style={S.exportBtn}>
              📊 Export to Excel
            </button>
            <button onClick={handleExportPDF} style={S.exportBtn}>
              📄 Export to PDF
            </button>
          </div>
        </div>

        <div style={S.toolbar}>
          <input
            style={{ ...S.input, minWidth: '220px' }}
            placeholder="🔍 Search by ID or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <input
            style={{ ...S.input, minWidth: '210px' }}
            type="tel"
            placeholder="📱 Filter by mobile number..."
            value={phoneSearch}
            onChange={e => setPhoneSearch(e.target.value)}
          />
          <select style={S.select} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {(search || phoneSearch || filter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setPhoneSearch(''); setFilter('all'); }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(251,246,238,0.15)',
                color: 'rgba(251,246,238,0.6)',
                borderRadius: '8px',
                padding: '0.6rem 0.85rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              Reset Filters
            </button>
          )}
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
                              onClick={(e) => e.stopPropagation()}
                              style={{ color: '#10B981', fontSize: '0.75rem', textDecoration: 'underline' }}
                              title="Call customer"
                            >
                              Call
                            </a>
                            {(() => {
                              const digits = customerPhone.replace(/[^\d]/g, '');
                              const waNumber = digits.length === 10 ? `91${digits}` : digits;
                              return (
                                <a
                                  href={`https://wa.me/${waNumber}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ color: '#34D399', fontSize: '0.75rem', textDecoration: 'underline' }}
                                  title="WhatsApp customer"
                                >
                                  WhatsApp
                                </a>
                              );
                            })()}
                          </div>
                        ) : (
                          <span style={{ color: 'rgba(251,246,238,0.3)', fontSize: '0.75rem' }}>No phone provided</span>
                        )}
                        {customerEmail ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: 'rgba(251,246,238,0.6)' }}>✉️ {customerEmail}</span>
                            <a
                              href={`mailto:${customerEmail}`}
                              onClick={(e) => e.stopPropagation()}
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
                      <button style={S.actionBtn('#3B82F6')} onClick={() => openEditModal(b)}>✏️ Edit</button>
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

      {/* CREATE NEW BOOKING MODAL */}
      {showCreateModal && (
        <div style={S.overlay} onClick={() => setShowCreateModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h2 style={S.mh2}>➕ Enter New Customer Booking</h2>
            <form onSubmit={handleCreateBookingSubmit}>
              {/* Customer Type Toggle */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', background: 'rgba(251,246,238,0.05)', padding: '8px 12px', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="custType"
                    checked={createForm.customerType === 'new'}
                    onChange={() => setCreateForm(p => ({ ...p, customerType: 'new' }))}
                  />
                  Walk-in / New Customer
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="custType"
                    checked={createForm.customerType === 'existing'}
                    onChange={() => setCreateForm(p => ({ ...p, customerType: 'existing' }))}
                  />
                  Existing Customer
                </label>
              </div>

              {createForm.customerType === 'existing' && (
                <div>
                  <label style={S.label}>Select Registered Customer *</label>
                  <select
                    style={S.mselect}
                    value={createForm.customerId}
                    onChange={e => handleCustomerSelectInCreate(e.target.value)}
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.phone ? `(${c.phone})` : ''} - {c.email || ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={S.row2}>
                <div>
                  <label style={S.label}>Customer Name *</label>
                  <input
                    style={S.minput}
                    placeholder="e.g. Priya Sharma"
                    value={createForm.customerName}
                    onChange={e => setCreateForm(p => ({ ...p, customerName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label style={S.label}>Mobile Number (WhatsApp updates)</label>
                  <input
                    style={S.minput}
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={createForm.customerPhone}
                    onChange={e => setCreateForm(p => ({ ...p, customerPhone: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label style={S.label}>Email Address (Optional)</label>
                <input
                  style={S.minput}
                  type="email"
                  placeholder="e.g. priya@example.com"
                  value={createForm.customerEmail}
                  onChange={e => setCreateForm(p => ({ ...p, customerEmail: e.target.value }))}
                />
              </div>

              {/* Service & Staff */}
              <div style={S.row2}>
                <div>
                  <label style={S.label}>Select Service *</label>
                  <select
                    style={S.mselect}
                    value={createForm.serviceId}
                    onChange={e => handleServiceSelectInCreate(e.target.value)}
                    required
                  >
                    <option value="">-- Select Service --</option>
                    {services.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.name} (₹{s.price})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Assign Stylist / Staff</label>
                  <select
                    style={S.mselect}
                    value={createForm.staffId}
                    onChange={e => setCreateForm(p => ({ ...p, staffId: e.target.value }))}
                  >
                    <option value="">Any Available Stylist</option>
                    {staffList.map(st => (
                      <option key={st._id} value={st._id}>
                        {st.name} {st.specialization ? `(${st.specialization})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Time Slot */}
              <div style={S.row2}>
                <div>
                  <label style={S.label}>Appointment Date *</label>
                  <input
                    style={S.minput}
                    type="date"
                    value={createForm.date}
                    onChange={e => setCreateForm(p => ({ ...p, date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label style={S.label}>Time Slot *</label>
                  <select
                    style={S.mselect}
                    value={createForm.timeSlot}
                    onChange={e => setCreateForm(p => ({ ...p, timeSlot: e.target.value }))}
                    required
                  >
                    {TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Payments */}
              <div style={S.row2}>
                <div>
                  <label style={S.label}>Total Amount (₹) *</label>
                  <input
                    style={S.minput}
                    type="number"
                    min="0"
                    placeholder="Total price"
                    value={createForm.totalAmount}
                    onChange={e => setCreateForm(p => ({ ...p, totalAmount: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label style={S.label}>Advance Paid (₹)</label>
                  <input
                    style={S.minput}
                    type="number"
                    min="0"
                    placeholder="Advance amount"
                    value={createForm.advanceAmount}
                    onChange={e => setCreateForm(p => ({ ...p, advanceAmount: e.target.value }))}
                  />
                </div>
              </div>

              <div style={S.row2}>
                <div>
                  <label style={S.label}>Payment Status</label>
                  <select
                    style={S.mselect}
                    value={createForm.paymentStatus}
                    onChange={e => setCreateForm(p => ({ ...p, paymentStatus: e.target.value }))}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="advance_paid">Advance Paid</option>
                    <option value="fully_paid">Fully Paid</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>Booking Status</label>
                  <select
                    style={S.mselect}
                    value={createForm.status}
                    onChange={e => setCreateForm(p => ({ ...p, status: e.target.value }))}
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={S.label}>Notes / Styling Preferences</label>
                <textarea
                  style={{ ...S.minput, minHeight: '65px', resize: 'vertical' }}
                  placeholder="Curl pattern notes, customer requests..."
                  value={createForm.notes}
                  onChange={e => setCreateForm(p => ({ ...p, notes: e.target.value }))}
                />
              </div>

              <div style={S.mBtns}>
                <button type="button" style={S.cancelBtn} onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={S.saveBtn} disabled={submitting}>
                  {submitting ? 'Creating...' : '✅ Save Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT / UPDATE BOOKING MODAL */}
      {editingBooking && (
        <div style={S.overlay} onClick={() => setEditingBooking(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h2 style={S.mh2}>✏️ Update Booking — {editingBooking.bookingId}</h2>
            <form onSubmit={handleUpdateBookingSubmit}>
              <div style={S.row2}>
                <div>
                  <label style={S.label}>Customer Name *</label>
                  <input
                    style={S.minput}
                    value={editForm.customerName}
                    onChange={e => setEditForm(p => ({ ...p, customerName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label style={S.label}>Mobile Number (WhatsApp)</label>
                  <input
                    style={S.minput}
                    type="tel"
                    value={editForm.customerPhone}
                    onChange={e => setEditForm(p => ({ ...p, customerPhone: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label style={S.label}>Email Address</label>
                <input
                  style={S.minput}
                  type="email"
                  value={editForm.customerEmail}
                  onChange={e => setEditForm(p => ({ ...p, customerEmail: e.target.value }))}
                />
              </div>

              <div style={S.row2}>
                <div>
                  <label style={S.label}>Service *</label>
                  <select
                    style={S.mselect}
                    value={editForm.serviceId}
                    onChange={e => {
                      const s = services.find(x => x._id === e.target.value);
                      setEditForm(p => ({
                        ...p,
                        serviceId: e.target.value,
                        totalAmount: s ? s.price : p.totalAmount,
                      }));
                    }}
                    required
                  >
                    <option value="">-- Choose Service --</option>
                    {services.map(s => (
                      <option key={s._id} value={s._id}>{s.name} (₹{s.price})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Stylist / Staff</label>
                  <select
                    style={S.mselect}
                    value={editForm.staffId}
                    onChange={e => setEditForm(p => ({ ...p, staffId: e.target.value }))}
                  >
                    <option value="">Any Available Stylist</option>
                    {staffList.map(st => (
                      <option key={st._id} value={st._id}>{st.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={S.row2}>
                <div>
                  <label style={S.label}>Date *</label>
                  <input
                    style={S.minput}
                    type="date"
                    value={editForm.date}
                    onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label style={S.label}>Time Slot *</label>
                  <select
                    style={S.mselect}
                    value={editForm.timeSlot}
                    onChange={e => setEditForm(p => ({ ...p, timeSlot: e.target.value }))}
                    required
                  >
                    {TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={S.row2}>
                <div>
                  <label style={S.label}>Total Amount (₹) *</label>
                  <input
                    style={S.minput}
                    type="number"
                    min="0"
                    value={editForm.totalAmount}
                    onChange={e => setEditForm(p => ({ ...p, totalAmount: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label style={S.label}>Advance Paid (₹)</label>
                  <input
                    style={S.minput}
                    type="number"
                    min="0"
                    value={editForm.advanceAmount}
                    onChange={e => setEditForm(p => ({ ...p, advanceAmount: e.target.value }))}
                  />
                </div>
              </div>

              <div style={S.row2}>
                <div>
                  <label style={S.label}>Payment Status</label>
                  <select
                    style={S.mselect}
                    value={editForm.paymentStatus}
                    onChange={e => setEditForm(p => ({ ...p, paymentStatus: e.target.value }))}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="advance_paid">Advance Paid</option>
                    <option value="fully_paid">Fully Paid</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>Booking Status</label>
                  <select
                    style={S.mselect}
                    value={editForm.status}
                    onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={S.label}>Notes</label>
                <textarea
                  style={{ ...S.minput, minHeight: '65px', resize: 'vertical' }}
                  value={editForm.notes}
                  onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))}
                />
              </div>

              <div style={S.mBtns}>
                <button type="button" style={S.cancelBtn} onClick={() => setEditingBooking(null)}>
                  Cancel
                </button>
                <button type="submit" style={S.saveBtn} disabled={submitting}>
                  {submitting ? 'Updating...' : '✔️ Update Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {selected && (
        <div style={S.overlay} onClick={() => setSelected(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ ...S.mh2, margin: 0 }}>Booking Details — {selected.bookingId}</h2>
              <button
                onClick={() => openEditModal(selected)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  color: '#60A5FA',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                ✏️ Edit Booking
              </button>
            </div>
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
                        onClick={(e) => e.stopPropagation()}
                        style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(16,185,129,0.15)', color: '#34D399', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600' }}
                      >
                        📞 Call Customer
                      </a>
                      {(() => {
                        const rawPhone = selected.customer?.phone || selected.guestInfo?.phone || '';
                        const digits = rawPhone.replace(/[^\d]/g, '');
                        const waNumber = digits.length === 10 ? `91${digits}` : digits;
                        return (
                          <a
                            href={`https://wa.me/${waNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(52,211,153,0.15)', color: '#10B981', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600' }}
                          >
                            💬 WhatsApp
                          </a>
                        );
                      })()}
                    </>
                  )}
                  {(selected.customer?.email || selected.guestInfo?.email) && (
                    <a
                      href={`mailto:${selected.customer?.email || selected.guestInfo?.email}?subject=Regarding your BakeUrCurls Booking ${selected.bookingId}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(241,213,146,0.15)', color: '#F1D592', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600' }}
                    >
                      ✉️ Send Email
                    </a>
                  )}
                </div>
              </div>
            )}

            <div style={{ ...S.mBtns, marginTop: '1.5rem' }}>
              <button
                style={{ ...S.actionBtn('#3B82F6'), padding: '0.7rem 1.2rem', fontSize: '0.85rem' }}
                onClick={() => openEditModal(selected)}
              >
                ✏️ Edit Booking
              </button>
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
