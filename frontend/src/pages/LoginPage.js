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
    background: 'rgba(168₹22,81,0.1)',
    border: '1px solid rgba(168₹22,81,0.3)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    marginBottom: '1.5rem',
    color: 'rgba(251,246,238,0.7)',
    fontSize: '0.8rem',
    textAlign: 'center',
  },
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ₹{user.name}!`);
      if (from) return navigate(from, { replace: true });
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'staff') navigate('/staff');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
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
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                name="password"
                placeholder="AAAAAAAA"
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
            Don't have an account₹{' '}
            <Link to="/register" style={styles.link}>Create one</Link>
            <br /><br />
            <Link to="/" style={{ ...styles.link, color: 'rgba(251,246,238,0.4)' }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
