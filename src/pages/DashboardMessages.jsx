import React, { useState, useEffect } from 'react';
import { MessageSquare, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMessages } from '../contexts/MessagesContext';
import ConversationList from '../components/Dashboard/Messaging/ConversationList';
import ConversationThread from '../components/Dashboard/Messaging/ConversationThread';
import MessageInput from '../components/Dashboard/Messaging/MessageInput';
import ConversationListSkeleton from '../components/Dashboard/Messaging/ConversationListSkeleton';
import ConversationThreadSkeleton from '../components/Dashboard/Messaging/ConversationThreadSkeleton';
import DashboardFooter from '../components/Dashboard/DashboardFooter';
import { MOCK_MESSAGES } from '../services/mockDataService';

const DashboardMessages = () => {
  const navigate = useNavigate();

  const conversations = MOCK_MESSAGES;
  const isLoading = false;

  const {
    selectedConversationId,
    setSelectedConversationId,
    sendMessage: contextSendMessage,
  } = useMessages();

  const sendMessage = (id, text, attachments) => {
    // Mock send message
    console.log('Sending message (mock):', text);
  };

  const [error, setError] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);

  // Handle mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [searchParams] = useSearchParams();

  // Handle new conversation from query params
  useEffect(() => {
    const newContactName = searchParams.get('newConversationWith');
    if (newContactName) {
      // Logic to find an existing conversation or "create" a new temporary one
      // For this mock implementation, we'll auto-select the first conversation if no match, 
      // or simply log it. In a real app, we'd add to the conversation list.
      const existing = conversations.find(c => c.contactName === newContactName || c.participants?.some(p => p.name === newContactName));

      if (existing) {
        setSelectedConversationId(existing.id);
      } else {
        // Mock creating a new one by selecting a default or showing a "New Message" state
        // For visual feedback, let's select the first one but show a toast/console logic
        console.log(`Starting new conversation with ${newContactName}`);
        // Optional: you could set a state to show a "New Conversation" header
      }
    }
  }, [searchParams, conversations, setSelectedConversationId]);

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    if (isMobileView) {
      // On mobile, hide conversation list when a conversation is selected
    }
  };

  const handleSend = (conversationId, text, attachments) => {
    try {
      sendMessage(conversationId, text, attachments);
      setError(null);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Simple & Clean */}
        <div className="py-6 mb-6 border-b border-gray-200 dark:border-gray-700 bg-white/50 backdrop-blur-sm -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent sm:backdrop-blur-none sm:border-b-0">
          <button
            onClick={() => navigate('/user/dashboard')}
            className="mb-4 flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Messages
          </h1>
        </div>



        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Content - Boxed Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Conversation List */}
          <div className="lg:col-span-4 flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {isLoading ? (
              <ConversationListSkeleton />
            ) : (
              <ConversationList
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversationId}
              />
            )}
          </div>

          {/* Right Main Area - Conversation Thread */}
          <div className="lg:col-span-8 flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {isLoading ? (
              <ConversationThreadSkeleton />
            ) : selectedConversationId ? (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-hidden relative">
                  <ConversationThread conversationId={selectedConversationId} />
                </div>
                <MessageInput
                  conversationId={selectedConversationId}
                  onSend={handleSend}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-gray-900/50">
                <div className="mb-6 relative">
                  <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center relative z-10 border border-gray-100 dark:border-gray-700">
                    <MessageSquare size={32} className="text-orange-500" />
                  </div>
                  <div className="absolute top-2 -right-8 w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-lg -rotate-12 z-0"></div>
                  <div className="absolute -bottom-2 -left-8 w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded-full z-0 opacity-50"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  You haven't selected an enquiry
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  Select a conversation from the list to view your chat history with agents.
                </p>
                <button className="mt-6 px-6 py-2.5 bg-white border border-orange-500 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
                  Search property to rent
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12">
        <DashboardFooter />
      </div>
    </div>
  );
};

export default DashboardMessages;
