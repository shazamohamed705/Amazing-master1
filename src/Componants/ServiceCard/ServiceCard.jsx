import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import './ServiceCard.css';
import { useCurrency } from '../../contexts/CurrencyContext';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80';

const ServiceCard = memo(({ service }) => {
  const { formatPrice, getLocalizedPrice } = useCurrency();
  const localizedPrice = getLocalizedPrice(service, service?.price);
  const formattedPrice = formatPrice(localizedPrice || 0);

  const targetUrl = service?.slug
    ? `/service/${service.slug}`
    : `/service/${service?.id || ''}`;

  return (
    <article className="service-card" dir="rtl">
      <div className="service-card__media">
        <img
          src={service?.image || FALLBACK_IMAGE}
          alt={service?.name || 'خدمة رقمية'}
          loading="lazy"
        />
      </div>
      <div className="service-card__body">
        <div>
          <p className="service-card__eyebrow">
            {service?.category?.name || 'خدمة مميزة'}
          </p>
          <h3 className="service-card__title">{service?.name || 'خدمة رقمية'}</h3>
          {service?.short_description || service?.description ? (
            <p className="service-card__description">
              {service.short_description || service.description}
            </p>
          ) : null}
        </div>

        <div className="service-card__footer">
          <div className="service-card__price">
            <span className="service-card__price-value">{formattedPrice.value}</span>
            <span className="service-card__price-symbol">
              {formattedPrice.symbol}
              {formattedPrice.code !== 'SAR' ? ` (${formattedPrice.code})` : ''}
            </span>
          </div>
          <Link to={targetUrl} className="service-card__button">
            عرض التفاصيل
          </Link>
        </div>
      </div>
    </article>
  );
});

ServiceCard.displayName = 'ServiceCard';

export default ServiceCard;

