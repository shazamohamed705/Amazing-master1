import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../Componants/Toast/ToastContainer';

const ToastContext = createContext();

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = toastIdCounter++;
    const newToast = { id, message, type, duration };
    
    // Print all toast messages to console
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    const logMessage = `[Toast ${type.toUpperCase()}] [${timestamp}] ${message}`;
    
    if (type === 'error') {
      console.error(logMessage);
    } else if (type === 'success') {
      console.log('%c' + logMessage, 'color: #4CAF50; font-weight: bold');
    } else if (type === 'warning') {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const value = {
    showToast,
    removeToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

