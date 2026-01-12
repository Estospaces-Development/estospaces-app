import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { useAuth } from './AuthContext';

const SavedPropertiesContext = createContext();

export const useSavedProperties = () => {
  const context = useContext(SavedPropertiesContext);
  if (!context) {
    throw new Error('useSavedProperties must be used within a SavedPropertiesProvider');
  }
  return context;
};

export const SavedPropertiesProvider = ({ children }) => {
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Fetch saved properties from Supabase
  const fetchSavedProperties = useCallback(async () => {
    if (!isAuthenticated || !user || !isSupabaseAvailable()) {
      // Fall back to localStorage for non-authenticated users
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('saved-properties');
        if (saved) {
          try {
            setSavedProperties(JSON.parse(saved));
          } catch (e) {
            setSavedProperties([]);
          }
        }
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch saved property IDs from saved_properties table
      const { data: savedData, error: savedError } = await supabase
        .from('saved_properties')
        .select('property_id')
        .eq('user_id', user.id);

      if (savedError) {
        console.error('Error fetching saved properties:', savedError);
        setLoading(false);
        return;
      }

      if (!savedData || savedData.length === 0) {
        setSavedProperties([]);
        setLoading(false);
        return;
      }

      // Fetch full property details for saved properties
      const propertyIds = savedData.map(sp => sp.property_id);
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds);

      if (propError) {
        console.error('Error fetching property details:', propError);
        setSavedProperties([]);
      } else {
        setSavedProperties(properties || []);
        // Also update localStorage as cache
        if (typeof window !== 'undefined') {
          localStorage.setItem('saved-properties', JSON.stringify(properties || []));
        }
      }
    } catch (err) {
      console.error('Failed to fetch saved properties:', err);
      setSavedProperties([]);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  // Fetch saved properties on mount and when user changes
  useEffect(() => {
    fetchSavedProperties();
  }, [fetchSavedProperties]);

  // Save property to Supabase
  const saveProperty = useCallback(async (property) => {
    // Immediately update UI
    setSavedProperties((prev) => {
      const isAlreadySaved = prev.some((p) => p.id === property.id);
      if (isAlreadySaved) return prev;
      return [...prev, property];
    });

    // Update localStorage
    if (typeof window !== 'undefined') {
      const current = JSON.parse(localStorage.getItem('saved-properties') || '[]');
      if (!current.some(p => p.id === property.id)) {
        localStorage.setItem('saved-properties', JSON.stringify([...current, property]));
      }
    }

    // Sync to Supabase if authenticated
    if (isAuthenticated && user && isSupabaseAvailable()) {
      try {
        const { error } = await supabase
          .from('saved_properties')
          .upsert({
            user_id: user.id,
            property_id: property.id,
            saved_at: new Date().toISOString()
          }, { onConflict: 'user_id,property_id' });

        if (error) {
          console.error('Error saving property to Supabase:', error);
        }
      } catch (err) {
        console.error('Failed to save property:', err);
      }
    }
  }, [user, isAuthenticated]);

  // Remove property from Supabase
  const removeProperty = useCallback(async (propertyId) => {
    // Immediately update UI
    setSavedProperties((prev) => prev.filter((p) => p.id !== propertyId));

    // Update localStorage
    if (typeof window !== 'undefined') {
      const current = JSON.parse(localStorage.getItem('saved-properties') || '[]');
      localStorage.setItem('saved-properties', JSON.stringify(current.filter(p => p.id !== propertyId)));
    }

    // Sync to Supabase if authenticated
    if (isAuthenticated && user && isSupabaseAvailable()) {
      try {
        const { error } = await supabase
          .from('saved_properties')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);

        if (error) {
          console.error('Error removing property from Supabase:', error);
        }
      } catch (err) {
        console.error('Failed to remove property:', err);
      }
    }
  }, [user, isAuthenticated]);

  // Toggle property save status
  const toggleProperty = useCallback(async (property) => {
    const isAlreadySaved = savedProperties.some((p) => p.id === property.id);
    
    if (isAlreadySaved) {
      await removeProperty(property.id);
    } else {
      await saveProperty(property);
    }
  }, [savedProperties, saveProperty, removeProperty]);

  // Check if property is saved
  const isPropertySaved = useCallback((propertyId) => {
    return savedProperties.some((p) => p.id === propertyId);
  }, [savedProperties]);

  return (
    <SavedPropertiesContext.Provider
      value={{
        savedProperties,
        loading,
        saveProperty,
        removeProperty,
        toggleProperty,
        isPropertySaved,
        refetch: fetchSavedProperties,
      }}
    >
      {children}
    </SavedPropertiesContext.Provider>
  );
};
