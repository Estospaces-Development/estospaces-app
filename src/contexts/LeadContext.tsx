import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  propertyInterested: string;
  status: string;
  score: number;
  budget: string;
  lastContact: string;
  createdAt: string;
  updatedAt: string;
}

interface LeadContextType {
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Lead>;
  updateLead: (id: string, lead: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  getLead: (id: string) => Lead | undefined;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within LeadProvider');
  }
  return context;
};

export const LeadProvider = ({ children }: { children: ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>([]);

  // Load leads from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('leads');
    if (stored) {
      try {
        setLeads(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading leads:', error);
        // Initialize with default leads if parsing fails
        const defaultLeads: Lead[] = [
          {
            id: '1',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@email.com',
            phone: '+1 (555) 123-4567',
            propertyInterested: 'Modern Downtown Apartment',
            status: 'New Lead',
            score: 85,
            budget: '$2,500/mo',
            lastContact: '2 days ago',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Michel Chen',
            email: 'michel.chen@email.com',
            phone: '+1 (555) 234-5678',
            propertyInterested: 'Luxury Condo with City View',
            status: 'In Progress',
            score: 92,
            budget: '$3,200/mo',
            lastContact: '1 day ago',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Emily Rodriguez',
            email: 'emily.rodriguez@email.com',
            phone: '+1 (555) 345-6789',
            propertyInterested: 'Spacious Penthouse',
            status: 'Approved',
            score: 78,
            budget: '$4,500/mo',
            lastContact: '3 days ago',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setLeads(defaultLeads);
        localStorage.setItem('leads', JSON.stringify(defaultLeads));
      }
    } else {
      // Initialize with default leads if no stored data
      const defaultLeads: Lead[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+1 (555) 123-4567',
          propertyInterested: 'Modern Downtown Apartment',
          status: 'New Lead',
          score: 85,
          budget: '$2,500/mo',
          lastContact: '2 days ago',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Michel Chen',
          email: 'michel.chen@email.com',
          phone: '+1 (555) 234-5678',
          propertyInterested: 'Luxury Condo with City View',
          status: 'In Progress',
          score: 92,
          budget: '$3,200/mo',
          lastContact: '1 day ago',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Emily Rodriguez',
          email: 'emily.rodriguez@email.com',
          phone: '+1 (555) 345-6789',
          propertyInterested: 'Spacious Penthouse',
          status: 'Approved',
          score: 78,
          budget: '$4,500/mo',
          lastContact: '3 days ago',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setLeads(defaultLeads);
      localStorage.setItem('leads', JSON.stringify(defaultLeads));
    }
  }, []);

  // Save leads to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('leads', JSON.stringify(leads));
  }, [leads]);

  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> => {
    const newLead: Lead = {
      ...leadData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLeads((prev) => [...prev, newLead]);

    // Notify managers and admins about new lead
    try {
      const { notifyManagersNewLead } = await import('../services/notificationsService');
      await notifyManagersNewLead(
        leadData.name,
        leadData.email,
        leadData.propertyInterested,
        newLead.id
      );
    } catch (notifyErr) {
      console.log('Could not send lead notification:', notifyErr);
    }

    return newLead;
  };

  const updateLead = (id: string, leadData: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? { ...lead, ...leadData, updatedAt: new Date().toISOString() }
          : lead
      )
    );
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  };

  const getLead = (id: string): Lead | undefined => {
    return leads.find((lead) => lead.id === id);
  };

  return (
    <LeadContext.Provider
      value={{
        leads,
        addLead,
        updateLead,
        deleteLead,
        getLead,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};

