import React, { useState, memo, useCallback, useEffect, useRef } from 'react';
import { IoPersonOutline } from "react-icons/io5";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useToast } from '../../contexts/ToastContext';
import './LoginModal.css';

const LoginModal = memo(({ onClose, onSubmit }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState('');
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);
  const { showToast } = useToast();

  // Reset form fields function
  const resetForm = useCallback(() => {
    setEmail('');
    setName('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsSubmitting(false);
    setEmailError('');
    setFormErrors({});
    setFormSuccess('');
  }, []);

  // Validate email in real-time
  const validateEmail = useCallback((emailValue) => {
    if (!emailValue) {
      setEmailError('');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(emailValue)) {
      setEmailError('يرجى إدخال بريد إلكتروني صحيح');
      return false;
    }

    setEmailError('');
    return true;
  }, []);

  // Reset form fields when modal opens and clear autofill
  useEffect(() => {
    resetForm();
    
    // Clear autofill by temporarily making inputs readonly
    const clearAutofill = () => {
      if (emailInputRef.current) {
        emailInputRef.current.setAttribute('readonly', 'readonly');
        emailInputRef.current.value = '';
        setTimeout(() => {
          if (emailInputRef.current) {
            emailInputRef.current.removeAttribute('readonly');
          }
        }, 100);
      }
      if (passwordInputRef.current) {
        passwordInputRef.current.setAttribute('readonly', 'readonly');
        passwordInputRef.current.value = '';
        setTimeout(() => {
          if (passwordInputRef.current) {
            passwordInputRef.current.removeAttribute('readonly');
          }
        }, 100);
      }
      if (nameInputRef.current) {
        nameInputRef.current.setAttribute('readonly', 'readonly');
        nameInputRef.current.value = '';
        setTimeout(() => {
          if (nameInputRef.current) {
            nameInputRef.current.removeAttribute('readonly');
          }
        }, 100);
      }
      if (confirmPasswordInputRef.current) {
        confirmPasswordInputRef.current.setAttribute('readonly', 'readonly');
        confirmPasswordInputRef.current.value = '';
        setTimeout(() => {
          if (confirmPasswordInputRef.current) {
            confirmPasswordInputRef.current.removeAttribute('readonly');
          }
        }, 100);
      }
    };
    
    // Delay to ensure DOM is ready
    setTimeout(clearAutofill, 50);
  }, [resetForm]);

  // Reset form when closing modal
  const handleClose = useCallback(() => {
    resetForm();
    if (typeof onClose === 'function') {
      onClose();
    }
  }, [resetForm, onClose]);

  const toggleMode = useCallback(() => {
    setIsSignUp(prev => !prev);
    // Reset form fields and validation when switching modes
    setEmail('');
    setName('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setEmailError('');
    setFormErrors({});
    setFormSuccess('');
  }, []);

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};

    // Normalize and validate email using the same logic used in real-time validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !validateEmail(trimmedEmail)) {
      errors.email = 'يرجى إدخال بريد إلكتروني صحيح';
      setFormErrors(errors);
      showToast('يرجى إدخال بريد إلكتروني صحيح', 'error');
      return false;
    }

    if (isSignUp) {
      const trimmedName = name?.trim();
      if (!trimmedName || trimmedName.length < 2) {
        errors.name = 'يرجى إدخال اسم صحيح (على الأقل حرفين)';
        setFormErrors(errors);
        showToast('يرجى إدخال اسم صحيح (على الأقل حرفين)', 'error');
        return false;
      }
      if (!password || password.length < 6) {
        errors.password = 'كلمة المرور يجب أن تكون على الأقل 6 أحرف';
        setFormErrors(errors);
        showToast('كلمة المرور يجب أن تكون على الأقل 6 أحرف', 'error');
        return false;
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = 'كلمة المرور وتأكيد كلمة المرور غير متطابقين';
        setFormErrors(errors);
        showToast('كلمة المرور وتأكيد كلمة المرور غير متطابقين', 'error');
        return false;
      }
    } else {
      // For login, password is required
      if (!password || password.length < 1) {
        errors.password = 'يرجى إدخال كلمة المرور';
        setFormErrors(errors);
        showToast('يرجى إدخال كلمة المرور', 'error');
        return false;
      }
    }

    setFormErrors({});
    return true;
  }, [email, name, password, confirmPassword, isSignUp, showToast, validateEmail]);

  // API base URL
  const API_BASE_URL = 'https://storage-te.com/backend/api/v1';

  // Register user API call
  const registerUser = useCallback(async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          password_confirmation: userData.password_confirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from API
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join('\n');
          throw new Error(errorMessages || 'حدث خطأ في إنشاء الحساب');
        }
        throw new Error(data.message || 'حدث خطأ في إنشاء الحساب');
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى');
      }
      throw error;
    }
  }, []);

  // Login user API call
  const loginUser = useCallback(async (email, password) => {
    let timeoutId;
    try {
      // Add timeout for mobile networks
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        clearTimeout(timeoutId);
        console.error('Error parsing response:', parseError);
        throw new Error('حدث خطأ في قراءة استجابة الخادم');
      }

      if (!response.ok) {
        clearTimeout(timeoutId);
        // Handle validation errors from API
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join('\n');
          throw new Error(errorMessages || 'حدث خطأ في تسجيل الدخول');
        }
        throw new Error(data.message || 'حدث خطأ في تسجيل الدخول');
      }

      // Validate response structure
      if (!data || (!data.success && !data.data)) {
        clearTimeout(timeoutId);
        console.error('Invalid response structure:', data);
        throw new Error('استجابة غير صحيحة من الخادم');
      }

      clearTimeout(timeoutId);
      return data;
    } catch (error) {
      // Make sure timeout is cleared in case of any error
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Handle abort (timeout)
      if (error.name === 'AbortError') {
        throw new Error('انتهت مهلة الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى');
      }
      
      // Handle network errors
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch'))) {
        throw new Error('حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى');
      }
      
      // Handle CORS errors
      if (error.message && error.message.includes('CORS')) {
        throw new Error('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى');
      }
      
      // Re-throw known errors
      if (error.message) {
        throw error;
      }
      
      // Unknown errors
      console.error('Unexpected login error:', error);
      throw new Error('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى');
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isSignUp) {
        // Call register API
        const response = await registerUser({
          name: name.trim(),
          email: email.trim(),
          password: password,
          password_confirmation: confirmPassword,
        });

        // Success - close modal only when registration is actually successful
        showToast('تم إنشاء الحساب بنجاح!', 'success');

        // Inform parent (if needed) that signup succeeded
        if (typeof onSubmit === 'function') {
          onSubmit({
            type: 'signup',
            email: email.trim(),
            name: name.trim(),
            response,
          });
        }

        // Close modal and reset form AFTER successful registration only
        handleClose();
      } else {
        // Call login API
        const response = await loginUser(email.trim(), password);
        
        // Success - reset form and close modal
        // Handle different response structures
        const token = response.data?.token || response.token;
        const user = response.data?.user || response.user;
        
        if (token && user) {
          resetForm();
          
          // Call the parent component's submit handler with login data
          // The parent component will close the modal
          if (typeof onSubmit === 'function') {
            onSubmit({ 
              type: 'login', 
              token: token,
              user: user,
              email: email.trim(), // Add email to the object
              response 
            });
          }
        } else {
          console.error('Missing token or user in response:', response);
          throw new Error('استجابة غير كاملة من الخادم');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.message || (isSignUp ? 'حدث خطأ في إنشاء الحساب' : 'حدث خطأ في تسجيل الدخول');
      
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setFormErrors({ general: error.response.data.message });
      } else {
        setFormErrors({ general: errorMessage });
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, name, password, confirmPassword, isSignUp, validateForm, onSubmit, registerUser, loginUser, resetForm, handleClose, showToast]);

  return (
    <div 
      className="login-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="login-modal">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="login-modal__close-btn"
          aria-label="إغلاق"
        >
          ✕
        </button>
        
        {/* User Icon */}
        <div className="login-modal__user-icon">
          <IoPersonOutline />
        </div>
        
        {/* Title */}
        <h2 className="login-modal__title">
          {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
        </h2>

        {/* Success Message */}
        {formSuccess && (
          <div style={{
            background: '#4CAF50',
            color: '#fff',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center',
            fontSize: '14px',
          }}>
            {formSuccess}
          </div>
        )}

        {/* Error Messages */}
        {Object.keys(formErrors).length > 0 && (
          <div style={{
            background: '#f44336',
            color: '#fff',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '14px',
          }}>
            <ul style={{ margin: 0, paddingRight: '1.5rem' }}>
              {Object.entries(formErrors).map(([field, messages]) => (
                Array.isArray(messages) ? messages.map((msg, idx) => (
                  <li key={`${field}-${idx}`}>{msg}</li>
                )) : <li key={field}>{messages}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="login-modal__form" autoComplete="off" noValidate>
          {/* Name Input (Sign Up Only) */}
          {isSignUp && (
            <div className="login-modal__input-group">
              <label className="login-modal__label" dir="rtl">الاسم</label>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك"
                className="login-modal__input"
                dir="rtl"
              autoComplete="new-name"
                required
                disabled={isSubmitting}
                minLength={2}
              />
            </div>
          )}

          {/* Email Input */}
          <div className="login-modal__input-group">
            <label className="login-modal__label" dir="rtl">البريد الإلكتروني</label>
            <input
              ref={emailInputRef}
              type="email"
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);
                validateEmail(value);
                if (formErrors.email) {
                  // Remove only the email validation error when user edits the field
                  const nextErrors = { ...formErrors };
                  delete nextErrors.email;
                  setFormErrors(nextErrors);
                }
              }}
              onBlur={() => validateEmail(email)}
              placeholder="your@email.com"
              className={`login-modal__input ${emailError || formErrors.email ? 'login-modal__input--error' : ''}`}
              dir="rtl"
              autoComplete="new-email"
              required
              disabled={isSubmitting}
            />
            {emailError && (
              <span className="login-modal__error-message" dir="rtl">
                {emailError}
              </span>
            )}
          </div>

          {/* Password Input (For Login) */}
          {!isSignUp && (
            <div className="login-modal__input-group">
              <label className="login-modal__label" dir="rtl">كلمة المرور</label>
              <div className="login-modal__password-wrapper">
                <input
                  ref={passwordInputRef}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) {
                      // Remove only the password validation error when user edits the field
                      const nextErrors = { ...formErrors };
                      delete nextErrors.password;
                      setFormErrors(nextErrors);
                    }
                  }}
                  placeholder="أدخل كلمة المرور"
                  className={`login-modal__input login-modal__password-input ${formErrors.password ? 'login-modal__input--error' : ''}`}
                  dir="rtl"
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="login-modal__password-toggle"
                  disabled={isSubmitting}
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                </button>
              </div>
              {formErrors.password && (
                <span className="login-modal__error-message" dir="rtl">
                  {Array.isArray(formErrors.password) ? formErrors.password[0] : formErrors.password}
                </span>
              )}
            </div>
          )}

          {/* Password Input (Sign Up Only) */}
          {isSignUp && (
            <>
              <div className="login-modal__input-group">
                <label className="login-modal__label" dir="rtl">كلمة المرور</label>
                <div className="login-modal__password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className={`login-modal__input login-modal__password-input ${formErrors.password ? 'login-modal__input--error' : ''}`}
                    dir="rtl"
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="login-modal__password-toggle"
                    disabled={isSubmitting}
                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                  </button>
                </div>
                {formErrors.password && (
                  <span className="login-modal__error-message" dir="rtl">
                    {Array.isArray(formErrors.password) ? formErrors.password[0] : formErrors.password}
                  </span>
                )}
              </div>

              <div className="login-modal__input-group">
                <label className="login-modal__label" dir="rtl">تأكيد كلمة المرور</label>
                <div className="login-modal__password-wrapper">
                  <input
                    ref={confirmPasswordInputRef}
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (formErrors.confirmPassword) {
                          // Remove only the confirm password validation error when user edits the field
                          const nextErrors = { ...formErrors };
                          delete nextErrors.confirmPassword;
                          setFormErrors(nextErrors);
                        }
                      }}
                    placeholder="أعد إدخال كلمة المرور"
                    className={`login-modal__input login-modal__password-input ${formErrors.confirmPassword ? 'login-modal__input--error' : ''}`}
                    dir="rtl"
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPassword}
                    className="login-modal__password-toggle"
                    disabled={isSubmitting}
                    aria-label={showConfirmPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showConfirmPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                  </button>
                </div>
              </div>
            </>
          )}
          
          {/* Submit Button */}
          <button 
            type="submit"
            disabled={
              isSubmitting ||
              !email.trim() ||
              !!emailError ||
              !password ||
              (isSignUp && (!name || !confirmPassword))
            }
            className="login-modal__submit-btn"
          >
            {isSubmitting 
              ? (isSignUp ? 'جاري إنشاء الحساب...' : 'جاري تسجيل الدخول...') 
              : (isSignUp ? 'إنشاء الحساب' : 'تسجيل الدخول')
            }
          </button>
        </form>
        
        {/* Toggle Mode Link */}
        <div className="login-modal__create-account">
          <span 
            className="login-modal__create-account-text"
            onClick={toggleMode}
          >
            {isSignUp ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'إنشاء حساب جديد'}
          </span>
        </div>
      </div>
    </div>
  );
});

LoginModal.displayName = 'LoginModal';

export default LoginModal;
