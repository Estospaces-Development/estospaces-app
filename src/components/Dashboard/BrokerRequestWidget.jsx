import React, { useState, useEffect, useRef } from 'react';
import {
  Clock, MapPin, Loader2, Phone, ShieldCheck, Star,
  MessageCircle, Mail, Calendar, CheckCircle2,
  PhoneCall, Zap, Search, UserCheck,
  Headphones, CircleDot, ArrowRight, Shield, BadgeCheck,
  Home, Building2, Briefcase, TrendingUp,
  ChevronLeft, ChevronRight, Sparkles, Timer, X
} from 'lucide-react';

// ============================================================================
// MOCK DATA - LOCAL BROKERS
// ============================================================================

const MOCK_BROKERS = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
    rating: 4.9,
    reviewCount: 127,
    yearsExperience: 8,
    specializations: ['Residential', 'Luxury Homes'],
    responseTime: '< 2 min',
    distance: '1.2 km away',
    isOnline: true,
    phone: '+44 7700 900123',
    whatsapp: '+447700900123',
    email: 'sarah@estospaces.com',
    languages: ['English', 'French'],
    closedDeals: 234,
    bio: 'Helping families find their dream homes for over 8 years. Specializing in luxury properties and first-time buyers.'
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
    distance: '2.8 km away',
    isOnline: true,
    phone: '+44 7700 900456',
    whatsapp: '+447700900456',
    email: 'rajesh@estospaces.com',
    languages: ['English', 'Hindi'],
    closedDeals: 189,
    bio: 'Commercial real estate expert with extensive experience in investment properties and portfolio management.'
  },
  {
    id: 3,
    name: 'Emma Thompson',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
    rating: 5.0,
    reviewCount: 52,
    yearsExperience: 5,
    specializations: ['Rentals', 'First-Time Buyers'],
    responseTime: '< 1 min',
    distance: '0.8 km away',
    isOnline: true,
    phone: '+44 7700 900789',
    whatsapp: '+447700900789',
    email: 'emma@estospaces.com',
    languages: ['English', 'Spanish'],
    closedDeals: 156,
    bio: 'Passionate about helping first-time buyers navigate the property market with confidence and ease.'
  }
];

// Intake form options
const PURPOSE_OPTIONS = [
  { id: 'buy', label: 'Buy a Property', icon: Home, description: 'Find your dream home' },
  { id: 'rent', label: 'Rent a Place', icon: Building2, description: 'Discover rentals' },
  { id: 'sell', label: 'Sell My Property', icon: TrendingUp, description: 'List your property' },
  { id: 'invest', label: 'Investment', icon: Briefcase, description: 'Build your portfolio' }
];

const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Apartment', icon: '🏢' },
  { id: 'house', label: 'House', icon: '🏡' },
  { id: 'commercial', label: 'Commercial', icon: '🏪' },
  { id: 'land', label: 'Land', icon: '🌳' }
];

const BUDGET_RANGES = [
  { id: 'under-200k', label: 'Under £200k' },
  { id: '200k-500k', label: '£200k - £500k' },
  { id: '500k-1m', label: '£500k - £1M' },
  { id: 'over-1m', label: 'Over £1M' }
];

const URGENCY_OPTIONS = [
  { id: 'asap', label: 'As soon as possible', icon: Zap, color: 'orange' },
  { id: 'this_week', label: 'Within this week', icon: Calendar, color: 'blue' },
  { id: 'browsing', label: 'Just browsing', icon: Search, color: 'gray' }
];

const CONTACT_OPTIONS = [
  { id: 'call', label: 'Phone Call', icon: Phone, description: 'Speak directly' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, description: 'Chat instantly' },
  { id: 'chat', label: 'In-App Chat', icon: Headphones, description: 'Message here' }
];

// ============================================================================
// COMPONENT - 10 Minutes Nearest Broker Response (Redesigned)
// ============================================================================

