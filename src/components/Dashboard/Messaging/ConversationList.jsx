import React from 'react';
import { Search, Archive, Inbox, Circle } from 'lucide-react';
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
    <div className="w-full flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 flex-shrink-0 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 px-2">
          Messages
        </h2>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-orange-500 rounded-xl transition-all outline-none text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {filters.map((filterOption) => {
            // Unused Icon variable removed or kept if needed later? leaving it out from usage as per previous code
            const isActive = filter === filterOption.id;
            return (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                  ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                <span>{filterOption.label}</span>
                {filterOption.count !== undefined && filterOption.count > 0 && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${isActive
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
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
      <div className="flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar">
        {conversations.length === 0 ? (
          <div className="p-8 text-center mt-10">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              {searchQuery
                ? 'No matches found'
                : filter === 'archived'
                  ? 'No archived chats'
                  : 'No messages yet'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {searchQuery ? 'Try a different keyword' : 'Your conversations will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => {
              const isSelected = selectedConversationId === conversation.id;
              const lastMessage = conversation.messages[conversation.messages.length - 1];
              const hasUnread = conversation.unreadCount > 0;

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full p-3 text-left rounded-xl transition-all duration-200 group ${isSelected
                    ? 'bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-100 dark:ring-orange-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {conversation.agentAvatar ? (
                        <img
                          src={conversation.agentAvatar}
                          alt={conversation.agentName}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-white dark:ring-gray-700"
                        />
                      ) : (
                        <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white dark:ring-gray-700">
                          {conversation.agentName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {conversation.isOnline && (
                        <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className={`font-semibold text-sm truncate ${hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                          }`}>
                          {conversation.agentName}
                        </h3>
                        {lastMessage && (
                          <span className={`text-[10px] flex-shrink-0 ml-2 ${hasUnread
                            ? 'text-orange-600 dark:text-orange-400 font-semibold'
                            : 'text-gray-400 dark:text-gray-500'
                            }`}>
                            {formatTime(lastMessage.timestamp)}
                          </span>
                        )}
                      </div>

                      {/* Property Title context */}
                      {conversation.propertyTitle && (
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800/50 rounded text-gray-500 dark:text-gray-400 truncate max-w-full">
                            {conversation.propertyTitle}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <p className={`text-xs truncate transition-colors ${hasUnread
                          ? 'text-gray-900 dark:text-gray-100 font-medium'
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                          }`}>
                          {lastMessage?.text || 'No messages yet'}
                        </p>

                        {hasUnread && (
                          <span className="flex-shrink-0 ml-2 bg-orange-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                            {conversation.unreadCount}
                          </span>
                        )}
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
