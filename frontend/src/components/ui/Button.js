import React from 'react';

const variants = {
  primary: {
    background: 'linear-gradient(135deg, #A87A51, #754B2E)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 20px rgba(168,122,81,0.4)',
  },
  secondary: {
    background: 'transparent',
    color: '#E8B4A0',
    border: '1.5px solid #E8B4A0',
    boxShadow: 'none',
  },
  ghost: {
    background: 'rgba(251,246,238,0.07)',
    color: '#fff',
    border: '1px solid rgba(251,246,238,0.15)',
    boxShadow: 'none',
  },
  danger: {
    background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 15px rgba(239,68,68,0.35)',
  },
};

const sizeMap = {
  sm: { padding: '6px 14px', fontSize: '13px' },
  md: { padding: '10px 22px', fontSize: '15px' },
  lg: { padding: '14px 32px', fontSize: '17px' },
};

const Spinner = () => (
  <span
    style={{
      display: 'inline-block',
      width: 16,
      height: 16,
      border: '2px solid rgba(251,246,238,0.3)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      marginRight: 8,
      verticalAlign: 'middle',
    }}
  />
);

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  style = {},
  fullWidth = false,
}) => {
  const [hovered, setHovered] = React.useState(false);
  const base = variants[variant] || variants.primary;
  const sz = sizeMap[size] || sizeMap.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...base,
        ...sz,
        borderRadius: 10,
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transition: 'all 0.25s ease',
        transform: hovered && !disabled ? 'translateY(-1px)' : 'none',
        width: fullWidth ? '100%' : 'auto',
        letterSpacing: '0.3px',
        ...style,
      }}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
};

export default Button;
