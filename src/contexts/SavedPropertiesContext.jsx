import React, { createContext, useContext, useState, useEffect } from 'react';

const SavedPropertiesContext = createContext();

export const useSavedProperties = () => {
  const context = useContext(SavedPropertiesContext);
  if (!context) {
    throw new Error('useSavedProperties must be used within a SavedPropertiesProvider');
  }
  return context;
};

export const SavedPropertiesProvider = ({ children }) => {
  const [savedProperties, setSavedProperties] = useState(() => {
    // Load saved properties from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saved-properties');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });

  useEffect(() => {
    // Save to localStorage whenever savedProperties changes
    if (typeof window !== 'undefined') {
      localStorage.setItem('saved-properties', JSON.stringify(savedProperties));
    }
  }, [savedProperties]);

  const saveProperty = (property) => {
    setSavedProperties((prev) => {
      // Check if property is already saved
      const isAlreadySaved = prev.some((p) => p.id === property.id);
      if (isAlreadySaved) {
        return prev; // Already saved, don't add again
      }
      return [...prev, property];
    });
  };

  const removeProperty = (propertyId) => {
    setSavedProperties((prev) => prev.filter((p) => p.id !== propertyId));
  };

  const toggleProperty = (property) => {
    setSavedProperties((prev) => {
      const isAlreadySaved = prev.some((p) => p.id === property.id);
      if (isAlreadySaved) {
        return prev.filter((p) => p.id !== property.id);
      } else {
        return [...prev, property];
      }
    });
  };

  const isPropertySaved = (propertyId) => {
    return savedProperties.some((p) => p.id === propertyId);
  };

  return (
    <SavedPropertiesContext.Provider
      value={{
        savedProperties,
        saveProperty,
        removeProperty,
        toggleProperty,
        isPropertySaved,
      }}
    >
      {children}
    </SavedPropertiesContext.Provider>
  );
};

