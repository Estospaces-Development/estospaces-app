import { supabase } from '../lib/supabase';
import { getSessionWithTimeout } from '../utils/authHelpers';

/**
 * Fetch analytics data for charts and graphs
 * Returns real calculated data from database
 */
export const getAnalyticsData = async () => {
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

    // Get property IDs for this agent
    const { data: userProperties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, title, views, inquiries, status, price, created_at')
      .eq('agent_id', userId);

    if (propertiesError) {
      return {
        error: propertiesError.message,
        data: null,
      };
    }

    const propertyIds = userProperties?.map(p => p.id) || [];

    if (propertyIds.length === 0) {
      return {
        data: {
          propertyPerformance: [],
          applicationsByProperty: [],
          revenueTrend: [],
          monthlyApplicationsTrend: [],
          leadAnalytics: {
            totalLeads: 0,
            totalProperties: 0,
            conversionRate: 0,
            passed: 0,
          },
        },
        error: null,
      };
    }

    // Fetch applications grouped by property
    const { data: applications, error: applicationsError } = await supabase
      .from('applied_properties')
      .select('id, property_id, status, created_at')
      .in('property_id', propertyIds);

    if (applicationsError) {
      return {
        error: applicationsError.message,
        data: null,
      };
    }

    // Fetch conversations (leads)
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('id, status, created_at')
      .eq('status', 'active');

    if (conversationsError) {
      return {
        error: conversationsError.message,
        data: null,
      };
    }

    // Calculate property performance
    const propertyPerformance = userProperties
      .filter(p => p.status === 'online' || p.status === 'active')
      .map(property => {
        const propertyApplications = (applications || []).filter(
          app => app.property_id === property.id
        );
        const views = property.views || 0;
        const appCount = propertyApplications.length;
        const conversionRate = views > 0 ? ((appCount / views) * 100).toFixed(1) : 0;

        return {
          property: property.title || 'Untitled Property',
          views,
          applications: appCount,
          conversionRate: parseFloat(conversionRate),
        };
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 10); // Top 10 properties

    // Calculate applications by property
    const applicationsByProperty = userProperties
      .map(property => {
        const propertyApplications = (applications || []).filter(
          app => app.property_id === property.id
        );
        return {
          label: property.title || 'Untitled Property',
          value: propertyApplications.length,
        };
      })
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Calculate revenue trend (last 6 months)
    // Revenue is estimated based on approved applications * property price
    const revenueTrend = [];
    const monthlyApplicationsTrend = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
      
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
      
      // Count applications for this month
      const monthApplications = (applications || []).filter(app => {
        const appDate = new Date(app.created_at);
        return appDate >= monthStart && appDate <= monthEnd;
      });

      // Calculate revenue: sum of prices for properties with approved applications this month
      const monthRevenue = monthApplications
        .filter(app => app.status === 'approved')
        .reduce((sum, app) => {
          const property = userProperties.find(p => p.id === app.property_id);
          if (property) {
            return sum + (parseFloat(property.price || 0) || 0);
          }
          return sum;
        }, 0);

      revenueTrend.push({
        label: monthName,
        value: monthRevenue / 1000, // Convert to thousands for display
      });

      monthlyApplicationsTrend.push({
        label: monthName,
        value: monthApplications.length,
      });
    }

    // Calculate lead analytics
    const totalLeads = conversations?.length || 0;
    const totalProperties = userProperties.length;
    const totalApplications = applications?.length || 0;
    const totalViews = userProperties.reduce((sum, p) => sum + (p.views || 0), 0);
    const conversionRate = totalViews > 0 
      ? ((totalApplications / totalViews) * 100).toFixed(1)
      : '0.0';
    
    // "Passed" could mean rejected applications or closed conversations
    const passed = (applications || []).filter(app => app.status === 'rejected').length;

    return {
      data: {
        propertyPerformance,
        applicationsByProperty,
        revenueTrend,
        monthlyApplicationsTrend,
        leadAnalytics: {
          totalLeads,
          totalProperties,
          conversionRate: parseFloat(conversionRate),
          passed,
        },
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
