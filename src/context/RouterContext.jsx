import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const TAB_TO_PATH = {
  dashboard: '/dashboard',
  so: '/sales-orders',
  po: '/purchase-orders',
  product: '/products',
  inventory: '/inventory',
  customer: '/customers',
  vendor: '/vendors',
  finance: '/finance',
  invoice_so: '/invoices/sales',
  invoice_po: '/invoices/purchase',
  settings_category: '/settings/categories',
  settings_invoice: '/settings/invoice',
  settings_export: '/settings/export',
  settings_account: '/settings/account',
  settings_users: '/settings/users',
  settings_roles: '/settings/roles',
};

// Aliases for user-friendly direct typing or backwards compatibility
export const PATH_ALIASES = {
  '/so': '/sales-orders',
  '/orders/sales': '/sales-orders',
  '/po': '/purchase-orders',
  '/orders/purchase': '/purchase-orders',
  '/product': '/products',
  '/data-produk': '/products',
  '/customer': '/customers',
  '/data-customer': '/customers',
  '/vendor': '/vendors',
  '/data-vendor': '/vendors',
  '/finance-dashboard': '/finance',
  '/settings': '/settings/categories',
};

export const PATH_TO_TAB = Object.entries(TAB_TO_PATH).reduce((acc, [tab, path]) => {
  acc[path] = tab;
  return acc;
}, {});

// Helper to resolve route from pathname
const resolveTabAndPath = (rawPathname) => {
  let path = (rawPathname || '').toLowerCase().trim();
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // Alias resolution
  if (PATH_ALIASES[path]) {
    path = PATH_ALIASES[path];
  }

  if (PATH_TO_TAB[path]) {
    return { tab: PATH_TO_TAB[path], path };
  }

  // Default to dashboard
  return { tab: 'dashboard', path: '/dashboard' };
};

const RouterContext = createContext(null);

export const RouterProvider = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window === 'undefined') return '/dashboard';
    const initial = window.location.pathname;
    return initial === '/' ? '/dashboard' : initial;
  });

  const [activeTab, setActiveTabState] = useState(() => {
    if (typeof window === 'undefined') return 'dashboard';
    return resolveTabAndPath(window.location.pathname).tab;
  });

  // Navigate function that supports both tabId (e.g. 'so', 'product') and direct path (e.g. '/sales-orders')
  const navigate = useCallback((target, options = {}) => {
    let targetPath = target;
    let targetTab = 'dashboard';

    if (TAB_TO_PATH[target]) {
      targetTab = target;
      targetPath = TAB_TO_PATH[target];
    } else {
      const resolved = resolveTabAndPath(target);
      targetTab = resolved.tab;
      targetPath = resolved.path;
    }

    if (window.location.pathname !== targetPath) {
      if (options.replace) {
        window.history.replaceState({}, '', targetPath);
      } else {
        window.history.pushState({}, '', targetPath);
      }
    }

    setCurrentPath(targetPath);
    setActiveTabState(targetTab);
  }, []);

  // setActiveTab wrapper for backwards-compatibility with existing props
  const setActiveTab = useCallback((tabId) => {
    navigate(tabId);
  }, [navigate]);

  // Synchronize with browser Back and Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const { tab, path } = resolveTabAndPath(window.location.pathname);
      setCurrentPath(path);
      setActiveTabState(tab);
    };

    window.addEventListener('popstate', handlePopState);

    // Initial normalization if at root '/'
    if (window.location.pathname === '/' || window.location.pathname === '') {
      window.history.replaceState({}, '', '/dashboard');
      setCurrentPath('/dashboard');
      setActiveTabState('dashboard');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <RouterContext.Provider value={{ currentPath, activeTab, navigate, setActiveTab, TAB_TO_PATH }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
