import React, { useState } from 'react';
import { FileText, Download, X, ExternalLink } from 'lucide-react';

const ContractViewer = ({ contract, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Generate a mock PDF URL or use an embeddable PDF viewer
  // For MVP, we'll use a data URI or embed a PDF viewer
  const pdfUrl = contract.pdfUrl || `data:application/pdf;base64,${btoa('Mock PDF Content')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="text-orange-600" size={24} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{contract.name || contract.property}</h2>
              <p className="text-sm text-gray-600">{contract.type || 'Lease Agreement'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={20} className="text-gray-600" />
            </button>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = `${contract.name || 'contract'}.pdf`;
                link.click();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download"
            >
              <Download size={20} className="text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading document...</p>
              </div>
            </div>
          )}
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title="Contract PDF"
            onLoad={() => setIsLoading(false)}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ContractViewer;


