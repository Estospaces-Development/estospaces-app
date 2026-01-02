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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Nearest Broker</h3>
          <p className="text-sm text-gray-600">Based on your location</p>
        </div>
        <MapPin className="text-orange-500" size={24} />
      </div>

      {/* Broker Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
            {broker.name.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{broker.name}</p>
            <p className="text-sm text-gray-600">{broker.agency}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={14} />
          <span>{broker.distance} away</span>
        </div>
      </div>

      {/* Status & Timer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status === 'responded' ? (
              <>
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-sm font-medium text-green-700">Responded</span>
              </>
            ) : isExpired ? (
              <>
                <AlertCircle className="text-red-500" size={20} />
                <span className="text-sm font-medium text-red-700">Time Expired</span>
              </>
            ) : (
              <>
                <Clock className="text-orange-500" size={20} />
                <span className="text-sm font-medium text-orange-700">Waiting for response</span>
              </>
            )}
          </div>
          {status === 'waiting' && !isExpired && (
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
              <Clock size={14} className="text-orange-600" />
              <span className="text-sm font-semibold text-orange-700">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {status === 'waiting' && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                isExpired ? 'bg-red-500' : 'bg-orange-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {status === 'waiting' && !isExpired && (
            <button
              onClick={() => setStatus('responded')}
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Mark as Responded
            </button>
          )}
          <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium text-sm transition-colors">
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default NearestBrokerWidget;

