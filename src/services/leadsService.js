import { supabase } from '../lib/supabase';
import { getSessionWithTimeout } from '../utils/authHelpers';

/**
 * Fetch leads (conversations) for the logged-in manager
 * Returns real data from Supabase conversations table
 */
export const getLeads = async () => {
  try {
    // Get current user with timeout protection
    const { data: { session }, error: authError } = await getSessionWithTimeout(5000);
    
    if (authError || !session?.user) {
      return {
        error: authError?.message || 'Authentication required',
        data: [],
      };
    }

    // Fetch conversations (leads) - managers can see all active conversations
    // Note: You may need to filter by property_id if conversations are linked to properties
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('id, visitor_name, visitor_email, visitor_id, status, created_at, updated_at')
      .order('updated_at', { ascending: false });

    if (conversationsError) {
      return {
        error: conversationsError.message,
        data: [],
      };
    }

    // Map conversations to leads format
    // Note: Property interested, score, budget, and phone need to come from messages or a separate table
    // For now, we'll use available fields and set defaults where needed
    const leads = (conversations || []).map((conv, index) => {
      // Get the most recent message to extract property interest if available
      // This is a simplified version - you may need to join with messages table
      const daysSinceContact = conv.updated_at
        ? Math.floor((Date.now() - new Date(conv.updated_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      let lastContact = '';
      if (daysSinceContact === 0) {
        lastContact = 'Today';
      } else if (daysSinceContact === 1) {
        lastContact = '1 day ago';
      } else {
        lastContact = `${daysSinceContact} days ago`;
      }

      // Map status from conversation status to lead status
      let leadStatus = 'New Lead';
      if (conv.status === 'active') {
        const daysSinceCreated = conv.created_at
          ? Math.floor((Date.now() - new Date(conv.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        if (daysSinceCreated < 1) {
          leadStatus = 'New Lead';
        } else if (daysSinceCreated < 7) {
          leadStatus = 'In Progress';
        } else {
          leadStatus = 'In Progress';
        }
      } else if (conv.status === 'closed') {
        leadStatus = 'Approved';
      }

      return {
        id: conv.id,
        name: conv.visitor_name || 'Unknown',
        email: conv.visitor_email || '',
        propertyInterested: 'Property Inquiry', // This needs to come from messages or property_inquiries table
        status: leadStatus,
        score: 0, // Score calculation needs to be implemented based on business logic
        budget: 'N/A', // Budget needs to come from messages or application_data
        lastContact,
        phone: '', // Phone needs to come from messages or visitor data
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
      };
    });

    return {
      data: leads,
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
 * Fetch a single lead by ID
 */
export const getLeadById = async (leadId) => {
  try {
    const { data: { session }, error: authError } = await getSessionWithTimeout(5000);
    
    if (authError || !session?.user) {
      return {
        error: 'Authentication required',
        data: null,
      };
    }

    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error) {
      return {
        error: error.message,
        data: null,
      };
    }

    if (!conversation) {
      return {
        error: 'Lead not found',
        data: null,
      };
    }

    // Fetch messages to get more context
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', leadId)
      .order('created_at', { ascending: false });

    const daysSinceContact = conversation.updated_at
      ? Math.floor((Date.now() - new Date(conversation.updated_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    let lastContact = '';
    if (daysSinceContact === 0) {
      lastContact = 'Today';
    } else if (daysSinceContact === 1) {
      lastContact = '1 day ago';
    } else {
      lastContact = `${daysSinceContact} days ago`;
    }

    let leadStatus = 'New Lead';
    if (conversation.status === 'active') {
      const daysSinceCreated = conversation.created_at
        ? Math.floor((Date.now() - new Date(conversation.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      if (daysSinceCreated < 1) {
        leadStatus = 'New Lead';
      } else {
        leadStatus = 'In Progress';
      }
    } else if (conversation.status === 'closed') {
      leadStatus = 'Approved';
    }

    return {
      data: {
        id: conversation.id,
        name: conversation.visitor_name || 'Unknown',
        email: conversation.visitor_email || '',
        propertyInterested: 'Property Inquiry', // Extract from messages if available
        status: leadStatus,
        score: 0,
        budget: 'N/A',
        lastContact,
        phone: '',
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
        messages: messages || [],
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
 * Update lead status
 */
export const updateLeadStatus = async (leadId, status) => {
  try {
    const { data: { session }, error: authError } = await getSessionWithTimeout(5000);
    
    if (authError || !session?.user) {
      return {
        error: 'Authentication required',
        data: null,
      };
    }

    // Map lead status to conversation status
    let conversationStatus = 'active';
    if (status === 'Approved' || status === 'Closed') {
      conversationStatus = 'closed';
    }

    const { data, error } = await supabase
      .from('conversations')
      .update({ 
        status: conversationStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
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
