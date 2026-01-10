import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Force light theme for dashboard - dark theme removed
    if (typeof window !== 'undefined') {
      const isDashboardRoute = window.location.pathname.startsWith('/user/dashboard');
      // Always use light theme for dashboard
      const root = document.documentElement;
      root.classList.remove('dark');
      return 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDashboardRoute = window.location.pathname.startsWith('/user/dashboard');
      const root = document.documentElement;
      
      // Force light theme for dashboard routes
      if (isDashboardRoute) {
        root.classList.remove('dark');
        // Ensure theme state is light for dashboard
        if (theme !== 'light') {
          setTheme('light');
        }
      } else {
        // For non-dashboard routes, allow theme switching
        if (theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
      
      // Listen for route changes
      const handleRouteChange = () => {
        const currentIsDashboard = window.location.pathname.startsWith('/user/dashboard');
        if (currentIsDashboard) {
          root.classList.remove('dark');
          if (theme !== 'light') {
            setTheme('light');
          }
        }
      };
      
      // Listen to popstate (browser back/forward)
      window.addEventListener('popstate', handleRouteChange);
      
      // Listen for React Router navigation (custom event)
      window.addEventListener('pushstate', handleRouteChange);
      window.addEventListener('replacestate', handleRouteChange);
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange);
        window.removeEventListener('pushstate', handleRouteChange);
        window.removeEventListener('replacestate', handleRouteChange);
      };
    }
  }, [theme, setTheme]);

  const toggleTheme = (newTheme) => {
    // Prevent dark theme on dashboard routes
    if (typeof window !== 'undefined') {
      const isDashboardRoute = window.location.pathname.startsWith('/user/dashboard');
      if (isDashboardRoute && newTheme === 'dark') {
        return; // Don't allow dark theme on dashboard
      }
    }
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
