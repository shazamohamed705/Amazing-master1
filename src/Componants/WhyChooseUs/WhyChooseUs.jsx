import React from 'react';
import './WhyChooseUs.css';

const WhyChooseUs = () => {
  const features = [
    {
      id: 1,
      icon: '💼',
      title: 'دعم فني سريع',
      description: 'نتابع طلباتك خطوة بخطوة'
    },
    {
      id: 2,
      icon: '🎁',
      title: 'بوقلات مميزة',
      description: 'احجز اسم مستخدم يناسبك من عروضنا سواء للحفظ ويصدق هويتك المتابعة'
    },
    {
      id: 3,
      icon: '✅',
      title: 'توثيق رسمي ومعتمد',
      description: 'نوفر خدمات توثيق احترافية لحساباتك بريع من محمداتك'
    },
    {
      id: 4,
      icon: '👥',
      title: 'متابعين حقيقيين 100%',
      description: 'نضفر لك متابعين سعوديين حقيقيين يتفاعلون معك ويعززون وجودك الرقمي'
    }
  ];

  return (
    <section className="why-choose-us">
      <div className="why-choose-us__container">
        <div className="why-choose-us__header">
          <h2 className="why-choose-us__title">
            ميزات تكمل مشروعك من <span className="highlight">A</span> لـ <span className="highlight">Z</span>
          </h2>
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
                  {feature.icon}
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
