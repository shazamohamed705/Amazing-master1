const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://storage-te.com/backend/api/v1';

let portfolioCache = null;
const portfolioDetailsCache = new Map();

const parsePortfolioCollection = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const stripHtml = (input) => {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

export const extractPortfolioSummary = (portfolio, maxLength = 160) => {
  if (!portfolio) return '';
  const baseText = portfolio.meta_description?.trim()
    ? portfolio.meta_description
    : portfolio.content || portfolio.description || '';
  const text = stripHtml(baseText);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
};

export const fetchPortfolio = async (signal) => {
  if (portfolioCache) {
    return portfolioCache;
  }

  const response = await fetch(`${API_BASE_URL}/portfolio`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || 'تعذر جلب سابقة الأعمال');
  }

  portfolioCache = parsePortfolioCollection(payload);
  return portfolioCache;
};

export const fetchPortfolioDetails = async (identifier, signal) => {
  const safeKey = identifier ?? '';
  if (portfolioDetailsCache.has(safeKey)) {
    return portfolioDetailsCache.get(safeKey);
  }

  const response = await fetch(`${API_BASE_URL}/portfolio/${encodeURIComponent(safeKey)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || 'تعذر جلب تفاصيل المشروع');
  }

  const details = payload?.data || payload;
  portfolioDetailsCache.set(safeKey, details);
  return details;
};

export const invalidatePortfolioCache = () => {
  portfolioCache = null;
  portfolioDetailsCache.clear();
};

