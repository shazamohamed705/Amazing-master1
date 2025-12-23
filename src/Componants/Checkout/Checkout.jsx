import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';
import { useCart } from '../../contexts/CartContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useToast } from '../../contexts/ToastContext';
import SaudiRiyalIcon from '../SaudiRiyalIcon/SaudiRiyalIcon';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://storage-te.com/backend/api/v1';
// Use the single backend endpoint that returns the documented checkout response
const CHECKOUT_ENDPOINTS = ['/checkout'];

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'تحويل بنكي' },
  { value: 'mada', label: 'مدى' },
  { value: 'apple_pay', label: 'Apple Pay' },
  { value: 'visa_master', label: 'بطاقة ائتمانية' },
];

const buildCheckoutPayload = (formData, cartItems, orderSummary) => {
  // Build payload matching what works in Postman
  // Backend likely gets user contact info from the authenticated user profile (token)
  const payload = {
    subtotal: orderSummary.subtotal || 0,
    discount: 0, // Will be calculated if coupon is applied
    total: orderSummary.total || 0,
    payment_method: formData.paymentMethod,
    coupon_applied: null, // Will be set if coupon is applied
    notes: formData.notes?.trim() || '',
    address: formData.address?.trim() || '',
    country: formData.country?.trim() || '',
    city: formData.city?.trim() || '',
    items: cartItems.map((item) => ({
      id: item.id,
      cart_item_id: item.cartItemId,
      quantity: item.quantity,
      username: item.username,
      type: item.type,
    })),
  };

  // Only include coupon_code if it has a value
  if (formData.couponCode?.trim()) {
    payload.coupon_code = formData.couponCode.trim();
    payload.coupon_applied = true; // Set to true if coupon exists
  }

  return payload;
};

const submitCheckout = async (payload, token, signal) => {
  let lastError;

  for (const endpoint of CHECKOUT_ENDPOINTS) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
        signal,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'تعذر إتمام الطلب، يرجى المحاولة لاحقاً');
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError || new Error('تعذر إرسال الطلب، يرجى المحاولة لاحقاً');
};

