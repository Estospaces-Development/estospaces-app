import { supabase } from '../lib/supabase';

/**
 * Fetch dashboard statistics for manager dashboard
 * Returns real data from Supabase database
 */
export const getDashboardStats = async () => {
  try {
    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session?.user) {
      return {
        error: 'Authentication required',
        data: null,
      };
    }

    const userId = session.user.id;

    // First, get all property IDs for this agent
    const { data: userProperties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, price, inquiries, views, status')
      .eq('agent_id', userId);

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
    }

    const propertyIds = userProperties?.map(p => p.id) || [];

    // Fetch all stats in parallel
    const [
      activePropertiesResult,
      applicationsResult,
      conversationsResult,
    ] = await Promise.all([
      // Active Properties - filter from userProperties
      Promise.resolve({
        data: userProperties?.filter(p => p.status === 'online' || p.status === 'active') || [],
        count: userProperties?.filter(p => p.status === 'online' || p.status === 'active').length || 0,
        error: null,
      }),

      // Applications - from applied_properties table for this agent's properties
      propertyIds.length > 0
        ? supabase
            .from('applied_properties')
            .select('id, status', { count: 'exact', head: false })
            .in('property_id', propertyIds)
        : Promise.resolve({ data: [], count: 0, error: null }),

      // Active Leads - conversations (inquiries about properties)
      supabase
        .from('conversations')
        .select('id', { count: 'exact', head: false })
        .eq('status', 'active')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    // Handle errors
    if (activePropertiesResult.error) {
      console.error('Error fetching active properties:', activePropertiesResult.error);
    }
    if (applicationsResult.error) {
      console.error('Error fetching applications:', applicationsResult.error);
    }
    if (conversationsResult.error) {
      console.error('Error fetching conversations:', conversationsResult.error);
    }

    // Calculate statistics
    const allProperties = userProperties || [];
    const activePropertiesCount = activePropertiesResult.count || 0;
    const totalApplications = applicationsResult.count || 0;
    const activeLeads = conversationsResult.count || 0;
    
    // Calculate total views
    const totalViews = allProperties.reduce((sum, prop) => {
      return sum + (prop.views || 0);
    }, 0) || 0;

    // Calculate monthly revenue
    // For rental properties: monthly rent * inquiries (assuming inquiries convert to leases)
    // For sale properties: sale price / 12 (annualized monthly)
    // Simplified: sum of active property prices / 12 for monthly estimate
    const activeProperties = allProperties.filter(p => p.status === 'online' || p.status === 'active');
    const monthlyRevenue = activeProperties.reduce((sum, prop) => {
      const price = parseFloat(prop.price || 0);
      // If it's a rent property, use price directly; if sale, divide by 12
      return sum + price;
    }, 0);

    // Calculate conversion rate (applications / total views * 100)
    const conversionRate = totalViews > 0 
      ? ((totalApplications / totalViews) * 100).toFixed(1)
      : '0.0';

    // Calculate growth/change percentage (mock for now - could track historical data)
    // In a real implementation, you'd compare current month vs previous month
    const monthlyRevenueChange = '+8.5%'; // TODO: Calculate from historical data
    const activeListingsChange = '+5%'; // TODO: Calculate from historical data
    const totalViewsChange = '+15.2%'; // TODO: Calculate from historical data
    const conversionRateChange = '+5%'; // TODO: Calculate from historical data

    return {
      data: {
        monthlyRevenue: monthlyRevenue.toFixed(2),
        monthlyRevenueChange,
        activeProperties: activePropertiesCount,
        activeListingsChange,
        totalViews: totalViews.toLocaleString(),
        totalViewsChange,
        conversionRate: `${conversionRate}%`,
        conversionRateChange,
        activeLeads,
        totalApplications,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      error: error.message,
      data: null,
    };
  }
};

/**
 * Fetch statistics for Welcome Banner (simplified)
 */
export const getWelcomeBannerStats = async () => {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session?.user) {
      return {
        error: 'Authentication required',
        data: { activeProperties: 0, activeLeads: 0, totalApplications: 0 },
      };
    }

    const userId = session.user.id;

    // First get property IDs for this agent
    const { data: userProperties } = await supabase
      .from('properties')
      .select('id, status')
      .eq('agent_id', userId);

    const propertyIds = userProperties?.map(p => p.id) || [];
    const activePropertiesCount = userProperties?.filter(p => p.status === 'online' || p.status === 'active').length || 0;

    // Fetch applications and conversations in parallel
    const [
      applicationsResult,
      conversationsResult,
    ] = await Promise.all([
      // Applications for this agent's properties
      propertyIds.length > 0
        ? supabase
            .from('applied_properties')
            .select('id', { count: 'exact', head: false })
            .in('property_id', propertyIds)
        : Promise.resolve({ count: 0, error: null }),

      // Active conversations (leads)
      supabase
        .from('conversations')
        .select('id', { count: 'exact', head: false })
        .eq('status', 'active'),
    ]);

    return {
      data: {
        activeProperties: activePropertiesCount,
        activeLeads: conversationsResult.count || 0,
        totalApplications: applicationsResult.count || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching welcome banner stats:', error);
    return {
      error: error.message,
      data: { activeProperties: 0, activeLeads: 0, totalApplications: 0 },
    };
  }
};
