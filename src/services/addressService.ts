import { supabase, isSupabaseAvailable } from '../lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

// Types
export interface Country {
  id: string;
  name: string;
  code: string;
  phone_code: string | null;
  currency_code: string | null;
}

export interface State {
  id: string;
  name: string;
  code: string | null;
  country_id: string;
}

export interface City {
  id: string;
  name: string;
  state_id: string;
  postal_code: string | null;
}

export interface AddressData {
  countryId: string;
  countryName: string;
  countryCode: string;
  stateId: string;
  stateName: string;
  stateCode: string | null;
  cityId: string;
  cityName: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
}

// Cache for session-level caching
const cache: {
  countries: Country[] | null;
  states: Map<string, State[]>;
  cities: Map<string, City[]>;
} = {
  countries: null,
  states: new Map(),
  cities: new Map(),
};

/**
 * Clears all address caches - useful for debugging
 */
export function clearAddressCache() {
  cache.countries = null;
  cache.states.clear();
  cache.cities.clear();
}

/**
 * Fetches all countries from the database
 */
export async function getCountries(): Promise<{ data: Country[] | null; error: string | null }> {
  // Return from cache if available
  if (cache.countries) {
    return { data: cache.countries, error: null };
  }

  if (!isSupabaseAvailable() || !supabase) {
    return { data: null, error: 'Database connection not available' };
  }

  try {
    const { data, error } = await (supabase as SupabaseClient)
      .from('countries')
      .select('id, name, code, phone_code, currency_code')
      .order('name', { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    // Cache the result
    cache.countries = data;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch countries' };
  }
}

/**
 * Fetches states for a specific country
 */
export async function getStatesByCountry(countryId: string): Promise<{ data: State[] | null; error: string | null }> {
  if (!countryId) {
    return { data: null, error: 'Country ID is required' };
  }

  // Return from cache if available
  if (cache.states.has(countryId)) {
    return { data: cache.states.get(countryId) || null, error: null };
  }

  if (!isSupabaseAvailable() || !supabase) {
    return { data: null, error: 'Database connection not available' };
  }

  try {
    const { data, error } = await (supabase as SupabaseClient)
      .from('states')
      .select('id, name, code, country_id')
      .eq('country_id', countryId)
      .order('name', { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    // Cache the result
    cache.states.set(countryId, data || []);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch states' };
  }
}

/**
 * Fetches cities for a specific state
 */
export async function getCitiesByState(stateId: string): Promise<{ data: City[] | null; error: string | null }> {
  if (!stateId) {
    return { data: null, error: 'State ID is required' };
  }

  // Return from cache if available
  if (cache.cities.has(stateId)) {
    return { data: cache.cities.get(stateId) || null, error: null };
  }

  if (!isSupabaseAvailable() || !supabase) {
    return { data: null, error: 'Database connection not available' };
  }

  try {
    const { data, error } = await (supabase as SupabaseClient)
      .from('cities')
      .select('id, name, state_id, postal_code')
      .eq('state_id', stateId)
      .order('name', { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    // Only cache if we got results (empty arrays might be due to missing data)
    if (data && data.length > 0) {
      cache.cities.set(stateId, data);
    }
    return { data: data || [], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch cities' };
  }
}

/**
 * Fetches country by ID
 */
export async function getCountryById(countryId: string): Promise<{ data: Country | null; error: string | null }> {
  if (!countryId) {
    return { data: null, error: 'Country ID is required' };
  }

  // Try to find in cache first
  if (cache.countries) {
    const country = cache.countries.find(c => c.id === countryId);
    if (country) {
      return { data: country, error: null };
    }
  }

  if (!isSupabaseAvailable() || !supabase) {
    return { data: null, error: 'Database connection not available' };
  }

  try {
    const { data, error } = await (supabase as SupabaseClient)
      .from('countries')
      .select('id, name, code, phone_code, currency_code')
      .eq('id', countryId)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch country' };
  }
}

/**
 * Fetches country by code (e.g., 'US', 'GB')
 */
export async function getCountryByCode(code: string): Promise<{ data: Country | null; error: string | null }> {
  if (!code) {
    return { data: null, error: 'Country code is required' };
  }

  // Try to find in cache first
  if (cache.countries) {
    const country = cache.countries.find(c => c.code === code.toUpperCase());
    if (country) {
      return { data: country, error: null };
    }
  }

  if (!isSupabaseAvailable() || !supabase) {
    return { data: null, error: 'Database connection not available' };
  }

  try {
    const { data, error } = await (supabase as SupabaseClient)
      .from('countries')
      .select('id, name, code, phone_code, currency_code')
      .eq('code', code.toUpperCase())
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch country' };
  }
}

/**
 * Fetches state by name and country ID
 */
export async function getStateByNameAndCountry(
  stateName: string, 
  countryId: string
): Promise<{ data: State | null; error: string | null }> {
  if (!stateName || !countryId) {
    return { data: null, error: 'State name and country ID are required' };
  }

  // Try to find in cache first
  if (cache.states.has(countryId)) {
    const states = cache.states.get(countryId);
    const state = states?.find(s => s.name.toLowerCase() === stateName.toLowerCase());
    if (state) {
      return { data: state, error: null };
    }
  }

  if (!isSupabaseAvailable() || !supabase) {
    return { data: null, error: 'Database connection not available' };
  }

  try {
    const { data, error } = await (supabase as SupabaseClient)
      .from('states')
      .select('id, name, code, country_id')
      .eq('country_id', countryId)
      .ilike('name', stateName)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch state' };
  }
}

/**
 * Fetches city by name and state ID
 */
export async function getCityByNameAndState(
  cityName: string, 
  stateId: string
): Promise<{ data: City | null; error: string | null }> {
  if (!cityName || !stateId) {
    return { data: null, error: 'City name and state ID are required' };
  }

  // Try to find in cache first
  if (cache.cities.has(stateId)) {
    const cities = cache.cities.get(stateId);
    const city = cities?.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    if (city) {
      return { data: city, error: null };
    }
  }

  if (!isSupabaseAvailable() || !supabase) {
    return { data: null, error: 'Database connection not available' };
  }

  try {
    const { data, error } = await (supabase as SupabaseClient)
      .from('cities')
      .select('id, name, state_id, postal_code')
      .eq('state_id', stateId)
      .ilike('name', cityName)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch city' };
  }
}

/**
 * Helper to resolve existing address data to IDs
 * Used when loading a property in edit mode
 */
export async function resolveAddressToIds(
  countryName: string | undefined,
  countryCode: string | undefined,
  stateName: string | undefined,
  cityName: string | undefined
): Promise<{
  countryId: string | null;
  stateId: string | null;
  cityId: string | null;
  error: string | null;
}> {
  let countryId: string | null = null;
  let stateId: string | null = null;
  let cityId: string | null = null;

  // Try to find country by code first, then by name
  if (countryCode) {
    const { data } = await getCountryByCode(countryCode);
    if (data) {
      countryId = data.id;
    }
  }

  if (!countryId && countryName) {
    // Load all countries and search
    const { data: countries } = await getCountries();
    if (countries) {
      const country = countries.find(
        c => c.name.toLowerCase() === countryName.toLowerCase()
      );
      if (country) {
        countryId = country.id;
      }
    }
  }

  // Find state if we have a country
  if (countryId && stateName) {
    const { data } = await getStateByNameAndCountry(stateName, countryId);
    if (data) {
      stateId = data.id;
    }
  }

  // Find city if we have a state
  if (stateId && cityName) {
    const { data } = await getCityByNameAndState(cityName, stateId);
    if (data) {
      cityId = data.id;
    }
  }

  return { countryId, stateId, cityId, error: null };
}
