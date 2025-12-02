import React, { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractPortfolioSummary } from '../../services/portfolioService';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80';

const PortfolioCard = memo(({ portfolio }) => {
  const navigate = useNavigate();
  const summary = useMemo(
    () => extractPortfolioSummary(portfolio, 140),
    [portfolio],
  );

  const coverImage =
    portfolio?.cover_image ||
    portfolio?.image ||
    portfolio?.thumbnail ||
    FALLBACK_IMAGE;

  const title = portfolio?.title || portfolio?.name || 'سابقة أعمال';
  const description =
    summary ||
    portfolio?.excerpt ||
    'تفاصيل المشروع سيتم عرضها عند فتح العنصر.';

  const handleNavigate = () => {
    if (!portfolio) return;
    const identifier = portfolio.id ?? portfolio.slug ?? portfolio.title;
    if (!identifier) return;
    navigate(`/portfolio/${encodeURIComponent(identifier)}`, {
      state: { item: portfolio },
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavigate();
    }
  };

  return (
    <article
      className="portfolio__card"
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`عرض تفاصيل ${title}`}
    >
      <div className="portfolio__card-header">
        <img
          src={coverImage}
          alt={title}
          className="portfolio__card-header-image"
          loading="lazy"
        />
      </div>
      <div className="portfolio__card-content">
        <div>
          <h3 className="portfolio__card-title">{title}</h3>
          <p className="portfolio__card-description">{description}</p>
        </div>
        <div className="portfolio__card-button">عرض التفاصيل</div>
      </div>
    </article>
  );
});

PortfolioCard.displayName = 'PortfolioCard';

export default PortfolioCard;

