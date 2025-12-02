import React, { memo, useRef, useState, useEffect, useCallback } from 'react';
import { HiArrowSmallLeft } from "react-icons/hi2";
import { HiArrowSmallRight } from "react-icons/hi2";
import { CiStar } from "react-icons/ci";
import { apiClient } from '../../services/apiClient';
import './ReviewsSlider.css';

const AUTO_SCROLL_DELAY_MS = 4200;

const ReviewsSlider = memo(function ReviewsSlider() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiClient } = require('../../services/apiClient');

  const [index, setIndex] = useState(0);
  const sectionRef = useRef(null);
  const [isRTL, setIsRTL] = useState(false);
  const visible = 3; // عدد الكروت المرئية
  const maxIndex = Math.max(0, reviews.length - visible);
  // NEW: keep items array and rotate instead of moving track
  const [items, setItems] = useState(reviews);
  const autoScrollRef = useRef(null);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const cardRefs = useRef([]);

  // جلب آراء العملاء من API
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/service-reviews', { limit: 20 });
        if (response.success && response.data) {
          const formattedReviews = response.data.map(review => ({
            id: review.id,
            name: review.name,
            date: review.date,
            rating: review.rating,
            avatar: review.avatar || 'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png',
            comment: review.comment || '',
            service_name: review.service_name,
          }));
          setReviews(formattedReviews.length > 0 ? formattedReviews : []);
          setItems(formattedReviews.length > 0 ? formattedReviews : []);
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
        setReviews([]);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, []);

  useEffect(() => {
    setItems(reviews);
  }, [reviews]);

  // Initialize card refs array
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, items.length);
  }, [items.length]);

  // Scroll reveal animation for each card using Intersection Observer
  useEffect(() => {
    if (items.length === 0) return;

    const observers = [];
    
    cardRefs.current.forEach((cardRef, index) => {
      if (!cardRef) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Add delay based on index for smooth staggered animation
              const delay = index * 300; // 300ms delay between each card for very smooth, calm flow
              setTimeout(() => {
                entry.target.classList.add('reviews-slider__card--visible');
              }, delay);
            } else {
              // Remove class when out of view to allow re-animation on scroll
              entry.target.classList.remove('reviews-slider__card--visible');
            }
          });
        },
        { 
          root: null, 
          threshold: 0.03,
          rootMargin: '150px'
        }
      );

      observer.observe(cardRef);
      observers.push({ observer, element: cardRef });
    });

    return () => {
      observers.forEach(({ observer, element }) => {
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [items.length, loading]);

  // arrows تعتمد على اتجاه الصفحة
  useEffect(() => {
    const dir = sectionRef.current?.getAttribute('dir') || document?.dir || 'ltr';
    setIsRTL(dir.toLowerCase() === 'rtl');
  }, []);

  // Rotate helpers (fixed positions)
  const showNext = useCallback(() => {
    setItems(prev => {
      const arr = prev.slice();
      const first = arr.shift();
      if (first) arr.push(first);
      return arr;
    });
    setIndex(p => (p + 1) % reviews.length);
  }, [reviews.length]);

  const showPrev = useCallback(() => {
    setItems(prev => {
      const arr = prev.slice();
      const last = arr.pop();
      if (last) arr.unshift(last);
      return arr;
    });
    setIndex(p => (p - 1 + reviews.length) % reviews.length);
  }, [reviews.length]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isAutoPaused) {
      stopAutoScroll();
      return;
    }
    autoScrollRef.current = window.setInterval(() => {
      requestAnimationFrame(showNext);
    }, AUTO_SCROLL_DELAY_MS);
    return stopAutoScroll;
  }, [isAutoPaused, showNext, stopAutoScroll]);

  return (
    <section className="reviews-slider" dir="rtl" ref={sectionRef}>
      <div
        className="reviews-slider__container"
        onMouseEnter={() => setIsAutoPaused(true)}
        onMouseLeave={() => setIsAutoPaused(false)}
        onFocusCapture={() => setIsAutoPaused(true)}
        onBlurCapture={() => setIsAutoPaused(false)}
      >
        <div className="reviews-slider__header">
          <h2 className="reviews-slider__title">آراء العملاء</h2>
          <a href="/all-reviews" className="reviews-slider__view-all">عرض المزيد</a>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
            جاري التحميل...
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
            لا توجد آراء متاحة حالياً
          </div>
        ) : (
          <div className="reviews-slider__wrapper">
            <div className="reviews-slider__track" style={{ transform: 'translateX(0)' }}>
              {items.map((review, idx) => (
              <div 
                key={review.id} 
                className="reviews-slider__card"
                data-index={idx}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
              >
                <div className="reviews-slider__top">
                  <div className="reviews-slider__user">
                    <div className="reviews-slider__avatar">
                      <img src={review.avatar} alt={review.name} />
                    </div>
                    <div className="reviews-slider__info">
                      <h4 className="reviews-slider__name">{review.name}</h4>
                      <span className="reviews-slider__date">{review.date}</span>
                    </div>
                  </div>
                  <div className="reviews-slider__rating">
                    <span className="reviews-slider__star"><CiStar /></span> {review.rating}
                  </div>
                </div>
                <div className="reviews-slider__quote">"</div>
                <p className="reviews-slider__comment">{review.comment}</p>
                <div className="reviews-slider__quote-end">"</div>
              </div>
            ))}
            </div>
          </div>
        )}

        <div className="reviews-slider__controls">
          <button className="reviews-slider__arrow" onClick={isRTL ? showPrev : showNext} aria-label="السابق">
            <HiArrowSmallRight />
          </button>
          <div className="reviews-slider__dots">
            {Array.from({ length: reviews.length }).map((_, i) => (
              <button
                key={i}
                className={`reviews-slider__dot ${i===index? 'is-active':''}`}
                onClick={() => {
                  const steps = (i - index + reviews.length) % reviews.length;
                  if (steps === 0) return;
                  setItems(prev => {
                    let arr = prev.slice();
                    for (let s = 0; s < steps; s++) {
                      const first = arr.shift();
                      if (first) arr.push(first);
                    }
                    return arr;
                  });
                  setIndex(i);
                }}
                aria-label={`شريحة ${i+1}`}
              />
            ))}
          </div>
          <button className="reviews-slider__arrow" onClick={isRTL ? showNext : showPrev} aria-label="التالي">
            <HiArrowSmallLeft />
          </button>
        </div>
      </div>
    </section>
  );
});

export default ReviewsSlider;