const validateForm = (formData) => {
  const errors = {};
  if (!formData.fullName.trim()) {
    errors.fullName = 'الاسم الكامل مطلوب';
  }
  if (!formData.phone.trim()) {
    errors.phone = 'رقم الجوال مطلوب';
  } else if (!/^\+?\d{8,15}$/.test(formData.phone.trim())) {
    errors.phone = 'يرجى إدخال رقم جوال صحيح';
  }
  if (formData.email.trim() && !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
    errors.email = 'صيغة البريد الإلكتروني غير صحيحة';
  }
  // Notes, address, country, city are now optional
  return errors;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const { currency, formatPrice } = useCurrency();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(() => {
    const storedUser = (() => {
      try {
        const raw = localStorage.getItem('userData');
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();

    return {
      fullName: storedUser?.name || '',
      email: storedUser?.email || '',
      phone: storedUser?.phone || '',
      notes: '',
      couponCode: '',
      address: '',
      country: '',
      city: '',
      paymentMethod: 'bank_transfer',
    };
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!items.length) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, navigate]);

  const orderSummary = useMemo(() => {
    const calcLineTotal = (item) => {
      const isUsernameService = item.is_username && item.price_per_1000 && item.type !== 'package';
      if (isUsernameService) {
        let price = (item.quantity / 1000) * parseFloat(item.price_per_1000 || 0);
        if (price < 50) {
          price = 50;
        }
        return price;
      }
      if (item.type === 'package') {
        return item.price || 0;
      }
      return (item.price || 0) * (item.quantity || 0);
    };

    const itemsWithTotals = items.map((item) => ({
      ...item,
      lineTotal: calcLineTotal(item),
    }));

    const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.lineTotal, 0);

    return {
      items: itemsWithTotals,
      subtotal,
      total: subtotal, // Hooks for future fees/discounts
    };
  }, [items]);

  const summaryTotal = orderSummary.total || totalPrice;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const token = (() => {
      try {
        return localStorage.getItem('userToken');
      } catch {
        return null;
      }
    })();

    if (!token) {
      showToast('يجب تسجيل الدخول لإتمام الطلب', 'error');
      navigate('/cart');
      return;
    }

    const controller = new AbortController();
    setSubmitting(true);

    try {
      const payload = buildCheckoutPayload(formData, items, orderSummary);
      const response = await submitCheckout(payload, token, controller.signal);
      showToast('تم إرسال طلبك بنجاح، سنقوم بالتواصل قريباً', 'success');
      await clearCart();
      navigate('/pending-payments', { replace: true, state: { checkoutResponse: response } });
    } catch (error) {
      if (error.name !== 'AbortError') {
        showToast(error.message || 'تعذر إتمام الطلب', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="checkout-page" dir="rtl">
      <div className="checkout-hero">
        <div className="checkout-hero__content">
          <h1>إتمام الطلب</h1>
          <p>راجع تفاصيل السلة وأكمل معلوماتك لإرسال الطلب للفريق المختص.</p>
        </div>
      </div>

      <div className="checkout-container">
        <div className="checkout-grid">
          <div className="checkout-card checkout-card--form">
            <h2>بيانات العميل</h2>
            <form className="checkout-form" onSubmit={handleSubmit}>
              <div className="checkout-field">
                <label htmlFor="fullName">الاسم الكامل</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="أدخل الاسم كما ترغب في الفاتورة"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
                {formErrors.fullName && <p className="checkout-error">{formErrors.fullName}</p>}
              </div>

              <div className="checkout-row">
                <div className="checkout-field">
                  <label htmlFor="phone">رقم الجوال</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+9665xxxxxxxx"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                  {formErrors.phone && <p className="checkout-error">{formErrors.phone}</p>}
                </div>

                <div className="checkout-field">
                  <label htmlFor="email">البريد الإلكتروني (اختياري)</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                  {formErrors.email && <p className="checkout-error">{formErrors.email}</p>}
                </div>
              </div>

              <div className="checkout-field">
                <label htmlFor="paymentMethod">طريقة الدفع</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  disabled={submitting}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="checkout-field">
                <label htmlFor="couponCode">كود الكوبون (اختياري)</label>
                <input
                  id="couponCode"
                  name="couponCode"
                  type="text"
                  placeholder="أدخل كود الكوبون إن وجد"
                  value={formData.couponCode}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
                {formErrors.couponCode && <p className="checkout-error">{formErrors.couponCode}</p>}
              </div>

              <div className="checkout-row">
                <div className="checkout-field">
                  <label htmlFor="country">الدولة (اختياري)</label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    placeholder="أدخل اسم الدولة"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                  {formErrors.country && <p className="checkout-error">{formErrors.country}</p>}
                </div>

                <div className="checkout-field">
                  <label htmlFor="city">المدينة (اختياري)</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="أدخل اسم المدينة"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                  {formErrors.city && <p className="checkout-error">{formErrors.city}</p>}
                </div>
              </div>

              <div className="checkout-field">
                <label htmlFor="address">العنوان (اختياري)</label>
                <textarea
                  id="address"
                  name="address"
                  placeholder="أدخل عنوانك الكامل"
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
                {formErrors.address && <p className="checkout-error">{formErrors.address}</p>}
              </div>

              <div className="checkout-field">
                <label htmlFor="notes">ملاحظات (اختياري)</label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="شارك أي تفاصيل إضافية تساعد فريقنا على تنفيذ طلبك"
                  rows={4}
                  value={formData.notes}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
                {formErrors.notes && <p className="checkout-error">{formErrors.notes}</p>}
              </div>

              <button type="submit" className="checkout-submit" disabled={submitting}>
                {submitting ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
              </button>
            </form>
          </div>

          <div className="checkout-card checkout-card--summary">
            <h2>ملخص السلة</h2>
            <div className="checkout-summary-list">
              {orderSummary.items.map((item) => (
                <div key={item.id} className="checkout-summary-item">
                  <div>
                    <p className="checkout-summary-title">{item.name}</p>
                    <p className="checkout-summary-meta">
                      الكمية: {item.quantity}
                      {item.username ? ` • المستخدم: ${item.username}` : ''}
                    </p>
                  </div>
                  <div className="checkout-summary-price">
                    {formatPrice(item.lineTotal).value}
                    <span className="checkout-summary-currency">
                      {currency.symbol}
                      {currency.code !== 'SAR' ? ` (${currency.code})` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="checkout-divider"></div>

            <div className="checkout-total-row">
              <span>الإجمالي ({totalItems} عنصر)</span>
            <div className="checkout-total-amount">
                {formatPrice(summaryTotal).value}
                <span className="checkout-summary-currency">
                  {currency.symbol}
                  {currency.code !== 'SAR' ? ` (${currency.code})` : ''}
                </span>
                <SaudiRiyalIcon width={18} height={19} />
              </div>
            </div>

            <p className="checkout-hint">
              سيتم التواصل معك عبر واتساب أو البريد لتأكيد عملية الدفع وتسليم الخدمة.
            </p>

            <button
              type="button"
              className="checkout-back-button"
              onClick={() => navigate('/cart')}
              disabled={submitting}
            >
              العودة للسلة
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;

