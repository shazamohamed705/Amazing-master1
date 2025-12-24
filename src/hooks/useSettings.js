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
const ENDPOINTS = ['/setting', ];

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
  let root = response?.data ?? response?.settings ?? response ?? {};

  // If data is in project_data_settings, parse it
  if (response?.project_data_settings && typeof response.project_data_settings === 'string') {
    try {
      const projectData = JSON.parse(response.project_data_settings);
      root = { ...root, ...projectData };
    } catch (error) {
      console.warn('Failed to parse project_data_settings:', error);
    }
  }
  
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

  // Extract Firebase settings
  const firebaseSettings = {
    firebase_api_key: root?.firebase_api_key || null,
    firebase_auth_domain: root?.firebase_auth_domain || null,
    firebase_project_id: root?.firebase_project_id || null,
    firebase_storage_bucket: root?.firebase_storage_bucket || null,
    firebase_messaging_sender_id: root?.firebase_messaging_sender_id || null,
    firebase_app_id: root?.firebase_app_id || null,
    firebase_measurement_id: root?.firebase_measurement_id || null,
    firebase_vapid_key: root?.firebase_vapid_key || null,
  };

  // Return normalized settings with all social media URLs and other settings (excluding meta tags)
  const {
    meta_title,
    meta_description,
    meta_keywords,
    google_analytics_id,
    google_tag_manager_id,
    facebook_pixel_id,
    ...settingsWithoutMeta
  } = root;

  return {
    ...DEFAULT_SETTINGS,
    ...settingsWithoutMeta,
    ticker: {
      ...DEFAULT_SETTINGS.ticker,
      ...normalizedTicker,
    },
    ...firebaseSettings,
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

    // Try each endpoint with timeout protection
    for (const endpoint of ENDPOINTS) {
      try {
        // Add timeout to prevent hanging requests (apiClient already has timeout, but we add extra safety)
        const data = await frontendApi.get(endpoint, {
          signal,
          skipCache: force,
          timeout: 10000, // 10 seconds timeout per request
        });

        const normalized = normalizeSettings(data);
        cacheState = { data: normalized, timestamp: Date.now() };
        persistSettings(normalized);
        return normalized;
      } catch (error) {
        lastError = error;
        // If signal is aborted, stop trying
        if (signal?.aborted || error.name === 'AbortError') {
          throw error;
        }
        // Continue to next endpoint
      }
    }

    // If all endpoints failed, return default settings instead of throwing
    // This prevents the app from hanging
    console.warn('فشل تحميل الإعدادات من جميع الـ endpoints، استخدام الإعدادات الافتراضية');
    const defaultSettings = { ...DEFAULT_SETTINGS };
    cacheState = { data: defaultSettings, timestamp: Date.now() };
    persistSettings(defaultSettings);
    return defaultSettings;
  };

  if (force) {
    return request();
  }

  inFlightPromise = request()
    .catch((error) => {
      // If error occurs, return default settings to prevent app hanging
      if (error.name === 'AbortError' || signal?.aborted) {
        throw error;
      }
      console.warn('خطأ في تحميل الإعدادات:', error.message);
      const defaultSettings = { ...DEFAULT_SETTINGS };
      cacheState = { data: defaultSettings, timestamp: Date.now() };
      return defaultSettings;
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

    // Add timeout to prevent infinite hanging
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        controller.abort();
        setLoading(false);
        setError(null); // Don't show error, use defaults silently
        // Use default settings as fallback
        setSettings(DEFAULT_SETTINGS);
      }
    }, 15000); // 15 seconds max wait time

    fetchSettings({ signal: controller.signal })
      .then((data) => {
        clearTimeout(timeoutId);
        if (isMounted) {
          setSettings(data);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError' || !isMounted) {
          return;
        }
        // Don't show error if we have default settings
        if (isMounted) {
          setError(null); // Don't show error to user, use defaults silently
          setSettings(DEFAULT_SETTINGS);
          setLoading(false);
        }
      });

    return () => {
      clearTimeout(timeoutId);
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

  // Function to clear cache
  const clearCache = useCallback(() => {
    cacheState = { data: null, timestamp: 0 };
    inFlightPromise = null;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn('Failed to clear settings cache:', error);
      }
    }
  }, []);

  return {
    settings,
    ticker: settings.ticker,
    loading,
    error,
    refresh,
    clearCache,
    updatedAt: cacheState.timestamp || null,
  };
}

export default useSettings;

