import React, { memo, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortfolioCard from '../PortfolioCard/PortfolioCard';
import './Portfolio.css';
import { extractPortfolioSummary, fetchPortfolio } from '../../services/portfolioService';

const FALLBACK_IMAGE = 'https://cdn.salla.sa/DQYwE/60e65ac0-11ff-4c02-a51d-1df33680522d-500x375.10584250635-jfWA4k2ZTz1KIraipWtBoxrfuWrIO1Npoq146dPR.jpg';

const Portfolio = memo(() => {
  const [visibleItems, setVisibleItems] = useState(6);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadPortfolio = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPortfolio(controller.signal);
        if (isMounted) {
          setPortfolioItems(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching portfolio:', error);
        setPortfolioItems([]);
        setError(error?.message || 'تعذر تحميل سابقة الأعمال');
        setLoading(false);
      }
    };

    loadPortfolio();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const displayedItems = useMemo(
    () => portfolioItems.slice(0, visibleItems),
    [portfolioItems, visibleItems]
  );

  const handleLoadMore = () => {
    setVisibleItems(prev => prev + 6);
  };

  const handleNavigate = (item) => {
    if (!item) return;
    const targetId = typeof item.id !== 'undefined' && item.id !== null
      ? item.id
      : item.slug;
    if (!targetId) return;
    navigate(`/portfolio/${encodeURIComponent(targetId)}`, { state: { item } });
  };

  return (
    <div className="portfolio" dir="rtl">
      <div className="portfolio__header">
        <h1 className="portfolio__title">سابقة الأعمال</h1>
        <div className="portfolio__title-underline"></div>
      </div>

      {loading && (
        <p style={{ color: '#fff', textAlign: 'center', marginBottom: '1.5rem' }}>
          جاري تحميل سابقة الأعمال...
        </p>
      )}

      {!loading && error && (
        <p style={{ color: '#ff6b6b', textAlign: 'center', marginBottom: '1.5rem' }}>
          {error}
        </p>
      )}

      {!loading && !error && displayedItems.length === 0 && (
        <p style={{ color: '#fff', textAlign: 'center', marginBottom: '1.5rem' }}>
          لا توجد أعمال متاحة حالياً.
        </p>
      )}

      <div className="portfolio__grid portfolio__grid--cards">
        {displayedItems.map((item) => (
          <PortfolioCard key={item.id || item.slug || item.title} portfolio={item} />
        ))}
      </div>

      {!loading && !error && visibleItems < portfolioItems.length && portfolioItems.length > 0 && (
        <div className="portfolio__load-more">
          <button className="portfolio__load-more-btn" onClick={handleLoadMore}>
            تحميل المزيد
          </button>
        </div>
      )}
    </div>
  );
});

Portfolio.displayName = 'Portfolio';

export default Portfolio;

