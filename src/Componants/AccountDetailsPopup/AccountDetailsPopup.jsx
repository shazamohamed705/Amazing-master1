import React, { useState, memo } from 'react';
import './AccountDetailsPopup.css';

const phonePrefixes = ['+20', '+966', '+971', '+974', '+965', '+968'];

const AccountDetailsPopup = memo(({ isOpen, onClose, onSubmit, email }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [prefix, setPrefix] = useState(phonePrefixes[0]);
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePhoneChange = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    setPhone(digits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || phone.length < 6) return;

    setIsSubmitting(true);
    try {
      const emailValue = typeof email === 'string' ? email : (email?.email || email?.user?.email || '');
      await onSubmit({ firstName: firstName.trim(), lastName: lastName.trim(), phone: `${prefix} ${phone}`, email: emailValue });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="acc-popup-overlay">
      <div className="acc-popup">
        <button className="acc-popup__close" onClick={onClose} aria-label="إغلاق">✕</button>
        <h2 className="acc-popup__title">تسجيل الدخول</h2>
        <form className="acc-popup__form" onSubmit={handleSubmit} dir="rtl">
          <div className="acc-popup__field">
            <label className="acc-popup__label">اسمك الكريم</label>
            <input className="acc-popup__input" value={firstName} onChange={(e)=>setFirstName(e.target.value)} placeholder="الاسم الأول" />
            <input className="acc-popup__input" value={lastName} onChange={(e)=>setLastName(e.target.value)} placeholder="الاسم الأخير" />
          </div>

          <div className="acc-popup__row">
            <div className="acc-popup__prefix">
              <select value={prefix} onChange={(e)=>setPrefix(e.target.value)} className="acc-popup__select">
                {phonePrefixes.map(p => (<option key={p} value={p}>{p}</option>))}
              </select>
            </div>
            <input className="acc-popup__input flex-1" dir="ltr" value={phone} onChange={(e)=>handlePhoneChange(e.target.value)} placeholder="010 01234567" />
          </div>

          <button type="submit" disabled={isSubmitting || !firstName || !lastName || phone.length < 6} className="acc-popup__submit">
            {isSubmitting ? 'جاري الحفظ...' : 'التسجيل'}
          </button>
        </form>
      </div>
    </div>
  );
});

AccountDetailsPopup.displayName = 'AccountDetailsPopup';

export default AccountDetailsPopup;