const BrokerRequestWidget = () => {
  // Status: 'idle' | 'intake' | 'matching' | 'found'
  const [status, setStatus] = useState('idle');
  const [broker, setBroker] = useState(null);
  const [intakeStep, setIntakeStep] = useState(1);
  const [matchProgress, setMatchProgress] = useState(0);
  const [matchingPhase, setMatchingPhase] = useState('');
  const [discoveredBrokers, setDiscoveredBrokers] = useState([]);
  const [selectedBrokerId, setSelectedBrokerId] = useState(null);

  const [preferences, setPreferences] = useState({
    purpose: null,
    propertyType: null,
    budget: null,
    urgency: null,
    contactMethod: null
  });

  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Matching simulation
  useEffect(() => {
    if (status === 'matching') {
      const phases = [
        { progress: 10, message: 'Analyzing your requirements...', delay: 500 },
        { progress: 25, message: 'Searching 127 verified brokers near you...', delay: 1500 },
        { progress: 40, message: 'Found potential matches!', delay: 2500 },
        { progress: 60, message: 'Checking broker availability...', delay: 3500 },
        { progress: 80, message: 'Selecting the best match...', delay: 4500 },
        { progress: 100, message: 'Match found!', delay: 5500 }
      ];

      const timers = phases.map(phase =>
        setTimeout(() => {
          setMatchProgress(phase.progress);
          setMatchingPhase(phase.message);
        }, phase.delay)
      );

      // Reveal brokers one by one
      const brokerTimers = MOCK_BROKERS.map((broker, idx) =>
        setTimeout(() => {
          setDiscoveredBrokers(prev => [...prev, broker]);
        }, 2000 + idx * 800)
      );

      // Select best broker and transition
      const selectTimer = setTimeout(() => {
        const bestBroker = MOCK_BROKERS.find(b =>
          preferences.purpose === 'buy' && b.specializations.includes('Residential') ||
          preferences.purpose === 'rent' && b.specializations.includes('Rentals') ||
          preferences.purpose === 'invest' && b.specializations.includes('Investment') ||
          true
        );
        setSelectedBrokerId(bestBroker.id);

        setTimeout(() => {
          setBroker(bestBroker);
          setStatus('found');
        }, 1500);
      }, 5000);

      return () => {
        timers.forEach(t => clearTimeout(t));
        brokerTimers.forEach(t => clearTimeout(t));
        clearTimeout(selectTimer);
      };
    } else {
      setDiscoveredBrokers([]);
      setSelectedBrokerId(null);
      setMatchProgress(0);
      setMatchingPhase('');
    }
  }, [status, preferences.purpose]);

  const handleStartIntake = () => {
    setStatus('intake');
    setIntakeStep(1);
  };

  const handleNextStep = () => {
    if (intakeStep < 4) {
      setIntakeStep(intakeStep + 1);
    } else {
      // Start matching
      setStatus('matching');
    }
  };

  const handlePrevStep = () => {
    if (intakeStep > 1) {
      setIntakeStep(intakeStep - 1);
    } else {
      setStatus('idle');
    }
  };

  const resetWidget = () => {
    setStatus('idle');
    setBroker(null);
    setIntakeStep(1);
    setPreferences({
      purpose: null,
      propertyType: null,
      budget: null,
      urgency: null,
      contactMethod: null
    });
    setDiscoveredBrokers([]);
    setSelectedBrokerId(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const canProceed = () => {
    switch (intakeStep) {
      case 1: return preferences.purpose !== null;
      case 2: return preferences.propertyType !== null;
      case 3: return preferences.budget !== null && preferences.urgency !== null;
      case 4: return preferences.contactMethod !== null;
      default: return false;
    }
  };

  // ============================================================================
  // IDLE STATE
  // ============================================================================
  if (status === 'idle') {
    return (
      <div id="broker-response-widget" className="relative bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-900/10 rounded-3xl shadow-xl overflow-hidden border border-orange-100/50 dark:border-orange-900/30">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative p-8 lg:p-12">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-sm font-bold shadow-lg shadow-orange-500/25">
              <Timer size={16} />
              10-Minute Response Guarantee
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full border border-green-100 dark:border-green-800/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              {MOCK_BROKERS.length} Brokers Online Now
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Value Proposition */}
            <div className="space-y-6">
              <div>
                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-4">
                  Find Your
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-500">
                    Perfect Broker
                  </span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Tell us what you need, and we'll connect you with a verified local expert in under 10 minutes. Free, fast, and personalized.
                </p>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: ShieldCheck, label: 'Verified Experts', color: 'green' },
                  { icon: MapPin, label: 'Local to You', color: 'blue' },
                  { icon: Zap, label: 'Fast Response', color: 'orange' }
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <badge.icon size={16} className={`text-${badge.color}-500`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{badge.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={handleStartIntake}
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg font-bold rounded-2xl shadow-xl shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-orange-500/40"
              >
                <Sparkles size={24} className="animate-pulse" />
                Get Started — It's Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Shield size={14} className="text-green-500" />
                No spam. Your information is secure.
              </p>
            </div>

            {/* Right - Preview brokers */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent dark:from-gray-900 to-transparent z-10 pointer-events-none lg:hidden" />

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Available Now
                  </span>
                  <span className="text-xs text-gray-400">Updated just now</span>
                </div>

                <div className="space-y-3">
                  {MOCK_BROKERS.slice(0, 3).map((expert) => (
                    <div key={expert.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <img
                        src={expert.avatar}
                        alt={expert.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{expert.name}</h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Star size={10} className="fill-orange-400 text-orange-400" />
                          {expert.rating} · {expert.distance}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full">
                        {expert.responseTime}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-center">
                  <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                    🔥 12 people connected in the last hour
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // INTAKE FORM STATE
  // ============================================================================
  if (status === 'intake') {
    return (
      <div id="broker-response-widget" className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
            style={{ width: `${(intakeStep / 4) * 100}%` }}
          />
        </div>

        <div className="p-8 lg:p-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400 font-semibold mb-1">Step {intakeStep} of 4</p>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {intakeStep === 1 && "What are you looking for?"}
                {intakeStep === 2 && "What type of property?"}
                {intakeStep === 3 && "Budget & Timeline"}
                {intakeStep === 4 && "How should we contact you?"}
              </h2>
            </div>
            <button
              onClick={resetWidget}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Step 1: Purpose */}
          {intakeStep === 1 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {PURPOSE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setPreferences(p => ({ ...p, purpose: option.id }))}
                  className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-center ${preferences.purpose === option.id
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 shadow-lg shadow-orange-500/20'
                      : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-md'
                    }`}
                >
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors ${preferences.purpose === option.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-400 group-hover:text-orange-500'
                    }`}>
                    <option.icon size={28} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{option.label}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                  {preferences.purpose === option.id && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 size={20} className="text-orange-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Property Type */}
          {intakeStep === 2 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setPreferences(p => ({ ...p, propertyType: type.id }))}
                  className={`group p-6 rounded-2xl border-2 transition-all duration-300 text-center ${preferences.propertyType === type.id
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 shadow-lg'
                      : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:border-orange-200'
                    }`}
                >
                  <span className="text-4xl mb-3 block">{type.icon}</span>
                  <h3 className="font-bold text-gray-900 dark:text-white">{type.label}</h3>
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Budget & Urgency */}
          {intakeStep === 3 && (
            <div className="space-y-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Budget Range</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {BUDGET_RANGES.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setPreferences(p => ({ ...p, budget: range.id }))}
                      className={`p-4 rounded-xl border-2 transition-all text-center font-medium ${preferences.budget === range.id
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-transparent hover:border-orange-200'
                        }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">How urgent is this?</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {URGENCY_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setPreferences(p => ({ ...p, urgency: option.id }))}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${preferences.urgency === option.id
                          ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                          : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:border-orange-200'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${option.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                          option.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                        }`}>
                        <option.icon size={20} />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Contact Method */}
          {intakeStep === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
              {CONTACT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setPreferences(p => ({ ...p, contactMethod: option.id }))}
                  className={`group p-6 rounded-2xl border-2 transition-all duration-300 text-center ${preferences.contactMethod === option.id
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 shadow-lg'
                      : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:border-orange-200'
                    }`}
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors ${preferences.contactMethod === option.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-400'
                    }`}>
                    <option.icon size={32} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{option.label}</h3>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              <ChevronLeft size={20} />
              {intakeStep === 1 ? 'Cancel' : 'Back'}
            </button>
            <button
              onClick={handleNextStep}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${canProceed()
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
            >
              {intakeStep === 4 ? 'Find My Broker' : 'Continue'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MATCHING STATE
  // ============================================================================
  if (status === 'matching') {
    return (
      <div id="broker-response-widget" className="relative bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-xl overflow-hidden border border-orange-100 dark:border-orange-900/30">
        <div className="p-8 lg:p-12">
          {/* Progress */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{matchingPhase}</span>
              <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">{matchProgress}%</span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500 relative"
                style={{ width: `${matchProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Status message */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-orange-100 dark:border-gray-700 mb-6">
              <Loader2 size={24} className="text-orange-500 animate-spin" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Finding your perfect match</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              We're analyzing your requirements and searching for the best available broker near you.
            </p>
          </div>

          {/* Discovered brokers */}
          <div className="max-w-2xl mx-auto">
            <h3 className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
              {discoveredBrokers.length > 0 ? 'Potential Matches' : 'Scanning...'}
            </h3>

            <div className="space-y-3">
              {discoveredBrokers.map((broker, idx) => (
                <div
                  key={broker.id}
                  className={`flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all duration-500 animate-slideIn ${selectedBrokerId === broker.id
                      ? 'border-orange-500 shadow-xl shadow-orange-500/20 scale-[1.02]'
                      : 'border-gray-100 dark:border-gray-700'
                    }`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="relative">
                    <img
                      src={broker.avatar}
                      alt={broker.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-white dark:ring-gray-700"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white">{broker.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star size={12} className="fill-orange-400 text-orange-400" />
                        {broker.rating}
                      </span>
                      <span>{broker.distance}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {selectedBrokerId === broker.id ? (
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full animate-pulse">
                        Best Match!
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs font-medium rounded-full">
                        {broker.responseTime}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {discoveredBrokers.length < MOCK_BROKERS.length && (
                <div className="flex items-center justify-center gap-3 py-4 text-gray-400">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Searching for more brokers...</span>
                </div>
              )}
            </div>
          </div>

          {/* Cancel */}
          <div className="text-center mt-10">
            <button
              onClick={resetWidget}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium"
            >
              Cancel search
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // FOUND STATE
  // ============================================================================
  if (status === 'found' && broker) {
    const matchReason = preferences.purpose === 'buy' ? 'home buying expertise' :
      preferences.purpose === 'rent' ? 'rental market knowledge' :
        preferences.purpose === 'sell' ? 'selling experience' :
          'investment portfolio management';

    return (
      <div id="broker-response-widget" className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        {/* Success header */}
        <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <CheckCircle2 size={36} className="text-green-500" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-2">Perfect Match Found!</h2>
            <p className="text-green-100 text-lg">Connected in under 10 minutes</p>
          </div>
        </div>

        <div className="p-8 lg:p-10">
          {/* Broker profile */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <img
                src={broker.avatar}
                alt={broker.name}
                className="w-28 h-28 rounded-2xl object-cover shadow-lg ring-4 ring-white dark:ring-gray-800"
              />
              <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-lg shadow-lg">
                <BadgeCheck size={18} />
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{broker.name}</h3>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                <div className="flex items-center gap-1 text-orange-500">
                  <Star size={18} className="fill-orange-400" />
                  <span className="font-bold">{broker.rating}</span>
                  <span className="text-gray-400">({broker.reviewCount} reviews)</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <MapPin size={14} />
                  {broker.distance}
                </span>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 mb-4">
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  <span className="font-semibold">Why we matched you:</span> {broker.name} was selected for their {matchReason} and {broker.responseTime} average response time.
                </p>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {broker.bio}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Experience', value: `${broker.yearsExperience}+ Years` },
              { label: 'Deals Closed', value: broker.closedDeals },
              { label: 'Response Time', value: broker.responseTime }
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Contact options */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider text-center">
              Start Your Conversation
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <button
                onClick={() => window.location.href = `tel:${broker.phone}`}
                className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all"
              >
                <PhoneCall size={20} />
                Call Now
              </button>
              <button
                onClick={() => window.open(`https://wa.me/${broker.whatsapp?.replace(/[^0-9]/g, '')}`, '_blank')}
                className="flex items-center justify-center gap-3 p-4 bg-[#25D366] text-white rounded-xl font-semibold shadow-lg hover:brightness-110 transition-all"
              >
                <MessageCircle size={20} />
                WhatsApp
              </button>
              <button
                onClick={() => window.location.href = '/user/dashboard/messages'}
                className="flex items-center justify-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                <Mail size={20} />
                In-App Message
              </button>
            </div>
          </div>

          {/* Retry */}
          <div className="text-center mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={resetWidget}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-4"
            >
              Not the right fit? Try a different match
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default BrokerRequestWidget;