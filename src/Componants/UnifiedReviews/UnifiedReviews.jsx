import React, { memo, useEffect, useState, useCallback } from 'react';
import { CiStar } from "react-icons/ci";
import './UnifiedReviews.css';

const UnifiedReviews = memo(({ variant }) => {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
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
    },
    {
      id: 4,
      name: 'سارة أحمد',
      rating: 5,
      date: 'منذ شهر',
      text: 'أفضل موقع لخدمات وسائل التواصل الاجتماعي'
    },
    {
      id: 5,
      name: 'خالد العلي',
      rating: 5,
      date: 'منذ شهرين',
      text: 'خدمة سريعة ونتائج ممتازة، أنصح الجميع'
    }
  ];

  const nextReview = useCallback(() => {
    setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
  }, [reviews.length]);

  const prevReview = useCallback(() => {
    setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  }, [reviews.length]);

  const goToReview = useCallback((index) => {
    setCurrentReviewIndex(index);
  }, []);

  const rootClass = `unified-reviews${variant ? ` unified-reviews--${variant}` : ''}`;
  return (
    <div className={rootClass}>
      <div className="unified-reviews__container">
        <div className="unified-reviews__header">
          <h3 className="unified-reviews__title">آراء العملاء</h3>
        </div>
        
        {isMobile ? (
          <div className="unified-reviews__mobile">
            <div className="unified-reviews__mobile-slider">
              <div 
                className="unified-reviews__mobile-track"
                style={{ transform: `translateX(-${currentReviewIndex * 100}%)` }}
              >
                {reviews.map((review) => (
                  <div key={review.id} className="unified-reviews__mobile-card">
                    <div className="unified-reviews__review-rating">
                      {[...Array(5)].map((_, i) => (
                        <CiStar 
                          key={i} 
                          className={`unified-reviews__star ${i < review.rating ? 'filled' : ''}`}
                        />
                      ))}
                      <span className="unified-reviews__rating-number">{review.rating}</span>
                    </div>
                    
                    <div className="unified-reviews__reviewer">
                      <div className="unified-reviews__reviewer-avatar">
                        <div className="unified-reviews__avatar-icon">👤</div>
                      </div>
                      <div className="unified-reviews__reviewer-info">
                        <div className="unified-reviews__reviewer-name">{review.name}</div>
                        <div className="unified-reviews__reviewer-date">{review.date}</div>
                      </div>
                    </div>
                    
                    <div className="unified-reviews__review-content">
                      <div className="unified-reviews__quote-open">"</div>
                      <div className="unified-reviews__quote-close">"</div>
                      <p className="unified-reviews__review-text">{review.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="unified-reviews__mobile-controls">
              <button 
                className="unified-reviews__mobile-btn unified-reviews__mobile-btn--prev"
                onClick={prevReview}
              >
                ‹
              </button>
              <button 
                className="unified-reviews__mobile-btn unified-reviews__mobile-btn--next"
                onClick={nextReview}
              >
                ›
              </button>
            </div>
          </div>
        ) : (
          <div className="unified-reviews__desktop">
            <button 
              className="unified-reviews__slider-btn unified-reviews__slider-btn--prev"
              onClick={prevReview}
            >
              ‹
            </button>
            
            <div className="unified-reviews__slider">
              <div className="unified-reviews__track">
                <div className="unified-reviews__grid">
                  {reviews.map((review, index) => (
                    <div 
                      key={review.id} 
                      className={`unified-reviews__card ${index === currentReviewIndex ? 'active' : ''}`}
                      onClick={() => goToReview(index)}
                    >
                      <div className="unified-reviews__review-rating">
                        {[...Array(5)].map((_, i) => (
                          <CiStar 
                            key={i} 
                            className={`unified-reviews__star ${i < review.rating ? 'filled' : ''}`}
                          />
                        ))}
                        <span className="unified-reviews__rating-number">{review.rating}</span>
                      </div>
                      
                      <div className="unified-reviews__reviewer">
                        <div className="unified-reviews__reviewer-avatar">
                          <div className="unified-reviews__avatar-icon">👤</div>
                        </div>
                        <div className="unified-reviews__reviewer-info">
                          <div className="unified-reviews__reviewer-name">{review.name}</div>
                          <div className="unified-reviews__reviewer-date">{review.date}</div>
                        </div>
                      </div>
                      
                      <div className="unified-reviews__review-content">
                        <div className="unified-reviews__quote-open">"</div>
                        <div className="unified-reviews__quote-close">"</div>
                        <p className="unified-reviews__review-text">{review.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <button 
              className="unified-reviews__slider-btn unified-reviews__slider-btn--next"
              onClick={nextReview}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default UnifiedReviews;
