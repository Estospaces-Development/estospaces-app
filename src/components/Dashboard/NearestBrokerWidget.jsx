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
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 text-sm">Nearest Broker</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Based on your current location</p>
        </div>
        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-full">
          <MapPin className="text-orange-500 dark:text-orange-400" size={16} />
        </div>
      </div>

      {/* Broker Info */}
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
            {broker.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{broker.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{broker.agency}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800/50 py-1.5 px-3 rounded-lg w-fit">
          <MapPin size={12} className="text-orange-500" />
          <span>{broker.distance} away</span>
        </div>
      </div>

      {/* Status & Timer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status === 'responded' ? (
              <>
                <CheckCircle className="text-green-500 dark:text-green-400" size={16} />
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">Response Received</span>
              </>
            ) : isExpired ? (
              <>
                <AlertCircle className="text-red-500 dark:text-red-400" size={16} />
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">Request Expired</span>
              </>
            ) : (
              <>
                <div className="relative">
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                  <Clock className="text-orange-500 dark:text-orange-400 relative z-10" size={16} />
                </div>
                <span className="text-xs font-bold text-orange-700 dark:text-orange-400">Finding Agent...</span>
              </>
            )}
          </div>
          {status === 'waiting' && !isExpired && (
            <div className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400 tabular-nums">
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {status === 'waiting' && (
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-linear ${isExpired ? 'bg-red-500' : 'bg-gradient-to-r from-orange-400 to-orange-600'
                }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          {status === 'waiting' && !isExpired && (
            <button
              onClick={() => setStatus('responded')}
              className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-xl font-medium text-xs transition-all shadow-sm hover:shadow-md transform active:scale-95"
            >
              Mark as Responded
            </button>
          )}
          <button className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 rounded-xl font-medium text-xs transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default NearestBrokerWidget;

