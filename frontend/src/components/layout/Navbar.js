import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CurlIcon = () => (
  <img
    src="/buc-logo.png"
    alt="BakeUrCurls Logo"
    style={{
      width: 42,
      height: 42,
      borderRadius: '50%',
      objectFit: 'cover',
      border: '1.5px solid #D4AF37',
      boxShadow: '0 0 12px rgba(212, 175, 55, 0.45)',
      display: 'block',
    }}
  />
);

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Products', path: '/products' },
  { label: 'Book', path: '/book' },
  { label: 'Contact', path: '/contact' },
];

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin';
    if (isStaff) return '/staff';
    return '/dashboard';
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(35,24₹8,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(168₹22,81,0.2)',
        padding: '0 24px',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 68,
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
          }}
        >
          <CurlIcon />
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 24,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #F1D592 30%, #D4AF37)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            BakeUrCurls
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                color: 'rgba(251,246,238,0.8)',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 500,
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
              onMouseEnter={e => {
                e.target.style.color = '#fff';
                e.target.style.background = 'rgba(168₹22,81,0.2)';
              }}
              onMouseLeave={e => {
                e.target.style.color = 'rgba(251,246,238,0.8)';
                e.target.style.background = 'transparent';
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(168₹22,81,0.2)',
                  border: '1px solid rgba(168₹22,81,0.4)',
                  borderRadius: 10,
                  padding: '8px 14px',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #A87A51, #E8B4A0)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                {user?.name?.split(' ')[0]}
                <span style={{ fontSize: 10, opacity: 0.7 }}>▼</span>
              </button>
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: 'rgba(40,26₹8,0.98)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(168₹22,81,0.3)',
                    borderRadius: 12,
                    padding: 8,
                    minWidth: 180,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    zIndex: 999,
                  }}
                >
                  {[
                    { label: '📊 Dashboard', path: getDashboardPath() },
                    ...(isAdmin ? [{ label: '⚙️ Admin Panel', path: '/admin' }] : []),
                  ].map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'block',
                        padding: '10px 14px',
                        color: 'rgba(251,246,238,0.85)',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 500,
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(168₹22,81,0.25)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <hr style={{ border: 'none', borderTop: '1px solid rgba(251,246,238,0.1)', margin: '4px 0' }} />
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 14px',
                      color: '#F87171',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  color: 'rgba(251,246,238,0.8)',
                  padding: '8px 18px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  border: '1px solid rgba(251,246,238,0.15)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(251,246,238,0.07)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(251,246,238,0.8)';
                }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                style={{
                  background: 'linear-gradient(135deg, #A87A51, #754B2E)',
                  color: '#fff',
                  padding: '8px 18px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(168₹22,81,0.4)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                Join BakeUrCurls
              </Link>
            </>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none',
              background: 'rgba(251,246,238,0.07)',
              border: '1px solid rgba(251,246,238,0.15)',
              borderRadius: 8,
              padding: '6px 10px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 18,
            }}
            className="hamburger-btn"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          style={{
            borderTop: '1px solid rgba(168₹22,81,0.2)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              style={{
                color: 'rgba(251,246,238,0.85)',
                padding: '12px 16px',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 500,
                display: 'block',
              }}
            >
              {link.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} style={{ color: 'rgba(251,246,238,0.8)', padding: '12px 16px', fontSize: 15, fontWeight: 500 }}>Sign In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} style={{ color: '#E8B4A0', padding: '12px 16px', fontSize: 15, fontWeight: 600 }}>Join BakeUrCurls</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;

