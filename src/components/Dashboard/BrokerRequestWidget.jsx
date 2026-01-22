import React, { useState, useEffect, useRef } from 'react';
import {
  Clock, MapPin, Loader2, Phone, ShieldCheck, Star,
  MessageCircle, Mail, Calendar, CheckCircle2,
  PhoneCall, Zap, Search, UserCheck,
  Headphones, CircleDot, ArrowRight, Shield, BadgeCheck
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
    closedDeals: 234
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
    closedDeals: 189
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
    closedDeals: 156
  }
];

// Process steps for visualization
const PROCESS_STEPS = [
  { id: 1, label: 'Submit Request', icon: Search, description: 'Tell us what you need' },
  { id: 2, label: 'Find Nearby Brokers', icon: MapPin, description: 'We locate brokers near you' },
  { id: 3, label: 'Match & Connect', icon: UserCheck, description: 'Get matched with the best fit' },
  { id: 4, label: 'Start Conversation', icon: Headphones, description: 'Talk within 10 minutes' }
];

// ============================================================================
// COMPONENT - 10 Minutes Nearest Broker Response
// ============================================================================

const BrokerRequestWidget = () => {
  const [status, setStatus] = useState('idle');
  const [broker, setBroker] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [contactingBrokers, setContactingBrokers] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [matchProgress, setMatchProgress] = useState(0);
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
          if (prev <= 55 && !broker) {
            const randomBroker = MOCK_BROKERS[Math.floor(Math.random() * MOCK_BROKERS.length)];
            setBroker(randomBroker);
            setStatus('found');
            setCurrentStep(4);
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
      // Simulate progress through steps
      const stepTimers = [
        setTimeout(() => { setCurrentStep(1); setMatchProgress(25); }, 500),
        setTimeout(() => { setCurrentStep(2); setMatchProgress(50); }, 1500),
        setTimeout(() => { setCurrentStep(3); setMatchProgress(75); }, 2500),
      ];

      // Show brokers being contacted
      const showBrokers = async () => {
        for (let i = 0; i < MOCK_BROKERS.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 800));
          setContactingBrokers(prev => [...prev, MOCK_BROKERS[i]]);
        }
      };
      showBrokers();

      return () => stepTimers.forEach(t => clearTimeout(t));
    } else {
      setContactingBrokers([]);
      setCurrentStep(0);
      setMatchProgress(0);
    }
  }, [status]);

  const handleConnect = () => {
    setStatus('waiting');
    setTimeLeft(60);
  };

  const handleQuickConnect = () => {
    const fastBroker = MOCK_BROKERS[2]; // Emma with fastest response
    setBroker(fastBroker);
    setStatus('found');
    setCurrentStep(4);
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
    setCurrentStep(0);
    setMatchProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // ============================================================================
  // IDLE STATE - Clear Value Proposition
  // ============================================================================
  if (status === 'idle') {
    return (
      <div className="relative glass dark:glass-dark rounded-2xl shadow-soft-xl overflow-hidden transition-all duration-300 hover:shadow-premium-lg">
        {/* Ambient Background Effect */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none opacity-40"></div>

        <div className="relative p-6 lg:p-10 z-10">
          {/* Header Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-xs font-bold shadow-lg shadow-orange-500/20 uppercase tracking-wide">
              <TimerIcon />
              10-Minute Response Guarantee
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full border border-green-100 dark:border-green-800/50">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              {MOCK_BROKERS.length} Verified Brokers Online
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* Left - Hero Content */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
                  Expert Help,
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500">
                    Faster Than Ever.
                  </span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl font-light">
                  Skip the wait. We instantly connect you with top-rated local brokers starting with a guaranteed response in under 10 minutes.
                </p>
              </div>

              {/* How It Works - Step Visualization */}
              <div className="bg-white/50 dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
                <div className="grid grid-cols-4 gap-2">
                  {PROCESS_STEPS.map((step, idx) => (
                    <div key={step.id} className="relative text-center group">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 shadow-sm transition-all duration-300 group-hover:border-orange-500/30 group-hover:text-orange-500 group-hover:scale-110 group-hover:shadow-md">
                        <step.icon size={22} strokeWidth={1.5} />
                      </div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white mb-1">{step.label}</p>
                      <p className="hidden sm:block text-[10px] text-gray-500 dark:text-gray-400 leading-tight px-1">{step.description}</p>

                      {/* Connector Line */}
                      {idx < PROCESS_STEPS.length - 1 && (
                        <div className="absolute top-7 left-[calc(50%+28px)] w-[calc(100%-56px)] h-[2px] bg-gray-100 dark:bg-gray-700 hidden lg:block overflow-hidden">
                          <div className="h-full w-full bg-orange-500/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Value Props */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: ShieldCheck, title: "Verified", desc: "Licensed & Vetted", color: "green" },
                  { icon: MapPin, title: "Local", desc: "Neighborhood Experts", color: "blue" },
                  { icon: Zap, title: "Fast", desc: "Under 10 Mins", color: "orange" }
                ].map((prop, i) => (
                  <div key={i} className={`flex items-center gap-3 p-4 bg-${prop.color}-50 dark:bg-${prop.color}-900/10 rounded-2xl border border-${prop.color}-100 dark:border-${prop.color}-900/20 transition-transform hover:-translate-y-1`}>
                    <div className={`w-10 h-10 rounded-xl bg-${prop.color}-100 dark:bg-${prop.color}-900/30 flex items-center justify-center`}>
                      <prop.icon size={20} className={`text-${prop.color}-600 dark:text-${prop.color}-400`} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{prop.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{prop.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={handleQuickConnect}
                  className="btn-primary px-8 py-4 text-base rounded-2xl shadow-orange-500/25 hover:shadow-orange-500/40"
                >
                  <Zap size={20} className="fill-white" />
                  Connect Now — It's Free
                  <ArrowRight size={18} className="opacity-80" />
                </button>
                <button
                  onClick={handleConnect}
                  className="btn-secondary px-6 py-4 text-base rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
                >
                  <Calendar size={20} />
                  Schedule for Later
                </button>
              </div>

              {/* Trust Indicator */}
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 pl-1">
                <Shield size={16} className="text-green-500 fill-green-500/20" />
                No spam. Your data is secure and only shared with your matched broker.
              </p>
            </div>

            {/* Right - Available Brokers Preview */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-gray-900 z-10 lg:hidden"></div>

              <div className="bg-gray-50/80 dark:bg-gray-800/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Live Activity
                  </span>
                  <span className="text-xs text-gray-500">Updated just now</span>
                </div>

                <div className="space-y-4">
                  {MOCK_BROKERS.map((expert, idx) => (
                    <div
                      key={expert.id}
                      className="group relative p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-orange-500/30 dark:hover:border-orange-500/30 shadow-sm hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          <img
                            src={expert.avatar}
                            alt={expert.name}
                            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-gray-100 dark:ring-gray-700 group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                              {expert.name}
                            </h4>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                              {expert.responseTime}
                            </span>
                          </div>

                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                            <MapPin size={12} className="text-gray-400" />
                            {expert.distance}
                          </p>

                          <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium">
                              <Star size={12} className="fill-orange-400 text-orange-400" />
                              {expert.rating}
                              <span className="text-gray-400 font-normal">({expert.reviewCount})</span>
                            </div>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-gray-500 dark:text-gray-400">{expert.closedDeals} deals</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/20 text-center">
                  <p className="text-xs text-orange-800 dark:text-orange-200 font-medium">
                    🔥 High Demand: 14 people connected in the last hour
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
  // WAITING STATE - Enhanced Progress Visualization
  // ============================================================================
  if (status === 'waiting') {
    return (
      <div className="glass dark:glass-dark rounded-2xl shadow-soft-xl border border-orange-100 dark:border-orange-900/20 overflow-hidden relative">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100/40 via-transparent to-transparent dark:from-orange-900/20 pointer-events-none"></div>

        <div className="relative p-8 lg:p-12 z-10">
          {/* Progress Steps */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-700 ease-out relative"
                  style={{ width: `${matchProgress}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/50 skew-x-12 animate-shimmer"></div>
                </div>
              </div>

              {PROCESS_STEPS.map((step, idx) => (
                <div key={step.id} className="relative z-10 flex flex-col items-center group">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${currentStep >= step.id
                    ? 'bg-white dark:bg-gray-900 border-orange-500 text-orange-500 shadow-xl shadow-orange-500/20 scale-110'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-600'
                    }`}>
                    {currentStep > step.id ? (
                      <CheckCircle2 size={24} className="animate-in fade-in zoom-in duration-300" />
                    ) : currentStep === step.id ? (
                      <Loader2 size={24} className="animate-spin text-orange-600" />
                    ) : (
                      <step.icon size={20} />
                    )}
                  </div>
                  <p className={`absolute -bottom-10 w-32 text-center text-xs font-bold transition-all duration-300 ${currentStep >= step.id ? 'text-gray-900 dark:text-white opacity-100 translate-y-0' : 'text-gray-400 opacity-50 translate-y-2'
                    }`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Central Status Area */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-8 py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-orange-100 dark:border-orange-900/30 mb-8 animate-bounce-subtle">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-20"></div>
                <Loader2 size={24} className="text-orange-600 animate-spin relative z-10" />
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-500">
                {currentStep === 1 && 'Processing your request...'}
                {currentStep === 2 && 'Scanning nearby area...'}
                {currentStep === 3 && 'Selecting best match...'}
                {currentStep === 0 && 'Initializing secure connection...'}
              </span>
            </div>

            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              We're Finding Your Expert
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-lg">
              Sit tight! Connecting you with the highest-rated available broker in your area.
            </p>
          </div>

          {/* Dynamic Broker Discovery UI */}
          <div className="max-w-xl mx-auto mb-10 min-h-[160px]">
            {contactingBrokers.length > 0 ? (
              <div className="space-y-3">
                <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Checking Availability</p>
                {contactingBrokers.map((b, idx) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in slide-in-from-bottom-4 fade-in duration-500"
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    <img src={b.avatar} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-gray-900 dark:text-white">{b.name}</h4>
                        <span className="text-xs font-mono text-gray-400">{b.distance}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                    <Loader2 size={16} className="text-blue-500 animate-spin" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="w-16 h-16 border-4 border-orange-100 dark:border-orange-900/30 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Timer Footer */}
          <div className="flex items-center justify-center">
            <div className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center gap-4">
              <span className="text-sm text-gray-500 font-medium">Estimated Time Remaining</span>
              <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white tabular-nums flex items-center gap-2">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={resetWidget}
              className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wide"
            >
              Cancel Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // FOUND STATE - Clear Success & Next Steps
  // ============================================================================
  if (status === 'found' && broker) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-0 overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800">
        {/* Confetti / Success Header */}
        <div className="relative bg-[#059669] overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative p-8 text-center text-white z-10">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-scaleIn">
              <CheckCircle2 size={40} className="text-[#059669]" />
            </div>
            <h3 className="text-3xl font-extrabold mb-2 tracking-tight">Match Found!</h3>
            <p className="text-emerald-100 font-medium text-lg">Connected in fewer than 10 minutes.</p>
          </div>
        </div>

        <div className="p-8 lg:p-10 -mt-6 relative z-20 bg-white dark:bg-gray-900 rounded-t-3xl">
          {/* Broker Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-1 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 mb-10">
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-lg ring-4 ring-white dark:ring-gray-700">
                  <img src={broker.avatar} alt={broker.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-xl shadow-lg border-4 border-white dark:border-gray-800">
                  <BadgeCheck size={20} />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{broker.name}</h2>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 dark:text-gray-400 text-sm">
                    <MapPin size={14} /> {broker.distance}
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="text-green-600 dark:text-green-400 font-medium">Online Now</span>
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-4">
                  <div className="flex items-baseline gap-1">
                    <Star size={20} className="fill-orange-400 text-orange-400" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{broker.rating}</span>
                    <span className="text-sm text-gray-400">({broker.reviewCount} reviews)</span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {broker.specializations.map((spec, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-semibold uppercase tracking-wide">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-3xl">
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{broker.yearsExperience}+</p>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">Years Exp.</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{broker.closedDeals}</p>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">Deals Closed</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white text-emerald-600">{broker.responseTime}</p>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">Avg. Response</p>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="space-y-6">
            <h4 className="text-center text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-4 before:h-px before:flex-1 before:bg-gray-200 dark:before:bg-gray-700 after:h-px after:flex-1 after:bg-gray-200 dark:after:bg-gray-700">
              Direct Contact Options
            </h4>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => window.location.href = `tel:${broker.phone}`}
                className="group relative flex items-center justify-center gap-3 p-5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl shadow-xl shadow-orange-500/20 transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <PhoneCall size={24} className="animate-pulse" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-orange-100 font-medium uppercase tracking-wide">Best for urgent needs</p>
                  <p className="text-lg font-bold">Call {broker.name.split(' ')[0]}</p>
                </div>
              </button>

              <button
                onClick={() => window.open(`https://wa.me/${broker.whatsapp?.replace(/[^0-9]/g, '')}`, '_blank')}
                className="group relative flex items-center justify-center gap-3 p-5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl shadow-xl shadow-green-500/20 transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <MessageCircle size={24} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-green-100 font-medium uppercase tracking-wide">Chat directly</p>
                  <p className="text-lg font-bold">WhatsApp</p>
                </div>
              </button>
            </div>

            <div className="pt-4 text-center">
              <button onClick={resetWidget} className="text-sm text-gray-400 hover:text-gray-900 dark:hover:text-white underline decoration-gray-300 underline-offset-4 transition-colors">
                Match with a different broker
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Helper component for icon
const TimerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" x2="14" y1="2" y2="2" />
    <line x1="12" x2="15" y1="14" y2="11" />
    <circle cx="12" cy="14" r="8" />
  </svg>
);

export default BrokerRequestWidget;