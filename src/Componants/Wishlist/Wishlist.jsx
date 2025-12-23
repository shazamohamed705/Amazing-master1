import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CiHeart } from "react-icons/ci";
import { IoIosHeart } from "react-icons/io";
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { apiClient } from '../../services/apiClient';
import SaudiRiyalIcon from '../SaudiRiyalIcon/SaudiRiyalIcon';
import './Wishlist.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://storage-te.com/backend/api/v1';

const Wishlist = () => {
  const navigate = useNavigate();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { currency, formatPrice } = useCurrency();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        setError(null);

        if (favoriteIds.size === 0) {
          setPackages([]);
          setLoading(false);
          return;
        }

        // Get package details for favorite IDs
        const packageIds = Array.from(favoriteIds);
        const promises = packageIds.map(id =>
          apiClient.get(`/packages/${id}`).catch(() => null)
        );

        const results = await Promise.all(promises);
        const validPackages = results.filter(pkg => pkg !== null);

        setPackages(validPackages);
      } catch (err) {
        console.error('Error loading favorites:', err);
        setError('حدث خطأ في تحميل الأمنيات');
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [favoriteIds]);

  const handleRemoveFavorite = async (pkgId) => {
    await toggleFavorite(pkgId);
    showToast('تم حذف المنتج من الأمنيات', 'info');
  };

  const handleAddToCart = async (pkg) => {
    try {
      await addToCart({
        id: pkg.id,
        package_id: pkg.id,
        type: 'package',
        name: pkg.name,
        price: pkg.price,
        image: pkg.image,
        quantity: pkg.followers_count || 1,
      });
      showToast('تمت إضافة المنتج للسلة', 'success');
    } catch (error) {
      showToast(error.message || 'حدث خطأ في إضافة المنتج للسلة', 'error');
    }
  };

  const goToHomePage = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="wishlist-page" dir="rtl">
        <div className="wishlist-container">
          <div className="wishlist-header">
            <h1 className="wishlist-title">الأمنيات</h1>
            <div className="wishlist-underline" />
          </div>
          <div className="wishlist-loading">
            <div className="loading-spinner"></div>
            <p>جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wishlist-page" dir="rtl">
        <div className="wishlist-container">
          <div className="wishlist-header">
            <h1 className="wishlist-title">الأمنيات</h1>
            <div className="wishlist-underline" />
          </div>
          <div className="wishlist-error">
            <p>{error}</p>
            <button onClick={goToHomePage} className="wishlist-back-btn">
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page" dir="rtl">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1 className="wishlist-title">الأمنيات</h1>
          <div className="wishlist-underline" />
          <p className="wishlist-subtitle">
            {packages.length === 0 ? 'لا توجد منتجات في الأمنيات' : `${packages.length} منتج في الأمنيات`}
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="wishlist-empty">
            <CiHeart className="wishlist-empty-icon" />
            <h3>قائمة الأمنيات فارغة</h3>
            <p>أضف المنتجات المفضلة لديك لتتمكن من مشاهدتها لاحقاً</p>
            <button onClick={goToHomePage} className="wishlist-shop-btn">
              تصفح المنتجات
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {packages.map((pkg) => (
              <div key={pkg.id} className="wishlist-item">
                <div className="wishlist-item-image">
                  <img
                    src={pkg.image || "https://cdn.salla.sa/DQYwE/40c6b05a-e635-47e1-87ea-ac765b6e3f40-400x500-QGuJ4XmWyyOvg1ZUcOmY28x7RGEIk9PLWpHWXHtd.jpg"}
                    alt={pkg.name}
                    onError={(e) => {
                      e.target.src = "https://cdn.salla.sa/DQYwE/40c6b05a-e635-47e1-87ea-ac765b6e3f40-400x500-QGuJ4XmWyyOvg1ZUcOmY28x7RGEIk9PLWpHWXHtd.jpg";
                    }}
                  />
                  <button
                    className="wishlist-item-remove"
                    onClick={() => handleRemoveFavorite(pkg.id)}
                    aria-label="إزالة من الأمنيات"
                  >
                    <IoIosHeart color="#F7EC06" />
                  </button>
                </div>
                <div className="wishlist-item-content">
                  <h3 className="wishlist-item-title">{pkg.name}</h3>
                  <p className="wishlist-item-price">
                    {formatPrice(pkg.price).value} {currency.symbol}
                    {currency.code !== 'SAR' && (
                      <span className="wishlist-price-secondary">
                        ({currency.code})
                      </span>
                    )}
                  </p>
                  {pkg.followers_count && (
                    <p className="wishlist-item-followers">
                      {pkg.followers_count} متابع
                    </p>
                  )}
                  <button
                    className="wishlist-item-add-cart"
                    onClick={() => handleAddToCart(pkg)}
                  >
                    إضافة للسلة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
