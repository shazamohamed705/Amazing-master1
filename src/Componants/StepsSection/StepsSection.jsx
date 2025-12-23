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
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    const loadSteps = async () => {
      try {
        const response = await frontendApi.get('/home');

        if (response.success && response.data?.steps) {
          const apiSteps = response.data.steps.map((step, index) => ({
            id: step.id || index + 1,
            Icon: iconMap[step.icon] || FiShoppingBag,
            title: step.title || `خطوة ${index + 1}`,
            description: step.description || 'وصف الخطوة',
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

