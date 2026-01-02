import React from 'react';
import { HelpCircle, MessageSquare, Book, Mail } from 'lucide-react';

const DashboardHelp = () => {
  const helpTopics = [
    { icon: Book, title: 'Documentation', description: 'Browse our comprehensive guides' },
    { icon: MessageSquare, title: 'Live Chat', description: 'Chat with our support team' },
    { icon: Mail, title: 'Email Support', description: 'Send us an email at support@estospaces.com' },
  ];

  const faqs = [
    { question: 'How do I add a new property?', answer: 'Go to Discover Properties and use the search filters...' },
    { question: 'How do I make a payment?', answer: 'Navigate to the Payments section and click Make Payment...' },
    { question: 'How do I view my contracts?', answer: 'All your contracts are available in the Contracts section...' },
  ];

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Help & Support</h1>
        <p className="text-gray-600">Get help with your account and properties</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {helpTopics.map((topic, index) => {
          const Icon = topic.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-4">
                <Icon className="text-red-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{topic.title}</h3>
              <p className="text-sm text-gray-600">{topic.description}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
              <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-sm text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHelp;

