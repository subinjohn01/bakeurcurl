const fs = require('fs');

// 1. Update ServicesPage.js
const servicesPagePath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/pages/ServicesPage.js';
const newServicesPage = `import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServices } from '../api/services';
import { FullPageSpinner } from '../components/ui/LoadingSpinner';

const categories = ['All', 'Hair', 'Coloring', 'Treatments', 'Skincare', 'Waxing', 'Threading', 'Bridal & Makeup'];

const mockServices = [
  { _id: '1', name: 'Curly Hair Dry Cut & Styling', category: 'Hair', price: 1499, duration: 75, description: 'Signature bespoke dry haircut tailored curl-by-curl to your unique curl pattern and volume. Includes botanical curl wash, deep hydration, and diffuse styling.', emoji: '✂️' },
  { _id: '2', name: 'Haircutting & Setting', category: 'Hair', price: 899, duration: 45, description: 'Precision haircut, clarifying wash, texture balancing, and professional styling/setting for all hair types and wave lengths.', emoji: '💇‍♀️' },
  { _id: '3', name: 'Hair Coloring & Grey Coverage', category: 'Coloring', price: 2199, duration: 90, description: 'Premium ammonia-free root touch-up, full global color, and dimensional grey blending formulated to protect curl elasticity and shine.', emoji: '🎨' },
  { _id: '4', name: 'Hair & Scalp Treatments', category: 'Treatments', price: 1899, duration: 60, description: 'Deep restorative protein-moisture treatment, anti-dandruff detox, and warm botanical oil scalp massage to rejuvenate damaged curls.', emoji: '💆‍♀️' },
  { _id: '5', name: 'Skincare Facials & Cleanups', category: 'Skincare', price: 1299, duration: 60, description: 'Radiance-boosting facial treatment, steam pore extraction, gentle exfoliation, and custom herbal mask for refreshed, glowing skin.', emoji: '✨' },
  { _id: '6', name: 'Wax Hair Removal', category: 'Waxing', price: 499, duration: 30, description: 'Hygienic and gentle peel-off / strip wax hair removal using skin-soothing botanical formulations suitable for delicate skin.', emoji: '🍯' },
  { _id: '7', name: 'Brow Threading', category: 'Threading', price: 149, duration: 15, description: 'High-precision organic brow shaping, arch definition, and upper lip threading for neat, flattering facial symmetry.', emoji: '🪡' },
  { _id: '8', name: 'Makeup & Bridal Artistry', category: 'Bridal & Makeup', price: 4999, duration: 120, description: 'Professional HD party makeup, bridal hair setting, saree draping, and contemporary makeover artistry tailored for your big celebrations.', emoji: '👑' },
];

const ServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getServices();
        const list = res.data?.services || res.data || [];
        setServices(list.length > 0 ? list : mockServices);
      } catch {
        setServices(mockServices);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = activeCategory === 'All'
    ? services
    : services.filter(s => s.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div style={{ minHeight: '100vh', padding: '60px 24px 100px', background: '#231812' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <span
            style={{
              display: 'inline-block',
              padding: '6px 18px',
              borderRadius: 20,
              background: 'rgba(168, 122, 81, 0.15)',
              border: '1px solid rgba(168, 122, 81, 0.35)',
              color: '#F1D592',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            BakeUrCurls Menu
          </span>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 700,
              color: '#F1D592',
              marginBottom: 16,
            }}
          >
            Our Salon Services
          </h1>
          <p style={{ color: 'rgba(251,246,238,0.7)', fontSize: 17, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            Specialized curly hair care, skin wellness, and beauty artistry in Trivandrum. Every treatment crafted for your unique beauty.
          </p>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '9px 22px',
                borderRadius: 24,
                border: activeCategory === cat ? 'none' : '1px solid rgba(251,246,238,0.15)',
                background: activeCategory === cat ? 'linear-gradient(135deg, #A87A51, #754B2E)' : 'rgba(251,246,238,0.05)',
                color: activeCategory === cat ? '#FBF6EE' : 'rgba(251,246,238,0.7)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeCategory === cat ? '0 4px 15px rgba(168, 122, 81, 0.35)' : 'none',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && <FullPageSpinner />}

        {/* Service Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 28 }}>
          {filtered.map(service => (
            <div
              key={service._id}
              style={{
                background: 'rgba(251,246,238,0.04)',
                border: '1px solid rgba(168, 122, 81, 0.25)',
                borderRadius: 20,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <span style={{ fontSize: 32 }}>{service.emoji || '✨'}</span>
                  <span
                    style={{
                      background: 'rgba(168, 122, 81, 0.15)',
                      border: '1px solid rgba(168, 122, 81, 0.3)',
                      color: '#F1D592',
                      padding: '4px 12px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {service.category}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#F1D592',
                    marginBottom: 10,
                  }}
                >
                  {service.name}
                </h3>
                <p style={{ color: 'rgba(251,246,238,0.7)', fontSize: 14, lineHeight: 1.65, marginBottom: 20 }}>
                  {service.description}
                </p>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 18,
                    borderTop: '1px solid rgba(251,246,238,0.08)',
                    marginBottom: 18,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 24, fontWeight: 800, color: '#F1D592' }}>₹{service.price}</span>
                    <span style={{ color: 'rgba(251,246,238,0.5)', fontSize: 13, marginLeft: 6 }}>/ session</span>
                  </div>
                  <span style={{ color: 'rgba(251,246,238,0.55)', fontSize: 13 }}>⏱️ {service.duration} mins</span>
                </div>

                <button
                  onClick={() => navigate('/book', { state: { selectedServiceId: service._id } })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #A87A51, #754B2E)',
                    color: '#FBF6EE',
                    fontWeight: 700,
                    fontSize: 15,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(168, 122, 81, 0.3)',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Book Appointment →
                </button>
              </div>
            </div>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 80, color: 'rgba(251,246,238,0.5)', fontSize: 17 }}>
            No services found in this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
`;
fs.writeFileSync(servicesPagePath, newServicesPage, 'utf8');
console.log('Updated ServicesPage.js');

