import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminLinks = [
  { icon: '📊', label: 'Overview', path: '/admin' },
  { icon: '📅', label: 'Bookings', path: '/admin/bookings' },
  { icon: '✂️', label: 'Services', path: '/admin/services' },
  { icon: '🛍️', label: 'Products', path: '/admin/products' },
  { icon: '👥', label: 'Staff', path: '/admin/staff' },
  { icon: '💬', label: 'Queries', path: '/admin/queries' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside
      style={{
        width: 240,
        minHeight: '100vh',
        background: 'rgba(35,24₹8,0.98)',
        borderRight: '1px solid rgba(168₹22,81,0.2)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Link
        to="/admin"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 36,
          padding: '8px 12px',
          textDecoration: 'none',
        }}
      >
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
          🌀
        </div>
        <div>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #fff, #E8B4A0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'block',
            }}
          >
            BakeUrCurls
          </span>
          <span style={{ fontSize: 10, color: 'rgba(251,246,238,0.4)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Admin Panel
          </span>
        </div>
      </Link>

      {/* Nav Links */}
      <nav style={{ flex: 1 }}>
        <p style={{ color: 'rgba(251,246,238,0.3)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 12px', marginBottom: 8 }}>
          Management
        </p>
        {adminLinks.map(link => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 10,
                color: isActive ? '#fff' : 'rgba(251,246,238,0.6)',
                background: isActive ? 'linear-gradient(135deg, rgba(168₹22,81,0.4), rgba(74,47,30,0.3))' : 'transparent',
                border: isActive ? '1px solid rgba(168₹22,81,0.4)' : '1px solid transparent',
                marginBottom: 4,
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(168₹22,81,0.15)'; e.currentTarget.style.color = '#fff'; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(251,246,238,0.6)'; }}}
            >
              <span style={{ fontSize: 16 }}>{link.icon}</span>
              {link.label}
              {isActive && (
                <span
                  style={{
                    marginLeft: 'auto',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#A87A51',
                    boxShadow: '0 0 8px #A87A51',
                  }}
                />
              )}
            </Link>
          );
        })}

        <hr style={{ border: 'none', borderTop: '1px solid rgba(251,246,238,0.08)', margin: '16px 0' }} />
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '11px 14px',
            borderRadius: 10,
            color: 'rgba(251,246,238,0.5)',
            fontSize: 14,
            transition: 'all 0.2s',
            textDecoration: 'none',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,246,238,0.07)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(251,246,238,0.5)'; }}
        >
          <span>🌐</span> Visit Site
        </Link>
      </nav>

      {/* User info at bottom */}
      <div
        style={{
          borderTop: '1px solid rgba(251,246,238,0.08)',
          paddingTop: 16,
          marginTop: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #A87A51, #E8B4A0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Admin'}
            </p>
            <p style={{ color: 'rgba(251,246,238,0.4)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email || ''}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '9px 14px',
            borderRadius: 10,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#F87171',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
