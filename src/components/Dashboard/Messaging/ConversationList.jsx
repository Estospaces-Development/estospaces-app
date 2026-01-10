import React from 'react';
import { Search, Archive, Inbox, Filter, Circle } from 'lucide-react';
import { useMessages } from '../../../contexts/MessagesContext';

const ConversationList = ({ onSelectConversation, selectedConversationId }) => {
  const {
    conversations,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    totalUnreadCount,
  } = useMessages();

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filters = [
    { id: 'all', label: 'All', icon: Inbox },
    { id: 'unread', label: 'Unread', icon: Circle, count: totalUnreadCount },
    { id: 'archived', label: 'Archived', icon: Archive },
  ];

  return (
    <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Messages
        </h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {filters.map((filterOption) => {
            const Icon = filterOption.icon;
            const isActive = filter === filterOption.id;
            return (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon size={14} />
                <span>{filterOption.label}</span>
                {filterOption.count !== undefined && filterOption.count > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-orange-500 text-white'
                    }`}
                  >
                    {filterOption.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              {searchQuery
                ? 'No conversations found'
                : filter === 'archived'
                ? 'No archived conversations'
                : filter === 'unread'
                ? 'No unread messages'
                : 'No conversations yet'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'Try adjusting your search terms'
                : filter === 'archived'
                ? 'Archived conversations will appear here'
                : filter === 'unread'
                ? 'All caught up!'
                : 'Start a conversation by contacting an agent'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {conversations.map((conversation) => {
              const isSelected = selectedConversationId === conversation.id;
              const lastMessage = conversation.messages[conversation.messages.length - 1];

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    isSelected
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {conversation.agentAvatar ? (
                        <img
                          src={conversation.agentAvatar}
                          alt={conversation.agentName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {conversation.agentName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {/* Online/Offline Indicator */}
                      <div
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-800 ${
                          conversation.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">
                          {conversation.agentName}
                        </h3>
                        {lastMessage && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                            {formatTime(lastMessage.timestamp)}
                          </span>
                        )}
                      </div>

                      {/* Property Reference */}
                      {conversation.propertyTitle && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1 truncate">
                          {conversation.propertyTitle}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {lastMessage?.text || 'No messages yet'}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="flex-shrink-0 ml-2 bg-orange-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {conversation.agentAgency}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;

