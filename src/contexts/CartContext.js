import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Cart Context
const CartContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://storage-te.com/backend/api/v1';

// Helpers
const buildHeaders = (token) => {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const parseResponseSafely = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const extractErrorMessage = (data, fallbackMessage) => {
  if (!data || typeof data !== 'object') {
    return fallbackMessage;
  }
  if (data.errors) {
    return Object.values(data.errors).flat().join('\n') || fallbackMessage;
  }
  return data.message || fallbackMessage;
};

const sanitizeCartItems = (items = []) =>
  items
    .filter((item) => item && (item.id ?? item.package_id ?? item.packageId))
    .map((item) => {
      const id = item.id ?? item.package_id ?? item.packageId;
      return {
        id,
        cartItemId: item.cartItemId ?? item.id ?? id,
        name: item.name ?? item.title ?? 'منتج',
        price: toNumber(item.price, 0),
        quantity: toNumber(item.quantity, 1) || 1,
        username: item.username ?? null,
        image: item.image ?? '',
        price_per_1000: item.price_per_1000 ?? null,
        is_username: item.is_username ?? false,
        followers_count: item.followers_count ?? null,
        type: item.type ?? 'service',
      };
    });

const summarizeCart = (items = []) => {
  // totalItems should be the count of unique items in cart, not sum of quantities
  const totalItems = items.length;
  const totalPrice = items.reduce((sum, item) => {
    // Check if item is a package (not a service)
    const isPackage = item.type === 'package';
    
    // Calculate price dynamically for services with username
    if (item.is_username && item.price_per_1000 && item.quantity > 0 && !isPackage) {
      // For username services: price is calculated based on quantity
      let itemPrice = (item.quantity / 1000) * parseFloat(item.price_per_1000);
      if (itemPrice < 50) {
        itemPrice = 50; // Minimum price
      }
      return sum + itemPrice; // Don't multiply by quantity again, price already includes quantity
    } else if (isPackage) {
      // For packages: use fixed price (quantity is followers_count, not actual quantity)
      return sum + (item.price || 0);
    } else {
      // For regular items: price * quantity
      return sum + ((item.price || 0) * (item.quantity || 0));
    }
  }, 0);
  return { items, totalItems, totalPrice };
};

const cloneCartState = (state) => summarizeCart(sanitizeCartItems(state.items));

const EMPTY_CART_STATE = Object.freeze({
  items: [],
  totalItems: 0,
  totalPrice: 0,
});

const LOCAL_CART_KEY = 'storage_guest_cart';

const loadCartFromLocalStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return EMPTY_CART_STATE;
  }
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    if (!raw) {
      return EMPTY_CART_STATE;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) {
      return EMPTY_CART_STATE;
    }
    return summarizeCart(sanitizeCartItems(parsed.items));
  } catch {
    return EMPTY_CART_STATE;
  }
};

const persistCartToLocalStorage = (state) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    localStorage.setItem(
      LOCAL_CART_KEY,
      JSON.stringify({
        items: sanitizeCartItems(state.items),
      })
    );
  } catch {
    // ignore storage errors
  }
};

const clearLocalCartStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    localStorage.removeItem(LOCAL_CART_KEY);
  } catch {
    // ignore
  }
};

const shouldUseGuestCart = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return true;
  }
  const token = localStorage.getItem('userToken');
  return !token;
};

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const pickFirstArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && Array.isArray(payload.items)) {
    return payload.items;
  }
  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }
  if (payload && typeof payload === 'object') {
    return [payload];
  }
  return [];
};

