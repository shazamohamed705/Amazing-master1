import React, { useState, useEffect, memo } from 'react';
import { IoPersonOutline } from "react-icons/io5";
import { IoArrowForward } from "react-icons/io5";
import './VerificationCodePopup.css';

const VerificationCodePopup = memo(({ 
  isOpen, 
  onClose, 
  email, 
  onVerify, 
  onResend 
}) => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  // Reset timer when popup opens
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(120);
      setVerificationCode(['', '', '', '']);
    }
  }, [isOpen]);

  // Handle input change
  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`verification-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`verification-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newCode = pastedData.split('').concat(Array(4 - pastedData.length).fill(''));
    setVerificationCode(newCode);
    
    // Focus last filled input
    const lastFilledIndex = Math.min(pastedData.length - 1, 3);
    const lastInput = document.getElementById(`verification-input-${lastFilledIndex}`);
    if (lastInput) lastInput.focus();
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle verify
  const handleVerify = async () => {
    const code = verificationCode.join('');
    if (code.length !== 4) return;

    setIsVerifying(true);
    try {
      await onVerify(code);
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle resend
  const handleResend = async () => {
    if (timeLeft > 0 || isResending) return;

    setIsResending(true);
    try {
      await onResend();
      setTimeLeft(120); // Reset timer
    } catch (error) {
      console.error('Resend failed:', error);
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="verification-popup-overlay">
      <div className="verification-popup">
        {/* Header */}
        <div className="verification-popup__header">
          <button 
            onClick={onClose}
            className="verification-popup__close-btn"
            aria-label="إغلاق"
          >
            ✕
          </button>
          
          <div className="verification-popup__user-icon">
            <IoPersonOutline />
          </div>
          
          <button 
            className="verification-popup__next-btn"
            aria-label="التالي"
          >
            <IoArrowForward />
          </button>
        </div>

        {/* Title */}
        <h2 className="verification-popup__title">تسجيل الدخول</h2>

        {/* Instructions */}
        <div className="verification-popup__instructions">
          <p className="verification-popup__instruction-text">
            رقم التحقق مطلوب لاكمال العملية
          </p>
          <p className="verification-popup__instruction-text">
            لقد تم إرسال رمز التحقق في رسالة إليكم
          </p>
        </div>

        {/* Email Display */}
        <div className="verification-popup__email">
          {typeof email === 'string' ? email : (email?.email || email?.user?.email || '')}
        </div>

        {/* Verification Code Inputs */}
        <div className="verification-popup__code-inputs">
          {verificationCode.map((digit, index) => (
            <input
              key={index}
              id={`verification-input-${index}`}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="verification-popup__code-input"
              autoComplete="off"
            />
          ))}
        </div>

        {/* Verify Button */}
        <button 
          onClick={handleVerify}
          disabled={verificationCode.join('').length !== 4 || isVerifying}
          className="verification-popup__verify-btn"
        >
          {isVerifying ? 'جاري التحقق...' : 'تحقق'}
        </button>

        {/* Resend Timer */}
        <div className="verification-popup__resend">
          {timeLeft > 0 ? (
            <p className="verification-popup__resend-timer">
              يمكنك إعادة الإرسال بعد {formatTime(timeLeft)}
            </p>
          ) : (
            <button 
              onClick={handleResend}
              disabled={isResending}
              className="verification-popup__resend-btn"
            >
              {isResending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

VerificationCodePopup.displayName = 'VerificationCodePopup';

export default VerificationCodePopup;

