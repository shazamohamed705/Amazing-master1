const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://storage-te.com/backend/api/v1';

let articlesCache = null;
const articleDetailsCache = new Map();

const parseArticlesCollection = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const stripHtml = (input) => {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

export const extractArticleSummary = (article, maxLength = 160) => {
  if (!article) return '';
  const baseText = article.meta_description?.trim()
    ? article.meta_description
    : article.content || '';
  const text = stripHtml(baseText);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
};

export const fetchArticles = async (signal) => {
  if (articlesCache) {
    return articlesCache;
  }

  const response = await fetch(`${API_BASE_URL}/articles`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || 'تعذر جلب المقالات');
  }

  articlesCache = parseArticlesCollection(payload);
  return articlesCache;
};

export const fetchArticleDetails = async (identifier, signal) => {
  const safeKey = identifier ?? '';
  if (articleDetailsCache.has(safeKey)) {
    return articleDetailsCache.get(safeKey);
  }

  const response = await fetch(`${API_BASE_URL}/articles/${encodeURIComponent(safeKey)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || 'تعذر جلب تفاصيل المقال');
  }

  const details = payload?.data || payload;
  articleDetailsCache.set(safeKey, details);
  return details;
};

export const invalidateArticlesCache = () => {
  articlesCache = null;
  articleDetailsCache.clear();
};

