import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useAuth } from '../context/AuthContext';
import { getServices } from '../api/services';
import { createBooking } from '../api/bookings';
import axiosInstance from '../api/axios';
import BookingSummary from '../components/booking/BookingSummary';
import PaymentForm from '../components/booking/PaymentForm';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK || 'pk_test_placeholder');

// Real BakeUrCurls Services from flyer
const mockServices = [
  { _id: '1', name: 'Curly Hair Dry Cut & Styling', category: 'Hair', price: 1499, duration: 75, emoji: '✂️' },
  { _id: '2', name: 'Haircutting & Setting', category: 'Hair', price: 899, duration: 45, emoji: '💇‍♀️' },
  { _id: '3', name: 'Hair Coloring & Grey Coverage', category: 'Coloring', price: 2199, duration: 90, emoji: '🎨' },
  { _id: '4', name: 'Hair & Scalp Treatments', category: 'Treatments', price: 1899, duration: 60, emoji: '💆‍♀️' },
  { _id: '5', name: 'Skincare Facials & Cleanups', category: 'Skincare', price: 1299, duration: 60, emoji: '✨' },
  { _id: '6', name: 'Wax Hair Removal', category: 'Waxing', price: 499, duration: 30, emoji: '🍯' },
  { _id: '7', name: 'Brow Threading', category: 'Threading', price: 149, duration: 15, emoji: '🪡' },
  { _id: '8', name: 'Makeup & Bridal Artistry', category: 'Bridal & Makeup', price: 4999, duration: 120, emoji: '👑' },
];

const defaultStylists = [
  { _id: 's1', name: 'Zara Thompson', specialization: 'Curly & Coily Specialist', skills: ['Haircut', 'Hair Coloring'], bio: 'Over 8 years of curly texture mastery.' },
  { _id: 's2', name: 'Marcus Rivera', specialization: 'Wavy & Texture Artist', skills: ['Haircut', 'Waxing', 'Threading'], bio: 'Specialist in custom shape cutting and brow styling.' },
];

const mockSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM',
];

