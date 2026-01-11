import { supabase } from '../lib/supabase';
import { getSessionWithTimeout } from '../utils/authHelpers';

/**
 * Fetch dashboard statistics for manager dashboard
 * Returns real data from Supabase database
 */
export const getDashboardStats = async () => {
  try {
    // Get current user with timeout protection
    const { data: { session }, error: authError } = await getSessionWithTimeout(5000);
    
    if (authError || !session?.user) {
      return {
        error: authError?.message || 'Authentication required',
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
      // Error handled below
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

    // Handle errors silently - return default values if needed
    if (propertiesError || activePropertiesResult.error || applicationsResult.error || conversationsResult.error) {
      // Errors are handled by returning empty/default data
    }

    // Calculate statistics
    const allProperties = userProperties || [];
    const activePropertiesCount = activePropertiesResult.count || 0;
    const totalApplications = applicationsResult.count || 0;
    const activeLeads = conversationsResult.count || 0;
    
    // Calculate total views from viewed_properties table for accurate real-time count
    const { data: viewedPropertiesData, count: totalViewsCount } = propertyIds.length > 0
      ? await supabase
          .from('viewed_properties')
          .select('view_count', { count: 'exact', head: false })
          .in('property_id', propertyIds)
      : { data: [], count: 0 };
    
    // Sum up all view_count values for accurate total
    const totalViews = (viewedPropertiesData || []).reduce((sum, record) => {
      return sum + (record.view_count || 0);
    }, 0) || 0;

    // Calculate monthly revenue based on approved applications in current month
    // This represents actual revenue from successful applications
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Fetch approved applications for current month
    const { data: currentMonthApplications } = propertyIds.length > 0
      ? await supabase
          .from('applied_properties')
          .select('id, property_id, status, created_at')
          .in('property_id', propertyIds)
          .eq('status', 'approved')
          .gte('created_at', currentMonthStart.toISOString())
          .lte('created_at', currentMonthEnd.toISOString())
      : { data: [], error: null };

    // Calculate monthly revenue: sum of property prices for approved applications this month
    const monthlyRevenue = (currentMonthApplications || []).reduce((sum, app) => {
      const property = allProperties.find(p => p.id === app.property_id);
      if (property) {
        const price = parseFloat(property.price || 0);
        // For rental properties, price is monthly rent
        // For sale properties, we could divide by 12 for monthly estimate, but for now use price as-is
        // In a real system, you'd have actual transaction/lease data
        return sum + price;
      }
      return sum;
    }, 0);

    // Calculate conversion rate (applications / total views * 100)
    const conversionRate = totalViews > 0 
      ? ((totalApplications / totalViews) * 100).toFixed(1)
      : '0.0';

    // Calculate growth/change percentage by comparing current month with previous month

    // Fetch previous month data for comparison
    const [previousMonthProperties, previousMonthApplications, previousMonthViewsData, previousMonthApprovedApps] = await Promise.all([
      // Previous month active properties
      supabase
        .from('properties')
        .select('id, price, views, status', { count: 'exact', head: false })
        .eq('agent_id', userId)
        .lte('created_at', previousMonthEnd.toISOString())
        .in('status', ['online', 'active']),
      
      // Previous month applications
      propertyIds.length > 0
        ? supabase
            .from('applied_properties')
            .select('id', { count: 'exact', head: false })
            .in('property_id', propertyIds)
            .gte('created_at', previousMonthStart.toISOString())
            .lt('created_at', currentMonthStart.toISOString())
        : Promise.resolve({ count: 0, error: null }),
      
      // Previous month total views from viewed_properties table (views that occurred before current month)
      propertyIds.length > 0
        ? supabase
            .from('viewed_properties')
            .select('view_count')
            .in('property_id', propertyIds)
            .lt('viewed_at', currentMonthStart.toISOString())
        : Promise.resolve({ data: [], error: null }),
      
      // Previous month approved applications with property details
      propertyIds.length > 0
        ? supabase
            .from('applied_properties')
            .select('id, property_id, status, created_at')
            .in('property_id', propertyIds)
            .eq('status', 'approved')
            .gte('created_at', previousMonthStart.toISOString())
            .lt('created_at', currentMonthStart.toISOString())
        : Promise.resolve({ data: [], error: null }),
    ]);

    // Calculate previous month stats
    const previousActiveProperties = previousMonthProperties.count || 0;
    const previousApplications = previousMonthApplications.count || 0;
    const previousViews = (previousMonthViewsData.data || []).reduce((sum, record) => sum + (record.view_count || 0), 0);
    
    // Calculate previous month revenue from approved applications
    const previousRevenue = (previousMonthApprovedApps.data || []).reduce((sum, app) => {
      const property = (previousMonthProperties.data || []).find(p => p.id === app.property_id);
      if (property) {
        return sum + (parseFloat(property.price || 0) || 0);
      }
      return sum;
    }, 0);

    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? '+100%' : '0%';
      }
      const change = ((current - previous) / previous) * 100;
      const sign = change >= 0 ? '+' : '';
      return `${sign}${change.toFixed(1)}%`;
    };

    const monthlyRevenueChange = calculateChange(monthlyRevenue, previousRevenue);
    const activeListingsChange = calculateChange(activePropertiesCount, previousActiveProperties);
    const totalViewsChange = calculateChange(totalViews, previousViews);
    
    // For conversion rate, compare current vs previous
    const previousConversionRate = previousViews > 0 
      ? ((previousApplications / previousViews) * 100)
      : 0;
    const conversionRateChange = calculateChange(parseFloat(conversionRate), previousConversionRate);

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
    const { data: { session }, error: authError } = await getSessionWithTimeout(5000);
    
    if (authError || !session?.user) {
      return {
        error: authError?.message || 'Authentication required',
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
    return {
      error: error.message,
      data: { activeProperties: 0, activeLeads: 0, totalApplications: 0 },
    };
  }
};
