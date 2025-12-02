import React from 'react';
import { CiHeart } from "react-icons/ci";
import { FiShare2 } from "react-icons/fi";
import { TbShoppingBag } from "react-icons/tb";
import SaudiRiyalIcon from '../SaudiRiyalIcon/SaudiRiyalIcon';
import './FeaturedService.css';

const FeaturedService = () => {
  return (
    <section className="featured-service" dir="rtl">
      <div className="featured-service__container">
        <div className="featured-service__card">
          {/* Left Section - Service Details */}
          <div className="featured-service__left">
            <div className="featured-service__actions">
              <button className="featured-service__like-btn" aria-label="إضافة للمفضلة">
                <CiHeart />
              </button>
              <button className="featured-service__share-btn" aria-label="مشاركة">
                <FiShare2 />
              </button>
            </div>
            
            <h2 className="featured-service__title">مشاهدات سناب 100</h2>
            
            <div className="featured-service__price" dir="rtl">
              75 <SaudiRiyalIcon width={16} height={17} />
            </div>
            
            <div className="featured-service__sales">
              <span className="featured-service__sales-icon">🔥</span>
              تم بيعه أكثر من 6
            </div>
            
            <p className="featured-service__description">
              مشاهدات سناب حقيقى عرب
            </p>
            
            <div className="featured-service__input-container">
              <input 
                type="text" 
                placeholder="ضع اسم المستخدم الخاص بك في منطقة الرابط"
                className="featured-service__input"
              />
            </div>
            
            <div className="featured-service__details">
              100 مشاهدة قصة لجميع قصصك (حتى 20 قصة)
            </div>
            
            <a href="#" className="featured-service__read-more">قراءة المزيد</a>
            
            <button className="featured-service__add-to-cart">
              <TbShoppingBag />
              إضافة للسلة
            </button>
          </div>
          
          {/* Right Section - Promotional Image */}
          <div className="featured-service__right">
            <div className="featured-service__promo">
              <div className="featured-service__promo-text">
                <h3>مشاهداتك قليلة؟ زودها الآن وخلك حديث السناب</h3>
                <p>خدمة زيادة مشاهدات السناب شات</p>
              </div>
              
              <div className="featured-service__phone-mockup">
                <div className="featured-service__phone">
                  <div className="featured-service__phone-screen">
                    <div className="featured-service__snapchat-logo">👻</div>
                  </div>
                </div>
              </div>
              
              <div className="featured-service__stories-icon">
                <div className="featured-service__stories">📱</div>
              </div>
              
              <div className="featured-service__contact">
                <p>زور موقعنا الان</p>
                <p>966561950225</p>
                <p>www.ezzmar.com</p>
              </div>
              
              <div className="featured-service__brand-logo">
                <span className="featured-service__brand-z">Z</span>
                <span className="featured-service__brand-text">Storage للخدمات التسويقية</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedService;