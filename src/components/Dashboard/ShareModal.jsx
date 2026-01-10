import React, { useState } from 'react';
import { X, Mail, Link2, MessageCircle, Copy, Check } from 'lucide-react';

const formatPrice = (price) => {
  if (typeof price === 'number') {
    return `£${price.toLocaleString('en-GB')}`;
  }
  return price || 'Price on request';
};

const ShareModal = ({ property, onClose }) => {
  const [copied, setCopied] = useState(false);
  const propertyUrl = `${window.location.origin}/user/dashboard/property/${property.id}`;
  const shareText = `Check out this property: ${property.title} - ${formatPrice(property.price)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Property: ${property.title}`);
    const body = encodeURIComponent(`${shareText}\n\nView details: ${propertyUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${shareText}\n\n${propertyUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Share Property</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {/* Email Share */}
          <button
            onClick={handleEmailShare}
            className="w-full flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Mail className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">Share via Email</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Send property details via email</p>
            </div>
          </button>

          {/* WhatsApp Share */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <MessageCircle className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">Share via WhatsApp</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Share with WhatsApp contacts</p>
            </div>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              {copied ? (
                <Check className="text-green-600 dark:text-green-400" size={20} />
              ) : (
                <Link2 className="text-purple-600 dark:text-purple-400" size={20} />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {copied ? 'Link Copied!' : 'Copy Link'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{propertyUrl}</p>
            </div>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Property Details:</p>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{property.title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{property.location}</p>
          <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mt-1">
            {formatPrice(property.price)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

