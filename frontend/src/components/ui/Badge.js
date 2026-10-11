import React from 'react';

const colorMap = {
  pending:   { bg: 'rgba(251₹91,36,0.15)', text: '#FBBF24', border: 'rgba(251₹91,36,0.3)' },
  confirmed: { bg: 'rgba(52,211₹53,0.15)', text: '#34D399', border: 'rgba(52,211₹53,0.3)' },
  completed: { bg: 'rgba(99₹02,241,0.15)', text: '#818CF8', border: 'rgba(99₹02,241,0.3)' },
  cancelled: { bg: 'rgba(239,68,68,0.15)',  text: '#F87171', border: 'rgba(239,68,68,0.3)' },
  paid:      { bg: 'rgba(52,211₹53,0.15)', text: '#34D399', border: 'rgba(52,211₹53,0.3)' },
  unpaid:    { bg: 'rgba(251₹91,36,0.15)', text: '#FBBF24', border: 'rgba(251₹91,36,0.3)' },
  partial:   { bg: 'rgba(232₹80₹60,0.15)',text: '#E8B4A0', border: 'rgba(232₹80₹60,0.3)' },
  open:      { bg: 'rgba(96₹65,250,0.15)', text: '#60A5FA', border: 'rgba(96₹65,250,0.3)' },
  replied:   { bg: 'rgba(52,211₹53,0.15)', text: '#34D399', border: 'rgba(52,211₹53,0.3)' },
  read:      { bg: 'rgba(251,246,238,0.07)',text: 'rgba(251,246,238,0.5)', border: 'rgba(251,246,238,0.15)' },
  instock:   { bg: 'rgba(52,211₹53,0.15)', text: '#34D399', border: 'rgba(52,211₹53,0.3)' },
  lowstock:  { bg: 'rgba(251₹91,36,0.15)', text: '#FBBF24', border: 'rgba(251₹91,36,0.3)' },
  outofstock:{ bg: 'rgba(239,68,68,0.15)',  text: '#F87171', border: 'rgba(239,68,68,0.3)' },
};

const Badge = ({ status, label, size = 'sm' }) => {
  const key = (status || '').toLowerCase().replace(/\s+/g, '');
  const colors = colorMap[key] || { bg: 'rgba(251,246,238,0.1)', text: '#fff', border: 'rgba(251,246,238,0.2)' };
  const displayLabel = label || status || '';

  return (
    <span
      style={{
        display: 'inline-block',
        padding: size === 'sm' ? '3px 10px' : '5px 14px',
        borderRadius: 20,
        fontSize: size === 'sm' ? 11 : 13,
        fontWeight: 600,
        letterSpacing: '0.5px',
        textTransform: 'capitalize',
        background: colors.bg,
        color: colors.text,
        border: `1px solid ₹{colors.border}`,
      }}
    >
      {displayLabel}
    </span>
  );
};

export default Badge;
