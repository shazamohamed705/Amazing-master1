import React, { memo, useRef, useState, useEffect, useCallback } from 'react';
import SaudiRiyalIcon from '../SaudiRiyalIcon/SaudiRiyalIcon';
import { HiArrowSmallLeft } from "react-icons/hi2";
import { HiArrowSmallRight } from "react-icons/hi2";
import { IoIosHeartEmpty, IoIosHeart } from "react-icons/io";
import { TbShoppingBag } from "react-icons/tb";
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { apiClient } from '../../services/apiClient';
import './ProductsSlider.css';

const AUTO_SCROLL_DELAY_MS = 4500;

const defaultProducts = [
  {
    id: 1,
    title: 'إنشاء موقع ووردبرس',
    subtitle: 'برمجة مواقع الويب WordPress',
    price: 1500,
    description: 'إنشاء موقع ووردبرس احترافي',
    highlight: 'اسبوع عمل فقط',
    image: null
  },
  {
    id: 2,
    title: 'تطوير تطبيقات الجوال',
    subtitle: 'برمجة تطبيقات الأندرويد',
    price: 2500,
    description: 'تطوير تطبيقات الجوال',
    highlight: 'اسبوعين عمل',
    image: null
  },
  {
    id: 3,
    title: 'تصميم هوية بصرية',
    subtitle: 'لوقو وهوية بصرية',
    price: 800,
    description: 'تصميم هوية بصرية شاملة',
    highlight: '5 أيام عمل',
    image: null
  },
  {
    id: 4,
    title: 'تسويق رقمي',
    subtitle: 'إدارة الحملات الإعلانية',
    price: 1200,
    description: 'تسويق رقمي احترافي',
    highlight: 'اسبوع عمل',
    image: null
  }
];

