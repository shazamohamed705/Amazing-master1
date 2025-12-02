import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowSmallLeft } from "react-icons/hi2";
import { HiArrowSmallRight } from "react-icons/hi2";
import './ServicesSlider.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://storage-te.com/backend/api/v1';

const ServicesSlider = memo(function ServicesSlider() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/categories`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data?.success) {
          const allCategories = Array.isArray(data.data) ? data.data : [];
          // Filter only parent categories (parent_id is null) and active ones that should show in navbar
          const parentCategories = allCategories.filter(cat => 
            cat.parent_id === null && 
            cat.is_active === true && 
            cat.show_in_navbar === true
          );
          
          // Sort by sort_order
          parentCategories.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

          // Transform to items format with icon image
          const categoryItems = parentCategories.map(cat => {
            // Use icon if available, otherwise use default image
            const imageUrl = cat.icon && cat.icon.trim() !== '' 
              ? cat.icon 
              : 'https://cdn.salla.sa/form-builder/wQpsBmml66COkI01vSIjWfiTSUI8sCX7tuFssmYN.png';
            
            return {
              id: cat.id,
              title: cat.name,
              img: imageUrl,
              link: `/category/${cat.slug}`,
            };
          });

          setItems(categoryItems);
        } else {
          console.error('Error fetching categories:', data.message);
          setItems([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Responsive visible cards based on screen size
  const getVisibleCards = useCallback(() => {
    const width = window.innerWidth;
    if (width > 1024) return 6;      // Desktop: 6 cards
    if (width > 768) return 4;       // Tablet: 4 cards
    if (width > 480) return 3;       // Mobile: 3 cards
    return 2;                        // Small Mobile: 2 cards
  }, []);

  const [visible, setVisible] = useState(getVisibleCards);
  const [index, setIndex] = useState(0);
  const maxIndex = Math.max(0, items.length - visible);
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollIntervalRef = useRef(null);
  const titleRef = useRef(null);
  const dividerRef = useRef(null);
  const sectionRef = useRef(null);
  const itemRefs = useRef([]);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const newVisible = getVisibleCards();
      if (newVisible !== visible) {
        setVisible(newVisible);
        // Reset index if it exceeds new maxIndex
        setIndex((prev) => Math.min(prev, Math.max(0, items.length - newVisible)));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [visible, getVisibleCards, items.length]);

  // Move one card at a time for smooth scrolling like Facebook
  const next = useCallback(() => {
    setIsPaused(true);
    setIndex((prevIndex) => (prevIndex >= maxIndex ? prevIndex : prevIndex + 1));
    // Resume auto scroll after 5 seconds
    setTimeout(() => setIsPaused(false), 5000);
  }, [maxIndex]);

  const prev = useCallback(() => {
    setIsPaused(true);
    setIndex((prevIndex) => (prevIndex <= 0 ? prevIndex : prevIndex - 1));
    // Resume auto scroll after 5 seconds
    setTimeout(() => setIsPaused(false), 5000);
  }, [maxIndex]);

  const goTo = useCallback((i) => {
    setIsPaused(true);
    setIndex(Math.min(Math.max(i, 0), maxIndex));
    // Resume auto scroll after 5 seconds
    setTimeout(() => setIsPaused(false), 5000);
  }, [maxIndex]);

  const currentPage = index;
  const totalPages = maxIndex + 1;

  // Calculate card width + gap for smooth scrolling
  const getCardWidth = useCallback(() => {
    const width = window.innerWidth;
    if (width > 1024) return 170 + 40; // 170px card + 2.5rem gap (40px)
    if (width > 768) return 170 + 32;  // 170px card + 2rem gap (32px)
    if (width > 480) return 130 + 19.2; // 130px card + 1.2rem gap (19.2px)
    return 110 + 16; // 110px card + 1rem gap (16px)
  }, []);

  const [cardWidth, setCardWidth] = useState(getCardWidth);

  // Update card width on resize
  useEffect(() => {
    const handleResize = () => {
      const newCardWidth = getCardWidth();
      if (newCardWidth !== cardWidth) {
        setCardWidth(newCardWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [cardWidth, getCardWidth]);

  // Auto scroll functionality
  useEffect(() => {
    // Only auto scroll if there are multiple pages
    if (totalPages <= 1 || isPaused) {
      return;
    }

    // Clear any existing interval
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
    }

    // Set up auto scroll interval (every 2 seconds)
    autoScrollIntervalRef.current = setInterval(() => {
      setIndex((prevIndex) => {
        if (prevIndex >= maxIndex) {
          // Reset to beginning when reaching the end
          return 0;
        }
        return prevIndex + 1;
      });
    }, 2000);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [maxIndex, totalPages, isPaused]);

  // Pause auto scroll on hover
  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Set divider width to match title width
  useEffect(() => {
    const updateDividerWidth = () => {
      if (titleRef.current && dividerRef.current) {
        const titleWidth = titleRef.current.offsetWidth;
        dividerRef.current.style.width = `${titleWidth}px`;
      }
    };

    // Use setTimeout to ensure DOM is fully rendered
    const timeoutId = setTimeout(updateDividerWidth, 0);
    window.addEventListener('resize', updateDividerWidth);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateDividerWidth);
    };
  }, [loading, items.length]);

  // Scroll reveal animation for each item using Intersection Observer
  useEffect(() => {
    if (items.length === 0) return;

    const observers = [];
    
    itemRefs.current.forEach((itemRef, index) => {
      if (!itemRef) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Add delay based on index for smooth staggered animation
              const delay = index * 150; // 150ms delay between each item for smooth flow
              setTimeout(() => {
                entry.target.classList.add('services__item--visible');
              }, delay);
            } else {
              // Remove class when out of view to allow re-animation on scroll
              entry.target.classList.remove('services__item--visible');
            }
          });
        },
        { 
          root: null, 
          threshold: 0.05,
          rootMargin: '100px'
        }
      );

      observer.observe(itemRef);
      observers.push({ observer, element: itemRef });
    });

    return () => {
      observers.forEach(({ observer, element }) => {
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [items.length, loading]);

  // Initialize item refs array
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
  }, [items.length]);

  if (loading) {
    return (
      <section ref={sectionRef} className="services" dir="rtl">
        <div className="services__container">
          <div className="services__title-wrapper">
            <h2 ref={titleRef} className="services__title">خدماتنا</h2>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
            جاري التحميل...
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section ref={sectionRef} className="services" dir="rtl">
        <div className="services__container">
          <div className="services__title-wrapper">
            <h2 ref={titleRef} className="services__title">خدماتنا</h2>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
            لا توجد فئات متاحة
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="services" dir="rtl">
      <div className="services__container">
        <div className="services__title-wrapper">
          <h2 ref={titleRef} className="services__title">خدماتنا</h2>
        </div>
        <div 
          ref={dividerRef}
          data-sal="slide-up" 
          data-sal-delay="170" 
          data-sal-duration="700" 
          className="main-links-style-2-heading-divider section-heading-divider sal-animate"
        ></div>

        <div 
          className="services__slider"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="services__viewport">
            <div className="services__track" style={{ transform: `translateX(calc(-50% + ${index * cardWidth}px))` }}>
              {items.map((it, idx) => (
                <Link 
                  key={it.id} 
                  to={it.link} 
                  className="services__item"
                  data-index={idx}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                >
                  <div className="services__card">
                    <img 
                      className="services__img" 
                      src={it.img} 
                      alt={it.title}
                      onError={(e) => {
                        // Fallback to default image if icon fails to load
                        e.target.src = 'https://cdn.salla.sa/form-builder/wQpsBmml66COkI01vSIjWfiTSUI8sCX7tuFssmYN.png';
                      }}
                      loading="eager"
                    />
                  </div>
                  <div className="services__label">{it.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="services__controls">
            <button 
              className={`services__arrow ${index === 0 ? 'services__arrow--disabled' : ''}`} 
              onClick={prev} 
              aria-label="السابق"
              disabled={index === 0}
            >
              <HiArrowSmallRight />
            </button>
            <div className="services__dots">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} className={`services__dot ${i===currentPage? 'is-active':''}`} onClick={() => goTo(i)} aria-label={`صفحة ${i+1}`} />
              ))}
            </div>
            <button 
              className={`services__arrow ${index >= maxIndex ? 'services__arrow--disabled' : ''}`} 
              onClick={next} 
              aria-label="التالي"
              disabled={index >= maxIndex}
            >
              <HiArrowSmallLeft />
            </button>
          </div>
        )}
      </div>
    </section>
  );
});

export default ServicesSlider;