const normalizeCartFromApi = (payload) => {
  const rawItems = pickFirstArray(payload);
  const items = rawItems.map((cartItem) => {
    // Handle new API structure where data is nested in 'item' object
    const item = cartItem.item ?? cartItem;
    const cartItemId = cartItem.id ?? cartItem.cart_item_id ?? cartItem.cartId;
    const packageId = item.id ?? cartItem.item_id ?? cartItem.package_id ?? cartItem.packageId ?? cartItemId;
    const price = toNumber(item.price ?? cartItem.price ?? item.package?.price);
    const quantity = toNumber(cartItem.quantity, 1) || 1;
    const username = cartItem.username ?? null;
    const price_per_1000 = toNumber(item.price_per_1000 ?? cartItem.price_per_1000 ?? null);
    const is_username = item.is_username ?? cartItem.is_username ?? false;
    const followers_count = toNumber(item.followers_count ?? cartItem.followers_count ?? null);

    // Determine item type from item_type or infer from structure
    // item_type from API is full class name like "App\Models\Follower\FollowerPackage" or "App\Models\Content\Service"
    let itemType = 'service'; // default
    if (cartItem.item_type) {
      if (cartItem.item_type.includes('FollowerPackage') || cartItem.item_type.includes('Package')) {
        itemType = 'package';
      } else if (cartItem.item_type.includes('Service')) {
        itemType = 'service';
      }
    } else if (item.package) {
      itemType = 'package';
    }
    
    return {
      id: packageId,
      cartItemId,
      name: item.name ?? item.title ?? cartItem.name ?? item.package?.name ?? 'منتج',
      price,
      quantity,
      username,
      image: item.image ?? cartItem.image ?? item.package?.image ?? '',
      price_per_1000: price_per_1000 || null,
      is_username: is_username,
      followers_count: followers_count || null,
      type: itemType,
    };
  });

  // Always return cart state, even if empty
  // totalItems should be the count of unique items in cart, not sum of quantities
  const totalItems = items.length;
  const totalPrice = items.reduce((sum, item) => {
    // Check if item is a package (not a service)
    const isPackage = item.type === 'package';
    
    // Calculate price dynamically for services with username
    if (item.is_username && item.price_per_1000 && item.quantity > 0 && !isPackage) {
      // For username services: price is calculated based on quantity
      let itemPrice = (item.quantity / 1000) * parseFloat(item.price_per_1000);
      if (itemPrice < 50) {
        itemPrice = 50; // Minimum price
      }
      return sum + itemPrice; // Don't multiply by quantity again, price already includes quantity
    } else if (isPackage) {
      // For packages: use fixed price (quantity is followers_count, not actual quantity)
      return sum + (item.price || 0);
    } else {
      // For regular items: price * quantity
      return sum + ((item.price || 0) * (item.quantity || 0));
    }
  }, 0);

  return { items, totalItems, totalPrice };
};

// Cart Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      let updatedItems;
      if (existingItem) {
        updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedItems = [...state.items, { ...action.payload, quantity: 1 }];
      }
      // Always recalculate totals from items to ensure consistency
      const newState = summarizeCart(updatedItems);
      console.log('[Cart] ADD_TO_CART -> totalItems:', newState.totalItems, 'items count:', newState.items.length);
      return newState;
    
    case 'REMOVE_FROM_CART':
      const productIdToRemove = typeof action.payload === 'object'
        ? action.payload.productId
        : action.payload;
      const filteredItems = state.items.filter(item => item.id !== productIdToRemove);
      // Always recalculate totals from items to ensure consistency
      return summarizeCart(filteredItems);
    
    case 'UPDATE_QUANTITY':
      const itemToUpdate = state.items.find(item => item.id === action.payload.id);
      if (itemToUpdate) {
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { 
                ...item, 
                quantity: action.payload.quantity,
                username: action.payload.username !== undefined ? action.payload.username : item.username
              }
            : item
        );
        // Always recalculate totals from items to ensure consistency
        return summarizeCart(updatedItems);
      }
      return state;
    
    case 'CLEAR_CART':
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
    
    case 'SET_CART':
      // Always recalculate totals from items to ensure consistency
      const sanitizedItems = sanitizeCartItems(action.payload.items || []);
      const setCartState = summarizeCart(sanitizedItems);
      console.log('[Cart] SET_CART -> totalItems:', setCartState.totalItems, 'items count:', setCartState.items.length);
      return setCartState;
    
    default:
      return state;
  }
};

