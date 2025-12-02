import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import './HeroSlider.css';

const HeroSlider = memo(function HeroSlider({ images = [], sliders = [], height = 420 }) {
  // دالة لضمان صحة رابط الصورة
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // إذا كان الرابط كامل بالفعل (يبدأ بـ http:// أو https://)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // إذا كان مسار نسبي، نضيف base URL
    const baseUrl = 'https://storage-te.com/backend/storage/app/public';
    return `${baseUrl}/${imagePath.replace(/^\//, '')}`;
  };

  // استخدام السلايدر من الباك اند فقط
  const slides = React.useMemo(() => {
    if (sliders && sliders.length > 0) {
      return sliders.map(s => ({
        image: getImageUrl(s.image || s),
        title: s.title,
        description: s.description,
        link: s.link,
      }));
    }
    // إذا لم تكن هناك sliders، نرجع array فارغ
    return [];
  }, [sliders]);

  const [index, setIndex] = useState(0);
  const containerRef = useRef(null);

  const goTo = useCallback((i) => {
    if (slides.length === 0) return;
    const safe = ((i % slides.length) + slides.length) % slides.length;
    setIndex(safe);
  }, [slides.length]);

  const next = useCallback(() => goTo(index + 1), [index, goTo]);
  const prev = useCallback(() => goTo(index - 1), [index, goTo]);

  // keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  // Auto slide effect - يتبدل كل 3 ثوان
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // touch swipe
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startX = 0;
    const onTouchStart = (e) => { startX = e.touches[0].clientX; };
    const onTouchEnd = (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (dx > 50) prev();
      if (dx < -50) next();
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [next, prev]);

  const currentSlide = slides[index] || {};

  const SlideContent = ({ slide, isActive }) => {
    const content = (
      <>
        <img 
          src={slide.image} 
          alt={slide.title || `slide-${index + 1}`} 
          className="hero-slider__img"
          loading={isActive ? 'eager' : 'lazy'}
        />
        {(slide.title || slide.description) && (
          <div className="hero-slider__overlay">
            {slide.title && (
              <h2 className="hero-slider__title">{slide.title}</h2>
            )}
            {slide.description && (
              <p className="hero-slider__description">{slide.description}</p>
            )}
          </div>
        )}
      </>
    );

    if (slide.link) {
      return (
        <a href={slide.link} className="hero-slider__link" target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      );
    }

    return content;
  };

  // إذا لم تكن هناك slides، لا نعرض شيء
  if (slides.length === 0) {
    return null;
  }

  return (
    <section 
      className="hero-slider" 
      style={{ height }} 
      ref={containerRef}
      aria-label="سلايدر الصور الرئيسي"
      role="region"
    >
      <div className="hero-slider__track" role="list">
        {slides.map((slide, i) => (
          <div 
            className={`hero-slider__slide ${i === index ? 'active' : ''}`} 
            key={i} 
            aria-hidden={i !== index}
            role="listitem"
            aria-label={slide.title || `شريحة ${i + 1}`}
          >
            <SlideContent slide={slide} isActive={i === index} />
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <>
          <button 
            className="hero-slider__btn hero-slider__btn--prev" 
            onClick={prev} 
            aria-label="الشريحة السابقة"
            type="button"
          >
            ‹
          </button>
          <button 
            className="hero-slider__btn hero-slider__btn--next" 
            onClick={next} 
            aria-label="الشريحة التالية"
            type="button"
          >
            ›
          </button>
          <nav className="hero-slider__dots" aria-label="تنقل بين الشرائح" role="tablist">
            {slides.map((_, i) => (
              <button 
                key={i} 
                className={`hero-slider__dot ${i === index ? 'is-active' : ''}`} 
                onClick={() => goTo(i)} 
                aria-label={`اذهب إلى الشريحة ${i + 1}`}
                aria-selected={i === index}
                role="tab"
                type="button"
              />
            ))}
          </nav>
        </>
      )}
    </section>
  );
});

export default HeroSlider;
