import React from 'react';

const SaudiRiyalIcon = ({
  width = 12,
  height = 13,
  color = '#ffffff',
  style = {}
}) => {
  const size = Math.max(width, height, 12);

  return (
    <span
      aria-label="Egyptian Pound"
      title="EGP"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        fontSize: `${size}px`,
        fontWeight: 700,
        letterSpacing: '0.05em',
        color,
        marginInlineStart: '4px',
        textTransform: 'uppercase',
        fontFamily: 'inherit',
        ...style
      }}
    >
      EGP
    </span>
  );
};

export default SaudiRiyalIcon;




