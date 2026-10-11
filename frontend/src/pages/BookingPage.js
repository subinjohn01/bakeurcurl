import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useAuth } from '../context/AuthContext';
import { getServices } from '../api/services';
import { getAvailableSlots, createBooking } from '../api/bookings';
import BookingSummary from '../components/booking/BookingSummary';
import PaymentForm from '../components/booking/PaymentForm';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK || 'pk_test_placeholder');

// ── Mock data ────────────────────────────────────────────────────────────────
const mockServices = [
  { _id: '1', name: 'Curl Definition Cut', category: 'Haircut', price: 85, duration: 75, emoji: '✂️' },
  { _id: '2', name: 'Deep Conditioning', category: 'Treatment', price: 65, duration: 60, emoji: '💧' },
  { _id: '3', name: 'Protective Styling', category: 'Styling', price: 120, duration: 90, emoji: '🌿' },
  { _id: '4', name: 'Balayage & Highlights', category: 'Coloring', price: 175, duration: 150, emoji: '🎨' },
];

const mockStylists = [
  { _id: 's1', name: 'Maya Chen', specialty: 'Curly & Coily Expert', avatar: '👩🏻‍🦱' },
  { _id: 's2', name: 'Amara Osei', specialty: '4A-4C Specialist', avatar: '👩🏾‍🦳' },
  { _id: 's3', name: 'Luisa Gomez', specialty: 'Wavy Hair Expert', avatar: '👩🏽‍🦱' },
];

const mockSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

// ── Step indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ currentStep, steps }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 48, flexWrap: 'wrap', gap: 0 }}>
    {steps.map((step, i) => (
      <React.Fragment key={i}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 15,
              transition: 'all 0.3s',
              background: i < currentStep
                ? 'linear-gradient(135deg, #34D399, #059669)'
                : i === currentStep
                  ? 'linear-gradient(135deg, #A87A51, #754B2E)'
                  : 'rgba(251,246,238,0.08)',
              color: i <= currentStep ? '#fff' : 'rgba(251,246,238,0.4)',
              border: i === currentStep ? '2px solid rgba(168₹22,81,0.5)' : '2px solid transparent',
              boxShadow: i === currentStep ? '0 0 20px rgba(168₹22,81,0.4)' : 'none',
            }}
          >
            {i < currentStep ? '✓' : i + 1}
          </div>
          <span style={{ fontSize: 11, color: i === currentStep ? '#fff' : 'rgba(251,246,238,0.4)', fontWeight: i === currentStep ? 600 : 400, whiteSpace: 'nowrap' }}>
            {step}
          </span>
        </div>
        {i < steps.length-1 && (
          <div
            style={{
              height: 2,
              width: 48,
              background: i < currentStep ? 'linear-gradient(135deg, #34D399, #059669)' : 'rgba(251,246,238,0.1)',
              margin: '0 4px',
              marginBottom: 24,
              transition: 'background 0.3s',
            }}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ── Simple date picker ───────────────────────────────────────────────────────
const DatePicker = ({ value, onChange }) => {
  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return d;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
      {dates.map(date => {
        const iso = date.toISOString().split('T')[0];
        const isSelected = value === iso;
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const num = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });

        return (
          <button
            key={iso}
            onClick={() => onChange(iso)}
            style={{
              padding: '12px 8px',
              borderRadius: 10,
              border: isSelected ? 'none' : '1px solid rgba(251,246,238,0.12)',
              background: isSelected ? 'linear-gradient(135deg, #A87A51, #754B2E)' : 'rgba(251,246,238,0.04)',
              color: isSelected ? '#fff' : 'rgba(251,246,238,0.7)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              transition: 'all 0.2s',
              boxShadow: isSelected ? '0 4px 15px rgba(168₹22,81,0.4)' : 'none',
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(168₹22,81,0.15)'; }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(251,246,238,0.04)'; }}
          >
            <span style={{ fontSize: 10, opacity: 0.7 }}>{day}</span>
            <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{num}</span>
            <span style={{ fontSize: 10, opacity: 0.7 }}>{month}</span>
          </button>
        );
      })}
    </div>
  );
};

