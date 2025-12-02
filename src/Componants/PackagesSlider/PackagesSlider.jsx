import React, { memo, useRef, useState, useEffect, useCallback } from 'react';
import { HiArrowSmallLeft } from "react-icons/hi2";
import { HiArrowSmallRight } from "react-icons/hi2";
import { IoIosHeartEmpty, IoIosHeart } from "react-icons/io";
import { TbShoppingBag } from "react-icons/tb";
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { apiClient } from '../../services/apiClient';
import './PackagesSlider.css';

const AUTO_SCROLL_DELAY_MS = 2800;

const defaultPackages = [
  {
    id: 1,
    title: 'إدارة حساب تويتر | باقة برونزية',
    background: 'linear-gradient(135deg, #1da1f2 0%, #0c7abf 100%)',
    icon: '🐦',
    subtitle: 'إدارة حسابات تويتر',
    price: 600,
    oldPrice: 1000,
    saved: 400
  },
  {
    id: 2,
    title: 'إدارة حساب تويتر | باقة فضية',
    background: 'linear-gradient(135deg, #1da1f2 0%, #0c7abf 100%)',
    icon: '🐦',
    subtitle: 'إدارة حسابات تويتر',
    price: 1200,
    oldPrice: 2000,
    saved: 800
  },
  {
    id: 3,
    title: 'باقة التسويق لإدارة حسابات التواصل الاجتماعي',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #334155 100%)',
    icon: '📢',
    subtitle: 'باقة التسويق',
    price: 1300
  },
  {
    id: 4,
    title: 'باقة تصميم المتجر والتسويق',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #334155 100%)',
    icon: '🏪',
    subtitle: 'إنشاء متجر الكتروني احترافي سعودي رقمي',
    price: 2309
  },
  {
    id: 5,
    title: 'إدارة حساب انستقرام | باقة ذهبية',
    background: 'linear-gradient(135deg, #c13584 0%, #833ab4 100%)',
    icon: '📷',
    subtitle: 'إدارة حسابات انستقرام',
    price: 1500,
    oldPrice: 2500,
    saved: 1000
  },
  {
    id: 6,
    title: 'باقة السوشيال ميديا الشاملة',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '📱',
    subtitle: 'إدارة جميع حسابات التواصل الاجتماعي',
    price: 3500
  }
];

const PackagesSlider = memo(function PackagesSlider() {
  const { addToCart } = useCart();
  const { isFav, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const [packages, setPackages] = useState(defaultPackages);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/follower-packages?per_page=6');
        if (response.success && response.data && response.data.length > 0) {
          const backgrounds = [
            'linear-gradient(135deg, #1da1f2 0%, #0c7abf 100%)',
            'linear-gradient(135deg, #1e3a8a 0%, #334155 100%)',
            'linear-gradient(135deg, #c13584 0%, #833ab4 100%)',
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          ];
          const icons = ['🐦', '📢', '📷', '📱', '🏪'];
          const loadedPackages = response.data.map((pkg, index) => ({
            id: pkg.id,
            title: pkg.name,
            background: backgrounds[index % backgrounds.length],
            icon: icons[index % icons.length],
            subtitle: pkg.description || 'باقة مميزة',
            price: parseFloat(pkg.price) || 0,
            oldPrice: pkg.discount_percentage ? parseFloat(pkg.price) * (1 + pkg.discount_percentage / 100) : null,
            saved: pkg.discount_percentage ? parseFloat(pkg.price) * (pkg.discount_percentage / 100) : 0,
            image: pkg.image || null,
          }));
          setPackages(loadedPackages.length > 0 ? loadedPackages : defaultPackages);
        }
      } catch (error) {
        console.error('Error loading packages:', error);
        setPackages(defaultPackages);
      } finally {
        setLoading(false);
      }
    };
    loadPackages();
  }, []);

  const SLIDE_DURATION_MS = 220;
  const visible = 4;
  const [index, setIndex] = useState(0);
  const maxIndex = Math.max(0, packages.length - visible);
  const [items, setItems] = useState(packages);
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
    <section className="packages-slider" dir="rtl" ref={sectionRef}>
      <div
        className="packages-slider__container"
        onMouseEnter={() => setIsAutoPaused(true)}
        onMouseLeave={() => setIsAutoPaused(false)}
        onFocusCapture={() => setIsAutoPaused(true)}
        onBlurCapture={() => setIsAutoPaused(false)}
      >
        <div className="packages-slider__header-section">
          <h2 className="packages-slider__title">باقات مميزة</h2>
          <div className="packages-slider__underline" />
        </div>

        <div className="packages-slider__wrapper">
          <div className="packages-slider__track" ref={trackRef} style={{ transform: 'translateX(0)' }}>
            {items.map((pkg) => (
              <div key={pkg.id} className="packages-slider__card">
                <div className="packages-slider__header">
                  <img
                    src={pkg.image || "https://cdn.salla.sa/DQYwE/60e65ac0-11ff-4c02-a51d-1df33680522d-500x375.10584250635-jfWA4k2ZTz1KIraipWtBoxrfuWrIO1Npoq146dPR.jpg"}
                    alt={pkg.subtitle || pkg.title}
                    className="packages-slider__header-image"
                    onError={(e) => {
                      e.target.src = 'https://cdn.salla.sa/DQYwE/60e65ac0-11ff-4c02-a51d-1df33680522d-500x375.10584250635-jfWA4k2ZTz1KIraipWtBoxrfuWrIO1Npoq146dPR.jpg';
                    }}
                  />
                </div>
                <div className="packages-slider__content">
                  <h4 className="packages-slider__description">{pkg.subtitle}</h4>
                  <div className="packages-slider__pricing">
                    <span className="packages-slider__price" dir="rtl">
                    <span className="webdev-slider__currency" aria-label="Egyptian Pound">EGP</span>
                      {pkg.price}
                     
                    </span>
                  </div>
                  <div className="packages-slider__actions">
                    <button className="packages-slider__favorite-btn" onClick={() => toggleFavorite(pkg.id)} aria-label={isFav(pkg.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}>
                      {isFav(pkg.id) ? <IoIosHeart color="#F7EC06" /> : <IoIosHeartEmpty />}
                    </button>
                    <button 
                      className="packages-slider__add-to-cart"
                      onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        try {
                          await addToCart({
                            id: pkg.id,
                            package_id: pkg.id,
                            packageId: pkg.id,
                            type: 'package',
                            name: pkg.title,
                            price: pkg.price,
                            image: "https://cdn.salla.sa/DQYwE/60e65ac0-11ff-4c02-a51d-1df33680522d-500x375.10584250635-jfWA4k2ZTz1KIraipWtBoxrfuWrIO1Npoq146dPR.jpg"
                          });
                          // success: no popup
                        } catch (error) {
                          showToast(error.message || 'حدث خطأ في إضافة المنتج للسلة', 'warning');
                        }
                      }}
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

        <div className="packages-slider__controls">
          <button className="packages-slider__arrow" onClick={isRTL ? prevSlide : nextSlide} aria-label="السابق">
            <HiArrowSmallRight />
          </button>
          <div className="packages-slider__dots">
            {Array.from({ length: items.length }).map((_, i) => (
              <button key={i} className={`packages-slider__dot ${i===index? 'is-active':''}`}
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
          <button className="packages-slider__arrow" onClick={isRTL ? nextSlide : prevSlide} aria-label="التالي">
            <HiArrowSmallLeft />
          </button>
        </div>
      </div>
    </section>
  );
});

export default PackagesSlider;
