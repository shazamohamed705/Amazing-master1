import React, { memo, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MdWhatsapp, MdOutlineMailOutline } from "react-icons/md";
import { BsTelephone } from "react-icons/bs";
import { FaMobileScreen, FaXTwitter, FaThreads } from "react-icons/fa6";
import { FaInstagram, FaFacebookF, FaTiktok, FaSnapchat, FaLink } from "react-icons/fa";
import { HiLink } from "react-icons/hi";
import { useSettings } from '../../hooks/useSettings';
import './Footer.css';
import './FooterAnimatedLogo.css';
import logoImg from '../../assets/logooo.png';

const API_BASE_URL = 'https://storage-te.com/backend/api/v1';

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

// Helper function to format social media URL
const formatSocialUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === 'false') {
    return null;
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const Footer = memo(() => {
  const { settings } = useSettings();
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
      phoneDisplay: phone || '01001995914',
      whatsapp: whatsapp ? formatWhatsAppUrl(whatsapp) : null,
      whatsappDisplay: whatsapp || '+201001995914',
      email: email ? formatEmailUrl(email) : null,
      emailDisplay: email || 'info@storage.eg',
    };
  }, [settings]);

  // Memoize social media links from settings - always show all icons
  const socialLinks = useMemo(() => {
    const instagramUrl = formatSocialUrl(settings?.instagram_url);
    const facebookUrl = formatSocialUrl(settings?.facebook_url);
    const tiktokUrl = formatSocialUrl(settings?.tiktok_url);
    const snapchatUrl = formatSocialUrl(settings?.snapchat_url);
    const twitterUrl = formatSocialUrl(settings?.twitter_url);
    const youtubeUrl = formatSocialUrl(settings?.youtube_url);
    const linkedinUrl = formatSocialUrl(settings?.linkedin_url);
    
    return {
      instagram: { url: instagramUrl || 'https://www.instagram.com/storage.eg/?hl=ar', hasValidUrl: Boolean(instagramUrl) },
      facebook: { url: facebookUrl || 'https://www.facebook.com/storage.eg', hasValidUrl: Boolean(facebookUrl) },
      tiktok: { url: tiktokUrl || 'https://www.tiktok.com/@storage.eg', hasValidUrl: Boolean(tiktokUrl) },
      snapchat: { url: snapchatUrl || 'https://www.snapchat.com/@storage.eg', hasValidUrl: Boolean(snapchatUrl) },
      twitter: { url: twitterUrl || 'https://x.com/StorageEg', hasValidUrl: Boolean(twitterUrl) },
      youtube: { url: youtubeUrl || '#', hasValidUrl: Boolean(youtubeUrl) },
      linkedin: { url: linkedinUrl || '#', hasValidUrl: Boolean(linkedinUrl) },
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
            
            {/* Social Media Icons - Always show all icons */}
            <div className="footer__social">
              <a 
                href={socialLinks.instagram.url} 
                className="footer__social-link" 
                target={socialLinks.instagram.hasValidUrl ? "_blank" : undefined}
                rel={socialLinks.instagram.hasValidUrl ? "noopener noreferrer" : undefined}
                aria-label="Instagram"
                onClick={(e) => {
                  if (!socialLinks.instagram.hasValidUrl) {
                    e.preventDefault();
                  }
                }}
              >
                <FaInstagram />
              </a>
              <a 
                href={socialLinks.facebook.url} 
                className="footer__social-link" 
                target={socialLinks.facebook.hasValidUrl ? "_blank" : undefined}
                rel={socialLinks.facebook.hasValidUrl ? "noopener noreferrer" : undefined}
                aria-label="Facebook"
                onClick={(e) => {
                  if (!socialLinks.facebook.hasValidUrl) {
                    e.preventDefault();
                  }
                }}
              >
                <FaFacebookF />
              </a>
              <a 
                href={socialLinks.tiktok.url} 
                className="footer__social-link" 
                target={socialLinks.tiktok.hasValidUrl ? "_blank" : undefined}
                rel={socialLinks.tiktok.hasValidUrl ? "noopener noreferrer" : undefined}
                aria-label="TikTok"
                onClick={(e) => {
                  if (!socialLinks.tiktok.hasValidUrl) {
                    e.preventDefault();
                  }
                }}
              >
                <FaTiktok />
              </a>
              <a 
                href={socialLinks.snapchat.url} 
                className="footer__social-link" 
                target={socialLinks.snapchat.hasValidUrl ? "_blank" : undefined}
                rel={socialLinks.snapchat.hasValidUrl ? "noopener noreferrer" : undefined}
                aria-label="Snapchat"
                onClick={(e) => {
                  if (!socialLinks.snapchat.hasValidUrl) {
                    e.preventDefault();
                  }
                }}
              >
                <FaSnapchat />
              </a>
              <a 
                href={socialLinks.twitter.url} 
                className="footer__social-link" 
                target={socialLinks.twitter.hasValidUrl ? "_blank" : undefined}
                rel={socialLinks.twitter.hasValidUrl ? "noopener noreferrer" : undefined}
                aria-label="Twitter"
                onClick={(e) => {
                  if (!socialLinks.twitter.hasValidUrl) {
                    e.preventDefault();
                  }
                }}
              >
                <FaXTwitter />
              </a>
              <a 
                href={socialLinks.youtube.url} 
                className="footer__social-link" 
                target={socialLinks.youtube.hasValidUrl ? "_blank" : undefined}
                rel={socialLinks.youtube.hasValidUrl ? "noopener noreferrer" : undefined}
                aria-label="YouTube"
                onClick={(e) => {
                  if (!socialLinks.youtube.hasValidUrl) {
                    e.preventDefault();
                  }
                }}
              >
                <FaLink />
              </a>
              <a 
                href={socialLinks.linkedin.url} 
                className="footer__social-link" 
                target={socialLinks.linkedin.hasValidUrl ? "_blank" : undefined}
                rel={socialLinks.linkedin.hasValidUrl ? "noopener noreferrer" : undefined}
                aria-label="LinkedIn"
                onClick={(e) => {
                  if (!socialLinks.linkedin.hasValidUrl) {
                    e.preventDefault();
                  }
                }}
              >
                <FaLink />
              </a>
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
              {contactInfo.phone && (
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
              {contactInfo.whatsapp && (
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
              {contactInfo.email && (
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