// ── Input helper ─────────────────────────────────────────────────────────────
const Input = ({ label, value, onChange, type = 'text', placeholder, required }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ color: 'rgba(251,246,238,0.7)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
      {label}{required && <span style={{ color: '#F87171' }}> *</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      style={{
        width: '100%',
        padding: '12px 16px',
        background: 'rgba(251,246,238,0.05)',
        border: '1px solid rgba(251,246,238,0.15)',
        borderRadius: 10,
        color: '#fff',
        fontSize: 15,
        transition: 'border-color 0.2s',
      }}
      onFocus={e => e.target.style.borderColor = '#A87A51'}
      onBlur={e => e.target.style.borderColor = 'rgba(251,246,238,0.15)'}
    />
  </div>
);

// ── Main Booking Page ────────────────────────────────────────────────────────
const BookingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slots, setSlots] = useState(mockSlots);
  const [customerInfo, setCustomerInfo] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', notes: '' });
  const [paymentOption, setPaymentOption] = useState('');
  const [bookingId, setBookingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  const steps = ['Select Service', 'Date & Stylist', 'Your Details', 'Payment'];

  useEffect(() => {
    getServices().then(r => setServices(r.dat.services || r.data || [])).catch(() => setServices(mockServices));
  }, []);

  useEffect(() => {
    if (location.stat.serviceId) {
      const svc = services.find(s => s._id === location.state.serviceId);
      if (svc) setSelectedService(svc);
    }
  }, [services, location.state]);

  useEffect(() => {
    if (user) setCustomerInfo(prev => ({ ...prev, name: user.name || '', email: user.email || '', phone: user.phone || '' }));
  }, [user]);

  const glass = {
    background: 'rgba(251,246,238,0.04)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(168₹22,81,0.2)',
    borderRadius: 20,
    padding: 32,
  };

  const handleCreateBooking = async () => {
    setLoading(true);
    try {
      const res = await createBooking({
        serviceId: selectedService._id,
        date: selectedDate,
        timeSlot: selectedSlot,
        staffId: selectedStylis._id,
        customerInfo,
        paymentOption,
      });
      setBookingId(res.dat._id || 'MOCK_ID');
      if (paymentOption === 'salon') {
        setBookingComplete(true);
        toast.success('Booking confirmed! See you soon 🎉');
      } else {
        setStep(3);
      }
    } catch (err) {
      // Mock success
      setBookingId('MOCK_ID');
      if (paymentOption === 'salon') {
        setBookingComplete(true);
        toast.success('Booking confirmed! See you soon 🎉');
      } else {
        setStep(3);
      }
    } finally {
      setLoading(false);
    }
  };

  if (bookingComplete) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ ...glass, maxWidth: 520, width: '100%', textAlign: 'center', padding: 52 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#F1D592', marginBottom: 16 }}>Booking Confirmed!</h2>
          <p style={{ color: 'rgba(251,246,238,0.55)', fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>
            Your appointment has been successfully booked. We'll send a confirmation to {customerInfo.email}.
          </p>
          <div style={{ background: 'rgba(52,211₹53,0.1)', border: '1px solid rgba(52,211₹53,0.3)', borderRadius: 12, padding: '16px 20px', marginBottom: 32, textAlign: 'left' }}>
            <p style={{ color: '#34D399', fontSize: 14, fontWeight: 600 }}>📅 {selectedServic.name}</p>
            <p style={{ color: 'rgba(251,246,238,0.6)', fontSize: 13, marginTop: 4 }}>{selectedDate} at {selectedSlot}</p>
          </div>
          <button onClick={() => window.location.href = '/'} style={{ background: 'linear-gradient(135deg, #A87A51, #754B2E)', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 15 }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '60px 24px 100px', background: '#231812' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#F1D592', marginBottom: 12 }}>
            Book Your Appointment
          </h1>
          <p style={{ color: 'rgba(251,246,238,0.5)', fontSize: 16 }}>Just 4 simple steps to your perfect curl day</p>
        </div>

        <StepIndicator currentStep={step} steps={steps} />

        <div style={{ display: 'grid', gridTemplateColumns: step === 3 ? '1fr 1fr' : '2fr 1fr', gap: 28, alignItems: 'start' }}>
          <div style={glass}>
            {/* ── STEP 0: Select Service ── */}
            {step === 0 && (
              <div>
                <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 24, fontFamily: "'Playfair Display', serif" }}>Select a Service</h2>
                <div style={{ display: 'grid', gap: 14 }}>
                  {(services.length ? services : mockServices).map(svc => (
                    <div
                      key={svc._id}
                      onClick={() => setSelectedService(svc)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: '18px 20px',
                        borderRadius: 14,
                        border: selectedServic._id === svc._id ? '2px solid #A87A51' : '1px solid rgba(251,246,238,0.1)',
                        background: selectedServic._id === svc._id ? 'rgba(168₹22,81,0.15)' : 'rgba(251,246,238,0.03)',
                        cursor: 'pointer',
                        transition: 'all 0.25s',
                        boxShadow: selectedServic._id === svc._id ? '0 0 20px rgba(168₹22,81,0.2)' : 'none',
                      }}
                      onMouseEnter={e => { if (selectedServic._id !== svc._id) e.currentTarget.style.background = 'rgba(251,246,238,0.07)'; }}
                      onMouseLeave={e => { if (selectedServic._id !== svc._id) e.currentTarget.style.background = 'rgba(251,246,238,0.03)'; }}
                    >
                      <span style={{ fontSize: 36 }}>{svc.emoji || '✨'}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{svc.name}</p>
                        <p style={{ color: 'rgba(251,246,238,0.45)', fontSize: 13, marginTop: 2 }}>{svc.duration} min · {svc.category}</p>
                      </div>
                      <span style={{ color: '#E8B4A0', fontWeight: 800, fontSize: 18 }}>₹{svc.price}</span>
                      {selectedServic._id === svc._id && (
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#A87A51', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>✓</div>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep(1)}
                  disabled={!selectedService}
                  style={{
                    marginTop: 28,
                    width: '100%',
                    padding: '14px',
                    background: selectedService ? 'linear-gradient(135deg, #A87A51, #754B2E)' : 'rgba(251,246,238,0.07)',
                    border: 'none',
                    borderRadius: 12,
                    color: selectedService ? '#fff' : 'rgba(251,246,238,0.3)',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: selectedService ? 'pointer' : 'not-allowed',
                    boxShadow: selectedService ? '0 6px 20px rgba(168₹22,81,0.4)' : 'none',
                    transition: 'all 0.3s',
                  }}
                >
                  Continue →
                </button>
              </div>
            )}

            {/* ── STEP 1: Date & Stylist ── */}
            {step === 1 && (
              <div>
                <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 24, fontFamily: "'Playfair Display', serif" }}>Pick Date & Stylist</h2>

                <h3 style={{ color: 'rgba(251,246,238,0.7)', fontSize: 14, fontWeight: 600, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Choose Date</h3>
                <DatePicker value={selectedDate} onChange={setSelectedDate} />

                <h3 style={{ color: 'rgba(251,246,238,0.7)', fontSize: 14, fontWeight: 600, marginBottom: 14, marginTop: 28, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Choose Stylist</h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  {mockStylists.map(stylist => (
                    <div
                      key={stylist._id}
                      onClick={() => setSelectedStylist(stylist)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '14px 18px',
                        borderRadius: 12,
                        border: selectedStylis._id === stylist._id ? '2px solid #A87A51' : '1px solid rgba(251,246,238,0.1)',
                        background: selectedStylis._id === stylist._id ? 'rgba(168₹22,81,0.15)' : 'rgba(251,246,238,0.03)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: 32 }}>{stylist.avatar}</span>
                      <div>
                        <p style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{stylist.name}</p>
                        <p style={{ color: 'rgba(251,246,238,0.45)', fontSize: 12, marginTop: 2 }}>{stylist.specialty}</p>
                      </div>
                      {selectedStylis._id === stylist._id && <span style={{ marginLeft: 'auto', color: '#A87A51', fontWeight: 700 }}>✓</span>}
                    </div>
                  ))}
                </div>

                {selectedDate && selectedStylist && (
                  <>
                    <h3 style={{ color: 'rgba(251,246,238,0.7)', fontSize: 14, fontWeight: 600, marginBottom: 14, marginTop: 28, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Available Slots</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {slots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          style={{
                            padding: '9px 18px',
                            borderRadius: 10,
                            border: selectedSlot === slot ? 'none' : '1px solid rgba(251,246,238,0.15)',
                            background: selectedSlot === slot ? 'linear-gradient(135deg, #A87A51, #754B2E)' : 'rgba(251,246,238,0.04)',
                            color: selectedSlot === slot ? '#fff' : 'rgba(251,246,238,0.7)',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                  <button onClick={() => setStep(0)} style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid rgba(251,246,238,0.15)', background: 'transparent', color: 'rgba(251,246,238,0.7)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!selectedDate || !selectedStylist || !selectedSlot}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: selectedDate && selectedStylist && selectedSlot ? 'linear-gradient(135deg, #A87A51, #754B2E)' : 'rgba(251,246,238,0.07)',
                      border: 'none',
                      borderRadius: 12,
                      color: selectedDate && selectedStylist && selectedSlot ? '#fff' : 'rgba(251,246,238,0.3)',
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: selectedDate && selectedStylist && selectedSlot ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Customer Details ── */}
            {step === 2 && (
              <div>
                <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 24, fontFamily: "'Playfair Display', serif" }}>Your Details</h2>
                {isAuthenticated && (
                  <div style={{ background: 'rgba(52,211₹53,0.1)', border: '1px solid rgba(52,211₹53,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#34D399' }}>
                    ✅ Logged in as {user?.name} — your details are pre-filled.
                  </div>
                )}
                <Input label="Full Name" value={customerInfo.name} onChange={v => setCustomerInfo(p => ({ ...p, name: v }))} placeholder="Jane Doe" required />
                <Input label="Email Address" type="email" value={customerInfo.email} onChange={v => setCustomerInfo(p => ({ ...p, email: v }))} placeholder="jane@example.com" required />
                <Input label="Phone Number" type="tel" value={customerInfo.phone} onChange={v => setCustomerInfo(p => ({ ...p, phone: v }))} placeholder="+91 70120 01472" required />
                <div style={{ marginBottom: 20 }}>
                  <label style={{ color: 'rgba(251,246,238,0.7)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Special Notes</label>
                  <textarea
                    value={customerInfo.notes}
                    onChange={e => setCustomerInfo(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Allergies, special requests, curl type..."
                    rows={3}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(251,246,238,0.05)', border: '1px solid rgba(251,246,238,0.15)', borderRadius: 10, color: '#fff', fontSize: 15, resize: 'vertical', lineHeight: 1.6 }}
                    onFocus={e => e.target.style.borderColor = '#A87A51'}
                    onBlur={e => e.target.style.borderColor = 'rgba(251,246,238,0.15)'}
                  />
                </div>

                <h3 style={{ color: 'rgba(251,246,238,0.7)', fontSize: 14, fontWeight: 600, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Payment Option</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
                  {[
                    { value: 'stripe', label: '💳 Pay 30% Advance', sub: 'Secure your slot now', color: '#A87A51' },
                    { value: 'salon', label: '🏪 Pay at Salon', sub: 'Full payment on the day', color: '#E8B4A0' },
                  ].map(opt => (
                    <div
                      key={opt.value}
                      onClick={() => setPaymentOption(opt.value)}
                      style={{
                        padding: '16px',
                        borderRadius: 12,
                        border: paymentOption === opt.value ? `2px solid ₹{opt.color}` : '1px solid rgba(251,246,238,0.12)',
                        background: paymentOption === opt.value ? `₹{opt.color}18` : 'rgba(251,246,238,0.03)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                      }}
                    >
                      <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{opt.label}</p>
                      <p style={{ color: 'rgba(251,246,238,0.45)', fontSize: 12 }}>{opt.sub}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setStep(1)} style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid rgba(251,246,238,0.15)', background: 'transparent', color: 'rgba(251,246,238,0.7)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                    ← Back
                  </button>
                  <button
                    onClick={handleCreateBooking}
                    disabled={!customerInfo.name || !customerInfo.email || !paymentOption || loading}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: customerInfo.name && customerInfo.email && paymentOption ? 'linear-gradient(135deg, #A87A51, #754B2E)' : 'rgba(251,246,238,0.07)',
                      border: 'none',
                      borderRadius: 12,
                      color: customerInfo.name && customerInfo.email && paymentOption ? '#fff' : 'rgba(251,246,238,0.3)',
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: customerInfo.name && customerInfo.email && paymentOption && !loading ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {loading ? 'Processing...' : paymentOption === 'salon' ? 'Confirm Booking' : 'Proceed to Payment →'}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Payment ── */}
            {step === 3 && (
              <div>
                <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 24, fontFamily: "'Playfair Display', serif" }}>Secure Payment</h2>
                <p style={{ color: 'rgba(251,246,238,0.55)', fontSize: 14, marginBottom: 24 }}>
                  Pay just 30% advance to confirm your slot. The remainder is collected at the salon.
                </p>
                <Elements stripe={stripePromise}>
                  <PaymentForm
                    bookingId={bookingId}
                    amount={selectedService ? selectedService.price * 0.3 : 0}
                    onSuccess={() => setBookingComplete(true)}
                    onSkip={() => { setPaymentOption('salon'); setBookingComplete(true); }}
                  />
                </Elements>
              </div>
            )}
          </div>

          {/* ── Summary sidebar ── */}
          <div>
            <BookingSummary
              service={selectedService}
              date={selectedDate}
              timeSlot={selectedSlot}
              stylist={selectedStylist}
              customerInfo={step >= 2 ? customerInfo : null}
              paymentOption={step >= 2 ? paymentOption : null}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;

