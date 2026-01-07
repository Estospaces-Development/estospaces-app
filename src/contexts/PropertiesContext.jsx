import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import * as propertiesService from '../services/propertiesService';

const PropertiesContext = createContext();

export const useProperties = () => {
  const context = useContext(PropertiesContext);
  if (!context) {
    throw new Error('useProperties must be used within a PropertiesProvider');
  }
  return context;
};

export const PropertiesProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [appliedProperties, setAppliedProperties] = useState([]);
  const [viewedProperties, setViewedProperties] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    country: 'UK',
    status: 'online',
    propertyType: null,
    city: null,
    postcode: null,
    minPrice: null,
    maxPrice: null,
    minBedrooms: null,
    maxBedrooms: null,
    minBathrooms: null,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  });

  // Get current user session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch UK properties
  const fetchProperties = useCallback(async (reset = false) => {
    if (!supabase) {
      setError('Supabase not configured');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const offset = reset ? 0 : (pagination.page - 1) * pagination.limit;

      const result = await propertiesService.getUKProperties({
        ...filters,
        limit: pagination.limit,
        offset,
        userId: currentUser?.id || null,
      });

      if (result.error) {
        // Handle table not found error specifically
        if (result.error.code === 'TABLE_NOT_FOUND' || 
            (result.error.message && result.error.message.includes('relation') && result.error.message.includes('does not exist'))) {
          setError('Properties table not found. Please run the SQL schema setup in Supabase Dashboard. See SETUP_INSTRUCTIONS.md for details.');
        } else {
          setError(result.error.message || 'Failed to fetch properties');
        }
        setProperties([]);
        setPagination(prev => ({ ...prev, total: 0, hasMore: false }));
        setLoading(false);
        return;
      }

      if (reset) {
        setProperties(result.data || []);
      } else {
        setProperties(prev => [...prev, ...(result.data || [])]);
      }

      setPagination(prev => ({
        ...prev,
        total: result.count || 0,
        hasMore: (result.data?.length || 0) === pagination.limit,
      }));
    } catch (err) {
      console.error('Error fetching properties:', err);
      // Check for table not found error
      if (err.message && (err.message.includes('relation') || err.message.includes('does not exist'))) {
        setError('Properties table not found. Please run the SQL schema setup in Supabase Dashboard. See SETUP_INSTRUCTIONS.md for details.');
      } else {
        setError(err.message || 'Failed to fetch properties');
      }
      setProperties([]);
      setPagination(prev => ({ ...prev, total: 0, hasMore: false }));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, currentUser]);

  // Search properties
  const searchProperties = useCallback(async (searchQuery) => {
    if (!supabase) {
      setError('Supabase not configured');
      return;
    }

    if (!searchQuery.trim()) {
      fetchProperties(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await propertiesService.searchProperties({
        searchQuery,
        country: filters.country,
        status: filters.status,
        limit: pagination.limit,
        offset: 0,
        userId: currentUser?.id || null,
      });

      if (result.error) {
        throw result.error;
      }

      setProperties(result.data || []);
      setPagination(prev => ({
        ...prev,
        page: 1,
        total: result.data?.length || 0,
        hasMore: false,
      }));
    } catch (err) {
      console.error('Error searching properties:', err);
      setError(err.message || 'Failed to search properties');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, currentUser]);

  // Fetch saved properties
  const fetchSavedProperties = useCallback(async () => {
    if (!currentUser) {
      setSavedProperties([]);
      return;
    }

    try {
      const result = await propertiesService.getSavedProperties(currentUser.id);
      if (result.error) throw result.error;
      setSavedProperties(result.data || []);
    } catch (err) {
      console.error('Error fetching saved properties:', err);
    }
  }, [currentUser]);

  // Fetch applied properties
  const fetchAppliedProperties = useCallback(async () => {
    if (!currentUser) {
      setAppliedProperties([]);
      return;
    }

    try {
      const result = await propertiesService.getAppliedProperties(currentUser.id);
      if (result.error) throw result.error;
      setAppliedProperties(result.data || []);
    } catch (err) {
      console.error('Error fetching applied properties:', err);
    }
  }, [currentUser]);

  // Fetch viewed properties
  const fetchViewedProperties = useCallback(async () => {
    if (!currentUser) {
      setViewedProperties([]);
      return;
    }

    try {
      const result = await propertiesService.getViewedProperties(currentUser.id);
      if (result.error) throw result.error;
      setViewedProperties(result.data || []);
    } catch (err) {
      console.error('Error fetching viewed properties:', err);
    }
  }, [currentUser]);

  // Save property
  const saveProperty = useCallback(async (propertyId) => {
    if (!currentUser) {
      setError('Please log in to save properties');
      return { success: false };
    }

    try {
      const result = await propertiesService.saveProperty(propertyId, currentUser.id);
      if (result.error) throw result.error;

      // Update local state
      setProperties(prev =>
        prev.map(p => (p.id === propertyId ? { ...p, is_saved: true } : p))
      );
      await fetchSavedProperties();

      return { success: true };
    } catch (err) {
      console.error('Error saving property:', err);
      setError(err.message || 'Failed to save property');
      return { success: false, error: err };
    }
  }, [currentUser, fetchSavedProperties]);

  // Unsave property
  const unsaveProperty = useCallback(async (propertyId) => {
    if (!currentUser) {
      return { success: false };
    }

    try {
      const result = await propertiesService.unsaveProperty(propertyId, currentUser.id);
      if (result.error) throw result.error;

      // Update local state
      setProperties(prev =>
        prev.map(p => (p.id === propertyId ? { ...p, is_saved: false } : p))
      );
      await fetchSavedProperties();

      return { success: true };
    } catch (err) {
      console.error('Error unsaving property:', err);
      return { success: false, error: err };
    }
  }, [currentUser, fetchSavedProperties]);

  // Apply to property
  const applyToProperty = useCallback(async (propertyId, applicationData = {}) => {
    if (!currentUser) {
      setError('Please log in to apply to properties');
      return { success: false };
    }

    try {
      const result = await propertiesService.applyToProperty(
        propertyId,
        currentUser.id,
        applicationData
      );
      if (result.error) throw result.error;

      // Update local state
      setProperties(prev =>
        prev.map(p => (p.id === propertyId ? { ...p, is_applied: true, application_status: 'pending' } : p))
      );
      await fetchAppliedProperties();

      return { success: true, data: result.data };
    } catch (err) {
      console.error('Error applying to property:', err);
      setError(err.message || 'Failed to apply to property');
      return { success: false, error: err };
    }
  }, [currentUser, fetchAppliedProperties]);

  // Track property view
  const trackPropertyView = useCallback(async (propertyId) => {
    if (!currentUser) return;

    try {
      await propertiesService.trackPropertyView(propertyId, currentUser.id);
      await fetchViewedProperties();
    } catch (err) {
      console.error('Error tracking property view:', err);
    }
  }, [currentUser, fetchViewedProperties]);

  // Load user data when user changes
  useEffect(() => {
    if (currentUser) {
      fetchSavedProperties();
      fetchAppliedProperties();
      fetchViewedProperties();
    }
  }, [currentUser, fetchSavedProperties, fetchAppliedProperties, fetchViewedProperties]);

  // Fetch properties when filters change
  useEffect(() => {
    fetchProperties(true);
  }, [filters]);

  const value = {
    properties,
    savedProperties,
    appliedProperties,
    viewedProperties,
    currentUser,
    loading,
    error,
    filters,
    pagination,
    setFilters,
    fetchProperties,
    searchProperties,
    saveProperty,
    unsaveProperty,
    applyToProperty,
    trackPropertyView,
    fetchSavedProperties,
    fetchAppliedProperties,
    fetchViewedProperties,
    setPagination,
    setError,
  };

  return <PropertiesContext.Provider value={value}>{children}</PropertiesContext.Provider>;
};

