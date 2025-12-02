import React from 'react';
import { FiHeadphones, FiGift, FiShield, FiUsers } from 'react-icons/fi';
import './WhyChooseUs2.css';

const WhyChooseUs = () => {
  const features = [
    {
      id: 1,
      Icon: FiHeadphones,
      title: 'دعم فني سريع',
      description: 'نتابع طلباتك خطوة بخطوة'
    },
    {
      id: 2,
      Icon: FiGift,
      title: 'باقات مميزة',
      description: 'احجز اسم مستخدم يميزك عن غيرك، سهل الحفظ ويخدم هويتك التجارية أمام المتابعين'
    },
    {
      id: 3,
      Icon: FiShield,
      title: 'توثيق رسمي ومعتمد',
      description: 'نوفر خدمات توثيق احترافية لحساباتك بأعلى معايير الأمان'
    },
    {
      id: 4,
      Icon: FiUsers,
      title: 'متابعين حقيقيين 100%',
      description: 'نضفّر لك متابعين سعوديين حقيقيين يتفاعلون معك ويعززون وجودك الرقمي مع Storage'
    }
  ];

  return (
    <section className="why-choose-us">
      <div className="why-choose-us__container">
        <div className="why-choose-us__header">
          <h2 className="why-choose-us__title">
          A لــ Z ميزات تكمل مشروعك مـن           </h2>
          <div className="why-choose-us__underline"></div>
        </div>
        
        <div className="why-choose-us__grid">
          {features.map((feature, index) => (
            <div 
              key={feature.id} 
              className="why-choose-us__card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="why-choose-us__icon-wrapper">
                <div className="why-choose-us__icon">
                  {/* Use vector icon with same circular style as HTML snippet */} 
                  <feature.Icon className="why-choose-us__icon-content" aria-hidden="true" />
                </div>
              </div>
              <h3 className="why-choose-us__card-title">{feature.title}</h3>
              <p className="why-choose-us__card-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
