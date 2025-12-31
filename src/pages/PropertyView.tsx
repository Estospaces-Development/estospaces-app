import { useParams, useNavigate } from 'react-router-dom';
import { useProperties } from '../contexts/PropertyContext';
import { ArrowLeft, Edit, Trash2, MapPin, Home, Calendar, DollarSign } from 'lucide-react';
import { useState } from 'react';

const PropertyView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProperty, deleteProperty } = useProperties();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const property = id ? getProperty(id) : undefined;

  if (!property) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Property not found</p>
        <button
          onClick={() => navigate('/properties')}
          className="text-primary hover:underline"
        >
          Back to Properties
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (id) {
      deleteProperty(id);
      navigate('/properties');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/properties')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Properties
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/properties/edit/${id}`)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Property Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Image Gallery */}
        {property.images && property.images.length > 0 && (
          <div className="h-96 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Home className="w-32 h-32 text-white opacity-30" />
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Title and Status */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>
                  {property.address}, {property.city}, {property.state} {property.zipCode}
                </span>
              </div>
            </div>
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {property.status}
            </span>
          </div>

          {/* Key Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">Price</p>
              <p className="text-xl font-bold text-gray-800">{property.price}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Bedrooms</p>
              <p className="text-xl font-bold text-gray-800">{property.bedrooms}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Bathrooms</p>
              <p className="text-xl font-bold text-gray-800">{property.bathrooms}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Area</p>
              <p className="text-xl font-bold text-gray-800">{property.area} sqft</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{property.description}</p>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Type</span>
                  <span className="font-medium text-gray-800">{property.propertyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rental Type</span>
                  <span className="font-medium text-gray-800">{property.rentalType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Year Built</span>
                  <span className="font-medium text-gray-800">{property.yearBuilt}</span>
                </div>
                {property.propertyId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property ID</span>
                    <span className="font-medium text-gray-800">{property.propertyId}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Features</h2>
              <div className="flex flex-wrap gap-2">
                {property.features && property.features.length > 0 ? (
                  property.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No features added</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Contact Name</p>
                <p className="font-medium text-gray-800">{property.contactName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="font-medium text-gray-800">{property.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-medium text-gray-800">{property.emailAddress}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(property.availableDate || property.deposit || property.inclusions || property.exclusions) && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.availableDate && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Available Date</p>
                    <p className="font-medium text-gray-800">
                      {new Date(property.availableDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {property.deposit && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Deposit</p>
                    <p className="font-medium text-gray-800">{property.deposit}</p>
                  </div>
                )}
                {property.inclusions && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Inclusions</p>
                    <p className="font-medium text-gray-800">{property.inclusions}</p>
                  </div>
                )}
                {property.exclusions && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Exclusions</p>
                    <p className="font-medium text-gray-800">{property.exclusions}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Virtual Tour */}
          {property.virtualTourUrl && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Virtual Tour</h2>
              <a
                href={property.virtualTourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {property.virtualTourUrl}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Property</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this property? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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

export default PropertyView;

