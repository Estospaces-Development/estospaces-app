import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ApplicationsContext = createContext();

export const useApplications = () => {
  const context = useContext(ApplicationsContext);
  if (!context) {
    throw new Error('useApplications must be used within an ApplicationsProvider');
  }
  return context;
};

// Application status stages
export const APPLICATION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  DOCUMENTS_REQUESTED: 'documents_requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

// Mock data - in production, this would come from an API
const mockApplications = [
  {
    id: 'app-1',
    referenceId: 'APP-2025-001',
    propertyId: 'prop-1',
    propertyTitle: 'Modern Downtown Apartment',
    propertyAddress: '123 Main St, Downtown',
    propertyImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
    propertyType: 'apartment',
    propertyPrice: 450000,
    agentId: 'agent-1',
    agentName: 'Sarah Johnson',
    agentAgency: 'Prime Realty Group',
    agentEmail: 'sarah@primerealty.com',
    status: APPLICATION_STATUS.UNDER_REVIEW,
    submittedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    requiresAction: true,
    conversationId: 'conv-1',
    personalInfo: {
      fullName: 'Prajol Annamudu',
      email: 'viewer@estospaces.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1990-01-15',
    },
    financialInfo: {
      annualIncome: 75000,
      employmentStatus: 'employed',
      employer: 'Tech Corp',
    },
    documents: [
      {
        id: 'doc-1',
        name: 'ID_Proof.pdf',
        type: 'application/pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        url: '#',
      },
      {
        id: 'doc-2',
        name: 'Income_Statement.pdf',
        type: 'application/pdf',
        status: 'pending',
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        url: '#',
      },
    ],
    notes: 'Interested in viewing this property soon.',
  },
  {
    id: 'app-2',
    referenceId: 'APP-2025-002',
    propertyId: 'prop-2',
    propertyTitle: 'Luxury Condo with Ocean View',
    propertyAddress: '456 Ocean Drive, Beachfront',
    propertyImage: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
    propertyType: 'condo',
    propertyPrice: 750000,
    agentId: 'agent-2',
    agentName: 'Michael Chen',
    agentAgency: 'Elite Properties',
    agentEmail: 'michael@eliteproperties.com',
    status: APPLICATION_STATUS.DOCUMENTS_REQUESTED,
    submittedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    requiresAction: true,
    conversationId: 'conv-2',
    personalInfo: {
      fullName: 'Prajol Annamudu',
      email: 'viewer@estospaces.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1990-01-15',
    },
    financialInfo: {
      annualIncome: 75000,
      employmentStatus: 'employed',
      employer: 'Tech Corp',
    },
    documents: [
      {
        id: 'doc-3',
        name: 'Bank_Statement.pdf',
        type: 'application/pdf',
        status: 'rejected',
        uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        url: '#',
        rejectionReason: 'Document is not clear. Please upload a clearer version.',
      },
    ],
    notes: '',
  },
  {
    id: 'app-3',
    referenceId: 'APP-2025-003',
    propertyId: 'prop-3',
    propertyTitle: 'Spacious Family Home',
    propertyAddress: '789 Pine Street, Residential',
    propertyImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400',
    propertyType: 'house',
    propertyPrice: 320000,
    agentId: 'agent-3',
    agentName: 'Emily Rodriguez',
    agentAgency: 'City View Realty',
    agentEmail: 'emily@cityview.com',
    status: APPLICATION_STATUS.SUBMITTED,
    submittedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: null,
    requiresAction: false,
    conversationId: null,
    personalInfo: {
      fullName: 'Prajol Annamudu',
      email: 'viewer@estospaces.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1990-01-15',
    },
    financialInfo: {
      annualIncome: 75000,
      employmentStatus: 'employed',
      employer: 'Tech Corp',
    },
    documents: [],
    notes: '',
  },
];

