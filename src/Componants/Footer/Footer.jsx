import React, { memo, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MdWhatsapp, MdOutlineMailOutline } from "react-icons/md";
import { BsTelephone } from "react-icons/bs";
import { FaMobileScreen, FaThreads } from "react-icons/fa6";
import { FaInstagram, FaFacebookF, FaTiktok, FaSnapchat, FaLink, FaTwitter, FaYoutube, FaLinkedin } from "react-icons/fa";
import { HiLink } from "react-icons/hi";
import { useSettings } from '../../hooks/useSettings';
import './Footer.css';
import './FooterAnimatedLogo.css';
import logoImg from '../../assets/logooo.png';

const API_BASE_URL = 'https://storage-te.com/backend/api/frontend';

// Helper function to format WhatsApp URL
const formatWhatsAppUrl = (phone) => {
  if (!phone || typeof phone !== 'string') return null;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length > 0 ? `https://wa.me/${cleaned}` : null;
};

// Helper function to format phone URL
const formatPhoneUrl = (phone) => {
  if (!phone || typeof phone !== 'string') return null;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length > 0 ? `tel:${cleaned}` : null;
};

// Helper function to format email URL
const formatEmailUrl = (email) => {
  if (!email || typeof email !== 'string') return null;
  const trimmed = email.trim();
  return trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? `mailto:${trimmed}` : null;
};

// Helper function to format social media URL - improved validation
const formatSocialUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  
  // Check for invalid values
  if (!trimmed || 
      trimmed === 'null' || 
      trimmed === 'undefined' || 
      trimmed === 'false' ||
      trimmed === '#' ||
      trimmed === '' ||
      trimmed.toLowerCase() === 'https://locahost.com' || // Common typo
      trimmed.toLowerCase() === 'https://localhost.com' ||
      trimmed.toLowerCase().includes('localhost')) {
    return null;
  }
  
  // Validate URL format
  try {
    // If already has protocol, validate it
    if (/^https?:\/\//i.test(trimmed)) {
      const urlObj = new URL(trimmed);
      // Check if it's a valid domain (not localhost or invalid)
      if (urlObj.hostname && !urlObj.hostname.includes('localhost') && urlObj.hostname !== 'locahost.com') {
        return trimmed;
      }
      return null;
    }
    
    // If no protocol, add https://
    const urlWithProtocol = `https://${trimmed}`;
    const urlObj = new URL(urlWithProtocol);
    // Validate domain
    if (urlObj.hostname && !urlObj.hostname.includes('localhost') && urlObj.hostname !== 'locahost.com') {
      return urlWithProtocol;
    }
    return null;
  } catch (error) {
    // Invalid URL format
    return null;
  }
};

