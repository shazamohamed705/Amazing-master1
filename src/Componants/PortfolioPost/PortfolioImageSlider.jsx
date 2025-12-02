import React, { useState, useEffect } from 'react';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import './PortfolioImageSlider.css';

const PortfolioImageSlider = ({ images, mainImage }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allImages, setAllImages] = useState([]);

  useEffect(() => {
    // Combine main image with additional images
    const combined = [];
    
    if (mainImage) {
      combined.push({
        url: mainImage,
        id: 'main',
        alt: 'صورة المشروع الرئيسية'
      });
    }
    
    if (images && Array.isArray(images) && images.length > 0) {
      images.forEach((img, index) => {
        combined.push({
          url: img.url || img.path || img,
          id: img.id || `img-${index}`,
          alt: img.alt_text || `صورة ${index + 1}`
        });
      });
    }
    
    setAllImages(combined);
  }, [images, mainImage]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Auto-play slider
  useEffect(() => {
    if (allImages.length <= 1) return;
    
    const interval = setInterval(() => {
      goToNext();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [allImages.length, currentIndex]);

  if (allImages.length === 0) {
    return null;
  }

  if (allImages.length === 1) {
    return (
      <div className="portfolio-image-slider">
        <div className="portfolio-image-slider__single">
          <img 
            src={allImages[0].url} 
            alt={allImages[0].alt}
            onError={(e) => {
              e.target.src = 'https://cdn.salla.sa/DQYwE/raQ1rYI5nScXqOeZYufF1MOBEXNdxbvZZAsapUPU.jpg';
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-image-slider">
      <div className="portfolio-image-slider__container">
        <div className="portfolio-image-slider__main">
          <button 
            className="portfolio-image-slider__nav portfolio-image-slider__nav--prev"
            onClick={goToPrevious}
            aria-label="الصورة السابقة"
          >
            <FaChevronRight />
          </button>
          
          <div className="portfolio-image-slider__slide-wrapper">
            {allImages.map((image, index) => (
              <div
                key={image.id}
                className={`portfolio-image-slider__slide ${
                  index === currentIndex ? 'portfolio-image-slider__slide--active' : ''
                }`}
              >
                <img 
                  src={image.url} 
                  alt={image.alt}
                  onError={(e) => {
                    e.target.src = 'https://cdn.salla.sa/DQYwE/raQ1rYI5nScXqOeZYufF1MOBEXNdxbvZZAsapUPU.jpg';
                  }}
                />
              </div>
            ))}
          </div>
          
          <button 
            className="portfolio-image-slider__nav portfolio-image-slider__nav--next"
            onClick={goToNext}
            aria-label="الصورة التالية"
          >
            <FaChevronLeft />
          </button>
        </div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="portfolio-image-slider__thumbnails">
            {allImages.map((image, index) => (
              <button
                key={image.id}
                className={`portfolio-image-slider__thumbnail ${
                  index === currentIndex ? 'portfolio-image-slider__thumbnail--active' : ''
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`انتقل إلى الصورة ${index + 1}`}
              >
                <img 
                  src={image.url} 
                  alt={image.alt}
                  onError={(e) => {
                    e.target.src = 'https://cdn.salla.sa/DQYwE/raQ1rYI5nScXqOeZYufF1MOBEXNdxbvZZAsapUPU.jpg';
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Indicators */}
        {allImages.length > 1 && (
          <div className="portfolio-image-slider__indicators">
            {allImages.map((_, index) => (
              <button
                key={index}
                className={`portfolio-image-slider__indicator ${
                  index === currentIndex ? 'portfolio-image-slider__indicator--active' : ''
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`انتقل إلى الشريحة ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioImageSlider;

