import React, { useState, useEffect } from 'react';
import ChatList from '../components/Dashboard/Messaging/ChatList';
import MessageWindow from '../components/Dashboard/Messaging/MessageWindow';
import NearestBrokerWidget from '../components/Dashboard/NearestBrokerWidget';

const DashboardMessages = () => {
  const [brokers, setBrokers] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      agency: 'Prime Realty Group',
      isOnline: true,
      lastMessage: 'Hi! I have some properties that might interest you.',
      lastMessageTime: '2m ago',
      unreadCount: 2,
    },
    {
      id: 2,
      name: 'Michael Chen',
      agency: 'Elite Properties',
      isOnline: false,
      lastMessage: 'Thank you for your interest. Let me know if you have any questions.',
      lastMessageTime: '1h ago',
      unreadCount: 0,
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      agency: 'City View Realty',
      isOnline: true,
      lastMessage: 'The viewing is scheduled for tomorrow at 3 PM.',
      lastMessageTime: '3h ago',
      unreadCount: 1,
    },
  ]);

  const [selectedBroker, setSelectedBroker] = useState(null);
  const [messages, setMessages] = useState({});

  // Initialize messages for selected broker
  useEffect(() => {
    if (selectedBroker && !messages[selectedBroker.id]) {
      setMessages((prev) => ({
        ...prev,
        [selectedBroker.id]: [
          {
            id: 1,
            senderId: 'broker',
            text: selectedBroker.lastMessage,
            timestamp: new Date(Date.now() - 120000).toISOString(),
          },
          {
            id: 2,
            senderId: 'user',
            text: 'Hello! I\'m interested in learning more.',
            timestamp: new Date(Date.now() - 60000).toISOString(),
          },
        ],
      }));
    }
  }, [selectedBroker]);

  const handleSendMessage = (text) => {
    if (!selectedBroker) return;

    const newMessage = {
      id: Date.now(),
      senderId: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedBroker.id]: [...(prev[selectedBroker.id] || []), newMessage],
    }));

    // Mock broker response after 2 seconds (simulating real-time)
    setTimeout(() => {
      const brokerResponse = {
        id: Date.now() + 1,
        senderId: 'broker',
        text: 'Thanks for your message! I\'ll get back to you shortly.',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => ({
        ...prev,
        [selectedBroker.id]: [...(prev[selectedBroker.id] || []), brokerResponse],
      }));

      // Update last message in broker list
      setBrokers((prev) =>
        prev.map((broker) =>
          broker.id === selectedBroker.id
            ? {
                ...broker,
                lastMessage: brokerResponse.text,
                lastMessageTime: 'Just now',
                unreadCount: 0,
              }
            : broker
        )
      );
    }, 2000);
  };

  const handleSelectBroker = (broker) => {
    setSelectedBroker(broker);
    // Mark as read
    setBrokers((prev) =>
      prev.map((b) => (b.id === broker.id ? { ...b, unreadCount: 0 } : b))
    );
  };

  return (
    <div className="p-4 lg:p-6 h-full">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">Chat with brokers and property agencies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Chat List and Message Window */}
        <div className="lg:col-span-3 flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ChatList
            brokers={brokers}
            selectedBroker={selectedBroker}
            onSelectBroker={handleSelectBroker}
          />
          <MessageWindow
            broker={selectedBroker}
            messages={selectedBroker ? messages[selectedBroker.id] || [] : []}
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* Nearest Broker Widget */}
        <div className="lg:col-span-1">
          <NearestBrokerWidget />
        </div>
      </div>
    </div>
  );
};

export default DashboardMessages;
