import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserLocation } from '../services/locationService';
import { supabase } from '../lib/supabase';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current user
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Get user profile location
  const getUserProfileLocation = useCallback(async () => {
    if (!currentUser) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('location, postcode, city, latitude, longitude')
        .eq('id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile location:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error getting profile location:', err);
      return null;
    }
  }, [currentUser]);

  // Detect user location on mount
  useEffect(() => {
    const detectLocation = async () => {
      setLoading(true);
      setError(null);

      try {
        const profileLocation = await getUserProfileLocation();
        
        const location = await getUserLocation({
          profileLocation,
          useGeolocation: true,
        });

        setUserLocation(location);
      } catch (err) {
        console.error('Error detecting location:', err);
        setError(err.message);
        // Set default location
        setUserLocation({
          type: 'default',
          postcode: 'SW1A 1AA',
          latitude: 51.5074,
          longitude: -0.1278,
          city: 'London',
          source: 'default',
        });
      } finally {
        setLoading(false);
      }
    };

    detectLocation();
  }, [getUserProfileLocation]);

  // Update location from search
  const updateLocationFromSearch = useCallback(async (searchInput) => {
    setLoading(true);
    setError(null);

    try {
      const location = await getUserLocation({
        searchInput,
        profileLocation: await getUserProfileLocation(),
        useGeolocation: false,
      });

      setSearchLocation(location);
      return location;
    } catch (err) {
      console.error('Error updating location from search:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getUserProfileLocation]);

  // Get active location (search takes priority over user location)
  const getActiveLocation = useCallback(() => {
    return searchLocation || userLocation || {
      type: 'default',
      postcode: 'SW1A 1AA',
      latitude: 51.5074,
      longitude: -0.1278,
      city: 'London',
      source: 'default',
    };
  }, [searchLocation, userLocation]);

  const value = {
    userLocation: userLocation || {
      type: 'default',
      postcode: 'SW1A 1AA',
      latitude: 51.5074,
      longitude: -0.1278,
      city: 'London',
      source: 'default',
    },
    searchLocation,
    activeLocation: getActiveLocation(),
    loading,
    error,
    updateLocationFromSearch,
    clearSearchLocation: () => setSearchLocation(null),
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

