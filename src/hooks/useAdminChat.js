import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useAdminChat hook – handles admin-side chat operations
 * 
 * Returns:
 *   conversations – array of all conversations sorted by most recent
 *   selectedConversation – currently selected conversation
 *   messages – array of messages for selected conversation
 *   loading – boolean while fetching data
 *   error – any error message
 *   selectConversation – function to select a conversation
 *   sendAdminMessage – function to send a message as admin
 */
const useAdminChat = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all conversations
    const loadConversations = useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('conversations')
                .select('*')
                .order('updated_at', { ascending: false });

            if (fetchError) throw fetchError;
            setConversations(data || []);
        } catch (e) {
            setError(e.message || 'Failed to load conversations');
        } finally {
            setLoading(false);
        }
    }, []);

    // Select a conversation and load its messages
    const selectConversation = useCallback(async (conversation) => {
        if (!supabase || !conversation) return;
        setSelectedConversation(conversation);
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversation.id)
                .order('created_at', { ascending: true });

            if (fetchError) throw fetchError;
            setMessages(data || []);
        } catch (e) {
            setError(e.message || 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    }, []);

    // Send a message as admin
    const sendAdminMessage = async (text) => {
        if (!supabase || !selectedConversation) return;
        setError(null);

        // Optimistic update - add message to UI immediately
        const optimisticMessage = {
            id: `temp-${Date.now()}`, // Temporary ID
            conversation_id: selectedConversation.id,
            sender_type: 'admin',
            message: text,
            created_at: new Date().toISOString(),
            _isOptimistic: true, // Flag to identify optimistic messages
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            const { data, error: insertError } = await supabase
                .from('messages')
                .insert([
                    {
                        conversation_id: selectedConversation.id,
                        sender_type: 'admin',
                        message: text,
                    },
                ])
                .select()
                .single();

            if (insertError) throw insertError;

            // Replace optimistic message with real one from database
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === optimisticMessage.id ? data : msg
                )
            );
        } catch (e) {
            // Remove optimistic message on error
            setMessages((prev) =>
                prev.filter((msg) => msg.id !== optimisticMessage.id)
            );
            setError(e.message || 'Failed to send message');
        }
    };

    // Subscribe to real-time message updates for selected conversation
    useEffect(() => {
        if (!supabase || !selectedConversation) return;

        console.log('🚀 Setting up realtime subscription for admin, conversation:', selectedConversation.id);

        // Create a unique channel name for this conversation
        const channelName = `admin-messages:${selectedConversation.id}`;
        console.log('📡 Creating admin channel:', channelName);

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${selectedConversation.id}`,
                },
                (payload) => {
                    console.log('🔔 Realtime message received (admin):', payload.new);
                    console.log('📊 Payload details:', {
                        id: payload.new.id,
                        sender: payload.new.sender_type,
                        message: payload.new.message,
                        conversation_id: payload.new.conversation_id
                    });

                    // Prevent duplicates - check if message already exists
                    setMessages((prev) => {
                        console.log('📝 Current messages count (admin):', prev.length);
                        const exists = prev.some((msg) => msg.id === payload.new.id);
                        console.log('❓ Message already exists?', exists);

                        if (exists) {
                            console.log('⚠️ Message already exists, skipping');
                            return prev;
                        }

                        console.log('✅ Adding new message to admin list');
                        const updated = [...prev, payload.new];
                        console.log('📝 New messages count (admin):', updated.length);
                        return updated;
                    });
                }
            )
            .subscribe((status, err) => {
                console.log('📡 Realtime subscription status (admin):', status);
                if (err) {
                    console.error('❌ Subscription error (admin):', err);
                }
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Admin successfully subscribed to realtime updates!');
                }
                if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Channel error (admin) - realtime may not work');
                }
                if (status === 'TIMED_OUT') {
                    console.error('⏱️ Subscription timed out (admin)');
                }
            });

        return () => {
            console.log('🔌 Unsubscribing from admin channel:', channelName);
            supabase.removeChannel(channel);
        };
    }, [selectedConversation]);

    // Subscribe to new conversations and updates
    useEffect(() => {
        if (!supabase) return;

        console.log('🚀 Setting up realtime subscription for conversations list');
        const channel = supabase
            .channel('admin-conversations-list')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen for all events (INSERT, UPDATE)
                    schema: 'public',
                    table: 'conversations',
                },
                (payload) => {
                    console.log('🔔 Conversation update received:', payload);

                    if (payload.eventType === 'INSERT') {
                        setConversations((prev) => {
                            const newConv = payload.new;
                            // Check if already exists
                            if (prev.some(c => c.id === newConv.id)) return prev;
                            // Add to top
                            return [newConv, ...prev];
                        });
                    } else if (payload.eventType === 'UPDATE') {
                        setConversations((prev) => {
                            const updatedConv = payload.new;
                            // Update existing conversation and move to top
                            const filtered = prev.filter(c => c.id !== updatedConv.id);
                            return [updatedConv, ...filtered];
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    return {
        conversations,
        selectedConversation,
        messages,
        loading,
        error,
        selectConversation,
        sendAdminMessage,
        refreshConversations: loadConversations,
    };
};

export default useAdminChat;
