import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  container: { width: '100%', maxWidth: '440px' },
  logo: { textAlign: 'center', marginBottom: '2rem' },
  logoText: {
    fontSize: '2rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #A87A51, #E8B4A0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontFamily: "'Playfair Display', serif",
  },
  logoSub: { color: 'rgba(251,246,238,0.5)', fontSize: '0.85rem', marginTop: '0.25rem' },
  card: {
    background: 'rgba(251,246,238,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(251,246,238,0.1)',
    borderRadius: '16px',
    padding: '2.5rem',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  },
  title: { color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', textAlign: 'center' },
  subtitle: { color: 'rgba(251,246,238,0.5)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '2rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  formGroup: { marginBottom: '1.25rem' },
  label: { display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' },
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
  },
  footer: { textAlign: 'center', marginTop: '1.5rem', color: 'rgba(251,246,238,0.5)', fontSize: '0.875rem' },
  link: { color: '#E8B4A0', textDecoration: 'none', fontWeight: '600' },
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all required fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      toast.success('Account created! Welcome to BakeUrCurls 🌀');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join BakeUrCurls for easy booking & exclusive offers</p>
          <form onSubmit={handleSubmit}>
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name *</label>
                <input style={styles.input} name="name" placeholder="Jane Doe" value={form.name} onChange={handleChange} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
                <input style={styles.input} name="phone" placeholder="+91 99999 00000" value={form.phone} onChange={handleChange} />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address *</label>
              <input style={styles.input} type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
            </div>
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password *</label>
                <input style={styles.input} type="password" name="password" placeholder="Min 6 chars" value={form.password} onChange={handleChange} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Confirm Password *</label>
                <input style={styles.input} type="password" name="confirmPassword" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} />
              </div>
            </div>
            <button type="submit" style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <div style={styles.footer}>
            Already have an accountA <Link to="/login" style={styles.link}>Sign In</Link>
            <br /><br />
            <Link to="/" style={{ ...styles.link, color: 'rgba(251,246,238,0.4)' }}>← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
