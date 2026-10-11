import React from 'react';
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
              <img
                src="/buc-logo.png"
                alt="BakeUrCurls Logo"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid #D4AF37',
                  boxShadow: '0 0 12px rgba(212, 175, 55, 0.4)',
                }}
              />
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
              {['Curly Hair Dry Cut & Styling', 'Haircutting & Setting', 'Hair Coloring & Grey Coverage', 'Hair & Scalp Treatments', 'Skincare Facials & Cleanups', 'Wax Hair Removal', 'Brow Threading', 'Makeup & Bridal Artistry'].map(s => (
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
