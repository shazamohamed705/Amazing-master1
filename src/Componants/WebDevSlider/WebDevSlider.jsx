import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import { HiArrowSmallLeft } from "react-icons/hi2";
import { HiArrowSmallRight } from "react-icons/hi2";
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';
import './WebDevSlider.css';

const AUTO_SCROLL_DELAY_MS = 2500;
const MEDIA_PRODUCTION_SLUG = 'media-production'; // أو يمكن استخدام ID: 36

const WebDevSlider = memo(function WebDevSlider() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('الميديا بروداكشن');

  // جلب كاتجوري الميديا بروداكشن مع السابكاتجوريات والخدمات
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // جلب الكاتجوري الرئيسي
        const categoryResponse = await apiClient.get(`/categories/${MEDIA_PRODUCTION_SLUG}`);
        if (!categoryResponse.success || !categoryResponse.data?.category) {
          throw new Error('لم يتم العثور على الكاتجوري');
        }

        const mainCategory = categoryResponse.data.category;
        setCategoryName(mainCategory.name);
        const subcategories = categoryResponse.data.subcategories || [];

        // جلب الخدمات لكل سابكاتجوري
        const subcategoriesWithServices = await Promise.all(
          subcategories
            .filter(sub => sub.is_active)
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map(async (subcategory) => {
              try {
                const subResponse = await apiClient.get(`/categories/${subcategory.id}`);
                const services = subResponse.success && subResponse.data?.services 
                  ? subResponse.data.services.map(s => ({
                      id: s.id,
                      name: s.name,
                      image: s.image,
                      slug: s.slug,
                      price: parseFloat(s.price) || 0,
                      short_description: s.short_description || s.description || '',
                    }))
                  : [];
                
                return {
                  id: subcategory.id,
                  name: subcategory.name,
                  slug: subcategory.slug,
                  description: subcategory.description,
                  services: services,
                };
              } catch (error) {
                console.error(`Error loading services for subcategory ${subcategory.id}:`, error);
                return {
                  id: subcategory.id,
                  name: subcategory.name,
                  slug: subcategory.slug,
                  description: subcategory.description,
                  services: [],
                };
              }
            })
        );

        // تحويل السابكاتجوريات والخدمات إلى items للعرض
        const allItems = [];
        subcategoriesWithServices.forEach(subcategory => {
          if (subcategory.services.length > 0) {
            // إضافة السابكاتجوري كعنوان
            allItems.push({
              id: `subcat-${subcategory.id}`,
              type: 'subcategory',
              title: subcategory.name,
              description: subcategory.description,
              slug: subcategory.slug,
              url: `/category/${subcategory.slug}`,
              image: null,
            });
            
            // إضافة الخدمات الخاصة بالسابكاتجوري
            subcategory.services.forEach(service => {
              allItems.push({
                id: service.id,
                type: 'service',
                title: service.name,
                description: service.short_description,
                image: service.image,
                slug: service.slug,
                url: `/service/${service.slug || service.id}`,
                price: service.price,
              });
            });
          }
        });

        setItems(allItems);
      } catch (error) {
        console.error('Error loading media production category:', error);
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
          <h2 className="webdev-slider__title">{categoryName}</h2>
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
                  className={`webdev-slider__card ${item.type === 'subcategory' ? 'webdev-slider__card--subcategory' : ''}`}
                  onClick={() => item.url && item.type !== 'subcategory' && navigate(item.url)}
                  style={{ cursor: item.type === 'subcategory' ? 'default' : 'pointer' }}
                >
                  {item.type === 'subcategory' ? (
                    // عرض السابكاتجوري كعنوان
                    <div className="webdev-slider__subcategory-header">
                      <h3 className="webdev-slider__subcategory-title">{item.title}</h3>
                      {item.description && (
                        <p className="webdev-slider__subcategory-description">{item.description}</p>
                      )}
                      <Link 
                        to={item.url} 
                        className="webdev-slider__view-all-btn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        عرض الكل
                      </Link>
                    </div>
                  ) : (
                    // عرض الخدمة
                    <>
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
                        {item.description && (
                          <p className="webdev-slider__service-description">
                            {item.description.replace(/<[^>]*>/g, '').substring(0, 60)}...
                          </p>
                        )}
                        {item.price && (
                          <p className="webdev-slider__price">{item.price} ر.س</p>
                        )}
                        <div className="webdev-slider__actions">
                          <button 
                            className="webdev-slider__view-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.url) navigate(item.url);
                            }}
                          >
                            عرض الخدمة
                          </button>
                        </div>
                      </div>
                    </>
                  )}
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
