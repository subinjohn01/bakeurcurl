import React from 'react';

const StatsCard = ({ icon, label, value, sub, color = '#A87A51', trend }) => {
  return (
    <div
      style={{
        background: 'rgba(251,246,238,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(251,246,238,0.08)',
        borderRadius: 16,
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(251,246,238,0.07)';
        e.currentTarget.style.borderColor = `₹{color}40`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(251,246,238,0.04)';
        e.currentTarget.style.borderColor = 'rgba(251,246,238,0.08)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top:-20,
          right:-20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: color,
          opacity: 0.08,
          filter: 'blur(20px)',
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `₹{color}20`,
          border: `1px solid ₹{color}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          marginBottom: 16,
        }}
      >
        {icon}
      </div>

      {/* Value */}
      <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 4, lineHeight: 1 }}>
        {value}
      </div>

      {/* Label */}
      <div style={{ color: 'rgba(251,246,238,0.55)', fontSize: 13, fontWeight: 500, marginBottom: sub || trend ? 10 : 0 }}>
        {label}
      </div>

      {/* Sub & Trend */}
      {(sub || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {trend && (
            <span
              style={{
                color: trend > 0 ? '#34D399' : '#F87171',
                fontSize: 12,
                fontWeight: 600,
                background: trend > 0 ? 'rgba(52,211₹53,0.1)' : 'rgba(248₹13₹13,0.1)',
                padding: '2px 8px',
                borderRadius: 12,
              }}
            >
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
          {sub && <span style={{ color: 'rgba(251,246,238,0.35)', fontSize: 12 }}>{sub}</span>}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
