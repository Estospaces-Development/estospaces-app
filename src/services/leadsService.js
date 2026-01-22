/**
 * Leads Service
 * Returns mock data for leads (no backend API calls)
 */

/**
 * Fetch leads (conversations) for the logged-in manager
 */
export const getLeads = async () => {
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
};

/**
 * Fetch a single lead by ID
 */
export const getLeadById = async (leadId) => {
  const leads = (await getLeads()).data;
  const lead = leads.find(l => l.id === leadId);

  if (!lead) {
    return { error: 'Lead not found', data: null };
  }

  return { data: { ...lead, messages: [] }, error: null };
};

/**
 * Update lead status
 */
export const updateLeadStatus = async (leadId, status) => {
  // In mock mode, just return success
  return { data: { id: leadId, status }, error: null };
};

