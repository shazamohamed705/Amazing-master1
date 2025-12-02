import React, { memo, useEffect, useState } from 'react';
import { FiShoppingBag, FiUsers, FiCheckCircle } from 'react-icons/fi';
import { frontendApi } from '../../services/apiClient';
import './StepsSection.css';

const iconMap = {
  'account': FiShoppingBag,
  'followers': FiUsers,
  'verify': FiCheckCircle,
};

const StepsSection = memo(() => {
  const [steps, setSteps] = useState([
    {
      id: 1,
      Icon: FiShoppingBag,
      title: 'ابدأ بحساب جاهز ويوزر حصري',
      description: 'اختر من مجموعة حساباتنا ويوزراتنا الحصرية وخلّك مميز من أول خطوة'
    },
    {
      id: 2,
      Icon: FiUsers,
      title: 'اطلب متابعين فعليين و حقيقيين',
      description: 'نرفع عدد متابعينك بأساليب آمنة وجمهور مهتم فعلاً'
    },
    {
      id: 3,
      Icon: FiCheckCircle,
      title: 'وثّق حسابك وخلّ حضورك أقوى',
      description: 'نساعدك في خطوات التوثيق ونقوّي ثقة جمهورك فيك'
    }
  ]);

  useEffect(() => {
    const loadSteps = async () => {
      try {
        const response = await frontendApi.get('/home');
        if (response.success && response.data?.steps) {
          const apiSteps = response.data.steps.map((step, index) => ({
            id: step.id || index + 1,
            Icon: iconMap[step.icon] || FiShoppingBag,
            title: step.title,
            description: step.description,
          }));
          if (apiSteps.length > 0) {
            setSteps(apiSteps);
          }
        }
      } catch (error) {
        console.error('Error loading steps:', error);
      }
    };
    loadSteps();
  }, []);

  return (
    <section className="steps-section">
      <div className="steps-container">
        <div className="steps-header-section">
          <h2 className="steps-title">خدماتنا لين تصل</h2>
          <div className="steps-underline" />
        </div>
        <p className="steps-subtitle">ثلاث خطوات بسيطة للحصول على خدماتك</p>
        
        <div className="steps-wrapper">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="step-card">
                <div className="step-card__icon">
                  <step.Icon className="step-card__emoji" aria-hidden="true" />
                </div>
                <h3 className="step-card__title">{step.title}</h3>
                <p className="step-card__description">{step.description}</p>
                
                {/* Animation Elements */}
                <div className="step-card__particles">
                  <span className="particle particle-1"></span>
                  <span className="particle particle-2"></span>
                  <span className="particle particle-3"></span>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="step-arrow">
                  <svg viewBox="0 0 24 24" className="arrow-icon">
                    <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" fill="currentColor"/>
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
});

StepsSection.displayName = 'StepsSection';

export default StepsSection;

