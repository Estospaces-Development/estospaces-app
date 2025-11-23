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
            // Fetch conversations with their tickets
            const { data: conversationsData, error: fetchError } = await supabase
                .from('conversations')
                .select('*')
                .order('updated_at', { ascending: false });

            if (fetchError) throw fetchError;

            // Fetch tickets separately and attach to conversations
            const { data: ticketsData } = await supabase
                .from('tickets')
                .select('*')
                .order('created_at', { ascending: false });

            // Attach the most recent open ticket to each conversation
            const conversationsWithTickets = (conversationsData || []).map(conv => {
                const conversationTickets = (ticketsData || []).filter(t => t.conversation_id === conv.id);
                const openTicket = conversationTickets.find(t => t.status === 'open');
                const latestTicket = openTicket || conversationTickets[0];

                return {
                    ...conv,
                    ticket: latestTicket || null
                };
            });

            setConversations(conversationsWithTickets);
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
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        const optimisticMessage = {
            id: tempId,
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
                    msg.id === tempId ? { ...data, _skipRealtime: true } : msg
                )
            );
        } catch (e) {
            // Remove optimistic message on error
            setMessages((prev) =>
                prev.filter((msg) => msg.id !== tempId)
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

                    // Only add messages from visitors via realtime
                    // Admin's own messages are handled via optimistic updates
                    if (payload.new.sender_type === 'admin') {
                        console.log('⏭️ Skipping admin message (handled by optimistic update)');
                        return;
                    }

                    // Prevent duplicates - check if message already exists
                    setMessages((prev) => {
                        const exists = prev.some((msg) => msg.id === payload.new.id);

                        if (exists) {
                            console.log('⚠️ Message already exists, skipping');
                            return prev;
                        }

                        console.log('✅ Adding visitor message to admin list');
                        return [...prev, payload.new];
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

    // Archive a conversation
    const archiveConversation = async (conversationId) => {
        if (!supabase) return;
        try {
            const { error } = await supabase
                .from('conversations')
                .update({ status: 'archived' })
                .eq('id', conversationId);

            if (error) throw error;

            // Optimistic update
            setConversations(prev => prev.filter(c => c.id !== conversationId));
            if (selectedConversation?.id === conversationId) {
                setSelectedConversation(null);
            }
        } catch (e) {
            console.error('Error archiving conversation:', e);
            setError(e.message);
        }
    };

    // Create a ticket for a conversation
    const createTicket = async (conversationId, ticketData) => {
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from('tickets')
                .insert([{
                    conversation_id: conversationId,
                    ...ticketData,
                    status: 'open'
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (e) {
            console.error('Error creating ticket:', e);
            throw e;
        }
    };

    // Close a ticket
    const closeTicket = async (ticketId) => {
        if (!supabase) return;
        try {
            const { error } = await supabase
                .from('tickets')
                .update({ status: 'closed', updated_at: new Date().toISOString() })
                .eq('id', ticketId);

            if (error) throw error;
        } catch (e) {
            console.error('Error closing ticket:', e);
            throw e;
        }
    };

    // Update a ticket
    const updateTicket = async (ticketId, updates) => {
        if (!supabase) return;
        try {
            const { error } = await supabase
                .from('tickets')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', ticketId);

            if (error) throw error;

            // Refresh conversations to update ticket info
            await loadConversations();
        } catch (e) {
            console.error('Error updating ticket:', e);
            throw e;
        }
    };

    return {
        conversations,
        selectedConversation,
        messages,
        loading,
        error,
        selectConversation,
        sendAdminMessage,
        refreshConversations: loadConversations,
        archiveConversation,
        createTicket,
        closeTicket,
        updateTicket
    };
};

export default useAdminChat;
