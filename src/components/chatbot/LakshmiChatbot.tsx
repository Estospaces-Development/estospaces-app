import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Mic, MicOff, Bot, User } from 'lucide-react';
import { useProperties } from '../../contexts/PropertyContext';
import { useLeads } from '../../contexts/LeadContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface LakshmiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const LakshmiChatbot = ({ isOpen, onClose }: LakshmiChatbotProps) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Ask Lakshmi, your AI assistant. I can help you with questions about your properties, leads, dashboard analytics, and provide insights. I can also navigate you to different sections. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { properties } = useProperties();
  const { leads } = useLeads();

  // Navigation mapping
  const navigationMap: { [key: string]: { path: string; name: string } } = {
    'dashboard': { path: '/', name: 'Dashboard' },
    'home': { path: '/', name: 'Dashboard' },
    'properties': { path: '/properties', name: 'Properties' },
    'property': { path: '/properties', name: 'Properties' },
    'leads': { path: '/leads', name: 'Leads & Clients' },
    'lead': { path: '/leads', name: 'Leads & Clients' },
    'clients': { path: '/leads', name: 'Leads & Clients' },
    'client': { path: '/leads', name: 'Leads & Clients' },
    'application': { path: '/application', name: 'Application' },
    'applications': { path: '/application', name: 'Application' },
    'appointment': { path: '/appointment', name: 'Appointment' },
    'appointments': { path: '/appointment', name: 'Appointment' },
    'messages': { path: '/messages', name: 'Messages' },
    'message': { path: '/messages', name: 'Messages' },
    'analytics': { path: '/analytics', name: 'Analytics' },
    'analytic': { path: '/analytics', name: 'Analytics' },
    'analysis': { path: '/analytics', name: 'Analytics' },
    'billing': { path: '/billing', name: 'Billing' },
    'bill': { path: '/billing', name: 'Billing' },
    'payment': { path: '/billing', name: 'Billing' },
    'payments': { path: '/billing', name: 'Billing' },
    'help': { path: '/help', name: 'Help & Support' },
    'support': { path: '/help', name: 'Help & Support' },
  };

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
          // Process the transcript after state update
          setTimeout(() => {
            processMessage(transcript);
          }, 100);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          addMessage('bot', "I'm sorry, I couldn't hear you clearly. Please try again or type your message.");
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (sender: 'user' | 'bot', text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
        addMessage('bot', "Voice recognition is not available in your browser. Please type your message instead.");
      }
    } else if (!recognitionRef.current) {
      addMessage('bot', "Voice recognition is not available in your browser. Please type your message instead.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const analyzeQuestion = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    setIsProcessing(true);

    // Navigation requests - check first
    const navigationKeywords = ['take me to', 'go to', 'navigate to', 'open', 'show me', 'bring me to', 'switch to', 'visit'];
    const hasNavigationIntent = navigationKeywords.some(keyword => lowerQuestion.includes(keyword));

    if (hasNavigationIntent) {
      // Find matching navigation target
      for (const [key, value] of Object.entries(navigationMap)) {
        if (lowerQuestion.includes(key)) {
          // Navigate after a short delay to show the message first
          setTimeout(() => {
            navigate(value.path);
            onClose(); // Close chatbot after navigation
          }, 500);
          return `Taking you to ${value.name}...`;
        }
      }
      // If navigation intent but no match found
      return "I can help you navigate to: Dashboard, Properties, Leads & Clients, Application, Appointment, Messages, Analytics, Billing, or Help & Support. Which one would you like to visit?";
    }

    // Property-related questions
    if (lowerQuestion.includes('property') || lowerQuestion.includes('properties') || lowerQuestion.includes('listing')) {
      const totalProperties = properties.length;
      const publishedProperties = properties.filter(p => p.published).length;
      const draftProperties = properties.filter(p => p.draft).length;
      const availableProperties = properties.filter(p => p.status === 'Available' || p.status === 'available').length;

      if (lowerQuestion.includes('total') || lowerQuestion.includes('how many')) {
        return `You currently have ${totalProperties} ${totalProperties === 1 ? 'property' : 'properties'} in your portfolio. ${publishedProperties} ${publishedProperties === 1 ? 'is' : 'are'} published, ${draftProperties} ${draftProperties === 1 ? 'is' : 'are'} in draft, and ${availableProperties} ${availableProperties === 1 ? 'is' : 'are'} available.`;
      }

      if (lowerQuestion.includes('recent') || lowerQuestion.includes('latest') || lowerQuestion.includes('new')) {
        const recentProperties = [...properties]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        
        if (recentProperties.length > 0) {
          const propertyList = recentProperties.map(p => `"${p.title}"`).join(', ');
          return `Your most recent properties are: ${propertyList}. Would you like details about any specific property?`;
        }
        return "You don't have any properties yet. Would you like to add one?";
      }

      if (lowerQuestion.includes('price') || lowerQuestion.includes('cost') || lowerQuestion.includes('rent')) {
        const prices = properties
          .filter(p => p.price)
          .map(p => parseFloat(p.price.replace(/[^0-9.]/g, '')))
          .filter(p => !isNaN(p));
        
        if (prices.length > 0) {
          const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
          const maxPrice = Math.max(...prices);
          const minPrice = Math.min(...prices);
          return `Based on your properties: Average price is $${avgPrice.toFixed(2)}, highest is $${maxPrice.toFixed(2)}, and lowest is $${minPrice.toFixed(2)}.`;
        }
        return "I don't have pricing information for your properties yet.";
      }

      return `You have ${totalProperties} properties in your portfolio. ${publishedProperties} are published and ${availableProperties} are currently available. Would you like to know more about any specific property?`;
    }

    // Dashboard analytics questions
    if (lowerQuestion.includes('dashboard') || lowerQuestion.includes('analytics') || lowerQuestion.includes('statistics') || lowerQuestion.includes('stats')) {
      const totalProperties = properties.length;
      const totalLeads = leads.length;
      const activeLeads = leads.filter(l => l.status === 'In Progress' || l.status === 'New Lead').length;
      const approvedLeads = leads.filter(l => l.status === 'Approved').length;
      
      return `Here's your dashboard summary: You have ${totalProperties} properties, ${totalLeads} leads (${activeLeads} active, ${approvedLeads} approved). Your portfolio is growing! Would you like more detailed analytics?`;
    }

    // Leads questions
    if (lowerQuestion.includes('lead') || lowerQuestion.includes('client') || lowerQuestion.includes('inquiry')) {
      const totalLeads = leads.length;
      const newLeads = leads.filter(l => l.status === 'New Lead').length;
      const inProgress = leads.filter(l => l.status === 'In Progress').length;
      const approved = leads.filter(l => l.status === 'Approved').length;

      if (lowerQuestion.includes('total') || lowerQuestion.includes('how many')) {
        return `You have ${totalLeads} leads: ${newLeads} new, ${inProgress} in progress, and ${approved} approved.`;
      }

      if (lowerQuestion.includes('recent') || lowerQuestion.includes('latest')) {
        const recentLeads = [...leads]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        
        if (recentLeads.length > 0) {
          const leadList = recentLeads.map(l => `${l.name} (${l.status})`).join(', ');
          return `Your most recent leads are: ${leadList}.`;
        }
        return "You don't have any leads yet.";
      }

      return `You have ${totalLeads} leads in your system. ${newLeads} are new leads that need attention. Would you like to see details about any specific lead?`;
    }

    // Future analysis questions
    if (lowerQuestion.includes('future') || lowerQuestion.includes('forecast') || lowerQuestion.includes('prediction') || lowerQuestion.includes('trend') || lowerQuestion.includes('analysis')) {
      const totalProperties = properties.length;
      const totalLeads = leads.length;
      const conversionRate = totalLeads > 0 ? ((leads.filter(l => l.status === 'Approved').length / totalLeads) * 100).toFixed(1) : '0';
      
      return `Based on your current data: You have ${totalProperties} properties and ${totalLeads} leads with a ${conversionRate}% approval rate. The trend suggests steady growth. To improve, consider focusing on properties with higher lead interest and optimizing your conversion funnel. Would you like specific recommendations?`;
    }

    // Performance questions
    if (lowerQuestion.includes('performance') || lowerQuestion.includes('best') || lowerQuestion.includes('top')) {
      if (properties.length > 0) {
        const propertiesWithViews = properties.map(p => ({
          ...p,
          views: Math.floor(Math.random() * 500) + 50, // Simulated views
        }));
        const topProperty = propertiesWithViews.sort((a, b) => b.views - a.views)[0];
        return `Your top-performing property is "${topProperty.title}" with high engagement. Properties in the "${topProperty.propertyType}" category are showing strong performance. Consider adding similar properties to your portfolio.`;
      }
      return "I need more data to provide performance insights. Keep adding properties and I'll analyze their performance for you.";
    }

    // Greetings
    if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi') || lowerQuestion.includes('hey')) {
      return "Hello! I'm Ask Lakshmi, your AI assistant. I can help you with questions about your properties, leads, dashboard analytics, and provide insights. I can also navigate you to different sections - just say 'take me to [section name]'. What would you like to know?";
    }

    // Help
    if (lowerQuestion.includes('help') || lowerQuestion.includes('what can you') || lowerQuestion.includes('what do you')) {
      return "I can help you with:\n• Property information and statistics\n• Lead and client data\n• Dashboard analytics and insights\n• Future predictions and trends\n• Performance analysis\n• Navigation to different sections (just say 'take me to [section]')\n\nJust ask me anything about your dashboard or ask me to navigate you somewhere!";
    }

    // Default response
    return "I understand you're asking about: " + question + ". Let me help you with that. Could you be more specific? For example, you can ask about your properties, leads, dashboard statistics, or future analysis.";
  };

  const processMessage = (messageText: string) => {
    if (!messageText.trim()) return;

    addMessage('user', messageText);
    setIsProcessing(true);

    // Simulate processing delay
    setTimeout(() => {
      const response = analyzeQuestion(messageText);
      addMessage('bot', response);
      setIsProcessing(false);
    }, 800);
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    setInputText('');
    processMessage(messageText);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-orange-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Ask Lakshmi</h3>
              <p className="text-xs text-orange-100">AI Assistant</p>
            </div>
          </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'bot' && (
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {message.sender === 'user' && (
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </div>
            )}
          </div>
        ))}
        {isProcessing && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`p-2 rounded-lg transition-colors ${
              isListening
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? "Listening..." : "Type your message..."}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isListening}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing || isListening}
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        {isListening && (
          <p className="text-xs text-red-500 mt-2 text-center animate-pulse">
            🎤 Listening... Speak now
          </p>
        )}
      </div>
    </div>
  );
};

export default LakshmiChatbot;

