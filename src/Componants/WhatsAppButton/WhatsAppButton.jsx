import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import './WhatsAppButton.css';

const WhatsAppButton = () => {
  const { settings } = useSettings();

  const handleClick = () => {
    // Get WhatsApp number from settings or use default
    const phoneNumber = settings?.contact_whatsapp || '966500000000';
    // Clean the phone number (remove spaces, dashes, etc.)
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    const message = 'مرحباً، أريد الاستفسار عن خدماتكم';
    const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="whatsapp-button" onClick={handleClick}>
      <div className="whatsapp-button__icon">
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 7.933-2.127c2.42 1.37 5.173 2.127 8.067 2.127 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.467c-2.482 0-4.908-0.646-7.07-1.87l-0.507-0.292-4.713 1.262 1.262-4.669-0.292-0.508c-1.207-2.100-1.847-4.507-1.847-6.924 0-7.435 6.046-13.481 13.481-13.481s13.481 6.046 13.481 13.481c0 7.435-6.046 13.481-13.481 13.481zM22.185 18.449c-0.386-0.195-2.295-1.134-2.652-1.263-0.357-0.129-0.617-0.195-0.876 0.195s-1.007 1.263-1.235 1.521c-0.228 0.259-0.456 0.292-0.842 0.097s-1.641-0.604-3.124-1.927c-1.155-1.030-1.934-2.303-2.161-2.689s-0.024-0.599 0.171-0.793c0.175-0.175 0.386-0.456 0.579-0.684s0.259-0.389 0.389-0.647c0.129-0.259 0.065-0.486-0.032-0.681s-0.876-2.111-1.201-2.891c-0.316-0.757-0.637-0.654-0.876-0.667-0.227-0.011-0.486-0.013-0.745-0.013s-0.681 0.097-1.038 0.486c-0.357 0.389-1.359 1.327-1.359 3.237s1.392 3.756 1.585 4.015c0.195 0.259 2.735 4.179 6.627 5.858 0.926 0.399 1.649 0.638 2.211 0.816 0.931 0.297 1.779 0.255 2.448 0.155 0.747-0.112 2.295-0.939 2.619-1.845s0.324-1.683 0.227-1.845c-0.097-0.162-0.357-0.259-0.745-0.454z"/>
        </svg>
      </div>
      <span className="whatsapp-button__tooltip">راسلنا</span>
    </div>
  );
};

export default WhatsAppButton;