const Footer = memo(() => {
  const { settings, refresh } = useSettings();
  console.log('settings', settings);

  // Force refresh settings on mount
  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const [footerPages, setFooterPages] = useState([]);

  useEffect(() => {
    const fetchFooterPages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/pages?section=footer&status=true`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setFooterPages(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching footer pages:', error);
      }
    };

    fetchFooterPages();
  }, []);

  // Memoize contact information from settings
  const contactInfo = useMemo(() => {
    const phone = settings?.contact_phone || settings?.site_phone || '';
    const whatsapp = settings?.contact_whatsapp || '';
    const email = settings?.contact_email || settings?.site_email || '';

    return {
      phone: phone ? formatPhoneUrl(phone) : null,
      phoneDisplay: phone || '',
      whatsapp: whatsapp ? formatWhatsAppUrl(whatsapp) : null,
      whatsappDisplay: whatsapp || '',
      email: email ? formatEmailUrl(email) : null,
      emailDisplay: email || '',
    };
  }, [settings]);

  // Memoize social media links from settings - get directly from API without fallbacks
  const socialLinks = useMemo(() => {
    // Get URLs directly from settings API response
    const instagramUrl = formatSocialUrl(settings?.instagram_url);
    const facebookUrl = formatSocialUrl(settings?.facebook_url);
    const tiktokUrl = formatSocialUrl(settings?.tiktok_url);
    const snapchatUrl = formatSocialUrl(settings?.snapchat_url);
    const twitterUrl = formatSocialUrl(settings?.twitter_url);
    const youtubeUrl = formatSocialUrl(settings?.youtube_url);
    const linkedinUrl = formatSocialUrl(settings?.linkedin_url);

    // Only return valid URLs from API, no fallback URLs
    return {
      instagram: { url: instagramUrl, hasValidUrl: Boolean(instagramUrl) },
      facebook: { url: facebookUrl, hasValidUrl: Boolean(facebookUrl) },
      tiktok: { url: tiktokUrl, hasValidUrl: Boolean(tiktokUrl) },
      snapchat: { url: snapchatUrl, hasValidUrl: Boolean(snapchatUrl) },
      twitter: { url: twitterUrl, hasValidUrl: Boolean(twitterUrl) },
      youtube: { url: youtubeUrl, hasValidUrl: Boolean(youtubeUrl) },
      linkedin: { url: linkedinUrl, hasValidUrl: Boolean(linkedinUrl) },
    };
  }, [settings]);
  return (
    <footer className="footer" dir="rtl">
      <div className="footer__container">
        <div className="footer__top">
          {/* Brand Section */}
          <div className="footer__brand">
            <div className="footer__logo-content">
              <div className="footer__logo-wrapper">
                <Link to="/home" aria-label="العودة للصفحة الرئيسية">
                  <span className="storage-footer-logo storage-footer-logo--lg">
                    <img 
                      src={logoImg}
                      alt="Storage للخدمات التسويقية" 
                      className="storage-footer-logo__image" 
                    />
                  </span>
                </Link>
              </div>
              <p className="footer__tagline">
                <span className="footer__tagline-line">متجر Storage يقدم حلول السوشيال ميديا المتكاملة لرفع تفاعل حساباتك وتعزيز حضورك الرقمي.</span>
                <span className="footer__tagline-line">Think Code, Think Storage — حملات ذكية، نتائج دقيقة، ودعم متواصل لنمو أعمالك.</span>
              </p>
            </div>
            
            {/* Social Media Icons - Only show icons with valid URLs from API */}
            <div className="footer__social">
              {socialLinks.instagram.hasValidUrl && (
                <a 
                  href={socialLinks.instagram.url} 
                  className="footer__social-link" 
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>
              )}
              {socialLinks.facebook.hasValidUrl && (
                <a 
                  href={socialLinks.facebook.url} 
                  className="footer__social-link" 
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <FaFacebookF />
                </a>
              )}
              {socialLinks.tiktok.hasValidUrl && (
                <a 
                  href={socialLinks.tiktok.url} 
                  className="footer__social-link" 
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                >
                  <FaTiktok />
                </a>
              )}
              {socialLinks.snapchat.hasValidUrl && (
                <a 
                  href={socialLinks.snapchat.url} 
                  className="footer__social-link" 
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Snapchat"
                >
                  <FaSnapchat />
                </a>
              )}
              {socialLinks.twitter.hasValidUrl && (
                <a
                  href={socialLinks.twitter.url}
                  className="footer__social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <FaLink />
                </a>
              )}
              {socialLinks.youtube.hasValidUrl && (
                <a
                  href={socialLinks.youtube.url}
                  className="footer__social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                >
                  <FaLink />
                </a>
              )}
              {socialLinks.linkedin.hasValidUrl && (
                <a
                  href={socialLinks.linkedin.url}
                  className="footer__social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <FaLink />
                </a>
              )}
            </div>
          </div>

          {/* Important Links */}
          <div className="footer__links-section">
            <h4 className="footer__section-title">روابط مهمة</h4>
            <div className="footer__links-grid">
              <Link to="/blog" className="footer__link">
                <span className="footer__link-text">المدونة</span>
                <span className="footer__link-icon">
                  <HiLink />
                </span>
              </Link>
             
              {footerPages.map((page) => (
                <Link 
                  key={page.id} 
                  to={`/page/${page.slug}`} 
                  className="footer__link"
                >
                  <span className="footer__link-text">{page.title}</span>
                  <span className="footer__link-icon">
                    <HiLink />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="footer__contact-section">
            <h4 className="footer__section-title">تواصل معنا</h4>
            <div className="footer__contact-grid">
              {contactInfo.phone && contactInfo.phoneDisplay && (
                <a
                  href={contactInfo.phone}
                  className="footer__contact-item"
                  aria-label={`الاتصال هاتفياً على ${contactInfo.phoneDisplay}`}
                >
                  <span className="footer__contact-text">{contactInfo.phoneDisplay}</span>
                  <span className="footer__contact-icon">
                    <BsTelephone />
                  </span>
                </a>
              )}
              {contactInfo.whatsapp && contactInfo.whatsappDisplay && (
                <a
                  href={contactInfo.whatsapp}
                  className="footer__contact-item"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="مراسلتنا على واتساب"
                >
                  <span className="footer__contact-text">{contactInfo.whatsappDisplay}</span>
                  <span className="footer__contact-icon">
                    <MdWhatsapp />
                  </span>
                </a>
              )}
              {contactInfo.email && contactInfo.emailDisplay && (
                <a
                  href={contactInfo.email}
                  className="footer__contact-item"
                  aria-label={`إرسال بريد إلكتروني إلى ${contactInfo.emailDisplay}`}
                >
                  <span className="footer__contact-text">{contactInfo.emailDisplay}</span>
                  <span className="footer__contact-icon">
                    <MdOutlineMailOutline />
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer__bottom">
          {/* Copyright */}
          <div className="footer__copyright">
            <p>الحقوق محفوظة | {new Date().getFullYear()} {settings?.site_name || 'Storage'}</p>
          </div>

         

          {/* Business Verification */}
          
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;