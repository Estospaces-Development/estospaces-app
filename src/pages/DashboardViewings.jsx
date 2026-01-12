import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Home, Plus, ChevronRight, X, Loader2, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const DashboardViewings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

  // Fetch viewings from Supabase with timeout
  const fetchViewings = useCallback(async () => {
    // Quick exit if no user or Supabase not available
    if (!user?.id || !isSupabaseAvailable()) {
      setViewings([]);
      setLoading(false);
      return;
    }

    try {
      // Set a timeout for the fetch
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const fetchPromise = supabase
        .from('viewings')
        .select(`
          id,
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
            postcode,
            price,
            listing_type,
            image_urls,
            contact_name,
            contact_phone
          )
        `)
        .eq('user_id', user.id)
        .order('viewing_date', { ascending: true });

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        // Table might not exist - show empty state
        console.log('Viewings table may not exist:', error.message);
        setViewings([]);
        setLoading(false);
        return;
      }

      // Transform data
      const transformedViewings = (data || []).map(item => {
        const property = item.properties || {};
        let images = [];
        try {
          images = property.image_urls 
            ? (Array.isArray(property.image_urls) ? property.image_urls : JSON.parse(property.image_urls))
            : [];
        } catch (e) {
          images = [];
        }

        return {
          id: item.id,
          propertyId: item.property_id,
          propertyTitle: property.title || 'Property',
          propertyAddress: property.address_line_1 || `${property.city || ''} ${property.postcode || ''}`.trim(),
          propertyImage: images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
          propertyPrice: property.price,
          listingType: property.listing_type,
          agentName: property.contact_name || 'Agent',
          agentPhone: property.contact_phone || '',
          date: item.viewing_date,
          time: item.viewing_time,
          status: item.status,
          notes: item.notes,
        };
      });

      setViewings(transformedViewings);
    } catch (err) {
      console.error('Error fetching viewings:', err);
      // On any error (including timeout), show empty state
      setViewings([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchViewings();
  }, [fetchViewings]);

  // Filter viewings
  const filteredViewings = viewings.filter(viewing => {
    const viewingDate = new Date(viewing.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'upcoming':
        return viewingDate >= today && viewing.status !== 'cancelled';
      case 'past':
        return viewingDate < today || viewing.status === 'completed';
      case 'cancelled':
        return viewing.status === 'cancelled';
      default:
        return true;
    }
  });

  // Cancel viewing
  const handleCancelViewing = async (viewingId) => {
    if (!isSupabaseAvailable()) return;

    try {
      const { error } = await supabase
        .from('viewings')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', viewingId);

      if (error) throw error;

      setViewings(prev => prev.map(v => 
        v.id === viewingId ? { ...v, status: 'cancelled' } : v
      ));
    } catch (err) {
      console.error('Error cancelling viewing:', err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400', label: 'Pending' },
      confirmed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', label: 'Confirmed' },
      cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', label: 'Cancelled' },
      completed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-400', label: 'Completed' },
      rescheduled: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-400', label: 'Rescheduled' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading viewings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">Viewings</h1>
          <p className="text-gray-600 dark:text-gray-400">Schedule and manage your property viewings</p>
        </div>
        <button
          onClick={() => navigate('/user/dashboard/discover')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={18} />
          <span>Schedule Viewing</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{viewings.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Viewings</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {viewings.filter(v => v.status === 'confirmed').length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Confirmed</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {viewings.filter(v => v.status === 'pending').length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Home size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {viewings.filter(v => {
                  const viewingDate = new Date(v.date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return viewingDate >= today && v.status !== 'cancelled';
                }).length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Upcoming</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'upcoming', 'past', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Viewings List */}
      {filteredViewings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {filter === 'all' ? 'No viewings scheduled' : `No ${filter} viewings`}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {filter === 'all' 
              ? 'Schedule a viewing for properties you\'re interested in'
              : `You don't have any ${filter} viewings at the moment`
            }
          </p>
          <button
            onClick={() => navigate('/user/dashboard/discover')}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            Browse Properties
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredViewings.map((viewing) => (
            <div
              key={viewing.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                {/* Property Image */}
                <div className="md:w-48 h-40 md:h-auto flex-shrink-0">
                  <img
                    src={viewing.propertyImage}
                    alt={viewing.propertyTitle}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {viewing.propertyTitle}
                        </h3>
                        {getStatusBadge(viewing.status)}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <MapPin size={14} />
                        <span>{viewing.propertyAddress}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Calendar size={16} className="text-orange-500" />
                          <span className="font-medium">{formatDate(viewing.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Clock size={16} className="text-orange-500" />
                          <span className="font-medium">{formatTime(viewing.time)}</span>
                        </div>
                        {viewing.propertyPrice && (
                          <div className="text-orange-600 dark:text-orange-400 font-semibold">
                            £{viewing.propertyPrice.toLocaleString()}
                            {viewing.listingType === 'rent' && '/mo'}
                          </div>
                        )}
                      </div>

                      {viewing.agentName && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Agent: {viewing.agentName}
                          {viewing.agentPhone && ` • ${viewing.agentPhone}`}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/user/dashboard/property/${viewing.propertyId}`)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        View Property
                      </button>
                      {viewing.status === 'pending' || viewing.status === 'confirmed' ? (
                        <button
                          onClick={() => handleCancelViewing(viewing.id)}
                          className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardViewings;
