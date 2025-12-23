import React, { useState, useCallback, memo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CiSearch, CiStar } from "react-icons/ci";
import { IoPersonOutline } from "react-icons/io5";
import { MdNotificationsActive, MdOutlineLogout } from "react-icons/md";
import { PiShoppingBag } from "react-icons/pi";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FaShoppingBag } from "react-icons/fa";
import { GiShoppingCart } from "react-icons/gi";
import { CgProfile } from "react-icons/cg";
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import SaudiRiyalIcon from '../SaudiRiyalIcon/SaudiRiyalIcon';
import LoginModal from '../LoginModal/LoginModal';
import VerificationCodePopup from '../VerificationCodePopup/VerificationCodePopup';
import AccountDetailsPopup from '../AccountDetailsPopup/AccountDetailsPopup';
import logoImg from '../../assets/logooo.png';
import './Navbar.css';

const Navbar = memo(() => {
  const { showToast } = useToast();
  const { currency, formatPrice } = useCurrency();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [mobileDropdown, setMobileDropdown] = useState(null);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userAvatar, setUserAvatar] = useState(() => {
    // Read avatar from localStorage to persist across reloads
    try { return localStorage.getItem('userAvatar') || null; } catch { return null; }
  });
  const [userData, setUserData] = useState(() => {
    // Read user data from localStorage to persist across reloads
    try {
      const stored = localStorage.getItem('userData');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [userToken, setUserToken] = useState(() => {
    // Read token from localStorage to persist across reloads
    try { return localStorage.getItem('userToken') || null; } catch { return null; }
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const navRef = useRef(null);

  // Close user menu on outside click (all devices)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    
    // Use both touch and mouse events for better support
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, []);

  // Close user menu on route change (all devices)
  useEffect(() => {
    const handleHashChange = () => {
      setShowUserMenu(false);
    };
    
    const handlePopState = () => {
      setShowUserMenu(false);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Remove hash-based navigation logic - BrowserRouter handles routing
  const { totalItems, totalPrice, fetchCart } = useCart();
  
  // Navigation data from API
  const [navigationData, setNavigationData] = useState([]);
  const [loadingNav, setLoadingNav] = useState(true);

  // Fetch navigation data from API
  useEffect(() => {
    // Transform categories data to navigation format (defined inside useEffect to avoid dependency issues)
    const transformCategoriesToNavigation = (categories) => {
      if (!Array.isArray(categories)) {
        console.log('[Navbar] transformCategoriesToNavigation: categories is not an array', categories);
        return [];
      }
      
      console.log('[Navbar] transformCategoriesToNavigation: Raw categories count:', categories.length);
      console.log('[Navbar] transformCategoriesToNavigation: Raw categories:', categories);
      
      // Filter only active categories that should show in navbar
      // show_in_navbar must be explicitly true (not false, null, or undefined)
      const activeCategories = categories.filter(cat => 
        cat.is_active === true && cat.show_in_navbar === true
      );
      
      console.log('[Navbar] transformCategoriesToNavigation: Active categories count:', activeCategories.length);
      console.log('[Navbar] transformCategoriesToNavigation: Active categories:', activeCategories);
      
      // Separate parent and child categories
      const parentCategories = activeCategories.filter(cat => cat.parent_id === null);
      const childCategories = activeCategories.filter(cat => cat.parent_id !== null);
      
      // Build navigation structure
      const navigationItems = parentCategories
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map(parent => {
          // Find all subcategories for this parent
          const subcategories = childCategories
            .filter(child => child.parent_id === parent.id)
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map(child => ({
              id: child.id,
              name: child.name,
              url: `/category/${child.slug}`,
              slug: child.slug,
              sort_order: child.sort_order || 0
            }));
          
          return {
            id: parent.id,
            type: 'category',
            name: parent.name,
            url: `/category/${parent.slug}`,
            slug: parent.slug,
            sort_order: parent.sort_order || 0,
            subcategories: subcategories.length > 0 ? subcategories : undefined
          };
        });
      
      console.log('[Navbar] transformCategoriesToNavigation: Final navigation items:', navigationItems);
      return navigationItems;
    };

    const loadNavigation = async () => {
      try {
        const { frontendApi, apiClient } = await import('../../services/apiClient');
        
        // Try to get navigation from frontend API first
        try {
          const navResponse = await frontendApi.get('/navigation');
          console.log('[Navbar] Navigation API Response:', navResponse);
          console.log('[Navbar] Navigation Data:', navResponse.data);
          
          if (navResponse.success && navResponse.data && Array.isArray(navResponse.data) && navResponse.data.length > 0) {
            // Filter categories that should show in navbar (if they have show_in_navbar property)
            const filteredData = navResponse.data.filter(item => {
              if (item.type === 'category') {
                // For categories, check show_in_navbar if it exists
                return item.show_in_navbar !== false;
              }
              // For pages, always show them
              return true;
            });
            
            console.log('[Navbar] Filtered Navigation Data:', filteredData);
            
            // Sort navigation data by order/sort_order
            const sortedData = [...filteredData].sort((a, b) => {
              const orderA = a.sort_order !== undefined ? a.sort_order : (a.order || 0);
              const orderB = b.sort_order !== undefined ? b.sort_order : (b.order || 0);
              return orderA - orderB;
            });
            
            // Sort subcategories within each category by sort_order
            const dataWithSortedSubcategories = sortedData.map(item => {
              if (item.type === 'category' && item.subcategories && Array.isArray(item.subcategories)) {
                // Filter subcategories that should show in navbar
                const filteredSubcategories = item.subcategories.filter(sub => sub.show_in_navbar !== false);
                return {
                  ...item,
                  subcategories: filteredSubcategories.sort((a, b) => {
                    const orderA = a.sort_order !== undefined ? a.sort_order : 0;
                    const orderB = b.sort_order !== undefined ? b.sort_order : 0;
                    return orderA - orderB;
                  })
                };
              }
              return item;
            });
            
            console.log('[Navbar] Final Navigation Data (after sorting):', dataWithSortedSubcategories);
            setNavigationData(dataWithSortedSubcategories);
            setLoadingNav(false);
            return;
          } else {
            console.log('[Navbar] Navigation endpoint returned empty or invalid data');
          }
        } catch (navError) {
          console.log('[Navbar] Navigation endpoint not available, falling back to categories', navError);
        }
        
        // Fallback: Get categories and transform them
        const categoriesResponse = await apiClient.get('/categories');
        console.log('[Navbar] Categories API Response:', categoriesResponse);
        console.log('[Navbar] Categories Data:', categoriesResponse.data);
        
        if (categoriesResponse.success && categoriesResponse.data) {
          const transformedData = transformCategoriesToNavigation(categoriesResponse.data);
          console.log('[Navbar] Transformed Categories Data:', transformedData);
          setNavigationData(transformedData);
        } else {
          console.log('[Navbar] Categories endpoint returned empty or invalid data');
        }
      } catch (error) {
        console.error('Error loading navigation:', error);
      } finally {
        setLoadingNav(false);
      }
    };
    loadNavigation();
  }, []); // Empty dependency array - only run once on mount

  // Debug: Log totalItems changes
  useEffect(() => {
    console.log('[Navbar] totalItems changed ->', totalItems, 'totalPrice:', totalPrice);
  }, [totalItems, totalPrice]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
    setMobileDropdown(null); // إغلاق أي dropdown مفتوح عند فتح/إغلاق القائمة
  }, []);

  // Load cart totals once on mount if user logged in AND local cart is empty.
  // Avoid overwriting local optimistic updates after first add.
  useEffect(() => {
    const token = (() => { try { return localStorage.getItem('userToken'); } catch { return null; } })();
    if (token && totalItems === 0 && totalPrice === 0) {
      fetchCart().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setMobileDropdown(null);
  }, []);

  const toggleMobileDropdown = useCallback((dropdownName) => {
    setMobileDropdown(prev => prev === dropdownName ? null : dropdownName);
  }, []);

  const toggleSearchBar = useCallback(() => {
    setShowSearchBar(prev => !prev);
  }, []);

  const toggleLoginModal = useCallback(() => {
    setShowLoginModal(prev => !prev);
  }, []);

  const handleEmailSubmit = useCallback((data) => {
    if (data.type === 'login') {
      // Handle login success
      const { token, user } = data;
      
      // Validate required data
      if (!token) {
        console.error('Missing token in login response');
        showToast('حدث خطأ: لم يتم استلام رمز الدخول. يرجى المحاولة مرة أخرى', 'error');
        return;
      }
      
      if (!user) {
        console.error('Missing user data in login response');
        showToast('حدث خطأ: لم يتم استلام بيانات المستخدم. يرجى المحاولة مرة أخرى', 'error');
        return;
      }
      
      // Save token and user data to localStorage with error handling
      try {
        localStorage.setItem('userToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        if (user.avatar) {
          localStorage.setItem('userAvatar', user.avatar);
          setUserAvatar(user.avatar);
        }
      } catch (error) {
        console.error('Error saving user data to localStorage:', error);
        // Still update state even if localStorage fails (for mobile compatibility)
        // Some mobile browsers may have localStorage disabled
      }
      
      // Update state
      try {
        setUserToken(token);
        setUserData(user);
        setShowLoginModal(false);
      } catch (error) {
        console.error('Error updating state:', error);
        showToast('حدث خطأ في تحديث حالة المستخدم. يرجى إعادة تحميل الصفحة', 'error');
      }
    } else if (data.type === 'signup') {
      // Handle signup success - can show success message or redirect to login
      setShowLoginModal(false);
      showToast('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول', 'success');
    } else {
      // Old behavior for email verification
      // Extract email from data if it's an object, otherwise use data as string
      const emailValue = typeof data === 'string' ? data : (data.email || data.user?.email || '');
      if (emailValue) {
        setUserEmail(emailValue);
        setShowLoginModal(false);
        setShowVerificationPopup(true);
      } else {
        console.error('No email found in data:', data);
        setShowLoginModal(false);
      }
    }
  }, []);

  const handleVerificationClose = useCallback(() => {
    setShowVerificationPopup(false);
  }, []);

  const handleVerification = useCallback(async (code) => {
    // Here you would typically send the code to your backend for verification
    console.log('Verifying code:', code, 'for email:', userEmail);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // For demo purposes, accept any 4-digit code
    if (code.length === 4) {
      setShowVerificationPopup(false);
      setShowAccountDetails(true);
    } else {
      throw new Error('كود التحقق غير صحيح');
    }
  }, [userEmail]);

  const handleResendCode = useCallback(async () => {
    // Here you would typically send a new verification code to the user's email
    console.log('Resending verification code to:', userEmail);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));
    
    showToast('تم إرسال رمز التحقق الجديد', 'success');
  }, [userEmail, showToast]);

  const handleAccountDetailsClose = useCallback(() => {
    setShowAccountDetails(false);
    setUserEmail('');
  }, []);

  const handleAccountDetailsSubmit = useCallback(async (data) => {
    // Submit details to backend
    console.log('Submitting account details', data);
    await new Promise(resolve => setTimeout(resolve, 800));
    setShowAccountDetails(false);
    setUserEmail('');
    // Persist avatar and show it in navbar
    const avatarUrl = 'https://tse1.mm.bing.net/th/id/OIP.srNFFzORAaERcWvhwgPzVAHaHa?pid=Api&P=0&h=220';
    try { localStorage.setItem('userAvatar', avatarUrl); } catch {}
    setUserAvatar(avatarUrl);
    // Navigate to home after successful login
    window.location.href = '/home';
  }, []);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem('userAvatar');
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
    } catch {}
    setUserAvatar(null);
    setUserData(null);
    setUserToken(null);
    setShowUserMenu(false);
    window.location.href = '/home';
  }, []);

  const handleMouseEnter = useCallback((dropdownName) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setOpenDropdown(dropdownName);
  }, [dropdownTimeout]);

  const handleMouseLeave = useCallback(() => {
    const timeout = setTimeout(() => {
      setOpenDropdown(null);
    }, 300); // تأخير 300ms قبل إغلاق القائمة
    setDropdownTimeout(timeout);
  }, []);

  const linkClass = "text-gray-500 text-[13px] font-semibold py-[0.5rem] px-0 transition-colors duration-300 no-underline block whitespace-nowrap hover:text-[#F7EC06]";
  const buttonClass = "bg-none border-none text-gray-500 text-[13px] font-semibold cursor-pointer py-[0.5rem] px-0 transition-colors duration-300 whitespace-nowrap hover:text-[#F7EC06]";

  return (
    <>
    <nav ref={navRef} className="bg-[#141420] py-1.5 fixed top-0 left-0 right-0 z-[1000] h-30 shadow-[(247,236,6,0.15)] w-full mx-auto px-0">
      <div className="max-w-[1000px] mx-auto px-4 flex flex-col gap-1 lg:max-w-[1000px] md:max-w-full md:px-0 sm:max-w-full sm:px-0">
        {/* Mobile/Tablet Layout */}
        <div className="relative flex items-center justify-between w-full md:hidden py-3 px-4 sm:px-6">
          {/* Left side - Empty space with same width as right side */}
          <div className="flex items-center gap-3" style={{ width: '80px' }}>
          </div>

          {/* Center - Logo (absolutely positioned) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <Link to="/home" aria-label="العودة للصفحة الرئيسية" className="inline-block">
              <span className="navbar-logo-wrapper navbar-logo-wrapper--sm">
                <img 
                  src={logoImg}
                  alt="شعار Storage" 
                  className="navbar-logo-image"
                />
              </span>
            </Link>
          </div>

          {/* Right side - Cart icon and Hamburger menu */}
          <div className="flex items-center gap-3" style={{ width: '80px', justifyContent: 'flex-end' }}>
            <div className="relative">
              <PiShoppingBag 
                className="text-white text-xl cursor-pointer hover:text-[#F7EC06] transition-colors duration-300" 
                onClick={() => { window.location.href = '/cart'; }}
              />
              {totalItems > 0 ? (
                <div className="absolute -top-2 -right-2 bg-[#F7EC06] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse z-10">
                  {totalItems}
                </div>
              ) : null}
            </div>
            <button
              id="hamburger-menu-btn"
              className={`flex flex-col gap-[3px] bg-none border-none cursor-pointer p-1 transition-all duration-300 ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span className={`w-[20px] h-[2px] bg-white rounded-sm transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-[6px]' : ''}`}></span>
              <span className={`w-[20px] h-[2px] bg-white rounded-sm transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-[20px] h-[2px] bg-white rounded-sm transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`}></span>
            </button>
          </div>
        </div>

        {/* Tablet Layout */}
        <div className="flex items-center justify-between w-full hidden md:flex lg:hidden py-3 px-6">
          {/* Left side - Empty space */}
          <div className="flex items-center">
          </div>

          {/* Center - Logo and text */}
          <div className="flex flex-col items-center">
            <Link to="/home" aria-label="العودة للصفحة الرئيسية" className="inline-block">
              <span className="navbar-logo-wrapper navbar-logo-wrapper--md">
                <img 
                  src={logoImg}
                  alt="شعار Storage" 
                  className="navbar-logo-image"
                />
              </span>
            </Link>
            <span className="text-white text-sm font-medium text-center">Storage للخدمات الرقمية</span>
          </div>

          {/* Right side - Cart icon and Hamburger menu */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <PiShoppingBag 
                className="text-white text-xl cursor-pointer hover:text-[#F7EC06] transition-colors duration-300" 
                onClick={() => { window.location.href = '/cart'; }}
              />
              {totalItems > 0 ? (
                <div className="absolute -top-2 -right-2 bg-[#F7EC06] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse z-10">
                  {totalItems}
                </div>
              ) : null}
            </div>
            <button
              className={`flex flex-col gap-[4px] bg-none border-none cursor-pointer p-1.5 transition-all duration-300 ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span className={`w-[22px] h-[2.5px] bg-white rounded-sm transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`}></span>
              <span className={`w-[22px] h-[2.5px] bg-white rounded-sm transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-[22px] h-[2.5px] bg-white rounded-sm transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`}></span>
            </button>
          </div>
        </div>
        <div className="w-full hidden lg:flex flex-col items-center gap-1">
            {/* First Row - Navigation Links (First 9 categories) */}
            <div className="w-full flex justify-between items-center pt-1">
              {/* Navigation links on the left */}
              <div className="flex items-center gap-4">
                <ul className="flex items-center gap-5 list-none m-0 p-0 flex-row-reverse">
            {/* Dynamic navigation from API - First 9 items */}
            {!loadingNav && (() => {
              const firstRowItems = navigationData.slice(0, 9);
              return firstRowItems.map((item) => {
                if (item.type === 'page') {
                  return (
                    <li key={item.id} className="relative">
                      <Link to={item.url} className={linkClass}>{item.name}</Link>
                    </li>
                  );
                }
                if (item.type === 'category' && item.subcategories && item.subcategories.length > 0) {
                  return (
                    <li key={item.id} className="relative" onMouseEnter={() => handleMouseEnter(`cat_${item.id}`)} onMouseLeave={handleMouseLeave}>
                      <Link to={item.url} className={linkClass}>
                        <RiArrowDropDownLine className="inline-block ml-1" /> {item.name}
                      </Link>
                      {openDropdown === `cat_${item.id}` && (
                        <div 
                          dir="rtl"
                          className="absolute top-full right-0 mt-2 mr-[-80px] bg-[#141420] rounded-lg shadow-[0_8px_20px_rgba(31,31,44,0.3)] min-w-[560px] p-3 z-50"
                          onMouseEnter={() => handleMouseEnter(`cat_${item.id}`)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="mb-2">
                            <h4 className="text-[#F7EC06] font-bold text-sm mb-3 pb-2 border-b-2 border-[#F7EC06] text-right">{item.name}</h4>
                            <ul className="list-none p-0 m-0 grid grid-cols-2 gap-1">
                              <li className="col-span-2">
                                <Link to={item.url} className="dropdown-menu-item block py-2 px-3 text-white text-sm font-semibold rounded-md transition-all duration-200 hover:bg-[rgba(247,236,6,0.1)] hover:text-[#F7EC06] hover:pr-4 text-right relative">
                                  <span className="dropdown-yellow-bar"></span>
                                  عرض الكل
                                </Link>
                              </li>
                              {item.subcategories.map((subcategory) => (
                                <li key={subcategory.id}>
                                  <Link to={subcategory.url} className="dropdown-menu-item block py-2 px-3 text-white text-sm font-semibold rounded-md transition-all duration-200 hover:bg-[rgba(247,236,6,0.1)] hover:text-[#F7EC06] hover:pr-4 text-right relative">
                                    <span className="dropdown-yellow-bar"></span>
                                    {subcategory.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                }
                if (item.type === 'category') {
                  return (
                    <li key={item.id} className="relative">
                      <Link to={item.url} className={linkClass}>{item.name}</Link>
                    </li>
                  );
                }
                return null;
              });
            })()}
     
              </ul>
              </div>
              
              {/* Logo on the right */}
              <Link to="/" aria-label="العودة للصفحة الرئيسية" className="inline-block relative z-[60] flex-shrink-0 logo-right-spacing">
                <span className="navbar-logo-wrapper navbar-logo-wrapper--lg">
                  <img 
                    src={logoImg}
                    alt="شعار Storage" 
                    className="navbar-logo-image"
                  />
                </span>
              </Link>

            </div>

            {/* Second Row - New Categories (after 9th item) */}
            {!loadingNav && navigationData.length > 9 && (
              <div className="w-full flex justify-between items-center pt-1">
                <div className="flex items-center gap-4">
                  <ul className="flex items-center gap-5 list-none m-0 p-0 flex-row-reverse">
                    {navigationData.slice(9).map((item) => {
                      if (item.type === 'page') {
                        return (
                          <li key={item.id} className="relative">
                            <Link to={item.url} className={linkClass}>{item.name}</Link>
                          </li>
                        );
                      }
                      if (item.type === 'category' && item.subcategories && item.subcategories.length > 0) {
                        return (
                          <li key={item.id} className="relative" onMouseEnter={() => handleMouseEnter(`cat_${item.id}`)} onMouseLeave={handleMouseLeave}>
                            <Link to={item.url} className={linkClass}>
                              <RiArrowDropDownLine className="inline-block ml-1" /> {item.name}
                            </Link>
                            {openDropdown === `cat_${item.id}` && (
                              <div 
                                dir="rtl"
                                className="absolute top-full right-0 mt-2 mr-[-80px] bg-[#141420] rounded-lg shadow-[0_8px_20px_rgba(31,31,44,0.3)] min-w-[560px] p-3 z-50"
                                onMouseEnter={() => handleMouseEnter(`cat_${item.id}`)}
                                onMouseLeave={handleMouseLeave}
                              >
                                <div className="mb-2">
                                  <h4 className="text-[#F7EC06] font-bold text-sm mb-3 pb-2 border-b-2 border-[#F7EC06] text-right">{item.name}</h4>
                                  <ul className="list-none p-0 m-0 grid grid-cols-2 gap-1">
                                    <li className="col-span-2">
                                      <Link to={item.url} className="dropdown-menu-item block py-2 px-3 text-white text-sm font-semibold rounded-md transition-all duration-200 hover:bg-[rgba(247,236,6,0.1)] hover:text-[#F7EC06] hover:pr-4 text-right relative">
                                        <span className="dropdown-yellow-bar"></span>
                                        عرض الكل
                                      </Link>
                                    </li>
                                    {item.subcategories.map((subcategory) => (
                                      <li key={subcategory.id}>
                                        <Link to={subcategory.url} className="dropdown-menu-item block py-2 px-3 text-white text-sm font-semibold rounded-md transition-all duration-200 hover:bg-[rgba(247,236,6,0.1)] hover:text-[#F7EC06] hover:pr-4 text-right relative">
                                          <span className="dropdown-yellow-bar"></span>
                                          {subcategory.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </li>
                        );
                      }
                      if (item.type === 'category') {
                        return (
                          <li key={item.id} className="relative">
                            <Link to={item.url} className={linkClass}>{item.name}</Link>
                          </li>
                        );
                      }
                      return null;
                    })}
                  </ul>
                </div>
                {/* Empty space to align with logo above */}
                <div style={{ width: '66px' }}></div>
              </div>
            )}

            {/* Second Row - Icons */}
            <div className="w-full flex justify-center items-center pb-1">
              <div className="flex items-center gap-6 flex-row-reverse">
                <CiSearch 
                  id="navbar-search-icon"
                  className="text-gray-500 text-xl cursor-pointer hover:text-[#F7EC06] transition-colors duration-300" 
                  onClick={toggleSearchBar}
                />
                <div className="relative" ref={userMenuRef}>
                  {userData || userAvatar ? (
                    <div 
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => setShowUserMenu((v) => !v)}
                    >
                      {userAvatar ? (
                        <img
                          id="navbar-account-icon"
                          src={userAvatar}
                          alt="User"
                          className="w-6 h-6 rounded-full object-cover border border-gray-600"
                        />
                      ) : (
                        <IoPersonOutline className="text-gray-500 text-xl" />
                      )}
                      {userData && (
                        <span className="text-white text-sm font-semibold">
                          {userData.name}
                        </span>
                      )}
                    </div>
                  ) : (
                    <IoPersonOutline 
                      id="navbar-account-icon"
                      className="text-gray-500 text-xl cursor-pointer hover:text-[#F7EC06] transition-colors duration-300" 
                      onClick={toggleLoginModal}
                    />
                  )}

                  {showUserMenu && (
                    <div dir="rtl" className="absolute right-0 mt-3 w-60 bg-[#141420] border border-[rgba(247,236,6,0.2)] rounded-xl shadow-[0_8px_20px_rgba(31,31,44,0.3)] overflow-hidden z-[2000] text-right">
                      <Link 
                        to="/notifications" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#ABB3BA] hover:bg-[rgba(247,236,6,0.08)]"
                      >
                        <MdNotificationsActive className="text-[#ABB3BA]" /><span>الإشعارات</span>
                      </Link>
                      <Link 
                        to="/orders" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#ABB3BA] hover:bg-[rgba(247,236,6,0.08)]"
                      >
                        <FaShoppingBag className="text-[#ABB3BA]" /><span>الطلبات</span>
                      </Link>
                      <Link 
                        to="/pending-payments" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#ABB3BA] hover:bg-[rgba(247,236,6,0.08)]"
                      >
                        <GiShoppingCart className="text-[#ABB3BA]" /><span>طلبات بانتظار الدفع</span>
                      </Link>
                      <Link 
                        to="/wishlist" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#ABB3BA] hover:bg-[rgba(247,236,6,0.08)]"
                      >
                        <CiStar className="text-[#ABB3BA]" /><span>الأمنيات</span>
                      </Link>
                      <Link 
                        to="/account" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#ABB3BA] hover:bg-[rgba(247,236,6,0.08)]"
                      >
                        <CgProfile className="text-[#ABB3BA]" /><span>حسابي</span>
                      </Link>
                      {userData || userToken ? (
                        <button 
                          onClick={() => {
                            setShowUserMenu(false);
                            handleLogout();
                          }} 
                          className="w-full flex items-center gap-2 justify-end px-4 py-2 text-sm text-[#ABB3BA] hover:bg-[rgba(247,236,6,0.08)]"
                        >
                          <MdOutlineLogout /><span>تسجيل خروج</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            setShowUserMenu(false);
                            toggleLoginModal();
                          }} 
                          className="w-full flex items-center gap-2 justify-end px-4 py-2 text-sm text-[#ABB3BA] hover:bg-[rgba(247,236,6,0.08)]"
                        >
                          <CgProfile /><span>تسجيل دخول</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="relative group flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span style={{ marginRight: '4px' }}>{currency.symbol}</span>
                    <span className="text-white text-sm font-semibold">
                      {totalPrice > 0 ? formatPrice(totalPrice).value : '0.00'}
                    </span>
                    {currency.code !== 'SAR' && (
                      <span style={{ fontSize: '0.7em', marginRight: '4px', color: '#ABB3BA' }}>({currency.code})</span>
                    )}
                  </div>
                  <PiShoppingBag 
                    className="text-gray-500 text-xl cursor-pointer hover:text-[#F7EC06] transition-colors duration-300" 
                    onClick={() => { window.location.href = '/cart'; }}
                  />
                  {totalItems > 0 && (
                    <div className="absolute -top-2 -right-2 bg-[#F7EC06] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {totalItems}
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>

        {/* Search Modal */}
        {showSearchBar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-start justify-center pt-20 md:pt-32">
            <div className="relative w-full max-w-2xl mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ادخل كلمة البحث"
                  className="w-full bg-white text-gray-800 px-4 py-3 pr-12 md:px-6 md:py-4 md:pr-16 rounded-xl border border-gray-200 focus:outline-none focus:border-[#F7EC06] focus:ring-2 focus:ring-[#F7EC06] focus:ring-opacity-20 text-base md:text-lg shadow-lg"
                  dir="rtl"
                  autoFocus
                />
                <CiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl md:text-2xl" />
                <button
                  onClick={toggleSearchBar}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl md:text-2xl hover:text-gray-600 transition-colors duration-200"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <LoginModal 
            // Keep a stable key (or no key) so that internal state like "isSignUp"
            // is not reset on every re-render
            key="navbar-login-modal"
            onClose={toggleLoginModal}
            onSubmit={handleEmailSubmit}
          />
        )}

        {/* Verification Code Popup */}
        <VerificationCodePopup
          isOpen={showVerificationPopup}
          onClose={handleVerificationClose}
          email={userEmail}
          onVerify={handleVerification}
          onResend={handleResendCode}
        />

        {/* Account Details Popup */}
        <AccountDetailsPopup
          isOpen={showAccountDetails}
          onClose={handleAccountDetailsClose}
          onSubmit={handleAccountDetailsSubmit}
          email={userEmail}
        />

      </div>

        {/* Mobile Menu */}
        <div dir="rtl" className={`md:hidden overflow-hidden transition-all duration-500 bg-[#141420] ${isMenuOpen ? 'max-h-[1000px] py-4' : 'max-h-0'}`}>
          <ul className="list-none p-0 m-0 w-full px-4 sm:px-6 text-right">
            {/* Dynamic navigation from API */}
            {!loadingNav && navigationData.map((item) => {
              if (item.type === 'page') {
                return (
                  <li key={item.id} className="border-b border-[rgba(247,236,6,0.1)]">
                    <Link to={item.url} className="dropdown-menu-item block py-3 px-3 text-white text-sm no-underline font-semibold transition-all duration-300 hover:text-[#F7EC06] hover:bg-[rgba(247,236,6,0.1)] hover:pr-6 rounded-md relative" onClick={closeMenu}>
                      <span className="dropdown-yellow-bar"></span>
                      {item.name}
                    </Link>
                  </li>
                );
              }
              if (item.type === 'category' && item.subcategories && item.subcategories.length > 0) {
                return (
                  <li key={item.id} className="border-b border-[rgba(247,236,6,0.1)]">
                    <button 
                      className="w-full flex items-center justify-between py-3 px-3 text-white text-sm font-semibold transition-all duration-300 hover:text-[#F7EC06] hover:bg-[rgba(247,236,6,0.1)] rounded-md bg-transparent border-none cursor-pointer text-right"
                      onClick={() => toggleMobileDropdown(`cat_${item.id}`)}
                    >
                      <RiArrowDropDownLine className={`text-xl transition-transform duration-300 ${mobileDropdown === `cat_${item.id}` ? 'rotate-180' : ''}`} />
                      <span>{item.name}</span>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${mobileDropdown === `cat_${item.id}` ? 'max-h-[500px]' : 'max-h-0'}`}>
                      <ul className="list-none p-0 m-0 bg-[rgba(255,107,53,0.05)] rounded-md mr-4 mb-2">
                        <li>
                          <Link to={item.url} className="dropdown-menu-item block py-2 px-4 text-gray-300 text-xs no-underline font-semibold transition-all duration-300 hover:text-[#F7EC06] hover:bg-[rgba(247,236,6,0.1)] hover:pr-6 relative" onClick={closeMenu}>
                            <span className="dropdown-yellow-bar"></span>
                            عرض الكل
                          </Link>
                        </li>
                        {item.subcategories.map((subcategory) => (
                          <li key={subcategory.id}>
                            <Link to={subcategory.url} className="dropdown-menu-item block py-2 px-4 text-gray-300 text-xs no-underline font-semibold transition-all duration-300 hover:text-[#F7EC06] hover:bg-[rgba(247,236,6,0.1)] hover:pr-6 relative" onClick={closeMenu}>
                              <span className="dropdown-yellow-bar"></span>
                              {subcategory.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              }
              if (item.type === 'category') {
                return (
                  <li key={item.id} className="border-b border-[rgba(247,236,6,0.1)]">
                    <Link to={item.url} className="dropdown-menu-item block py-3 px-3 text-white text-sm no-underline font-semibold transition-all duration-300 hover:text-[#F7EC06] hover:bg-[rgba(247,236,6,0.1)] hover:pr-6 rounded-md relative" onClick={closeMenu}>
                      <span className="dropdown-yellow-bar"></span>
                      {item.name}
                    </Link>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>

        {/* Tablet Menu */}
        <div dir="rtl" className={`hidden md:block lg:hidden overflow-hidden transition-all duration-500 bg-[#141420] ${isMenuOpen ? 'max-h-[1000px] py-4' : 'max-h-0'}`}>
          <ul className="list-none p-0 m-0 w-full px-4 sm:px-6 text-right">
            {/* Dynamic navigation from API */}
            {!loadingNav && navigationData.map((item) => {
              if (item.type === 'page') {
                return (
                  <li key={item.id} className="border-b border-[rgba(247,236,6,0.1)]">
                    <Link to={item.url} className="dropdown-menu-item block py-3 px-3 text-white text-sm no-underline font-semibold transition-all duration-300 hover:text-[#F7EC06] hover:bg-[rgba(247,236,6,0.1)] hover:pr-6 rounded-md relative" onClick={closeMenu}>
                      <span className="dropdown-yellow-bar"></span>
                      {item.name}
                    </Link>
                  </li>
                );
              }
              if (item.type === 'category' && item.subcategories && item.subcategories.length > 0) {
                return (
                  <li key={item.id} className="border-b border-[rgba(247,236,6,0.1)]">
                    <button 
                      className="w-full flex items-center justify-between py-3 px-3 text-white text-sm font-semibold transition-all duration-300 hover:text-[#F7EC06] hover:bg-[rgba(247,236,6,0.1)] rounded-md bg-transparent border-none cursor-pointer text-right"
                      onClick={() => toggleMobileDropdown(`cat_${item.id}`)}
                    >
                      <RiArrowDropDownLine className={`text-xl transition-transform duration-300 ${mobileDropdown === `cat_${item.id}` ? 'rotate-180' : ''}`} />
                      <span>{item.name}</span>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${mobileDropdown === `cat_${item.id}` ? 'max-h-[500px]' : 'max-h-0'}`}>
                      <ul className="list-none p-0 m-0 bg-[rgba(255,107,53,0.05)] rounded-md mr-4 mb-2">
                        <li>
                          <Link to={item.url} className="dropdown-menu-item block py-2 px-4 text-gray-300 text-xs no-underline font-semibold transition-all duration-300 hover:text-[#F7EC06] hover:bg-[rgba(247,236,6,0.1)] hover:pr-6 relative" onClick={closeMenu}>
                            <span className="dropdown-yellow-bar"></span>
                            عرض الكل
                          </Link>
                        </li>
                        {item.subcategories.map((subcategory) => (
                          <li key={subcategory.id}>
                            <Link to={subcategory.url} className="dropdown-menu-item block py-2 px-4 text-gray-300 text-xs no-underline font-semibold transition-all duration-300 hover:text-[#F7EC06] hover:bg-[rgba(247,236,6,0.1)] hover:pr-6 relative" onClick={closeMenu}>
                              <span className="dropdown-yellow-bar"></span>
                              {subcategory.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              }
              if (item.type === 'category') {
                return (
                  <li key={item.id} className="border-b border-[rgba(247,236,6,0.1)]">
                    <Link to={item.url} className="dropdown-menu-item block py-3 px-3 text-white text-sm no-underline font-semibold transition-all duration-300 hover:text-[#F7EC06] hover:bg-[rgba(247,236,6,0.1)] hover:pr-6 rounded-md relative" onClick={closeMenu}>
                      <span className="dropdown-yellow-bar"></span>
                      {item.name}
                    </Link>
                  </li>
                );
              }
              return null;
            })}
        </ul>
      </div>
    </nav>
    {/* Spacer to prevent content from being hidden behind fixed navbar */}
    <div className="h-[64px] md:h-[96px]"></div>
    </>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
