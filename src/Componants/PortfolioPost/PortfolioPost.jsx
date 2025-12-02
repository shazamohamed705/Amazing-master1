import React, { memo, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaExternalLinkAlt } from 'react-icons/fa';
import LoginModal from '../LoginModal/LoginModal';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import PortfolioImageSlider from './PortfolioImageSlider';
import './PortfolioPost.css';
import { extractPortfolioSummary, fetchPortfolioDetails } from '../../services/portfolioService';

const FALLBACK_IMAGE = 'https://cdn.salla.sa/DQYwE/raQ1rYI5nScXqOeZYufF1MOBEXNdxbvZZAsapUPU.jpg';

const PortfolioPost = memo(() => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const preloadedItem = location.state?.item;
  const isSameItem = preloadedItem && (
    preloadedItem.id?.toString() === id?.toString() ||
    preloadedItem.slug?.toString() === id?.toString()
  );
  const [item, setItem] = useState(isSameItem ? preloadedItem : null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(!item);
  const [error, setError] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    requirements: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const { showToast } = useToast();

  // Fetch user profile when component mounts or when token is available
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) return;

      try {
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://storage-te.com/backend/api/v1';
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        const data = await response.json();
        if (response.ok && data.success && data.data?.user) {
          const user = data.data.user;
          setUserProfile(user);
          // Auto-fill form with user data
          setFormData(prev => ({
            ...prev,
            name: user.name || prev.name,
            email: user.email || prev.email,
            phone: user.phone || prev.phone,
          }));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadItem = async () => {
      setLoading(true);
      setError(null);
      try {
        const numericId = Number(id);
        const lookupKey = Number.isNaN(numericId) ? id : numericId;
        const data = await fetchPortfolioDetails(lookupKey, controller.signal);
        if (!isMounted) return;
        setItem(data?.portfolio || data || null);
        setRelatedItems(Array.isArray(data?.related) ? data.related : []);
        setLoading(false);
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching portfolio details:', error);
        setItem(isSameItem ? preloadedItem : null);
        setRelatedItems([]);
        setError(error?.message || 'تعذر جلب تفاصيل المشروع');
        setLoading(false);
      }
    };

    loadItem();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id, isSameItem, preloadedItem]);

  const introText = useMemo(
    () => extractPortfolioSummary(item, 220),
    [item]
  );

  // Get base URL for images
  const getImageUrl = (imagePath) => {
    if (!imagePath) return FALLBACK_IMAGE;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://storage-te.com/backend/api/v1';
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${baseUrl}/${cleanPath}`;
  };

  // Fix image URLs in content
  const processedContent = useMemo(() => {
    if (!item?.content) return '';
    
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://storage-te.com/backend/api/v1';
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    
    // Replace relative image paths with absolute URLs
    let content = item.content;
    
    // Fix images that start with /storage/ or storage/
    content = content.replace(
      /src=["']([^"']*\/storage\/[^"']*)["']/gi,
      (match, path) => {
        if (path.startsWith('http://') || path.startsWith('https://')) {
          return match; // Already absolute URL
        }
        // Remove leading slash if exists
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `src="${baseUrl}/${cleanPath}"`;
      }
    );
    
    // Fix images that are relative paths
    content = content.replace(
      /src=["'](?!http)([^"']*\.(jpg|jpeg|png|gif|webp|svg))["']/gi,
      (match, path) => {
        if (path.startsWith('/')) {
          return `src="${baseUrl}${path}"`;
        }
        return `src="${baseUrl}/${path}"`;
      }
    );
    
    return content;
  }, [item?.content]);

  return (
    <div className="portfolio-post" dir="rtl">
      <div className="portfolio-post__container">
        {/* Content Section */}
        <div className="portfolio-post__content-wrapper">
          <div className="portfolio-post__main">
            <h2 className="portfolio-post__title">{item?.title || ''}</h2>

            {/* Image Slider */}
            <PortfolioImageSlider 
              images={item?.images || []} 
              mainImage={getImageUrl(item?.image)}
            />

            {introText && (
              <div className="portfolio-post__intro">
                <h3 className="portfolio-post__intro-title">المقدمة</h3>
                <p className="portfolio-post__text">{introText}</p>
              </div>
            )}

            {/* Content Section */}
            <div style={{ marginTop: '2rem' }}>
              <div
                className="portfolio-post__content"
                dir="rtl"
                dangerouslySetInnerHTML={{ __html: processedContent || item?.description || '' }}
              />
            </div>

            {/* View Project Button */}
            {item?.project_url && (
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <a
                  href={item.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#000',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                  }}
                >
                  <FaExternalLinkAlt />
                  رؤية المشروع
                </a>
              </div>
            )}

            {/* Request Similar Project Form */}
            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
              <button
                onClick={() => {
                  const token = localStorage.getItem('userToken');
                  if (!token) {
                    setShowLoginModal(true);
                  } else {
                    setShowProjectForm(true);
                  }
                }}
                style={{
                  background: '#F7EC06',
                  color: '#1F1F2C',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                قدم طلب لمشروع مماثل
              </button>
            </div>

            {/* Project Request Form Modal */}
            {showProjectForm && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.7)',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
              }} dir="rtl" onClick={() => setShowProjectForm(false)}>
                <div style={{
                  background: 'rgb(31, 31, 44)',
                  borderRadius: '16px',
                  padding: '2rem',
                  maxWidth: '500px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflow: 'auto',
                }} onClick={(e) => e.stopPropagation()}>
                  <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '1.5rem' }}>قدم طلب لمشروع مماثل</h3>
                  
                  {/* Success Message */}
                  {formSuccess && (
                    <div style={{
                      background: '#4CAF50',
                      color: '#fff',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      textAlign: 'center',
                    }}>
                      {formSuccess}
                    </div>
                  )}

                  {/* Error Messages */}
                  {Object.keys(formErrors).length > 0 && (
                    <div style={{
                      background: '#f44336',
                      color: '#fff',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                    }}>
                      <ul style={{ margin: 0, paddingRight: '1.5rem' }}>
                        {Object.entries(formErrors).map(([field, messages]) => (
                          Array.isArray(messages) ? messages.map((msg, idx) => (
                            <li key={`${field}-${idx}`}>{msg}</li>
                          )) : <li key={field}>{messages}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSubmitting(true);
                    setFormErrors({});
                    setFormSuccess('');
                    try {
                      const token = localStorage.getItem('userToken');
                      const response = await apiClient.post('/project-requests', {
                        portfolio_id: item?.id,
                        ...formData,
                      }, { headers: { Authorization: `Bearer ${token}` } });
                      if (response.success) {
                        setFormSuccess('تم إرسال طلبك بنجاح');
                        showToast('تم إرسال طلبك بنجاح', 'success');
                        setTimeout(() => {
                          setShowProjectForm(false);
                          setFormData({ name: '', email: '', phone: '', description: '', requirements: '' });
                          setFormSuccess('');
                        }, 2000);
                      }
                    } catch (error) {
                      const errorMessage = error.message || 'حدث خطأ في إرسال الطلب';
                      if (error.response?.data?.errors) {
                        setFormErrors(error.response.data.errors);
                      } else if (error.response?.data?.message) {
                        setFormErrors({ general: error.response.data.message });
                      } else {
                        setFormErrors({ general: errorMessage });
                      }
                      showToast(errorMessage, 'error');
                    } finally {
                      setSubmitting(false);
                    }
                  }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', color: '#fff', marginBottom: '0.5rem' }}>الاسم</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({...formData, name: e.target.value});
                          if (formErrors.name) setFormErrors({...formErrors, name: null});
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: formErrors.name ? '1px solid #f44336' : '1px solid #3b3b4d',
                          background: '#2a2a3a',
                          color: '#fff',
                        }}
                      />
                      {formErrors.name && (
                        <div style={{ color: '#f44336', fontSize: '12px', marginTop: '0.25rem' }}>
                          {Array.isArray(formErrors.name) ? formErrors.name[0] : formErrors.name}
                        </div>
                      )}
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', color: '#fff', marginBottom: '0.5rem' }}>البريد الإلكتروني</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({...formData, email: e.target.value});
                          if (formErrors.email) setFormErrors({...formErrors, email: null});
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: formErrors.email ? '1px solid #f44336' : '1px solid #3b3b4d',
                          background: '#2a2a3a',
                          color: '#fff',
                        }}
                      />
                      {formErrors.email && (
                        <div style={{ color: '#f44336', fontSize: '12px', marginTop: '0.25rem' }}>
                          {Array.isArray(formErrors.email) ? formErrors.email[0] : formErrors.email}
                        </div>
                      )}
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', color: '#fff', marginBottom: '0.5rem' }}>رقم الجوال</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({...formData, phone: e.target.value});
                          if (formErrors.phone) setFormErrors({...formErrors, phone: null});
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: formErrors.phone ? '1px solid #f44336' : '1px solid #3b3b4d',
                          background: '#2a2a3a',
                          color: '#fff',
                        }}
                      />
                      {formErrors.phone && (
                        <div style={{ color: '#f44336', fontSize: '12px', marginTop: '0.25rem' }}>
                          {Array.isArray(formErrors.phone) ? formErrors.phone[0] : formErrors.phone}
                        </div>
                      )}
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', color: '#fff', marginBottom: '0.5rem' }}>الوصف</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.description}
                        onChange={(e) => {
                          setFormData({...formData, description: e.target.value});
                          if (formErrors.description) setFormErrors({...formErrors, description: null});
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: formErrors.description ? '1px solid #f44336' : '1px solid #3b3b4d',
                          background: '#2a2a3a',
                          color: '#fff',
                          resize: 'vertical',
                        }}
                      />
                      {formErrors.description && (
                        <div style={{ color: '#f44336', fontSize: '12px', marginTop: '0.25rem' }}>
                          {Array.isArray(formErrors.description) ? formErrors.description[0] : formErrors.description}
                        </div>
                      )}
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', color: '#fff', marginBottom: '0.5rem' }}>المتطلبات</label>
                      <textarea
                        rows={3}
                        value={formData.requirements}
                        onChange={(e) => {
                          setFormData({...formData, requirements: e.target.value});
                          if (formErrors.requirements) setFormErrors({...formErrors, requirements: null});
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: formErrors.requirements ? '1px solid #f44336' : '1px solid #3b3b4d',
                          background: '#2a2a3a',
                          color: '#fff',
                          resize: 'vertical',
                        }}
                      />
                      {formErrors.requirements && (
                        <div style={{ color: '#f44336', fontSize: '12px', marginTop: '0.25rem' }}>
                          {Array.isArray(formErrors.requirements) ? formErrors.requirements[0] : formErrors.requirements}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowProjectForm(false)}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #3b3b4d',
                          background: 'transparent',
                          color: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#F7EC06',
                          color: '#1F1F2C',
                          fontWeight: 'bold',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {submitting ? 'جاري الإرسال...' : 'إرسال'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Login Modal */}
            {showLoginModal && (
              <LoginModal
                onClose={() => setShowLoginModal(false)}
                onSubmit={(data) => {
                  if (data.type === 'login') {
                    setShowLoginModal(false);
                    setShowProjectForm(true);
                  }
                }}
              />
            )}

          </div>

          {/* Sidebar */}
          {!loading && (
            <aside className="portfolio-post__sidebar">
              <h3 className="portfolio-post__sidebar-title">مشاريع ذات صلة</h3>
              {relatedItems.length > 0 ? (
                <div className="portfolio-post__related">
                  {relatedItems.map((relatedItem) => (
                    <button
                      key={relatedItem.id || relatedItem.slug}
                      type="button"
                      className="portfolio-post__related-item portfolio-post__related-item--button"
                      onClick={() => {
                        const targetId = relatedItem.id ?? relatedItem.slug;
                        if (!targetId) return;
                        navigate(`/portfolio/${encodeURIComponent(targetId)}`, {
                          state: { item: relatedItem },
                        });
                      }}
                    >
                      <div className="portfolio-post__related-image">
                        <img 
                          src={getImageUrl(relatedItem.image)}
                          alt={relatedItem.title}
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = FALLBACK_IMAGE;
                          }}
                        />
                        <div className="portfolio-post__related-logo">
                          <span className="portfolio-post__related-logo-letter">e</span>
                        </div>
                      </div>
                      <div className="portfolio-post__related-content">
                        <h4 className="portfolio-post__related-title">
                          {relatedItem.title}
                        </h4>
                        <p className="portfolio-post__related-subtitle">
                          {extractPortfolioSummary(relatedItem, 80)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#ccc', textAlign: 'center', padding: '1rem' }}>
                  لا توجد مشاريع ذات صلة
                </p>
              )}
            </aside>
          )}
        </div>
        {loading && (
          <p style={{ color: '#fff', textAlign: 'center', marginTop: '1rem' }}>
            جاري تحميل المشروع...
          </p>
        )}
        {!loading && error && (
          <p style={{ color: '#ff6b6b', textAlign: 'center', marginTop: '1rem' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
});

PortfolioPost.displayName = 'PortfolioPost';

export default PortfolioPost;

