import React, { memo, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaShare, FaCalendar, FaUser, FaTags } from 'react-icons/fa';
import { useToast } from '../../contexts/ToastContext';
import './BlogPost.css';
import { extractArticleSummary, fetchArticleDetails } from '../../services/articlesService';

const FALLBACK_IMAGE = 'https://cdn.salla.sa/DQYwE/raQ1rYI5nScXqOeZYufF1MOBEXNdxbvZZAsapUPU.jpg';

const BlogPost = memo(() => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const preloadedArticle = location.state?.article;
  const isSameArticle = preloadedArticle && (
    preloadedArticle.id?.toString() === id?.toString() ||
    preloadedArticle.slug?.toString() === id?.toString()
  );
  const [article, setArticle] = useState(isSameArticle ? preloadedArticle : null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(!article);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const numericId = Number(id);
        const lookupKey = Number.isNaN(numericId) ? id : numericId;
        const data = await fetchArticleDetails(lookupKey, controller.signal);
        if (!isMounted) return;
        setArticle(data?.main || null);
        setRelatedArticles(Array.isArray(data?.related) ? data.related : []);
        setLoading(false);
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching article details:', error);
        setArticle(isSameArticle ? preloadedArticle : null);
        setRelatedArticles([]);
        setError(error?.message || 'تعذر جلب المقال');
        setLoading(false);
      }
    };

    loadArticle();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id, isSameArticle, preloadedArticle]);

  const introText = useMemo(
    () => extractArticleSummary(article, 220),
    [article]
  );

  return (
    <div className="blog-post" dir="rtl">
      <div className="blog-post__container">
        {/* Content Section */}
        <div className="blog-post__content-wrapper">
          <div className="blog-post__main">
            <h2 className="blog-post__title">{article?.title || ''}</h2>
            <div className="blog-post-title-underline"></div>

            {/* Article Meta Information */}
            <div style={{ 
              display: 'flex', 
              gap: '1.5rem', 
              flexWrap: 'wrap', 
              marginBottom: '1.5rem',
              color: '#ABB3BA',
              fontSize: '14px'
            }} dir="rtl">
              {article?.created_at && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaCalendar />
                  <span>{new Date(article.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
              )}
              {article?.author?.name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaUser />
                  <span>{article.author.name}</span>
                </div>
              )}
              {article?.meta_keywords && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaTags />
                  <span>{article.meta_keywords}</span>
                </div>
              )}
            </div>

            {/* Small Hero Banner - replaced black block with image */}
            <div className="blog-post__banner">
              <div className="blog-post__banner-image">
                <img 
                  src={article?.image || FALLBACK_IMAGE} 
                  alt={article?.title || 'المقال'} 
                  style={{ width: '100%', height: 'auto', borderRadius: '12px' }}
                />
              </div>
            </div>

            {introText && (
              <div className="blog-post__intro">
                <h3 className="blog-post__intro-title">المقدمة</h3>
                <p className="blog-post__text">{introText}</p>
              </div>
            )}

            {/* Content Section */}
            <div style={{ marginTop: '2rem' }}>
              <div
                className="blog-post__content"
                dir="rtl"
                dangerouslySetInnerHTML={{ __html: article?.content || '' }}
              />
            </div>

            {/* Share Button */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button
                onClick={() => {
                  const url = window.location.href;
                  const text = article?.title || 'مقال من Storage';
                  if (navigator.share) {
                    navigator.share({
                      title: text,
                      url: url,
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(url).then(() => {
                      showToast('تم نسخ الرابط', 'success');
                    }).catch(() => {
                      showToast('فشل نسخ الرابط', 'error');
                    });
                  }
                }}
                style={{
                  background: '#F7EC06',
                  color: '#1F1F2C',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <FaShare />
                مشاركة المدونة
              </button>
            </div>

          </div>

          {/* Sidebar */}
          {!loading && (
            <aside className="blog-post__sidebar">
              <h3 className="blog-post__sidebar-title">مقالات ذات صلة</h3>
              {relatedArticles.length > 0 ? (
                <div className="blog-post__related">
                  {relatedArticles.map((relatedPost) => (
                    <button
                      key={relatedPost.id || relatedPost.slug}
                      type="button"
                      className="blog-post__related-item blog-post__related-item--button"
                      onClick={() => {
                        const targetId = relatedPost.id ?? relatedPost.slug;
                        if (!targetId) return;
                        navigate(`/blog/${encodeURIComponent(targetId)}`, {
                          state: { article: relatedPost },
                        });
                      }}
                    >
                      <div className="blog-post__related-image">
                        <img 
                          src={relatedPost.image || FALLBACK_IMAGE}
                          alt={relatedPost.title}
                          loading="lazy"
                        />
                        <div className="blog-post__related-logo">
                          <span className="blog-post__related-logo-letter">e</span>
                        </div>
                      </div>
                      <div className="blog-post__related-content">
                        <h4 className="blog-post__related-title">
                          {relatedPost.title}
                        </h4>
                        <p className="blog-post__related-subtitle">
                          {extractArticleSummary(relatedPost, 80)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#ccc', textAlign: 'center', padding: '1rem' }}>
                  لا توجد مقالات ذات صلة
                </p>
              )}
            </aside>
          )}
        </div>
        {loading && (
          <p style={{ color: '#fff', textAlign: 'center', marginTop: '1rem' }}>
            جاري تحميل المقال...
          </p>
        )}
        {!loading && error && (
          <p style={{ color: '#ff6b6b', textAlign: 'center', marginTop: '1rem' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
});

BlogPost.displayName = 'BlogPost';

export default BlogPost;

