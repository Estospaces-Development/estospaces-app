import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, UserCheck, AlertCircle, Loader2, Phone, X, ShieldCheck, Star } from 'lucide-react';
import { useUserLocation } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';

const BrokerRequestWidget = () => {
  const { user } = useAuth();
  const { activeLocation } = useUserLocation();

  // States: 'idle', 'locating', 'confirming', 'requesting', 'waiting', 'found', 'timeout', 'error'
  const [status, setStatus] = useState('idle');
  const [requestId, setRequestId] = useState(null);
  const [broker, setBroker] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [errorMsg, setErrorMsg] = useState('');
  const pollIntervalRef = useRef(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    let timer;
    if (status === 'waiting' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && status === 'waiting') {
      setStatus('timeout');
    }
    return () => clearInterval(timer);
  }, [status, timeLeft]);

  const handleRequestHelp = async () => {
    if (!user) {
      setErrorMsg('Please log in to request help.');
      setStatus('error');
      return;
    }

    setStatus('locating');

    // 1. Get Location
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        startRequest(latitude, longitude);
      },
      (err) => {
        console.error('Geolocation error:', err);
        // Fallback to activeLocation from context or manual entry logic (omitted for brevity)
        if (activeLocation && activeLocation.latitude) {
          startRequest(activeLocation.latitude, activeLocation.longitude);
        } else {
          setErrorMsg('Unable to detect location. Please enable location services.');
          setStatus('error');
        }
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const startRequest = async (lat, lng) => {
    setStatus('requesting');
    try {
      const response = await fetch('/api/request-broker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          latitude: lat,
          longitude: lng,
          address: activeLocation?.city || 'Current Location'
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to request broker');

      setRequestId(data.data.id);
      setStatus('waiting');
      setTimeLeft(600); // Reset timer

      // Start polling
      startPolling(data.data.id);

    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  const startPolling = (id) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/broker-request/${id}`);
        const result = await response.json();

        if (result.data) {
          if (result.data.status === 'accepted' || result.data.status === 'active') {
            setBroker(result.data.broker);
            setStatus('found');
            clearInterval(pollIntervalRef.current);
          } else if (result.data.status === 'cancelled' || result.data.status === 'expired') {
            setStatus('timeout');
            clearInterval(pollIntervalRef.current);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000); // Poll every 3 seconds
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const resetWidget = () => {
    setStatus('idle');
    setBroker(null);
    setErrorMsg('');
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
  };

  // Render content based on status
  const renderContent = () => {
    switch (status) {
      case 'idle':
        return (
          <div className="flex flex-col items-start gap-1">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              Need Help Now?
              <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full animate-pulse">Live</span>
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Get a verified broker response in 10 mins.
            </p>
            <button
              onClick={handleRequestHelp}
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-2.5 px-4 font-semibold shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Clock size={18} />
              Request Broker Help
            </button>
          </div>
        );

      case 'locating':
      case 'requesting':
        return (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-3" />
            <p className="font-medium text-gray-900 dark:text-white">
              {status === 'locating' ? 'Accessing location...' : 'Connecting to nearest brokers...'}
            </p>
          </div>
        );

      case 'waiting':
        return (
          <div className="flex flex-col items-center py-2 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full border-4 border-red-100 dark:border-red-900/30 border-t-red-600 flex items-center justify-center mb-3 animate-spin duration-[3000ms]">
              <span className="text-lg font-bold text-red-600 dark:text-red-500 transform -rotate-0 !animate-none" style={{ animation: 'none' }}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Finding a Broker</h3>
            <p className="text-xs text-gray-500 mb-3">Notifying experts near you...</p>
            <button onClick={resetWidget} className="text-xs text-red-500 hover:text-red-700 underline">
              Cancel Request
            </button>
          </div>
        );

      case 'found':
        return (
          <div className="flex flex-col items-start gap-3 animate-fadeIn">
            <div className="flex items-center gap-3 w-full">
              <div className="relative">
                <img
                  src={broker?.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100'}
                  alt="Broker"
                  className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-0.5 rounded-full border border-white">
                  <ShieldCheck size={10} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 dark:text-white truncate">{broker?.name || 'Local Expert'}</h4>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <span>{broker?.rating || '5.0'}</span>
                  <span>•</span>
                  <span>{broker?.distance || 'Nearby'}</span>
                </div>
              </div>
            </div>

            <div className="w-full bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-100 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-300 font-medium mb-2 flex items-center gap-2">
                <UserCheck size={16} /> Broker accepted!
              </p>
              <button
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-semibold flex items-center justify-center gap-2"
                onClick={() => window.location.href = `tel:${broker?.phone}`}
              >
                <Phone size={16} /> Call Now: {broker?.phone}
              </button>
            </div>
            <button onClick={resetWidget} className="self-center text-xs text-gray-400 hover:text-gray-600">Close</button>
          </div>
        );

      case 'timeout':
        return (
          <div className="text-center py-2">
            <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Start a Chat instead?</h3>
            <p className="text-xs text-gray-500 mb-3">All nearby brokers are currently busy.</p>
            <div className="flex gap-2">
              <button onClick={resetWidget} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2 text-sm">Dismiss</button>
              <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-2 text-sm">Chat AI</button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 mb-3">{errorMsg}</p>
            <button onClick={resetWidget} className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg px-4 py-2 text-sm">Try Again</button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-5 shadow-sm hover:shadow-xl border transition-all duration-300
      ${status === 'found' ? 'bg-white dark:bg-gray-800 border-green-200 dark:border-green-900 ring-2 ring-green-100 dark:ring-green-900/30' :
        status === 'requesting' || status === 'waiting' ? 'bg-white dark:bg-gray-800 border-red-200 dark:border-red-900 ring-2 ring-red-50 dark:ring-red-900/10' :
          'group bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:-translate-y-1'}
    `}>
      {/* Background Gradient Accent */}
      {status === 'idle' && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/10 to-transparent rounded-bl-full pointer-events-none" />
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default BrokerRequestWidget;