import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

// ── Inline style helpers ─────────────────────────────────────────────────────
const S = {
  section: (extra = {}) => ({
    padding: '100px 24px',
    maxWidth: 1200,
    margin: '0 auto',
    ...extra,
  }),
  glass: (extra = {}) => ({
    background: 'rgba(251,246,238,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(251,246,238,0.1)',
    borderRadius: 16,
    ...extra,
  }),
};

// ── Floating curly hair CSS art ──────────────────────────────────────────────
const CurlArt = () => (
  <div style={{ position: 'relative', width: 340, height: 340, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div
      style={{
        position: 'absolute',
        inset: -15,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.25) 0%, transparent 70%)',
        animation: 'pulse 4s ease-in-out infinite',
      }}
    />
    <div
      style={{
        width: 310,
        height: 310,
        borderRadius: '50%',
        overflow: 'hidden',
        boxShadow: '0 0 50px rgba(212, 175, 55, 0.35), 0 0 100px rgba(168, 122, 81, 0.25)',
        border: '3px solid #D4AF37',
        background: '#0F0A06',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'float 4s ease-in-out infinite',
      }}
    >
      <img
        src="/buc-services.png"
        alt="BakeUrCurls Emblem"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'top center',
        }}
      />
    </div>
  </div>
);

// ── Testimonials data ────────────────────────────────────────────────────────
const testimonials = [
  {
    quote: "BakeUrCurls completely transformed my relationship with my curls. My stylist understood exactly what I needed — the best salon experience I've ever had!",
    name: 'Amara Johnson',
    type: '3C Curls',
    avatar: '👩🏾',
  },
  {
    quote: "I've been to many curly hair salons but none compare to BakeUrCurls. The attention to detail, the premium products, and the genuine expertise are unmatched.",
    name: 'Sofia Reyes',
    type: '2B Waves',
    avatar: '👩🏽',
  },
  {
    quote: "Booking was so easy online and my stylist had notes from my last visit ready. It felt like they truly know and care about my hair journey.",
    name: 'Priya Sharma',
    type: '4A Coils',
    avatar: '👩🏽‍🦱',
  },
];

// ── Feature cards ────────────────────────────────────────────────────────────
const features = [
  {
    icon: '🏆',
    title: 'Certified Stylists',
    desc: 'Every stylist is DevaCurl & KKCO certified with 5+ years of curl-specific experience.',
    color: '#A87A51',
  },
  {
    icon: '✨',
    title: 'Premium Products',
    desc: 'We use and stock only the finest curl-loving products: SheaMoisture, OUAI, Bumble & Bumble.',
    color: '#E8B4A0',
  },
  {
    icon: '📱',
    title: 'Easy Booking',
    desc: 'Book online in minutes, choose your stylist & time slot, pay a small advance to secure your spot.',
    color: '#34D399',
  },
];

// ── Services sample ──────────────────────────────────────────────────────────
const featuredServices = [
  { name: 'Curl Definition Cut', price: 85, duration: 75, emoji: '✂️', category: 'Haircut' },
  { name: 'Deep Conditioning', price: 65, duration: 60, emoji: '💧', category: 'Treatment' },
  { name: 'Color & Highlights', price: 150, duration: 120, emoji: '🎨', category: 'Coloring' },
  { name: 'Protective Styling', price: 120, duration: 90, emoji: '🌿', category: 'Styling' },
];

