import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import { HiArrowSmallLeft } from "react-icons/hi2";
import { HiArrowSmallRight } from "react-icons/hi2";
import { CiHeart } from "react-icons/ci";
import { TbShoppingBag } from "react-icons/tb";
import { apiClient } from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';
import './WebDevSlider.css';

const AUTO_SCROLL_DELAY_MS = 2500;

const WebDevSlider = memo(function WebDevSlider() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('portfolio'); // 'portfolio' or 'articles'

  // جلب Portfolio و Articles
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // جلب Portfolio أولاً
        const portfolioResponse = await apiClient.get('/portfolio', { per_page: 10 });
        let portfolioItems = [];
        if (portfolioResponse.success && portfolioResponse.data?.data) {
          portfolioItems = portfolioResponse.data.data.map(item => ({
            id: item.id,
            title: item.title,
            image: item.image,
            slug: item.slug,
            type: 'portfolio',
            url: `/portfolio/${item.slug || item.id}`,
          }));
        }

        // جلب Articles
        const articlesResponse = await apiClient.get('/articles', { per_page: 10 });
        let articleItems = [];
        if (articlesResponse.success && articlesResponse.data?.data) {
          articleItems = articlesResponse.data.data.map(item => ({
            id: item.id,
            title: item.title,
            image: item.image || item.featured_image,
            slug: item.slug,
            type: 'article',
            url: `/article/${item.slug || item.id}`,
          }));
        }

        // دمج Portfolio و Articles (Portfolio أولاً ثم Articles)
        const combined = [...portfolioItems, ...articleItems].slice(0, 20);
        setItems(combined);
        setType(combined.length > 0 ? combined[0].type : 'portfolio');
      } catch (error) {
        console.error('Error loading portfolio/articles:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const SLIDE_DURATION_MS = 220;
  const visible = 4;
  const [index, setIndex] = useState(0);
  const maxIndex = Math.max(0, items.length - visible);
  const sectionRef = useRef(null);
  const [isRTL, setIsRTL] = useState(false);
  const trackRef = useRef(null);
  const autoScrollRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const [isAutoPaused, setIsAutoPaused] = useState(false);

  useEffect(() => {
    const dir = sectionRef.current?.getAttribute('dir') || document?.dir || 'ltr';
    setIsRTL(dir.toLowerCase() === 'rtl');
  }, []);

  // Slide animation then rotate to keep positions fixed visually
  const performSlide = useCallback((direction /* 'next' | 'prev' */) => {
    const track = trackRef.current;
    if (!track || isAnimatingRef.current) return;
    const firstCard = track.children && track.children[0];
    if (!firstCard) return;

    const cardRect = firstCard.getBoundingClientRect();
    const styles = window.getComputedStyle(track);
    const gapPx = parseFloat(styles.columnGap || styles.gap || '0');
    const step = cardRect.width + gapPx;

    const delta = direction === 'next' ? step : -step;

    isAnimatingRef.current = true;
    track.style.willChange = 'transform';
    track.style.transition = `transform ${SLIDE_DURATION_MS}ms cubic-bezier(.4,0,.2,1)`;
    track.style.transform = `translateX(${delta}px)`;

    const onEnd = () => {
      track.removeEventListener('transitionend', onEnd);
      track.style.transition = 'none';
      track.style.transform = 'translateX(0)';

      requestAnimationFrame(() => {
        setItems(prev => {
          const arr = prev.slice();
          if (direction === 'next') {
            const f = arr.shift();
            if (f) arr.push(f);
          } else {
            const l = arr.pop();
            if (l) arr.unshift(l);
          }
          return arr;
        });
        setIndex(p => direction === 'next' ? (p + 1) % items.length : (p - 1 + items.length) % items.length);
        requestAnimationFrame(() => {
          track.style.transition = '';
          track.style.willChange = '';
          isAnimatingRef.current = false;
        });
      });
    };
    track.addEventListener('transitionend', onEnd);
  }, [SLIDE_DURATION_MS, items.length]);

  const nextSlide = useCallback(() => performSlide('next'), [performSlide]);
  const prevSlide = useCallback(() => performSlide('prev'), [performSlide]);

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
      requestAnimationFrame(nextSlide);
    }, AUTO_SCROLL_DELAY_MS);
    return stopAutoScroll;
  }, [isAutoPaused, nextSlide, stopAutoScroll]);

  return (
    <section className="webdev-slider" dir="rtl" ref={sectionRef}>
      <div
        className="webdev-slider__container"
        onMouseEnter={() => setIsAutoPaused(true)}
        onMouseLeave={() => setIsAutoPaused(false)}
        onFocusCapture={() => setIsAutoPaused(true)}
        onBlurCapture={() => setIsAutoPaused(false)}
      >
        <div className="webdev-slider__header-section">
          <h2 className="webdev-slider__title">
            {type === 'portfolio' ? 'سابقة الأعمال' : 'المقالات'}
          </h2>
          <div className="webdev-slider__underline" />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
            جاري التحميل...
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
            لا توجد عناصر متاحة حالياً
          </div>
        ) : (
          <div className="webdev-slider__wrapper">
            <div className="webdev-slider__track" ref={trackRef} style={{ transform: 'translateX(0)' }}>
              {items.map((item) => (
                <div 
                  key={`${item.type}-${item.id}`} 
                  className="webdev-slider__card"
                  onClick={() => item.url && navigate(item.url)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="webdev-slider__header">
                    <img
                      src={item.image || 'https://cdn.salla.sa/DQYwE/60e65ac0-11ff-4c02-a51d-1df33680522d-500x375.10584250635-jfWA4k2ZTz1KIraipWtBoxrfuWrIO1Npoq146dPR.jpg'}
                      alt={item.title}
                      className="webdev-slider__header-image"
                      onError={(e) => {
                        e.target.src = 'https://cdn.salla.sa/DQYwE/60e65ac0-11ff-4c02-a51d-1df33680522d-500x375.10584250635-jfWA4k2ZTz1KIraipWtBoxrfuWrIO1Npoq146dPR.jpg';
                      }}
                    />
                  </div>
                  <div className="webdev-slider__content">
                    <h4 className="webdev-slider__description">{item.title}</h4>
                    <div className="webdev-slider__actions">
                      <button 
                        className="webdev-slider__view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.url) navigate(item.url);
                        }}
                      >
                        {item.type === 'portfolio' ? 'عرض المشروع' : 'قراءة المقال'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="webdev-slider__controls">
          <button className="webdev-slider__arrow" onClick={isRTL ? prevSlide : nextSlide} aria-label="السابق">
            <HiArrowSmallRight />
          </button>
          <div className="webdev-slider__dots">
            {Array.from({ length: items.length }).map((_, i) => (
              <button key={i} className={`webdev-slider__dot ${i===index? 'is-active':''}`}
                onClick={() => {
                  let steps = (i - index + items.length) % items.length;
                  if (steps === 0) return;
                  const stepOnce = () => {
                    if (steps <= 0) return;
                    performSlide('next');
                    steps -= 1;
                    if (steps > 0) setTimeout(stepOnce, SLIDE_DURATION_MS + 20);
                  };
                  stepOnce();
                }} aria-label={`شريحة ${i+1}`} />
            ))}
          </div>
          <button className="webdev-slider__arrow" onClick={isRTL ? nextSlide : prevSlide} aria-label="التالي">
            <HiArrowSmallLeft />
          </button>
        </div>
      </div>
    </section>
  );
});

export default WebDevSlider;
