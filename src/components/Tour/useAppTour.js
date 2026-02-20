import { useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuth } from '../../contexts/AuthContext';

export const useAppTour = () => {
    const { user } = useAuth();
    const driverObj = useRef(null);

    useEffect(() => {
        // Only run if user is logged in
        if (!user) {
            console.log('AppTour: No user logged in yet.');
            return;
        }

        console.log('AppTour: User found:', user.email, user.id);

        // Check if tour has been seen
        const tourKey = `hasSeenAppTour_${user.id}`;
        const hasSeenTour = localStorage.getItem(tourKey);

        console.log(`AppTour: Checking key '${tourKey}'. Value:`, hasSeenTour);

        if (hasSeenTour) {
            console.log('AppTour: Tour already seen. Skipping.');
            return;
        }

        console.log('AppTour: Initializing driver...');

        // Initialize driver
        driverObj.current = driver({
            showProgress: true,
            animate: true,
            allowClose: true,
            doneBtnText: 'Finish',
            nextBtnText: 'Next',
            prevBtnText: 'Previous',
            steps: [
                {
                    element: '#greeting-section',
                    popover: {
                        title: 'Welcome to Estospaces! 👋',
                        description: 'Your personalized dashboard for managing all your property needs. Let\'s take a quick tour.',
                        side: "bottom",
                        align: 'start'
                    }
                },
                {
                    element: '#broker-response-widget',
                    popover: {
                        title: '10-Minute Broker Response ⚡',
                        description: 'Get connected to verified local brokers in under 10 minutes! Our fastest and most powerful feature for finding expert help.',
                        side: "bottom",
                        align: 'center'
                    }
                },
                {
                    element: '#realtime-tracking-widget',
                    popover: {
                        title: 'Real-Time Tracking 📍',
                        description: 'Track every step of your property journey live — from application submission to key handover.',
                        side: "top",
                        align: 'center'
                    }
                },
                {
                    element: '#sidebar-nav',
                    popover: {
                        title: 'Navigation',
                        description: 'Access everything here: Dashboard, Browse Properties, My Applications, and Messages.',
                        side: "right",
                        align: 'start'
                    }
                },
                {
                    element: '#hero-search',
                    popover: {
                        title: 'Find Your Home 🏠',
                        description: 'Start your search here. Filter by location, price, and property type to find your perfect match.',
                        side: "bottom",
                        align: 'center'
                    }
                },
                {
                    element: '#profile-widget',
                    popover: {
                        title: 'Complete Your Profile ✨',
                        description: 'Very Important! Complete your profile to verify your identity and start booking viewings instantly.',
                        side: "left",
                        align: 'center'
                    }
                },
                {
                    element: '#messages-badge',
                    popover: {
                        title: 'Messages & Notifications 🔔',
                        description: 'Stay updated with real-time alerts on your applications and chat directly with agents.',
                        side: "bottom",
                        align: 'end'
                    }
                }
            ],
            onDestroyed: () => {
                // Mark tour as seen when finished or skipped
                console.log('AppTour: Tour finished/destroyed. Setting localStorage.');
                localStorage.setItem(tourKey, 'true');
            }
        });

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            const firstElement = document.querySelector('#greeting-section');
            if (firstElement) {
                console.log('AppTour: Starting tour now!');
                driverObj.current.drive();
            } else {
                console.warn('AppTour: Target element #greeting-section not found after delay.');
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [user]);

    return {
        startTour: () => driverObj.current?.drive()
    };
};
