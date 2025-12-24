import React, { memo, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArticleCard from '../ArticleCard/ArticleCard';
import './Blog.css';
import { extractArticleSummary, fetchArticles } from '../../services/articlesService';

const FALLBACK_IMAGE = 'https://cdn.salla.sa/DQYwE/60e65ac0-11ff-4c02-a51d-1df33680522d-500x375.10584250635-jfWA4k2ZTz1KIraipWtBoxrfuWrIO1Npoq146dPR.jpg';

const Blog = memo(() => {
  const [visiblePosts, setVisiblePosts] = useState(6);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchArticles(controller.signal);
        if (isMounted) {
          setArticles(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching articles:', error);
        setArticles([]);
        setError(error?.message || 'تعذر تحميل المقالات');
        setLoading(false);
      }
    };

    loadArticles();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const displayedArticles = useMemo(
    () => articles.slice(0, visiblePosts),
    [articles, visiblePosts]
  );

  const handleLoadMore = () => {
    setVisiblePosts(prev => prev + 6);
  };

  const handleNavigate = (post) => {
    if (!post) return;
    const targetId = typeof post.id !== 'undefined' && post.id !== null
      ? post.id
      : post.slug;
    if (!targetId) return;
    navigate(`/blog/${encodeURIComponent(targetId)}`, { state: { article: post } });
  };

  return (
    <div className="blog" dir="rtl">
      <div className="blog__header">
        <h1 className="blog__title">المدونة</h1>
        <div className="blog__underline"></div>
      </div>

      {loading && (
        <p style={{ color: '#fff', textAlign: 'center', marginBottom: '1.5rem' }}>
          جاري تحميل المقالات...
        </p>
      )}

      {!loading && error && (
        <p style={{ color: '#ff6b6b', textAlign: 'center', marginBottom: '1.5rem' }}>
          {error}
        </p>
      )}

      {!loading && !error && displayedArticles.length === 0 && (
        <p style={{ color: '#fff', textAlign: 'center', marginBottom: '1.5rem' }}>
          لا توجد مقالات متاحة حالياً.
        </p>
      )}

      <div className="blog__grid blog__grid--cards">
        {displayedArticles.map((post) => (
          <ArticleCard key={post.id || post.slug || post.title} article={post} />
        ))}
      </div>

      {!loading && !error && visiblePosts < articles.length && articles.length > 0 && (
        <div className="blog__load-more">
          <button className="blog__load-more-btn" onClick={handleLoadMore}>
            تحميل المزيد
          </button>
        </div>
      )}
    </div>
  );
});

Blog.displayName = 'Blog';

export default Blog;