// 2. Update HomePage.js featuredServices & CurlArt emblem
const homePagePath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/pages/HomePage.js';
let homeCode = fs.readFileSync(homePagePath, 'utf8');

// Replace CurlArt component with the Gold Emblem image from user
const newCurlArt = `const CurlArt = () => (
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
);`;

homeCode = homeCode.replace(/const CurlArt = \(\) => \([\s\S]*?\n\);/m, newCurlArt);

// Replace featuredServices
const newFeaturedServices = `const featuredServices = [
  { name: 'Curly Hair Dry Cut & Styling', price: 1499, duration: 75, emoji: '✂️', category: 'Hair' },
  { name: 'Haircutting & Setting', price: 899, duration: 45, emoji: '💇‍♀️', category: 'Hair' },
  { name: 'Hair Coloring & Grey Coverage', price: 2199, duration: 90, emoji: '🎨', category: 'Coloring' },
  { name: 'Hair & Scalp Treatments', price: 1899, duration: 60, emoji: '💆‍♀️', category: 'Treatments' },
  { name: 'Skincare Facials & Cleanups', price: 1299, duration: 60, emoji: '✨', category: 'Skincare' },
  { name: 'Wax Hair Removal', price: 499, duration: 30, emoji: '🍯', category: 'Waxing' },
  { name: 'Brow Threading', price: 149, duration: 15, emoji: '🪡', category: 'Threading' },
  { name: 'Makeup & Bridal Artistry', price: 4999, duration: 120, emoji: '👑', category: 'Bridal & Makeup' },
];`;

homeCode = homeCode.replace(/const featuredServices = \[\s*\{[\s\S]*?\}\s*\];/m, newFeaturedServices);

fs.writeFileSync(homePagePath, homeCode, 'utf8');
console.log('Updated HomePage.js');

// 3. Update Footer.js services list
const footerPath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/components/layout/Footer.js';
let footerCode = fs.readFileSync(footerPath, 'utf8');
const newFooterServicesList = `['Curly Hair Dry Cut & Styling', 'Haircutting & Setting', 'Hair Coloring & Grey Coverage', 'Hair & Scalp Treatments', 'Skincare Facials & Cleanups', 'Wax Hair Removal', 'Brow Threading', 'Makeup & Bridal Artistry']`;
footerCode = footerCode.replace(/\['Curl Definition Cut'[\s\S]*?\]/, newFooterServicesList);
fs.writeFileSync(footerPath, footerCode, 'utf8');
console.log('Updated Footer.js');
