import React from 'react';
import Badge from '../ui/Badge';

const BookingSummary = ({ service, date, timeSlot, stylist, customerInfo, paymentOption }) => {
  const glassCard = {
    background: 'rgba(251,246,238,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(168,122,81,0.25)',
    borderRadius: 16,
    padding: 24,
  };

  const row = (label, value) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(251,246,238,0.07)' }}>
      <span style={{ color: 'rgba(251,246,238,0.55)', fontSize: 14 }}>{label}</span>
      <span style={{ color: '#fff', fontSize: 14, fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{value || '—'}</span>
    </div>
  );

  const advanceAmount = service ? (service.price * 0.3).toFixed(2) : '0.00';

  return (
    <div style={glassCard}>
      <h3
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 20,
          background: 'linear-gradient(135deg, #fff, #E8B4A0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Booking Summary
      </h3>

      {service && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(168,122,81,0.2), rgba(74,47,30,0.2))',
            borderRadius: 12,
            padding: '14px 16px',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{service.name}</p>
            <p style={{ color: 'rgba(251,246,238,0.55)', fontSize: 13 }}>{service.duration} minutes</p>
          </div>
          <span style={{ color: '#E8B4A0', fontSize: 22, fontWeight: 800 }}>${service.price}</span>
        </div>
      )}

      <div>
        {row('Date', date ? new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : null)}
        {row('Time', timeSlot)}
        {row('Stylist', stylist?.name)}
        {customerInfo?.name && row('Customer', customerInfo.name)}
        {customerInfo?.email && row('Email', customerInfo.email)}
        {customerInfo?.phone && row('Phone', customerInfo.phone)}
      </div>

      {paymentOption && (
        <div style={{ marginTop: 20, padding: '16px', background: 'rgba(232,180,160,0.1)', borderRadius: 12, border: '1px solid rgba(232,180,160,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: 'rgba(251,246,238,0.7)', fontSize: 13 }}>Payment Option</span>
            <Badge status={paymentOption === 'stripe' ? 'confirmed' : 'pending'} label={paymentOption === 'stripe' ? 'Online Payment' : 'Pay at Salon'} />
          </div>
          {paymentOption === 'stripe' && service && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'rgba(251,246,238,0.55)', fontSize: 13 }}>Service Total</span>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>${service.price}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px dashed rgba(251,246,238,0.1)' }}>
                <span style={{ color: '#E8B4A0', fontSize: 14, fontWeight: 600 }}>30% Advance Due</span>
                <span style={{ color: '#E8B4A0', fontSize: 18, fontWeight: 800 }}>${advanceAmount}</span>
              </div>
            </>
          )}
          {paymentOption === 'salon' && (
            <p style={{ color: 'rgba(251,246,238,0.55)', fontSize: 13 }}>Full payment collected at the salon on the day of your appointment.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingSummary;
