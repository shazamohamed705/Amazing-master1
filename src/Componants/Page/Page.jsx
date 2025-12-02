import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Page.css';
import { apiClient, frontendApi } from '../../services/apiClient';

const PAGE_REQUESTS = [
  (slug, signal) => frontendApi.get(`/pages/${slug}`, { signal }),
  (slug, signal) => frontendApi.get(`/page/${slug}`, { signal }),
  (slug, signal) => apiClient.get(`/pages/${slug}`, { signal }),
];

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80';

const sanitizeHtml = (html = '') => {
  if (typeof window === 'undefined' || !html || typeof window.DOMParser !== 'function') {
    return html || '';
  }

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  doc.querySelectorAll('script, iframe, object').forEach((node) => node.remove());
  return doc.body.innerHTML;
};

const normalizePage = (payload, slug) => {
  const page = payload?.data ?? payload?.page ?? payload ?? {};
  const title = page.title ?? page.name ?? slug ?? 'صفحة';
  const content = page.content ?? page.body ?? '';
  const metaDescription = page.meta_description ?? page.description ?? '';
  const heroImage = page.cover_image ?? page.image ?? page.banner ?? null;

  return {
    ...page,
    title,
    content,
    metaDescription,
    heroImage,
    updated_at: page.updated_at ?? page.updatedAt ?? null,
  };
};

const fetchPageBySlug = async (slug, signal) => {
  if (!slug) {
    throw new Error('المسار المطلوب غير صالح');
  }

  let lastError;

  for (const requestFactory of PAGE_REQUESTS) {
    try {
      const data = await requestFactory(slug, signal);
      return normalizePage(data, slug);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError || new Error('تعذر تحميل الصفحة');
};

const Page = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      navigate('/home', { replace: true });
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    fetchPageBySlug(slug, controller.signal)
      .then((data) => {
        if (!isMounted) return;
        setPageData(data);
        setError(null);
      })
      .catch((err) => {
        if (!isMounted || err.name === 'AbortError') return;
        setError(err.message || 'تعذر تحميل الصفحة');
        setPageData(null);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [slug, navigate]);

  useEffect(() => {
    if (typeof document === 'undefined' || !pageData?.title) {
      return;
    }

    const previousTitle = document.title;
    document.title = `${pageData.title} | Storage`;

    return () => {
      document.title = previousTitle;
    };
  }, [pageData?.title]);

  useEffect(() => {
    if (typeof document === 'undefined' || !pageData?.metaDescription) {
      return;
    }

    const metaTag = document.querySelector('meta[name="description"]');
    const prevContent = metaTag ? metaTag.getAttribute('content') : null;

    if (metaTag) {
      metaTag.setAttribute('content', pageData.metaDescription);
    }

    return () => {
      if (metaTag && prevContent !== null) {
        metaTag.setAttribute('content', prevContent);
      }
    };
  }, [pageData?.metaDescription]);

  const safeContent = useMemo(
    () => sanitizeHtml(pageData?.content || ''),
    [pageData?.content],
  );

  const heroImage = pageData?.heroImage || FALLBACK_IMAGE;

  return (
    <section className="page-section" dir="rtl">
      <div
        className="page-hero"
        style={{ backgroundImage: `linear-gradient(135deg, rgba(20,20,32,0.85), rgba(20,20,32,0.65)), url(${heroImage})` }}
      >
        <div className="page-hero__content">
          <p className="page-hero__eyebrow">Storage للخدمات الرقمية</p>
          <h1 className="page-hero__title">{pageData?.title || 'جارٍ التحميل...'}</h1>
          {pageData?.metaDescription && (
            <p className="page-hero__subtitle">{pageData.metaDescription}</p>
          )}
        </div>
      </div>

      <div className="page-container">
        {loading && (
          <div className="page-card">
            <p className="page-status">جاري تحميل المحتوى...</p>
          </div>
        )}

        {!loading && error && (
          <div className="page-card page-card--error">
            <p className="page-status page-status--error">{error}</p>
            <button className="page-btn" onClick={() => navigate('/home')}>
              العودة للرئيسية
            </button>
          </div>
        )}

        {!loading && !error && pageData && (
          <article className="page-card">
            <div
              className="page-content"
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />
            {pageData.updated_at && (
              <p className="page-updated">
                آخر تحديث: {new Date(pageData.updated_at).toLocaleDateString('ar-SA')}
              </p>
            )}
          </article>
        )}
      </div>
    </section>
  );
};

export default Page;

