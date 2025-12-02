import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { IoIosHeartEmpty, IoIosHeart } from "react-icons/io";
import { PiShoppingBag } from "react-icons/pi";
import { useFavorites } from '../../contexts/FavoritesContext';
import { CiStar } from "react-icons/ci";
import SaudiRiyalIcon from '../SaudiRiyalIcon/SaudiRiyalIcon';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import './Verification.css';

const Verification = memo(() => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [selectedSort, setSelectedSort] = useState('ترتيب مقترحاتنا');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // يمكن تغييرها حسب حالة تسجيل الدخول
  const { addToCart } = useCart();
  const { isFav, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const reviewsSliderRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const handleFavoriteClick = () => {
    if (!isLoggedIn) {
      showToast('يرجى تسجيل الدخول للاستفادة من هذه الميزة', 'error');
      return;
    }
    // منطق إضافة للمفضلة هنا
  };
  
  const products = [
    {
      id: 1,
      title: 'توثيق حساب سناب شات',
      price: '100',
      category: 'سناب شات',
      icon: '👻',
      badge: '1★'
    },
    {
      id: 2,
      title: 'توثيق حساب انستقرام',
      price: '100',
      category: 'انستقرام',
      icon: '📷',
      badge: '1★'
    },
    {
      id: 3,
      title: 'توثيق حساب تيك توك',
      price: '100',
      category: 'تيك توك',
      icon: '🎵',
      badge: '1★'
    },
    {
      id: 4,
      title: 'توثيق حساب تويتر',
      price: '100',
      category: 'تويتر',
      icon: '🐦',
      badge: '1★'
    }
  ];

  // Function to get correct product count text
  const getProductCountText = (num) => {
    if (num === 0) return 'لا توجد منتجات';
    if (num === 1) return 'منتج واحد';
    if (num === 2) return 'منتجين';
    if (num >= 3 && num <= 10) return `${num} منتجات`;
    if (num > 10) return `${num} منتج`;
    
    return `${num} منتج`;
  };

  const reviews = [
    {
      id: 1,
      text: "خدمة توثيق ممتازة وسريعة",
      name: "سعد الغامدي",
      date: "03/08/2024",
      rating: 5,
      avatar: 'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png'
    },
    {
      id: 2,
      text: "تم توثيق حسابي بنجاح والخدمة رائعة",
      name: "ريم المطيري",
      date: "03/04/2024",
      rating: 5,
      avatar: 'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png'
    },
    {
      id: 3,
      text: "أفضل موقع لتوثيق الحسابات",
      name: "فهد الدوسري",
      date: "03/01/2024",
      rating: 5,
      avatar: 'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png'
    }
  ];

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll to review on mobile when index changes
  useEffect(() => {
    if (isMobile && reviewsSliderRef.current) {
      const slider = reviewsSliderRef.current;
      const cardWidth = slider.offsetWidth;
      slider.scrollTo({
        left: currentReviewIndex * cardWidth,
        behavior: 'smooth'
      });
    }
  }, [currentReviewIndex, isMobile]);

  // Slider navigation functions - optimized with useCallback
  const nextReview = useCallback(() => {
    setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
  }, [reviews.length]);

  const prevReview = useCallback(() => {
    setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  }, [reviews.length]);

  // Sort options
  const sortOptions = [
    'ترتيب مقترحاتنا',
    'الأحدث أولاً',
    'الأقدم أولاً',
    'الأقل سعراً',
    'الأعلى سعراً',
    'الأكثر شعبية'
  ];

  const handleSortSelect = useCallback((option) => {
    setSelectedSort(option);
    setIsDropdownOpen(false);
  }, []);

  return (
    <div className="verification">
      {/* Main Content */}
      <main className="verification__main">
        <div className="verification__container">
          <div className="verification__sub-nav">
            <div className="verification__dropdown-container">
              <button 
                className="verification__sort-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {selectedSort}
                <span className="verification__dropdown-arrow">
                  {isDropdownOpen ? '▲' : '▼'}
                </span>
              </button>
              
              {isDropdownOpen && (
                <div className="verification__dropdown-menu">
                  {sortOptions.map((option, index) => (
                    <button 
                      key={index}
                      className={`verification__dropdown-item ${option === selectedSort ? 'selected' : ''}`}
                      onClick={() => handleSortSelect(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="verification__counter">
              <span className="verification__counter-text">
                عرض {getProductCountText(products.length)}
              </span>
            </div>
          </div>
          
          <div className="verification__products">
            {products.map((product) => (
              <div key={product.id} className="verification__product-card">
                <div className="verification__product-header">
                  <div className="verification__product-image">
                    <img 
                      src="https://cdn.salla.sa/DQYwE/vknfwxMv9gXEyMCt5M6hCQOZIxj59EOlvKq8f2Gl.jpg"
                      alt={product.title}
                      className="verification__main-image"
                    />
                  </div>
                  <div className="verification__product-logo">
                    <span className="verification__product-logo-letter">Z</span>
                  </div>
                  <span className="verification__category-icon">{product.icon}</span>
                  <div className="verification__product-line"></div>
                  <h3 className="verification__product-subtitle">{product.category}</h3>
                  <span className="verification__badge">{product.badge}</span>
                </div>
                <div className="verification__product-content">
                  <h4 className="verification__product-title">{product.title}</h4>
                  <p className="verification__product-price" dir="rtl">
                    {product.price} <SaudiRiyalIcon width={12} height={13} />
                  </p>
                  <div className="verification__product-actions">
                    <button className="verification__favorite-btn" onClick={() => toggleFavorite(product.id)} aria-label={isFav(product.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}>
                      {isFav(product.id) ? <IoIosHeart color="#F7EC06" /> : <IoIosHeartEmpty />}
                    </button>
                    <button 
                      className="verification__add-to-cart"
                      onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        try {
                          await addToCart({
                            id: product.id,
                            package_id: product.id,
                            packageId: product.id,
                            type: 'service',
                            name: product.title,
                            price: parseFloat(product.price) || 0,
                            image: "https://cdn.salla.sa/DQYwE/vknfwxMv9gXEyMCt5M6hCQOZIxj59EOlvKq8f2Gl.jpg"
                          });
                          // success: no popup
                        } catch (error) {
                          showToast(error.message || 'حدث خطأ في إضافة المنتج للسلة', 'warning');
                        }
                      }}
                    >
                      <PiShoppingBag />
                      إضافة للسلة
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Customer Reviews Section */}
          <section className="verification__reviews">
            <div className="verification__reviews-header">
              <h3 className="verification__reviews-title">آراء العملاء</h3>
            </div>
            
            <div className="verification__reviews-container">
              <button 
                className="verification__slider-btn verification__slider-btn--prev"
                onClick={prevReview}
                aria-label="السابق"
              >
                ‹
              </button>
              
              <button 
                className="verification__slider-btn verification__slider-btn--next"
                onClick={nextReview}
                aria-label="التالي"
              >
                ›
              </button>
              
              <div className="verification__reviews-slider" ref={reviewsSliderRef}>
                <div 
                  className="verification__reviews-track"
                  style={{ transform: isMobile ? 'none' : `translateX(-${currentReviewIndex * 100}%)` }}
                >
                  <div className="verification__reviews-grid">
                    {reviews.map((review) => (
                      <div key={review.id} className="verification__review-card">
                        <div className="verification__review-header">
                          <div className="verification__review-rating">
                            <span className="verification__star"><CiStar /></span>
                            <span className="verification__rating-number">{review.rating}</span>
                          </div>
                          <div className="verification__reviewer">
                            <div className="verification__reviewer-info">
                              <h4 className="verification__reviewer-name">{review.name}</h4>
                              <span className="verification__reviewer-date">{review.date}</span>
                            </div>
                            <div className="verification__reviewer-avatar">
                              <img src={review.avatar} alt={review.name} />
                            </div>
                          </div>
                        </div>
                        
                        <div className="verification__review-content">
                          <div className="verification__quote-open">"</div>
                          <p className="verification__review-text">{review.text}</p>
                          <div className="verification__quote-close">"</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
});

Verification.displayName = 'Verification';

export default Verification;










