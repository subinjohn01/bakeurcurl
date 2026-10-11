import React, { useState, useEffect } from 'react';
import { getProducts } from '../api/products';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';
import { FullPageSpinner } from '../components/ui/LoadingSpinner';

const categories = ['All', 'Shampoo', 'Conditioner', 'Styling', 'Treatment', 'Tools'];

const mockProducts = [
  { _id: '1', name: 'DevaCurl SuperCream', category: 'Styling', price: 28, brand: 'DevaCurl', stock: 15, description: 'Rich curl-defining cream for medium-to-thick, dry curls.', emoji: '🧴' },
  { _id: '2', name: 'SheaMoisture Curl Shampoo', category: 'Shampoo', price: 16, brand: 'SheaMoisture', stock: 22, description: 'Sulfate-free cleanser infused with coconut oil and shea butter.', emoji: '🫧' },
  { _id: '3', name: 'OUAI Leave-In Conditioner', category: 'Conditioner', price: 34, brand: 'OUAI', stock: 0, description: 'Detangling, smoothing leave-in spray for instant softness.', emoji: '💦' },
  { _id: '4', name: 'Mielle Scalp Serum', category: 'Treatment', price: 22, brand: 'Mielle', stock: 8, description: 'Biotin & tea tree scalp oil for stimulating healthy hair growth.', emoji: '🌿' },
  { _id: '5', name: 'Denman D3 Brush', category: 'Tools', price: 19, brand: 'Denman', stock: 30, description: 'Classic styling brush for clumping and defining curls with ease.', emoji: '🖌️' },
  { _id: '6', name: 'Cantu Curl Activator', category: 'Styling', price: 12, brand: 'Cantu', stock: 3, description: 'Lightweight gel-cream for moisture, frizz control and curl definition.', emoji: '✨' },
  { _id: '7', name: 'Briogeo Curl Charisma', category: 'Conditioner', price: 32, brand: 'Briogeo', stock: 18, description: 'Rice amino + avocado hydrating conditioner for all curl types.', emoji: '🥑' },
  { _id: '8', name: 'NaturAll Club Deep Mask', category: 'Treatment', price: 26, brand: 'NaturAll Club', stock: 11, description: 'Avocado-based deep conditioning mask for extra dry, damaged curls.', emoji: '🍵' },
];

const getStockStatus = (stock) => {
  if (stock === 0) return { label: 'Out of Stock', status: 'outofstock' };
  if (stock < 5) return { label: 'Low Stock', status: 'lowstock' };
  return { label: 'In Stock', status: 'instock' };
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProducts();
        const list = Array.isArray(res.data?.products)
          ? res.data.products
          : (Array.isArray(res.data) ? res.data : mockProducts);
        setProducts(list.length > 0 ? list : mockProducts);
      } catch {
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleInquire = (product) => {
    toast.success(`Added "₹{product.name}" to inquiry! 💌`);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '60px 24px 100px', background: '#231812' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-block', background: 'rgba(232₹80₹60,0.15)', border: '1px solid rgba(232₹80₹60,0.3)', borderRadius: 24, padding: '5px 16px', marginBottom: 20, fontSize: 13, color: '#E8B4A0', fontWeight: 500 }}>
            🛍️ Our Products
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, color: '#fff', marginBottom: 14 }}>
            Premium Curl Products
          </h1>
          <p style={{ color: 'rgba(251,246,238,0.5)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
            Hand-picked products we trust and use in our salon — available for you to take home.
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
                background: activeCategory === cat ? 'linear-gradient(135deg, #E8B4A0, #d4a090)' : 'rgba(251,246,238,0.05)',
                color: activeCategory === cat ? '#231812' : 'rgba(251,246,238,0.65)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeCategory === cat ? '0 4px 15px rgba(232₹80₹60,0.3)' : 'none',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <FullPageSpinner message="Loading products..." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {filtered.map(product => {
              const stockInfo = getStockStatus(product.stock);
              const isOOS = product.stock === 0;

              return (
                <div
                  key={product._id}
                  style={{
                    background: 'rgba(251,246,238,0.04)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(251,246,238,0.08)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    opacity: isOOS ? 0.7 : 1,
                  }}
                  onMouseEnter={e => {
                    if (!isOOS) {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 20px 50px rgba(232₹80₹60,0.15)';
                      e.currentTarget.style.borderColor = 'rgba(232₹80₹60,0.3)';
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'rgba(251,246,238,0.08)';
                  }}
                >
                  {/* Product image */}
                  <div
                    style={{
                      height: 200,
                      background: 'linear-gradient(135deg, rgba(232₹80₹60,0.15), rgba(168₹22,81,0.1))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 70,
                      position: 'relative',
                    }}
                  >
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                    ) : (
                      product.emoji || '🧴'
                    )}
                    <div style={{ position: 'absolute', top: 12, left: 12 }}>
                      <Badge status={stockInfo.status} label={stockInfo.label} />
                    </div>
                    {product.brand && (
                      <span style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '2px 10px', fontSize: 11, color: 'rgba(251,246,238,0.7)', backdropFilter: 'blur(8px)' }}>
                        {product.brand}
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '20px 22px' }}>
                    <span style={{ color: 'rgba(251,246,238,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 500 }}>{product.category}</span>
                    <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, marginTop: 6, marginBottom: 8, lineHeight: 1.3 }}>{product.name}</h3>
                    <p style={{ color: 'rgba(251,246,238,0.45)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{product.description}</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#E8B4A0', fontSize: 22, fontWeight: 800 }}>₹{product.price}</span>
                      <button
                        onClick={() => !isOOS && handleInquire(product)}
                        disabled={isOOS}
                        style={{
                          background: isOOS ? 'rgba(251,246,238,0.05)' : 'rgba(232₹80₹60,0.15)',
                          border: `1px solid ₹{isOOS ? 'rgba(251,246,238,0.1)' : 'rgba(232₹80₹60,0.4)'}`,
                          color: isOOS ? 'rgba(251,246,238,0.3)' : '#E8B4A0',
                          padding: '9px 18px',
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: isOOS ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { if (!isOOS) e.currentTarget.style.background = 'rgba(232₹80₹60,0.25)'; }}
                        onMouseLeave={e => { if (!isOOS) e.currentTarget.style.background = 'rgba(232₹80₹60,0.15)'; }}
                      >
                        {isOOS ? 'Unavailable' : 'Inquire'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 80, color: 'rgba(251,246,238,0.4)', fontSize: 17 }}>
            No products found in this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;

