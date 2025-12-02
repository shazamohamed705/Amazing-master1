import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineShoppingBag } from "react-icons/hi";
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import SaudiRiyalIcon from '../SaudiRiyalIcon/SaudiRiyalIcon';
import './Cart.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://storage-te.com/backend/api/v1';

const Cart = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, fetchCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { showToast } = useToast();
  const { currency, formatPrice } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);
  const [editingItems, setEditingItems] = useState({});

  // Calculate price for an item dynamically
  const calculateItemPrice = (item, customQuantity = null) => {
    const qty = customQuantity !== null ? customQuantity : item.quantity;
    
    // If service requires username and has price_per_1000, calculate dynamically
    if (item.is_username && item.price_per_1000 && qty > 0) {
      let price = (qty / 1000) * parseFloat(item.price_per_1000);
      // Minimum price of 50
      if (price < 50) {
        price = 50;
      }
      return price;
    }
    
    // Otherwise use fixed price
    return item.price || 0;
  };

  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      await fetchCart();
      setLoading(false);
    };
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToHomePage = () => {
    window.location.href = '/';
  };

  const handleRemove = async (cartItem) => {
    // Use toast for confirmation instead of window.confirm
    const confirmed = window.confirm('هل أنت متأكد من حذف هذا المنتج من السلة؟');
    if (!confirmed) {
      return;
    }
    try {
      await removeFromCart({ productId: cartItem.id, cartItemId: cartItem.cartItemId });
      showToast('تم حذف المنتج من السلة', 'success');
    } catch (error) {
      showToast(error.message || 'تعذر حذف المنتج من السلة، يرجى المحاولة مرة أخرى.', 'error');
    }
  };

  const handleQuantityChange = async (item, newQuantity, newUsername = null) => {
    if (newQuantity < 1) {
      handleRemove(item);
      return;
    }
    
    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        const updateData = { absolute_quantity: newQuantity };
        if (newUsername !== null) {
          updateData.username = newUsername;
        }
        
        const response = await fetch(`${API_BASE_URL}/cart/${item.cartItemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        });
        const data = await response.json();
        if (data.success) {
          updateQuantity(item.id, newQuantity, newUsername !== null ? newUsername : item.username);
          showToast('تم التحديث بنجاح', 'success');
          setEditingItems(prev => {
            const newState = { ...prev };
            delete newState[item.id];
            return newState;
          });
        } else {
          showToast(data.message || 'حدث خطأ في التحديث', 'error');
        }
      } catch (error) {
        console.error('Error updating cart item:', error);
        // Update locally anyway for better UX
        updateQuantity(item.id, newQuantity, newUsername !== null ? newUsername : item.username);
        setEditingItems(prev => {
          const newState = { ...prev };
          delete newState[item.id];
          return newState;
        });
      }
    } else {
      updateQuantity(item.id, newQuantity, newUsername !== null ? newUsername : item.username);
      setEditingItems(prev => {
        const newState = { ...prev };
        delete newState[item.id];
        return newState;
      });
    }
  };

  const handleEditItem = (item) => {
    setEditingItems(prev => ({
      ...prev,
      [item.id]: {
        quantity: item.quantity, // Keep original quantity (will be ignored for packages with username)
        username: item.username || '' // Initialize username (empty if not set)
      }
    }));
  };

  const handleCancelEdit = (itemId) => {
    setEditingItems(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  };

  const handleSaveEdit = async (item) => {
    const editing = editingItems[item.id];
    if (!editing) return;
    
    // Helper to check if package needs username
    const isPackageNeedingUsername = (item.type === 'package' && item.is_username) || 
      (item.name && (item.name.includes('باقه') || item.name.includes('باقة')) && item.is_username !== false);
    
    // For packages with username, quantity is fixed, only update username
    if (isPackageNeedingUsername) {
      const newUsername = editing.username?.trim() || null;
      if (!newUsername) {
        showToast('يرجى إدخال اسم المستخدم', 'error');
        return;
      }
      await handleQuantityChange(item, item.quantity, newUsername); // Keep original quantity
    } else {
      const newQuantity = parseInt(editing.quantity) || 1;
      const newUsername = editing.username?.trim() || null;
      await handleQuantityChange(item, newQuantity, newUsername);
    }
  };

  const handleClearAll = () => {
    setShowClearModal(true);
  };

  const confirmClearCart = async () => {
    setShowClearModal(false);
    try {
      await clearCart();
      showToast('تم تفريغ السلة بنجاح', 'success');
    } catch (error) {
      showToast(error.message || 'تعذر تفريغ السلة، يرجى المحاولة مرة أخرى.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <h2 className="cart-message">جاري التحميل...</h2>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-icon-wrapper">
            <div className="cart-icon-circle">
              <HiOutlineShoppingBag className="cart-icon" />
            </div>
          </div>
          <h2 className="cart-message">السلة فارغة</h2>
          <button 
            className="home-page-button"
            onClick={goToHomePage}
          >
            الصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Clear Cart Confirmation Modal */}
      {showClearModal && (
        <div className="cart-modal-overlay" onClick={() => setShowClearModal(false)}>
          <div className="cart-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="cart-modal-header">
              <h3 className="cart-modal-title">تأكيد تفريغ السلة</h3>
            </div>
            <div className="cart-modal-body">
              <p className="cart-modal-message">هل أنت متأكد من تفريغ السلة بالكامل؟</p>
              <p className="cart-modal-submessage">لن تتمكن من التراجع عن هذا الإجراء</p>
            </div>
            <div className="cart-modal-footer">
              <button
                className="cart-modal-button cart-modal-button-cancel"
                onClick={() => setShowClearModal(false)}
              >
                إلغاء
              </button>
              <button
                className="cart-modal-button cart-modal-button-confirm"
                onClick={confirmClearCart}
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="cart-page cart-page--rtl" dir="rtl">
        <div className="cart-container cart-container--full">
        <h2 className="cart-message cart-message--spaced">سلة التسوق</h2>
        
        <div className="cart-items">
          {items.map((item) => {
            const isEditing = editingItems[item.id];
            const editing = isEditing || { quantity: item.quantity, username: item.username || '' };
            
            // Helper function to check if item is a package that requires username
            const isPackageWithUsername = () => {
              // Check by type and is_username
              if (item.type === 'package' && item.is_username) return true;
              // Check by name (fallback)
              if (item.name && (item.name.includes('باقه') || item.name.includes('باقة'))) {
                // If name contains "باقه" or "باقة", assume it's a package that might need username
                // Check if is_username is true, or if it's not set, assume it might need username
                return item.is_username !== false; // If not explicitly false, assume it might need username
              }
              return false;
            };
            
            const isPackageNeedingUsername = isPackageWithUsername();
            
            // Debug log for packages
            if (item.name && (item.name.includes('باقه') || item.name.includes('باقة'))) {
              console.log('Package Debug:', {
                name: item.name,
                type: item.type,
                is_username: item.is_username,
                username: item.username,
                isPackageNeedingUsername: isPackageNeedingUsername
              });
            }
            
            return (
              <div key={item.id} className="cart-item">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="cart-item-image"
                  />
                )}
                <div className="cart-item-body">
                  <h3 className="cart-item-title">
                    {item.name}
                  </h3>
                  
                  {/* Username display/edit - Show for packages with is_username or if username exists */}
                  {(isPackageNeedingUsername || item.username) ? (
                    <div className="cart-item-username">
                      <span className="cart-username-label">اسم المستخدم:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          className="cart-username-input"
                          value={editing.username || ''}
                          onChange={(e) => setEditingItems(prev => ({
                            ...prev,
                            [item.id]: { ...editing, username: e.target.value }
                          }))}
                          placeholder="أدخل اسم المستخدم"
                        />
                      ) : item.username ? (
                        <span className="cart-username-value">{item.username}</span>
                      ) : (
                        <button
                          type="button"
                          className="cart-add-username-btn"
                          onClick={() => handleEditItem(item)}
                        >
                          إضافة username
                        </button>
                      )}
                    </div>
                  ) : null}
                  
                  <div className="cart-item-actions">
                    <div className="cart-price">
                      <span className="cart-price-value">
                        {formatPrice(isEditing ? calculateItemPrice(item, editing.quantity) : calculateItemPrice(item)).value}
                      </span>
                      <span style={{ marginRight: '4px' }}>{currency.symbol}</span>
                      {currency.code !== 'SAR' && (
                        <span style={{ fontSize: '0.75em', marginRight: '4px', color: '#ABB3BA' }}>({currency.code})</span>
                      )}
                      {item.is_username && item.price_per_1000 && (
                        <span className="cart-price-per-unit">
                          / {(item.followers_count || item.quantity || 0).toLocaleString('en-US')}
                        </span>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <div className="cart-edit-controls">
                        {/* Hide quantity edit for packages with username (quantity is fixed) */}
                        {!isPackageNeedingUsername && (
                          <div className="cart-quantity-edit">
                            <label className="cart-edit-label">العدد:</label>
                            <input
                              type="number"
                              className="cart-quantity-input"
                              value={editing.quantity}
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value) || 1;
                                setEditingItems(prev => ({
                                  ...prev,
                                  [item.id]: { ...editing, quantity: newQty }
                                }));
                              }}
                              min="1"
                            />
                          </div>
                        )}
                        {/* Show username edit for packages with is_username - Always show in edit mode for packages */}
                        {isPackageNeedingUsername && (
                          <div className="cart-username-edit">
                            <label className="cart-edit-label">اسم المستخدم:</label>
                            <input
                              type="text"
                              className="cart-username-input"
                              value={editing.username || ''}
                              onChange={(e) => setEditingItems(prev => ({
                                ...prev,
                                [item.id]: { ...editing, username: e.target.value }
                              }))}
                              placeholder="أدخل اسم المستخدم"
                              required
                            />
                          </div>
                        )}
                        {item.is_username && item.price_per_1000 && (
                          <div className="cart-price-preview">
                            <span className="cart-price-preview-label">السعر:</span>
                            <span className="cart-price-preview-value">
                              {formatPrice(calculateItemPrice(item, editing.quantity)).value} {currency.symbol}
                            </span>
                          </div>
                        )}
                        <div className="cart-edit-buttons">
                          <button
                            onClick={() => handleSaveEdit(item)}
                            className="cart-save-button"
                            disabled={isPackageNeedingUsername && !editing.username?.trim()}
                          >
                            حفظ
                          </button>
                          <button
                            onClick={() => handleCancelEdit(item.id)}
                            className="cart-cancel-button"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Hide quantity controls for packages with username (quantity is fixed) */}
                        {!isPackageNeedingUsername && (
                          <div className="cart-quantity-controls">
                            <button
                              onClick={() => handleQuantityChange(item, item.quantity - 1)}
                              className="cart-quantity-button"
                            >
                              -
                            </button>
                            <span className="cart-quantity-value">
                              {(item.quantity || 0).toLocaleString('en-US')}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item, item.quantity + 1)}
                              className="cart-quantity-button"
                            >
                              +
                            </button>
                          </div>
                        )}
                        {/* Show quantity display only for packages with username */}
                        {isPackageNeedingUsername && (
                          <div className="cart-quantity-display">
                            <span className="cart-quantity-label">عدد المتابعين:</span>
                            <span className="cart-quantity-value">
                              {(item.followers_count || item.quantity || 0).toLocaleString('en-US')}
                            </span>
                          </div>
                        )}
                        {/* Show edit button for all items (to edit username for packages with is_username) */}
                        <button
                          onClick={() => handleEditItem(item)}
                          className="cart-edit-button"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleRemove(item)}
                          className="cart-remove-button"
                        >
                          حذف
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <div className="cart-summary-row">
            <span className="cart-summary-label">
              الإجمالي:
            </span>
            <div className="cart-summary-total">
              <span className="cart-summary-total-value">
                {formatPrice(totalPrice).value}
              </span>
              <span style={{ marginRight: '4px' }}>{currency.symbol}</span>
              {currency.code !== 'SAR' && (
                <span style={{ fontSize: '0.85em', marginRight: '4px', color: '#ABB3BA' }}>({currency.code})</span>
              )}
              <SaudiRiyalIcon width={18} height={19} />
            </div>
          </div>
          <div className="cart-summary-meta">
            <span className="cart-summary-count">
              عدد العناصر: {totalItems}
            </span>
            <div className="cart-summary-actions">
              <button
                className="cart-clear-button"
                onClick={handleClearAll}
              >
                تفريغ السلة
              </button>
              <button
                className="cart-checkout-button"
                onClick={() => {
                  if (items.length === 0) {
                    showToast('السلة فارغة', 'error');
                    return;
                  }
                  const token = localStorage.getItem('userToken');
                  if (!token) {
                    showToast('يجب تسجيل الدخول لإتمام الطلب', 'error');
                    return;
                  }
                  navigate('/checkout');
                }}
                disabled={items.length === 0}
                style={{
                  opacity: items.length === 0 ? 0.6 : 1,
                  cursor: items.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                إتمام الطلب
              </button>
            </div>
          </div>
        </div>

        <button 
          className="home-page-button home-page-button--full"
          onClick={goToHomePage}
        >
          العودة للصفحة الرئيسية
        </button>
      </div>
    </div>
    </>
  );
};

export default Cart;










