import { useCallback, useEffect, useRef, useState } from 'react';
import { frontendApi } from '../services/apiClient';

const STORAGE_KEY = 'storage:settings-cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 دقائق
const DEFAULT_SETTINGS = Object.freeze({
  ticker: {
    enabled: false,
    text: '',
  },
});
const ENDPOINTS = ['/setting', '/settings', '/home/settings', '/configuration'];

let cacheState = readPersistedSettings();
let inFlightPromise = null;

function readPersistedSettings() {
  if (typeof window === 'undefined') {
    return { data: null, timestamp: 0 };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { data: null, timestamp: 0 };
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.data || typeof parsed.timestamp !== 'number') {
      return { data: null, timestamp: 0 };
    }

    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      return { data: null, timestamp: 0 };
    }

    return {
      data: parsed.data,
      timestamp: parsed.timestamp,
    };
  } catch {
    return { data: null, timestamp: 0 };
  }
}

function persistSettings(data) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      }),
    );
  } catch {
    // تجاهل أي أخطاء في التخزين
  }
}

function normalizeSettings(response) {
  // Handle different response structures
  const root = response?.data ?? response?.settings ?? response ?? {};
  
  // Extract ticker settings
  const tickerSource =
    root?.ticker ??
    root?.ticker_settings ??
    root?.tickerSettings ??
    root?.settings?.ticker ??
    null;

  const normalizedTicker = (() => {
    if (!tickerSource) {
      return DEFAULT_SETTINGS.ticker;
    }

    if (typeof tickerSource === 'string') {
      const trimmed = tickerSource.trim();
      return {
        enabled: trimmed.length > 0,
        text: trimmed,
      };
    }

    if (typeof tickerSource === 'object') {
      const text =
        tickerSource.text ??
        tickerSource.message ??
        tickerSource.content ??
        '';

      const statusValue =
        tickerSource.enabled ??
        tickerSource.is_active ??
        tickerSource.isActive ??
        tickerSource.status;

      return {
        enabled:
          typeof statusValue === 'boolean'
            ? statusValue
            : Boolean(text && text.toString().trim().length),
        text: (text ?? '').toString(),
      };
    }

    return DEFAULT_SETTINGS.ticker;
  })();

  // Return normalized settings with all social media URLs and other settings
  return {
    ...DEFAULT_SETTINGS,
    ...root,
    ticker: {
      ...DEFAULT_SETTINGS.ticker,
      ...normalizedTicker,
    },
  };
}

function hasFreshCache() {
  return (
    Boolean(cacheState.data) &&
    Date.now() - (cacheState.timestamp || 0) < CACHE_TTL
  );
}

async function fetchSettings({ signal, force = false } = {}) {
  if (!force && hasFreshCache()) {
    return cacheState.data;
  }

  if (!force && inFlightPromise) {
    return inFlightPromise;
  }

  const request = async () => {
    let lastError;

    for (const endpoint of ENDPOINTS) {
      try {
        const data = await frontendApi.get(endpoint, {
          signal,
          skipCache: force,
        });
        const normalized = normalizeSettings(data);
        cacheState = { data: normalized, timestamp: Date.now() };
        persistSettings(normalized);
        return normalized;
      } catch (error) {
        lastError = error;
        // نجرب نقطة النهاية التالية
      }
    }

    throw lastError || new Error('تعذر تحميل الإعدادات');
  };

  if (force) {
    return request();
  }

  inFlightPromise = request()
    .catch((error) => {
      throw error;
    })
    .finally(() => {
      inFlightPromise = null;
    });

  return inFlightPromise;
}

export function useSettings() {
  const [settings, setSettings] = useState(() => cacheState.data || DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(() => !hasFreshCache());
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (hasFreshCache()) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    fetchSettings({ signal: controller.signal })
      .then((data) => {
        if (isMounted) {
          setSettings(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError' || !isMounted) {
          return;
        }
        setError(err.message || 'حدث خطأ أثناء تحميل الإعدادات');
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    };
  }, []);

  const refresh = useCallback(async () => {
    const controller = new AbortController();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchSettings({ signal: controller.signal, force: true });
      setSettings(data);
      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        return null;
      }
      setError(err.message || 'حدث خطأ أثناء تحديث الإعدادات');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    settings,
    ticker: settings.ticker,
    loading,
    error,
    refresh,
    updatedAt: cacheState.timestamp || null,
  };
}

export default useSettings;

