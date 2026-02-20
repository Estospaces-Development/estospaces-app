import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import SummaryCard from '../components/ui/SummaryCard';
import BackButton from '../components/ui/BackButton';
import Calendar from '../components/ui/Calendar';
import AddAppointmentModal from '../components/ui/AddAppointmentModal';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  CalendarCheck,
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Loader2,
} from 'lucide-react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Appointment {
  id: string;
  clientName: string;
  date: string;
  time: string;
  description: string;
  status: string;
  property?: string;
  phone?: string;
  email?: string;
  propertyId?: string;
  userId?: string;
}

const Appointment = () => {
  const navigate = useNavigate();
  const { user, getRole } = useAuth();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch appointments from database
  const fetchAppointments = useCallback(async () => {
    // Check for mock user or if Supabase is unavailable
    if (!isSupabaseAvailable() || user?.id?.startsWith('mock-')) {
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          clientName: 'Sarah Johnson',
          date: '2025-01-28',
          time: '14:00',
          description: 'First viewing - Modern Downtown Apartment',
          status: 'Confirmed',
          property: 'Modern Downtown Apartment',
          phone: '+1 (555) 123-4567',
          email: 'sarah.j@example.com'
        },
        {
          id: '2',
          clientName: 'Michael Chen',
          date: '2025-01-29',
          time: '10:30',
          description: 'Second viewing - Luxury Condo',
          status: 'Pending',
          property: 'Luxury Condo with City View',
          phone: '+1 (555) 987-6543',
          email: 'michael.c@example.com'
        },
        {
          id: '3',
          clientName: 'Emily Wilson',
          date: '2025-01-25',
          time: '16:00',
          description: 'Initial consultation',
          status: 'Completed',
          property: 'Spacious Penthouse',
          phone: '+1 (555) 456-7890',
          email: 'emily.w@example.com'
        },
        {
          id: '4',
          clientName: 'David Brown',
          date: '2025-02-01',
          time: '11:00',
          description: 'Follow-up viewing',
          status: 'Cancelled',
          property: 'Suburban Family Home',
          phone: '+1 (555) 234-5678',
          email: 'david.b@example.com'
        },
        {
          id: '5',
          clientName: 'Jessica Taylor',
          date: '2025-02-05',
          time: '15:30',
          description: 'Contract signing',
          status: 'Confirmed',
          property: 'Modern Downtown Apartment',
          phone: '+1 (555) 345-6789',
          email: 'jessica.t@example.com'
        }
      ];

      // Simulate a small network delay for realism, but much faster than timeout
      setTimeout(() => {
        setAppointments(mockAppointments);
        setLoading(false);
      }, 300);
      return;
    }

    if (!user) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const role = getRole();
      const isManagerOrAdmin = role === 'manager' || role === 'admin';

      // Build query - managers/admins see all, users see only their own
      let query = supabase
        .from('viewings')
        .select(`
          id,
          user_id,
          property_id,
          viewing_date,
          viewing_time,
          status,
          notes,
          created_at,
          properties (
            id,
            title,
            address_line_1,
            city,
            postcode
          ),
          profiles:user_id (
            full_name,
            email,
            phone
          )
        `)
        .order('viewing_date', { ascending: true });

      // If not manager/admin, filter by user_id
      if (!isManagerOrAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching appointments:', error);
        setAppointments([]);
        return;
      }

      // Transform data to match Appointment interface
      const transformedAppointments: Appointment[] = (data || []).map((item: any) => {
        const property = item.properties || {};
        const userProfile = item.profiles || {};
        const propertyAddress = property.address_line_1
          ? `${property.address_line_1}, ${property.city || ''} ${property.postcode || ''}`.trim()
          : property.title || 'Property Location';

        return {
          id: item.id,
          clientName: userProfile.full_name || userProfile.email?.split('@')[0] || 'Client',
          date: item.viewing_date,
          time: item.viewing_time || 'TBD',
          description: `Property viewing - ${property.title || 'Property'}`,
          status: item.status === 'pending' ? 'Pending' :
            item.status === 'confirmed' ? 'Confirmed' :
              item.status === 'completed' ? 'Completed' :
                item.status === 'cancelled' ? 'Cancelled' : 'Pending',
          property: propertyAddress,
          phone: userProfile.phone || '',
          email: userProfile.email || '',
          propertyId: item.property_id,
          userId: item.user_id,
        };
      });

      setAppointments(transformedAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [user, getRole]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleAddAppointment = (appointmentData: Omit<Appointment, 'id'>) => {
    if (editingAppointment) {
      // Update existing appointment
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === editingAppointment.id
            ? { ...appointmentData, id: editingAppointment.id }
            : apt
        )
      );
      setEditingAppointment(null);
    } else {
      // Add new appointment
      const newAppointment: Appointment = {
        ...appointmentData,
        id: Date.now().toString(),
      };
      setAppointments((prev) => [...prev, newAppointment]);
    }
    setIsAddModalOpen(false);
    setSelectedDate(undefined);
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsAddModalOpen(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsAddModalOpen(true);
  };

  const handleEditClick = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsAddModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Appointment</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage client appointments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryCard
          title="New Appointments"
          value={appointments.filter(a => a.status === 'Pending').length}
          icon={CalendarIcon}
          iconColor="bg-blue-500"
        />
        <SummaryCard
          title="Confirmed"
          value={appointments.filter(a => a.status === 'Confirmed').length}
          icon={CheckCircle}
          iconColor="bg-green-500"
        />
        <SummaryCard
          title="Pending"
          value={appointments.filter(a => a.status === 'Pending').length}
          icon={Clock}
          iconColor="bg-yellow-500"
        />
        <SummaryCard
          title="Completed"
          value={appointments.filter(a => a.status === 'Completed').length}
          icon={CalendarCheck}
          iconColor="bg-purple-500"
        />
        <SummaryCard
          title="Cancelled"
          value={appointments.filter(a => a.status === 'Cancelled').length}
          icon={XCircle}
          iconColor="bg-red-500"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${viewMode === 'calendar'
            ? 'bg-primary text-white border-primary'
            : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Calendar</span>
        </button>
        <button
          onClick={() => {
            setEditingAppointment(null);
            setSelectedDate(undefined);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add New Appointment</span>
        </button>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Calendar
          appointments={appointments}
          onDateClick={handleDateClick}
          onAppointmentClick={handleAppointmentClick}
        />
      )}

      {/* Appointments List View */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Appointments ({appointments.length})</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No appointments scheduled</p>
                <button
                  onClick={() => {
                    setEditingAppointment(null);
                    setSelectedDate(undefined);
                    setIsAddModalOpen(true);
                  }}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium"
                >
                  Add Your First Appointment
                </button>
              </div>
            ) : (
              appointments.map((appointment) => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <CalendarIcon className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{appointment.clientName}</h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${appointment.status === 'Confirmed'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                : appointment.status === 'Pending'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                                  : appointment.status === 'Completed'
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                }`}
                            >
                              {appointment.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{appointment.description}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              <span>{formatDate(appointment.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{appointment.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{appointment.property || 'Property Location'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="View"
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Edit"
                        onClick={() => handleEditClick(appointment)}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete"
                        onClick={() => setShowDeleteConfirm(appointment.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Appointment Modal */}
      <AddAppointmentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAppointment(null);
          setSelectedDate(undefined);
        }}
        onSave={handleAddAppointment}
        selectedDate={selectedDate}
        existingAppointment={editingAppointment}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Delete Appointment</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this appointment? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAppointment(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Appointment;

