import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

/**
 * AuthCallback Component
 * 
 * Handles OAuth callback with a state machine approach.
 * Uses the centralized authService for reliable callback processing.
 * 
 * State Machine:
 * IDLE -> PROCESSING -> SUCCESS/ERROR
 */

// State machine states
const CALLBACK_STATES = {
    IDLE: 'idle',
    PROCESSING: 'processing',
    SUCCESS: 'success',
    ERROR: 'error',
};

const AuthCallback = () => {
    const navigate = useNavigate();
    const [callbackState, setCallbackState] = useState(CALLBACK_STATES.IDLE);
    const [statusMessage, setStatusMessage] = useState('Completing sign in...');
    const [errorMessage, setErrorMessage] = useState('');
    
    // Refs to prevent double processing
    const hasProcessed = useRef(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        // Prevent double processing in StrictMode
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const processCallback = async () => {
            if (!mountedRef.current) return;
            
            setCallbackState(CALLBACK_STATES.PROCESSING);
            setStatusMessage('Verifying authentication...');

            try {
                console.log('🔄 AuthCallback: Processing OAuth callback...');
                
                // Use authService to handle the callback
                const result = await authService.handleOAuthCallback();
                
                if (!mountedRef.current) return;

                if (!result.success) {
                    console.error('❌ AuthCallback: Failed:', result.error);
                    setCallbackState(CALLBACK_STATES.ERROR);
                    setErrorMessage(result.error || 'Authentication failed. Please try again.');
                    
                    // Redirect to login after delay
                    setTimeout(() => {
                        if (mountedRef.current) {
                            navigate('/auth/login', { replace: true });
                        }
                    }, 2500);
                    return;
                }

                // Success!
                console.log('✅ AuthCallback: Success!');
                setCallbackState(CALLBACK_STATES.SUCCESS);
                setStatusMessage('Loading your profile...');

                // Get role and redirect
                const role = await authService.getUserRole(result.user);
                const redirectPath = authService.getRedirectPath(role);

                console.log('🔄 AuthCallback: Navigating to:', redirectPath);
                
                // Small delay for UI feedback
                setTimeout(() => {
                    if (mountedRef.current) {
                        navigate(redirectPath, { replace: true });
                    }
                }, 300);

            } catch (error) {
                console.error('❌ AuthCallback: Exception:', error);
                
                if (!mountedRef.current) return;
                
                setCallbackState(CALLBACK_STATES.ERROR);
                setErrorMessage('An unexpected error occurred. Redirecting to login...');
                
                setTimeout(() => {
                    if (mountedRef.current) {
                        navigate('/auth/login', { replace: true });
                    }
                }, 2500);
            }
        };

        // Start processing immediately
        processCallback();

        // Set a maximum timeout for the entire process
        const maxTimeout = setTimeout(() => {
            if (mountedRef.current && callbackState === CALLBACK_STATES.PROCESSING) {
                console.log('⏰ AuthCallback: Maximum timeout reached');
                setCallbackState(CALLBACK_STATES.ERROR);
                setErrorMessage('Authentication is taking too long. Please try again.');
                
                setTimeout(() => {
                    if (mountedRef.current) {
                        navigate('/auth/login', { replace: true });
                    }
                }, 2000);
            }
        }, authService.AUTH_CONFIG.TIMEOUTS.OAUTH_CALLBACK);

        return () => {
            mountedRef.current = false;
            clearTimeout(maxTimeout);
        };
    }, [navigate, callbackState]);

    // Render based on state
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center max-w-md mx-auto px-4">
                {callbackState === CALLBACK_STATES.ERROR ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-red-600 dark:text-red-400 font-medium">{errorMessage}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Redirecting to login...</p>
                    </div>
                ) : callbackState === CALLBACK_STATES.SUCCESS ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-green-600 dark:text-green-400 font-medium">Sign in successful!</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{statusMessage}</p>
                    </div>
                ) : (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">{statusMessage}</p>
                        <p className="mt-2 text-gray-400 dark:text-gray-500 text-sm">Please wait...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;
