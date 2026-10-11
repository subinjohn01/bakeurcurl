import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #231812 0%, #2E1E14 50%, #231812 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    width: '100%',
    maxWidth: '420px',
  },
  logo: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logoText: {
    fontSize: '2rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #A87A51, #E8B4A0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontFamily: "'Playfair Display', serif",
  },
  logoSub: {
    color: 'rgba(251,246,238,0.5)',
    fontSize: '0.85rem',
    marginTop: '0.25rem',
  },
  card: {
    background: 'rgba(251,246,238,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(251,246,238,0.1)',
    borderRadius: '16px',
    padding: '2.5rem',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  },
  title: {
    color: '#fff',
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(251,246,238,0.5)',
    fontSize: '0.9rem',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  formGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    color: 'rgba(251,246,238,0.7)',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(251,246,238,0.07)',
    border: '1px solid rgba(251,246,238,0.15)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  btn: {
    width: '100%',
    padding: '0.875rem',
    background: 'linear-gradient(135deg, #A87A51, #754B2E)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'opacity 0.2s',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: 'rgba(251,246,238,0.5)',
    fontSize: '0.875rem',
  },
  link: {
    color: '#E8B4A0',
    textDecoration: 'none',
    fontWeight: '600',
  },
  staffNote: {
    background: 'rgba(168,122,81,0.1)',
    border: '1px solid rgba(168,122,81,0.3)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    marginBottom: '1.5rem',
    color: 'rgba(251,246,238,0.7)',
    fontSize: '0.8rem',
    textAlign: 'center',
  },
  forgotLink: {
    display: 'inline-block',
    color: '#F1D592',
    fontSize: '0.82rem',
    textDecoration: 'none',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    marginTop: '0.4rem',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalCard: {
    background: '#231812',
    border: '1px solid rgba(241,213,146,0.3)',
    borderRadius: '16px',
    padding: '2.5rem',
    maxWidth: '440px',
    width: '100%',
    boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
    position: 'relative',
  },
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  // Forgot Password / OTP State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [otpStep, setOtpStep] = useState(1); // 1 = enter email, 2 = enter otp + new pass
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (!user) throw new Error('Invalid email or password.');
      toast.success(`Welcome back, ${user.name || 'User'}!`);
      if (from) return navigate(from, { replace: true });
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'staff') navigate('/staff');
      else navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!resetEmail) return toast.error('Please enter your registered email address');
    setOtpLoading(true);
    try {
      const res = await (await import('../api/axios')).default.post('/auth/forgot-password-otp', {
        email: resetEmail.trim(),
      });
      toast.success(res.data?.message || 'OTP sent to your email!');
      if (res.data?.devOtp) {
        toast(`Dev OTP: ${res.data.devOtp}`, { icon: '🔑', duration: 8000 });
      }
      setOtpStep(2);
    } catch (err) {
      if (err.isStaticFallback) {
        const mockOtp = '123456';
        toast.success(`OTP generated: ${mockOtp} (Demo Mode)`);
        toast(`Verification Code: ${mockOtp}`, { icon: '🔑', duration: 8000 });
        setOtpStep(2);
      } else {
        toast.error(err.response?.data?.message || err.message || 'Failed to send OTP. Please check the email.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleVerifyOtpAndReset = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      return toast.error('Please enter the 6-digit OTP code');
    }
    if (!newPassword || newPassword.length < 8) {
      return toast.error('New password must be at least 8 characters');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setOtpLoading(true);
    try {
      const res = await (await import('../api/axios')).default.post('/auth/reset-password-otp', {
        email: resetEmail.trim(),
        otp: otpCode.trim(),
        newPassword,
      });
      toast.success(res.data?.message || 'Password reset successful!');
      setShowForgotModal(false);
      setOtpStep(1);
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setForm(prev => ({ ...prev, email: resetEmail, password: '' }));
    } catch (err) {
      if (err.isStaticFallback) {
        toast.success('Password updated successfully! You can now log in.');
        setShowForgotModal(false);
        setOtpStep(1);
        setOtpCode('');
        setNewPassword('');
        setConfirmPassword('');
        setForm(prev => ({ ...prev, email: resetEmail, password: newPassword }));
      } else {
        toast.error(err.response?.data?.message || err.message || 'Failed to reset password. Check OTP.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.logo}>
          <div style={styles.logoText}>🌀 BakeUrCurls</div>
          <div style={styles.logoSub}>Premium Curly Hair Salon</div>
        </div>
        <div style={styles.card}>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
          <div style={styles.staffNote}>
            🔐 Staff & Admin: use your work credentials to access the management portal.
          </div>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            <div style={styles.formGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={styles.label}>Password</label>
                <button
                  type="button"
                  style={styles.forgotLink}
                  onClick={() => {
                    setResetEmail(form.email || '');
                    setOtpStep(1);
                    setShowForgotModal(true);
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <input
                style={styles.input}
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div style={styles.footer}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>Create one</Link>
            <br /><br />
            <Link to="/" style={{ ...styles.link, color: 'rgba(251,246,238,0.4)' }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password OTP Modal */}
      {showForgotModal && (
        <div style={styles.modalOverlay} onClick={() => setShowForgotModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#F1D592', margin: 0 }}>
                🔑 Reset Password via Mail OTP
              </h2>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(251,246,238,0.5)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: 'rgba(251,246,238,0.7)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              {otpStep === 1
                ? 'Enter your registered user or admin email address to receive a 6-digit one-time verification code.'
                : `Enter the 6-digit verification code sent to ${resetEmail} and choose a new password.`}
            </p>

            {otpStep === 1 ? (
              <form onSubmit={handleRequestOtp}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Registered Email Address</label>
                  <input
                    style={styles.input}
                    type="email"
                    placeholder="user@example.com or admin@bakeurcurl.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  style={{ ...styles.btn, opacity: otpLoading ? 0.7 : 1 }}
                  disabled={otpLoading}
                >
                  {otpLoading ? 'Sending OTP...' : 'Send OTP to Email'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpAndReset}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>6-Digit OTP Code</label>
                  <input
                    style={{ ...styles.input, letterSpacing: '4px', fontSize: '1.2rem', textAlign: 'center', fontWeight: '700', color: '#F1D592' }}
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>New Password</label>
                  <input
                    style={styles.input}
                    type="password"
                    placeholder="Min 8 chars (Uppercase, lowercase, number)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirm New Password</label>
                  <input
                    style={styles.input}
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setOtpStep(1)}
                    style={{
                      flex: 1,
                      padding: '0.875rem',
                      background: 'rgba(251,246,238,0.08)',
                      border: '1px solid rgba(251,246,238,0.15)',
                      borderRadius: '8px',
                      color: '#FBF6EE',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    style={{ ...styles.btn, flex: 2, marginTop: 0, opacity: otpLoading ? 0.7 : 1 }}
                    disabled={otpLoading}
                  >
                    {otpLoading ? 'Resetting...' : 'Reset Password'}
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
