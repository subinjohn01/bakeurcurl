import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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

  const { user } = useAuth();
  const [stats, setStats] = useState({
    bookingsCount: 3,
    stylistsCount: 2,
  });

  const [reviewsList, setReviewsList] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [newReview, setNewReview] = useState({
    name: user?.name || '',
    curlType: '3B Curls',
    rating: 5,
    comment: '',
    serviceName: '',
  });

  useEffect(() => {
    if (user?.name && !newReview.name) {
      setNewReview(prev => ({ ...prev, name: user.name }));
    }
  }, [user]);

  // Fetch reviews from server
  const fetchReviews = async () => {
    try {
      const res = await axiosInstance.get('/reviews');
      if (res.data?.reviews) {
        setReviewsList(res.data.reviews);
      }
    } catch (e) {
      // Keep static testimonials if server review list empty
    }
  };

  useEffect(() => {
    fetchReviews();
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) {
      toast.error('Please enter your name and a brief review.');
      return;
    }
    setSubmittingReview(true);
    try {
      await axiosInstance.post('/reviews', newReview);
      toast.success('Thank you! Your rating and review have been submitted! ⭐');
      setShowReviewModal(false);
      setNewReview({
        name: user?.name || '',
        curlType: '3B Curls',
        rating: 5,
        comment: '',
        serviceName: '',
      });
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

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
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
              What Our Clients Say
            </h2>
            <p style={{ color: 'rgba(251,246,238,0.5)', fontSize: 16, marginBottom: 24 }}>Real stories & reviews from our curl community</p>
            <button
              onClick={() => setShowReviewModal(true)}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #A87A51, #754B2E)',
                border: '1px solid rgba(232,180,160,0.4)',
                borderRadius: 30,
                color: '#fff',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(168,122,81,0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(168,122,81,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(168,122,81,0.3)'; }}
            >
              <span>⭐</span> Write a Review & Rate Us
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {[
              ...reviewsList.map(r => ({
                id: r._id,
                name: r.name,
                type: r.curlType || 'Curly Hair',
                quote: r.comment,
                rating: r.rating || 5,
                avatar: '✨',
                service: r.serviceName,
              })),
              ...testimonials.map((t, idx) => ({
                id: `static-${idx}`,
                name: t.name,
                type: t.type,
                quote: t.quote,
                rating: 5,
                avatar: t.avatar,
                service: '',
              }))
            ].slice(0, 6).map((t) => (
              <div
                key={t.id}
                style={{
                  ...S.glass(),
                  padding: 32,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 40, color: 'rgba(168,122,81,0.5)', fontFamily: 'serif', lineHeight: 1, marginBottom: 12 }}>"</div>
                  <p style={{ color: 'rgba(251,246,238,0.75)', fontSize: 15, lineHeight: 1.75, marginBottom: 24, fontStyle: 'italic' }}>
                    {t.quote}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(168,122,81,0.35), rgba(117,75,46,0.25))',
                    border: '1px solid rgba(232,180,160,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                  }}>
                    {t.avatar || '✨'}
                  </div>
                  <div>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>{t.name}</p>
                    <p style={{ color: '#E8B4A0', fontSize: 13, margin: 0 }}>
                      {t.type} {t.service ? `· ${t.service}` : ''}
                    </p>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: 15, letterSpacing: 1 }}>
                    {'⭐'.repeat(t.rating || 5)}
                  </div>
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

      {/* ── WRITE A REVIEW MODAL ── */}
      {showReviewModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReviewModal(false);
          }}
        >
          <div
            style={{
              background: '#1A120D',
              border: '1px solid rgba(168,122,81,0.4)',
              borderRadius: 20,
              padding: '32px 28px',
              maxWidth: 520,
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(168,122,81,0.2)',
              position: 'relative',
              animation: 'fadeIn 0.25s ease-out',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowReviewModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                color: '#fff',
                width: 32,
                height: 32,
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>

            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
              Rate Your Experience ⭐
            </h3>
            <p style={{ color: 'rgba(251,246,238,0.6)', fontSize: 14, marginBottom: 20 }}>
              Share your thoughts with the BakeUrCurls community!
            </p>

            <form onSubmit={handleReviewSubmit}>
              {/* Star Rating Select */}
              <div style={{ marginBottom: 20, textAlign: 'center', background: 'rgba(251,246,238,0.03)', padding: '16px', borderRadius: 12, border: '1px solid rgba(251,246,238,0.08)' }}>
                <label style={{ display: 'block', color: '#E8B4A0', fontSize: 13, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Tap to Choose Star Rating
                </label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isLit = (hoverRating || newReview.rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 32,
                          color: isLit ? '#F59E0B' : 'rgba(251,246,238,0.2)',
                          transition: 'transform 0.15s, color 0.15s',
                          transform: isLit ? 'scale(1.15)' : 'scale(1)',
                          padding: 2,
                        }}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
                <div style={{ color: '#F59E0B', fontSize: 13, fontWeight: 600, marginTop: 6 }}>
                  {newReview.rating === 5 && '5 Stars — Exceptional! Loved it ❤️'}
                  {newReview.rating === 4 && '4 Stars — Very Good Experience! 👍'}
                  {newReview.rating === 3 && '3 Stars — Average / Satisfactory 🙂'}
                  {newReview.rating === 2 && '2 Stars — Needs Improvement 😐'}
                  {newReview.rating === 1 && '1 Star — Disappointed 🙁'}
                </div>
              </div>

              {/* Name */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jessica Davis"
                  value={newReview.name}
                  onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'rgba(251,246,238,0.06)',
                    border: '1px solid rgba(251,246,238,0.15)',
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Curl Type & Service */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Curl Pattern / Type
                  </label>
                  <select
                    value={newReview.curlType}
                    onChange={e => setNewReview({ ...newReview, curlType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: '#231812',
                      border: '1px solid rgba(251,246,238,0.15)',
                      color: '#fff',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="2A-2C Waves">2A–2C Waves</option>
                    <option value="3A-3B Curls">3A–3B Curls</option>
                    <option value="3C Curls">3C Curls</option>
                    <option value="4A-4B Coils">4A–4B Coils</option>
                    <option value="4C Coils">4C Coils</option>
                    <option value="Wavy Hair">Wavy Hair</option>
                    <option value="Curly Hair">Curly Hair</option>
                    <option value="Coily Hair">Coily Hair</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Service (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Curl Definition Cut"
                    value={newReview.serviceName}
                    onChange={e => setNewReview({ ...newReview, serviceName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: 'rgba(251,246,238,0.06)',
                      border: '1px solid rgba(251,246,238,0.15)',
                      color: '#fff',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Review Comment */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Your Review / Experience *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us how your stylist treated your curls and how the results looked..."
                  value={newReview.comment}
                  onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 8,
                    background: 'rgba(251,246,238,0.06)',
                    border: '1px solid rgba(251,246,238,0.15)',
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    border: '1px solid rgba(251,246,238,0.2)',
                    background: 'transparent',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #A87A51, #754B2E)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: submittingReview ? 'not-allowed' : 'pointer',
                    opacity: submittingReview ? 0.7 : 1,
                  }}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Rating & Review ⭐'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
