import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryCard from '../components/ui/SummaryCard';
import BackButton from '../components/ui/BackButton';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileCheck, 
  Plus, 
  Filter, 
  Search,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  X,
  Download,
  Share2,
  FileDown,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';

interface Application {
  id: string;
  name: string;
  email: string;
  phone?: string;
  propertyInterested: string;
  propertyId?: string;
  status: string;
  score: number;
  budget: string;
  lastContact: string;
  applicationData?: any;
}

const Application = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newApplication, setNewApplication] = useState({
    name: '',
    email: '',
    propertyInterested: '',
    budget: '',
    notes: '',
  });

  const [applications, setApplications] = useState<Application[]>([]);

  // Fetch applications from Supabase
  const fetchApplications = useCallback(async () => {
    if (!isSupabaseAvailable()) {
      // Use mock data when Supabase is not available
      const mockApplications: Application[] = [
        {
          id: 'mock-1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+44 7700 900123',
          propertyInterested: 'Modern 2BR Flat in Canary Wharf',
          status: 'New Application',
          score: 92,
          budget: '£2,200/mo',
          lastContact: '2 hours ago',
        },
        {
          id: 'mock-2',
          name: 'Michael Chen',
          email: 'michael.chen@email.com',
          phone: '+44 7700 900456',
          propertyInterested: 'Luxury 3BR Apartment in Shoreditch',
          status: 'In Review',
          score: 88,
          budget: '£3,500/mo',
          lastContact: '1 day ago',
        },
        {
          id: 'mock-3',
          name: 'Emma Williams',
          email: 'emma.williams@email.com',
          phone: '+44 7700 900789',
          propertyInterested: 'Spacious Studio in Camden',
          status: 'Appointment Booked',
          score: 85,
          budget: '£1,800/mo',
          lastContact: '3 hours ago',
        },
        {
          id: 'mock-4',
          name: 'David Brown',
          email: 'david.brown@email.com',
          phone: '+44 7700 900321',
          propertyInterested: 'Family Home in Islington',
          status: 'Approved',
          score: 95,
          budget: '£4,200/mo',
          lastContact: '5 days ago',
        },
        {
          id: 'mock-5',
          name: 'Sophie Anderson',
          email: 'sophie.anderson@email.com',
          phone: '+44 7700 900654',
          propertyInterested: 'Penthouse in Mayfair',
          status: 'Viewing Scheduled',
          score: 90,
          budget: '£6,500/mo',
          lastContact: '1 day ago',
        },
        {
          id: 'mock-6',
          name: 'James Taylor',
          email: 'james.taylor@email.com',
          phone: '+44 7700 900987',
          propertyInterested: '2BR Flat in Notting Hill',
          status: 'Documents Required',
          score: 78,
          budget: '£2,800/mo',
          lastContact: '2 days ago',
        },
        {
          id: 'mock-7',
          name: 'Olivia Martinez',
          email: 'olivia.martinez@email.com',
          phone: '+44 7700 900147',
          propertyInterested: '1BR Apartment in Kensington',
          status: 'New Application',
          score: 82,
          budget: '£2,100/mo',
          lastContact: '4 hours ago',
        },
        {
          id: 'mock-8',
          name: 'Robert Wilson',
          email: 'robert.wilson@email.com',
          phone: '+44 7700 900258',
          propertyInterested: '3BR House in Hampstead',
          status: 'Verification',
          score: 87,
          budget: '£5,200/mo',
          lastContact: '3 days ago',
        },
        {
          id: 'mock-9',
          name: 'Isabella Garcia',
          email: 'isabella.garcia@email.com',
          phone: '+44 7700 900369',
          propertyInterested: 'Studio in Covent Garden',
          status: 'In Review',
          score: 80,
          budget: '£1,950/mo',
          lastContact: '1 day ago',
        },
        {
          id: 'mock-10',
          name: 'Thomas Lee',
          email: 'thomas.lee@email.com',
          phone: '+44 7700 900741',
          propertyInterested: '2BR Flat in Greenwich',
          status: 'Approved',
          score: 91,
          budget: '£2,400/mo',
          lastContact: '6 days ago',
        },
        {
          id: 'mock-11',
          name: 'Charlotte White',
          email: 'charlotte.white@email.com',
          phone: '+44 7700 900852',
          propertyInterested: 'Luxury 4BR in Chelsea',
          status: 'Viewing Completed',
          score: 94,
          budget: '£7,800/mo',
          lastContact: '2 days ago',
        },
        {
          id: 'mock-12',
          name: 'Daniel Harris',
          email: 'daniel.harris@email.com',
          phone: '+44 7700 900963',
          propertyInterested: '1BR Apartment in Clapham',
          status: 'New Application',
          score: 76,
          budget: '£1,700/mo',
          lastContact: 'Just now',
        },
      ];
      setApplications(mockApplications);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch all applications (for managers)
      const { data, error } = await supabase
        .from('applied_properties')
        .select(`
          id,
          user_id,
          property_id,
          status,
          application_data,
          created_at,
          updated_at,
          properties (
            id,
            title,
            price,
            listing_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to match the Application interface
      const transformedApps: Application[] = (data || []).map((item: any) => {
        const appData = item.application_data || {};
        const personalInfo = appData.personal_info || {};
        const property = item.properties || {};
        
        // Calculate time since last update
        const lastUpdate = new Date(item.updated_at || item.created_at);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
        let lastContact = 'Just now';
        if (diffDays === 1) lastContact = '1 day ago';
        else if (diffDays > 1) lastContact = `${diffDays} days ago`;
        else if (diffDays === 0) {
          const diffHours = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60));
          if (diffHours > 0) lastContact = `${diffHours} hours ago`;
        }

        // Map status to display format
        const statusMap: Record<string, string> = {
          'pending': 'New Application',
          'submitted': 'New Application',
          'appointment_booked': 'Appointment Booked',
          'viewing_scheduled': 'Viewing Scheduled',
          'viewing_completed': 'Viewing Completed',
          'under_review': 'In Review',
          'documents_requested': 'Documents Required',
          'verification_in_progress': 'Verification',
          'approved': 'Approved',
          'completed': 'Completed',
          'rejected': 'Rejected',
          'withdrawn': 'Withdrawn',
        };

        // Calculate score based on completeness of application
        let score = 60;
        if (personalInfo.full_name) score += 10;
        if (personalInfo.email) score += 10;
        if (personalInfo.phone) score += 5;
        if (appData.financial_info?.annual_income) score += 10;
        if (appData.financial_info?.employment_status === 'employed') score += 5;

        return {
          id: item.id,
          name: personalInfo.full_name || 'Unknown Applicant',
          email: personalInfo.email || 'No email provided',
          phone: personalInfo.phone || '',
          propertyInterested: property.title || appData.property_title || 'Property',
          propertyId: item.property_id,
          status: statusMap[item.status] || 'New Application',
          score: Math.min(score, 100),
          budget: property.price 
            ? `£${property.price.toLocaleString()}${property.listing_type === 'rent' ? '/mo' : ''}`
            : 'Not specified',
          lastContact,
          applicationData: appData,
        };
      });

      // Always include mock data in Applications Overview
      // Merge mock data with real data, or use mock data if no real data exists
      const mockApplications: Application[] = [
        {
          id: 'mock-1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+44 7700 900123',
          propertyInterested: 'Modern 2BR Flat in Canary Wharf',
          status: 'New Application',
          score: 92,
          budget: '£2,200/mo',
          lastContact: '2 hours ago',
        },
        {
          id: 'mock-2',
          name: 'Michael Chen',
          email: 'michael.chen@email.com',
          phone: '+44 7700 900456',
          propertyInterested: 'Luxury 3BR Apartment in Shoreditch',
          status: 'In Review',
          score: 88,
          budget: '£3,500/mo',
          lastContact: '1 day ago',
        },
        {
          id: 'mock-3',
          name: 'Emma Williams',
          email: 'emma.williams@email.com',
          phone: '+44 7700 900789',
          propertyInterested: 'Spacious Studio in Camden',
          status: 'Appointment Booked',
          score: 85,
          budget: '£1,800/mo',
          lastContact: '3 hours ago',
        },
        {
          id: 'mock-4',
          name: 'David Brown',
          email: 'david.brown@email.com',
          phone: '+44 7700 900321',
          propertyInterested: 'Family Home in Islington',
          status: 'Approved',
          score: 95,
          budget: '£4,200/mo',
          lastContact: '5 days ago',
        },
        {
          id: 'mock-5',
          name: 'Sophie Anderson',
          email: 'sophie.anderson@email.com',
          phone: '+44 7700 900654',
          propertyInterested: 'Penthouse in Mayfair',
          status: 'Viewing Scheduled',
          score: 90,
          budget: '£6,500/mo',
          lastContact: '1 day ago',
        },
        {
          id: 'mock-6',
          name: 'James Taylor',
          email: 'james.taylor@email.com',
          phone: '+44 7700 900987',
          propertyInterested: '2BR Flat in Notting Hill',
          status: 'Documents Required',
          score: 78,
          budget: '£2,800/mo',
          lastContact: '2 days ago',
        },
        {
          id: 'mock-7',
          name: 'Olivia Martinez',
          email: 'olivia.martinez@email.com',
          phone: '+44 7700 900147',
          propertyInterested: '1BR Apartment in Kensington',
          status: 'New Application',
          score: 82,
          budget: '£2,100/mo',
          lastContact: '4 hours ago',
        },
        {
          id: 'mock-8',
          name: 'Robert Wilson',
          email: 'robert.wilson@email.com',
          phone: '+44 7700 900258',
          propertyInterested: '3BR House in Hampstead',
          status: 'Verification',
          score: 87,
          budget: '£5,200/mo',
          lastContact: '3 days ago',
        },
        {
          id: 'mock-9',
          name: 'Isabella Garcia',
          email: 'isabella.garcia@email.com',
          phone: '+44 7700 900369',
          propertyInterested: 'Studio in Covent Garden',
          status: 'In Review',
          score: 80,
          budget: '£1,950/mo',
          lastContact: '1 day ago',
        },
        {
          id: 'mock-10',
          name: 'Thomas Lee',
          email: 'thomas.lee@email.com',
          phone: '+44 7700 900741',
          propertyInterested: '2BR Flat in Greenwich',
          status: 'Approved',
          score: 91,
          budget: '£2,400/mo',
          lastContact: '6 days ago',
        },
        {
          id: 'mock-11',
          name: 'Charlotte White',
          email: 'charlotte.white@email.com',
          phone: '+44 7700 900852',
          propertyInterested: 'Luxury 4BR in Chelsea',
          status: 'Viewing Completed',
          score: 94,
          budget: '£7,800/mo',
          lastContact: '2 days ago',
        },
        {
          id: 'mock-12',
          name: 'Daniel Harris',
          email: 'daniel.harris@email.com',
          phone: '+44 7700 900963',
          propertyInterested: '1BR Apartment in Clapham',
          status: 'New Application',
          score: 76,
          budget: '£1,700/mo',
          lastContact: 'Just now',
        },
        {
          id: 'mock-13',
          name: 'Amelia Thompson',
          email: 'amelia.thompson@email.com',
          phone: '+44 7700 901147',
          propertyInterested: '2BR Apartment in Battersea',
          status: 'In Review',
          score: 89,
          budget: '£2,600/mo',
          lastContact: '5 hours ago',
        },
        {
          id: 'mock-14',
          name: 'Lucas Rodriguez',
          email: 'lucas.rodriguez@email.com',
          phone: '+44 7700 901258',
          propertyInterested: '3BR Flat in King\'s Cross',
          status: 'Appointment Booked',
          score: 83,
          budget: '£3,200/mo',
          lastContact: '1 day ago',
        },
        {
          id: 'mock-15',
          name: 'Grace Mitchell',
          email: 'grace.mitchell@email.com',
          phone: '+44 7700 901369',
          propertyInterested: 'Luxury Studio in Soho',
          status: 'Approved',
          score: 93,
          budget: '£2,300/mo',
          lastContact: '4 days ago',
        },
      ];
      
      // Merge real data with mock data, prioritizing real data
      // Filter out any mock entries that might conflict with real data IDs
      const realAppIds = new Set(transformedApps.map(app => app.id));
      const filteredMockApps = mockApplications.filter(mock => !realAppIds.has(mock.id));
      
      // Combine: real data first, then mock data
      const allApplications = [...transformedApps, ...filteredMockApps];
      
      // If we have real data, show it with some mock data
      // If no real data, show all mock data
      setApplications(allApplications.length > 0 ? allApplications : mockApplications);
    } catch (err) {
      console.error('Error fetching applications:', err);
      // Use mock data on error as well
      const mockApplications: Application[] = [
        {
          id: 'mock-1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+44 7700 900123',
          propertyInterested: 'Modern 2BR Flat in Canary Wharf',
          status: 'New Application',
          score: 92,
          budget: '£2,200/mo',
          lastContact: '2 hours ago',
        },
        {
          id: 'mock-2',
          name: 'Michael Chen',
          email: 'michael.chen@email.com',
          phone: '+44 7700 900456',
          propertyInterested: 'Luxury 3BR Apartment in Shoreditch',
          status: 'In Review',
          score: 88,
          budget: '£3,500/mo',
          lastContact: '1 day ago',
        },
        {
          id: 'mock-3',
          name: 'Emma Williams',
          email: 'emma.williams@email.com',
          phone: '+44 7700 900789',
          propertyInterested: 'Spacious Studio in Camden',
          status: 'Appointment Booked',
          score: 85,
          budget: '£1,800/mo',
          lastContact: '3 hours ago',
        },
        {
          id: 'mock-4',
          name: 'David Brown',
          email: 'david.brown@email.com',
          phone: '+44 7700 900321',
          propertyInterested: 'Family Home in Islington',
          status: 'Approved',
          score: 95,
          budget: '£4,200/mo',
          lastContact: '5 days ago',
        },
        {
          id: 'mock-5',
          name: 'Sophie Anderson',
          email: 'sophie.anderson@email.com',
          phone: '+44 7700 900654',
          propertyInterested: 'Penthouse in Mayfair',
          status: 'Viewing Scheduled',
          score: 90,
          budget: '£6,500/mo',
          lastContact: '1 day ago',
        },
        {
          id: 'mock-6',
          name: 'James Taylor',
          email: 'james.taylor@email.com',
          phone: '+44 7700 900987',
          propertyInterested: '2BR Flat in Notting Hill',
          status: 'Documents Required',
          score: 78,
          budget: '£2,800/mo',
          lastContact: '2 days ago',
        },
        {
          id: 'mock-7',
          name: 'Olivia Martinez',
          email: 'olivia.martinez@email.com',
          phone: '+44 7700 900147',
          propertyInterested: '1BR Apartment in Kensington',
          status: 'New Application',
          score: 82,
          budget: '£2,100/mo',
          lastContact: '4 hours ago',
        },
        {
          id: 'mock-8',
          name: 'Robert Wilson',
          email: 'robert.wilson@email.com',
          phone: '+44 7700 900258',
          propertyInterested: '3BR House in Hampstead',
          status: 'Verification',
          score: 87,
          budget: '£5,200/mo',
          lastContact: '3 days ago',
        },
      ];
      setApplications(mockApplications);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.propertyInterested.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    const matchesScore = scoreFilter === 'all' || 
      (scoreFilter === 'high' && app.score >= 90) ||
      (scoreFilter === 'medium' && app.score >= 70 && app.score < 90) ||
      (scoreFilter === 'low' && app.score < 70);
    
    return matchesSearch && matchesStatus && matchesScore;
  });

  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault();
    const newApp: Application = {
      id: Date.now().toString(),
      name: newApplication.name,
      email: newApplication.email,
      propertyInterested: newApplication.propertyInterested,
      status: 'New Application',
      score: Math.floor(Math.random() * 30) + 70,
      budget: newApplication.budget || '$0/mo',
      lastContact: 'Just now',
    };
    setApplications([...applications, newApp]);
    setShowAddModal(false);
    setNewApplication({ name: '', email: '', propertyInterested: '', budget: '', notes: '' });
  };

  const handleEditApplication = (app: Application) => {
    setEditingApplication(app);
    setNewApplication({
      name: app.name,
      email: app.email,
      propertyInterested: app.propertyInterested,
      budget: app.budget,
      notes: '',
    });
    setShowEditModal(true);
  };

  const handleUpdateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingApplication) {
      setApplications(applications.map(app => 
        app.id === editingApplication.id 
          ? { ...app, name: newApplication.name, email: newApplication.email, propertyInterested: newApplication.propertyInterested, budget: newApplication.budget }
          : app
      ));
      setShowEditModal(false);
      setEditingApplication(null);
      setNewApplication({ name: '', email: '', propertyInterested: '', budget: '', notes: '' });
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!isSupabaseAvailable()) {
    setApplications(applications.filter(app => app.id !== id));
    setShowDeleteConfirm(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('applied_properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setApplications(applications.filter(app => app.id !== id));
    } catch (err) {
      console.error('Error deleting application:', err);
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    // Map display status back to DB status
    const statusMap: Record<string, string> = {
      'New Application': 'pending',
      'Appointment Booked': 'appointment_booked',
      'Viewing Scheduled': 'viewing_scheduled',
      'Viewing Completed': 'viewing_completed',
      'In Review': 'under_review',
      'Documents Required': 'documents_requested',
      'Verification': 'verification_in_progress',
      'Approved': 'approved',
      'Rejected': 'rejected',
      'Withdrawn': 'withdrawn',
      'Completed': 'completed'
    };

    const dbStatus = statusMap[newStatus] || 'pending';

    if (!isSupabaseAvailable()) {
      setApplications(applications.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      ));
      return;
    }

    try {
      // First get the application to get the user_id
      const application = applications.find(app => app.id === id);
      
      const { error } = await supabase
        .from('applied_properties')
        .update({ status: dbStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      setApplications(applications.map(app => 
        app.id === id ? { ...app, status: newStatus, lastContact: 'Just now' } : app
      ));

      // Create notification for the user based on status change
      if (application) {
        // Get user_id from the original application data
        const { data: appData } = await supabase
          .from('applied_properties')
          .select('user_id, application_data')
          .eq('id', id)
          .single();

        if (appData?.user_id) {
          let notificationType = 'application_update';
          let title = '';
          let message = '';

          const propertyTitle = application.propertyInterested || 'your property';

          switch (dbStatus) {
            case 'approved':
              notificationType = 'appointment_approved';
              title = '🎉 Application Approved!';
              message = `Great news! Your application for "${propertyTitle}" has been approved. The agent will contact you soon with next steps.`;
              break;
            case 'rejected':
              notificationType = 'appointment_rejected';
              title = 'Application Update';
              message = `Your application for "${propertyTitle}" was not approved at this time. Please contact the agent for more details.`;
              break;
            case 'viewing_scheduled':
              notificationType = 'application_update';
              title = '📅 Viewing Scheduled';
              message = `Your viewing for "${propertyTitle}" has been confirmed. Check your email for details.`;
              break;
            case 'viewing_completed':
              notificationType = 'application_update';
              title = '✅ Viewing Completed';
              message = `Your viewing for "${propertyTitle}" is complete. The agent will follow up with next steps.`;
              break;
            case 'documents_requested':
              notificationType = 'application_update';
              title = '📄 Documents Required';
              message = `Please upload the required documents for your application for "${propertyTitle}".`;
              break;
            case 'verification_in_progress':
              notificationType = 'application_update';
              title = '🔍 Verification In Progress';
              message = `Your documents for "${propertyTitle}" are being verified. We'll notify you once complete.`;
              break;
            case 'completed':
              notificationType = 'application_update';
              title = '🏠 Application Complete!';
              message = `Congratulations! Your application for "${propertyTitle}" has been completed successfully.`;
              break;
            default:
              // Don't send notification for other statuses
              return;
          }

          // Insert notification for the user
          await supabase
            .from('notifications')
            .insert({
              user_id: appData.user_id,
              type: notificationType,
              title,
              message,
              data: { application_id: id, property_title: propertyTitle, new_status: dbStatus }
            });
        }
      }
    } catch (err) {
      console.error('Error updating application status:', err);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    const appsToExport = selectedApplications.length > 0
      ? applications.filter(app => selectedApplications.includes(app.id))
      : filteredApplications;

    const exportData = {
      title: 'Applications Export',
      headers: ['Name', 'Email', 'Property Interested', 'Status', 'Score', 'Budget', 'Last Contact'],
      rows: appsToExport.map(app => [
        app.name,
        app.email,
        app.propertyInterested,
        app.status,
        app.score,
        app.budget,
        app.lastContact,
      ]),
    };

    if (format === 'pdf') {
      exportToPDF(exportData, `applications_${new Date().toISOString().split('T')[0]}`);
    } else {
      exportToExcel(exportData, `applications_${new Date().toISOString().split('T')[0]}`);
    }
    setShowExportMenu(false);
    setSelectedApplications([]);
  };

  const handleShare = async (app: Application) => {
    const shareData = {
      title: `Application: ${app.name}`,
      text: `Application details for ${app.name}\nEmail: ${app.email}\nProperty: ${app.propertyInterested}\nStatus: ${app.status}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.text);
      alert('Application details copied to clipboard!');
    }
  };

  const toggleSelectApplication = (id: string) => {
    setSelectedApplications(prev =>
      prev.includes(id) ? prev.filter(appId => appId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map(app => app.id));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div>
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Application</h1>
        <p className="text-gray-600">Review and manage client applications</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryCard
          title="New Applications"
          value={1}
          icon={FileText}
          iconColor="bg-blue-500"
        />
        <SummaryCard
          title="In Review"
          value={1}
          icon={Clock}
          iconColor="bg-yellow-500"
        />
        <SummaryCard
          title="Approved"
          value={1}
          icon={CheckCircle}
          iconColor="bg-green-500"
        />
        <SummaryCard
          title="Rejected"
          value={1}
          icon={XCircle}
          iconColor="bg-red-500"
        />
        <SummaryCard
          title="Total"
          value={0}
          icon={FileCheck}
          iconColor="bg-purple-500"
        />
      </div>

      {/* Search and Actions */}
      <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Applications"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">More Filters</span>
            </button>
            {showFilters && (
              <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-10 min-w-[250px]">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="New Application">New Application</option>
                      <option value="In Review">In Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Score</label>
                    <select
                      value={scoreFilter}
                      onChange={(e) => setScoreFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                    >
                      <option value="all">All Scores</option>
                      <option value="high">High (90+)</option>
                      <option value="medium">Medium (70-89)</option>
                      <option value="low">Low (&lt;70)</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setScoreFilter('all');
                      setShowFilters(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
              {selectedApplications.length > 0 && (
                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                  {selectedApplications.length}
                </span>
              )}
            </button>
            {showExportMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[180px]">
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  Export as PDF
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export as Excel
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add New Application</span>
          </button>
        </div>
      </div>

      {/* Applications Overview Table */}
      <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Applications Overview</h2>
          {selectedApplications.length > 0 && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedApplications.length} selected
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Leads</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Property Interested</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-800">
              {filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(app.id)}
                      onChange={() => toggleSelectApplication(app.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{app.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{app.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{app.propertyInterested}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={app.status}
                      onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                      className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${
                        app.status === 'New Application' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                        app.status === 'Appointment Booked' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' :
                        app.status === 'Viewing Scheduled' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400' :
                        app.status === 'Viewing Completed' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-400' :
                        app.status === 'In Review' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                        app.status === 'Verification' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                        app.status === 'Approved' || app.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                        app.status === 'Rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}
                    >
                      <option value="New Application">New Application</option>
                      <option value="Appointment Booked">Appointment Booked</option>
                      <option value="Viewing Scheduled">Viewing Scheduled</option>
                      <option value="Viewing Completed">Viewing Completed</option>
                      <option value="In Review">In Review</option>
                      <option value="Documents Required">Documents Required</option>
                      <option value="Verification">Verification in Progress</option>
                      <option value="Approved">Approved</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Withdrawn">Withdrawn</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{app.score}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{app.budget}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{app.lastContact}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowViewModal(app.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditApplication(app)}
                        className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.location.href = `mailto:${app.email}`}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        title="Email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.location.href = `tel:${app.email}`}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        title="Call"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare(app)}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(app.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Add New Application</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewApplication({ name: '', email: '', propertyInterested: '', budget: '', notes: '' });
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleAddApplication}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Applicant Name *
                </label>
                <input
                  type="text"
                  value={newApplication.name}
                  onChange={(e) => setNewApplication({ ...newApplication, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newApplication.email}
                  onChange={(e) => setNewApplication({ ...newApplication, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Property Interested *
                </label>
                <input
                  type="text"
                  value={newApplication.propertyInterested}
                  onChange={(e) => setNewApplication({ ...newApplication, propertyInterested: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget
                </label>
                <input
                  type="text"
                  value={newApplication.budget}
                  onChange={(e) => setNewApplication({ ...newApplication, budget: e.target.value })}
                  placeholder="$0/mo"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={newApplication.notes}
                  onChange={(e) => setNewApplication({ ...newApplication, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewApplication({ name: '', email: '', propertyInterested: '', budget: '', notes: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                >
                  Add Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      {showEditModal && editingApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Edit Application</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingApplication(null);
                  setNewApplication({ name: '', email: '', propertyInterested: '', budget: '', notes: '' });
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateApplication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Applicant Name *
                </label>
                <input
                  type="text"
                  value={newApplication.name}
                  onChange={(e) => setNewApplication({ ...newApplication, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newApplication.email}
                  onChange={(e) => setNewApplication({ ...newApplication, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Property Interested *
                </label>
                <input
                  type="text"
                  value={newApplication.propertyInterested}
                  onChange={(e) => setNewApplication({ ...newApplication, propertyInterested: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget
                </label>
                <input
                  type="text"
                  value={newApplication.budget}
                  onChange={(e) => setNewApplication({ ...newApplication, budget: e.target.value })}
                  placeholder="$0/mo"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingApplication(null);
                    setNewApplication({ name: '', email: '', propertyInterested: '', budget: '', notes: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                >
                  Update Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Application Modal */}
      {showViewModal && (() => {
        const app = applications.find(a => a.id === showViewModal);
        if (!app) return null;
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Application Details</h3>
                <button
                  onClick={() => setShowViewModal(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <p className="text-sm text-gray-900 dark:text-white">{app.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <p className="text-sm text-gray-900 dark:text-white">{app.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Interested</label>
                  <p className="text-sm text-gray-900 dark:text-white">{app.propertyInterested}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    app.status === 'New Application' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                    app.status === 'In Review' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                    app.status === 'Approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                  }`}>
                    {app.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Score</label>
                  <p className="text-sm text-gray-900 dark:text-white">{app.score}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget</label>
                  <p className="text-sm text-gray-900 dark:text-white">{app.budget}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Contact</label>
                  <p className="text-sm text-gray-900 dark:text-white">{app.lastContact}</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Delete Application</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this application? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteApplication(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Application;

