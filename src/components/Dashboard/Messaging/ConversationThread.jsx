import React, { useEffect, useRef, useState } from 'react';
import { MoreVertical, Archive, Bell, BellOff, Trash2, CheckCheck } from 'lucide-react';
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
    <div className="flex-1 flex flex-col bg-gray-50/30 dark:bg-gray-900/50 h-full relative">
      {/* Header - Minimal & Immersive */}
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-20 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {conversation.agentAvatar ? (
                <img
                  src={conversation.agentAvatar}
                  alt={conversation.agentName}
                  className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-white dark:ring-gray-800"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm">
                  {conversation.agentName.charAt(0).toUpperCase()}
                </div>
              )}
              <div
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 ${conversation.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}
              />
            </div>

            {/* Agent Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate flex items-center gap-2">
                {conversation.agentName}
                {conversation.agentAgency && (
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400">
                    {conversation.agentAgency}
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {conversation.isOnline ? (
                  <span className="text-green-600 dark:text-green-400 font-medium">Online now</span>
                ) : (
                  'Offline'
                )}
              </p>
            </div>
          </div>

          {/* Menu */}
          <div className="relative flex-shrink-0 flex items-center gap-1">
            <button className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all">
              <Bell size={18} />
            </button>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2 rounded-xl transition-all ${showMenu
                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 py-2 overflow-hidden transform origin-top-right transition-all">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700/50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Options</p>
                  </div>
                  <button
                    onClick={handleArchive}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <Archive size={16} />
                    <span>Archive Conversation</span>
                  </button>
                  <button
                    onClick={handleMute}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {conversation.isMuted ? (
                      <>
                        <Bell size={16} />
                        <span>Unmute Notifications</span>
                      </>
                    ) : (
                      <>
                        <BellOff size={16} />
                        <span>Mute Notifications</span>
                      </>
                    )}
                  </button>
                  <div className="my-1 border-t border-gray-100 dark:border-gray-700/50" />
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Delete Chat</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
        {/* Property Card */}
        {(conversation.propertyId || conversation.propertyTitle) && (
          <div className="mb-6 max-w-sm mx-auto">
            <PropertyCard property={conversation} />
          </div>
        )}

        {/* Messages */}
        {messageGroups.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 max-w-sm">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCheck size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Start Messaging</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                This is the beginning of your conversation with <span className="font-semibold text-gray-900 dark:text-gray-300">{conversation.agentName}</span>. Ask about property details, viewings, or making an offer.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 pb-4">
            {messageGroups.map((group, groupIndex) => (
              <div key={group.date} className="relative">
                {/* Date Separator */}
                <div className="flex items-center justify-center mb-6 sticky top-0 z-0">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-white dark:border-gray-700">
                    {group.formattedDate.toUpperCase()}
                  </span>
                </div>

                {/* Messages in Group */}
                <div className="space-y-2">
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
