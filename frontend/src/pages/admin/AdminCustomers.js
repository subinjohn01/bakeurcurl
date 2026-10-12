import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { AdminSidebarNav } from './AdminDashboard';

const S = {
  page: { minHeight: '100vh', background: '#231812', display: 'flex', fontFamily: "'Inter', sans-serif", color: '#fff' },
  content: { flex: 1, padding: '2rem', overflow: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  h1: { fontSize: '1.75rem', fontWeight: '800', fontFamily: "'Playfair Display', serif", color: '#FBF6EE' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  statCard: (borderColor, bgColor) => ({
    background: bgColor || 'rgba(251,246,238,0.03)',
    border: `1px solid ${borderColor || 'rgba(251,246,238,0.08)'}`,
    borderRadius: '12px',
    padding: '1.25rem',
  }),
  statLabel: { color: 'rgba(251,246,238,0.55)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' },
  statVal: { fontSize: '1.8rem', fontWeight: '800' },
  tableWrap: { background: 'rgba(251,246,238,0.03)', border: '1px solid rgba(251,246,238,0.07)', borderRadius: '12px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.85rem 1rem', color: 'rgba(251,246,238,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(251,246,238,0.08)', background: 'rgba(0,0,0,0.2)' },
  td: { padding: '1rem', borderBottom: '1px solid rgba(251,246,238,0.05)', fontSize: '0.875rem', verticalAlign: 'middle' },
  btnPrimary: {
    background: 'linear-gradient(135deg, #A87A51, #754B2E)',
    color: '#fff',
    border: 'none',
    padding: '0.65rem 1.25rem',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.9rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  btnOutline: {
    background: 'transparent',
    color: 'rgba(251,246,238,0.7)',
    border: '1px solid rgba(251,246,238,0.2)',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  actionBtn: (color, bg) => ({
    background: bg || `${color}15`,
    color: color,
    border: `1px solid ${color}35`,
    padding: '0.35rem 0.65rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  }),
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 10, 8, 0.78)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    background: '#231812',
    border: '1px solid rgba(241,213,146,0.25)',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    maxWidth: '750px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.7)',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  formGroup: { marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#F1D592', marginBottom: '0.4rem' },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(251,246,238,0.05)',
    border: '1px solid rgba(251,246,238,0.15)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    outline: 'none',
  },
};

const statusColors = { pending: '#F59E0B', confirmed: '#10B981', completed: '#8B5A2B', cancelled: '#EF4444' };

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBookings, setCustomerBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'bookings'
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    birthday: '',
  });

  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    birthday: '',
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/customers');
      if (res.data.success) {
        setCustomers(res.data.customers || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openCustomerDetails = async (customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      birthday: customer.birthday || '',
    });
    setActiveTab('profile');
    try {
      setLoadingBookings(true);
      const res = await axiosInstance.get(`/customers/${customer._id}`);
      if (res.data.success) {
        setCustomerBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.warn('Failed to load customer booking history:', err.message);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    if (!editForm.name.trim()) return toast.error('Customer name is required.');
    if (!editForm.email.trim()) return toast.error('Customer email is required.');

    try {
      setSubmitting(true);
      const res = await axiosInstance.put(`/customers/${selectedCustomer._id}`, editForm);
      if (res.data.success) {
        toast.success(res.data.message || 'Customer profile updated successfully!');
        setSelectedCustomer((prev) => ({ ...prev, ...editForm }));
        setCustomers((prev) =>
          prev.map((c) => (c._id === selectedCustomer._id ? { ...c, ...editForm } : c))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) return toast.error('Customer name is required.');
    if (!addForm.email.trim()) return toast.error('Customer email is required.');

    try {
      setSubmitting(true);
      const res = await axiosInstance.post('/customers', addForm);
      if (res.data.success) {
        toast.success(res.data.message || 'Customer created successfully!');
        setShowAddModal(false);
        setAddForm({ name: '', phone: '', email: '', address: '', birthday: '' });
        fetchCustomers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer '${name}'?`)) return;
    try {
      const res = await axiosInstance.delete(`/customers/${id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Customer deleted successfully.');
        setCustomers((prev) => prev.filter((c) => c._id !== id));
        if (selectedCustomer?._id === id) setSelectedCustomer(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  // Stats calculation
  const totalCustomers = customers.length;
  const totalBookingsCount = customers.reduce((sum, c) => sum + (c.totalBookings || 0), 0);
  const currentMonth = new Date().getMonth();
  const birthdaysThisMonth = customers.filter((c) => {
    if (!c.birthday) return false;
    const bDate = new Date(c.birthday);
    return !isNaN(bDate) && bDate.getMonth() === currentMonth;
  }).length;

  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={S.page}>
      <AdminSidebarNav active="/admin/customers" />

      <main style={S.content}>
        <div style={S.header}>
          <div>
            <h1 style={S.h1}>👤 Customer Relationship Management</h1>
            <p style={{ color: 'rgba(251,246,238,0.5)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Manage customer profiles, contact numbers, addresses, birthdays, and appointment history.
            </p>
          </div>
          <button style={S.btnPrimary} onClick={() => setShowAddModal(true)}>
            <span>+</span> Add New Customer
          </button>
        </div>

        {/* Stats Grid */}
        <div style={S.statsGrid}>
          <div style={S.statCard('rgba(251,246,238,0.1)')}>
            <div style={S.statLabel}>Total Customers</div>
            <div style={{ ...S.statVal, color: '#FBF6EE' }}>{totalCustomers}</div>
          </div>
          <div style={S.statCard('rgba(52,211,153,0.3)', 'rgba(52,211,153,0.06)')}>
            <div style={S.statLabel}>Total Bookings Done</div>
            <div style={{ ...S.statVal, color: '#34D399' }}>{totalBookingsCount}</div>
          </div>
          <div style={S.statCard('rgba(232,180,160,0.3)', 'rgba(232,180,160,0.06)')}>
            <div style={S.statLabel}>🎂 Birthdays This Month</div>
            <div style={{ ...S.statVal, color: '#E8B4A0' }}>{birthdaysThisMonth}</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Search by customer name, mobile number, email, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...S.input, padding: '0.65rem 1rem' }}
          />
        </div>

        {/* Customers Table */}
        <div style={S.tableWrap}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(251,246,238,0.5)' }}>
              Loading customers...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(251,246,238,0.5)' }}>
              No customers found. Click "+ Add New Customer" to register one.
            </div>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Customer</th>
                  <th style={S.th}>Mobile & Quick Connect</th>
                  <th style={S.th}>Email Address</th>
                  <th style={S.th}>Address / Location</th>
                  <th style={S.th}>Birthday</th>
                  <th style={S.th}>Bookings</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => {
                  const initials = c.name ? c.name.slice(0, 2).toUpperCase() : 'CU';
                  const cleanPhone = c.phone ? c.phone.replace(/[^\d]/g, '') : '';
                  return (
                    <tr key={c._id}>
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #A87A51, #754B2E)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '0.8rem',
                              color: '#fff',
                              border: '1px solid rgba(241,213,146,0.3)',
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#FBF6EE' }}>{c.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'rgba(251,246,238,0.4)' }}>
                              Joined {new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={S.td}>
                        {c.phone ? (
                          <div>
                            <div style={{ fontWeight: '600', color: '#34D399', fontSize: '0.9rem' }}>
                              📱 {c.phone}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                              <a
                                href={`tel:${c.phone}`}
                                style={S.actionBtn('#34D399')}
                                title="Call customer"
                              >
                                📞 Call
                              </a>
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                style={S.actionBtn('#10B981')}
                                title="WhatsApp chat"
                              >
                                💬 WhatsApp
                              </a>
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'rgba(251,246,238,0.3)', fontSize: '0.8rem' }}>No mobile</span>
                        )}
                      </td>
                      <td style={S.td}>
                        <div>
                          <span style={{ color: '#FBF6EE', fontSize: '0.85rem' }}>{c.email}</span>
                          <div style={{ marginTop: '3px' }}>
                            <a
                              href={`mailto:${c.email}`}
                              style={{ color: '#E8B4A0', fontSize: '0.75rem', textDecoration: 'underline' }}
                            >
                              ✉️ Email
                            </a>
                          </div>
                        </div>
                      </td>
                      <td style={S.td}>
                        <span style={{ color: c.address ? 'rgba(251,246,238,0.8)' : 'rgba(251,246,238,0.3)', fontSize: '0.85rem' }}>
                          {c.address || '—'}
                        </span>
                      </td>
                      <td style={S.td}>
                        {c.birthday ? (
                          <span style={{ color: '#F1D592', fontSize: '0.85rem', fontWeight: 500 }}>
                            🎂 {c.birthday}
                          </span>
                        ) : (
                          <span style={{ color: 'rgba(251,246,238,0.3)', fontSize: '0.85rem' }}>—</span>
                        )}
                      </td>
                      <td style={S.td}>
                        <div>
                          <span
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '10px',
                              background: c.totalBookings > 0 ? 'rgba(52,211,153,0.15)' : 'rgba(251,246,238,0.06)',
                              color: c.totalBookings > 0 ? '#34D399' : 'rgba(251,246,238,0.5)',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                            }}
                          >
                            {c.totalBookings || 0} visits
                          </span>
                        </div>
                      </td>
                      <td style={{ ...S.td, textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            style={S.actionBtn('#F1D592', 'rgba(241,213,146,0.1)')}
                            onClick={() => openCustomerDetails(c)}
                          >
                            View & Edit
                          </button>
                          <button
                            style={S.actionBtn('#F87171', 'rgba(248,113,113,0.1)')}
                            onClick={() => handleDeleteCustomer(c._id, c.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* View & Edit Customer Modal with Bookings History */}
      {selectedCustomer && (
        <div style={S.modalOverlay} onClick={() => setSelectedCustomer(null)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', fontFamily: "'Playfair Display', serif", color: '#F1D592' }}>
                  {selectedCustomer.name}
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'rgba(251,246,238,0.5)', marginTop: '2px' }}>
                  Customer ID: {selectedCustomer._id}
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(251,246,238,0.1)', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                style={{
                  padding: '0.65rem 1.25rem',
                  border: 'none',
                  background: 'transparent',
                  color: activeTab === 'profile' ? '#F1D592' : 'rgba(251,246,238,0.5)',
                  fontWeight: activeTab === 'profile' ? 700 : 500,
                  borderBottom: activeTab === 'profile' ? '2px solid #F1D592' : '2px solid transparent',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                📝 Profile Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                style={{
                  padding: '0.65rem 1.25rem',
                  border: 'none',
                  background: 'transparent',
                  color: activeTab === 'bookings' ? '#F1D592' : 'rgba(251,246,238,0.5)',
                  fontWeight: activeTab === 'bookings' ? 700 : 500,
                  borderBottom: activeTab === 'bookings' ? '2px solid #F1D592' : '2px solid transparent',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                📅 Bookings Done So Far ({customerBookings.length})
              </button>
            </div>

            {/* TAB 1: Profile Details */}
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateCustomer}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={S.label}>Full Name *</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      style={S.input}
                      required
                    />
                  </div>
                  <div>
                    <label style={S.label}>Mobile Number *</label>
                    <input
                      type="tel"
                      placeholder="e.g. 8891020402"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      style={S.input}
                    />
                  </div>
                </div>

                <div style={S.formGroup}>
                  <label style={S.label}>Email Address *</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    style={S.input}
                    required
                  />
                </div>

                <div style={S.formGroup}>
                  <label style={S.label}>Home / Mailing Address</label>
                  <textarea
                    rows={2}
                    placeholder="Enter street, apartment, locality, city..."
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    style={{ ...S.input, resize: 'vertical' }}
                  />
                </div>

                <div style={S.formGroup}>
                  <label style={S.label}>Birthday (Date of Birth) 🎂</label>
                  <input
                    type="date"
                    value={editForm.birthday}
                    onChange={(e) => setEditForm({ ...editForm, birthday: e.target.value })}
                    style={S.input}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'rgba(251,246,238,0.4)', marginTop: '4px' }}>
                    Used for birthday greetings and special loyalty reward coupons.
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                  <button
                    type="button"
                    style={S.btnOutline}
                    onClick={() => setSelectedCustomer(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={S.btnPrimary}
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Bookings Done So Far */}
            {activeTab === 'bookings' && (
              <div>
                {loadingBookings ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(251,246,238,0.5)' }}>
                    Loading appointment history...
                  </div>
                ) : customerBookings.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(251,246,238,0.5)', background: 'rgba(251,246,238,0.02)', borderRadius: '12px' }}>
                    No appointments booked so far for this customer.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '50vh', overflowY: 'auto' }}>
                    {customerBookings.map((b) => {
                      const color = statusColors[b.status] || '#888';
                      return (
                        <div
                          key={b._id}
                          style={{
                            background: 'rgba(251,246,238,0.03)',
                            border: '1px solid rgba(251,246,238,0.07)',
                            borderRadius: '10px',
                            padding: '1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '12px',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 700, color: '#F1D592', fontSize: '1rem' }}>
                                ✨ {b.service?.name || 'Hair Service'}
                              </span>
                              <span
                                style={{
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '10px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  background: `${color}20`,
                                  color: color,
                                  textTransform: 'uppercase',
                                }}
                              >
                                {b.status}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'rgba(251,246,238,0.6)', marginTop: '4px' }}>
                              📅 {new Date(b.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} at 🕒 {b.timeSlot}
                            </div>
                            {b.staff?.name && (
                              <div style={{ fontSize: '0.78rem', color: 'rgba(251,246,238,0.45)', marginTop: '2px' }}>
                                👤 Stylist: {b.staff.name}
                              </div>
                            )}
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34D399' }}>
                              ₹{b.totalAmount}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(251,246,238,0.5)', marginTop: '2px' }}>
                              Payment: <span style={{ textTransform: 'capitalize', color: b.paymentStatus === 'unpaid' ? '#F59E0B' : '#34D399' }}>{b.paymentStatus}</span>
                            </div>
                            {b.couponCode && (
                              <div style={{ fontSize: '0.72rem', color: '#E8B4A0', marginTop: '2px' }}>
                                Coupon: {b.couponCode} (-₹{b.discountAmount || 0})
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {showAddModal && (
        <div style={S.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', fontFamily: "'Playfair Display', serif", color: '#F1D592' }}>
                Add New Customer
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={S.label}>Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    style={S.input}
                    required
                  />
                </div>
                <div>
                  <label style={S.label}>Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="e.g. 8891020402"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    style={S.input}
                  />
                </div>
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. priya@example.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  style={S.input}
                  required
                />
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>Home / Mailing Address</label>
                <textarea
                  rows={2}
                  placeholder="Enter street, apartment, locality, city..."
                  value={addForm.address}
                  onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  style={{ ...S.input, resize: 'vertical' }}
                />
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>Birthday (Date of Birth) 🎂</label>
                <input
                  type="date"
                  value={addForm.birthday}
                  onChange={(e) => setAddForm({ ...addForm, birthday: e.target.value })}
                  style={S.input}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button
                  type="button"
                  style={S.btnOutline}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={S.btnPrimary}
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
