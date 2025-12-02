import React, { memo, useMemo, useEffect, useRef, useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import './ContactBar.css';

// Social media icons as components for better performance
const SocialIcon = memo(({ children, ...props }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}>
    {children}
  </svg>
));

SocialIcon.displayName = 'SocialIcon';

const SOCIAL_ICONS = {
  youtube: <SocialIcon><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></SocialIcon>,
  tiktok: <SocialIcon><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></SocialIcon>,
  snapchat: <SocialIcon><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.510.075.045.203.09.401.09.3 0 .719-.084 1.038-.18.418-.125.773-.187 1.058-.187.504 0 .898.259 1.078.663.115.259.125.564-.015.848-.12.239-.375.503-.728.783-.214.169-.46.354-.739.572l-.013.01c-.593.46-1.107.862-1.235 1.174-.004.01-.006.015-.01.025-.012.045-.018.075-.018.105 0 .09.048.165.119.229.12.105.289.211.534.406l.064.052c.425.349.96.785 1.228 1.496.149.397.195.895.03 1.425-.15.48-.48.915-1.065 1.275-.45.27-1.02.465-1.65.615-.06.015-.105.03-.165.045-.54.12-1.17.225-1.755.465-.12.045-.255.09-.405.135-.3.09-.645.195-.915.314-.09.045-.18.09-.27.119-.105.045-.195.075-.3.119v.015c-.314.134-.629.254-.944.359-.354.12-.708.224-1.062.314-.195.045-.375.090-.555.135-.209.045-.375.074-.524.074-.3 0-.57-.135-.78-.375-.15-.165-.27-.375-.375-.615-.09-.225-.195-.51-.314-.81-.105-.255-.225-.54-.375-.855-.12-.255-.27-.495-.42-.705-.104-.165-.239-.345-.374-.495-.104-.12-.239-.225-.375-.3-.104-.09-.239-.165-.374-.225-.195-.09-.42-.15-.645-.195-.314-.06-.659-.09-1.02-.09-.375 0-.734.03-1.065.09-.225.045-.45.105-.645.195-.135.06-.27.135-.375.225-.135.075-.27.18-.375.3-.135.15-.27.33-.375.495-.15.21-.3.45-.42.705-.15.315-.27.6-.375.855-.12.3-.225.585-.315.81-.104.24-.224.45-.374.615-.21.24-.48.375-.78.375-.15 0-.315-.03-.525-.074-.18-.045-.36-.09-.555-.135-.353-.09-.708-.194-1.062-.314-.314-.105-.629-.225-.943-.359v-.015c-.105-.044-.195-.074-.3-.119-.09-.03-.18-.074-.27-.119-.27-.119-.615-.224-.915-.314-.15-.045-.285-.09-.405-.135-.585-.24-1.215-.345-1.755-.465-.06-.015-.105-.03-.165-.045-.629-.15-1.2-.345-1.65-.615-.584-.36-.914-.795-1.064-1.275-.165-.53-.12-1.028.03-1.425.267-.711.803-1.147 1.228-1.496l.064-.052c.245-.195.414-.301.534-.406.071-.064.119-.139.119-.229 0-.03-.006-.06-.018-.104-.003-.011-.006-.016-.01-.025-.128-.313-.642-.715-1.235-1.175l-.013-.01c-.279-.218-.525-.403-.739-.572-.353-.28-.608-.544-.728-.783-.14-.284-.13-.589-.015-.848.18-.404.574-.663 1.078-.663.285 0 .64.062 1.058.187.319.096.738.18 1.038.18.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.859 1.069 11.216.793 12.206.793z"/></SocialIcon>,
  twitter: <SocialIcon><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></SocialIcon>,
  instagram: <SocialIcon><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></SocialIcon>,
  facebook: <SocialIcon><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></SocialIcon>,
  linkedin: <SocialIcon><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></SocialIcon>,
};