export const ApplicationsProvider = ({ children }) => {
  const [applications, setApplications] = useState(() => {
    // Load from localStorage or use mock data
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('estospaces-applications');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return mockApplications;
        }
      }
    }
    return mockApplications;
  });

  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [filter, setFilter] = useState('all'); // all, status, propertyType
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: null, end: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Save to localStorage whenever applications change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('estospaces-applications', JSON.stringify(applications));
    }
  }, [applications]);

  // Get filtered and sorted applications
  const getFilteredApplications = useCallback(() => {
    let filtered = [...applications];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Apply property type filter
    if (propertyTypeFilter !== 'all') {
      filtered = filtered.filter((app) => app.propertyType === propertyTypeFilter);
    }

    // Apply date range filter
    if (dateRangeFilter.start) {
      filtered = filtered.filter((app) => {
        const appDate = new Date(app.submittedDate);
        return appDate >= new Date(dateRangeFilter.start);
      });
    }
    if (dateRangeFilter.end) {
      filtered = filtered.filter((app) => {
        const appDate = new Date(app.submittedDate);
        return appDate <= new Date(dateRangeFilter.end);
      });
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((app) => {
        const matchesProperty = app.propertyTitle?.toLowerCase().includes(query);
        const matchesAddress = app.propertyAddress?.toLowerCase().includes(query);
        const matchesReference = app.referenceId?.toLowerCase().includes(query);
        const matchesAgent = app.agentName?.toLowerCase().includes(query);
        return matchesProperty || matchesAddress || matchesReference || matchesAgent;
      });
    }

    // Sort by most recent activity
    return filtered.sort((a, b) => {
      return new Date(b.lastUpdated) - new Date(a.lastUpdated);
    });
  }, [applications, statusFilter, propertyTypeFilter, dateRangeFilter, searchQuery]);

  // Create a new application
  const createApplication = useCallback((propertyData, agentData) => {
    const newApplication = {
      id: `app-${Date.now()}`,
      referenceId: `APP-${new Date().getFullYear()}-${String(applications.length + 1).padStart(3, '0')}`,
      propertyId: propertyData.id,
      propertyTitle: propertyData.title,
      propertyAddress: propertyData.address,
      propertyImage: propertyData.image,
      propertyType: propertyData.type || 'apartment',
      propertyPrice: propertyData.price,
      agentId: agentData.id,
      agentName: agentData.name,
      agentAgency: agentData.agency || '',
      agentEmail: agentData.email || '',
      status: APPLICATION_STATUS.DRAFT,
      submittedDate: null,
      lastUpdated: new Date().toISOString(),
      deadline: null,
      requiresAction: false,
      conversationId: null,
      personalInfo: {},
      financialInfo: {},
      documents: [],
      notes: '',
    };

    setApplications((prev) => [newApplication, ...prev]);
    setSelectedApplicationId(newApplication.id);
    return newApplication.id;
  }, [applications.length]);

  // Update application
  const updateApplication = useCallback((applicationId, updates) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? { ...app, ...updates, lastUpdated: new Date().toISOString() }
          : app
      )
    );
  }, []);

  // Submit application
  const submitApplication = useCallback((applicationId) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              status: APPLICATION_STATUS.SUBMITTED,
              submittedDate: new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
            }
          : app
      )
    );
  }, []);

  // Withdraw application
  const withdrawApplication = useCallback((applicationId) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              status: APPLICATION_STATUS.WITHDRAWN,
              lastUpdated: new Date().toISOString(),
            }
          : app
      )
    );
  }, []);

  // Add document
  const addDocument = useCallback((applicationId, document) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === applicationId) {
          return {
            ...app,
            documents: [...app.documents, document],
            lastUpdated: new Date().toISOString(),
          };
        }
        return app;
      })
    );
  }, []);

  // Update document
  const updateDocument = useCallback((applicationId, documentId, updates) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === applicationId) {
          return {
            ...app,
            documents: app.documents.map((doc) =>
              doc.id === documentId ? { ...doc, ...updates } : doc
            ),
            lastUpdated: new Date().toISOString(),
          };
        }
        return app;
      })
    );
  }, []);

  // Delete document
  const deleteDocument = useCallback((applicationId, documentId) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === applicationId) {
          return {
            ...app,
            documents: app.documents.filter((doc) => doc.id !== documentId),
            lastUpdated: new Date().toISOString(),
          };
        }
        return app;
      })
    );
  }, []);

  // Get application by ID
  const getApplication = useCallback(
    (applicationId) => {
      return applications.find((app) => app.id === applicationId);
    },
    [applications]
  );

  // Get applications requiring action
  const getApplicationsRequiringAction = useCallback(() => {
    return applications.filter((app) => app.requiresAction && app.status !== APPLICATION_STATUS.WITHDRAWN);
  }, [applications]);

  // Get applications with deadline warnings
  const getApplicationsWithDeadlineWarnings = useCallback(() => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    return applications.filter((app) => {
      if (!app.deadline) return false;
      const deadline = new Date(app.deadline);
      return deadline <= threeDaysFromNow && deadline > now;
    });
  }, [applications]);

  const value = {
    applications: getFilteredApplications(),
    allApplications: applications,
    selectedApplicationId,
    setSelectedApplicationId,
    filter,
    setFilter,
    statusFilter,
    setStatusFilter,
    propertyTypeFilter,
    setPropertyTypeFilter,
    dateRangeFilter,
    setDateRangeFilter,
    searchQuery,
    setSearchQuery,
    isLoading,
    createApplication,
    updateApplication,
    submitApplication,
    withdrawApplication,
    addDocument,
    updateDocument,
    deleteDocument,
    getApplication,
    getApplicationsRequiringAction,
    getApplicationsWithDeadlineWarnings,
    APPLICATION_STATUS,
  };

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>;
};

