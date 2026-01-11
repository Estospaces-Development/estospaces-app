import { supabase } from '../lib/supabase';
import { getSessionWithTimeout } from '../utils/authHelpers';

/**
 * Fetch recent activity for the manager dashboard
 * Combines data from applications and conversations
 */
export const getRecentActivity = async (limit = 10) => {
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

    // Get property IDs for this agent
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

    // Fetch recent applications and conversations in parallel
    const [applicationsResult, conversationsResult] = await Promise.all([
      // Recent applications
      propertyIds.length > 0
        ? supabase
            .from('applied_properties')
            .select(`
              id,
              status,
              created_at,
              users:user_id (
                email,
                raw_user_meta_data
              ),
              properties:property_id (
                title
              )
            `)
            .in('property_id', propertyIds)
            .order('created_at', { ascending: false })
            .limit(limit)
        : Promise.resolve({ data: [], error: null }),

      // Recent conversations (leads)
      supabase
        .from('conversations')
        .select('id, visitor_name, visitor_email, created_at, updated_at, status')
        .order('updated_at', { ascending: false })
        .limit(limit),
    ]);

    const activities = [];

    // Map applications to activities
    if (applicationsResult.data && !applicationsResult.error) {
      applicationsResult.data.forEach((app) => {
        const user = app.users;
        const property = app.properties;
        const userName = user?.raw_user_meta_data?.full_name 
          || user?.raw_user_meta_data?.name
          || user?.email?.split('@')[0] 
          || 'Unknown User';
        
        activities.push({
          id: `app-${app.id}`,
          type: 'New Application',
          name: userName,
          property: property?.title || 'Unknown Property',
          date: new Date(app.created_at).toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
          }),
          timestamp: new Date(app.created_at).getTime(),
          status: app.status,
        });
      });
    }

    // Map conversations to activities
    if (conversationsResult.data && !conversationsResult.error) {
      conversationsResult.data.forEach((conv) => {
        // Only include active conversations as new leads
        if (conv.status === 'active') {
          const daysSinceCreated = conv.created_at
            ? Math.floor((Date.now() - new Date(conv.created_at).getTime()) / (1000 * 60 * 60 * 24))
            : 0;
          
          // Only show conversations from the last 7 days as "new"
          if (daysSinceCreated <= 7) {
            activities.push({
              id: `conv-${conv.id}`,
              type: 'New Lead',
              name: conv.visitor_name || 'Unknown Visitor',
              property: 'Property Inquiry',
              date: new Date(conv.created_at).toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric',
              }),
              timestamp: new Date(conv.created_at).getTime(),
              status: 'active',
            });
          }
        }
      });
    }

    // Sort by timestamp (most recent first) and limit
    activities.sort((a, b) => b.timestamp - a.timestamp);
    const limitedActivities = activities.slice(0, limit);

    return {
      data: limitedActivities,
      error: null,
    };
  } catch (error) {
    return {
      error: error.message,
      data: [],
    };
  }
};
