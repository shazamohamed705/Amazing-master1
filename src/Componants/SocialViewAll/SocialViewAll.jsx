import React, { memo, useEffect, useState, useCallback } from 'react';
import { IoIosHeartEmpty } from "react-icons/io";
import { PiShoppingBag } from "react-icons/pi";
import { CiStar } from "react-icons/ci";
import SaudiRiyalIcon from '../SaudiRiyalIcon/SaudiRiyalIcon';
import './SocialViewAll.css';
import UnifiedReviews from '../UnifiedReviews/UnifiedReviews';

const SocialViewAll = memo(() => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [selectedSort, setSelectedSort] = useState('ترتيب مقترحاتنا');
  const [isMobile, setIsMobile] = useState(false);

  // Render the global ReviewsSlider design on mobile only to avoid affecting desktop.
  useEffect(() => {
    // Avoid SSR issues and keep the listener lightweight
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  
  const products = [
    {
      id: 1,
      title: 'خدمة سناب شات 1000 مشاهدة',
      price: '180',
      range: '1000 مشاهدة',
      badge: '5★'
    },
    {
      id: 2,
      title: 'خدمة انستقرام 500 متابع',
      price: '150',
      range: '500 متابع',
      badge: '5★'
    },
    {
      id: 3,
      title: 'خدمة تيك توك 2000 مشاهدة',
      price: '120',
      range: '2000 مشاهدة',
      badge: '5★'
    },
    {
      id: 4,
      title: 'خدمة تويتر 1000 متابع',
      price: '90',
      range: '1000 متابع',
      badge: '5★'
    },
    {
      id: 5,
      title: 'خدمة فيسبوك 500 إعجاب',
      price: '80',
      range: '500 إعجاب',
      badge: '5★'
    },
    {
      id: 6,
      title: 'خدمة يوتيوب 1000 مشاهدة',
      price: '200',
      range: '1000 مشاهدة',
      badge: '5★'
    }
  ];

  const reviews = [
    {
      id: 1,
      name: 'أحمد محمد',
      rating: 5,
      date: 'منذ يومين',
      text: 'خدمات ممتازة وسريعة، أنصح بها بشدة!'
    },
    {
      id: 2,
      name: 'فاطمة علي',
      rating: 5,
      date: 'منذ أسبوع',
      text: 'جودة عالية وأسعار مناسبة، شكراً لكم'
    },
    {
      id: 3,
      name: 'محمد السعيد',
      rating: 5,
      date: 'منذ أسبوعين',
      text: 'خدمة احترافية ومتابعة ممتازة'
    }
  ];

  const getProductCountText = () => {
    return `عرض ${products.length} منتج`;
  };

  const nextReview = useCallback(() => {
    setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
  }, [reviews.length]);

  const prevReview = useCallback(() => {
    setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  }, [reviews.length]);

  const goToReview = useCallback((index) => {
    setCurrentReviewIndex(index);
  }, []);

  const sortOptions = [
    'ترتيب مقترحاتنا',
    'السعر: من الأقل للأعلى',
    'السعر: من الأعلى للأقل',
    'الأكثر مبيعاً',
    'الأحدث'
  ];

  const handleSortSelect = (option) => {
    setSelectedSort(option);
    setIsDropdownOpen(false);
  };

  return (
    <main className="social-view-all">
      <div className="social-view-all__container">
        <div className="social-view-all__main">
          {/* Sub Navigation */}
          <div className="social-view-all__sub-nav">
            <div className="social-view-all__dropdown-container">
              <button 
                className="social-view-all__sort-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {selectedSort}
                <span className="social-view-all__dropdown-arrow">▼</span>
              </button>
              
              {isDropdownOpen && (
                <div className="social-view-all__dropdown-menu">
                  {sortOptions.map((option, index) => (
                    <button
                      key={index}
                      className="social-view-all__dropdown-item"
                      onClick={() => handleSortSelect(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="social-view-all__counter">
              <span className="social-view-all__counter-text">{getProductCountText()}</span>
            </div>
          </div>

          {/* Products Grid */}
          <div className="social-view-all__products">
            {products.map((product) => (
              <div key={product.id} className="social-view-all__product-card">
                <div className="social-view-all__product-header">
                  <div className="social-view-all__product-header-image">
                    <img 
                      src="https://cdn.salla.sa/form-builder/service-1.png" 
                      alt={product.title}
                    />
                  </div>
                </div>
                
                <div className="social-view-all__product-content">
                  <h3 className="social-view-all__product-title">{product.title}</h3>
                  <div className="social-view-all__product-price">
                    <SaudiRiyalIcon />
                    <span>{product.price}</span>
                  </div>
                  
                  <div className="social-view-all__product-actions">
                    <button className="social-view-all__favorite-btn">
                      <IoIosHeartEmpty />
                    </button>
                    <button className="social-view-all__add-to-cart">
                      <PiShoppingBag />
                      <span>أضف للسلة</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reviews Section */}
          <UnifiedReviews />
        </div>
      </div>
    </main>
  );
});

export default SocialViewAll;