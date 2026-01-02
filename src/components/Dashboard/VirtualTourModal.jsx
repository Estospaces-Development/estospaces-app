import React from 'react';
import { X } from 'lucide-react';

const VirtualTourModal = ({ property, onClose }) => {
  // Check if property has a virtual tour URL
  const virtualTourUrl = property.virtualTourUrl || property.virtualTour;
  const hasTour = Boolean(virtualTourUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Virtual Tour</h2>
            <p className="text-sm text-gray-600">{property.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {hasTour ? (
            <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
              {/* Embedded iframe for virtual tour */}
              <iframe
                src={virtualTourUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Virtual Tour"
              />
            </div>
          ) : (
            <div className="aspect-video w-full bg-gray-100 rounded-lg flex flex-col items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Virtual Tour Not Available
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  This property doesn't have a virtual tour available at the moment. Please contact
                  us for more information or schedule a viewing.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualTourModal;

