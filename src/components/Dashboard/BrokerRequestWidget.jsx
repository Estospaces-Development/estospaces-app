import React, { useState, useEffect, useRef } from 'react';
import {
  Clock, MapPin, Loader2, Phone, ShieldCheck, Star,
  MessageCircle, Mail, Calendar, CheckCircle2, Users,
  PhoneCall, MessageSquare, BadgeCheck, ArrowRight, Shield
} from 'lucide-react';

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_BROKERS = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
    rating: 4.9,
    reviewCount: 127,
    yearsExperience: 8,
    specializations: ['Luxury', 'First-time Buyers'],
    responseTime: '< 2 min',
    isOnline: true,
    phone: '+44 7700 900123',
    whatsapp: '+447700900123',
    email: 'sarah@estospaces.com'
  },
  {
    id: 2,
    name: 'Rajesh Sharma',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
    rating: 4.8,
    reviewCount: 89,
    yearsExperience: 12,
    specializations: ['Commercial', 'Investment'],
    responseTime: '< 5 min',
    isOnline: true,
    phone: '+44 7700 900456',
    whatsapp: '+447700900456',
    email: 'rajesh@estospaces.com'
  },
  {
    id: 3,
    name: 'Emma Thompson',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
    rating: 5.0,
    reviewCount: 52,
    yearsExperience: 5,
    specializations: ['Rentals', 'Student Housing'],
    responseTime: '< 1 min',
    isOnline: true,
    phone: '+44 7700 900789',
    whatsapp: '+447700900789',
    email: 'emma@estospaces.com'
  }
];

// ============================================================================
// COMPONENT - Minimal Clean Design with Orange Accent
// ============================================================================

const BrokerRequestWidget = () => {
  const [status, setStatus] = useState('idle');
  const [broker, setBroker] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [contactingBrokers, setContactingBrokers] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (status === 'waiting' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 115 && !broker) {
            const randomBroker = MOCK_BROKERS[Math.floor(Math.random() * MOCK_BROKERS.length)];
            setBroker(randomBroker);
            setStatus('found');
            clearInterval(timerRef.current);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, timeLeft, broker]);

  useEffect(() => {
    if (status === 'waiting') {
      const showBrokers = async () => {
        for (let i = 0; i < MOCK_BROKERS.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 600));
          setContactingBrokers(prev => [...prev, MOCK_BROKERS[i]]);
        }
      };
      showBrokers();
    } else {
      setContactingBrokers([]);
    }
  }, [status]);

  const handleConnect = () => {
    setStatus('waiting');
    setTimeLeft(120);
  };

  const handleQuickConnect = () => {
    const fastBroker = MOCK_BROKERS[0];
    setBroker(fastBroker);
    setStatus('found');
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const resetWidget = () => {
    setStatus('idle');
    setBroker(null);
    setContactingBrokers([]);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // ============================================================================
  // IDLE STATE - Minimal Clean Design
  // ============================================================================
  if (status === 'idle') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left - Content */}
            <div>
              {/* Live Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                12 Experts Online
              </div>

              {/* Headline */}
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Get Expert Help in{' '}
                <span className="text-orange-500">10 Minutes</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                Connect with verified local property experts instantly. We guarantee a response within 10 minutes.
              </p>

              {/* Trust Signals */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <BadgeCheck className="text-orange-500" size={16} />
                  <span>Verified Experts</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="text-orange-500" size={16} />
                  <span>98% Satisfaction</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="text-orange-500" size={16} />
                  <span>2,547+ Helped</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleQuickConnect}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <PhoneCall size={18} />
                  Talk to Expert
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={handleConnect}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all"
                >
                  <MessageSquare size={18} />
                  Start Chat
                </button>
                <button
                  onClick={handleConnect}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all"
                >
                  <Calendar size={18} />
                  Schedule
                </button>
              </div>
            </div>

            {/* Right - Expert Previews */}
            <div className="hidden lg:block">
              <div className="space-y-3">
                {MOCK_BROKERS.map((expert) => (
                  <div
                    key={expert.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={expert.avatar}
                        alt={expert.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{expert.name}</span>
                        <BadgeCheck size={14} className="text-orange-500" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Star size={12} className="fill-orange-400 text-orange-400" />
                        <span>{expert.rating}</span>
                        <span>•</span>
                        <span>{expert.specializations[0]}</span>
                      </div>
                    </div>
                    <div className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-medium">
                      {expert.responseTime}
                    </div>
                  </div>
                ))}
              </div>

              {/* Guarantee */}
              <div className="mt-4 flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-sm">
                <Shield size={16} className="text-orange-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  <strong className="text-orange-600 dark:text-orange-400">10-min guarantee</strong> — or next consultation free
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // WAITING STATE
  // ============================================================================
  if (status === 'waiting') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 text-center">
        {/* Timer */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="40" cy="40" r="36" fill="none" stroke="#f3f4f6" strokeWidth="4" className="dark:stroke-gray-700" />
            <circle
              cx="40" cy="40" r="36" fill="none" stroke="#f97316" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${(timeLeft / 120) * 226} 226`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-900 dark:text-white">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Finding your expert...</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Contacting available experts near you</p>

        {/* Broker Avatars */}
        <div className="flex justify-center -space-x-3 mb-6">
          {contactingBrokers.map((b) => (
            <div key={b.id} className="relative">
              <img src={b.avatar} alt={b.name} className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-900 object-cover" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                <Loader2 size={8} className="text-white animate-spin" />
              </div>
            </div>
          ))}
        </div>

        <button onClick={resetWidget} className="text-gray-400 hover:text-gray-600 text-sm">Cancel</button>
      </div>
    );
  }

  // ============================================================================
  // FOUND STATE
  // ============================================================================
  if (status === 'found' && broker) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-green-200 dark:border-green-800 overflow-hidden">
        <div className="p-6 lg:p-8">
          {/* Success Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Expert Matched!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ready to help you</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Broker Info */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <img src={broker.avatar} alt={broker.name} className="w-16 h-16 rounded-xl object-cover" />
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full">
                  <BadgeCheck size={12} />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{broker.name}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <Star size={14} className="fill-orange-400 text-orange-400" />
                  <span>{broker.rating} ({broker.reviewCount} reviews)</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {broker.specializations.map((spec, i) => (
                    <span key={i} className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {broker.yearsExperience} years experience • Response: {broker.responseTime}
                </p>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.href = `tel:${broker.phone}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
              >
                <PhoneCall size={18} />
                Call Now
              </button>
              <button
                onClick={() => window.open(`https://wa.me/${broker.whatsapp?.replace(/[^0-9]/g, '')}`, '_blank')}
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
              >
                <MessageCircle size={18} />
                WhatsApp
              </button>
              <button
                onClick={() => window.location.href = `mailto:${broker.email}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors"
              >
                <Mail size={18} />
                Email
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button onClick={resetWidget} className="text-sm text-gray-400 hover:text-gray-600">
              Find another expert
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default BrokerRequestWidget;