// ── HomePage ─────────────────────────────────────────────────────────────────
const HomePage = () => {
  const navigate = useNavigate();
  const heroRef = useRef();

  const [stats, setStats] = useState({
    bookingsCount: 3,
    stylistsCount: 2,
  });

  useEffect(() => {
    // Fetch public stats for real-time dynamic counter
    axiosInstance.get('/bookings/public-stats').then(res => {
      if (res.data) {
        setStats({
          bookingsCount: res.data.totalBookings || 0,
          stylistsCount: res.data.totalStaff || 0,
        });
      }
    }).catch(() => {
      // Fallback: try fetching staff list count
      axiosInstance.get('/staff').then(r => {
        const list = Array.isArray(r.data?.staff) ? r.data.staff : (Array.isArray(r.data?.data) ? r.data.data : []);
        if (list.length) {
          setStats(p => ({ ...p, stylistsCount: list.length }));
        }
      }).catch(() => {});
    });
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (el) {
      el.style.opacity = 0;
      el.style.transform = 'translateY(30px)';
      requestAnimationFrame(() => {
        el.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
        el.style.opacity = 1;
        el.style.transform = 'none';
      });
    }
  }, []);

  return (
    <div style={{ background: '#231812', overflowX: 'hidden' }}>
      {/* ── HERO ── */}
      <section
        style={{
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '0 24px',
        }}
      >
        {/* Background blobs */}
        <div style={{ position: 'absolute', top:-100, left:-100, width: 500, height: 500, background: 'radial-gradient(circle, rgba(168,122,81,0.25) 0%, transparent 65%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom:-100, right:-50, width: 400, height: 400, background: 'radial-gradient(circle, rgba(232,180,160,0.15) 0%, transparent 65%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

        <div
          ref={heroRef}
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 48,
            flexWrap: 'wrap',
          }}
        >
          {/* Text */}
          <div style={{ flex: '1 1 440px', maxWidth: 580 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(168,122,81,0.15)',
                border: '1px solid rgba(168,122,81,0.3)',
                borderRadius: 24,
                padding: '6px 16px',
                marginBottom: 28,
                fontSize: 13,
                color: '#E5C07B',
                fontWeight: 500,
              }}
            >
              ✨ Premium Curly Hair Salon
            </div>

            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(40px, 6vw, 72px)',
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: 24,
                color: '#F1D592',
              }}
            >
              Your Curls,{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #A87A51 30%, #E8B4A0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Perfected
              </span>
            </h1>

            <p
              style={{
                color: 'rgba(251,246,238,0.65)',
                fontSize: 18,
                lineHeight: 1.75,
                marginBottom: 36,
                maxWidth: 480,
              }}
            >
              Expert stylists specializing in all curl types — from loose waves to tight coils. Experience the ultimate curl care with premium products and personalized techniques.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/book')}
                style={{
                  background: 'linear-gradient(135deg, #A87A51, #754B2E)',
                  color: '#fff',
                  padding: '14px 32px',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(168,122,81,0.45)',
                  transition: 'all 0.3s',
                  letterSpacing: '0.3px',
                }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 40px rgba(168,122,81,0.6)'; }}
                onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 8px 30px rgba(168,122,81,0.45)'; }}
              >
                Book Appointment →
              </button>
              <button
                onClick={() => navigate('/services')}
                style={{
                  background: 'transparent',
                  color: '#E8B4A0',
                  padding: '14px 32px',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  border: '1.5px solid #E8B4A0',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { e.target.style.background = 'rgba(232,180,160,0.1)'; e.target.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.transform = 'none'; }}
              >
                Explore Services
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 32, marginTop: 44, flexWrap: 'wrap' }}>
              {[
                [`${stats.bookingsCount || 3}+`, 'Happy Clients'],
                [`${stats.stylistsCount || 2}`, 'Expert Stylists'],
                ['100%', 'CG Friendly'],
              ].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 13, color: 'rgba(251,246,238,0.45)', marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Art */}
          <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center' }}>
            <CurlArt />
          </div>
        </div>
      </section>

      {/* ── WHY BakeUrCurls ── */}
      <section style={{ padding: '100px 24px', background: 'rgba(168,122,81,0.04)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: '#F1D592', marginBottom: 16 }}>
              Why Choose <span style={{ background: 'linear-gradient(135deg, #A87A51, #E8B4A0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BakeUrCurls</span>A
            </h2>
            <p style={{ color: 'rgba(251,246,238,0.55)', fontSize: 17, maxWidth: 500, margin: '0 auto' }}>
              We're not just a salon — we're a curl sanctuary built by curl lovers, for curl lovers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  ...S.glass(),
                  padding: 32,
                  transition: 'all 0.3s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(251,246,238,0.09)';
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.borderColor = `${f.color}50`;
                  e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.3)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(251,246,238,0.05)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'rgba(251,246,238,0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: `${f.color}20`,
                    border: `1px solid ${f.color}35`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                    marginBottom: 20,
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
                <p style={{ color: 'rgba(251,246,238,0.55)', fontSize: 15, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED SERVICES ── */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 52, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#F1D592', marginBottom: 12 }}>
                Our Signature Services
              </h2>
              <p style={{ color: 'rgba(251,246,238,0.5)', fontSize: 16 }}>Tailored treatments for every curl type</p>
            </div>
            <Link
              to="/services"
              style={{
                color: '#E8B4A0',
                fontSize: 15,
                fontWeight: 600,
                border: '1px solid rgba(232,180,160,0.4)',
                padding: '10px 20px',
                borderRadius: 10,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,180,160,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              View All →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {featuredServices.map((s, i) => (
              <div
                key={i}
                style={{
                  ...S.glass(),
                  padding: 0,
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/book')}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 24px 60px rgba(168,122,81,0.25)';
                  e.currentTarget.style.borderColor = 'rgba(168,122,81,0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(251,246,238,0.1)';
                }}
              >
                {/* Service image placeholder */}
                <div
                  style={{
                    height: 160,
                    background: `linear-gradient(135deg, rgba(168,122,81,0.3), rgba(74,47,30,0.2))`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 56,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(168,122,81,0.2), transparent 70%)' }} />
                  {s.emoji}
                </div>
                <div style={{ padding: '20px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>{s.name}</h3>
                    <span style={{ color: '#E8B4A0', fontSize: 18, fontWeight: 800, flexShrink: 0, marginLeft: 8 }}>${s.price}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(251,246,238,0.4)', fontSize: 13 }}>⏱ {s.duration} min · {s.category}</span>
                  </div>
                  <button
                    style={{
                      marginTop: 16,
                      width: '100%',
                      padding: '10px',
                      background: 'linear-gradient(135deg, #A87A51, #754B2E)',
                      border: 'none',
                      borderRadius: 10,
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '100px 24px', background: 'rgba(168,122,81,0.04)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
              What Our Clients Say
            </h2>
            <p style={{ color: 'rgba(251,246,238,0.5)', fontSize: 16 }}>Real stories from our curl community</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {testimonials.map((t, i) => (
              <div
                key={i}
                style={{
                  ...S.glass(),
                  padding: 32,
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: 40, color: 'rgba(168,122,81,0.5)', fontFamily: 'serif', lineHeight: 1, marginBottom: 16 }}>"</div>
                <p style={{ color: 'rgba(251,246,238,0.75)', fontSize: 15, lineHeight: 1.75, marginBottom: 24, fontStyle: 'italic' }}>
                  {t.quote}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 36 }}>{t.avatar}</div>
                  <div>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{t.name}</p>
                    <p style={{ color: '#E8B4A0', fontSize: 13 }}>{t.type}</p>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: 14 }}>⭐⭐⭐⭐⭐</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '80px 24px' }}>
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(168,122,81,0.35), rgba(74,47,30,0.25))',
            border: '1px solid rgba(168,122,81,0.4)',
            borderRadius: 24,
            padding: '60px 48px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top:-60, right:-60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(232,180,160,0.2), transparent 70%)', borderRadius: '50%' }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
            Ready to Love Your Curls?
          </h2>
          <p style={{ color: 'rgba(251,246,238,0.6)', fontSize: 17, marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
            Book your appointment today and let our certified curl specialists transform your hair.
          </p>
          <button
            onClick={() => navigate('/book')}
            style={{
              background: 'linear-gradient(135deg, #A87A51, #754B2E)',
              color: '#fff',
              padding: '16px 40px',
              borderRadius: 12,
              fontSize: 17,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(168,122,81,0.5)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 14px 40px rgba(168,122,81,0.7)'; }}
            onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 8px 30px rgba(168,122,81,0.5)'; }}
          >
            Book Your Appointment →
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
