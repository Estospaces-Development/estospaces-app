import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LakshmiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hello! I'm Lakshmi, your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Hardcoded responses - API-ready structure
  const responses = {
    // Property search assistance
    property: {
      keywords: ['property', 'house', 'apartment', 'rent', 'buy', 'search', 'find property', 'listing'],
      responses: [
        "To search for properties, you can use the 'Discover Properties' page. I can help you navigate there!",
        "You can filter properties by location, type, price, and more. Would you like me to show you how?",
        "Properties are available on the Discover page. You can filter by apartment, house, condo, and more.",
      ],
    },
    navigation: {
      keywords: ['go to', 'navigate', 'show me', 'where is', 'how to get to', 'open', 'visit'],
      pages: {
        'dashboard': { path: '/user/dashboard', name: 'Dashboard' },
        'discover': { path: '/user/dashboard/discover', name: 'Discover Properties' },
        'properties': { path: '/user/dashboard/discover', name: 'Discover Properties' },
        'messages': { path: '/user/dashboard/messages', name: 'Messages' },
        'payments': { path: '/user/dashboard/payments', name: 'Payments' },
        'contracts': { path: '/user/dashboard/contracts', name: 'Contracts' },
        'profile': { path: '/user/dashboard/profile', name: 'Profile' },
        'settings': { path: '/user/dashboard/settings', name: 'Settings' },
        'help': { path: '/user/dashboard/help', name: 'Help & Support' },
      },
    },
    faq: {
      keywords: ['how', 'what', 'why', 'when', 'faq', 'question', 'help', 'explain'],
      responses: [
        {
          question: 'how do I search for properties',
          answer: 'You can search for properties on the Discover Properties page. Use filters to narrow down by location, type, price range, and features.',
        },
        {
          question: 'how do I apply for a property',
          answer: 'To apply for a property, go to Discover Properties, find a property you like, click "View Details", and then "Apply Now".',
        },
        {
          question: 'how do I make a payment',
          answer: 'Go to the Payments page from the sidebar. You can pay rent or utility bills using the Pay Now button. We accept major credit cards.',
        },
        {
          question: 'how do I view my contracts',
          answer: 'All your contracts are available on the Contracts page. You can view, download, and sign contracts digitally from there.',
        },
        {
          question: 'how do I contact a broker',
          answer: 'You can contact brokers through the Messages page. Browse available brokers and start a conversation with them.',
        },
        {
          question: 'what is the 24-hour process',
          answer: 'The 24-Hour Process & Key Handover Promise allows you to get keys within 24 hours of approval, subject to conditions. Check the banner on your dashboard for details.',
        },
      ],
    },
    greeting: {
      keywords: ['hello', 'hi', 'hey', 'greetings'],
      responses: [
        "Hello! I'm Lakshmi, your AI assistant. How can I help you today?",
        "Hi there! How can I assist you with your property search today?",
        "Hey! I'm here to help. What would you like to know?",
      ],
    },
  };

  const getResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase().trim();

    // Check for greetings
    if (responses.greeting.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return responses.greeting.responses[
        Math.floor(Math.random() * responses.greeting.responses.length)
      ];
    }

    // Check for navigation requests
    for (const [pageKey, pageInfo] of Object.entries(responses.navigation.pages)) {
      if (lowerMessage.includes(pageKey)) {
        setTimeout(() => {
          navigate(pageInfo.path);
        }, 1000);
        return `I'll take you to ${pageInfo.name} now. ${pageInfo.name === 'Dashboard' ? 'You\'re already here!' : ''}`;
      }
    }

    // Check for FAQ questions
    for (const faq of responses.faq.responses) {
      if (lowerMessage.includes(faq.question.toLowerCase())) {
        return faq.answer;
      }
    }

    // Check for property-related queries
    if (responses.property.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return responses.property.responses[
        Math.floor(Math.random() * responses.property.responses.length)
      ];
    }

    // Check for general FAQ keywords
    if (responses.faq.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return "I can help you with property searches, navigation, payments, contracts, and more. What specific question do you have?";
    }

    // Default response
    return "I'm here to help with property searches, navigation, and FAQs. Try asking me about properties, payments, contracts, or how to navigate the dashboard!";
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot thinking (API-ready)
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        text: getResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 500);
  };

  const handleQuickAction = (action) => {
    const quickMessages = {
      'find properties': 'Show me how to find properties',
      'view payments': 'Go to payments',
      'view contracts': 'Go to contracts',
      'contact support': 'How do I contact support',
    };

    setInputValue(quickMessages[action]);
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: quickMessages[action],
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        text: getResponse(quickMessages[action]),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 500);
  };

  return (
    <>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-40"
          aria-label="Open Lakshmi Assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col z-40 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Lakshmi</h3>
                <p className="text-xs text-orange-100">AI Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-orange-500 dark:bg-orange-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600'
                    }`}
                >
                  {message.type === 'bot' && (
                    <div className="flex items-center gap-2 mb-1">
                      <Bot size={14} className="text-orange-500" />
                      <span className="text-xs font-medium text-gray-600">Lakshmi</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 pt-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 px-2">Quick actions:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickAction('find properties')}
                  className="text-left px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Find Properties
                </button>
                <button
                  onClick={() => handleQuickAction('view payments')}
                  className="text-left px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
                >
                  View Payments
                </button>
                <button
                  onClick={() => handleQuickAction('view contracts')}
                  className="text-left px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
                >
                  View Contracts
                </button>
                <button
                  onClick={() => handleQuickAction('contact support')}
                  className="text-left px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default LakshmiAssistant;

