import React, { useState, useEffect } from 'react';

/**
 * MetaTagsDebugger Component - للاختبار والتطوير فقط
 *
 * يعرض meta tags الحالية في الصفحة للتأكد من تحديثها
 */
const MetaTagsDebugger = () => {
  const [metaTags, setMetaTags] = useState({});

  useEffect(() => {
    const updateMetaTags = () => {
      const tags = {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || 'غير محدد',
        keywords: document.querySelector('meta[name="keywords"]')?.content || 'غير محدد',
        themeColor: document.querySelector('meta[name="theme-color"]')?.content || 'غير محدد',
        googleAnalytics: document.querySelector('script[src*="googletagmanager.com/gtag/js"]') ? 'موجود' : 'غير موجود',
        facebookPixel: document.querySelector('script[id="facebook-pixel"]') ? 'موجود' : 'غير موجود',
      };
      setMetaTags(tags);
    };

    // تحديث فوري
    updateMetaTags();

    // مراقبة التغييرات
    const observer = new MutationObserver(updateMetaTags);
    observer.observe(document.head, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  // إخفاء هذا الcomponent في الإنتاج
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: '#1F1F2C',
      color: '#fff',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      border: '1px solid #F7EC06',
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#F7EC06' }}>Meta Tags Debugger</h4>
      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {Object.entries(metaTags).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '5px' }}>
            <strong>{key}:</strong> {value}
          </div>
        ))}
      </div>
      <button
        onClick={() => setMetaTags({})}
        style={{
          marginTop: '10px',
          background: '#F7EC06',
          color: '#1F1F2C',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '11px'
        }}
      >
        تحديث
      </button>
    </div>
  );
};

export default MetaTagsDebugger;
