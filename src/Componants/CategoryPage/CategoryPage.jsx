import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { IoIosHeartEmpty, IoIosHeart } from "react-icons/io";
import { PiShoppingBag } from "react-icons/pi";
import ServiceCard from '../ServiceCard/ServiceCard';
import PackageCard from '../PackageCard/PackageCard';
import ArticleCard from '../ArticleCard/ArticleCard';
import PortfolioCard from '../PortfolioCard/PortfolioCard';
import '../ServicePackages/ServicePackages.css';
import './CategoryPage.css';

const CategoryPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { formatPrice, currency, getLocalizedPrice } = useCurrency();
  const { isFav, toggleFavorite } = useFavorites();
  const [category, setCategory] = useState(null);
  const [parentCategory, setParentCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [services, setServices] = useState([]);
  const [articles, setArticles] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [followerPackages, setFollowerPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const raw = localStorage.getItem('favoritePackageIds');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  const API_BASE_URL = 'https://storage-te.com/backend/api/v1';

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        
        // First, get all categories to find the category by slug
        const categoriesResponse = await fetch(`${API_BASE_URL}/categories`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        const categoriesData = await categoriesResponse.json().catch(() => ({}));

        if (!categoriesResponse.ok || !categoriesData?.success) {
          throw new Error('حدث خطأ أثناء جلب الكاتجوريات');
        }

        // Find category by slug
        const allCategories = Array.isArray(categoriesData.data) ? categoriesData.data : [];
        const foundCategory = allCategories.find(cat => cat.slug === slug || cat.id.toString() === slug);

        if (!foundCategory) {
          throw new Error('الكاتجوري غير موجودة');
        }

        setCategory(foundCategory);

        // Find parent category if exists
        if (foundCategory.parent_id) {
          const parent = allCategories.find(cat => cat.id === foundCategory.parent_id);
          setParentCategory(parent || null);
        } else {
          setParentCategory(null);
        }

        // Get all child categories (subcategories) for this category
        const getAllChildCategoryIds = (categoryId, allCategories) => {
          const childIds = [categoryId]; // Include the parent category itself
          const children = allCategories.filter(cat => cat.parent_id === categoryId);
          children.forEach(child => {
            childIds.push(...getAllChildCategoryIds(child.id, allCategories));
          });
          return childIds;
        };

        // Get all category IDs (parent + all children)
        const allCategoryIds = getAllChildCategoryIds(foundCategory.id, allCategories);
        
        // Get subcategories for display
        const subcats = allCategories.filter(cat => cat.parent_id === foundCategory.id);
        setSubcategories(subcats);

        console.log(`Fetching services for categories: ${allCategoryIds.join(', ')}`);

        // Fetch all services and filter by all category IDs
        let servicesList = [];
        let articlesList = [];
        let portfoliosList = [];
        let packagesList = [];

        try {
          // Fetch all services
          const allServicesResponse = await fetch(`${API_BASE_URL}/services`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          });

          const allServicesData = await allServicesResponse.json().catch(() => ({}));

          if (allServicesResponse.ok && allServicesData?.success) {
            const allServices = Array.isArray(allServicesData.data) ? allServicesData.data : [];
            
            // Filter services by any of the category IDs (parent + children)
            servicesList = allServices.filter(service => {
              const serviceCategoryId = service.category_id || service.category?.id;
              return serviceCategoryId && allCategoryIds.includes(serviceCategoryId);
            });
          }

          // Fetch all articles
          try {
            const articlesResponse = await fetch(`${API_BASE_URL}/articles`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
            });
            const articlesData = await articlesResponse.json().catch(() => ({}));
            if (articlesResponse.ok && articlesData?.success) {
              const allArticles = Array.isArray(articlesData.data) ? articlesData.data : [];
              articlesList = allArticles.filter(article => {
                const articleCategoryId = article.category_id || article.category?.id;
                return articleCategoryId && allCategoryIds.includes(articleCategoryId);
              });
            }
          } catch (err) {
            console.error('Error fetching articles:', err);
          }

          // Fetch all portfolios
          try {
            const portfoliosResponse = await fetch(`${API_BASE_URL}/portfolios`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
            });
            const portfoliosData = await portfoliosResponse.json().catch(() => ({}));
            if (portfoliosResponse.ok && portfoliosData?.success) {
              const allPortfolios = Array.isArray(portfoliosData.data) ? portfoliosData.data : [];
              portfoliosList = allPortfolios.filter(portfolio => {
                const portfolioCategoryId = portfolio.category_id || portfolio.category?.id;
                return portfolioCategoryId && allCategoryIds.includes(portfolioCategoryId);
              });
            }
          } catch (err) {
            console.error('Error fetching portfolios:', err);
          }

          // Fetch all packages
          try {
            const packagesResponse = await fetch(`${API_BASE_URL}/packages`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
            });
            const packagesData = await packagesResponse.json().catch(() => ({}));
            if (packagesResponse.ok && packagesData?.success) {
              const allPackages = Array.isArray(packagesData.data) ? packagesData.data : [];
              packagesList = allPackages.filter(pkg => {
                const pkgCategoryId = pkg.category_id || pkg.category?.id;
                return pkgCategoryId && allCategoryIds.includes(pkgCategoryId);
              });
            }
          } catch (err) {
            console.error('Error fetching packages:', err);
          }

        } catch (err) {
          console.error('Error fetching all services:', err);
        }

        console.log(`Found ${servicesList.length} services for category ${foundCategory.name} (ID: ${foundCategory.id}) and its subcategories`);

        setServices(servicesList);
        setArticles(articlesList);
        setPortfolios(portfoliosList);
        setFollowerPackages(packagesList);

      } catch (error) {
        console.error('Error:', error);
        showToast(error.message || 'حدث خطأ أثناء جلب البيانات', 'error');
        setServices([]);
        setArticles([]);
        setPortfolios([]);
        setFollowerPackages([]);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategory();
    }
  }, [slug, showToast]);

  const handleAddToCart = async (item, username = null) => {
    try {
      await addToCart({
        id: item.id,
        package_id: item.id,
        packageId: item.id,
        type: 'package',
        name: item.name || item.title,
        price: parseFloat(item.price) || 0,
        image: item.image || "https://cdn.salla.sa/DQYwE/vknfwxMv9gXEyMCt5M6hCQOZIxj59EOlvKq8f2Gl.jpg",
        is_username: item.is_username,
        username: username,
        followers_count: item.followers_count,
      });
      showToast('تمت الإضافة للسلة بنجاح', 'success');
    } catch (error) {
      showToast(error.message || 'حدث خطأ في إضافة العنصر للسلة', 'warning');
    }
  };

  const handleToggleFavorite = (packageId) => {
    if (!packageId) return;
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(packageId)) {
        next.delete(packageId);
      } else {
        next.add(packageId);
      }
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('favoritePackageIds', JSON.stringify(Array.from(next)));
        }
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  // Remove HTML tags from text
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Get preview text with max length
  const getPreview = (text, maxWords = 15) => {
    if (!text) return '';
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  if (loading) {
    return (
      <div className="category-page" dir="rtl">
        <div className="category-container">
          <div style={{ textAlign: 'center', padding: '3rem', color: 'white' }}>
            جاري التحميل...
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="category-page" dir="rtl">
        <div className="category-container">
          <div style={{ textAlign: 'center', padding: '3rem', color: 'white' }}>
            الفئة غير موجودة
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page" dir="rtl">
      <div className="category-container">
        {/* Category Header */}
        <div className="category-header">
          {parentCategory && (
            <div className="category-breadcrumb">
              <Link to={parentCategory.slug ? `/category/${parentCategory.slug}` : `/category/${parentCategory.id}`}>
                {parentCategory.name}
              </Link>
              <span> / </span>
              <span>{category.name}</span>
            </div>
          )}
          <h1 className="category-title">{category.name}</h1>
          {category.description && (
            <p className="category-description">{category.description}</p>
          )}
        </div>

        {/* Services Section */}
        {services.length > 0 && (
          <div className="category-section">
            <div className="service-packages-grid">
              {services.map((service) => {
                const serviceUrl = service?.slug
                  ? `/service/${service.slug}`
                  : `/service/${service?.id || ''}`;
                const serviceImage = service?.image || "https://cdn.salla.sa/DQYwE/vknfwxMv9gXEyMCt5M6hCQOZIxj59EOlvKq8f2Gl.jpg";
                const servicePrice = getLocalizedPrice(service) || parseFloat(service?.price) || 0;
                const formattedPrice = formatPrice(servicePrice);
                const rawDescription = service?.short_description || service?.description || '';
                const cleanDescription = stripHtml(rawDescription);
                const preview = getPreview(cleanDescription, 15);
                
                return (
                  <div key={service.id} className="service-packages-card">
                    <div className="service-packages-card-header">
                      <div className="service-packages-card-image">
                        <img
                          src={serviceImage}
                          alt={service?.name || 'خدمة'}
                          className="service-packages-main-image"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <div className="service-packages-card-content">
                      <h4 className="service-packages-card-title">{service?.name || 'خدمة رقمية'}</h4>
                      {preview && (
                        <p className="service-packages-card-description-text">{preview}</p>
                      )}
                      <p className="service-packages-card-price" dir="ltr">
                        {formattedPrice.value} {currency.symbol}
                        {currency.code !== 'SAR' && (
                          <span style={{ fontSize: '0.85em', marginRight: '4px' }}> ({currency.code})</span>
                        )}
                      </p>
                      <div className="service-packages-card-actions">
                        <Link
                          to={serviceUrl}
                          className="service-packages-card-button"
                          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                        >
                          <PiShoppingBag />
                          عرض الباقات
                        </Link>
                        <button 
                          className="service-packages-favorite-btn" 
                          onClick={() => toggleFavorite(service.id)}
                          aria-label={isFav(service.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                        >
                          {isFav(service.id) ? <IoIosHeart color="#F7EC06" /> : <IoIosHeartEmpty />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Follower Packages Section */}
        {followerPackages.length > 0 && (
          <div className="category-section">
            <h2 className="category-section-title">الباقات</h2>
            <div className="category-grid category-grid--cards">
              {followerPackages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  package={pkg}
                  onAddToCart={handleAddToCart}
                  showFavorite={true}
                  isFavorite={favoriteIds.has(pkg.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </div>
        )}

        {/* Portfolios Section */}
        {portfolios.length > 0 && (
          <div className="category-section">
            <h2 className="category-section-title">سابقة الأعمال</h2>
            <div className="category-grid category-grid--cards">
              {portfolios.map((portfolio) => (
                <PortfolioCard key={portfolio.id} portfolio={portfolio} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {services.length === 0 && (
          <div className="category-empty">
            <p>لا توجد خدمات متاحة لهذه الفئة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;

