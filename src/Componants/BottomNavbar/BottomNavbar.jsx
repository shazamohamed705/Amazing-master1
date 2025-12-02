import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineAppstoreAdd } from "react-icons/ai";
import { IoPersonOutline } from "react-icons/io5";
import { PiShoppingBag } from "react-icons/pi";
import { CiSearch } from "react-icons/ci";
import { IoHomeOutline } from "react-icons/io5";
import { MdNotificationsActive, MdOutlineLogout } from "react-icons/md";
import { FaShoppingBag } from "react-icons/fa";
import { GiShoppingCart } from "react-icons/gi";
import { CiStar } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import LoginModal from '../LoginModal/LoginModal';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import './BottomNavbar.css';

const API_BASE_URL = 'https://storage-te.com/backend/api/v1';

const BottomNavbar = () => {
  const { showToast } = useToast();
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userAvatar, setUserAvatar] = useState(() => {
    try { return localStorage.getItem('userAvatar') || null; } catch { return null; }
  });
  const [userData, setUserData] = useState(() => {
    try {
      const stored = localStorage.getItem('userData');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [userToken, setUserToken] = useState(() => {
    try { return localStorage.getItem('userToken') || null; } catch { return null; }
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const isLoggedIn = Boolean(userData || userToken);
  const { totalItems } = useCart();

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

  const verifyToken = useCallback(async (token) => {
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success && data?.data?.user) {
        return data.data.user;
      }

      throw new Error(data?.message || 'فشل التحقق من هوية المستخدم');
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }, []);

  // Open menu function for categories
  const handleCategoriesClick = (e) => {
    e.preventDefault();
    // Trigger hamburger menu click using ID
    const hamburgerBtn = document.getElementById('hamburger-menu-btn');
    if (hamburgerBtn && typeof hamburgerBtn.click === 'function') {
      hamburgerBtn.click();
    }
  };

  // Open login modal function
  const handleAccountClick = (e) => {
    e.preventDefault();
    // Prefer triggering existing web behavior if available
    const accountIcon = document.getElementById('navbar-account-icon');
    if (accountIcon && typeof accountIcon.click === 'function') {
      if (!userToken) {
        accountIcon.click();
      } else {
        setShowUserMenu((v) => !v);
      }
      return;
    }
    if (!userToken) {
      setShowLoginModal(true);
    } else {
      setShowUserMenu((v) => !v);
    }
  };

  const handleAuthSubmit = useCallback(async (payload) => {
    if (!payload) {
      return;
    }

    if (payload.type === 'signup') {
      setShowLoginModal(false);
      showToast('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول', 'success');
      return;
    }

    if (payload.type !== 'login') {
      setShowLoginModal(false);
      return;
    }

    const token = payload.token;

    if (!token) {
      showToast('حدث خطأ: لم يتم استلام رمز الدخول. يرجى المحاولة مرة أخرى', 'error');
      return;
    }

    const verifiedUser = await verifyToken(token);

    if (!verifiedUser) {
      try {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userAvatar');
      } catch {}
      showToast('تعذر التحقق من هوية المستخدم. يرجى المحاولة مرة أخرى', 'error');
      setShowLoginModal(true);
      return;
    }

    const finalAvatar = verifiedUser.avatar || payload.user?.avatar || null;

    try {
      localStorage.setItem('userToken', token);
      localStorage.setItem('userData', JSON.stringify(verifiedUser));
      if (finalAvatar) {
        localStorage.setItem('userAvatar', finalAvatar);
      } else {
        localStorage.removeItem('userAvatar');
      }
    } catch (storageError) {
      console.error('Error saving auth data to localStorage:', storageError);
    }

    setUserToken(token);
    setUserData(verifiedUser);
    setUserAvatar(finalAvatar);
    setShowLoginModal(false);
    setShowUserMenu(true);
  }, [verifyToken]);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem('userAvatar');
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
    } catch {}
    setUserAvatar(null);
    setUserToken(null);
    setUserData(null);
    setShowUserMenu(false);
    window.location.hash = '#/home';
  }, []);

  // Open search bar function
  const handleSearchClick = (e) => {
    e.preventDefault();
    setShowSearchBar(true);
  };

  // Close search bar function
  const toggleSearchBar = () => {
    setShowSearchBar(false);
  };

  const accountButton = (
    <div key="account" className="bottom-navbar__item relative" ref={userMenuRef}>
      <button onClick={handleAccountClick} className="w-full h-full flex flex-col items-center justify-center">
        {userAvatar ? (
          <img src={userAvatar} alt="User" className="bottom-navbar__icon rounded-full object-cover" />
        ) : (
          <IoPersonOutline className="bottom-navbar__icon" />
        )}
        <span className="bottom-navbar__label">حسابي</span>
      </button>

      {showUserMenu && (
        <div dir="rtl" className="absolute bottom-12 right-0 w-60 bg-[#141420] border border-[rgba(247,236,6,0.2)] rounded-xl shadow-[0_8px_20px_rgba(31,31,44,0.3)] overflow-hidden z-[2000] text-right">
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
          {(userData || userToken) ? (
            <button 
              onClick={() => {
                setShowUserMenu(false);
                handleLogout();
              }} 
              className="w-full flex items-center gap-2 justify-start px-4 py-2 text-sm text-[#ABB3BA] hover:bg-[rgba(247,236,6,0.08)]"
            >
              <MdOutlineLogout /><span>تسجيل خروج</span>
            </button>
          ) : (
            <button 
              onClick={() => {
                setShowUserMenu(false);
                setShowLoginModal(true);
              }} 
              className="w-full flex items-center gap-2 justify-start px-4 py-2 text-sm text-[#ABB3BA] hover:bg-[rgba(247,236,6,0.08)]"
            >
              <CgProfile /><span>تسجيل دخول</span>
            </button>
          )}
        </div>
      )}
    </div>
  );

  const cartLink = (
    <Link key="cart" to="/cart" className="bottom-navbar__item">
      <div className="bottom-navbar__cart-wrapper">
        <PiShoppingBag className="bottom-navbar__icon" />
        {totalItems > 0 && (
          <span className="bottom-navbar__cart-badge">{totalItems}</span>
        )}
      </div>
      <span className="bottom-navbar__label">السلة</span>
    </Link>
  );

  const categoriesButton = (
    <button key="categories" onClick={handleCategoriesClick} className="bottom-navbar__item bottom-navbar__item--active">
      <AiOutlineAppstoreAdd className="bottom-navbar__icon" />
      <span className="bottom-navbar__label">التصنيفات</span>
    </button>
  );

  const searchButton = (
    <button key="search" onClick={handleSearchClick} className="bottom-navbar__item">
      <CiSearch className="bottom-navbar__icon" />
      <span className="bottom-navbar__label">بحث</span>
    </button>
  );

  const homeLink = (
    <Link key="home" to="/home" className="bottom-navbar__item">
      <IoHomeOutline className="bottom-navbar__icon" />
      <span className="bottom-navbar__label">الرئيسية</span>
    </Link>
  );

  const navItems = isLoggedIn
    ? [searchButton, cartLink, categoriesButton, accountButton, homeLink]
    : [accountButton, cartLink, categoriesButton, searchButton, homeLink];


  return (
    <nav className="bottom-navbar">
      <div className="bottom-navbar__container">
        {navItems}
      </div>

      {/* Search Modal */}
      {showSearchBar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
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
          onClose={() => setShowLoginModal(false)}
          onSubmit={handleAuthSubmit}
        />
      )}
    </nav>
  );
};

export default BottomNavbar;
