
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import FeaturedPackagesSlider from './Componants/ProductCard/FeaturedPackagesSlider';
import Navbar from './Componants/Navbar/Navbar';
import CustomCursor from './Componants/CustomCursor/CustomCursor';
import HeroSlider from './Componants/HeroSlider/HeroSlider';
import FeaturedService from './Componants/FeaturedService/FeaturedService';
import ServicesSlider from './Componants/ServicesSlider/ServicesSlider';
import StepsSection from './Componants/StepsSection/StepsSection';
import Stats from './Componants/Stats/Stats';
import ProductsSlider from './Componants/ProductsSlider/ProductsSlider';
import ContactBar from './Componants/ContactBar/ContactBar';
import WhyChooseUs from './Componants/WhyChooseUs/WhyChooseUs';
import DesignSlider from './Componants/DesignSlider/DesignSlider';
import WebDevSlider from './Componants/WebDevSlider/WebDevSlider';
import PackagesSlider from './Componants/PackagesSlider/PackagesSlider';
import ReviewsSlider from './Componants/ReviewsSlider/ReviewsSlider';
import Blog from './Componants/Blog/Blog';
import BlogPost from './Componants/BlogPost/BlogPost';
import Portfolio from './Componants/Portfolio/Portfolio';
import PortfolioPost from './Componants/PortfolioPost/PortfolioPost';
import CategoryPage from './Componants/CategoryPage/CategoryPage';
import Page from './Componants/Page/Page';
import ViewAll from './Componants/ViewAll/ViewAll';
import SocialViewAll from './Componants/SocialViewAll/SocialViewAll';
import ServicePackages from './Componants/ServicePackages/ServicePackages';
import AccountsForSale from './Componants/AccountsForSale/AccountsForSale';
import AdsCampaigns from './Componants/AdsCampaigns/AdsCampaigns';
import Verification from './Componants/Verification/Verification';
import Footer from './Componants/Footer/Footer';
import WhatsAppButton from './Componants/WhatsAppButton/WhatsAppButton';
import WhyChooseUs2 from './Componants/WhyChooseUs2/WhyChooseUs2';
import AllReviews from './Componants/AllReviews/AllReviews';
import Cart from './Componants/Cart/Cart';
import Checkout from './Componants/Checkout/Checkout';
import Wishlist from './Componants/Wishlist/Wishlist';
import BottomNavbar from './Componants/BottomNavbar/BottomNavbar';
import MetaTagsManager from './Componants/MetaTags/MetaTagsManager';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { useSettings } from './hooks/useSettings';
import { useNotifications } from './hooks/useNotifications';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import SaudiRiyalIcon from './Componants/SaudiRiyalIcon/SaudiRiyalIcon';
import './App.css';
import { MdNotificationsActive, MdOutlineLogout } from 'react-icons/md';
import { FaShoppingBag } from 'react-icons/fa';
import { GiShoppingCart } from 'react-icons/gi';
import { CiStar } from 'react-icons/ci';
import { CgProfile } from 'react-icons/cg';
import { IoPersonOutline } from 'react-icons/io5';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://storage-te.com/backend/api/v1';

