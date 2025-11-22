import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useWaitlist = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const submitToWaitlist = async (data) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Check if Supabase is configured
        if (!supabase) {
            setError('Waitlist feature is not configured yet. Please contact support.');
            setLoading(false);
            return { success: false, error: 'Supabase not configured' };
        }

        try {
            const { error: supabaseError } = await supabase
                .from('waitlist')
                .insert([
                    {
                        user_type: data.userType,
                        name: data.name,
                        email: data.email,
                        phone: data.phone || null,
                        location: data.location,
                        looking_for: data.lookingFor,
                    }
                ]);

            if (supabaseError) {
                // Check for duplicate email
                if (supabaseError.code === '23505') {
                    throw new Error('This email is already registered on our waitlist.');
                }
                throw supabaseError;
            }

            setSuccess(true);
            return { success: true };
        } catch (err) {
            const errorMessage = err.message || 'Failed to join waitlist. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const resetState = () => {
        setError(null);
        setSuccess(false);
        setLoading(false);
    };

    return {
        submitToWaitlist,
        loading,
        error,
        success,
        resetState,
    };
};
