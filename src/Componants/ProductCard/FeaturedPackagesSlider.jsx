import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HiArrowSmallLeft, HiArrowSmallRight } from "react-icons/hi2";
import { CiShare2, CiHeart } from "react-icons/ci";
import { FaFacebookF } from "react-icons/fa";
import { FaFireAlt } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { IoMdLink } from "react-icons/io";
import { IoIosHeartEmpty, IoIosHeart } from "react-icons/io";
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { apiClient } from '../../services/apiClient';
import './FeaturedPackagesSlider.css';

const FeaturedPackagesSlider = () => {
  const { addToCart } = useCart();
  const { isFav, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const { currency, formatPrice } = useCurrency();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [usernames, setUsernames] = useState({}); // Store username for each package
  const sliderRef = useRef(null);
  const shareRefs = useRef({});
  const [openShareMenus, setOpenShareMenus] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Get visible cards based on screen size
  const getVisibleCards = useCallback(() => {
    const width = window.innerWidth;
    if (width > 1024) return 1;      // Desktop: 1 card (same as ProductCard)
    return 1;                        // Mobile: 1 card
  }, []);

  const [visible, setVisible] = useState(getVisibleCards);

  useEffect(() => {
    const handleResize = () => {
      setVisible(getVisibleCards());
      setCurrentIndex(0);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getVisibleCards]);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/follower-packages?per_page=10');
        if (response.success && response.data && response.data.length > 0) {
          const loadedPackages = response.data.map((pkg) => ({
            id: pkg.id,
            name: pkg.name,
            description: pkg.description || '',
            price: parseFloat(pkg.price) || 0,
            // Use package image if available, otherwise try related service image, then fall back to default
            image: pkg.image || pkg.service?.image || "https://cdn.salla.sa/DQYwE/40c6b05a-e635-47e1-87ea-ac765b6e3f40-400x500-QGuJ4XmWyyOvg1ZUcOmY28x7RGEIk9PLWpHWXHtd.jpg",
            slug: pkg.slug || null,
            is_username: pkg.is_username || false,
            followers_count: pkg.followers_count || 0,
          }));
          setPackages(loadedPackages);
          // Initialize usernames state
          const initialUsernames = {};
          loadedPackages.forEach(pkg => {
            if (pkg.is_username) {
              initialUsernames[pkg.id] = '';
            }
          });
          setUsernames(initialUsernames);
        }
      } catch (error) {
        console.error('Error loading packages:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPackages();
  }, []);

  // Close share menu when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      Object.keys(shareRefs.current).forEach(pkgId => {
        if (shareRefs.current[pkgId] && !shareRefs.current[pkgId].contains(e.target)) {
          setOpenShareMenus(prev => ({ ...prev, [pkgId]: false }));
        }
      });
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const maxIndex = Math.max(0, packages.length - visible);

  // Touch/Swipe handlers
  const minSwipeDistance = 50;

  const handleTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < maxIndex) {
      goToNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      goToPrev();
    }
  }, [touchStart, touchEnd, currentIndex, maxIndex]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  }, [maxIndex]);

  const handleShare = (pkgId, type) => {
    const url = window.location.href;
    const pkg = packages.find(p => p.id === pkgId);
    const text = encodeURIComponent(`شاهد هذه الباقة المميزة: ${pkg?.name || 'من Storage للخدمات التسويقية'}`);
    switch (type) {
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          setOpenShareMenus(prev => ({ ...prev, [pkgId]: false }));
        }).catch(() => {});
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent("باقة مميزة من Storage")}&body=${text}%20${encodeURIComponent(url)}`, '_blank');
        break;
      default:
        break;
    }
  };

  const handleAddToCart = async (pkg, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    try {
      // Validate username if required
      if (pkg.is_username && !usernames[pkg.id]?.trim()) {
        showToast('يرجى إدخال اسم المستخدم', 'error');
        return;
      }

      await addToCart({
        id: pkg.id,
        package_id: pkg.id,
        packageId: pkg.id,
        type: 'package',
        name: pkg.name,
        price: pkg.price,
        image: pkg.image,
        username: pkg.is_username ? usernames[pkg.id] : undefined,
        is_username: pkg.is_username || false,
        quantity: pkg.followers_count || 1, // Fixed quantity for packages
      });
      showToast('تمت الإضافة للسلة بنجاح', 'success');
    } catch (error) {
      showToast(error.message || 'حدث خطأ في إضافة الباقة للسلة', 'warning');
    }
  };

  const handleFavorite = async (pkgId, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    toggleFavorite(pkgId);
  };

  const handleUsernameChange = (pkgId, value) => {
    setUsernames(prev => ({
      ...prev,
      [pkgId]: value
    }));
  };

  if (loading) {
    return (
      <section className="featured-packages-section" dir="rtl">
        <div className="featured-packages-container">
          <div style={{ textAlign: 'center', padding: '3rem', color: 'white' }}>
            جاري التحميل...
          </div>
        </div>
      </section>
    );
  }

  if (packages.length === 0) {
    return null;
  }

  const currentPackage = packages[currentIndex];

  return (
    <section className="featured-packages-section" dir="rtl">
      <div className="featured-packages-container">
        <div className="featured-packages-header">
          <h2 className="featured-packages-title">خدمة مميزة</h2>
          <div className="featured-packages-underline" />
        </div>

        <div className="featured-packages-slider-wrapper">
          {packages.length > 1 && (
            <button
              className="featured-packages-nav-btn featured-packages-nav-btn--prev"
              onClick={goToPrev}
              disabled={currentIndex === 0}
              aria-label="السابق"
            >
              <HiArrowSmallRight />
            </button>
          )}

          <div
            className="featured-packages-slider"
            ref={sliderRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="featured-packages-card-wrapper">
              {/* اليمين: صورة الباقة */}
              <div className="featured-packages-card-image-wrapper">
                <img
                  src={currentPackage.image}
                  alt={currentPackage.name}
                  className="featured-packages-card-image"
                />
              </div>

              {/* اليسار: تفاصيل الباقة */}
              <div className="featured-packages-card-details">
                <h2 className="featured-packages-card-title">{currentPackage.name}</h2>
                <div className="featured-packages-underline" />

                <p className="featured-packages-card-price" dir="rtl">
                  {formatPrice(currentPackage.price).value} {currency.symbol}
                  {currency.code !== 'SAR' && (
                    <span style={{ fontSize: '0.75em', marginRight: '4px', color: '#ABB3BA' }}>({currency.code})</span>
                  )}
                </p>

                {currentPackage.followers_count > 0 && (
                  <p className="featured-packages-card-sold">
                    <FaFireAlt color="#F7EC06" /> {currentPackage.followers_count} متابع
                  </p>
                )}

                {currentPackage.description && (
                  <p className="featured-packages-card-description">
                    {currentPackage.description.replace(/<[^>]*>/g, '').trim()}
                  </p>
                )}

                {/* Username input if required */}
                {currentPackage.is_username && (
                  <div className="featured-packages-username-input">
                    <label htmlFor={`username-${currentPackage.id}`} className="featured-packages-input-label">
                      اسم المستخدم
                    </label>
                    <input
                      type="text"
                      id={`username-${currentPackage.id}`}
                      className="featured-packages-input"
                      placeholder="أدخل اسم المستخدم"
                      value={usernames[currentPackage.id] || ''}
                      onChange={(e) => handleUsernameChange(currentPackage.id, e.target.value)}
                    />
                  </div>
                )}

                <div className="featured-packages-card-actions">
                  <button 
                    className="featured-packages-card-add-to-cart" 
                    onClick={(e) => handleAddToCart(currentPackage, e)}
                    disabled={currentPackage.is_username && !usernames[currentPackage.id]?.trim()}
                  >
                    إضافة للسلة
                  </button>
                  <button 
                    className="featured-packages-card-heart-btn"
                    onClick={(e) => handleFavorite(currentPackage.id, e)}
                    aria-label={isFav(currentPackage.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                  >
                    {isFav(currentPackage.id) ? <IoIosHeart color="#F7EC06" /> : <CiHeart />}
                  </button>
                  <div 
                    className="featured-packages-card-share" 
                    ref={el => shareRefs.current[currentPackage.id] = el}
                  >
                    <button 
                      className="featured-packages-card-share-btn" 
                      onClick={() => setOpenShareMenus(prev => ({ ...prev, [currentPackage.id]: !prev[currentPackage.id] }))}
                      aria-haspopup="true" 
                      aria-expanded={openShareMenus[currentPackage.id]} 
                      aria-label="مشاركة"
                    >
                      <CiShare2 />
                    </button>
                    {openShareMenus[currentPackage.id] && (
                      <div className="featured-packages-card-share-menu" role="menu">
                        <button role="menuitem" className="share-item" onClick={() => handleShare(currentPackage.id, 'facebook')}>
                          <FaFacebookF />
                        </button>
                        <button role="menuitem" className="share-item" onClick={() => handleShare(currentPackage.id, 'twitter')}>
                          <FaXTwitter />
                        </button>
                        <button role="menuitem" className="share-item" onClick={() => handleShare(currentPackage.id, 'whatsapp')}>
                          <IoLogoWhatsapp />
                        </button>
                        <button role="menuitem" className="share-item" onClick={() => handleShare(currentPackage.id, 'email')}>
                          <MdEmail />
                        </button>
                        <button role="menuitem" className="share-item" onClick={() => handleShare(currentPackage.id, 'copy')}>
                          <IoMdLink />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {packages.length > 1 && (
            <button
              className="featured-packages-nav-btn featured-packages-nav-btn--next"
              onClick={goToNext}
              disabled={currentIndex >= maxIndex}
              aria-label="التالي"
            >
              <HiArrowSmallLeft />
            </button>
          )}
        </div>

        {packages.length > 1 && (
          <div className="featured-packages-progress">
            <div className="featured-packages-progress-track">
              <div
                className="featured-packages-progress-thumb"
                style={{
                  left: packages.length > 1
                    ? `${(currentIndex / (packages.length - 1)) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedPackagesSlider;