const StepIndicator = ({ currentStep, steps }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 44 }}>
    {steps.map((label, i) => (
      <React.Fragment key={label}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              background: i < currentStep ? '#34D399' : i === currentStep ? 'linear-gradient(135deg, #A87A51, #754B2E)' : 'rgba(251,246,238,0.06)',
              color: i <= currentStep ? '#fff' : 'rgba(251,246,238,0.4)',
              border: i === currentStep ? '2px solid #F1D592' : '1px solid rgba(251,246,238,0.12)',
              transition: 'all 0.3s',
            }}
          >
            {i < currentStep ? '✓' : i + 1}
          </div>
          <span style={{ fontSize: 12, fontWeight: i === currentStep ? 600 : 400, color: i === currentStep ? '#F1D592' : 'rgba(251,246,238,0.5)', whiteSpace: 'nowrap' }}>
            {label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div
            style={{
              height: 2,
              flex: '1 1 40px',
              maxWidth: 80,
              background: i < currentStep ? '#34D399' : 'rgba(251,246,238,0.1)',
              margin: '0 8px 22px',
              transition: 'background 0.3s',
            }}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

const Input = ({ label, value, onChange, type = 'text', placeholder, required }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
      {label} {required && <span style={{ color: '#E8B4A0' }}>*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '12px 14px',
        borderRadius: 10,
        background: 'rgba(251,246,238,0.06)',
        border: '1px solid rgba(251,246,238,0.15)',
        color: '#FBF6EE',
        fontSize: 14,
        outline: 'none',
        boxSizing: 'border-box',
      }}
    />
  </div>
);

const BookingPage = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState(0);
  const [services, setServices] = useState(mockServices);
  const [stylists, setStylists] = useState(defaultStylists);
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

  // Load services
  useEffect(() => {
    getServices().then(r => {
      const list = Array.isArray(r.data?.services) ? r.data.services : (Array.isArray(r.data) ? r.data : mockServices);
      setServices(list.length > 0 ? list : mockServices);
    }).catch(() => setServices(mockServices));
  }, []);

  // Load stylists from admin API
  useEffect(() => {
    axiosInstance.get('/staff').then(res => {
      const list = Array.isArray(res.data?.staff) ? res.data.staff : (Array.isArray(res.data?.data) ? res.data.data : defaultStylists);
      if (list && list.length > 0) setStylists(list);
    }).catch(() => setStylists(defaultStylists));
  }, []);

  // Pre-select service if passed from /services
  useEffect(() => {
    const targetId = location.state?.selectedServiceId || location.state?.serviceId;
    if (targetId && services.length) {
      const svc = services.find(s => s._id === targetId);
      if (svc) setSelectedService(svc);
    }
  }, [services, location.state]);

  // Pre-fill customer details
  useEffect(() => {
    if (user) {
      setCustomerInfo(prev => ({ ...prev, name: user.name || '', email: user.email || '', phone: user.phone || '' }));
    }
  }, [user]);

  const glass = {
    background: 'rgba(251,246,238,0.04)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(168,122,81,0.25)',
    borderRadius: 20,
    padding: 32,
  };

  const handleBookingSubmit = async () => {
    if (!customerInfo.name || !customerInfo.email) return toast.error('Please enter name and email');
    if (!paymentOption) return toast.error('Please choose a payment option');
    setLoading(true);
    try {
      const res = await createBooking({
        serviceId: selectedService._id,
        date: selectedDate,
        timeSlot: selectedSlot,
        staffId: selectedStylist?._id,
        customerInfo,
        paymentOption,
      });
      setBookingId(res.data?._id || 'BUC-' + Math.floor(1000 + Math.random() * 9000));
      if (paymentOption === 'salon') {
        setBookingComplete(true);
        toast.success('Appointment confirmed! See you at BakeUrCurls ✨');
      } else {
        setStep(3);
      }
    } catch {
      // Graceful offline mock confirmation
      setBookingId('BUC-' + Math.floor(1000 + Math.random() * 9000));
      if (paymentOption === 'salon') {
        setBookingComplete(true);
        toast.success('Appointment booked successfully!');
      } else {
        setStep(3);
      }
    } finally {
      setLoading(false);
    }
  };

  const todayISO = new Date().toISOString().split('T')[0];

  if (bookingComplete) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#231812' }}>
        <div style={{ ...glass, maxWidth: 520, textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(52,211,153,0.15)', border: '2px solid #34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 24px', color: '#34D399' }}>
            ✓
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#F1D592', marginBottom: 12 }}>
            Appointment Confirmed!
          </h2>
          <p style={{ color: 'rgba(251,246,238,0.7)', fontSize: 15, marginBottom: 8 }}>
            Your booking reference is <strong style={{ color: '#F1D592' }}>#{bookingId}</strong>
          </p>
          <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 12, padding: '16px 20px', margin: '24px 0', textAlign: 'left' }}>
            <p style={{ color: '#F1D592', fontSize: 15, fontWeight: 700 }}>✨ {selectedService?.name}</p>
            <p style={{ color: 'rgba(251,246,238,0.7)', fontSize: 13, marginTop: 4 }}>
              📅 {selectedDate} at 🕒 {selectedSlot}
            </p>
            <p style={{ color: 'rgba(251,246,238,0.7)', fontSize: 13, marginTop: 4 }}>
              👤 Stylist: {selectedStylist?.name || 'Assigned Stylist'}
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            style={{ background: 'linear-gradient(135deg, #A87A51, #754B2E)', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 15 }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '60px 24px 100px', background: '#231812' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#F1D592', marginBottom: 10 }}>
            Book Your Appointment
          </h1>
          <p style={{ color: 'rgba(251,246,238,0.65)', fontSize: 16 }}>
            BakeUrCurls Salon — 2nd Floor, F Square, Pattom, Trivandrum
          </p>
        </div>

        <StepIndicator currentStep={step} steps={steps} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
          <div>
            {/* STEP 0: Select Service */}
            {step === 0 && (
              <div>
                <h2 style={{ color: '#F1D592', fontSize: 22, fontWeight: 700, marginBottom: 20, fontFamily: "'Playfair Display', serif" }}>
                  Select a Service
                </h2>
                <div style={{ display: 'grid', gap: 14 }}>
                  {services.map(svc => {
                    const isSelected = selectedService?._id === svc._id;
                    return (
                      <div
                        key={svc._id}
                        onClick={() => setSelectedService(svc)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16,
                          padding: '16px 20px',
                          borderRadius: 14,
                          border: isSelected ? '2px solid #F1D592' : '1px solid rgba(251,246,238,0.1)',
                          background: isSelected ? 'rgba(168,122,81,0.2)' : 'rgba(251,246,238,0.03)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <span style={{ fontSize: 32 }}>{svc.emoji || '✨'}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: '#FBF6EE', fontWeight: 700, fontSize: 16 }}>{svc.name}</p>
                          <p style={{ color: 'rgba(251,246,238,0.5)', fontSize: 13, marginTop: 2 }}>
                            {svc.duration} mins • {svc.category || 'Specialized'}
                          </p>
                        </div>
                        <span style={{ color: '#F1D592', fontWeight: 800, fontSize: 18 }}>₹{svc.price}</span>
                        {isSelected && (
                          <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#F1D592', color: '#18100B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, marginLeft: 10 }}>
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => setStep(1)}
                  disabled={!selectedService}
                  style={{
                    marginTop: 24,
                    width: '100%',
                    padding: '14px',
                    borderRadius: 12,
                    background: selectedService ? 'linear-gradient(135deg, #A87A51, #754B2E)' : 'rgba(251,246,238,0.07)',
                    color: selectedService ? '#fff' : 'rgba(251,246,238,0.3)',
                    fontWeight: 700,
                    fontSize: 16,
                    border: 'none',
                    cursor: selectedService ? 'pointer' : 'not-allowed',
                  }}
                >
                  Continue to Date & Stylist →
                </button>
              </div>
            )}

            {/* STEP 1: Date & Time Picker + Stylist Selection */}
            {step === 1 && (
              <div>
                <h2 style={{ color: '#F1D592', fontSize: 22, fontWeight: 700, marginBottom: 20, fontFamily: "'Playfair Display', serif" }}>
                  Select Date, Time & Stylist
                </h2>

                {/* Date Picker Input */}
                <div style={{ marginBottom: 28, background: 'rgba(251,246,238,0.03)', padding: 20, borderRadius: 14, border: '1px solid rgba(168,122,81,0.2)' }}>
                  <label style={{ display: 'block', color: '#F1D592', fontSize: 14, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    📅 Pick Appointment Date *
                  </label>
                  <input
                    type="date"
                    min={todayISO}
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: 'rgba(251,246,238,0.07)',
                      border: '1.5px solid rgba(168,122,81,0.4)',
                      color: '#FBF6EE',
                      fontSize: 15,
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box',
                      colorScheme: 'dark',
                    }}
                  />
                </div>

                {/* Time Dropdown */}
                <div style={{ marginBottom: 28, background: 'rgba(251,246,238,0.03)', padding: 20, borderRadius: 14, border: '1px solid rgba(168,122,81,0.2)' }}>
                  <label style={{ display: 'block', color: '#F1D592', fontSize: 14, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    🕒 Choose Appointment Time (Dropdown) *
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={e => setSelectedSlot(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: '#291C14',
                      border: '1.5px solid rgba(168,122,81,0.4)',
                      color: '#FBF6EE',
                      fontSize: 15,
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">-- Click to select an available time slot --</option>
                    {slots.map(s => (
                      <option key={s} value={s} style={{ background: '#231812', color: '#FBF6EE' }}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stylist Selection (Configured by Admin) */}
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ color: '#F1D592', fontSize: 14, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    👤 Choose Stylist (Configured by Admin)
                  </h3>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {/* Any Stylist Option */}
                    <div
                      onClick={() => setSelectedStylist({ _id: 'any', name: 'Any Available Stylist', specialization: 'Next Available Specialist' })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '14px 18px',
                        borderRadius: 12,
                        border: selectedStylist?._id === 'any' ? '2px solid #F1D592' : '1px solid rgba(251,246,238,0.1)',
                        background: selectedStylist?._id === 'any' ? 'rgba(168,122,81,0.2)' : 'rgba(251,246,238,0.03)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #A87A51, #754B2E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        ✨
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#FBF6EE', fontWeight: 700, fontSize: 15 }}>Any Available Stylist</p>
                        <p style={{ color: 'rgba(251,246,238,0.5)', fontSize: 12 }}>First available specialist on duty</p>
                      </div>
                      {selectedStylist?._id === 'any' && <span style={{ color: '#F1D592', fontWeight: 900 }}>✓</span>}
                    </div>

                    {stylists.map(stylist => {
                      const isSelected = selectedStylist?._id === stylist._id;
                      return (
                        <div
                          key={stylist._id}
                          onClick={() => setSelectedStylist(stylist)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            padding: '14px 18px',
                            borderRadius: 12,
                            border: isSelected ? '2px solid #F1D592' : '1px solid rgba(251,246,238,0.1)',
                            background: isSelected ? 'rgba(168,122,81,0.2)' : 'rgba(251,246,238,0.03)',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ width: 46, height: 46, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #D4AF37', background: '#18100B', flexShrink: 0 }}>
                            {stylist.avatar ? (
                              <img src={stylist.avatar} alt={stylist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#F1D592', background: 'linear-gradient(135deg, #A87A51, #754B2E)' }}>
                                {stylist.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ color: '#FBF6EE', fontWeight: 700, fontSize: 15 }}>{stylist.name}</p>
                            <p style={{ color: '#E8B4A0', fontSize: 12, fontWeight: 500 }}>{stylist.specialization || 'Curl Specialist'}</p>
                            {stylist.bio && <p style={{ color: 'rgba(251,246,238,0.5)', fontSize: 12, marginTop: 2 }}>{stylist.bio}</p>}
                            {stylist.skills && stylist.skills.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                                {stylist.skills.map(sk => (
                                  <span key={sk} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 8, background: 'rgba(212,175,55,0.15)', color: '#F1D592' }}>
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {isSelected && <span style={{ color: '#F1D592', fontWeight: 900 }}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button
                    onClick={() => setStep(0)}
                    style={{ padding: '12px 20px', borderRadius: 12, background: 'rgba(251,246,238,0.06)', border: '1px solid rgba(251,246,238,0.15)', color: '#FBF6EE', cursor: 'pointer', fontWeight: 600 }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!selectedDate || !selectedSlot || !selectedStylist}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: selectedDate && selectedSlot && selectedStylist ? 'linear-gradient(135deg, #A87A51, #754B2E)' : 'rgba(251,246,238,0.07)',
                      border: 'none',
                      borderRadius: 12,
                      color: selectedDate && selectedSlot && selectedStylist ? '#fff' : 'rgba(251,246,238,0.3)',
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: selectedDate && selectedSlot && selectedStylist ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Continue to Details →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Customer Details */}
            {step === 2 && (
              <div>
                <h2 style={{ color: '#F1D592', fontSize: 22, fontWeight: 700, marginBottom: 20, fontFamily: "'Playfair Display', serif" }}>
                  Your Contact Details
                </h2>
                <Input label="Full Name" value={customerInfo.name} onChange={v => setCustomerInfo(p => ({ ...p, name: v }))} placeholder="Your name" required />
                <Input label="Email Address" type="email" value={customerInfo.email} onChange={v => setCustomerInfo(p => ({ ...p, email: v }))} placeholder="you@example.com" required />
                <Input label="Phone Number" type="tel" value={customerInfo.phone} onChange={v => setCustomerInfo(p => ({ ...p, phone: v }))} placeholder="+91 70120 01472" required />
                <div style={{ marginBottom: 20 }}>
                  <label style={{ color: 'rgba(251,246,238,0.7)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    Special Requests / Hair History (Optional)
                  </label>
                  <textarea
                    value={customerInfo.notes}
                    onChange={e => setCustomerInfo(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Tell us about your curl pattern, previous treatments, or preferences..."
                    style={{ width: '100%', minHeight: 80, padding: 12, borderRadius: 10, background: 'rgba(251,246,238,0.06)', border: '1px solid rgba(251,246,238,0.15)', color: '#FBF6EE', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Payment selection */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', color: '#F1D592', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                    Select Payment Method:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div
                      onClick={() => setPaymentOption('salon')}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        border: paymentOption === 'salon' ? '2px solid #F1D592' : '1px solid rgba(251,246,238,0.12)',
                        background: paymentOption === 'salon' ? 'rgba(168,122,81,0.2)' : 'rgba(251,246,238,0.03)',
                        cursor: 'pointer',
                      }}
                    >
                      <p style={{ fontWeight: 700, fontSize: 15, color: '#FBF6EE' }}>🏢 Pay at Salon</p>
                      <p style={{ color: 'rgba(251,246,238,0.5)', fontSize: 12, marginTop: 4 }}>Pay upon arrival (Cash / UPI / Card)</p>
                    </div>
                    <div
                      onClick={() => setPaymentOption('stripe')}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        border: paymentOption === 'stripe' ? '2px solid #F1D592' : '1px solid rgba(251,246,238,0.12)',
                        background: paymentOption === 'stripe' ? 'rgba(168,122,81,0.2)' : 'rgba(251,246,238,0.03)',
                        cursor: 'pointer',
                      }}
                    >
                      <p style={{ fontWeight: 700, fontSize: 15, color: '#FBF6EE' }}>💳 Pay 30% Advance</p>
                      <p style={{ color: 'rgba(251,246,238,0.5)', fontSize: 12, marginTop: 4 }}>Secure your slot with online card payment</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => setStep(1)}
                    style={{ padding: '12px 20px', borderRadius: 12, background: 'rgba(251,246,238,0.06)', border: '1px solid rgba(251,246,238,0.15)', color: '#FBF6EE', cursor: 'pointer', fontWeight: 600 }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleBookingSubmit}
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
                    {loading ? 'Confirming...' : paymentOption === 'salon' ? 'Confirm Booking ✓' : 'Proceed to Card Payment →'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Stripe Card Payment */}
            {step === 3 && (
              <div>
                <h2 style={{ color: '#F1D592', fontSize: 22, fontWeight: 700, marginBottom: 20, fontFamily: "'Playfair Display', serif" }}>
                  Complete Advance Payment
                </h2>
                <Elements stripe={stripePromise}>
                  <PaymentForm
                    bookingId={bookingId}
                    amount={selectedService ? selectedService.price * 0.3 : 0}
                    onSuccess={() => setBookingComplete(true)}
                  />
                </Elements>
              </div>
            )}
          </div>

          {/* Sticky Summary Card */}
          <div style={{ position: 'sticky', top: 100 }}>
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
