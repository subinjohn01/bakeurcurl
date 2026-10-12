import React from 'react';

const LoadingSpinner = ({ size = 48, message = 'Loading...' }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: 40,
    }}
  >
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer ring */}
      <div
        style={{
          position: 'absolute',
          width: size,
          height: size,
          border: '3px solid rgba(168,122,81,0.2)',
          borderTopColor: '#A87A51',
          borderRadius: '50%',
          animation: 'curlSpin 1s ease-in-out infinite',
        }}
      />
      {/* Middle ring */}
      <div
        style={{
          position: 'absolute',
          width: size * 0.65,
          height: size * 0.65,
          border: '3px solid rgba(232,180,160,0.2)',
          borderBottomColor: '#E8B4A0',
          borderRadius: '50%',
          animation: 'curlSpin 1.3s ease-in-out infinite reverse',
        }}
      />
      {/* Center dot */}
      <div
        style={{
          width: size * 0.2,
          height: size * 0.2,
          background: 'linear-gradient(135deg, #A87A51, #E8B4A0)',
          borderRadius: '50%',
          animation: 'pulse 1s ease-in-out infinite',
        }}
      />
    </div>
    {message && (
      <p style={{ color: 'rgba(251,246,238,0.5)', fontSize: 14, fontWeight: 500 }}>
        {message}
      </p>
    )}
  </div>
);

export const FullPageSpinner = ({ message }) => (
  <div
    style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LoadingSpinner size={64} message={message} />
  </div>
);

export default LoadingSpinner;
