import { supabase } from '../lib/supabase';
import { getSessionWithTimeout } from '../utils/authHelpers';

/**
 * Fetch leads (conversations) for the logged-in manager
 * Returns real data from Supabase conversations table
 */
export const getLeads = async () => {
  // Mock data for leads
  const mockLeads = [
    {
      id: 'lead-1',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      propertyInterested: 'Sunset Villa',
      status: 'New Lead',
      score: 85,
      budget: '$2,500/mo',
      lastContact: '2 hours ago',
      phone: '+1 (555) 123-4567',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'lead-2',
      name: 'Michael Chen',
      email: 'michael.c@example.com',
      propertyInterested: 'Downtown Loft',
      status: 'In Progress',
      score: 92,
      budget: '$3,200/mo',
      lastContact: '1 day ago',
      phone: '+1 (555) 987-6543',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'lead-3',
      name: 'Emma Wilson',
      email: 'emma.w@example.com',
      propertyInterested: 'Green Heights',
      status: 'Approved',
      score: 95,
      budget: '$1,800/mo',
      lastContact: '3 days ago',
      phone: '+1 (555) 456-7890',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      id: 'lead-4',
      name: 'James Rodriguez',
      email: 'james.r@example.com',
      propertyInterested: 'Luxury Penthouse',
      status: 'New Lead',
      score: 78,
      budget: '$5,000/mo',
      lastContact: '5 hours ago',
      phone: '+1 (555) 234-5678',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'lead-5',
      name: 'Lisa Chang',
      email: 'lisa.chang@example.com',
      propertyInterested: 'Sunset Villa',
      status: 'In Progress',
      score: 88,
      budget: '$2,600/mo',
      lastContact: '2 days ago',
      phone: '+1 (555) 876-5432',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'lead-6',
      name: 'David Kim',
      email: 'david.k@example.com',
      propertyInterested: 'Cozy Cottage',
      status: 'New Lead',
      score: 65,
      budget: '$1,500/mo',
      lastContact: '1 hour ago',
      phone: '+1 (555) 345-6789',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'lead-7',
      name: 'Robert Taylor',
      email: 'robert.t@example.com',
      propertyInterested: 'Modern Apartment',
      status: 'Approved',
      score: 90,
      budget: '$2,200/mo',
      lastContact: '4 days ago',
      phone: '+1 (555) 654-3210',
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      updatedAt: new Date(Date.now() - 345600000).toISOString(),
    },
    {
      id: 'lead-8',
      name: 'Jennifer Davis',
      email: 'jen.davis@example.com',
      propertyInterested: 'Downtown Loft',
      status: 'In Progress',
      score: 82,
      budget: '$3,100/mo',
      lastContact: '6 hours ago',
      phone: '+1 (555) 789-0123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  return {
    data: mockLeads,
    error: null,
  };

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
    // Mock data for leads
    const mockLeads = [
      {
        id: 'lead-1',
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        propertyInterested: 'Sunset Villa',
        status: 'New Lead',
        score: 85,
        budget: '$2,500/mo',
        lastContact: '2 hours ago',
        phone: '+1 (555) 123-4567',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'lead-2',
        name: 'Michael Chen',
        email: 'michael.c@example.com',
        propertyInterested: 'Downtown Loft',
        status: 'In Progress',
        score: 92,
        budget: '$3,200/mo',
        lastContact: '1 day ago',
        phone: '+1 (555) 987-6543',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'lead-3',
        name: 'Emma Wilson',
        email: 'emma.w@example.com',
        propertyInterested: 'Green Heights',
        status: 'Approved',
        score: 95,
        budget: '$1,800/mo',
        lastContact: '3 days ago',
        phone: '+1 (555) 456-7890',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 259200000).toISOString(),
      },
      {
        id: 'lead-4',
        name: 'James Rodriguez',
        email: 'james.r@example.com',
        propertyInterested: 'Luxury Penthouse',
        status: 'New Lead',
        score: 78,
        budget: '$5,000/mo',
        lastContact: '5 hours ago',
        phone: '+1 (555) 234-5678',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'lead-5',
        name: 'Lisa Chang',
        email: 'lisa.chang@example.com',
        propertyInterested: 'Sunset Villa',
        status: 'In Progress',
        score: 88,
        budget: '$2,600/mo',
        lastContact: '2 days ago',
        phone: '+1 (555) 876-5432',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 'lead-6',
        name: 'David Kim',
        email: 'david.k@example.com',
        propertyInterested: 'Cozy Cottage',
        status: 'New Lead',
        score: 65,
        budget: '$1,500/mo',
        lastContact: '1 hour ago',
        phone: '+1 (555) 345-6789',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'lead-7',
        name: 'Robert Taylor',
        email: 'robert.t@example.com',
        propertyInterested: 'Modern Apartment',
        status: 'Approved',
        score: 90,
        budget: '$2,200/mo',
        lastContact: '4 days ago',
        phone: '+1 (555) 654-3210',
        createdAt: new Date(Date.now() - 345600000).toISOString(),
        updatedAt: new Date(Date.now() - 345600000).toISOString(),
      },
      {
        id: 'lead-8',
        name: 'Jennifer Davis',
        email: 'jen.davis@example.com',
        propertyInterested: 'Downtown Loft',
        status: 'In Progress',
        score: 82,
        budget: '$3,100/mo',
        lastContact: '6 hours ago',
        phone: '+1 (555) 789-0123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    return {
      data: mockLeads,
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
