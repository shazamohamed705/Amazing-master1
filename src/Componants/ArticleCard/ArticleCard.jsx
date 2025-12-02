import React, { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractArticleSummary } from '../../services/articlesService';
import './ArticleCard.css';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80';

const ArticleCard = memo(({ article }) => {
  const navigate = useNavigate();
  const summary = useMemo(
    () => extractArticleSummary(article, 140),
    [article],
  );

  const coverImage =
    article?.cover_image ||
    article?.image ||
    article?.thumbnail ||
    FALLBACK_IMAGE;

  const title = article?.title || article?.name || 'مقال بدون عنوان';

  const handleOpen = () => {
    if (!article) return;
    const identifier = article.id ?? article.slug ?? article.title;
    if (!identifier) return;
    navigate(`/blog/${encodeURIComponent(identifier)}`, {
      state: { article },
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpen();
    }
  };

  return (
    <article
      className="article-card"
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`قراءة ${title}`}
    >
      <div className="article-card__media">
        <img src={coverImage} alt={title} loading="lazy" />
      </div>
      <div className="article-card__body">
        <span className="article-card__eyebrow">
          {article?.category?.name || 'المدونة'}
        </span>
        <h3 className="article-card__title">{title}</h3>
        <p className="article-card__summary">{summary}</p>
        <div className="article-card__meta">
          <span>
            {article?.author?.name || 'Storage Team'}
          </span>
          {article?.created_at && (
            <span>
              {new Date(article.created_at).toLocaleDateString('ar-SA')}
            </span>
          )}
        </div>
      </div>
    </article>
  );
});

ArticleCard.displayName = 'ArticleCard';

export default ArticleCard;

