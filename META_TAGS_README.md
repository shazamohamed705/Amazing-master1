# نظام إدارة Meta Tags المستقل

## نظرة عامة

تم تطوير نظام منفصل لإدارة meta tags من API بدون التأثير على Footer أو أي مكون آخر في التطبيق.

## المكونات الجديدة

### 1. `useMetaTags` Hook (`src/hooks/useMetaTags.js`)

Hook مخصص لإدارة meta tags مع الميزات التالية:
- **تحميل مستقل**: يحمل meta tags من API بشكل منفصل عن useSettings
- **Cache ذكي**: يحفظ البيانات في localStorage لمدة 10 دقائق
- **تحديث تلقائي**: يحدث document.head تلقائياً عند تحميل البيانات
- **معالجة أخطاء**: يتعامل مع فشل API بأمان

### 2. `MetaTagsManager` Component (`src/Componants/MetaTags/MetaTagsManager.jsx`)

Component خفيف لا يعرض أي محتوى مرئي:
- يستدعي useMetaTags hook عند تحميل التطبيق
- لا يؤثر على أي مكون آخر
- يمكن إزالته في أي وقت دون مشاكل

### 3. `MetaTagsDebugger` Component (`src/Componants/MetaTags/MetaTagsDebugger.jsx`)

Component للتطوير والاختبار فقط:
- يعرض meta tags الحالية في الصفحة
- يختفي تلقائياً في الإنتاج
- مفيد للتحقق من عمل النظام

## البيانات المدارة

يتم تحديث البيانات التالية من API:

```javascript
{
  meta_title: "عنوان الصفحة",
  meta_description: "وصف الصفحة",
  meta_keywords: "كلمات مفتاحية",
  google_analytics_id: "GT-XXXXXXX",
  facebook_pixel_id: "XXXXXXXXXX",
  site_name: "اسم الموقع",
  primary_color: "#000000",
  secondary_color: "#ffffff"
}
```

## التحديثات على الكود الموجود

### `useSettings` Hook

تم تعديل `normalizeSettings` function لإزالة meta tags:
- لم يعد يتعامل مع meta_title, meta_description, إلخ
- يركز فقط على البيانات التي يحتاجها Footer والتطبيق
- أداء أفضل وذاكرة أقل

### `App.js`

تم إضافة MetaTagsManager:
- يتم تحميله في بداية التطبيق
- لا يؤثر على أداء التطبيق
- يمكن إزالته بسهولة

## كيفية العمل

1. **عند تحميل التطبيق**: يتم استدعاء MetaTagsManager
2. **جلب البيانات**: useMetaTags يحاول جلب البيانات من API
3. **التحديث**: يتم تحديث document.head بالmeta tags الجديدة
4. **الحفظ**: البيانات محفوظة في cache للاستخدام المستقبلي

## المزايا

✅ **استقلالية تامة**: meta tags منفصلة عن Footer
✅ **أداء محسن**: cache ذكي وتحميل سريع
✅ **أمان**: معالجة أخطاء شاملة
✅ **سهولة الصيانة**: كود منظم وقابل للقراءة
✅ **لا تأثير سلبي**: لا يؤثر على أي مكون آخر

## الاستخدام

النظام يعمل تلقائياً. لإزالة debugger في الإنتاج:

```javascript
// في App.js، أزل هذا السطر:
import MetaTagsDebugger from './Componants/MetaTags/MetaTagsDebugger';

// وأزل:
<MetaTagsDebugger />
```

## الاختبار

للتحقق من عمل النظام:
1. افتح Developer Tools > Elements
2. تحقق من `<head>` section
3. يجب أن ترى meta tags محدثة من API

## ملاحظات مهمة

- MetaTagsManager لا يعرض أي محتوى مرئي
- جميع meta tags يتم تحديثها في document.head
- النظام آمن ولا يسبب أخطاء إذا فشل API
- يدعم Google Analytics و Facebook Pixel تلقائياً
