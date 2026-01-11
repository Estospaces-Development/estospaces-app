import { supabase } from '../lib/supabase';
import { getSessionWithTimeout } from '../utils/authHelpers';

/**
 * Fetch applications for the logged-in manager's properties
 * Returns real data from Supabase applied_properties table
 */
export const getApplications = async () => {
  try {
    // Get current user with timeout protection
    const { data: { session }, error: authError } = await getSessionWithTimeout(5000);
    
    if (authError || !session?.user) {
      return {
        error: authError?.message || 'Authentication required',
        data: [],
      };
    }

    const userId = session.user.id;

    // First, get all property IDs for this agent
    const { data: userProperties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, title')
      .eq('agent_id', userId);

    if (propertiesError) {
      return {
        error: propertiesError.message,
        data: [],
      };
    }

    const propertyIds = userProperties?.map(p => p.id) || [];

    if (propertyIds.length === 0) {
      return {
        data: [],
        error: null,
      };
    }

    // Fetch applications for this agent's properties
    // Join with users table to get user details and properties table for property info
    const { data: applications, error: applicationsError } = await supabase
      .from('applied_properties')
      .select(`
        id,
        status,
        application_data,
        created_at,
        updated_at,
        user_id,
        property_id,
        users:user_id (
          id,
          email,
          raw_user_meta_data
        ),
        properties:property_id (
          id,
          title
        )
      `)
      .in('property_id', propertyIds)
      .order('created_at', { ascending: false });

    if (applicationsError) {
      return {
        error: applicationsError.message,
        data: [],
      };
    }

    // Map applications to the format expected by the Dashboard
    const mappedApplications = (applications || []).map((app) => {
      const user = app.users;
      const property = app.properties;
      const applicationData = app.application_data || {};
      
      // Extract user name from metadata or email
      const userName = user?.raw_user_meta_data?.full_name 
        || user?.raw_user_meta_data?.name
        || user?.email?.split('@')[0] 
        || 'Unknown User';
      
      const userEmail = user?.email || '';
      
      // Extract phone from application_data
      const phone = applicationData.phone || applicationData.phoneNumber || '';
      
      // Extract budget from application_data
      const budget = applicationData.budget 
        || applicationData.monthlyBudget 
        || applicationData.priceRange 
        || 'N/A';
      
      // Format budget if it's a number
      const formattedBudget = typeof budget === 'number' 
        ? `$${budget.toLocaleString()}/mo`
        : budget;

      // Map status from database to UI status
      let status = 'Pending';
      if (app.status === 'approved') {
        status = 'Approved';
      } else if (app.status === 'rejected') {
        status = 'Rejected';
      } else if (app.status === 'under_review') {
        status = 'Pending';
      } else if (app.status === 'withdrawn') {
        status = 'Rejected';
      }

      // Calculate score (placeholder - implement based on business logic)
      // Could be based on application completeness, user profile, etc.
      const score = applicationData.score || 0;

      // Calculate last contact time
      const daysSinceUpdate = app.updated_at
        ? Math.floor((Date.now() - new Date(app.updated_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      let lastContact = '';
      if (daysSinceUpdate === 0) {
        lastContact = 'Today';
      } else if (daysSinceUpdate === 1) {
        lastContact = '1 day ago';
      } else {
        lastContact = `${daysSinceUpdate} days ago`;
      }

      return {
        id: app.id,
        name: userName,
        email: userEmail,
        propertyInterested: property?.title || 'Unknown Property',
        status,
        score,
        budget: formattedBudget,
        submittedDate: app.created_at,
        lastContact,
        phone,
        createdAt: app.created_at,
        updatedAt: app.updated_at,
      };
    });

    return {
      data: mappedApplications,
      error: null,
    };
  } catch (error) {
    return {
      error: error.message,
      data: [],
    };
  }
};

/**
 * Fetch a single application by ID
 */
export const getApplicationById = async (applicationId) => {
  try {
    const { data: { session }, error: authError } = await getSessionWithTimeout(5000);
    
    if (authError || !session?.user) {
      return {
        error: 'Authentication required',
        data: null,
      };
    }

    const { data: application, error } = await supabase
      .from('applied_properties')
      .select(`
        *,
        users:user_id (
          id,
          email,
          raw_user_meta_data
        ),
        properties:property_id (
          *
        )
      `)
      .eq('id', applicationId)
      .single();

    if (error) {
      return {
        error: error.message,
        data: null,
      };
    }

    if (!application) {
      return {
        error: 'Application not found',
        data: null,
      };
    }

    const user = application.users;
    const property = application.properties;
    const applicationData = application.application_data || {};
    
    const userName = user?.raw_user_meta_data?.full_name 
      || user?.raw_user_meta_data?.name
      || user?.email?.split('@')[0] 
      || 'Unknown User';
    
    let status = 'Pending';
    if (application.status === 'approved') {
      status = 'Approved';
    } else if (application.status === 'rejected') {
      status = 'Rejected';
    } else if (application.status === 'under_review') {
      status = 'Pending';
    }

    const daysSinceUpdate = application.updated_at
      ? Math.floor((Date.now() - new Date(application.updated_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    let lastContact = '';
    if (daysSinceUpdate === 0) {
      lastContact = 'Today';
    } else if (daysSinceUpdate === 1) {
      lastContact = '1 day ago';
    } else {
      lastContact = `${daysSinceUpdate} days ago`;
    }

    return {
      data: {
        id: application.id,
        name: userName,
        email: user?.email || '',
        propertyInterested: property?.title || 'Unknown Property',
        status,
        score: applicationData.score || 0,
        budget: applicationData.budget || 'N/A',
        submittedDate: application.created_at,
        lastContact,
        phone: applicationData.phone || '',
        createdAt: application.created_at,
        updatedAt: application.updated_at,
        applicationData,
        property,
        user,
      },
      error: null,
    };
  } catch (error) {
    return {
      error: error.message,
      data: null,
    };
  }
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (applicationId, status) => {
  try {
    const { data: { session }, error: authError } = await getSessionWithTimeout(5000);
    
    if (authError || !session?.user) {
      return {
        error: 'Authentication required',
        data: null,
      };
    }

    // Map UI status to database status
    let dbStatus = 'pending';
    if (status === 'Approved') {
      dbStatus = 'approved';
    } else if (status === 'Rejected') {
      dbStatus = 'rejected';
    } else if (status === 'Pending') {
      dbStatus = 'under_review';
    }

    const { data, error } = await supabase
      .from('applied_properties')
      .update({ 
        status: dbStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      return {
        error: error.message,
        data: null,
      };
    }

    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      error: error.message,
      data: null,
    };
  }
};

/**
 * Delete an application
 */
export const deleteApplication = async (applicationId) => {
  try {
    const { data: { session }, error: authError } = await getSessionWithTimeout(5000);
    
    if (authError || !session?.user) {
      return {
        error: 'Authentication required',
        data: null,
      };
    }

    const { error } = await supabase
      .from('applied_properties')
      .delete()
      .eq('id', applicationId);

    if (error) {
      return {
        error: error.message,
        data: null,
      };
    }

    return {
      data: { success: true },
      error: null,
    };
  } catch (error) {
    return {
      error: error.message,
      data: null,
    };
  }
};
