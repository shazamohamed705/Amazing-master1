import React, { memo, useMemo, useState } from 'react';
import './PackageCard.css';
import { useCurrency } from '../../contexts/CurrencyContext';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80';

const PackageCard = memo(
  ({
    package: packageData,
    onAddToCart,
    showFavorite = false,
    isFavorite = false,
    onToggleFavorite,
  }) => {
    const { formatPrice, currency } = useCurrency();
    const [username, setUsername] = useState('');
    const [validationError, setValidationError] = useState('');
    const [adding, setAdding] = useState(false);
    const requiresUsername = Boolean(packageData?.is_username);

    const followersCount = useMemo(() => {
      return (
        packageData?.followers_count ||
        packageData?.target_followers ||
        packageData?.quantity ||
        null
      );
    }, [packageData]);

    const coverImage =
      packageData?.image || packageData?.cover_image || FALLBACK_IMAGE;

    const priceLabel = useMemo(() => {
      if (!packageData) {
        return formatPrice(0).value;
      }
      return formatPrice(Number(packageData.price) || 0).value;
    }, [packageData, formatPrice]);

    const handleAdd = async () => {
      if (typeof onAddToCart !== 'function' || !packageData) {
        return;
      }

      if (requiresUsername && !username.trim()) {
        setValidationError('يرجى إدخال اسم المستخدم للحساب قبل إضافة الطلب.');
        return;
      }
      setValidationError('');

      setAdding(true);
      try {
        await onAddToCart(
          packageData,
          requiresUsername ? username.trim() : null,
        );
        if (requiresUsername) {
          setUsername('');
          setValidationError('');
        }
      } catch (error) {
        console.error('Failed to add package to cart:', error);
      } finally {
        setAdding(false);
      }
    };

    const handleFavoriteClick = (event) => {
      event.stopPropagation();
      if (typeof onToggleFavorite === 'function' && packageData?.id) {
        onToggleFavorite(packageData.id);
      }
    };

    const title = packageData?.name || packageData?.title || 'باقة';
    const description =
      packageData?.description || packageData?.short_description || '';

    return (
      <article className="package-card" dir="rtl">
        <div className="package-card__media">
          {showFavorite && (
            <button
              type="button"
              className={`package-card__favorite ${
                isFavorite ? 'package-card__favorite--active' : ''
              }`}
              aria-pressed={isFavorite}
              onClick={handleFavoriteClick}
            >
              {isFavorite ? '♥' : '♡'}
            </button>
          )}
          <img src={coverImage} alt={title} loading="lazy" />
        </div>

        <div className="package-card__body">
          <div>
            <p className="package-card__eyebrow">
              {followersCount
                ? `${followersCount.toLocaleString()} متابع`
                : 'باقة مميزة'}
            </p>
            <h3 className="package-card__title">{title}</h3>
            {description && (
              <p className="package-card__description">{description}</p>
            )}
          </div>

          {requiresUsername && (
            <div className="package-card__field">
              <label htmlFor={`username-${packageData?.id}`}>
                اسم المستخدم المطلوب
              </label>
              <input
                id={`username-${packageData?.id}`}
                type="text"
                placeholder="@username"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  if (validationError) {
                    setValidationError('');
                  }
                }}
                disabled={adding}
              />
              {validationError && (
                <p className="package-card__error">{validationError}</p>
              )}
            </div>
          )}

          <div className="package-card__footer">
            <div className="package-card__price">
              <span>{priceLabel}</span>
              <span className="package-card__currency">
                {currency.symbol}
                {currency.code !== 'SAR' ? ` (${currency.code})` : ''}
              </span>
            </div>
            <button
              type="button"
              className="package-card__button"
              onClick={handleAdd}
              disabled={adding || (requiresUsername && !username.trim())}
            >
              {adding ? 'جارٍ الإضافة...' : 'أضف للسلة'}
            </button>
          </div>
        </div>
      </article>
    );
  },
);

PackageCard.displayName = 'PackageCard';

export default PackageCard;

