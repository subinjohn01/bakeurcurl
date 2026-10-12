import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';

const S = {
  page: { minHeight: '100vh', background: '#231812', display: 'flex', fontFamily: "'Inter', sans-serif", color: '#fff' },
  sidebar: {
    width: '240px',
    background: 'rgba(251,246,238,0.03)',
    borderRight: '1px solid rgba(251,246,238,0.06)',
    padding: '2rem 1rem 1.5rem',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
    boxSizing: 'border-box',
    overflowY: 'auto',
    zIndex: 50,
  },
  sidebarLogo: {
    fontSize: '1.4rem', fontWeight: '800', fontFamily: "'Playfair Display', serif",
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
    background: `linear-gradient(135deg, ${color}20, ${color}10)`,
    border: `1px solid ${color}30`, borderRadius: '12px', padding: '1.5rem',
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
  return (
    <span style={{ padding: '0.2rem 0.65rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700', background: `${c}20`, color: c, textTransform: 'uppercase' }}>
      {s}
    </span>
  );
}

const navItems = [
  { to: '/admin', label: '📊 Dashboard', exact: true },
  { to: '/admin/bookings', label: '📅 Bookings' },
  { to: '/admin/services', label: '✂️ Services' },
  { to: '/admin/products', label: '🧴 Products' },
  { to: '/admin/staff', label: '👥 Staff' },
  { to: '/admin/loyalty', label: '🎁 Loyalty' },
  { to: '/admin/queries', label: '💬 Queries' },
];

export function AdminSidebarNav({ active }) {
  return (
    <div style={S.sidebar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' }}>
        <img
          src="/buc-logo.png"
          alt="BakeUrCurls"
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1.5px solid #D4AF37',
            boxShadow: '0 0 10px rgba(212,175,55,0.4)',
            display: 'block',
          }}
        />
        <div>
          <div style={S.sidebarLogo}>BakeUrCurls</div>
          <div style={S.sidebarSub}>Admin Panel</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {navItems.map((n) => (
          <Link key={n.to} to={n.to} style={S.navLink(active === n.to)}>
            {n.label}
          </Link>
        ))}
      </div>
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(251,246,238,0.06)',
          position: 'sticky',
          bottom: 0,
          background: '#231812',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(251,246,238,0.05)',
            border: '1px solid rgba(241,213,146,0.2)',
            color: '#F1D592',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(241,213,146,0.15)';
            e.currentTarget.style.borderColor = 'rgba(241,213,146,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(251,246,238,0.05)';
            e.currentTarget.style.borderColor = 'rgba(241,213,146,0.2)';
          }}
        >
          <span>←</span> Back to Main Site
        </Link>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ todayBookings: 0, pending: 0, confirmed: 0, newQueries: 0 });
  const [allBookings, setAllBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Password reset modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [resetMode, setResetMode] = useState('otp'); // 'otp' or 'current'
  
  // Current password mode form
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passLoading, setPassLoading] = useState(false);

  // OTP mode form
  const [otpStep, setOtpStep] = useState(1);
  const [adminEmail, setAdminEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpNewPass, setOtpNewPass] = useState('');
  const [otpConfirmPass, setOtpConfirmPass] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setAdminEmail(user.email);
    }
  }, [user]);

  // Handle password change with current password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passForm.currentPassword || !passForm.newPassword) return toast.error('Please fill in both fields');
    if (passForm.newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match');

    setPassLoading(true);
    try {
      await axiosInstance.put('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success('Password updated successfully!');
      setShowPasswordModal(false);
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password. Check current password.');
    } finally {
      setPassLoading(false);
    }
  };

  // Step 1: Send OTP to Admin Mail
  const handleSendAdminOtp = async (e) => {
    e.preventDefault();
    const emailToSend = (adminEmail || user?.email || 'admin@bakeurcurl.com').trim();
    setOtpLoading(true);
    try {
      const res = await axiosInstance.post('/auth/forgot-password-otp', { email: emailToSend });
      toast.success(res.data.message || `OTP sent to ${emailToSend}`);
      if (res.data.devOtp) {
        toast(`Dev OTP: ${res.data.devOtp}`, { icon: '🔑', duration: 8000 });
      }
      setOtpStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2: Verify OTP and update password
  const handleVerifyAdminOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) return toast.error('Enter 6-digit OTP code');
    if (!otpNewPass || otpNewPass.length < 8) return toast.error('Password must be at least 8 characters');
    if (otpNewPass !== otpConfirmPass) return toast.error('Passwords do not match');

    const emailToSend = (adminEmail || user?.email || 'admin@bakeurcurl.com').trim();
    setOtpLoading(true);
    try {
      const res = await axiosInstance.post('/auth/reset-password-otp', {
        email: emailToSend,
        otp: otpCode.trim(),
        newPassword: otpNewPass,
      });
      toast.success(res.data.message || 'Admin password updated successfully!');
      setShowPasswordModal(false);
      setOtpStep(1);
      setOtpCode('');
      setOtpNewPass('');
      setOtpConfirmPass('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. Check OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const [bRes, qRes] = await Promise.all([
          axiosInstance.get('/bookings'),
          axiosInstance.get('/queries'),
        ]);
        const all = Array.isArray(bRes.data?.data) ? bRes.data.data : [];
        const queries = Array.isArray(qRes.data?.data) ? qRes.data.data : [];
        const today = new Date().toDateString();
        setStats({
          todayBookings: all.filter((b) => new Date(b.date).toDateString() === today).length,
          pending: all.filter((b) => b.status === 'pending').length,
          confirmed: all.filter((b) => b.status === 'confirmed').length,
          newQueries: queries.filter((q) => q.status === 'new').length,
        });
        setAllBookings(all);
        setRecentBookings(all.slice(0, 8));
      } catch {
        toast.error('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleExportCSV = () => {
    const dataToExport = allBookings.length ? allBookings : recentBookings;
    if (!dataToExport.length) return toast.error('No bookings to export');
    const headers = ['Booking ID', 'Customer Name', 'Phone', 'Service', 'Date', 'Time Slot', 'Total Amount', 'Status', 'Payment Status'];
    const rows = dataToExport.map((b) => [
      b.bookingId || b._id,
      b.customer?.name || b.guestInfo?.name || 'Guest',
      b.customer?.phone || b.guestInfo?.phone || 'N/A',
      b.service?.name || 'Service',
      new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      b.timeSlot || '—',
      `₹${b.totalAmount || 0}`,
      (b.status || 'pending').toUpperCase(),
      (b.paymentStatus || 'unpaid').toUpperCase(),
    ]);
    exportToCSV('BakeUrCurls_Dashboard_Summary', headers, rows);
    toast.success('Dashboard data exported to Excel! 📊');
  };

  const handleExportPDF = () => {
    const dataToExport = allBookings.length ? allBookings : recentBookings;
    if (!dataToExport.length) return toast.error('No bookings to export');
    const columns = ['Booking ID', 'Customer', 'Service', 'Schedule', 'Amount', 'Status'];
    const data = dataToExport.map((b) => [
      b.bookingId || b._id?.slice(-8),
      b.customer?.name || b.guestInfo?.name || 'Guest',
      b.service?.name || 'Service',
      `${new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · ${b.timeSlot}`,
      `₹${b.totalAmount || 0}`,
      (b.status || 'pending').toUpperCase(),
    ]);
    const summaryStats = [
      { label: "Today's Bookings", value: stats.todayBookings },
      { label: 'Pending Confirmations', value: stats.pending },
      { label: 'Confirmed Appointments', value: stats.confirmed },
      { label: 'New Customer Queries', value: stats.newQueries },
    ];
    exportToPDF({
      title: 'Executive Salon Overview & Activity Report',
      subtitle: 'Key salon metrics and booking records',
      columns,
      data,
      summaryStats,
    });
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: "'Playfair Display', serif", color: '#F1D592' }}>
            Overview Dashboard
          </h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportCSV}
              style={{
                padding: '9px 15px',
                borderRadius: 8,
                background: 'rgba(251,246,238,0.06)',
                border: '1px solid rgba(241,213,146,0.3)',
                color: '#F1D592',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              📊 Export to Excel
            </button>
            <button
              onClick={handleExportPDF}
              style={{
                padding: '9px 15px',
                borderRadius: 8,
                background: 'rgba(251,246,238,0.06)',
                border: '1px solid rgba(241,213,146,0.3)',
                color: '#F1D592',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              📄 Export to PDF
            </button>
            <button
              onClick={() => {
                setAdminEmail(user?.email || 'admin@bakeurcurl.com');
                setShowPasswordModal(true);
              }}
              style={{
                padding: '9px 15px',
                borderRadius: 8,
                background: 'rgba(212,175,55,0.15)',
                border: '1px solid rgba(212,175,55,0.4)',
                color: '#F1D592',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              🔑 Change Password
            </button>
          </div>
        </div>

        <div style={S.statsRow}>
          {statCards.map((c) => (
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
                {['Booking ID', 'Customer', 'Service', 'Date & Time', 'Status'].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b._id}>
                  <td style={{ ...S.td, color: '#E8B4A0', fontWeight: '700' }}>{b.bookingId}</td>
                  <td style={S.td}>{b.customer?.name || b.guestInfo?.name || 'Guest'}</td>
                  <td style={S.td}>{b.service?.name || 'Service'}</td>
                  <td style={S.td}>
                    {new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {b.timeSlot}
                  </td>
                  <td style={S.td}><Badge s={b.status} /></td>
                </tr>
              ))}
              {!loading && recentBookings.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...S.td, textAlign: 'center', color: 'rgba(251,246,238,0.35)' }}>
                    No bookings yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Password Management Modal */}
      {showPasswordModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            style={{
              background: '#231812',
              border: '1px solid rgba(241,213,146,0.3)',
              borderRadius: 20,
              padding: '2.5rem',
              width: '100%',
              maxWidth: 460,
              boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#F1D592', margin: 0, fontFamily: "'Playfair Display', serif" }}>
                🔑 Admin Password Management
              </h2>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(251,246,238,0.5)', fontSize: 22, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Mode Tabs: Mail OTP vs Current Password */}
            <div style={{ display: 'flex', background: 'rgba(251,246,238,0.06)', borderRadius: 10, padding: 4, marginBottom: 20 }}>
              <button
                type="button"
                onClick={() => setResetMode('otp')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                  background: resetMode === 'otp' ? 'linear-gradient(135deg, #A87A51, #754B2E)' : 'transparent',
                  color: resetMode === 'otp' ? '#fff' : 'rgba(251,246,238,0.6)',
                }}
              >
                ✉️ Reset via Mail OTP
              </button>
              <button
                type="button"
                onClick={() => setResetMode('current')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                  background: resetMode === 'current' ? 'linear-gradient(135deg, #A87A51, #754B2E)' : 'transparent',
                  color: resetMode === 'current' ? '#fff' : 'rgba(251,246,238,0.6)',
                }}
              >
                🔒 Current Password
              </button>
            </div>

            {resetMode === 'otp' ? (
              <div>
                {otpStep === 1 ? (
                  <form onSubmit={handleSendAdminOtp}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: 13, marginBottom: 6 }}>
                        Admin Email
                      </label>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@bakeurcurl.com"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'rgba(251,246,238,0.07)', border: '1px solid rgba(251,246,238,0.15)', color: '#FBF6EE', outline: 'none', boxSizing: 'border-box' }}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={otpLoading}
                      style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #A87A51, #754B2E)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: otpLoading ? 0.7 : 1 }}
                    >
                      {otpLoading ? 'Sending OTP...' : 'Send OTP to Admin Mail'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyAdminOtp}>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: 13, marginBottom: 6 }}>
                        6-Digit OTP Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'rgba(251,246,238,0.07)', border: '1px solid rgba(251,246,238,0.15)', color: '#F1D592', outline: 'none', letterSpacing: '4px', textAlign: 'center', fontWeight: '700', fontSize: '1.2rem', boxSizing: 'border-box' }}
                        required
                      />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: 13, marginBottom: 6 }}>
                        New Password (Min 8 chars, mixed case & numbers)
                      </label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={otpNewPass}
                        onChange={(e) => setOtpNewPass(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'rgba(251,246,238,0.07)', border: '1px solid rgba(251,246,238,0.15)', color: '#FBF6EE', outline: 'none', boxSizing: 'border-box' }}
                        required
                      />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: 13, marginBottom: 6 }}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={otpConfirmPass}
                        onChange={(e) => setOtpConfirmPass(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'rgba(251,246,238,0.07)', border: '1px solid rgba(251,246,238,0.15)', color: '#FBF6EE', outline: 'none', boxSizing: 'border-box' }}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => setOtpStep(1)}
                        style={{ padding: '12px 16px', background: 'rgba(251,246,238,0.08)', border: '1px solid rgba(251,246,238,0.15)', borderRadius: 10, color: '#FBF6EE', cursor: 'pointer' }}
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={otpLoading}
                        style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #A87A51, #754B2E)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: otpLoading ? 0.7 : 1 }}
                      >
                        {otpLoading ? 'Verifying...' : 'Verify OTP & Reset'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <form onSubmit={handlePasswordChange}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: 13, marginBottom: 6 }}>Current Password *</label>
                  <input
                    type="password"
                    placeholder="Enter current password (e.g. Admin@123)"
                    value={passForm.currentPassword}
                    onChange={(e) => setPassForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'rgba(251,246,238,0.07)', border: '1px solid rgba(251,246,238,0.15)', color: '#FBF6EE', outline: 'none', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: 13, marginBottom: 6 }}>New Password *</label>
                  <input
                    type="password"
                    placeholder="Enter new password (min 8 characters)"
                    value={passForm.newPassword}
                    onChange={(e) => setPassForm((p) => ({ ...p, newPassword: e.target.value }))}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'rgba(251,246,238,0.07)', border: '1px solid rgba(251,246,238,0.15)', color: '#FBF6EE', outline: 'none', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: 13, marginBottom: 6 }}>Confirm New Password *</label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={passForm.confirmPassword}
                    onChange={(e) => setPassForm((p) => ({ ...p, confirmPassword: e.target.value }))}
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
