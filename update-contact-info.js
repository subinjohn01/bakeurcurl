const fs = require('fs');
const path = require('path');

// 1. Update Footer.js
const footerPath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/components/layout/Footer.js';
let footerCode = `import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: 'rgba(35, 24, 18, 0.98)',
        borderTop: '1px solid rgba(168, 122, 81, 0.25)',
        padding: '60px 24px 32px',
        marginTop: 'auto',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 48,
            marginBottom: 48,
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #A87A51, #754B2E)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                }}
              >
                ✨
              </div>
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 22,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #F1D592, #D4AF37)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                BakeUrCurls
              </span>
            </div>
            <p style={{ color: 'rgba(251,246,238,0.65)', fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>
              The premium destination for curly hair care in Trivandrum. Expert stylists dedicated to celebrating and nurturing your natural curl texture.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { name: 'Instagram', url: 'https://instagram.com/bakeurcurls', icon: '📸' },
                { name: 'Facebook', url: 'https://facebook.com/bakeurcurls', icon: '👥' },
                { name: 'WhatsApp', url: 'https://wa.me/917012001472', icon: '💬' },
              ].map(social => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(168, 122, 81, 0.2)',
                    border: '1px solid rgba(168, 122, 81, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    color: '#F1D592',
                    transition: 'all 0.2s',
                    textDecoration: 'none'
                  }}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#F1D592', fontWeight: 600, marginBottom: 20, fontSize: 16 }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Our Services', path: '/services' },
                { label: 'Shop Products', path: '/products' },
                { label: 'Book Appointment', path: '/book' },
                { label: 'Contact Us', path: '/contact' },
              ].map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    color: 'rgba(251,246,238,0.7)',
                    fontSize: 14,
                    transition: 'color 0.2s',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={e => e.target.style.color = '#F1D592'}
                  onMouseLeave={e => e.target.style.color = 'rgba(251,246,238,0.7)'}
                >
                  → {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ color: '#F1D592', fontWeight: 600, marginBottom: 20, fontSize: 16 }}>Services</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Curl Definition Cut', 'Deep Conditioning', 'Color & Highlights', 'Protective Styling', 'Scalp Treatment', 'Bridal Styling'].map(s => (
                <span key={s} style={{ color: 'rgba(251,246,238,0.7)', fontSize: 14 }}>
                  → {s}
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#F1D592', fontWeight: 600, marginBottom: 20, fontSize: 16 }}>Get In Touch</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 16 }}>📍</span>
                <span style={{ color: 'rgba(251,246,238,0.75)', fontSize: 13, lineHeight: 1.6 }}>
                  2nd Floor, F Square, Pattom-Kesawadasapuram Road, Oppst. Chalakuzhi Road, Trivandrum, Kerala - 695004
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 16 }}>📞</span>
                <a href="tel:+917012001472" style={{ color: 'rgba(251,246,238,0.85)', fontSize: 13, textDecoration: 'none' }}>
                  +91 70120 01472
                </a>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 16 }}>✉️</span>
                <a href="mailto:bakeurcurls@gmail.com" style={{ color: '#F1D592', fontSize: 13, textDecoration: 'none' }}>
                  bakeurcurls@gmail.com
                </a>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 16 }}>🕒</span>
                <span style={{ color: 'rgba(251,246,238,0.65)', fontSize: 13, lineHeight: 1.6 }}>
                  Mon - Sat: 9:00 AM - 7:00 PM<br/>Sun: 10:00 AM - 5:00 PM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(251,246,238,0.08)',
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <p style={{ color: 'rgba(251,246,238,0.5)', fontSize: 13 }}>
            © {year} BakeUrCurls. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy', 'Terms of Service'].map(p => (
              <span key={p} style={{ color: 'rgba(251,246,238,0.5)', fontSize: 13 }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
`;
fs.writeFileSync(footerPath, footerCode, 'utf8');
console.log('Updated Footer.js');

