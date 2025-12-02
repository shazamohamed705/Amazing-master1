
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
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
import BottomNavbar from './Componants/BottomNavbar/BottomNavbar';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { useSettings } from './hooks/useSettings';
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
  
  return (
    <ErrorBoundary>
      <ToastProvider>
        <CurrencyProvider>
          <CartProvider>
            <FavoritesProvider>
            <div className="App">
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
            <Route path="/pending-payments" element={<PagePendingPayments />} />
            <Route path="/wishlist" element={<PageWishlist />} />
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
        <BottomNavbar />
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
  return (
    <section className="section" style={{ background: '#1F1F2C', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: '1rem' }} dir="rtl">
          {/* Sidebar */}
          <aside style={{ width: '260px', background: '#353545', borderRadius: '12px', overflow: 'hidden' }}>
            <nav>
              <a href="/notifications" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ABB3BA', padding: '12px 16px', textDecoration: 'none' }}><MdNotificationsActive /><span>الإشعارات</span></a>
              <a href="/orders" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ABB3BA', padding: '12px 16px', textDecoration: 'none' }}><FaShoppingBag /><span>الطلبات</span></a>
              <a href="/pending-payments" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ABB3BA', padding: '12px 16px', textDecoration: 'none' }}><GiShoppingCart /><span>طلبات بانتظار الدفع</span></a>
              <a href="/wishlist" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ABB3BA', padding: '12px 16px', textDecoration: 'none' }}><CiStar /><span>الأمنيات</span></a>
              <a href="/account" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ABB3BA', padding: '12px 16px', textDecoration: 'none' }}><CgProfile /><span>حسابي</span></a>
              <button onClick={() => { try { localStorage.removeItem('userAvatar'); } catch {}; window.location.href='/home'; }} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#ABB3BA', padding: '12px 16px', textAlign: 'right' }}><MdOutlineLogout /><span>تسجيل الخروج</span></button>
            </nav>
          </aside>

          {/* Content */}
          <div style={{ flex: 1, background: '#141420', borderRadius: '12px', padding: '24px', minHeight: '300px' }}>
            <h2 style={{ color: '#fff', marginTop: 0, marginBottom: '12px', textAlign: 'center' }}>الإشعارات</h2>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px', color: '#ABB3BA' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#2A2A3B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <MdNotificationsActive size={40} />
              </div>
              <p style={{ margin: 0 }}>لا توجد إشعارات</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PageOrders(){
  return (
    <section className="section"><div className="container"><h2>الطلبات</h2><p>قائمة طلباتك.</p></div></section>
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
                      {item.price.toFixed(2)} <SaudiRiyalIcon width={16} height={17} />
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
                {pendingData?.grand_total?.toFixed(2) || '0.00'} <SaudiRiyalIcon width={20} height={21} />
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function PageWishlist(){
  return (
    <section className="section"><div className="container"><h2>قائمة الأمنيات</h2><p>العناصر التي أضفتها للأمنيات.</p></div></section>
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
    gender: '',
    dob: '',
    phone: '',
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
          setUserData(user);
          
          // Split name into first and last name
          const nameParts = user.name ? user.name.split(' ') : ['', ''];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          // Extract phone number
          let phoneNumber = user.phone || '';

          setFormData({
            firstName: firstName,
            lastName: lastName,
            gender: user.gender || '',
            dob: user.dob || '',
            phone: phoneNumber,
            email: user.email || ''
          });
        } else {
          console.error('Error fetching user profile:', data.message);
          showToast('حدث خطأ في جلب بيانات المستخدم', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('حدث خطأ في الاتصال بالخادم', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
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
              <a href="/wishlist" style={{ display: 'block', color: '#ABB3BA', padding: '12px 16px', textDecoration: 'none' }}>الأمنيات</a>
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

              {/* Row 2: gender / dob */}
              <div className="account-row" style={{ ...row, marginBottom: 12 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={label}>الجنس</label>
                  <select 
                    style={select} 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    disabled={loading}
                  >
                    <option value="" disabled>حدد نوع الجنس</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={label}>تاريخ الميلاد</label>
                  <input 
                    style={input} 
                    type="date" 
                    placeholder="أدخل تاريخ الميلاد" 
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Row 3: phone / email */}
              <div className="account-row" style={{ ...row, marginBottom: 16 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={label}>رقم الجوال</label>
                  <div style={{ 
                    background: '#2a2a3a', 
                    border: '2px solid #3b3b4d', 
                    borderRadius: 10,
                    padding: '2px'
                  }}>
                    <PhoneInput
                      international
                      defaultCountry="SA"
                      value={formData.phone}
                      onChange={(value) => setFormData({...formData, phone: value || ''})}
                      disabled={loading}
                      style={{
                        '--PhoneInput-color--focus': '#F7EC06',
                      }}
                      className="account-phone-input"
                    />
                  </div>
                </div>
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
                  try {
                    const token = localStorage.getItem('userToken');
                    if (!token) {
                      showToast('يرجى تسجيل الدخول أولاً', 'error');
                      return;
                    }

                    const response = await fetch(`${API_BASE_URL}/user/profile`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        name: `${formData.firstName} ${formData.lastName}`.trim(),
                        email: formData.email,
                        phone: formData.phone,
                        gender: formData.gender,
                        dob: formData.dob
                      }),
                    });

                    const data = await response.json();

                    if (response.ok && data.success) {
                      setFormSuccess('تم حفظ البيانات بنجاح');
                      showToast('تم حفظ البيانات بنجاح', 'success');
                      // Refresh user data
                      setTimeout(() => window.location.reload(), 1500);
                    } else {
                      const errorMsg = data.message || 'حدث خطأ في حفظ البيانات';
                      if (data.errors) {
                        setFormErrors(data.errors);
                      } else {
                        setFormErrors({ general: errorMsg });
                      }
                      showToast(errorMsg, 'error');
                    }
                  } catch (error) {
                    console.error('Error:', error);
                    const errorMsg = error.message || 'حدث خطأ في الاتصال بالخادم';
                    if (error.response?.data?.errors) {
                      setFormErrors(error.response.data.errors);
                    } else {
                      setFormErrors({ general: errorMsg });
                    }
                    showToast(errorMsg, 'error');
                  }
                }}
              >
                {loading ? 'جاري التحميل...' : 'حفظ'}
              </button>
            </div>

            {/* Newsletter toggle card */}
            <div className="account-card" style={{ ...card, marginTop: 16 }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: 8, textAlign: 'right' }}>الرسائل الترويجية</h3>
              <p style={{ color: '#ABB3BA', marginTop: 0, marginBottom: 12, textAlign: 'right' }}>يمكنك التحكم في تفعيل أو تعطيل الرسائل الترويجية القادمة من المتجر.</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: 0, height: 0, position: 'absolute', opacity: 0 }} />
                  <span style={{ width: 50, height: 26, background: '#2a2a3a', borderRadius: 999, position: 'relative', boxShadow: 'inset 0 0 0 2px #3b3b4d' }}>
                    <span style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, background: '#F7EC06', borderRadius: '50%' }} />
                  </span>
                </label>
              </div>
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