// Cart Provider
export const CartProvider = ({ children }) => {
  const [cartState, dispatch] = useReducer(
    cartReducer,
    undefined,
    () => loadCartFromLocalStorage()
  );

  const API_BASE_URL = 'https://storage-te.com/backend/api/v1';

  const addToCart = async (product) => {
    // Validate product
    if (!product || typeof product !== 'object') {
      throw new Error('المنتج غير صالح');
    }

    const packageId = product.package_id ?? product.packageId ?? product.id;
    if (!packageId) {
      throw new Error('معرّف الباقة غير موجود');
    }

    // Prepare normalized product
    const normalizedProduct = {
      ...product,
      id: packageId,
      quantity: toNumber(product.quantity, 1) || 1,
      price: parseFloat(product.price) || 0
    };

    // Check if product already exists in cart
    // For username services: check if same service with same username exists
    // For regular items: check if same item exists
    const existingItem = cartState.items.find(item => {
      if (item.id !== packageId) return false;
      
      // If service requires username, check username too
      if (normalizedProduct.is_username) {
        const itemUsername = item.username || '';
        const productUsername = normalizedProduct.username || '';
        // If both have usernames and they're different, it's a different item
        if (itemUsername && productUsername && itemUsername !== productUsername) {
          return false; // Different username = different item
        }
        // If one has username and the other doesn't, they're different
        if ((itemUsername && !productUsername) || (!itemUsername && productUsername)) {
          return false;
        }
        // Same username (or both empty) = same item
        return true;
      }
      
      // For non-username items, same ID = same item
      return true;
    });
    
    if (existingItem) {
      // Product already in cart - throw error to show toast
      throw new Error('هذا المنتج موجود بالفعل في السلة');
    }

    // Update local state immediately (optimistic update) - this makes the counter update instantly
    dispatch({ type: 'ADD_TO_CART', payload: normalizedProduct });

    // Try to sync with API in the background
    try {
      const token = localStorage.getItem('userToken');
      const itemType = product.type === 'service' ? 'service' : 'package';
      
      const requestBody = {
        item_id: packageId,
        type: itemType,
        quantity: normalizedProduct.quantity
      };
      
      // Add username if provided
      if (normalizedProduct.username) {
        requestBody.username = normalizedProduct.username;
      }
      
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: buildHeaders(token),
        body: JSON.stringify(requestBody),
      });

      const data = await parseResponseSafely(response);

      if (response.ok) {
        // API call successful - local state already updated optimistically
        // Don't overwrite local state with API response to avoid resetting the counter
        // The optimistic update is sufficient for immediate UI feedback
        console.log('[Cart] Item added successfully to API, keeping optimistic local state');
      } else if (response.status === 409) {
        // Item already exists - local state already updated, just log
        console.log('[Cart] Item already in cart (409)');
      } else {
        // API error - local state already updated, just log
        console.warn('[Cart] API error but local state updated:', extractErrorMessage(data, ''));
      }
    } catch (error) {
      // Network error - local state already updated, just log
      console.warn('[Cart] Network error but local state updated:', error.message);
    }

    return { success: true };
  };

  const removeFromCart = async (target) => {
    const productId = typeof target === 'object' ? target.productId : target;
    const backendId = typeof target === 'object' ? (target.cartItemId ?? target.productId) : target;

    const existingItem = cartState.items.find((item) => item.id === productId);
    if (!existingItem) {
      return { success: false, message: 'العنصر غير موجود في السلة' };
    }

    const previousState = cloneCartState(cartState);
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId } });

    const token = localStorage.getItem('userToken');
    if (!token) {
      return { success: true };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/${backendId}`, {
        method: 'DELETE',
        headers: buildHeaders(token),
      });
      if (!response.ok) {
        const data = await parseResponseSafely(response);
        if (response.status === 404) {
          return { success: true };
        }
        throw new Error(extractErrorMessage(data, 'حدث خطأ أثناء حذف المنتج من السلة'));
      }
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      dispatch({ type: 'SET_CART', payload: previousState });
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity, username = null) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity, username } });
    
    // Sync with API if user is logged in
    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        const cartItem = cartState.items.find(item => item.id === productId);
        if (cartItem && cartItem.cartItemId) {
          const updateData = { absolute_quantity: quantity };
          if (username !== null) {
            updateData.username = username;
          }
          await fetch(`${API_BASE_URL}/cart/${cartItem.cartItemId}`, {
            method: 'PUT',
            headers: buildHeaders(token),
            body: JSON.stringify(updateData),
          });
        }
      } catch (error) {
        console.warn('[Cart] Error syncing quantity update:', error);
      }
    }
  };

  const clearCart = async () => {
    const previousState = cloneCartState(cartState);
    dispatch({ type: 'CLEAR_CART' });

    const token = localStorage.getItem('userToken');
    if (!token) {
      return { success: true };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/delete-all`, {
        method: 'DELETE',
        headers: buildHeaders(token),
      });
      if (!response.ok) {
        const data = await parseResponseSafely(response);
        throw new Error(extractErrorMessage(data, 'حدث خطأ أثناء تفريغ السلة'));
      }
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      dispatch({ type: 'SET_CART', payload: previousState });
      throw error;
    }
  };

  const fetchCart = async (page = 1, perPage = 30) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        const guestCart = loadCartFromLocalStorage();
        dispatch({ type: 'SET_CART', payload: guestCart });
        return guestCart;
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString()
      });

      const response = await fetch(`${API_BASE_URL}/cart?${queryParams}`, {
        method: 'GET',
        headers: buildHeaders(token),
      });

      const responseData = await parseResponseSafely(response);

      if (response.ok && responseData.success) {
        // Transform API response to match our cart structure
        // API returns data as array directly
        const normalizedCart = normalizeCartFromApi(responseData.data ?? responseData);
        const resultCart = normalizedCart ?? EMPTY_CART_STATE;

        dispatch({
          type: 'SET_CART',
          payload: resultCart
        });

        return { 
          ...resultCart,
          meta: responseData.meta_data || {}
        };
      }

      if (!localStorage.getItem('userToken')) {
        return loadCartFromLocalStorage();
      }
      return { items: [], totalItems: 0, totalPrice: 0 };
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (!localStorage.getItem('userToken')) {
        return loadCartFromLocalStorage();
      }
      return { items: [], totalItems: 0, totalPrice: 0 };
    }
  };

  useEffect(() => {
    if (shouldUseGuestCart()) {
      persistCartToLocalStorage(cartState);
    } else {
      clearLocalCartStorage();
    }
  }, [cartState]);

  const value = {
    ...cartState,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