const ProductsSlider = memo(function ProductsSlider({ categoryId }) {
  const { addToCart } = useCart();
  const { isFav, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const [products, setProducts] = useState(defaultProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        let response;
        if (categoryId) {
          response = await apiClient.get(`/categories/${categoryId}`);
          if (response.success && response.data?.services) {
            const services = response.data.services.map(s => ({
              id: s.id,
              title: s.name,
              subtitle: s.short_description || s.description || '',
              price: parseFloat(s.price) || 0,
              description: s.description || '',
              image: s.image,
              slug: s.slug,
            }));
            setProducts(services.length > 0 ? services : defaultProducts);
          }
        } else {
          // جلب آخر 20 خدمة مرتبة حسب الطلب
          response = await apiClient.get('/services/top-by-demand', { limit: 20 });
          if (response.success && response.data) {
            const services = response.data.map(s => ({
              id: s.id,
              title: s.name,
              subtitle: s.short_description || s.description || '',
              price: parseFloat(s.price) || 0,
              description: s.description || '',
              image: s.image,
              slug: s.slug,
              total_orders: s.total_orders || 0,
              average_rating: s.average_rating || 0,
            }));
            setProducts(services.length > 0 ? services : defaultProducts);
          }
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts(defaultProducts);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [categoryId]);

  const SLIDE_DURATION_MS = 220;
  const visible = 3;
  const [index, setIndex] = useState(0);
  const maxIndex = Math.max(0, products.length - visible);
  const [items, setItems] = useState(products);

  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const autoScrollRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const [isRTL, setIsRTL] = useState(false);
  const [isAutoPaused, setIsAutoPaused] = useState(false);

  useEffect(() => {
    const dir = sectionRef.current?.getAttribute('dir') || document?.dir || 'ltr';
    setIsRTL(dir.toLowerCase() === 'rtl');
  }, []);

  const performSlide = useCallback((direction /* 'next' | 'prev' */) => {
    const track = trackRef.current;
    if (!track || isAnimatingRef.current) return;
    const firstCard = track.children && track.children[0];
    if (!firstCard) return;

    const cardRect = firstCard.getBoundingClientRect();
    const styles = window.getComputedStyle(track);
    const gapPx = parseFloat(styles.columnGap || styles.gap || '0');
    const step = cardRect.width + gapPx;

    // match usernames slider behavior: move right on next
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
        setItems((prev) => {
          const arr = prev.slice();
          if (direction === 'next') {
            const f = arr.shift(); if (f) arr.push(f);
          } else {
            const l = arr.pop(); if (l) arr.unshift(l);
          }
          return arr;
        });
        setIndex((p) => direction === 'next' ? (p + 1) % items.length : (p - 1 + items.length) % items.length);
        requestAnimationFrame(() => {
          track.style.transition = '';
          track.style.willChange = '';
          isAnimatingRef.current = false;
        });
      });
    };
    track.addEventListener('transitionend', onEnd);
  }, [SLIDE_DURATION_MS, items.length]);

  const next = useCallback(() => performSlide('next'), [performSlide]);
  const prev = useCallback(() => performSlide('prev'), [performSlide]);

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
      requestAnimationFrame(next);
    }, AUTO_SCROLL_DELAY_MS);
    return stopAutoScroll;
  }, [isAutoPaused, next, stopAutoScroll]);

  useEffect(() => {
    setItems(products);
  }, [products]);

  useEffect(() => {
    const onResize = () => {
      // no-op to keep behavior; could recalc if needed
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <section className="products-slider" dir="rtl" ref={sectionRef}>
      <div
        className="products-slider__container"
        onMouseEnter={() => setIsAutoPaused(true)}
        onMouseLeave={() => setIsAutoPaused(false)}
        onFocusCapture={() => setIsAutoPaused(true)}
        onBlurCapture={() => setIsAutoPaused(false)}
      >
        <div className="products-slider__header-block">
        <h2 className="products-slider__title">زود متابعينك</h2>
        <div className="products-slider__underline" />
        </div>

        <div className="products-slider__wrapper">
          <div className="products-slider__track" ref={trackRef} style={{ transform: 'translateX(0)' }}>
            {items.map((product) => (
              <div key={product.id} className="products-slider__card">
                <div className="products-slider__header">
                  <img 
                    src={product.image || "https://cdn.salla.sa/DQYwE/60e65ac0-11ff-4c02-a51d-1df33680522d-500x375.10584250635-jfWA4k2ZTz1KIraipWtBoxrfuWrIO1Npoq146dPR.jpg"} 
                    alt={product.title || "خدمة"} 
                    className="products-slider__header-image"
                  />
                </div>
                <div className="products-slider__content">
                  <h4 className="products-slider__description">{product.title}</h4>
                  <div className="products-slider__pricing">
                    <span className="products-slider__price">{product.price} <SaudiRiyalIcon width={14} height={15} color="#ffffff" /></span>
                  </div>
                  <div className="products-slider__actions">
                    <button className="products-slider__favorite-btn" onClick={() => toggleFavorite(product.id)} aria-label={isFav(product.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}>
                      {isFav(product.id) ? <IoIosHeart color="#F7EC06" /> : <IoIosHeartEmpty />}
                    </button>
                    <button 
                      className="products-slider__add-to-cart"
                      onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        try {
                          await addToCart({
                            ...product,
                            package_id: product.id,
                            packageId: product.id,
                            type: 'service'
                          });
                          showToast('تمت الإضافة للسلة بنجاح', 'success');
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

        <div className="products-slider__controls">
          <button className="products-slider__arrow" onClick={prev} aria-label="السابق">
            <HiArrowSmallRight />
          </button>
          <div className="products-slider__dots">
            {Array.from({ length: items.length }).map((_, i) => (
              <button key={i} className={`products-slider__dot ${i===index? 'is-active':''}`}
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
          <button className="products-slider__arrow" onClick={next} aria-label="التالي">
            <HiArrowSmallLeft />
          </button>
        </div>
      </div>
    </section>
  );
});

export default ProductsSlider;
