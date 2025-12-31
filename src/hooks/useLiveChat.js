import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Helper to get or create a visitor identifier stored in localStorage
const getVisitorId = () => {
    let id = localStorage.getItem('visitor_id');
    if (!id) {
        id = uuidv4();
        localStorage.setItem('visitor_id', id);
    }
    return id;
};

/**
 * useLiveChat hook – handles conversation lifecycle and realtime messaging.
 *
 * Returns:
 *   conversation – the conversation record (or null before creation)
 *   messages – array of message objects sorted by created_at
 *   loading – boolean while initializing / fetching
 *   error – any error message
 *   startConversation – function to create a conversation (optionally with name/email)
 *   sendMessage – function to send a new message
 *   isConversationReady – true when a conversation exists and subscription is active
 */
const useLiveChat = () => {
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const visitorId = getVisitorId();

    // Load existing conversation for this visitor (if any)
    const loadConversation = useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error: convError } = await supabase
                .from('conversations')
                .select('*')
                .eq('visitor_id', visitorId)
                .single();
            if (convError && convError.code !== 'PGRST116') {
                // PGRST116 = No rows returned – treat as not existing
                throw convError;
            }
            if (data) {
                setConversation(data);
            }
        } catch (e) {
            // No existing conversation – that's fine
        } finally {
            setLoading(false);
        }
    }, [visitorId]);

    // Create a new conversation (optional metadata)
    const startConversation = async ({ name = null, email = null } = {}) => {
        if (!supabase) {
            setError('Chat is disabled: Missing Supabase configuration');
            return;
        }
        // If a conversation already exists (loaded by loadConversation), reuse it
        if (conversation) {
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { data, error: insertError } = await supabase
                .from('conversations')
                .insert([
                    {
                        visitor_id: visitorId,
                        visitor_name: name,
                        visitor_email: email,
                    },
                ])
                .select()
                .single();
            if (insertError) {
                // Duplicate key error (visitor_id already exists)
                if (insertError.code === '23505') {
                    const { data: existing } = await supabase
                        .from('conversations')
                        .select('*')
                        .eq('visitor_id', visitorId)
                        .single();
                    setConversation(existing);
                    return;
                }
                throw insertError;
            }
            setConversation(data);

            // Send automatic welcome message immediately
            if (data) {
                const welcomeMessage = `👋 Hi ${name}! Welcome to Estospaces.\n\nThank you for reaching out! How can we help you today?\n\nOur team will respond to your message shortly.`;

                // Insert into database
                const { data: messageData } = await supabase.from('messages').insert([{
                    conversation_id: data.id,
                    sender_type: 'admin',
                    message: welcomeMessage,
                }]).select().single();

                // Add to messages state immediately so it appears right away
                if (messageData) {
                    setMessages([messageData]);
                }

                // Send notification email to admin
                try {
                    console.log('📧 Sending admin notification email...');
                    const { data: funcData, error: funcError } = await supabase.functions.invoke('send-chat-notification', {
                        body: {
                            name,
                            email,
                            conversationId: data.id,
                            visitorId
                        }
                    });

                    if (funcError) {
                        console.error('❌ Failed to invoke notification function:', funcError);
                    } else {
                        console.log('✅ Admin notification sent successfully. Response:', funcData);
                    }
                } catch (notifyError) {
                    console.error('❌ Error sending notification:', notifyError);
                    // Don't block the user flow if email fails
                }
            }
        } catch (e) {
            setError(e.message || 'Failed to start conversation');
        } finally {
            setLoading(false);
        }
    };

    // Send a message (visitor side)
    const sendMessage = async (text) => {
        if (!supabase) {
            setError('Chat is disabled: Missing Supabase configuration');
            return;
        }
        if (!conversation) return;
        setError(null);

        // Optimistic update - add message to UI immediately
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        const optimisticMessage = {
            id: tempId,
            conversation_id: conversation.id,
            sender_type: 'visitor',
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
                        conversation_id: conversation.id,
                        sender_type: 'visitor',
                        message: text,
                    },
                ])
                .select()
                .single();

            if (insertError) throw insertError;

            // Replace optimistic message with real one from database
            // The realtime subscription will be ignored for this message
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

    // Subscribe to realtime messages for the current conversation
    useEffect(() => {
        if (!supabase || !conversation) return;

        console.log('🚀 Setting up realtime subscription for conversation:', conversation.id);

        // Initial load of existing messages
        const fetchMessages = async () => {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversation.id)
                .order('created_at', { ascending: true });
            if (!fetchError) {
                console.log('📥 Loaded', data.length, 'existing messages');
                setMessages(data);
            } else {
                console.error('❌ Error loading messages:', fetchError);
            }
            setLoading(false);
        };
        fetchMessages();

        // Create a unique channel name for this conversation
        const channelName = `messages:${conversation.id}`;
        console.log('📡 Creating channel:', channelName);

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversation.id}`,
                },
                (payload) => {
                    console.log('🔔 Realtime message received (visitor):', payload.new);

                    // Only add messages from admin via realtime
                    // Visitor's own messages are handled via optimistic updates
                    if (payload.new.sender_type === 'visitor') {
                        console.log('⏭️ Skipping visitor message (handled by optimistic update)');
                        return;
                    }

                    // Prevent duplicates - check if message already exists
                    setMessages((prev) => {
                        const exists = prev.some((msg) => msg.id === payload.new.id);

                        if (exists) {
                            console.log('⚠️ Message already exists, skipping');
                            return prev;
                        }

                        console.log('✅ Adding admin message to list');
                        return [...prev, payload.new];
                    });
                }
            )
            .subscribe((status, err) => {
                console.log('📡 Realtime subscription status (visitor):', status);
                if (err) {
                    console.error('❌ Subscription error:', err);
                }
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Successfully subscribed to realtime updates!');
                }
                if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Channel error - realtime may not work');
                }
                if (status === 'TIMED_OUT') {
                    console.error('⏱️ Subscription timed out');
                }
            });

        return () => {
            console.log('🔌 Unsubscribing from channel:', channelName);
            supabase.removeChannel(channel);
        };
    }, [conversation]);

    // Load any existing conversation on mount
    useEffect(() => {
        loadConversation();
    }, [loadConversation]);

    const isConversationReady = !!conversation;

    return {
        conversation,
        messages,
        loading,
        error,
        startConversation,
        sendMessage,
        isConversationReady,
    };
};

export default useLiveChat;
