import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, CheckCircle, XCircle, Clock, Download, Trash2, Edit } from 'lucide-react';

const DocumentUpload = ({ documents = [], onUpload, onDelete, onReplace, maxSize = 10 * 1024 * 1024 }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files) => {
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${(maxSize / (1024 * 1024)).toFixed(0)}MB.`);
        return false;
      }
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert(`File ${file.name} has an invalid type. Please upload PDF or image files.`);
        return false;
      }
      return true;
    });

    validFiles.forEach((file) => {
      const document = {
        id: `doc-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        file: file,
        status: 'pending',
        uploadedAt: new Date().toISOString(),
        url: URL.createObjectURL(file),
      };
      onUpload(document);
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'rejected':
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) {
      return <ImageIcon size={20} className="text-gray-500" />;
    }
    return <FileText size={20} className="text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Documents
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload required documents. Accepted formats: PDF, JPG, PNG (Max 10MB)
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
        }`}
      >
        <Upload
          size={48}
          className={`mx-auto mb-4 ${
            dragActive ? 'text-orange-500' : 'text-gray-400'
          }`}
        />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Drag and drop files here, or{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-orange-600 dark:text-orange-400 hover:underline"
          >
            browse
          </button>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          PDF, JPG, PNG up to 10MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`flex items-center gap-4 p-4 rounded-lg border ${getStatusColor(
                doc.status
              )}`}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {getFileIcon(doc.type)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {doc.name}
                  </p>
                  {getStatusIcon(doc.status)}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <span>{formatFileSize(doc.size || 0)}</span>
                  <span>
                    {doc.status === 'approved'
                      ? 'Approved'
                      : doc.status === 'rejected'
                      ? 'Rejected'
                      : 'Pending Review'}
                  </span>
                  {doc.rejectionReason && (
                    <span className="text-red-600 dark:text-red-400">
                      {doc.rejectionReason}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {doc.url && (
                  <a
                    href={doc.url}
                    download={doc.name}
                    className="p-2 text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    title="Download"
                  >
                    <Download size={16} />
                  </a>
                )}
                {doc.status === 'rejected' && (
                  <button
                    onClick={() => onReplace(doc.id)}
                    className="p-2 text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    title="Replace"
                  >
                    <Edit size={16} />
                  </button>
                )}
                <button
                  onClick={() => onDelete(doc.id)}
                  className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;