function App() {
  const { ticker } = useSettings();
  // Initialize notifications
  useNotifications();
  const location = useLocation();
  const isServicePackagesPage = location.pathname.includes('/service/');

  return (
    <ErrorBoundary>
      <ToastProvider>
        <CurrencyProvider>
          <CartProvider>
            <FavoritesProvider>
            <div className="App">
        <MetaTagsManager />
        <CustomCursor />
        {ticker?.enabled && ticker?.text && (
          <div style={{
            background: '#1F1F2C',
            padding: '0.5rem 0',
            textAlign: 'center',
            color: '#F7EC06',
            fontSize: '14px',
            fontWeight: '600',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            position: 'relative',
            zIndex: 999
          }}>
            <marquee behavior="scroll" direction="right" style={{ display: 'inline-block' }}>
              {ticker.text}
            </marquee>
          </div>
        )}
        <Navbar />
        <main className="App-main">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<PageHome />} />
            <Route path="/about" element={<PageAbout />} />
            <Route path="/notifications" element={<PageNotifications />} />
            <Route path="/orders" element={<PageOrders />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/pending-payments" element={<PagePendingPayments />} />
            <Route path="/countries" element={<PageCountries />} />
            <Route path="/currencies" element={<PageCurrencies />} />
            <Route path="/account" element={<PageAccount />} />
            <Route path="/service" element={<FeaturedService />} />
            <Route path="/service/:slug" element={<ServicePackages />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/blog" element={<PageBlog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:id" element={<PortfolioPost />} />
            <Route path="/page/:slug" element={<Page />} />
            <Route path="/view-all" element={<ViewAll />} />
            <Route path="/social-view-all" element={<SocialViewAll />} />
            <Route path="/service-packages/:id" element={<ServicePackages />} />
            <Route path="/accounts-for-sale" element={<AccountsForSale />} />
            <Route path="/ads-campaigns-services" element={<AdsCampaigns />} />
            <Route path="/verification-services" element={<Verification />} />
            <Route path="/social" element={<PageSocial />} />
            <Route path="/accounts-sale" element={<PageAccountsSale />} />
            <Route path="/ads-campaigns" element={<PageAdsCampaigns />} />
            <Route path="/verification" element={<PageVerification />} />
            <Route path="/accounts-management" element={<PageAccountsManagement />} />
            <Route path="/graphic-design" element={<PageGraphicDesign />} />
            <Route path="/web-apps" element={<PageWebApps />} />
            <Route path="/all-reviews" element={<AllReviews />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <WhatsAppButton />
        <Footer />
        {!isServicePackagesPage && <BottomNavbar />}
          </div>
            </FavoritesProvider>
          </CartProvider>
        </CurrencyProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;

function PageHome(){
  const [homeData, setHomeData] = React.useState(null);
  
  React.useEffect(() => {
    const loadHomeData = async () => {
      try {
        const { frontendApi } = await import('./services/apiClient');
        const response = await frontendApi.get('/home');
        if (response.success) {
          setHomeData(response.data);
        }
      } catch (error) {
        console.error('Error loading home data:', error);
      }
    };
    loadHomeData();
  }, []);

  const heroSliderData = React.useMemo(() => {
    // استخدام السلايدر من الباك اند فقط
    if (homeData?.sliders && homeData.sliders.length > 0) {
      return homeData.sliders;
    }
    // إذا لم تكن هناك sliders، نرجع array فارغ
    return [];
  }, [homeData]);

  return (
    <>
      <div style={{ 
        width: '80%', 
        maxWidth: '1400px',
        margin: '0 auto', 
        position: 'relative', 
        zIndex: 1, 
        marginTop: '30px', 
        paddingTop: '20px',
        paddingBottom: '20px'
      }}>
        <HeroSlider
          height="auto"
          sliders={heroSliderData}
        />
      </div>
      
      <section className="section" style={{ background: '#343444', padding: 0, marginTop: '20px' }}>
        <div id="services-anchor"></div>
        <ServicesSlider categories={homeData?.categories} />
      </section>
      
      {/* Featured Service Section */}
      <section className="section" style={{ 
        background: '#1F1F2C', 
        padding: '4rem 0',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <FeaturedPackagesSlider />
        </div>
      </section>
      {/* Featured service after services */}
      
      <StepsSection />
      <Stats />
      
      <WhyChooseUs2 />

      <ProductsSlider />
      <ContactBar />
      <DesignSlider />
      
      <WebDevSlider />
      <PackagesSlider />
      <ReviewsSlider />
    </>
  );
}
function PageNotifications(){
  const { showToast } = useToast();
  const { settings = {} } = useSettings();
  const {
    notifications,
    permission,
    loading,
    error,
    unreadCount,
    notificationsEnabled,
    requestPermission,
    toggleNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const handleRequestPermission = async () => {
    // Check current permission before requesting
    const currentPerm = Notification.permission;
    
    if (currentPerm === 'granted') {
      showToast('الإشعارات مفعلة بالفعل', 'success');
      return;
    }
    
    if (currentPerm === 'denied') {
      showToast('تم رفض الإشعارات مسبقاً. يرجى السماح بالإشعارات من إعدادات المتصفح', 'warning');
      return;
    }

    try {
      const result = await requestPermission();
      // Check both the returned value and current permission state
      const finalPermission = result || Notification.permission;
      
      if (finalPermission === 'granted') {
        showToast('✅ تم تفعيل الإشعارات بنجاح', 'success');
      } else if (finalPermission === 'denied') {
        showToast('❌ تم رفض الإشعارات. يرجى السماح بالإشعارات من إعدادات المتصفح', 'warning');
      } else if (finalPermission === 'unsupported') {
        showToast('المتصفح لا يدعم الإشعارات', 'error');
      } else {
        // Default state - user might have dismissed the prompt
        showToast('⚠️ لم يتم تفعيل الإشعارات. يرجى الضغط على "السماح" عند ظهور النافذة المنبثقة', 'warning');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      showToast('حدث خطأ أثناء طلب الإذن: ' + (error.message || 'خطأ غير معروف'), 'error');
    }
  };

  return (
    <section className="section" style={{ background: '#1F1F2C', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div className="notifications-layout" dir="rtl">
          {/* Sidebar */}
          <aside className="notifications-sidebar">
            <nav>
              <a href="/notifications" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ABB3BA', padding: '12px 16px', textDecoration: 'none' }}>
                <MdNotificationsActive />
                <span>الإشعارات</span>
                {unreadCount > 0 && (
                  <span style={{ background: '#F7EC06', color: '#1F1F2C', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', marginRight: 'auto' }}>
                    {unreadCount}
                  </span>
                )}
              </a>
              <a href="/orders" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ABB3BA', padding: '12px 16px', textDecoration: 'none' }}><FaShoppingBag /><span>الطلبات</span></a>
              <a href="/pending-payments" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ABB3BA', padding: '12px 16px', textDecoration: 'none' }}><GiShoppingCart /><span>طلبات بانتظار الدفع</span></a>
              <a href="/account" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ABB3BA', padding: '12px 16px', textDecoration: 'none' }}><CgProfile /><span>حسابي</span></a>
              <button onClick={() => { try { localStorage.removeItem('userAvatar'); } catch {}; window.location.href='/home'; }} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#ABB3BA', padding: '12px 16px', textAlign: 'right' }}><MdOutlineLogout /><span>تسجيل الخروج</span></button>
            </nav>
          </aside>

          {/* Content */}
          <div className="notifications-content">
            <div className="notifications-header">
              <h2>الإشعارات</h2>
              <div className="notifications-controls">
                {permission === 'granted' && (
                  <div className="notifications-status">
                    <span className={notificationsEnabled ? 'text-success' : 'text-danger'} style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {notificationsEnabled ? '✓ الإشعارات مفعلة' : '✗ الإشعارات معطلة'}
                    </span>
                    <label className="notifications-toggle" onClick={(e) => e.stopPropagation()}>
                      <div
                        onClick={toggleNotifications}
                        className={`notifications-toggle-switch ${notificationsEnabled ? 'active' : ''}`}
                      >
                        <div className={`notifications-toggle-knob ${notificationsEnabled ? 'active' : ''}`} />
                      </div>
                    </label>
                  </div>
                )}
                {permission === 'denied' && (
                  <span className="text-danger" style={{ fontSize: '14px' }}>
                    ✗ الإشعارات مرفوضة - الإشعارات ستظهر في القائمة فقط
                  </span>
                )}
                {permission !== 'granted' && permission !== 'denied' && (
                  <button
                    onClick={handleRequestPermission}
                    disabled={loading || !settings?.firebase_vapid_key}
                    className="notifications-btn"
                  >
                    {loading ? 'جاري التحميل...' : 'تفعيل الإشعارات'}
                  </button>
                )}
                {notifications.length > 0 && (
                  <>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="notifications-btn notifications-btn-secondary"
                      >
                        تعليم الكل كمقروء
                      </button>
                    )}
                    <button
                      onClick={clearAll}
                      className="notifications-btn notifications-btn-danger"
                    >
                      حذف الكل
                    </button>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="notifications-error">
                {error}
              </div>
            )}

            {loading && notifications.length === 0 ? (
              <div className="notifications-empty">
                <div className="notifications-empty-icon">
                  <MdNotificationsActive size={40} />
                </div>
                <p style={{ margin: 0 }}>جاري التحميل...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notifications-empty">
                <div className="notifications-empty-icon">
                  <MdNotificationsActive size={40} />
                </div>
                <p style={{ margin: 0 }}>لا توجد إشعارات</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    className={`notifications-item ${!notification.read ? 'unread' : ''}`}
                  >
                    <div className="notifications-item-content">
                      <div className="notifications-item-text">
                        <div className="notifications-item-title">
                          <h3>{notification.title}</h3>
                          {!notification.read && <span className="notifications-item-dot" />}
                        </div>
                        <p className="notifications-item-body">{notification.body}</p>
                        <p className="notifications-item-time">
                          {new Date(notification.timestamp).toLocaleString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="notifications-item-delete"
                        title="حذف"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PageOrders(){
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('userToken');
        if (!token) {
          window.location.href = '/home';
          return;
        }

        const response = await fetch(`${API_BASE_URL}/follower-orders`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setOrders(data.data || []);
        } else {
          setError(data.message || 'حدث خطأ في جلب البيانات');
        }
      } catch (err) {
        setError('حدث خطأ في الاتصال بالخادم');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <section className="section" style={{ background: '#1F1F2C', padding: '2rem 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <p style={{ color: '#fff', textAlign: 'center' }}>جاري تحميل الطلبات...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section" style={{ background: '#1F1F2C', padding: '2rem 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <p style={{ color: '#F7EC06', textAlign: 'center' }}>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ background: '#1F1F2C', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <h2 style={{ color: '#fff', marginBottom: '2rem', textAlign: 'center' }}>الطلبات</h2>

        {orders.length === 0 ? (
          <p style={{ color: '#ABB3BA', textAlign: 'center' }}>لا توجد طلبات</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map((order, index) => (
              <div key={order.id || index} style={{
                background: '#2a2a3a',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }} dir="rtl">
                <div>
                  <h4 style={{ color: '#fff', margin: '0 0 0.5rem' }}>
                    طلب #{order.id || 'غير محدد'}
                  </h4>
                  <p style={{ color: '#ABB3BA', margin: 0, fontSize: '14px' }}>
                    الحالة: {order.status || 'غير محدد'}
                  </p>
                  <p style={{ color: '#ABB3BA', margin: '0.25rem 0', fontSize: '14px' }}>
                    التاريخ: {order.created_at ? new Date(order.created_at).toLocaleDateString('ar-SA') : 'غير محدد'}
                  </p>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ color: '#F7EC06', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                    {parseFloat(order.total || 0).toFixed(2)} <SaudiRiyalIcon width={16} height={17} />
                  </p>
                  <p style={{ color: '#ccc', margin: '0.25rem 0', fontSize: '14px' }}>
                    {order.items_count || 0} عنصر
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PagePendingPayments(){
  const [pendingData, setPendingData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadPendingPayments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('userToken');
        if (!token) {
          window.location.href = '/home';
          return;
        }

        const response = await fetch(`${API_BASE_URL}/pending-payments`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setPendingData(data.data);
        } else {
          setError(data.message || 'حدث خطأ في جلب البيانات');
        }
      } catch (err) {
        setError('حدث خطأ في الاتصال بالخادم');
      } finally {
        setLoading(false);
      }
    };

    loadPendingPayments();
  }, []);

  if (loading) {
    return (
      <section className="section" style={{ background: '#1F1F2C', padding: '2rem 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <p style={{ color: '#fff', textAlign: 'center' }}>جاري التحميل...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section" style={{ background: '#1F1F2C', padding: '2rem 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <p style={{ color: '#F7EC06', textAlign: 'center' }}>{error}</p>
        </div>
      </section>
    );
  }

  const allItems = [
    ...(pendingData?.cart?.items || []),
    ...(pendingData?.follower_orders?.items || []),
    ...(pendingData?.project_requests?.items || []),
  ];

  return (
    <section className="section" style={{ background: '#1F1F2C', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <h2 style={{ color: '#fff', marginBottom: '2rem', textAlign: 'center' }}>طلبات بانتظار الدفع</h2>
        
        {allItems.length === 0 ? (
          <p style={{ color: '#ABB3BA', textAlign: 'center' }}>لا توجد طلبات بانتظار الدفع</p>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {allItems.map((item, index) => (
                <div key={index} style={{
                  background: '#2a2a3a',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }} dir="rtl">
                  <div>
                    <h4 style={{ color: '#fff', margin: '0 0 0.5rem' }}>{item.name}</h4>
                    <p style={{ color: '#ABB3BA', margin: 0, fontSize: '14px' }}>
                      النوع: {item.type === 'cart' ? 'سلة التسوق' : item.type === 'follower_order' ? 'طلب متابعين' : 'طلب مشروع'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ color: '#F7EC06', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                      {parseFloat(item.price || 0).toFixed(2)} <SaudiRiyalIcon width={16} height={17} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{
              background: '#2a2a3a',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center',
            }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>الإجمالي</h3>
              <p style={{ color: '#F7EC06', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                {parseFloat(pendingData?.grand_total || 0).toFixed(2)} <SaudiRiyalIcon width={20} height={21} />
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function PageCountries(){
  const [countries, setCountries] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://storage-te.com/backend/api/frontend'}/countries`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setCountries(data.data);
          } else {
            setError('فشل في تحميل بيانات الدول');
          }
        } else {
          setError('خطأ في الاتصال بالخادم');
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        setError('حدث خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <h2>الدول</h2>
          <p style={{ textAlign: 'center', color: '#fff' }}>جاري تحميل الدول...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <h2>الدول</h2>
          <p style={{ textAlign: 'center', color: '#ff6b6b' }}>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>الدول المدعومة</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem',
          direction: 'rtl'
        }}>
          {countries.map((country) => (
            <div key={country.id} style={{
              background: '#343444',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(247, 236, 6, 0.15)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(247, 236, 6, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{
                  width: '60px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #F7EC06, #E6D605)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1f1f2c'
                }}>
                  {country.code}
                </div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.1rem' }}>
                  {country.name_ar}
                </h3>
                <p style={{ color: '#ccc', margin: 0, fontSize: '0.9rem' }}>
                  {country.name}
                </p>
              </div>

              <div style={{
                background: '#2a2a3a',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#F7EC06', margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  العملة: {country.currency.name_ar}
                </p>
                <p style={{ color: '#fff', margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {country.currency.symbol} ({country.currency.code})
                </p>
              </div>
            </div>
          ))}
        </div>

        {countries.length === 0 && !loading && (
          <p style={{ textAlign: 'center', color: '#ccc', marginTop: '2rem' }}>
            لا توجد دول متاحة حالياً.
          </p>
        )}
      </div>
    </section>
  );
}

function PageCurrencies(){
  const [currencies, setCurrencies] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to get currencies from countries endpoint
        const countriesResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://storage-te.com/backend/api/frontend'}/countries`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (countriesResponse.ok) {
          const countriesData = await countriesResponse.json();
          if (countriesData.success && countriesData.data) {
            // Extract unique currencies from countries
            const uniqueCurrencies = [];
            const currencyMap = new Map();

            countriesData.data.forEach(country => {
              if (country.currency && !currencyMap.has(country.currency.id)) {
                currencyMap.set(country.currency.id, true);
                uniqueCurrencies.push({
                  ...country.currency,
                  countries: [country] // Track which countries use this currency
                });
              } else if (country.currency && currencyMap.has(country.currency.id)) {
                // Add country to existing currency
                const existingCurrency = uniqueCurrencies.find(c => c.id === country.currency.id);
                if (existingCurrency) {
                  existingCurrency.countries.push(country);
                }
              }
            });

            setCurrencies(uniqueCurrencies);
          } else {
            setError('فشل في تحميل بيانات العملات');
          }
        } else {
          setError('خطأ في الاتصال بالخادم');
        }
      } catch (error) {
        console.error('Error fetching currencies:', error);
        setError('حدث خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <h2>العملات</h2>
          <p style={{ textAlign: 'center', color: '#fff' }}>جاري تحميل العملات...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <h2>العملات</h2>
          <p style={{ textAlign: 'center', color: '#ff6b6b' }}>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>العملات المدعومة</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem',
          direction: 'rtl'
        }}>
          {currencies.map((currency) => (
            <div key={currency.id} style={{
              background: '#343444',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(247, 236, 6, 0.15)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(247, 236, 6, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{
                  width: '80px',
                  height: '50px',
                  background: 'linear-gradient(135deg, #F7EC06, #E6D605)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  color: '#1f1f2c'
                }}>
                  {currency.symbol}
                </div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.2rem' }}>
                  {currency.name_ar}
                </h3>
                <p style={{ color: '#ccc', margin: 0, fontSize: '0.9rem' }}>
                  {currency.name}
                </p>
                <p style={{ color: '#F7EC06', margin: '0.5rem 0 0', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  كود: {currency.code}
                </p>
              </div>

              <div style={{
                background: '#2a2a3a',
                padding: '1rem',
                borderRadius: '8px'
              }}>
                <p style={{ color: '#F7EC06', margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 'bold', textAlign: 'center' }}>
                  الدول المستخدمة ({currency.countries.length}):
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                  {currency.countries.map((country) => (
                    <span key={country.id} style={{
                      background: 'rgba(247, 236, 6, 0.1)',
                      color: '#F7EC06',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      border: '1px solid rgba(247, 236, 6, 0.2)'
                    }}>
                      {country.name_ar}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {currencies.length === 0 && !loading && (
          <p style={{ textAlign: 'center', color: '#ccc', marginTop: '2rem' }}>
            لا توجد عملات متاحة حالياً.
          </p>
        )}
      </div>
    </section>
  );
}

function PageAccount(){
  const { showToast } = useToast();
  const [showDisableModal, setShowDisableModal] = React.useState(false);
  const [userData, setUserData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [formErrors, setFormErrors] = React.useState({});
  const [formSuccess, setFormSuccess] = React.useState('');
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: ''
  });


  // Fetch user profile data
  React.useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          window.location.href = '/home';
          return;
        }

        const { apiClient } = await import('./services/apiClient');
        // Get fresh profile data (skipCache ensures we get latest data)
        const data = await apiClient.get('/user/profile', { 
          skipCache: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (data.success && data.data?.user) {
          const user = data.data.user;
          setUserData(user);
          
          // Split name into first and last name
          const nameParts = user.name ? user.name.split(' ') : ['', ''];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          setFormData({
            firstName,
            lastName,
            email: user.email || ''
          });
        } else {
          console.error('Error fetching user profile:', data.message);
          showToast('حدث خطأ في جلب بيانات المستخدم', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        showToast(error.message || 'حدث خطأ في الاتصال بالخادم', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const card = { background: '#141420', borderRadius: '12px', padding: '24px' };
  const label = { color: '#cfcfcf', fontSize: 12, marginBottom: 6 };
  const input = { background: '#2a2a3a', border: '2px solid #3b3b4d', color: '#fff', padding: '12px 14px', borderRadius: 10, outline: 'none' };
  const row = { display: 'flex', gap: '12px' };
  const select = { ...input, padding: '12px 10px' };
  const btn = { width: '100%', background: '#F7EC06', color: '#1F1F2C', border: 'none', padding: 14, borderRadius: 12, fontWeight: 800, cursor: 'pointer' };

  const prefixBox = { width: 90, ...select };
  const avatarUrl = (()=>{ 
    try { 
      return localStorage.getItem('userAvatar') || (userData?.avatar || null);
    } catch { 
      return null; 
    } 
  })();

  return (
    <section className="section account-page" style={{ background: '#1F1F2C', padding: '2rem 0' }}>
      <div className="container account-container">
        <div className="account-layout" dir="rtl">
          {/* Sidebar */}
          <aside className="account-sidebar">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 12px', gap: 10 }}>
              <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#2A2A3B', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="user" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <IoPersonOutline size={46} color="#F7EC06" />
                )}
              </div>
              {userData && (
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <p style={{ color: '#fff', margin: 0, fontSize: 14, fontWeight: 600 }}>{userData.name}</p>
                  <p style={{ color: '#ABB3BA', margin: '4px 0 0', fontSize: 12 }}>{userData.email}</p>
                </div>
              )}
            </div>
            <nav>
              <a href="/notifications" style={{ display: 'block', color: '#ABB3BA', padding: '12px 16px', textDecoration: 'none' }}>الإشعارات</a>
              <a href="/orders" style={{ display: 'block', color: '#ABB3BA', padding: '12px 16px', textDecoration: 'none' }}>الطلبات</a>
              <a href="/pending-payments" style={{ display: 'block', color: '#ABB3BA', padding: '12px 16px', textDecoration: 'none' }}>طلبات بانتظار الدفع</a>
              <a href="/account" style={{ display: 'block', color: '#ABB3BA', padding: '12px 16px', textDecoration: 'none', background: 'rgba(247,236,6,0.08)' }}>حسابي</a>
              <a href="/countries" style={{ display: 'block', color: '#ABB3BA', padding: '12px 16px', textDecoration: 'none' }}>الدول</a>
              <a href="/currencies" style={{ display: 'block', color: '#ABB3BA', padding: '12px 16px', textDecoration: 'none' }}>العملات</a>
            </nav>
          </aside>

          {/* Content */}
          <div className="account-content">
            <div className="account-card" style={card}>
              <h2 style={{ color: '#fff', marginTop: 0, marginBottom: '18px', textAlign: 'center' }}>حسابي</h2>
              
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

              {/* Row 1: first/last name */}
              <div className="account-row" style={{ ...row, marginBottom: 12 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={label}>الاسم الأول</label>
                  <input 
                    style={{
                      ...input,
                      border: formErrors.firstName || formErrors.name ? '2px solid #f44336' : input.border
                    }}
                    placeholder="الاسم الأول" 
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData({...formData, firstName: e.target.value});
                      if (formErrors.firstName || formErrors.name) {
                        const newErrors = {...formErrors};
                        delete newErrors.firstName;
                        delete newErrors.name;
                        setFormErrors(newErrors);
                      }
                    }}
                    disabled={loading}
                  />
                  {(formErrors.firstName || formErrors.name) && (
                    <div style={{ color: '#f44336', fontSize: '12px', marginTop: '0.25rem' }}>
                      {Array.isArray(formErrors.firstName || formErrors.name) 
                        ? (formErrors.firstName || formErrors.name)[0] 
                        : (formErrors.firstName || formErrors.name)}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={label}>الاسم الأخير</label>
                  <input 
                    style={{
                      ...input,
                      border: formErrors.lastName ? '2px solid #f44336' : input.border
                    }}
                    placeholder="الاسم الأخير" 
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({...formData, lastName: e.target.value});
                      if (formErrors.lastName) {
                        const newErrors = {...formErrors};
                        delete newErrors.lastName;
                        setFormErrors(newErrors);
                      }
                    }}
                    disabled={loading}
                  />
                  {formErrors.lastName && (
                    <div style={{ color: '#f44336', fontSize: '12px', marginTop: '0.25rem' }}>
                      {Array.isArray(formErrors.lastName) ? formErrors.lastName[0] : formErrors.lastName}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: email */}
              <div className="account-row" style={{ ...row, marginBottom: 16 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={label}>البريد الإلكتروني</label>
                  <input 
                    style={{
                      ...input,
                      border: formErrors.email ? '2px solid #f44336' : input.border
                    }}
                    dir="ltr" 
                    placeholder="name@email.com" 
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({...formData, email: e.target.value});
                      if (formErrors.email) {
                        const newErrors = {...formErrors};
                        delete newErrors.email;
                        setFormErrors(newErrors);
                      }
                    }}
                    disabled={loading}
                  />
                  {formErrors.email && (
                    <div style={{ color: '#f44336', fontSize: '12px', marginTop: '0.25rem' }}>
                      {Array.isArray(formErrors.email) ? formErrors.email[0] : formErrors.email}
                    </div>
                  )}
                </div>
              </div>

              <button 
                className="account-btn" 
                style={btn}
                disabled={loading}
                onClick={async () => {
                  if (loading) return;
                  
                  setLoading(true);
                  setFormErrors({});
                  setFormSuccess('');
                  
                  try {
                    const token = localStorage.getItem('userToken');
                    if (!token) {
                      showToast('يرجى تسجيل الدخول أولاً', 'error');
                      setLoading(false);
                      return;
                    }

                    const { apiClient } = await import('./services/apiClient');
                    const data = await apiClient.post('/user/profile', {
                      name: `${formData.firstName} ${formData.lastName}`.trim(),
                      email: formData.email
                    });

                    if (data.success) {
                      setFormSuccess('تم حفظ البيانات بنجاح');
                      showToast('تم حفظ البيانات بنجاح', 'success');
                      // Refresh user data without full page reload
                      setTimeout(async () => {
                        try {
                          const profileData = await apiClient.get('/user/profile', {
                            skipCache: true,
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          });
                          if (profileData.success && profileData.data?.user) {
                            const user = profileData.data.user;
                            setUserData(user);
                            const nameParts = user.name ? user.name.split(' ') : ['', ''];
                            setFormData({
                              firstName: nameParts[0] || '',
                              lastName: nameParts.slice(1).join(' ') || '',
                              email: user.email || ''
                            });
                          }
                        } catch (err) {
                          console.error('Error refreshing profile:', err);
                        }
                      }, 500);
                    } else {
                      const errorMsg = data.message || 'حدث خطأ في حفظ البيانات';
                      setFormErrors(data.errors || { general: errorMsg });
                      showToast(errorMsg, 'error');
                    }
                  } catch (error) {
                    console.error('Error:', error);
                    const errorMsg = error.message || 'حدث خطأ في الاتصال بالخادم';
                    setFormErrors({ general: errorMsg });
                    showToast(errorMsg, 'error');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? 'جاري التحميل...' : 'حفظ'}
              </button>
            </div>

            {/* Disable account card */}
            <div className="account-card" style={{ ...card, marginTop: 16 }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: 8, textAlign: 'right' }}>تعطيل الحساب</h3>
              <p style={{ color: '#ABB3BA', marginTop: 0, marginBottom: 12, textAlign: 'right' }}>
                يمكنك إيقاف حسابك مؤقتاً، لن تتمكن من الطلب أو تلقي الإشعارات حتى تعيد تفعيله.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => setShowDisableModal(true)}
                  style={{ background: '#F03E3E', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
                >
                  تعطيل الحساب
                </button>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: 0, height: 0, position: 'absolute', opacity: 0 }} />
                  <span style={{ width: 50, height: 26, background: '#2a2a3a', borderRadius: 999, position: 'relative', boxShadow: 'inset 0 0 0 2px #3b3b4d' }}>
                    <span style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, background: '#F7EC06', borderRadius: '50%' }} />
                  </span>
                </label>
              </div>
            </div>

            {/* Disable Account Modal */}
            {showDisableModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#1c1c2a', width: '90%', maxWidth: 560, borderRadius: 16, padding: 24, position: 'relative' }} dir="rtl">
                  {/* Close */}
                  <button onClick={() => setShowDisableModal(false)} aria-label="إغلاق" style={{ position: 'absolute', top: 12, left: 12, background: 'transparent', border: 'none', color: '#F7EC06', fontSize: 18, cursor: 'pointer' }}>✕</button>

                  {/* Icon circle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <div style={{ width: 84, height: 84, borderRadius: '50%', background: '#2a2a3a', border: '2px dashed #666', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 28 }}>✖</div>
                  </div>

                  <h3 style={{ color: '#fff', textAlign: 'center', margin: '8px 0 4px' }}>تعطيل الحساب</h3>
                  <p style={{ color: '#ABB3BA', textAlign: 'center', margin: 0 }}>تحذير: في حالة تعطيل الحساب، سيتم حذف جميع بياناتك</p>
                  <p style={{ color: '#F03E3E', textAlign: 'center', marginTop: 8, fontSize: 12 }}>نأسف جداً على اتخاذك قرار الرحيل</p>

                  <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    <button onClick={() => setShowDisableModal(false)} style={{ flex: 1, background: '#F7EC06', color: '#1F1F2C', border: 'none', padding: '12px 14px', borderRadius: 10, fontWeight: 800, cursor: 'pointer' }}>إبقاء الحساب</button>
                    <button onClick={() => { setShowDisableModal(false); showToast('تم تعطيل الحساب مؤقتاً', 'success'); }} style={{ flex: 1, background: 'transparent', color: '#F7EC06', border: '1.5px solid #F7EC06', padding: '12px 14px', borderRadius: 10, fontWeight: 800, cursor: 'pointer' }}>تعطيل الحساب</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PageAbout(){
  return (
    <section className="section" style={{ background: '#1F1F2C', padding: '4rem 0' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <h1 style={{ color: '#fff', textAlign: 'center', marginBottom: '2rem' }}>من نحن</h1>
        <p style={{ color: '#ABB3BA', textAlign: 'center', lineHeight: '1.8', fontSize: '18px' }}>
          Storage للخدمات الرقمية - نقدم حلول متكاملة في التسويق الرقمي وزيادة المتابعين
        </p>
      </div>
    </section>
  );
}

function PageBlog(){
  return <Blog />;
}

function PageSocial(){
  return (
    <section className="section"><div className="container"><h2>مواقع التواصل الاجتماعي</h2><p>إدارة الصفحات وزيادة التفاعل.</p></div></section>
  );
}

function PageAccountsSale(){
  return <AccountsForSale />;
}

function PageAdsCampaigns(){
  return (
    <section className="section"><div className="container"><h2>اداره الحملات الاعلانية</h2><p>إعداد وتحسين حملاتك الإعلانية.</p></div></section>
  );
}

function PageVerification(){
  return (
    <section className="section"><div className="container"><h2>توثيق حسابات ويوزرات</h2><p>خدمات توثيق احترافية.</p></div></section>
  );
}

function PageAccountsManagement(){
  return (
    <section className="section"><div className="container"><h2>اداره حسابات</h2><p>إدارة كاملة لحساباتك.</p></div></section>
  );
}

function PageGraphicDesign(){
  return (
    <section className="section"><div className="container"><h2>التصميم الجرافييكي</h2><p>تصاميم مبدعة وهوية بصرية.</p></div></section>
  );
}

function PageWebApps(){
  return (
    <section className="section"><div className="container"><h2>برمجه الويب والتطبيقات</h2><p>مواقع وتطبيقات عالية الجودة.</p></div></section>
  );
}

function NotFound(){
  return (
    <section className="section"><div className="container"><h2>الصفحة غير موجودة</h2><p>تأكد من الرابط.</p></div></section>
  );
}
