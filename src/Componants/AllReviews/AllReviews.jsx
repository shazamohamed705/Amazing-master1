import React, { memo } from 'react';
import { CiStar } from "react-icons/ci";
import './AllReviews.css';

const AllReviews = memo(() => {
  const reviews = [
    {
      id: 1,
      name: 'محمد العتيبي',
      date: '15/03/2024',
      rating: 5,
      avatar: 'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png',
      comment: 'خدمة ممتازة وسريعة جداً. حصلت على المتابعين في وقت قياسي'
    },
    {
      id: 2,
      name: 'سارة القحطاني',
      date: '12/03/2024',
      rating: 5,
      avatar: 'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png',
      comment: 'احترافية عالية في التعامل والنتائج مبهرة'
    },
    {
      id: 3,
      name: 'عبدالله السعدون',
      date: '10/03/2024',
      rating: 5,
      avatar: 'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png',
      comment: 'متعتكوون ودا جدا سريع ومصداقية في التعامل جزاكم الله خيرا'
    },
    {
      id: 4,
      name: 'نورة الشمري',
      date: '08/03/2024',
      rating: 5,
      avatar: 'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png',
      comment: 'أفضل موقع للخدمات الرقمية، ننصح فيه بقوة'
    },
    {
      id: 5,
      name: 'خالد الدوسري',
      date: '05/03/2024',
      rating: 5,
      avatar: 'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png',
      comment: 'خدمة التوثيق ممتازة وحصلت على العلامة الزرقاء'
    },
    {
      id: 6,
      name: 'فاطمة المطيري',
      date: '02/03/2024',
      rating: 5,
      avatar: 'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png',
      comment: 'اليوزرات مميزة والأسعار معقولة جداً'
    }
  ];

  return (
    <div className="all-reviews">
      <main className="all-reviews__main">
        <div className="all-reviews__container">
          <div className="all-reviews__header">
            <h1 className="all-reviews__title">آراء العملاء</h1>
            <p className="all-reviews__subtitle">تقييمات عملائنا الكرام</p>
          </div>

          <div className="all-reviews__grid">
            {reviews.map((review) => (
              <div key={review.id} className="all-reviews__card">
                <div className="all-reviews__top">
                  <div className="all-reviews__user">
                    <div className="all-reviews__avatar">
                      <img src={review.avatar} alt={review.name} />
                    </div>
                    <div className="all-reviews__info">
                      <h4 className="all-reviews__name">{review.name}</h4>
                      <span className="all-reviews__date">{review.date}</span>
                    </div>
                  </div>
                  <div className="all-reviews__rating">
                    <span className="all-reviews__star"><CiStar /></span> {review.rating}
                  </div>
                </div>
                <div className="all-reviews__quote">"</div>
                <p className="all-reviews__comment">{review.comment}</p>
                <div className="all-reviews__quote-end">"</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
});

AllReviews.displayName = 'AllReviews';

export default AllReviews;