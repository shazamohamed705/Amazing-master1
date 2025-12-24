import React from 'react';
import { useMetaTags } from '../../hooks/useMetaTags';

/**
 * MetaTagsManager Component
 *
 * يدير تحديث meta tags من API بشكل منفصل عن Footer
 * لا يؤثر على أي component آخر في التطبيق
 */
const MetaTagsManager = React.memo(() => {
  // استدعاء useMetaTags hook لتحديث meta tags عند تحميل التطبيق
  useMetaTags();

  // هذا الcomponent لا يعرض أي محتوى مرئي
  return null;
});

MetaTagsManager.displayName = 'MetaTagsManager';

export default MetaTagsManager;
