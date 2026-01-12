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
  const [savedPropertyIds, setSavedPropertyIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get user from auth context
  const auth = useAuth();
  const user = auth?.user;

  // Fetch saved properties from the database
  const fetchSavedProperties = useCallback(async () => {
    console.log('📥 fetchSavedProperties called', { userId: user?.id, supabaseAvailable: isSupabaseAvailable() });
    
    if (!user?.id || !isSupabaseAvailable()) {
      console.log('📥 Skipping fetch - no user or Supabase not available');
      setSavedProperties([]);
      setSavedPropertyIds(new Set());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Add small delay to avoid concurrent request conflicts
      await new Promise(resolve => setTimeout(resolve, 300));

      // First, fetch the saved property IDs
      console.log('📥 Fetching saved property IDs from database...');
      const { data: savedData, error: fetchError } = await supabase
        .from('saved_properties')
        .select('id, property_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        // Ignore abort errors
        if (fetchError.message?.includes('AbortError') || fetchError.message?.includes('aborted')) {
          console.log('⏭️ Request was aborted, skipping');
          setLoading(false);
          return;
        }
        console.error('❌ Error fetching saved properties:', fetchError);
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      console.log('📥 Fetched saved property IDs:', savedData?.length || 0);

      if (!savedData || savedData.length === 0) {
        console.log('📥 No saved properties found');
        setSavedProperties([]);
        setSavedPropertyIds(new Set());
        setLoading(false);
        return;
      }

      // Get property IDs
      const propertyIds = savedData.map(s => s.property_id);
      const ids = new Set(propertyIds);
      setSavedPropertyIds(ids);
      console.log('📥 Saved property IDs set:', Array.from(ids));

      // Fetch property details
      console.log('📥 Fetching property details...');
      const { data: propertiesData, error: propsError } = await supabase
        .from('properties')
        .select('id, title, price, currency, city, country, bedrooms, bathrooms, area, area_unit, property_type, listing_type, image_urls, status')
        .in('id', propertyIds);

      if (propsError) {
        // Ignore abort errors
        if (propsError.message?.includes('AbortError') || propsError.message?.includes('aborted')) {
          console.log('⏭️ Request was aborted, skipping');
          setLoading(false);
          return;
        }
        console.error('❌ Error fetching property details:', propsError);
        // Still have IDs even if details fail
        setLoading(false);
        return;
      }

      console.log('📥 Fetched property details:', propertiesData?.length || 0);

      // Merge saved data with property details
      const properties = savedData
        .map(saved => {
          const prop = propertiesData?.find(p => p.id === saved.property_id);
          if (!prop) return null;
          return {
            ...prop,
            savedAt: saved.created_at,
            savedRecordId: saved.id
          };
        })
        .filter(Boolean);
      
      console.log('✅ Saved properties loaded:', properties.length);
      setSavedProperties(properties);
    } catch (err) {
      // Ignore abort errors
      if (err.message?.includes('AbortError') || err.message?.includes('aborted')) {
        console.log('⏭️ Request was aborted, skipping');
      } else {
        console.error('❌ Error in fetchSavedProperties:', err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch on mount and when user changes
  useEffect(() => {
    fetchSavedProperties();
  }, [fetchSavedProperties]);

  // Save a property to favorites
  const saveProperty = useCallback(async (property) => {
    console.log('🔖 saveProperty called', { property, userId: user?.id, supabaseAvailable: isSupabaseAvailable() });
    
    if (!user?.id || !isSupabaseAvailable()) {
      console.warn('Cannot save property: user not logged in or Supabase not available');
      return { success: false, error: 'Please log in to save properties' };
    }

    const propertyId = property.id || property;
    console.log('🔖 Saving property with ID:', propertyId);

    // Optimistic update
    setSavedPropertyIds(prev => new Set([...prev, propertyId]));

    try {
      console.log('🔖 Inserting into saved_properties table...');
      const { data, error: insertError } = await supabase
        .from('saved_properties')
        .insert({
          user_id: user.id,
          property_id: propertyId
        })
        .select()
        .single();

      if (insertError) {
        // Check if it's a duplicate error
        if (insertError.code === '23505') {
          console.log('✅ Property already saved');
          return { success: true, alreadySaved: true };
        }
        
        // Rollback optimistic update
        setSavedPropertyIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
        
        console.error('❌ Error saving property:', insertError);
        return { success: false, error: insertError.message };
      }

      // Refresh the full list to get property details
      console.log('🔖 Refreshing saved properties list...');
      await fetchSavedProperties();
      
      console.log('✅ Property saved successfully:', data);
      return { success: true, data };
    } catch (err) {
      // Rollback optimistic update
      setSavedPropertyIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
      
      console.error('❌ Error saving property:', err);
      return { success: false, error: err.message };
    }
  }, [user?.id, fetchSavedProperties]);

  // Remove a property from favorites
  const removeProperty = useCallback(async (propertyId) => {
    console.log('🗑️ removeProperty called', { propertyId, userId: user?.id });
    
    if (!user?.id || !isSupabaseAvailable()) {
      console.warn('Cannot remove property: user not logged in or Supabase not available');
      return { success: false, error: 'Please log in to manage saved properties' };
    }

    // Optimistic update
    const previousIds = new Set(savedPropertyIds);
    setSavedPropertyIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(propertyId);
      return newSet;
    });
    setSavedProperties(prev => prev.filter(p => p.id !== propertyId));

    try {
      console.log('🗑️ Deleting from saved_properties table...');
      const { error: deleteError } = await supabase
        .from('saved_properties')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (deleteError) {
        // Rollback optimistic update
        setSavedPropertyIds(previousIds);
        await fetchSavedProperties();
        
        console.error('❌ Error removing property:', deleteError);
        return { success: false, error: deleteError.message };
      }

      console.log('✅ Property removed from favorites');
      return { success: true };
    } catch (err) {
      // Rollback optimistic update
      setSavedPropertyIds(previousIds);
      await fetchSavedProperties();
      
      console.error('❌ Error removing property:', err);
      return { success: false, error: err.message };
    }
  }, [user?.id, savedPropertyIds, fetchSavedProperties]);

  // Toggle property saved status
  const toggleProperty = useCallback(async (property) => {
    const propertyId = property.id || property;
    const isCurrentlySaved = savedPropertyIds.has(propertyId);
    
    console.log('🔄 toggleProperty called', { 
      propertyId, 
      isCurrentlySaved, 
      savedPropertyIds: Array.from(savedPropertyIds) 
    });

    if (isCurrentlySaved) {
      return await removeProperty(propertyId);
    } else {
      return await saveProperty(property);
    }
  }, [savedPropertyIds, saveProperty, removeProperty]);

  // Check if a property is saved
  const isPropertySaved = useCallback((propertyId) => {
    return savedPropertyIds.has(propertyId);
  }, [savedPropertyIds]);

  // Get count of saved properties
  const savedCount = savedProperties.length;

  return (
    <SavedPropertiesContext.Provider
      value={{
        savedProperties,
        savedPropertyIds,
        loading,
        error,
        saveProperty,
        removeProperty,
        toggleProperty,
        isPropertySaved,
        savedCount,
        refreshSavedProperties: fetchSavedProperties,
      }}
    >
      {children}
    </SavedPropertiesContext.Provider>
  );
};
