import React from 'react';
import ServicesSlider from '../ServicesSlider/ServicesSlider';
import ProductCard from '../ProductCard/ProductCard';
import FeaturedService from '../FeaturedService/FeaturedService';
import Stats from '../Stats/Stats';
import WhyChooseUs from '../WhyChooseUs/WhyChooseUs';
import WhatsAppButton from '../WhatsAppButton/WhatsAppButton';

export default function Home() {
  return (
    <>
      <ServicesSlider />
      <ProductCard />
      <FeaturedService />
      <Stats />
      <WhyChooseUs />
      <WhatsAppButton />
    </>
  );
}


