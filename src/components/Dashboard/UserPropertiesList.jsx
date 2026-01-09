import React, { useState, useEffect } from 'react';
import { getUserProperties } from '../../services/userPropertiesService';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

/**
 * Example component demonstrating User Properties API usage
 * This can be integrated into the User Dashboard
 */
const UserPropertiesList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  
  // Query parameters
  const [status, setStatus] = useState(null); // null, 'draft', or 'published'
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');

  // Fetch properties
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);

    const result = await getUserProperties({
      status,
      page,
      limit,
      sortBy,
      order,
    });

    if (result.error) {
      setError(result.error);
      setProperties([]);
      setPagination(null);
    } else {
      setProperties(result.data || []);
      setPagination(result.pagination);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, [status, page, limit, sortBy, order]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1); // Reset to first page
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && !properties.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-orange-500" size={32} />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading properties...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === null
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusChange('published')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === 'published'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => handleStatusChange('draft')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === 'draft'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Draft
            </button>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="created_at">Date Created</option>
              <option value="updated_at">Last Updated</option>
              <option value="title">Title</option>
              <option value="price">Price</option>
              <option value="bedrooms">Bedrooms</option>
              <option value="city">City</option>
            </select>
            <button
              onClick={() => {
                setOrder(order === 'asc' ? 'desc' : 'asc');
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              {order === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Error</h3>
            <p className="text-sm text-red-700 dark:text-red-300">{error.message}</p>
            {error.code && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">Code: {error.code}</p>
            )}
          </div>
        </div>
      )}

      {/* Properties List */}
      {!error && (
        <>
          {properties.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {status
                  ? `No ${status} properties found.`
                  : 'No properties found. Create your first property to get started.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {property.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            property.status === 'published'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          }`}
                        >
                          {property.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {property.description || 'No description'}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>£{property.price?.toLocaleString()}</span>
                        <span>{property.bedrooms} beds</span>
                        <span>{property.bathrooms} baths</span>
                        <span>{property.city}, {property.postcode}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
                {pagination.totalCount} properties
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserPropertiesList;

