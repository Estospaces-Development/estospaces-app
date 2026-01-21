import React from 'react';
import { X } from 'lucide-react';
import VirtualTourViewer from '../virtual-tour/VirtualTourViewer';
import { defaultVirtualTour } from '../../mocks/virtualTourMock';

const VirtualTourModal = ({ property, onClose }) => {
  // Use property-specific tour if available (and matches format), otherwise use default mock for demo
  const tourData = property.virtualTourData || defaultVirtualTour;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full h-full md:w-[90vw] md:h-[85vh] bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col animate-scaleIn">
        {/* Header - Transparent overlay on top of viewer */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
          <div className="pointer-events-auto">
            {/* Title handled by viewer or hidden */}
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all pointer-events-auto"
          >
            <X size={24} />
          </button>
        </div>

        {/* 360 Viewer */}
        <div className="w-full h-full">
          <VirtualTourViewer
            tour={tourData}
            embedded={true}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default VirtualTourModal;


