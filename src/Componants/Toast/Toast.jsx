import React, { useEffect, useState } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible && !message) return null;

  return (
    <div className={`toast toast--${type} ${isVisible ? 'toast--visible' : ''}`} dir="rtl">
      <div className="toast__content">
        <span className="toast__message">{message}</span>
        <button 
          className="toast__close" 
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => {
              if (onClose) onClose();
            }, 300);
          }}
          aria-label="إغلاق"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;

