import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { AdminSidebarNav } from './AdminDashboard';

const S = {
  page: { minHeight: '100vh', background: '#231812', display: 'flex', fontFamily: "'Inter', sans-serif", color: '#fff' },
  content: { flex: 1, padding: '2rem', overflow: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  h1: { fontSize: '1.75rem', fontWeight: '800', fontFamily: "'Playfair Display', serif", color: '#FBF6EE' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' },
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
    transition: 'opacity 0.2s',
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
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 10, 8, 0.75)',
    backdropFilter: 'blur(4px)',
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
    maxWidth: '560px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
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
  select: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#1F140E',
    border: '1px solid rgba(251,246,238,0.15)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    outline: 'none',
  },
};

export default function AdminLoyalty() {
  const [coupons, setCoupons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    discountType: 'percentage', // 'percentage' | 'fixed'
    discountValue: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    customerId: '',
    customerEmail: '',
    customerPhone: '',
    targetInput: '',
    minBookingAmount: '0',
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/coupons');
      if (res.data.success) {
        setCoupons(res.data.coupons || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axiosInstance.get('/coupons/customers');
      if (res.data.success) {
        setCustomers(res.data.customers || []);
      }
    } catch (err) {
      console.warn('Could not load customer list:', err.message);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchCustomers();
  }, []);

  const handleGenerateCode = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const code = `VIP-${rand}`;
    setFormData((prev) => ({ ...prev, code }));
  };

  const handleCustomerSelect = (e) => {
    const val = e.target.value;
    if (!val) {
      setFormData((prev) => ({
        ...prev,
        customerId: '',
        customerEmail: '',
        customerPhone: '',
        targetInput: '',
      }));
      return;
    }
    const found = customers.find((c) => c._id === val);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        customerId: found._id,
        customerEmail: found.email || '',
        customerPhone: found.phone || '',
        targetInput: found.phone || found.email || '',
      }));
    }
  };

  const handleTargetInputChange = (val) => {
    const isEmail = val.includes('@');
    setFormData((prev) => ({
      ...prev,
      targetInput: val,
      customerId: '',
      customerEmail: isEmail ? val.trim() : '',
      customerPhone: !isEmail ? val.trim() : '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) return toast.error('Coupon code is required.');
    if (!formData.title.trim()) return toast.error('Coupon title is required.');
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      return toast.error('Please enter a valid discount value.');
    }
    if (formData.discountType === 'percentage' && Number(formData.discountValue) > 100) {
      return toast.error('Percentage discount cannot exceed 100%.');
    }
    if (!formData.validUntil) return toast.error('Expiration date is required.');

    const phoneOrEmail = formData.customerPhone || formData.customerEmail || formData.targetInput.trim();
    if (!formData.customerId && !phoneOrEmail) {
      return toast.error('Please select a customer or enter a target mobile number.');
    }

    try {
      setSubmitting(true);
      const isEmail = phoneOrEmail.includes('@');
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discountValue: Number(formData.discountValue),
        minBookingAmount: Number(formData.minBookingAmount) || 0,
        customerPhone: formData.customerPhone || (!isEmail ? phoneOrEmail : ''),
        customerEmail: formData.customerEmail || (isEmail ? phoneOrEmail : ''),
      };

      const res = await axiosInstance.post('/coupons', payload);

      if (res.data.success) {
        toast.success(res.data.message || 'Loyalty coupon issued successfully!');
        setShowModal(false);
        setFormData({
          code: '',
          title: '',
          discountType: 'percentage',
          discountValue: '',
          validFrom: new Date().toISOString().split('T')[0],
          validUntil: '',
          customerId: '',
          customerEmail: '',
          customerPhone: '',
          targetInput: '',
          minBookingAmount: '0',
        });
        fetchCoupons();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to revoke coupon '${code}'?`)) return;
    try {
      const res = await axiosInstance.delete(`/coupons/${id}`);
      if (res.data.success) {
        toast.success(`Coupon '${code}' deleted.`);
        setCoupons((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const getCouponStatus = (c) => {
    if (c.isRedeemed) return { label: 'Redeemed', color: '#60A5FA', bg: 'rgba(96,165,250,0.15)' };
    const now = new Date();
    if (new Date(c.validUntil) < now) return { label: 'Expired', color: '#F87171', bg: 'rgba(248,113,113,0.15)' };
    if (c.validFrom && new Date(c.validFrom) > now) return { label: 'Upcoming', color: '#FBBF24', bg: 'rgba(251,191,36,0.15)' };
    return { label: 'Active', color: '#34D399', bg: 'rgba(52,211,153,0.15)' };
  };

  // Stats calculation
  const totalCount = coupons.length;
  const activeCount = coupons.filter((c) => !c.isRedeemed && new Date(c.validUntil) >= new Date()).length;
  const redeemedCount = coupons.filter((c) => c.isRedeemed).length;
  const expiredCount = coupons.filter((c) => !c.isRedeemed && new Date(c.validUntil) < new Date()).length;

  // Filtered list
  const filteredCoupons = coupons.filter((c) => {
    const status = getCouponStatus(c).label.toLowerCase();
    if (statusFilter !== 'all' && status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const codeMatch = c.code?.toLowerCase().includes(q);
      const titleMatch = c.title?.toLowerCase().includes(q);
      const customerMatch =
        c.assignedEmail?.toLowerCase().includes(q) ||
        c.customer?.name?.toLowerCase().includes(q) ||
        c.customer?.phone?.toLowerCase().includes(q);
      return codeMatch || titleMatch || customerMatch;
    }
    return true;
  });

  return (
    <div style={S.page}>
      <AdminSidebarNav active="/admin/loyalty" />

      <main style={S.content}>
        <div style={S.header}>
          <div>
            <h1 style={S.h1}>🎁 Loyalty & Customer Coupons</h1>
            <p style={{ color: 'rgba(251,246,238,0.5)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Issue exclusive fixed-amount or percentage loyalty coupons to targeted registered customers.
            </p>
          </div>
          <button style={S.btnPrimary} onClick={() => setShowModal(true)}>
            <span>+</span> Issue New Coupon
          </button>
        </div>

        {/* Stats Grid */}
        <div style={S.statsGrid}>
          <div style={S.statCard('rgba(251,246,238,0.1)')}>
            <div style={S.statLabel}>Total Issued</div>
            <div style={{ ...S.statVal, color: '#FBF6EE' }}>{totalCount}</div>
          </div>
          <div style={S.statCard('rgba(52,211,153,0.3)', 'rgba(52,211,153,0.06)')}>
            <div style={S.statLabel}>Active & Usable</div>
            <div style={{ ...S.statVal, color: '#34D399' }}>{activeCount}</div>
          </div>
          <div style={S.statCard('rgba(96,165,250,0.3)', 'rgba(96,165,250,0.06)')}>
            <div style={S.statLabel}>Redeemed</div>
            <div style={{ ...S.statVal, color: '#60A5FA' }}>{redeemedCount}</div>
          </div>
          <div style={S.statCard('rgba(248,113,113,0.3)', 'rgba(248,113,113,0.06)')}>
            <div style={S.statLabel}>Expired</div>
            <div style={{ ...S.statVal, color: '#F87171' }}>{expiredCount}</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by code, title, or customer email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              ...S.input,
              flex: 1,
              minWidth: '240px',
              padding: '0.65rem 1rem',
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              ...S.select,
              width: 'auto',
              minWidth: '150px',
              padding: '0.65rem 1rem',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="redeemed">Redeemed</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Table */}
        <div style={S.tableWrap}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(251,246,238,0.5)' }}>
              Loading coupons...
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(251,246,238,0.5)' }}>
              No loyalty coupons found matching your filter.
            </div>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Coupon Code</th>
                  <th style={S.th}>Title / Purpose</th>
                  <th style={S.th}>Discount Value</th>
                  <th style={S.th}>Assigned Customer</th>
                  <th style={S.th}>Validity Period</th>
                  <th style={S.th}>Status</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((c) => {
                  const status = getCouponStatus(c);
                  return (
                    <tr key={c._id}>
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: '700',
                              fontSize: '0.95rem',
                              letterSpacing: '0.05em',
                              padding: '0.2rem 0.5rem',
                              background: 'rgba(241,213,146,0.15)',
                              border: '1px dashed #F1D592',
                              borderRadius: '6px',
                              color: '#F1D592',
                            }}
                          >
                            {c.code}
                          </span>
                          <button
                            title="Copy code"
                            onClick={() => {
                              navigator.clipboard.writeText(c.code);
                              toast.success(`Copied ${c.code}`);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'rgba(251,246,238,0.5)',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                          >
                            📋
                          </button>
                        </div>
                      </td>
                      <td style={S.td}>
                        <div style={{ fontWeight: '600', color: '#FBF6EE' }}>{c.title}</div>
                        {c.minBookingAmount > 0 && (
                          <div style={{ fontSize: '0.75rem', color: 'rgba(251,246,238,0.45)', marginTop: '2px' }}>
                            Min Spend: ₹{c.minBookingAmount}
                          </div>
                        )}
                      </td>
                      <td style={S.td}>
                        <span
                          style={{
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            color: c.discountType === 'percentage' ? '#E8B4A0' : '#34D399',
                          }}
                        >
                          {c.discountType === 'percentage'
                            ? `${c.discountValue}% OFF`
                            : `₹${c.discountValue} FLAT OFF`}
                        </span>
                      </td>
                      <td style={S.td}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#FBF6EE' }}>
                            {c.customer?.name || (c.assignedPhone ? `Customer (${c.assignedPhone})` : 'Customer')}
                          </div>
                          {(c.assignedPhone || c.customer?.phone) && (
                            <div style={{ fontSize: '0.82rem', color: '#34D399', fontWeight: 600 }}>
                              📱 {c.assignedPhone || c.customer?.phone}
                            </div>
                          )}
                          {c.assignedEmail && (
                            <div style={{ fontSize: '0.75rem', color: '#A87A51' }}>
                              ✉️ {c.assignedEmail}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={S.td}>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(251,246,238,0.7)' }}>
                          Expires: {new Date(c.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(251,246,238,0.4)' }}>
                          From: {new Date(c.validFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td style={S.td}>
                        <span
                          style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            background: status.bg,
                            color: status.color,
                            display: 'inline-block',
                          }}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td style={{ ...S.td, textAlign: 'right' }}>
                        <button
                          onClick={() => handleDelete(c._id, c.code)}
                          title="Revoke / Delete coupon"
                          style={{
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#F87171',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                          }}
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Issue Coupon Modal */}
      {showModal && (
        <div style={S.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: "'Playfair Display', serif", color: '#F1D592' }}>
                Issue Loyalty Coupon
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Code with Auto-generator */}
              <div style={S.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ ...S.label, margin: 0 }}>Coupon Code *</label>
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#E8B4A0',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    🎲 Auto-generate
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. VIP20 or LOYAL500"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  style={{ ...S.input, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}
                  required
                />
              </div>

              {/* Title */}
              <div style={S.formGroup}>
                <label style={S.label}>Coupon Title / Campaign *</label>
                <input
                  type="text"
                  placeholder="e.g. VIP Customer 20% Appreciation"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={S.input}
                  required
                />
              </div>

              {/* Discount Type & Value */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={S.label}>Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    style={S.select}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>
                    {formData.discountType === 'percentage' ? 'Percentage Off (%) *' : 'Discount Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData.discountType === 'percentage' ? '100' : '10000'}
                    placeholder={formData.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    style={S.input}
                    required
                  />
                </div>
              </div>

              {/* Target Customer */}
              <div style={S.formGroup}>
                <label style={S.label}>Target Customer Mobile Number (or Registered Email) *</label>
                {customers.length > 0 ? (
                  <select
                    value={formData.customerId}
                    onChange={handleCustomerSelect}
                    style={S.select}
                  >
                    <option value="">-- Choose registered customer (or type mobile below) --</option>
                    {customers.map((cust) => (
                      <option key={cust._id} value={cust._id}>
                        {cust.name} {cust.phone ? `· 📱 ${cust.phone}` : ''} ({cust.email})
                      </option>
                    ))}
                  </select>
                ) : null}
                <div style={{ marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    inputMode="tel"
                    placeholder="Enter customer mobile number (e.g. 8891020402) or email..."
                    value={formData.targetInput}
                    onChange={(e) => handleTargetInputChange(e.target.value)}
                    style={S.input}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(251,246,238,0.45)', marginTop: '4px' }}>
                  📱 Only customer with this mobile number (or email) can redeem this coupon.
                </div>
              </div>

              {/* Dates & Min Amount */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={S.label}>Valid From</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    style={S.input}
                  />
                </div>
                <div>
                  <label style={S.label}>Expires On (Valid Until) *</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    style={S.input}
                    required
                  />
                </div>
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>Minimum Booking Spend (₹) (Optional)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0 for no minimum"
                  value={formData.minBookingAmount}
                  onChange={(e) => setFormData({ ...formData, minBookingAmount: e.target.value })}
                  style={S.input}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  style={S.btnOutline}
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={S.btnPrimary}
                  disabled={submitting}
                >
                  {submitting ? 'Issuing...' : 'Issue Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
