import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import { HiArrowSmallLeft } from "react-icons/hi2";
import { HiArrowSmallRight } from "react-icons/hi2";
import { IoIosHeartEmpty, IoIosHeart } from "react-icons/io";
import { TbShoppingBag } from "react-icons/tb";
import { useFavorites } from '../../contexts/FavoritesContext';
import SaudiRiyalIcon from '../SaudiRiyalIcon/SaudiRiyalIcon';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { apiClient } from '../../services/apiClient';
import './DesignSlider.css';

const AUTO_SCROLL_DELAY_MS = 4500;

const DesignSlider = memo(function DesignSlider() {
  const { addToCart } = useCart();
  const { isFav, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // جلب الكاتوجري والخدمات
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/categories');
        if (response.success && response.data) {
          // جلب الخدمات لكل كاتوجري
          const categoriesWithServices = await Promise.all(
            response.data
              .filter(cat => cat.is_active && cat.show_in_navbar && !cat.parent_id)
              .slice(0, 5) // أول 5 كاتوجري
              .map(async (category) => {
                try {
                  const catResponse = await apiClient.get(`/categories/${category.id}`);
                  if (catResponse.success && catResponse.data?.services) {
                    const services = catResponse.data.services.slice(0, 4).map(s => ({
                      id: s.id,
                      title: s.name,
                      subtitle: s.short_description || s.description || '',
                      price: parseFloat(s.price) || 0,
                      description: s.description || '',
                      image: s.image,
                      slug: s.slug,
                    }));
                    return {
                      id: category.id,
                      name: category.name,
                      services: services,
                    };
                  }
                  return null;
                } catch (error) {
                  console.error(`Error loading services for category ${category.id}:`, error);
                  return null;
                }
              })
          );
          setCategories(categoriesWithServices.filter(cat => cat && cat.services.length > 0));
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Responsive visible cards based on screen size
  const getVisibleCards = useCallback(() => {
    const width = window.innerWidth;
    if (width > 1024) return 4;      // Desktop: 4 cards
    if (width > 768) return 3;       // Tablet: 3 cards
    if (width > 480) return 2;       // Mobile: 2 cards
    return 1;                        // Small Mobile: 1 card
  }, []);

  // تحويل categories إلى flat array من services
  const allServices = categories.flatMap(cat => 
    cat.services.map(service => ({ ...service, categoryName: cat.name }))
  );

  const SLIDE_DURATION_MS = 220;
  const [visible, setVisible] = useState(getVisibleCards);
  const [index, setIndex] = useState(0);
  const maxIndex = Math.max(0, allServices.length - visible);
  const [items, setItems] = useState(allServices);
  const sectionRef = useRef(null);
  const [isRTL, setIsRTL] = useState(false);
  const trackRef = useRef(null);
  const autoScrollRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const [isAutoPaused, setIsAutoPaused] = useState(false);

  // تحديث items عند تغيير categories
  useEffect(() => {
    setItems(allServices);
    setIndex(0); // Reset index when items change
  }, [allServices]);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const newVisible = getVisibleCards();
      if (newVisible !== visible) {
        setVisible(newVisible);
        // Reset index if it exceeds new maxIndex
        setIndex((prev) => Math.min(prev, Math.max(0, allServices.length - newVisible)));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [visible, getVisibleCards, allServices.length]);

  useEffect(() => {
    const dir = sectionRef.current?.getAttribute('dir') || document?.dir || 'ltr';
    setIsRTL(dir.toLowerCase() === 'rtl');
  }, []);

  // Slide then rotate to keep positions fixed visually
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
        setIndex(p => {
          const totalItems = items.length;
          if (totalItems === 0) return 0;
          const newIndex = direction === 'next' ? (p + 1) % totalItems : (p - 1 + totalItems) % totalItems;
          return Math.min(newIndex, Math.max(0, totalItems - visible));
        });
        requestAnimationFrame(() => {
          track.style.transition = '';
          track.style.willChange = '';
          isAnimatingRef.current = false;
        });
      });
    };
    track.addEventListener('transitionend', onEnd);
  }, [SLIDE_DURATION_MS, items.length, visible]);

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

  const goTo = useCallback((i) => {
    setIndex(Math.min(Math.max(i, 0), maxIndex));
  }, [maxIndex]);

  const handleAddToCart = useCallback(async (service) => {
    try {
      await addToCart({
        id: service.id,
        package_id: service.id,
        packageId: service.id,
        type: 'service',
        title: service.subtitle || service.title,
        price: service.price,
        description: service.description,
        slug: service.slug,
      });
    } catch (error) {
      showToast(error.message || 'حدث خطأ في إضافة المنتج للسلة', 'warning');
    }
  }, [addToCart, showToast]);

  const currentPage = index;
  const totalPages = maxIndex + 1;

  // عرض أول كاتوجري أو "التصميم الجرافيكي" كعنوان افتراضي
  const currentCategoryName = categories.length > 0 ? categories[0]?.name : 'التصميم الجرافيكي';

  return (
    <section className="design-slider" dir="rtl" ref={sectionRef}>
      <div
        className="design-slider__container"
        onMouseEnter={() => setIsAutoPaused(true)}
        onMouseLeave={() => setIsAutoPaused(false)}
        onFocusCapture={() => setIsAutoPaused(true)}
        onBlurCapture={() => setIsAutoPaused(false)}
      >
        <div className="design-slider__header-section">
          <h2 className="design-slider__title">{currentCategoryName}</h2>
          <div className="design-slider__underline" />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
            جاري التحميل...
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
            لا توجد خدمات متاحة حالياً
          </div>
        ) : (
          <div className="design-slider__wrapper">
            <div className="design-slider__track" ref={trackRef} style={{ transform: 'translateX(0)' }}>
              {items.map((service) => (
              <div key={service.id} className="design-slider__card">
                <div className="design-slider__header">
                  <img
                    src={service.image || 'https://cdn.salla.sa/DQYwE/60e65ac0-11ff-4c02-a51d-1df33680522d-500x375.10584250635-jfWA4k2ZTz1KIraipWtBoxrfuWrIO1Npoq146dPR.jpg'}
                    alt={service.subtitle || service.title}
                    className="design-slider__header-image"
                    onError={(e) => {
                      e.target.src = 'https://cdn.salla.sa/DQYwE/60e65ac0-11ff-4c02-a51d-1df33680522d-500x375.10584250635-jfWA4k2ZTz1KIraipWtBoxrfuWrIO1Npoq146dPR.jpg';
                    }}
                  />
                </div>
                <div className="design-slider__content">
                  <h4 className="design-slider__description">{service.subtitle || service.title}</h4>
                  <div className="design-slider__pricing" dir="rtl">
                    <span className="design-slider__price">
                      {service.price} <SaudiRiyalIcon width={14} height={15} />
                    </span>
                  </div>
                  <div className="design-slider__actions">
                    <button className="design-slider__favorite-btn" onClick={() => toggleFavorite(service.id)} aria-label={isFav(service.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}>
                      {isFav(service.id) ? <IoIosHeart color="#F7EC06" /> : <IoIosHeartEmpty />}
                    </button>
                    <button 
                      className="design-slider__add-to-cart"
                      onClick={() => handleAddToCart(service)}
                    >
                      <TbShoppingBag />
                      إضافة للسلة
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}

        <div className="design-slider__controls">
          <button className="design-slider__arrow" onClick={isRTL ? prevSlide : nextSlide} aria-label="السابق">
            <HiArrowSmallRight />
          </button>
          <div className="design-slider__dots">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button 
                key={i} 
                className={`design-slider__dot ${i === index ? 'is-active' : ''}`} 
                onClick={() => {
                  let steps = (i - index + totalPages) % totalPages;
                  if (steps === 0) return;
                  const stepOnce = () => {
                    if (steps <= 0) return;
                    performSlide('next');
                    steps -= 1;
                    if (steps > 0) setTimeout(stepOnce, SLIDE_DURATION_MS + 20);
                  };
                  stepOnce();
                }} 
                aria-label={`شريحة ${i + 1}`} 
              />
            ))}
          </div>
          <button className="design-slider__arrow" onClick={isRTL ? nextSlide : prevSlide} aria-label="التالي">
            <HiArrowSmallLeft />
          </button>
        </div>
      </div>
    </section>
  );
});

export default DesignSlider;
