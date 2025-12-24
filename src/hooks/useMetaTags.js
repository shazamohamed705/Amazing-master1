import { useEffect, useRef } from 'react';
import { frontendApi } from '../services/apiClient';

const META_CACHE_KEY = 'storage:meta-cache';
const META_CACHE_TTL = 10 * 60 * 1000; // 10 دقائق للmeta tags

let metaCache = loadMetaCache();

function loadMetaCache() {
  if (typeof window === 'undefined') {
    return { data: null, timestamp: 0 };
  }

  try {
    const raw = window.localStorage.getItem(META_CACHE_KEY);
    if (!raw) {
      return { data: null, timestamp: 0 };
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.data || typeof parsed.timestamp !== 'number') {
      return { data: null, timestamp: 0 };
    }

    if (Date.now() - parsed.timestamp > META_CACHE_TTL) {
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

function saveMetaCache(data) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      META_CACHE_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      }),
    );
  } catch {
    // تجاهل أخطاء التخزين
  }
}

function extractMetaTags(settings) {
  if (!settings) return {};

  return {
    title: settings.meta_title || settings.site_name || 'Loading',
    description: settings.meta_description || settings.site_description || 'متجر Loading يقدم حلول السوشيال ميديا المتكاملة',
    keywords: settings.meta_keywords || 'loading, تسويق رقمي, متابعين, تفاعل',
    googleAnalyticsId: settings.google_analytics_id || null,
    googleTagManagerId: settings.google_tag_manager_id || null,
    facebookPixelId: settings.facebook_pixel_id || null,
    siteName: settings.site_name || 'Loading',
    primaryColor: settings.primary_color || '#000000',
    secondaryColor: settings.secondary_color || '#ffffff',
  };
}

function updateDocumentMetaTags(metaTags) {
  if (typeof document === 'undefined') return;

  // تحديث title
  if (metaTags.title) {
    document.title = metaTags.title;
  }

  // تحديث أو إنشاء meta description
  let descriptionMeta = document.querySelector('meta[name="description"]');
  if (!descriptionMeta) {
    descriptionMeta = document.createElement('meta');
    descriptionMeta.setAttribute('name', 'description');
    document.head.appendChild(descriptionMeta);
  }
  if (metaTags.description) {
    descriptionMeta.setAttribute('content', metaTags.description);
  }

  // تحديث أو إنشاء meta keywords
  let keywordsMeta = document.querySelector('meta[name="keywords"]');
  if (!keywordsMeta) {
    keywordsMeta = document.createElement('meta');
    keywordsMeta.setAttribute('name', 'keywords');
    document.head.appendChild(keywordsMeta);
  }
  if (metaTags.keywords) {
    keywordsMeta.setAttribute('content', metaTags.keywords);
  }

  // تحديث Google Analytics
  if (metaTags.googleAnalyticsId) {
    // إزالة أي Google Analytics موجود سابقاً
    const existingGA = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    if (existingGA) {
      existingGA.remove();
    }

    // إضافة Google Analytics الجديد
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${metaTags.googleAnalyticsId}`;
    document.head.appendChild(gaScript);

    // إعداد gtag
    const gtagScript = document.createElement('script');
    gtagScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${metaTags.googleAnalyticsId}');
    `;
    document.head.appendChild(gtagScript);
  }

  // تحديث Facebook Pixel
  if (metaTags.facebookPixelId) {
    // إزالة أي Facebook Pixel موجود سابقاً
    const existingFB = document.querySelector('script[id="facebook-pixel"]');
    if (existingFB) {
      existingFB.remove();
    }

    const fbScript = document.createElement('script');
    fbScript.id = 'facebook-pixel';
    fbScript.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${metaTags.facebookPixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(fbScript);
  }

  // تحديث theme-color للهواتف المحمولة
  if (metaTags.primaryColor) {
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute('content', metaTags.primaryColor);
  }
}

export function useMetaTags() {
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const loadMetaTags = async () => {
      try {
        // محاولة الحصول على البيانات من الcache أولاً
        if (metaCache.data && Date.now() - metaCache.timestamp < META_CACHE_TTL) {
          updateDocumentMetaTags(metaCache.data);
          return;
        }

        // جلب البيانات من API
        const response = await frontendApi.get('/setting', {
          timeout: 5000, // timeout قصير للmeta tags
        });

        if (response) {
          const metaTags = extractMetaTags(response);
          updateDocumentMetaTags(metaTags);
          saveMetaCache(metaTags);
          metaCache = { data: metaTags, timestamp: Date.now() };
        }
      } catch (error) {
        console.warn('فشل في تحميل meta tags من API:', error.message);

        // استخدام الcache إذا كان متوفراً حتى لو انتهت صلاحيته
        if (metaCache.data) {
          updateDocumentMetaTags(metaCache.data);
        }
      }
    };

    loadMetaTags();
  }, []);

  // دالة لتحديث meta tags يدوياً إذا لزم الأمر
  const updateMetaTags = (newMetaTags) => {
    const updatedMetaTags = extractMetaTags(newMetaTags);
    updateDocumentMetaTags(updatedMetaTags);
    saveMetaCache(updatedMetaTags);
    metaCache = { data: updatedMetaTags, timestamp: Date.now() };
  };

  return { updateMetaTags };
}

export default useMetaTags;
