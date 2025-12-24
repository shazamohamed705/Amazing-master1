import React from 'react';
import './AnimatedUnderline.css';

const AnimatedUnderline = ({ className = '', style = {} }) => {
  return (
    <div
      className={`animated-underline ${className}`}
      style={style}
    />
  );
};

export default AnimatedUnderline;