// 2. Update ContactPage.js
const contactPath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/pages/ContactPage.js';
let contactCode = `import React, { useState } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const S = {
  page: { minHeight: '100vh', background: '#231812', padding: '2rem', fontFamily: "'Inter', sans-serif", color: '#FBF6EE' },
  hero: {
    maxWidth: '700px', margin: '0 auto 4rem',
    background: 'linear-gradient(135deg, rgba(168,122,81,0.2), rgba(117,75,46,0.15))',
    border: '1px solid rgba(251,246,238,0.1)',
    borderRadius: '20px', padding: '3rem', textAlign: 'center',
  },
  h1: { fontSize: '2.4rem', fontWeight: '800', fontFamily: "'Playfair Display', serif", marginBottom: '0.75rem', color: '#F1D592' },
  sub: { color: 'rgba(251,246,238,0.7)', marginBottom: '1rem', fontSize: '1.05rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', maxWidth: '1000px', margin: '0 auto' },
  infoCard: {
    background: 'rgba(251,246,238,0.04)', border: '1px solid rgba(168,122,81,0.25)',
    borderRadius: '14px', padding: '1.75rem',
  },
  infoTitle: { color: '#F1D592', fontWeight: '700', marginBottom: '0.75rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' },
  infoItem: { color: 'rgba(251,246,238,0.75)', fontSize: '0.95rem', marginBottom: '0.5rem', lineHeight: '1.6' },
  formCard: {
    background: 'rgba(251,246,238,0.04)', border: '1px solid rgba(168,122,81,0.25)',
    borderRadius: '16px', padding: '2.5rem', maxWidth: '750px', margin: '3rem auto 0',
  },
  label: { display: 'block', color: 'rgba(251,246,238,0.8)', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: '500' },
  input: {
    width: '100%', padding: '0.8rem 1rem',
    background: 'rgba(251,246,238,0.06)', border: '1px solid rgba(251,246,238,0.15)',
    borderRadius: '8px', color: '#FBF6EE', fontSize: '0.95rem', boxSizing: 'border-box', marginBottom: '1.2rem', outline: 'none',
  },
  textarea: {
    width: '100%', padding: '0.8rem 1rem', minHeight: '120px', resize: 'vertical',
    background: 'rgba(251,246,238,0.06)', border: '1px solid rgba(251,246,238,0.15)',
    borderRadius: '8px', color: '#FBF6EE', fontSize: '0.95rem', boxSizing: 'border-box', marginBottom: '1.2rem', outline: 'none',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  btn: {
    padding: '0.85rem 2.2rem', background: 'linear-gradient(135deg, #A87A51, #754B2E)',
    border: 'none', borderRadius: '8px', color: '#FBF6EE', fontWeight: '600', cursor: 'pointer', fontSize: '1rem',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
  },
};

const hours = [
  { day: 'Monday - Saturday', time: '9:00 AM - 7:00 PM' },
  { day: 'Sunday', time: '10:00 AM - 5:00 PM' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error('Name, email & message are required');
    setLoading(true);
    try {
      await axios.post('/queries', form);
      toast.success("Message sent! We will get back to you shortly ✨");
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.hero}>
        <h1 style={S.h1}>Get In Touch ✨</h1>
        <p style={S.sub}>Have questions about your curls or our appointments? We would love to hear from you.</p>
      </div>

      <div style={S.grid}>
        <div style={S.infoCard}>
          <div style={S.infoTitle}><span>📍</span> Salon Location</div>
          <div style={S.infoItem}>2nd Floor, F Square, Pattom-Kesawadasapuram Road</div>
          <div style={S.infoItem}>Oppst. Chalakuzhi Road, Trivandrum, Kerala - 695004</div>
        </div>
        <div style={S.infoCard}>
          <div style={S.infoTitle}><span>📞</span> Direct Contact</div>
          <div style={S.infoItem}>Phone: <a href="tel:+917012001472" style={{ color: '#F1D592', textDecoration: 'none' }}>+91 70120 01472</a></div>
          <div style={S.infoItem}>Email: <a href="mailto:bakeurcurls@gmail.com" style={{ color: '#F1D592', textDecoration: 'none' }}>bakeurcurls@gmail.com</a></div>
        </div>
        <div style={S.infoCard}>
          <div style={S.infoTitle}><span>🕒</span> Salon Hours</div>
          {hours.map((h) => (
            <div key={h.day} style={S.infoItem}><strong style={{ color: '#F1D592' }}>{h.day}:</strong> {h.time}</div>
          ))}
        </div>
        <div style={S.infoCard}>
          <div style={S.infoTitle}><span>📸</span> Connect With Us</div>
          <div style={S.infoItem}>WhatsApp: +91 70120 01472</div>
          <div style={S.infoItem}>Email: bakeurcurls@gmail.com</div>
          <div style={S.infoItem}>Instagram: @bakeurcurls</div>
        </div>
      </div>

      <div style={S.formCard}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: '700', color: '#F1D592', fontFamily: "'Playfair Display', serif" }}>
          Send Us a Message
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={S.row}>
            <div>
              <label style={S.label}>Name *</label>
              <input style={S.input} name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label style={S.label}>Phone</label>
              <input style={S.input} name="phone" placeholder="+91 70120 01472" value={form.phone} onChange={handleChange} />
            </div>
          </div>
          <label style={S.label}>Email *</label>
          <input style={S.input} type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          <label style={S.label}>Subject</label>
          <input style={S.input} name="subject" placeholder="What is this about?" value={form.subject} onChange={handleChange} />
          <label style={S.label}>Message *</label>
          <textarea style={S.textarea} name="message" placeholder="Tell us how we can help your curls..." value={form.message} onChange={handleChange} required />
          <button type="submit" style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Sending...' : 'Send Message ✉️'}
          </button>
        </form>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(contactPath, contactCode, 'utf8');
console.log('Updated ContactPage.js');

// 3. Update brand name BakeUrCurl -> BakeUrCurls in Navbar.js, HomePage.js, LoginPage.js, RegisterPage.js, etc.
const frontendSrc = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src';
function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (f.endsWith('.js')) {
      let code = fs.readFileSync(full, 'utf8');
      if (code.includes('BakeUrCurl') && !code.includes('BakeUrCurls')) {
        // Replace user-facing name BakeUrCurl with BakeUrCurls
        // Keep tokens/storage consistent or rename cleanly
        code = code.replace(/BakeUrCurl(?![s_])/g, 'BakeUrCurls');
        fs.writeFileSync(full, code, 'utf8');
        console.log('Updated brand name in:', f);
      }
    }
  }
}
walk(frontendSrc);

// 4. Update backend email settings
const envPath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/backend/.env';
if (fs.existsSync(envPath)) {
  let env = fs.readFileSync(envPath, 'utf8');
  env = env.replace(/EMAIL_FROM=.*$/m, 'EMAIL_FROM=BakeUrCurls Salon <bakeurcurls@gmail.com>');
  fs.writeFileSync(envPath, env, 'utf8');
  console.log('Updated backend .env');
}

// 5. Update backend email service templates
const emailServicePath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/backend/utils/emailService.js';
if (fs.existsSync(emailServicePath)) {
  let emailCode = fs.readFileSync(emailServicePath, 'utf8');
  emailCode = emailCode.replace(/hello@BakeUrCurl\.com/g, 'bakeurcurls@gmail.com');
  emailCode = emailCode.replace(/BakeUrCurl(?![s_])/g, 'BakeUrCurls');
  fs.writeFileSync(emailServicePath, emailCode, 'utf8');
  console.log('Updated backend emailService.js');
}

