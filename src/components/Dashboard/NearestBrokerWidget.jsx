import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const NearestBrokerWidget = () => {
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [status, setStatus] = useState('waiting'); // 'waiting' or 'responded'
  const [isExpired, setIsExpired] = useState(false);

  const broker = {
    name: 'Sarah Johnson',
    agency: 'Prime Realty Group',
    distance: '0.8 miles',
    phone: '+1 (555) 123-4567',
  };

  useEffect(() => {
    if (status === 'waiting' && !isExpired) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, isExpired]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((600 - timeRemaining) / 600) * 100;

  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">Nearest Broker</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Based on your location</p>
        </div>
        <MapPin className="text-orange-500 dark:text-orange-400" size={20} />
      </div>

      {/* Broker Info */}
      <div className="mb-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {broker.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{broker.name}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{broker.agency}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <MapPin size={12} />
          <span>{broker.distance} away</span>
        </div>
      </div>

      {/* Status & Timer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {status === 'responded' ? (
              <>
                <CheckCircle className="text-green-500 dark:text-green-400" size={16} />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">Responded</span>
              </>
            ) : isExpired ? (
              <>
                <AlertCircle className="text-red-500 dark:text-red-400" size={16} />
                <span className="text-xs font-medium text-red-700 dark:text-red-400">Time Expired</span>
              </>
            ) : (
              <>
                <Clock className="text-orange-500 dark:text-orange-400" size={16} />
                <span className="text-xs font-medium text-orange-700 dark:text-orange-400">Waiting for response</span>
              </>
            )}
          </div>
          {status === 'waiting' && !isExpired && (
            <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
              <Clock size={12} className="text-orange-600 dark:text-orange-400" />
              <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {status === 'waiting' && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-1000 ${
                isExpired ? 'bg-red-500 dark:bg-red-400' : 'bg-orange-500 dark:bg-orange-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-1.5 pt-1">
          {status === 'waiting' && !isExpired && (
            <button
              onClick={() => setStatus('responded')}
              className="w-full px-3 py-1.5 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-lg font-medium text-xs transition-colors"
            >
              Mark as Responded
            </button>
          )}
          <button className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-xs transition-colors">
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default NearestBrokerWidget;

