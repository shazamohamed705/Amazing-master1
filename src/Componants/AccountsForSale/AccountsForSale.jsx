import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import { IoIosHeartEmpty } from "react-icons/io";
import { PiShoppingBag } from "react-icons/pi";
import { CiStar } from "react-icons/ci";
import { useToast } from '../../contexts/ToastContext';
import SaudiRiyalIcon from '../SaudiRiyalIcon/SaudiRiyalIcon';
import './AccountsForSale.css';

const AccountsForSale = memo(() => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [selectedSort, setSelectedSort] = useState('ترتيب مقترحاتنا');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // يمكن تغييرها حسب حالة تسجيل الدخول
  const containerRef = useRef(null);
  const reviewsSliderRef = useRef(null);
  const { showToast } = useToast();
  
  // Function to center the page content
  const centerPageContent = () => {
    // Get the main accounts-for-sale element
    const accountsForSaleElement = document.querySelector('.accounts-for-sale');
    if (accountsForSaleElement) {
      accountsForSaleElement.style.marginLeft = 'auto';
      accountsForSaleElement.style.marginRight = 'auto';
      accountsForSaleElement.style.display = 'flex';
      accountsForSaleElement.style.justifyContent = 'center';
      accountsForSaleElement.style.width = '100%';
    }
    
    if (containerRef.current) {
      const container = containerRef.current;
      const pageWidth = window.innerWidth;
      const containerWidth = container.offsetWidth;
      
      // Force center the container
      container.style.marginLeft = 'auto';
      container.style.marginRight = 'auto';
      container.style.display = 'block';
      container.style.maxWidth = '1200px';
      container.style.width = '100%';
      
      // Center all child elements
      const mainElement = container.closest('.accounts-for-sale__main') || container.parentElement;
      if (mainElement && mainElement.classList.contains('accounts-for-sale__main')) {
        mainElement.style.marginLeft = 'auto';
        mainElement.style.marginRight = 'auto';
        mainElement.style.display = 'block';
        mainElement.style.width = '100%';
      }
    }
  };
  
  useEffect(() => {
    // Center content immediately on mount
    const timer = setTimeout(() => {
      centerPageContent();
    }, 0);
    
    // Also center after a short delay to ensure DOM is ready
    const timer2 = setTimeout(() => {
      centerPageContent();
    }, 100);
    
    // Center content on window resize
    const handleResize = () => {
      centerPageContent();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Use MutationObserver to watch for DOM changes
    const observer = new MutationObserver(() => {
      centerPageContent();
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }
    
    // Also observe the main accounts-for-sale element
    const mainElement = document.querySelector('.accounts-for-sale');
    if (mainElement) {
      observer.observe(mainElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);
  
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
      title: 'حسابات سناب شات للبيع',
      price: 80,
      originalPrice: 100,
      discountPercentage: 20,
      savings: 20,
      hasDiscount: true,
      category: 'سناب شات',
      icon: '👻',
      badge: '1★'
    },
    {
      id: 2,
      title: 'حسابات انستقرام للبيع',
      price: 100,
      originalPrice: null,
      discountPercentage: null,
      savings: null,
      hasDiscount: false,
      category: 'انستقرام',
      icon: '📷',
      badge: '1★'
    },
    {
      id: 3,
      title: 'حسابات تيك توك للبيع',
      price: 75,
      originalPrice: 100,
      discountPercentage: 25,
      savings: 25,
      hasDiscount: true,
      category: 'تيك توك',
      icon: '🎵',
      badge: '1★'
    },
    {
      id: 4,
      title: 'حسابات تويتر للبيع',
      price: 100,
      originalPrice: null,
      discountPercentage: null,
      savings: null,
      hasDiscount: false,
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
      text: "حسابات موثوقة وبأسعار مناسبة",
      name: "فيصل الدوسري",
      date: "03/01/2024",
      rating: 5,
      avatar: 'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png'
    },
    {
      id: 2,
      text: "خدمة ممتازة وحسابات ذات جودة عالية",
      name: "منى العتيبي",
      date: "02/26/2024",
      rating: 5,
      avatar: 'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png'
    },
    {
      id: 3,
      text: "أفضل موقع لشراء الحسابات",
      name: "طلال القحطاني",
      date: "02/20/2024",
      rating: 5,
      avatar: 'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png'
    }
  ];

  // Slider navigation functions
  const nextReview = useCallback(() => {
    setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
  }, [reviews.length]);

  const prevReview = useCallback(() => {
    setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  }, [reviews.length]);

  // Touch swipe support for mobile
  useEffect(() => {
    const slider = reviewsSliderRef.current;
    if (!slider) return;
    
    let startX = 0;
    let startY = 0;
    let isSwiping = false;
    
    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isSwiping = true;
    };
    
    const handleTouchMove = (e) => {
      if (!isSwiping) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = Math.abs(currentX - startX);
      const diffY = Math.abs(currentY - startY);
      
      // Only allow horizontal swipe if horizontal movement is greater
      if (diffX > diffY && diffX > 10) {
        e.preventDefault();
      }
    };
    
    const handleTouchEnd = (e) => {
      if (!isSwiping) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX;
      const diffY = Math.abs(endY - startY);
      
      // Minimum swipe distance and horizontal swipe only
      if (Math.abs(diffX) > 50 && Math.abs(diffX) > diffY) {
        if (diffX > 0) {
          prevReview();
        } else {
          nextReview();
        }
      }
      
      isSwiping = false;
    };
    
    slider.addEventListener('touchstart', handleTouchStart, { passive: true });
    slider.addEventListener('touchmove', handleTouchMove, { passive: false });
    slider.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      slider.removeEventListener('touchstart', handleTouchStart);
      slider.removeEventListener('touchmove', handleTouchMove);
      slider.removeEventListener('touchend', handleTouchEnd);
    };
  }, [nextReview, prevReview]);

  // Sort options
  const sortOptions = [
    'ترتيب مقترحاتنا',
    'الأحدث أولاً',
    'الأقدم أولاً',
    'الأقل سعراً',
    'الأعلى سعراً',
    'الأكثر شعبية'
  ];

  const handleSortSelect = (option) => {
    setSelectedSort(option);
    setIsDropdownOpen(false);
  };

  return (
    <div className="accounts-for-sale" style={{ margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
      {/* Main Content */}
      <main className="accounts-for-sale__main" style={{ width: '100%', margin: '0 auto' }}>
        <div className="accounts-for-sale__container" ref={containerRef} style={{ margin: '0 auto', width: '100%', maxWidth: '1200px' }}>
          <div className="accounts-for-sale__sub-nav">
            <div className="accounts-for-sale__dropdown-container">
              <button 
                className="accounts-for-sale__sort-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {selectedSort}
                <span className="accounts-for-sale__dropdown-arrow">
                  {isDropdownOpen ? '▲' : '▼'}
                </span>
              </button>
              
              {isDropdownOpen && (
                <div className="accounts-for-sale__dropdown-menu">
                  {sortOptions.map((option, index) => (
                    <button 
                      key={index}
                      className={`accounts-for-sale__dropdown-item ${option === selectedSort ? 'selected' : ''}`}
                      onClick={() => handleSortSelect(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="accounts-for-sale__counter">
              <span className="accounts-for-sale__counter-text">
                عرض {getProductCountText(products.length)}
              </span>
            </div>
          </div>
          
          <div className="accounts-for-sale__products">
            {products.map((product) => (
              <div key={product.id} className="accounts-for-sale__product-card">
                <div className="accounts-for-sale__product-header">
                  <div className="accounts-for-sale__product-image">
                    <img
                      src="https://cdn.salla.sa/DQYwE/vknfwxMv9gXEyMCt5M6hCQOZIxj59EOlvKq8f2Gl.jpg"
                      alt={product.title}
                      className="accounts-for-sale__main-image"
                    />
                  </div>
                  <div className="accounts-for-sale__product-logo">
                    <span className="accounts-for-sale__product-logo-letter">Z</span>
                  </div>
                  <span className="accounts-for-sale__category-icon">{product.icon}</span>
                  <div className="accounts-for-sale__product-line"></div>
                  <h3 className="accounts-for-sale__product-subtitle">{product.category}</h3>
                  <span className="accounts-for-sale__badge">{product.badge}</span>
                </div>
                <div className="accounts-for-sale__product-content">
                  <h4 className="accounts-for-sale__product-title">{product.title}</h4>
                  {product.hasDiscount ? (
                    <div className="accounts-for-sale__pricing" dir="rtl">
                      <div className="accounts-for-sale__discount-container">
                        <div className="accounts-for-sale__price-info">
                          <p className="accounts-for-sale__product-price accounts-for-sale__product-price--discounted">
                            {product.price} <SaudiRiyalIcon width={12} height={13} />
                          </p>
                          <p className="accounts-for-sale__original-price">
                            {product.originalPrice} <SaudiRiyalIcon width={10} height={11} />
                          </p>
                        </div>
                        <div className="accounts-for-sale__discount-info">
                          <div className="accounts-for-sale__discount-badge">
                            - % {product.discountPercentage}
                          </div>
                          <div className="accounts-for-sale__savings">
                            وفر {product.savings.toFixed(2)} <SaudiRiyalIcon width={10} height={11} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="accounts-for-sale__product-price" dir="rtl">
                      {product.price} <SaudiRiyalIcon width={12} height={13} />
                    </p>
                  )}
                  <div className="accounts-for-sale__product-actions">
                    <button className="accounts-for-sale__favorite-btn" onClick={handleFavoriteClick}>
                      <IoIosHeartEmpty />
                    </button>
                    <button className="accounts-for-sale__add-to-cart">
                      <PiShoppingBag />
                      إضافة للسلة
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Customer Reviews Section */}
          <section className="accounts-for-sale__reviews">
            <div className="accounts-for-sale__reviews-header">
              <h3 className="accounts-for-sale__reviews-title">آراء العملاء</h3>
            </div>
            
            <div className="accounts-for-sale__reviews-container">
              <button 
                className="accounts-for-sale__slider-btn accounts-for-sale__slider-btn--prev"
                onClick={prevReview}
                aria-label="السابق"
              >
                ‹
              </button>
              
              <button 
                className="accounts-for-sale__slider-btn accounts-for-sale__slider-btn--next"
                onClick={nextReview}
                aria-label="التالي"
              >
                ›
              </button>
              
              <div className="accounts-for-sale__reviews-slider" ref={reviewsSliderRef}>
                <div 
                  className="accounts-for-sale__reviews-track"
                  style={{ transform: `translateX(-${currentReviewIndex * 100}%)` }}
                >
                  <div className="accounts-for-sale__reviews-grid">
                    {reviews.map((review) => (
                      <div key={review.id} className="accounts-for-sale__review-card">
                        <div className="accounts-for-sale__review-header">
                          <div className="accounts-for-sale__review-rating">
                            <span className="accounts-for-sale__star"><CiStar /></span>
                            <span className="accounts-for-sale__rating-number">{review.rating}</span>
                          </div>
                          <div className="accounts-for-sale__reviewer">
                            
                            <div className="accounts-for-sale__reviewer-info">
                              <h4 className="accounts-for-sale__reviewer-name">{review.name}</h4>
                              <span className="accounts-for-sale__reviewer-date">{review.date}</span>
                            </div>
                            <div className="accounts-for-sale__reviewer-avatar">
                              <img src={review.avatar} alt={review.name} />
                            </div>
                          </div>
                        </div>
                        
                        <div className="accounts-for-sale__review-content">
                          <div className="accounts-for-sale__quote-open">"</div>
                          <p className="accounts-for-sale__review-text">{review.text}</p>
                          <div className="accounts-for-sale__quote-close">"</div>
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

AccountsForSale.displayName = 'AccountsForSale';

export default AccountsForSale;










