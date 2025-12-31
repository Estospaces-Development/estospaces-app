import { useState } from 'react';
import { Search, Send, Paperclip, Smile } from 'lucide-react';
import BackButton from '../components/ui/BackButton';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: string;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<string>('1');
  const [messageInput, setMessageInput] = useState('');

  const conversations: Conversation[] = [
    {
      id: '1',
      name: 'Sarah Jenner',
      avatar: 'SJ',
      lastMessage: 'Thank you for the information!',
      timestamp: '2 min ago',
      unread: 2,
      messages: [
        {
          id: '1',
          text: 'Hello, I\'m interested in the Modern Downtown Apartment.',
          sender: 'contact',
          timestamp: '10:30 AM',
        },
        {
          id: '2',
          text: 'Hi Sarah! I\'d be happy to help you with that property.',
          sender: 'user',
          timestamp: '10:32 AM',
        },
        {
          id: '3',
          text: 'Could you provide more details about the amenities?',
          sender: 'contact',
          timestamp: '10:35 AM',
        },
        {
          id: '4',
          text: 'Of course! The apartment includes a gym, parking, and balcony.',
          sender: 'user',
          timestamp: '10:36 AM',
        },
        {
          id: '5',
          text: 'Thank you for the information!',
          sender: 'contact',
          timestamp: '10:40 AM',
        },
      ],
    },
    {
      id: '2',
      name: 'Emily Rodrigues',
      avatar: 'ER',
      lastMessage: 'When can we schedule a viewing?',
      timestamp: '15 min ago',
      unread: 0,
      messages: [],
    },
    {
      id: '3',
      name: 'David Smith',
      avatar: 'DS',
      lastMessage: 'I have a few questions about the lease terms.',
      timestamp: '1 hour ago',
      unread: 1,
      messages: [],
    },
  ];

  const currentConversation = conversations.find((c) => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // In a real app, this would send the message
      setMessageInput('');
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col font-sans">
      <div className="mb-4">
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Messages</h1>
      </div>

      <div className="flex-1 flex gap-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation === conversation.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {conversation.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-800 truncate">
                        {conversation.name}
                      </h3>
                      {conversation.unread > 0 && (
                        <span className="bg-primary text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-1">{conversation.lastMessage}</p>
                    <p className="text-xs text-gray-400">{conversation.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                  {currentConversation.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">{currentConversation.name}</h3>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {currentConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="p-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
