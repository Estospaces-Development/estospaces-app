import { supabase } from '../lib/supabase';
import { getSessionWithTimeout } from '../utils/authHelpers';

/**
 * Create a new broker request
 * @param {Object} requestData - The broker request data
 * @param {number} requestData.latitude - User's latitude
 * @param {number} requestData.longitude - User's longitude
 * @param {string} requestData.locationText - Optional location text description
 * @param {string} requestData.postcode - Optional postcode
 * @param {string} requestData.message - Optional user message
 * @param {string} requestData.requestType - Request type (default: 'nearest_broker')
 * @param {string} requestData.priority - Priority level (default: 'normal')
 * @returns {Promise<Object>} Response with data or error
 */
export const createBrokerRequest = async (requestData) => {
  try {
    const { data: { session }, error: authError } = await getSessionWithTimeout(5000);
    
    if (authError || !session?.user) {
      return {
        error: authError?.message || 'Authentication required',
        data: null,
      };
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/broker-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        latitude: requestData.latitude,
        longitude: requestData.longitude,
        locationText: requestData.locationText || '',
        postcode: requestData.postcode || '',
        message: requestData.message || '',
        requestType: requestData.requestType || 'nearest_broker',
        priority: requestData.priority || 'normal',
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        error: result.error?.message || 'Failed to create broker request',
        data: null,
      };
    }

    return {
      data: result.data,
      message: result.message,
      error: null,
    };
  } catch (error) {
    console.error('Error creating broker request:', error);
    return {
      error: error.message || 'Failed to create broker request',
      data: null,
    };
  }
};

/**
 * Get user's broker requests
 * @param {string} status - Optional status filter
 * @returns {Promise<Object>} Response with data or error
 */
export const getBrokerRequests = async (status = null) => {
  try {
    const { data: { session }, error: authError } = await getSessionWithTimeout(5000);
    
    if (authError || !session?.user) {
      return {
        error: authError?.message || 'Authentication required',
        data: null,
      };
    }

    const url = new URL(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/broker-requests`);
    if (status) {
      url.searchParams.append('status', status);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        error: result.error?.message || 'Failed to fetch broker requests',
        data: null,
      };
    }

    return {
      data: result.data,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching broker requests:', error);
    return {
      error: error.message || 'Failed to fetch broker requests',
      data: null,
    };
  }
};

/**
 * Get active broker request for current user
 * @returns {Promise<Object>} Response with data or error
 */
export const getActiveBrokerRequest = async () => {
  try {
    const { data: { session }, error: authError } = await getSessionWithTimeout(5000);
    
    if (authError || !session?.user) {
      return {
        error: authError?.message || 'Authentication required',
        data: null,
      };
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/broker-requests/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        error: result.error?.message || 'Failed to fetch active broker request',
        data: null,
      };
    }

    return {
      data: result.data,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching active broker request:', error);
    return {
      error: error.message || 'Failed to fetch active broker request',
      data: null,
    };
  }
};

/**
 * Cancel a broker request
 * @param {string} requestId - The broker request ID to cancel
 * @returns {Promise<Object>} Response with data or error
 */
export const cancelBrokerRequest = async (requestId) => {
  try {
    const { data: { session }, error: authError } = await getSessionWithTimeout(5000);
    
    if (authError || !session?.user) {
      return {
        error: authError?.message || 'Authentication required',
        data: null,
      };
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/broker-requests/${requestId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        error: result.error?.message || 'Failed to cancel broker request',
        data: null,
      };
    }

    return {
      data: result.data,
      message: result.message,
      error: null,
    };
  } catch (error) {
    console.error('Error canceling broker request:', error);
    return {
      error: error.message || 'Failed to cancel broker request',
      data: null,
    };
  }
};

/**
 * Calculate distance between two coordinates in kilometers
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Format time remaining in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTimeRemaining = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default {
  createBrokerRequest,
  getBrokerRequests,
  getActiveBrokerRequest,
  cancelBrokerRequest,
  calculateDistance,
  formatTimeRemaining,
};