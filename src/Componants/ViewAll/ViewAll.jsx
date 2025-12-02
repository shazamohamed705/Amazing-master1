import React, { memo, useEffect, useState } from 'react';
import { IoIosHeartEmpty } from "react-icons/io";
import { PiShoppingBag } from "react-icons/pi";
import { CiStar } from "react-icons/ci";
import SaudiRiyalIcon from '../SaudiRiyalIcon/SaudiRiyalIcon';
import './ViewAll.css';
import UnifiedReviews from '../UnifiedReviews/UnifiedReviews';

const ViewAll = memo(() => {
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
      title: 'خدمة سناب شات 500 مشاهدة',
      price: '100',
      range: '500 مشاهدة',
      badge: '5★'
    },
    {
      id: 3,
      title: 'خدمة سناب شات 200 مشاهدة',
      price: '50',
      range: '200 مشاهدة',
      badge: '5★'
    },
    {
      id: 4,
      title: 'خدمة سناب شات 100 مشاهدة',
      price: '30',
      range: '100 مشاهدة',
      badge: '5★'
    },
    {
      id: 5,
      title: 'خدمة سناب شات 50 مشاهدة',
      price: '20',
      range: '50 مشاهدة',
      badge: '5★'
    },
    {
      id: 6,
      title: 'خدمة سناب شات 25 مشاهدة',
      price: '15',
      range: '25 مشاهدة',
      badge: '5★'
    }
  ];

  const reviews = [
    {
      id: 1,
      text: "خدمة ممتازة ونتائج مذهلة",
      name: "فهد العتيبي",
      date: "03/25/2024",
      rating: 5
    },
    {
      id: 2,
      text: "أفضل خدمة لسناب شات",
      name: "نورا الشمري",
      date: "03/22/2024",
      rating: 5
    },
    {
      id: 3,
      text: "نتائج رائعة وخدمة سريعة",
      name: "خالد القحطاني",
      date: "03/18/2024",
      rating: 5
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

  // Slider navigation functions
  const nextReview = () => {
    setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToReview = (index) => {
    setCurrentReviewIndex(index);
  };

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
    <div className="view-all">
      {/* Main Content */}
      <main className="view-all__main">
        <div className="view-all__container">
          <div className="view-all__sub-nav">
            <div className="view-all__dropdown-container">
              <button 
                className="view-all__sort-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {selectedSort}
                <span className="view-all__dropdown-arrow">
                  {isDropdownOpen ? '▲' : '▼'}
                </span>
              </button>
              
              {isDropdownOpen && (
                <div className="view-all__dropdown-menu">
                  {sortOptions.map((option, index) => (
                    <button 
                      key={index}
                      className={`view-all__dropdown-item ${option === selectedSort ? 'selected' : ''}`}
                      onClick={() => handleSortSelect(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="view-all__counter">
              <span className="view-all__counter-text">
                عرض {getProductCountText(products.length)}
              </span>
            </div>
          </div>
          
          <div className="view-all__products">
            {products.map((product) => (
              <div key={product.id} className="view-all__product-card">
                <div className="view-all__product-header">
                  <img
                    src="https://cdn.salla.sa/DQYwE/M5rnE6RQieGwxLbKyl4EpAHD9Y3OkeObgnKbtYTB.jpg"
                    alt="خدمة"
                    className="view-all__product-header-image"
                  />
                </div>
                <div className="view-all__product-content">
                  <h4 className="view-all__product-title">{product.title}</h4>
                  <p className="view-all__product-price" dir="rtl">
                    {product.price} <SaudiRiyalIcon width={12} height={13} />
                  </p>
                  <div className="view-all__product-actions">
                    <button className="view-all__favorite-btn">
                      <IoIosHeartEmpty />
                    </button>
                    <button className="view-all__add-to-cart">
                      <PiShoppingBag />
                      إضافة للسلة
                    </button>
                    {/* Removed contact button per request */}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Customer Reviews Section */}
          <UnifiedReviews />
        </div>
      </main>
    </div>
  );
});

ViewAll.displayName = 'ViewAll';

export default ViewAll;
