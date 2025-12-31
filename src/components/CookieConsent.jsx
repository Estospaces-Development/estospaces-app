import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Cookie } from 'lucide-react';

const CookieConsent = () => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Show banner after a short delay
            setTimeout(() => setShowBanner(true), 1000);
        } else if (consent === 'accepted') {
            // Initialize tracking if already accepted
            initializeTracking();
        }
    }, []);

    const initializeTracking = async () => {
        // Store acceptance timestamp
        localStorage.setItem('cookieConsentDate', new Date().toISOString());

        // Track basic analytics
        if (typeof window !== 'undefined') {
            // Generate or retrieve session ID
            let sessionId = sessionStorage.getItem('sessionId');
            if (!sessionId) {
                sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                sessionStorage.setItem('sessionId', sessionId);
            }

            // Detect device type
            const getDeviceType = () => {
                const ua = navigator.userAgent;
                if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
                    return 'tablet';
                }
                if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
                    return 'mobile';
                }
                return 'desktop';
            };

            // Detect browser
            const getBrowser = () => {
                const ua = navigator.userAgent;
                if (ua.indexOf('Firefox') > -1) return 'Firefox';
                if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
                if (ua.indexOf('Trident') > -1) return 'IE';
                if (ua.indexOf('Edge') > -1) return 'Edge';
                if (ua.indexOf('Chrome') > -1) return 'Chrome';
                if (ua.indexOf('Safari') > -1) return 'Safari';
                return 'Unknown';
            };

            // Collect user session data
            const sessionData = {
                sessionId,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                language: navigator.language,
                screenResolution: `${window.screen.width}x${window.screen.height}`,
                referrer: document.referrer || 'direct',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                platform: navigator.platform,
                deviceType: getDeviceType(),
                browser: getBrowser(),
            };

            localStorage.setItem('userSession', JSON.stringify(sessionData));

            // Track page views
            const pageViews = JSON.parse(localStorage.getItem('pageViews') || '[]');
            pageViews.push({
                url: window.location.pathname,
                timestamp: new Date().toISOString(),
                sessionId,
            });
            localStorage.setItem('pageViews', JSON.stringify(pageViews));

            // Send analytics data to Supabase
            try {
                if (supabase) {
                    await supabase.from('analytics_events').insert([{
                        event_type: 'cookie_accepted',
                        session_id: sessionId,
                        user_agent: sessionData.userAgent,
                        language: sessionData.language,
                        screen_resolution: sessionData.screenResolution,
                        referrer: sessionData.referrer,
                        timezone: sessionData.timezone,
                        platform: sessionData.platform,
                        device_type: sessionData.deviceType,
                        browser: sessionData.browser,
                        page_url: window.location.pathname,
                    }]);
                    console.log('✅ Analytics data sent to Supabase');
                }
            } catch (error) {
                console.log('⚠️ Analytics table not set up yet:', error.message);
                console.log('Run supabase_analytics_enhanced.sql to update the table');
                // Data is still stored locally even if backend fails
            }
        }
    };

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        initializeTracking();
        setShowBanner(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
            <div className="container mx-auto max-w-6xl">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 md:flex md:items-center md:justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
                            <Cookie className="text-primary" size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-2">We value your privacy</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
                                By clicking "Accept All", you consent to our use of cookies.{' '}
                                <a href="/cookies" className="text-primary hover:underline font-medium">
                                    Learn more
                                </a>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4 md:mt-0 md:flex-shrink-0">
                        <button
                            onClick={handleDecline}
                            className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm border border-gray-300"
                        >
                            Decline
                        </button>
                        <button
                            onClick={handleAccept}
                            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm shadow-sm"
                        >
                            Accept All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
