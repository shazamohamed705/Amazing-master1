import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { IoIosHeartEmpty, IoIosHeart } from "react-icons/io";
import { CiStar } from "react-icons/ci";
import { AiFillStar } from "react-icons/ai";
import { IoMdAdd } from "react-icons/io";
import SaudiRiyalIcon from '../SaudiRiyalIcon/SaudiRiyalIcon';
import './ServicePackages.css';

const ServicePackages = () => {
  const { slug } = useParams();
  const id = slug; // Support both slug and id
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { currency, formatPrice, getLocalizedPrice, getLocalizedPricePer1000 } = useCurrency();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [category, setCategory] = useState(null);
  const [packages, setPackages] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [articles, setArticles] = useState([]);
  const [related, setRelated] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', client_name: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [quantity, setQuantity] = useState(1000);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [isBuying, setIsBuying] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const raw = localStorage.getItem('favoritePackageIds');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [favSyncDisabled, setFavSyncDisabled] = useState(() => {
    try { return localStorage.getItem('favSyncDisabled') === '1'; } catch { return false; }
  });

  const API_BASE_URL = 'https://storage-te.com/backend/api/v1';

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/services/${slug || id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setService(data.data.service);
          setCategory(data.data.category || null);
          setPackages(data.data.packages || data.data.service?.follower_packages || []);
          setPortfolios(data.data.portfolios || data.data.service?.portfolios || []);
          setArticles(data.data.articles || data.data.service?.articles || []);
          setRelated(data.data.related || []);
          setStatistics(data.data.statistics || null);
          setReviews(data.data.reviews || []);
          setAverageRating(data.data.average_rating || 0);
          setReviewsCount(data.data.reviews_count || 0);
        } else {
          console.error('Error fetching service:', data.message);
        }
      } catch (error) {
        console.error('Error fetching service:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchService();
    }
  }, [id, slug]);

  // persist favorites locally
  useEffect(() => {
    try {
      localStorage.setItem('favoritePackageIds', JSON.stringify(Array.from(favoriteIds)));
    } catch {}
  }, [favoriteIds]);
  useEffect(() => {
    try { localStorage.setItem('favSyncDisabled', favSyncDisabled ? '1' : '0'); } catch {}
  }, [favSyncDisabled]);

  const isFav = (pkgId) => favoriteIds.has(pkgId);
  const toggleFavorite = async (pkgId) => {
    const token = (() => { try { return localStorage.getItem('userToken'); } catch { return null; } })();
    // if we've already detected server doesn't support fav endpoint, keep local only
    if (favSyncDisabled) {
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (next.has(pkgId)) next.delete(pkgId); else next.add(pkgId);
        return next;
      });
      return;
    }
    // optimistic
    const wasFav = favoriteIds.has(pkgId);
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(pkgId)) next.delete(pkgId); else next.add(pkgId);
      return next;
    });
    try {
      const commonHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      let response;
      if (!wasFav) {
        // ADD favorite
        response = await fetch(`${API_BASE_URL}/fav`, {
          method: 'POST',
          headers: commonHeaders,
          body: JSON.stringify({ package_id: pkgId })
        });
        if (response.status === 405) {
          response = await fetch(`${API_BASE_URL}/favorites`, {
            method: 'POST',
            headers: commonHeaders,
            body: JSON.stringify({ package_id: pkgId })
          });
        }
        if (response.status === 405) {
          response = await fetch(`${API_BASE_URL}/fav/${pkgId}`, {
            method: 'PUT',
            headers: commonHeaders,
            body: JSON.stringify({})
          });
        }
      } else {
        // REMOVE favorite
        response = await fetch(`${API_BASE_URL}/fav/${pkgId}`, {
          method: 'DELETE',
          headers: commonHeaders
        });
        if (response.status === 405 || response.status === 404) {
          // Try body-based delete
          response = await fetch(`${API_BASE_URL}/fav/delete`, {
            method: 'POST',
            headers: commonHeaders,
            body: JSON.stringify({ package_id: pkgId })
          });
        }
        if (response.status === 405 || response.status === 404) {
          // Try alternative collection path
          response = await fetch(`${API_BASE_URL}/favorites/${pkgId}`, {
            method: 'DELETE',
            headers: commonHeaders
          });
        }
      }
      // If backend clearly doesn't support (404/405), disable further sync attempts
      if (response.status === 404 || response.status === 405) {
        setFavSyncDisabled(true);
        return;
      }
      // If still not ok and it's an auth error, optionally revert; if not auth error keep optimistic
      if (!response.ok && (response.status === 401 || response.status === 403)) {
        // revert for auth failures
        setFavoriteIds(prev => {
          const next = new Set(prev);
          if (next.has(pkgId)) next.delete(pkgId); else next.add(pkgId);
          return next;
        });
        console.warn('[Favorite] Authorization required to sync favorites with server.');
      }
    } catch {
      // Network failure: keep optimistic, just log
      console.warn('[Favorite] Network error while syncing favorite. Kept local state.');
    }
  };

  // Calculate price based on quantity and localized prices
  useEffect(() => {
    if (!service) return;
    
    const currentPricePer1000 = getLocalizedPricePer1000(service) || service?.price_per_1000;
    const currentPrice = getLocalizedPrice(service) || service?.price;

    if (service?.is_username && currentPricePer1000 && quantity > 0) {
      let price = (quantity / 1000) * parseFloat(currentPricePer1000);
      // Minimum price of 50 if service requires username
      if (price < 50) {
        price = 50;
      }
      setCalculatedPrice(price);
    } else if (currentPrice) {
      let price = parseFloat(currentPrice) || 0;
      // Minimum price of 50 if service requires username
      if (service.is_username && price < 50) {
        price = 50;
      }
      setCalculatedPrice(price);
    }
  }, [quantity, service, getLocalizedPrice, getLocalizedPricePer1000]);

  const handleAddToCart = async (packageItem, customQuantity = null, customUsername = null) => {
    try {
      // Check if service requires username
      if (service?.is_username) {
        const checkUsername = customUsername !== null ? customUsername : username;
        if (!checkUsername || !checkUsername.trim()) {
          throw new Error('يرجى إدخال اسم المستخدم');
        }
      }
      
      // For packages, default quantity is 1, for services use customQuantity or state quantity
      let finalQuantity;
      if (packageItem) {
        // Packages always use quantity 1 (unless customQuantity is explicitly provided)
        finalQuantity = customQuantity !== null ? customQuantity : 1;
      } else {
        // Services use customQuantity or state quantity
        finalQuantity = customQuantity !== null ? customQuantity : quantity;
      }
      
      const finalUsername = customUsername !== null ? customUsername : username;
      
      // Use localized price if available, otherwise use package price or calculated price
      const currentPricePer1000 = getLocalizedPricePer1000(service) || service?.price_per_1000;
      const currentPrice = getLocalizedPrice(service) || service?.price;
      
      let finalPrice;
      if (packageItem) {
        // For packages, check if service requires username and calculate price accordingly
        if (service?.is_username && currentPricePer1000 && finalQuantity > 0) {
          // Calculate price based on quantity for username services with packages
          finalPrice = (finalQuantity / 1000) * parseFloat(currentPricePer1000);
          if (finalPrice < 50) {
            finalPrice = 50; // Minimum price
          }
        } else {
          // For regular packages, use package price
          finalPrice = parseFloat(packageItem.price) || 0;
        }
      } else if (service?.is_username && currentPricePer1000 && finalQuantity > 0) {
        // Calculate price based on quantity for username services
        finalPrice = (finalQuantity / 1000) * parseFloat(currentPricePer1000);
        if (finalPrice < 50) {
          finalPrice = 50; // Minimum price
        }
      } else {
        finalPrice = calculatedPrice || parseFloat(currentPrice || 0);
      }
      
      console.log('[ServicePackages] addToCart ->', {
        id: packageItem?.id || service?.id,
        packageId: packageItem?.id || service?.id,
        name: packageItem?.name || service?.name,
        quantity: finalQuantity,
        username: finalUsername,
        price: finalPrice,
        currency: currency.code,
        country: currency.country
      });
      
      await addToCart({
        id: packageItem?.id || service.id,
        package_id: packageItem?.id || service.id,
        packageId: packageItem?.id || service.id,
        type: packageItem ? 'package' : 'service',
        name: packageItem?.name || service.name,
        price: finalPrice,
        quantity: finalQuantity,
        username: finalUsername || undefined,
        image: service.image || packageItem?.image || "https://cdn.salla.sa/DQYwE/vknfwxMv9gXEyMCt5M6hCQOZIxj59EOlvKq8f2Gl.jpg",
        // Save service metadata for dynamic price calculation
        price_per_1000: currentPricePer1000 || null,
        is_username: service?.is_username || false,
        followers_count: packageItem?.followers_count || packageItem?.target_followers || null,
      });
      
      showToast('تمت الإضافة للسلة بنجاح', 'success');
      console.log('[ServicePackages] addToCart success');
    } catch (error) {
      showToast(error.message || 'حدث خطأ في إضافة الباقة للسلة', 'warning');
    }
  };

  const handleFavoriteClick = (pkg) => {
    // يمكن السماح بالمفضلة بدون تسجيل أو تفعيل الشرط حسب الحاجة
    if (!pkg?.id) return;
    toggleFavorite(pkg.id);
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleBuyNow = async () => {
    if (isBuying) return; // Prevent multiple clicks
    
    try {
      setIsBuying(true);
      
      if (service.is_username) {
        if (!username.trim()) {
          showToast('يرجى إدخال اسم المستخدم', 'error');
          setIsBuying(false);
          return;
        }
        if (quantity <= 0) {
          showToast('يرجى إدخال عدد صحيح', 'error');
          setIsBuying(false);
          return;
        }
        await handleAddToCart(null, quantity, username);
      } else {
        if (packages.length > 0) {
          await handleAddToCart(packages[0]);
        } else {
          await handleAddToCart(null);
        }
      }
      
      // Wait a bit to ensure cart is updated, then navigate
      setTimeout(() => {
        navigate('/checkout');
        setIsBuying(false);
      }, 200);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('حدث خطأ أثناء إضافة المنتج للسلة', 'error');
      setIsBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="service-packages-page" dir="ltr">
        <div className="service-packages-container">
          <div style={{ textAlign: 'center', padding: '3rem', color: 'white' }}>
            جاري التحميل...
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="service-packages-page" dir="ltr">
        <div className="service-packages-container">
          <div style={{ textAlign: 'center', padding: '3rem', color: 'white' }}>
            الخدمة غير موجودة
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="service-packages-page" dir="rtl">
      <div className="service-packages-container">
        {/* Service Hero Section */}
        <div className="service-hero-section">
          {/* Service Image */}
          {service.image && (
            <div className="service-hero-image">
              <img src={service.image} alt={service.name} />
            </div>
          )}
          
          <div className="service-hero-content">
            {/* Service Details Box - Combined */}
            <div className="service-details-box">
              {/* Rating at top */}
              <div className="service-rating-top">
                {averageRating > 0 ? (
                  <div className="service-rating-badge-small">
                    <span className="service-rating-stars-small">
                      {[...Array(5)].map((_, i) => (
                        i < Math.round(averageRating) ? (
                          <AiFillStar key={i} color="#F7EC06" />
                        ) : (
                          <CiStar key={i} color="#F7EC06" />
                        )
                      ))}
                    </span>
                    <span className="service-rating-value-small">{averageRating}</span>
                    <span className="service-rating-count-small">({reviewsCount} تقييم)</span>
                  </div>
                ) : (
                  <div className="service-rating-badge-small">
                    <span className="service-rating-stars-small">
                      {[...Array(5)].map((_, i) => (
                        <CiStar key={i} color="#F7EC06" />
                      ))}
                    </span>
                    <span className="service-rating-count-small">(لا توجد تقييمات)</span>
                  </div>
                )}
                <button
                  className="service-add-review-btn-top"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  title={showReviewForm ? 'إلغاء' : 'إضافة تقييم'}
                >
                  {showReviewForm ? <span>✕</span> : <IoMdAdd />}
                </button>
              </div>

              {/* Review Form - Show in top section */}
              {showReviewForm && (
                <div className="service-packages-review-form-top">
                  <div className="service-packages-review-form-rating-row">
                    <div className="service-packages-review-form-stars">
                      <label>التقييم:</label>
                      <div className="service-packages-review-stars-selector">
                        {[...Array(5)].map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            className="service-packages-star-btn"
                            onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}
                            aria-label={`تقييم ${i + 1} من 5`}
                          >
                            {i < reviewForm.rating ? (
                              <AiFillStar color="#F7EC06" />
                            ) : (
                              <CiStar color="#F7EC06" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="service-packages-review-form-comment-inline">
                      <label>التعليق:</label>
                      <input
                        type="text"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        placeholder="اكتب تعليقك هنا..."
                        className="service-packages-review-comment-input"
                      />
                    </div>
                  </div>
                  <div className="service-packages-review-form-group">
                    <label>الاسم</label>
                    <input
                      type="text"
                      value={reviewForm.client_name}
                      onChange={(e) => setReviewForm({ ...reviewForm, client_name: e.target.value })}
                      placeholder="اسمك"
                    />
                  </div>
                  <button
                    className="service-packages-submit-review-btn"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('userToken');
                        const response = await fetch(`${API_BASE_URL}/service-reviews`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                          },
                          body: JSON.stringify({
                            service_id: service.id,
                            rating: reviewForm.rating,
                            comment: reviewForm.comment,
                            client_name: reviewForm.client_name,
                          })
                        });
                        const data = await response.json();
                        if (response.ok && data.success) {
                          showToast('تم إضافة التقييم بنجاح، سيتم مراجعته قبل النشر', 'success');
                          setShowReviewForm(false);
                          setReviewForm({ rating: 5, comment: '', client_name: '' });
                          // Refresh reviews
                          const serviceResponse = await fetch(`${API_BASE_URL}/services/${slug || id}`);
                          const serviceData = await serviceResponse.json();
                          if (serviceResponse.ok && serviceData.success) {
                            setReviews(serviceData.data.reviews || []);
                            setAverageRating(serviceData.data.average_rating || 0);
                            setReviewsCount(serviceData.data.reviews_count || 0);
                          }
                        } else {
                          showToast(data.message || 'حدث خطأ في إضافة التقييم', 'error');
                        }
                      } catch (error) {
                        showToast('حدث خطأ في إضافة التقييم', 'error');
                      }
                    }}
                  >
                    إرسال التقييم
                  </button>
                </div>
              )}

              <div className="service-hero-header-row">
                <h1 className="service-hero-title">{service.name}</h1>
                
                {/* Price */}
                <div className="service-price-inline">
                  <span className="service-price-value">
                    {service.is_username && quantity > 0 
                      ? formatPrice(calculatedPrice).value
                      : formatPrice(packages.length > 0 ? packages[0].price : getLocalizedPrice(service)).value
                    }
                  </span>
                  <span style={{ marginRight: '4px' }}>{currency.symbol}</span>
                  {currency.code !== 'SAR' && (
                    <span style={{ fontSize: '0.75em', color: '#ABB3BA', marginRight: '4px' }}>({currency.code})</span>
                  )}
                </div>
              </div>
              
              {/* Short Description */}
              {service.short_description && (
                <p className="service-hero-description">{service.short_description}</p>
              )}

              {/* Username and Quantity Inputs - Inside the box */}
              {service.is_username && (
                <div className="service-inputs-in-box">
                  <div className="service-input-group">
                    <label htmlFor="username" className="service-input-label">
                      اسم المستخدم <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="username"
                      className="service-input"
                      placeholder="أدخل اسم المستخدم"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="service-input-group">
                    <label htmlFor="quantity" className="service-input-label">
                      العدد المطلوب <span className="text-danger">*</span>
                    </label>
                    <div className="service-quantity-input-wrapper">
                      <input
                        type="number"
                        id="quantity"
                        className="service-input service-quantity-input"
                        placeholder="1000"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setQuantity(val > 0 ? val : 1000);
                        }}
                        min="1"
                        step="100"
                        required
                      />
                      <span className="service-quantity-hint">متابع</span>
                    </div>
                    {(getLocalizedPricePer1000(service) || service.price_per_1000) && (
                      <p className="service-price-hint">
                        السعر لكل 1000: {getLocalizedPricePer1000(service) || service.price_per_1000} {currency.symbol}
                        {service.is_username && (
                          <span className="service-min-price-note"> (الحد الأدنى: 50 {currency.symbol})</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Long Description - Limited */}
              {service.description && (
                <div className="service-description-in-box">
                  <h3 className="service-description-title">تفاصيل الخدمة</h3>
                  <div className="service-packages-long-description" dangerouslySetInnerHTML={{ __html: service.description }} />
                </div>
              )}
            </div>

          </div>
        </div>


        {/* Packages Section */}
        <div className="service-packages-section">
          <h2 className="service-packages-section-title">الباقات المتاحة</h2>
          <div className={`service-packages-grid ${(packages.length === 0 || packages.length === 1) ? 'service-packages-grid--single' : ''}`}>
            {packages.length > 0 ? (
              packages.map((pkg) => (
                <div key={pkg.id} className="service-packages-card">
                  <div className="service-packages-card-header">
                    <div className="service-packages-card-image">
                      <img
                        src={pkg.image || service.image || "https://cdn.salla.sa/DQYwE/vknfwxMv9gXEyMCt5M6hCQOZIxj59EOlvKq8f2Gl.jpg"}
                        alt={pkg.name || service.name}
                        className="service-packages-main-image"
                      />
                    </div>
                  </div>
                  <div className="service-packages-card-content">
                    <h4 className="service-packages-card-title">{pkg.name || service.name}</h4>
                    {(pkg.description || service.short_description) && (
                      <p className="service-packages-card-description-text">
                        {pkg.description || service.short_description}
                      </p>
                    )}
                    <p className="service-packages-card-price" dir="ltr">
                      {formatPrice(pkg.price || getLocalizedPrice(service)).value} {currency.symbol}
                      {currency.code !== 'SAR' && (
                        <span style={{ fontSize: '0.85em', marginRight: '4px' }}> ({currency.code})</span>
                      )}
                    </p>
                    <div className="service-packages-card-actions">
                      <button
                        className="service-packages-card-button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          try {
                            // Check if service requires username
                            if (service?.is_username && !username.trim()) {
                              showToast('يرجى إدخال اسم المستخدم أولاً', 'error');
                              return;
                            }
                            await handleAddToCart(pkg, 1, username.trim() || null);
                          } catch (error) {
                            console.error('[Card] addToCart error:', error);
                            // Error toast is already shown in handleAddToCart
                          }
                        }}
                        disabled={service?.is_username && !username.trim()}
                      >
                        إضافة للسلة
                      </button>
                      <button 
                        className="service-packages-favorite-btn" 
                        onClick={() => handleFavoriteClick(pkg)}
                        aria-label={isFav(pkg.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                      >
                        {isFav(pkg.id) ? <IoIosHeart color="#F7EC06" /> : <IoIosHeartEmpty />}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="service-packages-card">
                <div className="service-packages-card-header">
                  <div className="service-packages-card-image">
                    <img
                      src="https://cdn.salla.sa/DQYwE/vknfwxMv9gXEyMCt5M6hCQOZIxj59EOlvKq8f2Gl.jpg"
                      alt={service.name}
                      className="service-packages-main-image"
                    />
                  </div>
                </div>
                  <div className="service-packages-card-content">
                    <h4 className="service-packages-card-title">{service.name}</h4>
                    {service.short_description && (
                      <p className="service-packages-card-description-text">{service.short_description}</p>
                    )}
                  <p className="service-packages-card-price" dir="ltr">
                    {formatPrice(getLocalizedPrice(service) || service.price).value} {currency.symbol}
                    {currency.code !== 'SAR' && (
                      <span style={{ fontSize: '0.85em', marginRight: '4px' }}> ({currency.code})</span>
                    )}
                  </p>
                  <div className="service-packages-card-actions">
                    <button
                      className="service-packages-card-button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        try {
                          // Check if service requires username
                          if (service?.is_username && !username.trim()) {
                            showToast('يرجى إدخال اسم المستخدم أولاً', 'error');
                            return;
                          }
                          await handleAddToCart({
                            id: service.id,
                            package_id: service.id,
                            packageId: service.id,
                            type: 'package',
                            name: service.name,
                            price: parseFloat(getLocalizedPrice(service) || service.price) || 0,
                            image: "https://cdn.salla.sa/DQYwE/vknfwxMv9gXEyMCt5M6hCQOZIxj59EOlvKq8f2Gl.jpg"
                          }, 1, username.trim() || null);
                        } catch (error) {
                          console.error('[Card] addToCart error:', error);
                          // Error toast is already shown in handleAddToCart
                        }
                      }}
                      disabled={service?.is_username && !username.trim()}
                    >
                      إضافة للسلة
                    </button>
                    <button 
                      className="service-packages-favorite-btn" 
                      onClick={() => handleFavoriteClick(service)}
                      aria-label={isFav(service.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                    >
                      {isFav(service.id) ? <IoIosHeart color="#F7EC06" /> : <IoIosHeartEmpty />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Portfolios Section */}
        {portfolios.length > 0 && (
          <div className="service-packages-section">
            <h2 className="service-packages-section-title">سابقة الأعمال</h2>
            <div className="service-packages-grid">
              {portfolios.map((portfolio) => (
                <div key={portfolio.id} className="service-packages-card">
                  <div className="service-packages-card-header">
                    <div className="service-packages-card-image">
                      <img
                        src={portfolio.image || "https://cdn.salla.sa/DQYwE/vknfwxMv9gXEyMCt5M6hCQOZIxj59EOlvKq8f2Gl.jpg"}
                        alt={portfolio.title}
                        className="service-packages-main-image"
                      />
                    </div>
                  </div>
                  <div className="service-packages-card-content">
                    <h4 className="service-packages-card-title">{portfolio.title}</h4>
                    {portfolio.content && (
                      <p className="service-packages-card-description-text" dangerouslySetInnerHTML={{ __html: portfolio.content.substring(0, 100) + '...' }} />
                    )}
                    <div className="service-packages-card-actions">
                      <Link
                        to={`/portfolio/${portfolio.slug || portfolio.id}`}
                        className="service-packages-card-button"
                        style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}
                      >
                        عرض المشروع
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Articles Section */}
        {articles.length > 0 && (
          <div className="service-packages-section">
            <h2 className="service-packages-section-title">المقالات</h2>
            <div className="service-packages-grid">
              {articles.map((article) => (
                <div key={article.id} className="service-packages-card">
                  <div className="service-packages-card-header">
                    <div className="service-packages-card-image">
                      <img
                        src={article.image || "https://cdn.salla.sa/DQYwE/vknfwxMv9gXEyMCt5M6hCQOZIxj59EOlvKq8f2Gl.jpg"}
                        alt={article.title}
                        className="service-packages-main-image"
                      />
                    </div>
                  </div>
                  <div className="service-packages-card-content">
                    <h4 className="service-packages-card-title">{article.title}</h4>
                    {article.content && (
                      <p className="service-packages-card-description-text" dangerouslySetInnerHTML={{ __html: article.content.substring(0, 100) + '...' }} />
                    )}
                    <div className="service-packages-card-actions">
                      <Link
                        to={`/blog/${article.slug || article.id}`}
                        className="service-packages-card-button"
                        style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}
                      >
                        قراءة المقال
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="service-packages-section">
          <div className="service-packages-reviews-header">
            <h2 className="service-packages-section-title">التقييمات</h2>
            {averageRating > 0 && (
              <div className="service-packages-rating-summary">
                <span className="service-packages-rating-value">{averageRating}</span>
                <span className="service-packages-rating-stars">
                  {[...Array(5)].map((_, i) => (
                    i < Math.round(averageRating) ? (
                      <AiFillStar key={i} color="#F7EC06" />
                    ) : (
                      <CiStar key={i} color="#F7EC06" />
                    )
                  ))}
                </span>
                <span className="service-packages-rating-count">({reviewsCount} تقييم)</span>
              </div>
            )}
          </div>

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="service-packages-reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="service-packages-review-item">
                  <div className="service-packages-review-header">
                    <div className="service-packages-review-author">
                      <strong>{review.client_name || review.user?.name || 'مستخدم'}</strong>
                      <div className="service-packages-review-rating">
                        {[...Array(5)].map((_, i) => (
                          i < review.rating ? (
                            <AiFillStar key={i} color="#F7EC06" />
                          ) : (
                            <CiStar key={i} color="#F7EC06" />
                          )
                        ))}
                      </div>
                    </div>
                    <span className="service-packages-review-date">
                      {new Date(review.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="service-packages-review-comment">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="service-packages-no-reviews">لا توجد تقييمات بعد</p>
          )}
        </div>

        {/* Related Services */}
        {related.length > 0 && (
          <div className="service-packages-section">
            <h2 className="service-packages-section-title">خدمات ذات صلة</h2>
            <div className="service-packages-grid">
              {related.map((relatedService) => (
                <div key={relatedService.id} className="service-packages-card">
                  <div className="service-packages-card-header">
                    <div className="service-packages-card-image">
                      <img
                        src="https://cdn.salla.sa/DQYwE/vknfwxMv9gXEyMCt5M6hCQOZIxj59EOlvKq8f2Gl.jpg"
                        alt={relatedService.name}
                        className="service-packages-main-image"
                      />
                    </div>
                  </div>
                  <div className="service-packages-card-content">
                    <h4 className="service-packages-card-title">{relatedService.name}</h4>
                    {(relatedService.short_description || relatedService.description) && (
                      <p className="service-packages-card-description-text">
                        {relatedService.short_description || relatedService.description}
                      </p>
                    )}
                    <p className="service-packages-card-price" dir="ltr">
                      {formatPrice(getLocalizedPrice(relatedService) || relatedService.price).value} {currency.symbol}
                      {currency.code !== 'SAR' && (
                        <span style={{ fontSize: '0.85em', marginRight: '4px' }}> ({currency.code})</span>
                      )}
                    </p>
                    <div className="service-packages-card-actions">
                      <Link
                        to={relatedService.slug ? `/service/${relatedService.slug}` : `/service/${relatedService.id}`}
                        className="service-packages-card-button"
                        style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}
                      >
                        عرض الباقات
                      </Link>
                      <button 
                        className="service-packages-favorite-btn" 
                        onClick={() => handleFavoriteClick(relatedService)}
                        aria-label={isFav(relatedService.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                      >
                        {isFav(relatedService.id) ? <IoIosHeart color="#F7EC06" /> : <IoIosHeartEmpty />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment Bar - Fixed at bottom */}
      {service && (
        <div className="service-packages-payment-bar">
          <div className="service-packages-payment-bar-content">
            {/* Right side: Service name and quantity controls */}
            <div className="service-packages-payment-right">
              <div className="service-packages-payment-description">
                {service.name}
              </div>
              <div className="service-packages-quantity-price">
                <div className="service-packages-price-display">
                  <SaudiRiyalIcon width={14} height={15} />
                  <span>
                    {service.is_username && quantity > 0
                      ? formatPrice(calculatedPrice).value
                      : formatPrice(packages.length > 0 ? packages[0].price : getLocalizedPrice(service)).value
                    }
                  </span>
                </div>
                <button 
                  className="service-packages-quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <div className="service-packages-quantity-separator"></div>
                <span className="service-packages-quantity-value">{quantity}</span>
                <div className="service-packages-quantity-separator"></div>
                <button 
                  className="service-packages-quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Left side: Action buttons */}
            <div className="service-packages-payment-left">
              <button
                className="service-packages-add-to-cart-bar-btn"
                onClick={async () => {
                  try {
                    if (service.is_username) {
                      if (!username.trim()) {
                        showToast('يرجى إدخال اسم المستخدم', 'error');
                        return;
                      }
                      if (quantity <= 0) {
                        showToast('يرجى إدخال عدد صحيح', 'error');
                        return;
                      }
                      await handleAddToCart(null, quantity, username);
                    } else {
                      if (packages.length > 0) {
                        await handleAddToCart(packages[0]);
                      } else {
                        await handleAddToCart(null);
                      }
                    }
                  } catch (error) {
                    console.error('[PaymentBar] addToCart error:', error);
                    // Error toast is already shown in handleAddToCart
                  }
                }}
                disabled={service.is_username && (!username.trim() || quantity <= 0)}
              >
                إضافة للسلة
              </button>
              <button
                className="service-packages-buy-now-btn"
                onClick={handleBuyNow}
                disabled={(service.is_username && (!username.trim() || quantity <= 0)) || isBuying}
              >
                {isBuying ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="spinner" style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid rgba(247, 236, 6, 0.3)', 
                      borderTop: '2px solid #F7EC06', 
                      borderRadius: '50%', 
                      animation: 'spin 0.8s linear infinite',
                      display: 'inline-block'
                    }}></span>
                    جاري التحميل...
                  </span>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M29 12h-26c-0.668-0.008-1.284-0.226-1.787-0.59l0.009 0.006c-0.744-0.552-1.222-1.428-1.222-2.416 0-1.657 1.343-3 2.999-3h6c0.552 0 1 0.448 1 1s-0.448 1-1 1v0h-6c-0.552 0-1 0.448-1 1 0 0.326 0.156 0.616 0.397 0.798l0.002 0.002c0.167 0.12 0.374 0.194 0.599 0.2l0.001 0h26c0.552 0 1 0.448 1 1s-0.448 1-1 1v0zM27 12c-0.552 0-1-0.448-1-1v0-3h-3c-0.552 0-1-0.448-1-1s0.448-1 1-1v0h4c0.552 0 1 0.448 1 1v0 4c0 0.552-0.448 1-1 1v0zM29 30h-26c-1.657 0-3-1.343-3-3v0-18c0-0.552 0.448-1 1-1s1 0.448 1 1v0 18c0 0.552 0.448 1 1 1v0h25v-5c0-0.552 0.448-1 1-1s1 0.448 1 1v0 6c0 0.552-0.448 1-1 1v0zM29 18c-0.552 0-1-0.448-1-1v0-6c0-0.552 0.448-1 1-1s1 0.448 1 1v0 6c0 0.552-0.448 1-1 1v0zM31 24h-7c-2.209 0-4-1.791-4-4s1.791-4 4-4v0h7c0.552 0 1 0.448 1 1v0 6c0 0.552-0.448 1-1 1v0zM24 18c-1.105 0-2 0.895-2 2s0.895 2 2 2v0h6v-4zM25 12c-0.001 0-0.001 0-0.002 0-0.389 0-0.726-0.222-0.891-0.546l-0.003-0.006-3.552-7.106-2.306 1.152c-0.13 0.066-0.284 0.105-0.447 0.105-0.552 0-1-0.448-1-1 0-0.39 0.223-0.727 0.548-0.892l0.006-0.003 3.2-1.6c0.13-0.067 0.284-0.106 0.447-0.106 0.39 0 0.727 0.223 0.892 0.548l0.003 0.006 4 8c0.067 0.13 0.106 0.285 0.106 0.448 0 0.552-0.448 1-1 1v0zM21 12c-0.001 0-0.001 0-0.002 0-0.389 0-0.726-0.222-0.891-0.546l-0.003-0.006-3.552-7.106-15.104 7.552c-0.13 0.066-0.284 0.105-0.447 0.105-0.552 0-1-0.448-1-1 0-0.39 0.223-0.727 0.548-0.892l0.006-0.003 16-8c0.13-0.067 0.284-0.106 0.447-0.106 0.39 0 0.727 0.223 0.892 0.548l0.003 0.006 4 8c0.067 0.13 0.106 0.285 0.106 0.448 0 0.552-0.448 1-1 1-0.001 0-0.001 0-0.002 0h0z" fill="currentColor"/>
                    </svg>
                    اشترِي  الآن
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePackages;

