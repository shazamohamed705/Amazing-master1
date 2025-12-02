import React, { useEffect, useRef, useState } from "react";
import { CiShare2, CiHeart } from "react-icons/ci";
import { FaFacebookF } from "react-icons/fa";
import { FaFireAlt } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { IoMdLink } from "react-icons/io";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import SaudiRiyalIcon from '../SaudiRiyalIcon/SaudiRiyalIcon';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { apiClient } from '../../services/apiClient';
import './ProductCard.css';

const ProductCard = () => {
  // Share menu state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const shareRef = useRef(null);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { currency, formatPrice, getLocalizedPrice } = useCurrency();
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const loadFeaturedProduct = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/services?per_page=1');
        if (response.success && response.data && response.data.length > 0) {
          const service = response.data[0];
          setProduct({
            id: service.id,
            package_id: service.id,
            packageId: service.id,
            type: 'service',
            name: service.name,
            price: parseFloat(getLocalizedPrice(service) || service.price) || 0,
            image: service.image || "https://cdn.salla.sa/DQYwE/40c6b05a-e635-47e1-87ea-ac765b6e3f40-400x500-QGuJ4XmWyyOvg1ZUcOmY28x7RGEIk9PLWpHWXHtd.jpg",
            description: service.short_description || '',
            hasDiscount: false,
            sold: 0,
          });
        } else {
          // Fallback to default product
          setProduct({
            id: 1,
            package_id: 1,
            packageId: 1,
            type: 'package',
            name: "مشاهدات سناب 100",
            price: 50,
            image: "https://cdn.salla.sa/DQYwE/40c6b05a-e635-47e1-87ea-ac765b6e3f40-400x500-QGuJ4XmWyyOvg1ZUcOmY28x7RGEIk9PLWpHWXHtd.jpg",
            description: "ضع اسم المستخدم الخاص بك في منطقة الرابط. 100 مشاهدة قصة لحسابك.",
            hasDiscount: false,
            sold: 6,
          });
        }
      } catch (error) {
        console.error('Error loading featured product:', error);
        // Fallback to default
        setProduct({
          id: 1,
          package_id: 1,
          packageId: 1,
          type: 'package',
          name: "مشاهدات سناب 100",
          price: 50,
          image: "https://cdn.salla.sa/DQYwE/40c6b05a-e635-47e1-87ea-ac765b6e3f40-400x500-QGuJ4XmWyyOvg1ZUcOmY28x7RGEIk9PLWpHWXHtd.jpg",
          description: "ضع اسم المستخدم الخاص بك في منطقة الرابط. 100 مشاهدة قصة لحسابك.",
          hasDiscount: false,
          sold: 6,
        });
      } finally {
        setLoading(false);
      }
    };
    loadFeaturedProduct();
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!shareRef.current) return;
      if (!shareRef.current.contains(e.target)) {
        setIsShareOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleShare = (type) => {
    const url = window.location.href;
    const text = encodeURIComponent("شاهد هذه الخدمة المميزة من Storage للخدمات التسويقية");
    switch (type) {
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          setIsShareOpen(false);
        }).catch(() => {});
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent("خدمة مميزة من Storage")}&body=${text}%20${encodeURIComponent(url)}`, '_blank');
        break;
      default:
        break;
    }
  };

  const handleAddToCart = async (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    try {
      await addToCart(product);
      // success: no popup
    } catch (error) {
      showToast(error.message || 'حدث خطأ في إضافة المنتج للسلة', 'warning');
    }
  };

  const handleFavoriteClick = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!product || !product.id) {
      showToast('لا يمكن إضافة هذا المنتج للمفضلة', 'warning');
      return;
    }
    // تحديد نوع العنصر: 'service' أو 'package'
    const itemType = product.type === 'service' ? 'service' : 'package';
    toggleFavorite(product.id, itemType);
  };

  if (loading || !product) {
    return (
      <section className="product-card-section" dir="rtl">
        <div className="product-card-container">
          <div style={{ textAlign: 'center', padding: '3rem', color: 'white' }}>
            جاري التحميل...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="product-card-section" dir="rtl">
      <div className="product-card-container">
        <div className="product-card-wrapper">
          
          {/* اليمين: تفاصيل المنتج */}
          <div className="product-card-details">
            <h2 className="product-card-title">{product.name}</h2>

            {product.hasDiscount ? (
              <div className="product-card-pricing" dir="rtl">
                <div className="product-card-discount-container">
                  <div className="product-card-price-info">
                    <span className="product-card-price product-card-price--discounted">
                      {formatPrice(product.price).value} {currency.symbol}
                      {currency.code !== 'SAR' && (
                        <span style={{ fontSize: '0.75em', marginRight: '4px', color: '#ABB3BA' }}>({currency.code})</span>
                      )}
                    </span>
                    <span className="product-card-original-price">
                      {formatPrice(product.originalPrice).value} {currency.symbol}
                    </span>
                  </div>
                  <div className="product-card-discount-info">
                    <div className="product-card-discount-badge">
                      - % {product.discountPercentage}
                    </div>
                    <div className="product-card-savings">
                      وفر {formatPrice(product.savings).value} {currency.symbol}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="product-card-price" dir="rtl">
                {formatPrice(product.price).value} {currency.symbol}
                {currency.code !== 'SAR' && (
                  <span style={{ fontSize: '0.75em', marginRight: '4px', color: '#ABB3BA' }}>({currency.code})</span>
                )}
              </p>
            )}

            <p className="product-card-sold">
              <FaFireAlt color="#F7EC06" /> تم بيعه أكثر من {product.sold}
            </p>

            {product.description && (
              <p className="product-card-description">
                {product.description.replace(/<[^>]*>/g, '').trim()}
              </p>
            )}

            <div className="product-card-actions">
              <button className="product-card-add-to-cart" onClick={handleAddToCart}>
                إضافة للسلة
              </button>
              <button 
                className="product-card-heart-btn" 
                onClick={handleFavoriteClick}
                aria-label={product && isFavorite(product.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
              >
                {product && isFavorite(product.id) ? (
                  <IoIosHeart color="#F7EC06" />
                ) : (
                  <IoIosHeartEmpty />
                )}
              </button>
            <div className="product-card-share" ref={shareRef}>
              <button className="product-card-share-btn" onClick={() => setIsShareOpen((p) => !p)} aria-haspopup="true" aria-expanded={isShareOpen} aria-label="مشاركة">
                <CiShare2 />
              </button>
              {isShareOpen && (
                <div className="product-card-share-menu" role="menu">
                  <button role="menuitem" className="share-item" onClick={() => handleShare('facebook')}>
                    <FaFacebookF />
                  </button>
                  <button role="menuitem" className="share-item" onClick={() => handleShare('twitter')}>
                    <FaXTwitter />
                  </button>
                  <button role="menuitem" className="share-item" onClick={() => handleShare('whatsapp')}>
                    <IoLogoWhatsapp />
                  </button>
                  <button role="menuitem" className="share-item" onClick={() => handleShare('email')}>
                    <MdEmail />
                  </button>
                  <button role="menuitem" className="share-item" onClick={() => handleShare('copy')}>
                    <IoMdLink />
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>

          {/* اليسار: صورة المنتج */}
          <div className="product-card-image-wrapper">
            <img
              src={product.image}
              alt={product.name}
              className="product-card-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCard;
