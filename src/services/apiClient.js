const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://storage-te.com/backend/api/v1';
const FRONTEND_API_BASE_URL = process.env.REACT_APP_FRONTEND_API_BASE_URL || 'https://storage-te.com/backend/api/frontend';

// Simple cache implementation
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (url, options) => {
  return `${url}_${JSON.stringify(options)}`;
};

const getCached = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryRequest = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      if (error.message && error.message.includes('401')) throw error; // Don't retry auth errors
      await sleep(delay * Math.pow(2, i)); // Exponential backoff
    }
  }
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const apiClient = {
  async get(url, options = {}) {
    const cacheKey = getCacheKey(url, options);
    const cached = getCached(cacheKey);
    if (cached && !options.skipCache) {
      return cached;
    }

    return retryRequest(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

      try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(options.headers || {}),
          },
          signal: options.signal || controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || 'حدث خطأ في الطلب');
        }

        if (!options.skipCache) {
          setCache(cacheKey, data);
        }

        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى');
        }
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت');
        }
        throw error;
      }
    }, options.retries || 2);
  },

  async post(url, body, options = {}) {
    const token = localStorage.getItem('userToken');
    return retryRequest(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

      try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {}),
          },
          body: JSON.stringify(body),
          signal: options.signal || controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('userToken');
            throw new Error('انتهت جلستك. يرجى تسجيل الدخول مرة أخرى');
          }
          throw new Error(data.message || 'حدث خطأ في الطلب');
        }

        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى');
        }
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت');
        }
        throw error;
      }
    }, options.retries || 1);
  },

  async put(url, body, options = {}) {
    const token = localStorage.getItem('userToken');
    return retryRequest(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

      try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {}),
          },
          body: JSON.stringify(body),
          signal: options.signal || controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('userToken');
            throw new Error('انتهت جلستك. يرجى تسجيل الدخول مرة أخرى');
          }
          throw new Error(data.message || 'حدث خطأ في الطلب');
        }

        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى');
        }
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت');
        }
        throw error;
      }
    }, options.retries || 1);
  },

  async delete(url, options = {}) {
    const token = localStorage.getItem('userToken');
    return retryRequest(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

      try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {}),
          },
          signal: options.signal || controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('userToken');
            throw new Error('انتهت جلستك. يرجى تسجيل الدخول مرة أخرى');
          }
          throw new Error(data.message || 'حدث خطأ في الطلب');
        }

        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى');
        }
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت');
        }
        throw error;
      }
    }, options.retries || 1);
  },
};

export const frontendApi = {
  async get(url, options = {}) {
    const cacheKey = getCacheKey(url, options);
    const cached = getCached(cacheKey);
    if (cached && !options.skipCache) {
      return cached;
    }

    return retryRequest(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

      try {
        const response = await fetch(`${FRONTEND_API_BASE_URL}${url}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            ...(options.headers || {}),
          },
          signal: options.signal || controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || 'حدث خطأ في الطلب');
        }

        if (!options.skipCache) {
          setCache(cacheKey, data);
        }

        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى');
        }
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت');
        }
        throw error;
      }
    }, options.retries || 2);
  },
};

export default apiClient;

