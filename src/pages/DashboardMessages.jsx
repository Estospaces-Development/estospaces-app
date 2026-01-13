import React, { useState, useEffect } from 'react';
import { MessageSquare, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMessages } from '../contexts/MessagesContext';
import ConversationList from '../components/Dashboard/Messaging/ConversationList';
import ConversationThread from '../components/Dashboard/Messaging/ConversationThread';
import MessageInput from '../components/Dashboard/Messaging/MessageInput';
import ConversationListSkeleton from '../components/Dashboard/Messaging/ConversationListSkeleton';
import ConversationThreadSkeleton from '../components/Dashboard/Messaging/ConversationThreadSkeleton';
import NearestBrokerWidget from '../components/Dashboard/NearestBrokerWidget';
import DashboardFooter from '../components/Dashboard/DashboardFooter';

const DashboardMessages = () => {
  const navigate = useNavigate();
  const {
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    isLoading,
    sendMessage,
  } = useMessages();

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

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    if (isMobileView) {
      // On mobile, hide conversation list when a conversation is selected
      // This would be handled by a state or component structure
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
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
        {/* Back Button */}
        <button
          onClick={() => navigate('/user/dashboard')}
          className="mb-3 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-orange-500 mb-2">
          Messages
        </h1>
        <p className="text-gray-600 dark:text-orange-400">
          Chat with brokers and property agencies
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 lg:mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
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

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 h-full">
          {/* Conversation List and Thread */}
          <div className="lg:col-span-3 flex bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
            {/* Conversation List */}
            {isLoading ? (
              <ConversationListSkeleton />
            ) : (
              <ConversationList
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversationId}
              />
            )}

            {/* Conversation Thread */}
            <div className="flex-1 flex flex-col border-l border-gray-200 dark:border-gray-700">
              {isLoading ? (
                <ConversationThreadSkeleton />
              ) : selectedConversationId ? (
                <>
                  <div className="flex-1 overflow-hidden">
                    <ConversationThread conversationId={selectedConversationId} />
                  </div>
                  <MessageInput
                    conversationId={selectedConversationId}
                    onSend={handleSend}
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <div className="text-center p-8">
                    <MessageSquare
                      size={64}
                      className="mx-auto mb-4 text-gray-300 dark:text-gray-600"
                    />
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                      Select a conversation to start messaging
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Choose a conversation from the list to view messages and reply
                    </p>
                  </div>
                </div>
              )}
            </div>
        </div>

        {/* Nearest Broker Widget */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="h-full p-4 lg:p-6">
          <NearestBrokerWidget />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};

export default DashboardMessages;
