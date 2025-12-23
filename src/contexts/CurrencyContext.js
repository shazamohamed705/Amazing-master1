import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState({
    code: 'SAR',
    symbol: 'ر.س',
    exchangeRate: 1,
    country: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        setLoading(true);
        
        // Try to get country from IP
        let countryCode = 'SA'; // Default to Saudi Arabia
        
        try {
          const ipResponse = await fetch('https://ipapi.co/json/');
          if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            if (ipData && ipData.country_code && !ipData.error) {
              countryCode = ipData.country_code;
            }
          }
        } catch (ipError) {
          console.log('Could not detect country from IP, using default');
        }

        // Fetch countries from API
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://storage-te.com/backend/api/frontend';
        const countriesResponse = await fetch(`${API_BASE_URL}/countries`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (countriesResponse.ok) {
          const countriesData = await countriesResponse.json();
          if (countriesData.success && countriesData.data) {
            const userCountry = countriesData.data.find(c => c.code === countryCode);
            if (userCountry && userCountry.currency) {
              setCurrency({
                code: userCountry.currency.code,
                symbol: userCountry.currency.symbol || userCountry.currency.code,
                exchangeRate: 1, // Will be calculated based on exchange_rate if needed
                country: userCountry,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error detecting currency:', error);
      } finally {
        setLoading(false);
      }
    };

    detectCurrency();
  }, []);

  // Helper function to get localized price
  const getLocalizedPrice = (service, defaultPrice = null) => {
    if (!service) return defaultPrice || 0;
    
    // If service has localized_price, use it
    if (service.localized_price !== undefined && service.localized_price !== null) {
      return parseFloat(service.localized_price);
    }
    
    // If service has servicePrices, find the price for current country
    if (service.servicePrices && currency.country) {
      const countryPrice = service.servicePrices.find(
        sp => sp.country_id === currency.country.id
      );
      if (countryPrice) {
        return parseFloat(countryPrice.price);
      }
    }
    
    // Fallback to default price
    return parseFloat(defaultPrice || service.price || 0);
  };

  // Helper function to get localized price_per_1000
  const getLocalizedPricePer1000 = (service, defaultPricePer1000 = null) => {
    if (!service) return defaultPricePer1000 || 0;
    
    // If service has localized_price_per_1000, use it
    if (service.localized_price_per_1000 !== undefined && service.localized_price_per_1000 !== null) {
      return parseFloat(service.localized_price_per_1000);
    }
    
    // If service has servicePrices, find the price_per_1000 for current country
    if (service.servicePrices && currency.country) {
      const countryPrice = service.servicePrices.find(
        sp => sp.country_id === currency.country.id
      );
      if (countryPrice && countryPrice.price_per_1000) {
        return parseFloat(countryPrice.price_per_1000);
      }
    }
    
    // Fallback to default price_per_1000
    return parseFloat(defaultPricePer1000 || service.price_per_1000 || 0);
  };

  // Helper function to format price with currency symbol
  const formatPrice = (price) => {
    if (typeof price !== 'number') {
      price = parseFloat(price) || 0;
    }
    // Format number with locale string and 2 decimal places (English numbers)
    const formattedValue = price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return {
      value: formattedValue,
      symbol: currency.symbol,
      code: currency.code,
      full: `${formattedValue} ${currency.symbol}`,
    };
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        loading,
        getLocalizedPrice,
        getLocalizedPricePer1000,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

