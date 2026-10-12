import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent } from '../../api/payments';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const cardStyle = {
  style: {
    base: {
      color: '#fff',
      fontFamily: "'Inter', sans-serif",
      fontSize: '16px',
      '::placeholder': { color: 'rgba(251,246,238,0.35)' },
      iconColor: '#E8B4A0',
    },
    invalid: { color: '#F87171' },
  },
};

const PaymentForm = ({ bookingId, amount, onSuccess, onSkip }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { data } = await createPaymentIntent(bookingId, amount);
      const { clientSecret } = data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        toast.success('Payment successful! 🎉');
        onSuccess(result.paymentIntent);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          background: 'rgba(251,246,238,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(168,122,81,0.3)',
          borderRadius: 14,
          padding: '20px 22px',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ color: 'rgba(251,246,238,0.7)', fontSize: 13 }}>Secure Card Payment</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {['💳', '🔒'].map(i => <span key={i} style={{ fontSize: 16 }}>{i}</span>)}
          </div>
        </div>

        <div
          style={{
            background: 'rgba(251,246,238,0.04)',
            border: '1px solid rgba(251,246,238,0.15)',
            borderRadius: 10,
            padding: '14px 16px',
          }}
        >
          <CardElement options={cardStyle} onChange={e => setCardComplete(e.complete)} />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 16,
            padding: '12px 0',
            borderTop: '1px dashed rgba(251,246,238,0.1)',
          }}
        >
          <span style={{ color: 'rgba(251,246,238,0.6)', fontSize: 13 }}>Amount to charge (30% advance)</span>
          <span style={{ color: '#E8B4A0', fontSize: 20, fontWeight: 800 }}>${amoun.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={!stripe || !cardComplete}
          style={{ flex: 1 }}
        >
          💳 Pay ${amoun.toFixed(2)} Now
        </Button>
        {onSkip && (
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            disabled={loading}
          >
            Pay at Salon
          </Button>
        )}
      </div>

      <p style={{ color: 'rgba(251,246,238,0.35)', fontSize: 12, textAlign: 'center', marginTop: 14 }}>
        🔒 Secured by Stripe. Your card details are encrypted.
      </p>
    </form>
  );
};

export default PaymentForm;

