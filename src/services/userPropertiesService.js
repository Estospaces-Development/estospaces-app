import { supabase } from '../lib/supabase';

/**
 * User Properties API Service
 * Production-ready API for listing user-owned properties
 * 
 * Endpoint: getUserProperties()
 * Query params: status, page, limit, sortBy, order
 * 
 * Security: Enforced via RLS (user_id = auth.uid())
 */

/**
 * Get properties created by the authenticated user
 * 
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status: 'draft' | 'published' (optional)
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10, max: 100)
 * @param {string} params.sortBy - Sort field (default: 'created_at')
 * @param {string} params.order - Sort order: 'asc' | 'desc' (default: 'desc')
 * @returns {Promise<Object>} Response with data and pagination info
 */
export const getUserProperties = async ({
  status = null,
  page = 1,
  limit = 10,
  sortBy = 'created_at',
  order = 'desc',
} = {}) => {
  try {
    // Validate authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      return {
        data: null,
        error: {
          message: 'Authentication error',
          code: 'AUTH_ERROR',
          details: authError.message,
        },
        pagination: null,
      };
    }

    if (!session || !session.user) {
      return {
        data: null,
        error: {
          message: 'Unauthorized. Please log in to view your properties.',
          code: 'UNAUTHORIZED',
        },
        pagination: null,
      };
    }

    const userId = session.user.id;

    // Validate and sanitize parameters
    const validatedParams = validateParams({ status, page, limit, sortBy, order });
    
    if (validatedParams.error) {
      return {
        data: null,
        error: validatedParams.error,
        pagination: null,
      };
    }

    const { 
      status: validStatus, 
      page: validPage, 
      limit: validLimit, 
      sortBy: validSortBy, 
      order: validOrder 
    } = validatedParams;

    // Calculate pagination
    const from = (validPage - 1) * validLimit;
    const to = from + validLimit - 1;

    // Build query - check both user_id and agent_id for ownership
    // Use OR condition to support both fields
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .or(`user_id.eq.${userId},agent_id.eq.${userId}`) // Properties belong to user via user_id OR agent_id
      .order(validSortBy, { ascending: validOrder === 'asc' });

    // Apply status filter if provided
    if (validStatus) {
      query = query.eq('status', validStatus);
    }

    // Apply pagination
    query = query.range(from, to);

    // Execute query
    const { data, error, count } = await query;

    // Handle errors
    if (error) {
      // Check for table not found
      const errorMsg = error.message || error.toString() || '';
      if (errorMsg.includes('relation') || 
          errorMsg.includes('does not exist') || 
          errorMsg.includes('schema cache')) {
        return {
          data: null,
          error: {
            message: 'Properties table not found. Please run the SQL schema in Supabase Dashboard.',
            code: 'TABLE_NOT_FOUND',
            details: error.message,
          },
          pagination: null,
        };
      }

      // Check for RLS policy violation
      if (errorMsg.includes('row-level security') || errorMsg.includes('RLS')) {
        return {
          data: null,
          error: {
            message: 'Access denied. RLS policy may be missing or incorrect.',
            code: 'RLS_ERROR',
            details: error.message,
          },
          pagination: null,
        };
      }

      // Generic error
      return {
        data: null,
        error: {
          message: 'Failed to fetch properties',
          code: 'QUERY_ERROR',
          details: error.message,
        },
        pagination: null,
      };
    }

    // Calculate pagination metadata
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / validLimit);

    // Return success response
    return {
      data: data || [],
      error: null,
      pagination: {
        page: validPage,
        limit: validLimit,
        totalCount,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPreviousPage: validPage > 1,
      },
    };
  } catch (error) {
    console.error('Error in getUserProperties:', error);
    return {
      data: null,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: error.message,
      },
      pagination: null,
    };
  }
};

/**
 * Validate and sanitize query parameters
 * @private
 */
const validateParams = ({ status, page, limit, sortBy, order }) => {
  const errors = [];

  // Validate status
  if (status !== null && status !== undefined && status !== '') {
    if (!['draft', 'published'].includes(status)) {
      errors.push({
        field: 'status',
        message: `Invalid status. Must be 'draft' or 'published'.`,
      });
    }
  }

  // Validate page
  const pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    errors.push({
      field: 'page',
      message: 'Page must be a positive integer.',
    });
  }

  // Validate limit
  const limitNum = parseInt(limit, 10);
  if (isNaN(limitNum) || limitNum < 1) {
    errors.push({
      field: 'limit',
      message: 'Limit must be a positive integer.',
    });
  } else if (limitNum > 100) {
    errors.push({
      field: 'limit',
      message: 'Limit cannot exceed 100.',
    });
  }

  // Validate sortBy
  const allowedSortFields = [
    'created_at',
    'updated_at',
    'title',
    'price',
    'bedrooms',
    'bathrooms',
    'city',
    'postcode',
  ];
  if (!allowedSortFields.includes(sortBy)) {
    errors.push({
      field: 'sortBy',
      message: `Invalid sort field. Allowed: ${allowedSortFields.join(', ')}`,
    });
  }

  // Validate order
  if (!['asc', 'desc'].includes(order)) {
    errors.push({
      field: 'order',
      message: "Order must be 'asc' or 'desc'.",
    });
  }

  if (errors.length > 0) {
    return {
      error: {
        message: 'Invalid query parameters',
        code: 'VALIDATION_ERROR',
        details: errors,
      },
    };
  }

  return {
    status: status || null,
    page: pageNum,
    limit: limitNum,
    sortBy,
    order,
  };
};

/**
 * Get a single property by ID (only if owned by user)
 * 
 * @param {string} propertyId - Property UUID
 * @returns {Promise<Object>} Property data or error
 */
export const getUserPropertyById = async (propertyId) => {
  try {
    // Validate authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session || !session.user) {
      return {
        data: null,
        error: {
          message: 'Unauthorized. Please log in.',
          code: 'UNAUTHORIZED',
        },
      };
    }

    const userId = session.user.id;

    // Validate propertyId
    if (!propertyId || typeof propertyId !== 'string') {
      return {
        data: null,
        error: {
          message: 'Invalid property ID',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Query property - check both user_id and agent_id
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .or(`user_id.eq.${userId},agent_id.eq.${userId}`) // Ensure user owns the property
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned (either doesn't exist or user doesn't own it)
        return {
          data: null,
          error: {
            message: 'Property not found or access denied',
            code: 'NOT_FOUND',
          },
        };
      }

      return {
        data: null,
        error: {
          message: 'Failed to fetch property',
          code: 'QUERY_ERROR',
          details: error.message,
        },
      };
    }

    return {
      data,
      error: null,
    };
  } catch (error) {
    console.error('Error in getUserPropertyById:', error);
    return {
      data: null,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: error.message,
      },
    };
  }
};

