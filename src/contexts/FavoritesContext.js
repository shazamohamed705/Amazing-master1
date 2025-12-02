import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

const FavoritesContext = createContext(null);

const API_BASE_URL = 'https://storage-te.com/backend/api/v1';

export const FavoritesProvider = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const raw = localStorage.getItem('favoritePackageIds');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [favSyncDisabled, setFavSyncDisabled] = useState(() => {
    try { return localStorage.getItem('favSyncDisabled') === '1'; } catch { return false; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('favoritePackageIds', JSON.stringify(Array.from(favoriteIds)));
    } catch {}
  }, [favoriteIds]);

  useEffect(() => {
    try { localStorage.setItem('favSyncDisabled', favSyncDisabled ? '1' : '0'); } catch {}
  }, [favSyncDisabled]);

  const isFav = (id) => favoriteIds.has(id);

  const toggleFavorite = async (id, type = 'package') => {
    const token = (() => { try { return localStorage.getItem('userToken'); } catch { return null; } })();
    if (!id) return;
    
    // إذا لم يكن المستخدم مسجل دخول، نحفظ محلياً فقط
    if (!token) {
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
      return;
    }
    
    if (favSyncDisabled) {
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
      return;
    }
    const wasFav = favoriteIds.has(id);
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      // استخدام PATCH method مع item_id و type
      const response = await fetch(`${API_BASE_URL}/fav`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ 
          item_id: id,
          type: type // 'package' or 'service'
        })
      });
      
      if (response && (response.status === 404 || response.status === 405)) {
        setFavSyncDisabled(true);
      }
      if (response && !response.ok && (response.status === 401 || response.status === 403)) {
        // إرجاع الحالة السابقة في حالة الخطأ
        setFavoriteIds(prev => {
          const next = new Set(prev);
          if (wasFav) next.add(id); else next.delete(id);
          return next;
        });
      }
    } catch {
      // keep optimistic - الحالة المحلية تبقى كما هي
    }
  };

  const value = useMemo(() => ({
    isFav,
    isFavorite: isFav, // Alias for better naming
    toggleFavorite,
    favoriteIds
  }), [favoriteIds]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};


