import React, { useEffect, useRef, useState } from 'react';
import { MoreVertical, Archive, Bell, BellOff, Trash2, Check, CheckCheck } from 'lucide-react';
import { useMessages } from '../../../contexts/MessagesContext';
import PropertyCard from './PropertyCard';
import MessageBubble from './MessageBubble';

const ConversationThread = ({ conversationId }) => {
  const {
    getConversation,
    markAsRead,
    archiveConversation,
    muteConversation,
    unmuteConversation,
    deleteConversation,
  } = useMessages();

  const conversation = getConversation(conversationId);
  const messagesEndRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);

  // Mark as read when conversation is opened
  useEffect(() => {
    if (conversation && conversation.unreadCount > 0) {
      markAsRead(conversationId);
    }
  }, [conversationId, conversation, markAsRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Conversation not found</p>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentGroup = null;

    messages.forEach((message) => {
      const messageDate = new Date(message.timestamp).toDateString();
      if (!currentGroup || currentGroup.date !== messageDate) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          date: messageDate,
          formattedDate: formatDate(message.timestamp),
          messages: [message],
        };
      } else {
        currentGroup.messages.push(message);
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const messageGroups = conversation.messages.length > 0 
    ? groupMessagesByDate(conversation.messages)
    : [];

  const handleArchive = () => {
    archiveConversation(conversationId);
    setShowMenu(false);
  };

  const handleMute = () => {
    if (conversation.isMuted) {
      unmuteConversation(conversationId);
    } else {
      muteConversation(conversationId);
    }
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(conversationId);
    }
    setShowMenu(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {conversation.agentAvatar ? (
                <img
                  src={conversation.agentAvatar}
                  alt={conversation.agentName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {conversation.agentName.charAt(0).toUpperCase()}
                </div>
              )}
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                  conversation.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>

            {/* Agent Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {conversation.agentName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {conversation.isOnline ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Online
                  </span>
                ) : (
                  'Offline'
                )}
                {conversation.agentAgency && ` • ${conversation.agentAgency}`}
              </p>
            </div>
          </div>

          {/* Menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1">
                  <button
                    onClick={handleArchive}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Archive size={16} />
                    <span>Archive</span>
                  </button>
                  <button
                    onClick={handleMute}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {conversation.isMuted ? (
                      <>
                        <Bell size={16} />
                        <span>Unmute</span>
                      </>
                    ) : (
                      <>
                        <BellOff size={16} />
                        <span>Mute</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Property Card */}
        {(conversation.propertyId || conversation.propertyTitle) && (
          <PropertyCard property={conversation} />
        )}

        {/* Messages */}
        {messageGroups.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messageGroups.map((group, groupIndex) => (
              <div key={group.date}>
                {/* Date Separator */}
                <div className="text-center mb-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {group.formattedDate}
                  </span>
                </div>

                {/* Messages in Group */}
                <div className="space-y-3">
                  {group.messages.map((message, messageIndex) => {
                    const isUser = message.senderType === 'user';
                    const showAvatar = 
                      !isUser && 
                      (messageIndex === 0 || 
                       group.messages[messageIndex - 1].senderType !== 'agent');

                    return (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isUser={isUser}
                        showAvatar={showAvatar}
                        agentName={conversation.agentName}
                        agentAvatar={conversation.agentAvatar}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ConversationThread;

