import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, CheckCircle, Clock, AlertCircle, FileCheck } from 'lucide-react';
import ContractViewer from '../components/Dashboard/ContractViewer';
import SignatureModal from '../components/Dashboard/SignatureModal';

const DashboardContracts = () => {
  const [selectedContract, setSelectedContract] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signedContracts, setSignedContracts] = useState([]);

  // Load signed contracts from localStorage on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('signedContracts') || '[]');
    setSignedContracts(stored);
  }, []);

  const contracts = [
    {
      id: 1,
      name: 'Lease Agreement - Modern Downtown Apartment',
      property: 'Modern Downtown Apartment',
      type: 'Lease Agreement',
      date: '2024-01-10',
      status: 'pending',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Mock PDF URL
    },
    {
      id: 2,
      name: 'Lease Agreement - Luxury Condo',
      property: 'Luxury Condo with Ocean View',
      type: 'Lease Agreement',
      date: '2023-12-15',
      status: 'pending',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
    {
      id: 3,
      name: 'Lease Agreement - Spacious Family Home',
      property: 'Spacious Family Home',
      type: 'Lease Agreement',
      date: '2023-11-20',
      status: 'pending',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
  ];

  // Check if contract is signed
  const isSigned = (contractId) => {
    return signedContracts.some((sc) => sc.contractId === contractId);
  };

  const getContractStatus = (contract) => {
    if (isSigned(contract.id)) {
      return {
        label: 'Signed',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-700',
      };
    }
    if (contract.status === 'pending') {
      return {
        label: 'Pending Signature',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-700',
      };
    }
    return {
      label: 'Active',
      icon: FileCheck,
      color: 'bg-blue-100 text-blue-700',
    };
  };

  const handleViewContract = (contract) => {
    setSelectedContract(contract);
    setShowViewer(true);
  };

  const handleSignContract = (contract) => {
    setSelectedContract(contract);
    setShowSignatureModal(true);
  };

  const handleSigned = (contractId, signature) => {
    // Update signed contracts state
    const updated = [
      ...signedContracts,
      {
        contractId,
        signedAt: new Date().toISOString(),
        signature,
      },
    ];
    setSignedContracts(updated);
    
    // Also update localStorage (already done in SignatureModal, but refresh state)
    const stored = JSON.parse(localStorage.getItem('signedContracts') || '[]');
    setSignedContracts(stored);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSignedDate = (contractId) => {
    const signed = signedContracts.find((sc) => sc.contractId === contractId);
    return signed ? formatDate(signed.signedAt) : null;
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Digital Contracts</h1>
        <p className="text-gray-600">View, review, and sign your property contracts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Contracts</h3>
            <FileText className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Signed</h3>
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {contracts.filter((c) => isSigned(c.id)).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Pending</h3>
            <Clock className="text-yellow-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {contracts.filter((c) => !isSigned(c.id)).length}
          </p>
        </div>
      </div>

      {/* Contracts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Contracts</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {contracts.map((contract) => {
            const status = getContractStatus(contract);
            const StatusIcon = status.icon;
            const signed = isSigned(contract.id);
            const signedDate = getSignedDate(contract.id);

            return (
              <div key={contract.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="text-orange-600" size={24} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{contract.property}</h3>
                        <p className="text-sm text-gray-600">{contract.type}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Created {formatDate(contract.date)}
                          {signedDate && (
                            <span className="ml-2 text-green-600">• Signed {signedDate}</span>
                          )}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                      >
                        <StatusIcon size={14} />
                        {status.label}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => handleViewContract(contract)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Eye size={16} />
                        View PDF
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = contract.pdfUrl || '#';
                          link.download = `${contract.name}.pdf`;
                          link.target = '_blank';
                          link.click();
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Download size={16} />
                        Download
                      </button>
                      {!signed && (
                        <button
                          onClick={() => handleSignContract(contract)}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <FileCheck size={16} />
                          Accept & Sign
                        </button>
                      )}
                      {signed && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                          <CheckCircle size={16} />
                          Signed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contract Viewer Modal */}
      {showViewer && selectedContract && (
        <ContractViewer
          contract={selectedContract}
          onClose={() => {
            setShowViewer(false);
            setSelectedContract(null);
          }}
        />
      )}

      {/* Signature Modal */}
      {showSignatureModal && selectedContract && (
        <SignatureModal
          contract={selectedContract}
          onClose={() => {
            setShowSignatureModal(false);
            setSelectedContract(null);
          }}
          onSign={handleSigned}
        />
      )}
    </div>
  );
};

export default DashboardContracts;
