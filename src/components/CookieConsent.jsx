import React, { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';

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

    const initializeTracking = () => {
        // Store acceptance timestamp
        localStorage.setItem('cookieConsentDate', new Date().toISOString());

        // Track basic analytics
        if (typeof window !== 'undefined') {
            // Store user session data
            const sessionData = {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                language: navigator.language,
                screenResolution: `${window.screen.width}x${window.screen.height}`,
                referrer: document.referrer || 'direct',
            };

            localStorage.setItem('userSession', JSON.stringify(sessionData));

            // Track page views
            const pageViews = JSON.parse(localStorage.getItem('pageViews') || '[]');
            pageViews.push({
                url: window.location.pathname,
                timestamp: new Date().toISOString(),
            });
            localStorage.setItem('pageViews', JSON.stringify(pageViews));
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
