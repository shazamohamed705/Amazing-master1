const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://storage-te.com/backend/api/v1';
const FRONTEND_API_BASE_URL = process.env.REACT_APP_FRONTEND_API_BASE_URL || 'https://storage-te.com/backend/api/frontend';

// Optimized cache implementation with size limit
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100; // Limit cache size to prevent memory leaks

const getCacheKey = (url, options) => {
  // Optimize cache key generation - only include relevant options
  const relevantOptions = options.skipCache ? {} : {};
  return `${url}_${JSON.stringify(relevantOptions)}`;
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

// Improved retry logic with better error handling
const retryRequest = async (fn, retries = 5, delay = 2000) => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      // Don't retry on abort errors, auth errors, or network errors
      if (
        error.name === 'AbortError' ||
        (error.message && error.message.includes('401')) ||
        (error.message && error.message.includes('انتهت جلستك'))
      ) {
        throw error;
      }
      // Don't retry on last attempt
      if (i === retries - 1) {
        throw error;
      }
      // Exponential backoff
      await sleep(delay * Math.pow(2, i));
    }
  }
  throw lastError || new Error('فشل الطلب بعد عدة محاولات');
};

const setCache = (key, data) => {
  // Clean old cache entries if cache is too large
  if (cache.size >= MAX_CACHE_SIZE) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (now - v.timestamp >= CACHE_DURATION) {
        cache.delete(k);
      }
    }
    // If still too large, remove oldest entries
    if (cache.size >= MAX_CACHE_SIZE) {
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toDelete = entries.slice(0, Math.floor(MAX_CACHE_SIZE / 2));
      toDelete.forEach(([k]) => cache.delete(k));
    }
  }
  cache.set(key, { data, timestamp: Date.now() });
};

// Helper function to create fetch request with proper error handling
const createFetchRequest = async (url, method, body, options, baseUrl) => {
  const controller = new AbortController();
  const timeout = options.timeout || 60000;
  let timeoutId = null;
  
  // Set up timeout
  if (timeout > 0) {
    timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);
  }
  
  // Combine signals: if external signal exists, listen to it and abort our controller
  if (options.signal) {
    // If external signal is aborted, abort our controller too
    if (options.signal.aborted) {
      controller.abort();
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    } else {
      options.signal.addEventListener('abort', () => {
        controller.abort();
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      });
    }
  }
  
  // Use our controller's signal (which will be aborted if timeout or external signal aborts)
  const signal = controller.signal;

  try {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    // Add authorization token if available (for authenticated requests)
    if (options.requireAuth !== false) {
      const token = localStorage.getItem('userToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const fetchOptions = {
      method,
      headers,
      signal,
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`${baseUrl}${url}`, fetchOptions);
    
    // Clear timeout immediately after response
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // Parse JSON response safely
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseError) {
        data = {};
      }
    } else {
      data = {};
    }

    if (!response.ok) {
      if (response.status === 401 && options.requireAuth !== false) {
        localStorage.removeItem('userToken');
        throw new Error('انتهت جلستك. يرجى تسجيل الدخول مرة أخرى');
      }
      throw new Error(data.message || `حدث خطأ في الطلب (${response.status})`);
    }

    return data;
  } catch (error) {
    // Ensure timeout is cleared in error case
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    
    if (error.name === 'AbortError') {
      throw new Error('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى');
    }
    
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network'))) {
      throw new Error('حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت');
    }
    
    throw error;
  }
};

export const apiClient = {
  async get(url, options = {}) {
    const cacheKey = getCacheKey(url, options);
    const cached = getCached(cacheKey);
    if (cached && !options.skipCache) {
      return cached;
    }

    const data = await retryRequest(
      () => createFetchRequest(url, 'GET', null, { ...options, requireAuth: false }, API_BASE_URL),
      options.retries || 2
    );

    if (!options.skipCache) {
      setCache(cacheKey, data);
    }

    return data;
  },

  async post(url, body, options = {}) {
    return retryRequest(
      () => createFetchRequest(url, 'POST', body, { ...options, requireAuth: true }, API_BASE_URL),
      options.retries || 1
    );
  },

  async put(url, body, options = {}) {
    return retryRequest(
      () => createFetchRequest(url, 'PUT', body, { ...options, requireAuth: true }, API_BASE_URL),
      options.retries || 1
    );
  },

  async delete(url, options = {}) {
    return retryRequest(
      () => createFetchRequest(url, 'DELETE', null, { ...options, requireAuth: true }, API_BASE_URL),
      options.retries || 1
    );
  },
};

export const frontendApi = {
  async get(url, options = {}) {
    const cacheKey = getCacheKey(url, options);
    const cached = getCached(cacheKey);
    if (cached && !options.skipCache) {
      return cached;
    }

    const data = await retryRequest(
      () => createFetchRequest(url, 'GET', null, { ...options, requireAuth: false }, FRONTEND_API_BASE_URL),
      options.retries || 2
    );

    if (!options.skipCache) {
      setCache(cacheKey, data);
    }

    return data;
  },
};

// Function to clear all cache
export const clearApiCache = () => {
  cache.clear();
};

export default apiClient;