// Social media platforms configuration
const SOCIAL_PLATFORMS = Object.freeze([
  { key: 'youtube', settingKey: 'youtube_url', label: 'YouTube' },
  { key: 'tiktok', settingKey: 'tiktok_url', label: 'TikTok' },
  { key: 'snapchat', settingKey: 'snapchat_url', label: 'Snapchat' },
  { key: 'twitter', settingKey: 'twitter_url', label: 'Twitter' },
  { key: 'instagram', settingKey: 'instagram_url', label: 'Instagram' },
  { key: 'facebook', settingKey: 'facebook_url', label: 'Facebook' },
  { key: 'linkedin', settingKey: 'linkedin_url', label: 'LinkedIn' },
]);

// WhatsApp icon component
const WhatsAppIcon = memo(() => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
));

WhatsAppIcon.displayName = 'WhatsAppIcon';

// Helper function to format WhatsApp URL
const formatWhatsAppUrl = (phone) => {
  if (!phone || typeof phone !== 'string') return null;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length > 0 ? `https://wa.me/${cleaned}` : null;
};

// Helper function to validate and format URL
const formatUrl = (url) => {
  // Handle null, undefined, or empty values
  if (!url) return null;
  
  // Convert to string if not already
  const urlString = typeof url === 'string' ? url : String(url);
  const trimmed = urlString.trim();
  
  // Reject empty strings or invalid values
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === 'false') {
    return null;
  }
  
  // Already has protocol
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  
  // Add https:// if missing
  return `https://${trimmed}`;
};

const ContactBar = memo(function ContactBar() {
  const { settings } = useSettings();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const observerRef = useRef(null);

  // IntersectionObserver to trigger animation when section enters viewport
  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { root: null, threshold: 0.2 }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  // Memoize social links - show all icons with fallback URLs like Footer
  const socialLinks = useMemo(() => {
    // Fallback URLs for each platform
    const fallbackUrls = {
      instagram: 'https://www.instagram.com/storage.eg/?hl=ar',
      facebook: 'https://www.facebook.com/storage.eg',
      tiktok: 'https://www.tiktok.com/@storage.eg',
      snapchat: 'https://www.snapchat.com/@storage.eg',
      twitter: 'https://x.com/StorageEg',
      youtube: null,
      linkedin: null,
    };

    return SOCIAL_PLATFORMS.map(({ key, settingKey, label }) => {
      const urlValue = settings?.[settingKey];
      const formattedUrl = formatUrl(urlValue);
      // Use formatted URL from settings, or fallback URL, or #
      const url = formattedUrl || fallbackUrls[key] || '#';
      const hasValidUrl = Boolean(formattedUrl);
      return { key, url, label, icon: SOCIAL_ICONS[key], hasValidUrl };
    });
  }, [settings]);

  // Memoize WhatsApp URL
  const whatsappUrl = useMemo(() => {
    return formatWhatsAppUrl(settings?.contact_whatsapp);
  }, [settings?.contact_whatsapp]);

  return (
    <section 
      className={`contact-bar ${isVisible ? 'contact-bar--visible' : ''}`} 
      dir="rtl"
      ref={sectionRef}
    >
      <div className="contact-bar__container">
        <div className="contact-bar__social">
          {socialLinks.map(({ key, url, label, icon, hasValidUrl }) => (
            <a
              key={key}
              href={url}
              target={hasValidUrl ? "_blank" : undefined}
              rel={hasValidUrl ? "noopener noreferrer" : undefined}
              className="contact-bar__icon"
              aria-label={label}
              onClick={(e) => {
                if (!hasValidUrl) {
                  e.preventDefault();
                }
              }}
            >
              {icon}
            </a>
          ))}
        </div>

        <h2 className="contact-bar__title">ودك تبدأ؟ تواصل معنا الآن</h2>

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-bar__button"
          >
            <WhatsAppIcon />
            تواصل معنا الآن
          </a>
        )}
      </div>
    </section>
  );
});

ContactBar.displayName = 'ContactBar';

export default ContactBar;
