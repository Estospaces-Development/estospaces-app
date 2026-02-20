import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, ArrowRight, Mic, MicOff, Loader2, MapPin, Home, TrendingUp, Eye, Heart, FileText, Map as MapIcon, Sparkles, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../../contexts/PropertiesContext';
import { useUserLocation } from '../../contexts/LocationContext';
import { useSavedProperties } from '../../contexts/SavedPropertiesContext';

const LakshmiAssistant = () => {
  const navigate = useNavigate();
  const { currentUser, viewedProperties, savedProperties: contextSavedProps, appliedProperties } = useProperties();
  const { activeLocation } = useUserLocation();
  const { savedProperties: savedProps } = useSavedProperties();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false); // Disabled welcome popup

  // Draggable button state
  const [buttonPosition, setButtonPosition] = useState({ x: null, y: null }); // null means use default position
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false); // Track if user actually moved the button
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  // Handle mouse/touch drag start
  const handleDragStart = useCallback((e) => {
    if (!buttonRef.current) return;

    e.preventDefault();
    setIsDragging(true);
    setHasDragged(false); // Reset drag tracking

    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    const rect = buttonRef.current.getBoundingClientRect();
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top
    });
  }, []);

  // Handle mouse/touch drag move
  const handleDragMove = useCallback((e) => {
    if (!isDragging) return;

    e.preventDefault();
    setHasDragged(true); // User is actually dragging

    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    // Calculate new position (accounting for button size)
    const buttonWidth = buttonRef.current?.offsetWidth || 140;
    const buttonHeight = buttonRef.current?.offsetHeight || 44;

    // Keep within viewport bounds
    const newX = Math.max(0, Math.min(window.innerWidth - buttonWidth, clientX - dragOffset.x));
    const newY = Math.max(0, Math.min(window.innerHeight - buttonHeight, clientY - dragOffset.y));

    setButtonPosition({ x: newX, y: newY });
  }, [isDragging, dragOffset]);

  // Handle mouse/touch drag end
  const handleDragEnd = useCallback(() => {
    // Small delay to allow click handler to check hasDragged
    setTimeout(() => {
      setIsDragging(false);
    }, 10);
  }, []);

  // Add/remove event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Onboarding prompts - Enhanced with icons and categories
  const onboardingPrompts = [
    { text: "🏠 Properties near me", query: "Show me properties near me", category: "search" },
    { text: "🔥 Trending properties", query: "Show trending properties", category: "search" },
    { text: "👀 Most viewed homes", query: "Show most viewed properties", category: "search" },
    { text: "💰 Rentals under £1500", query: "Find rentals under 1500", category: "filter" },
    { text: "📝 How to apply", query: "How do I apply for a property?", category: "help" },
  ];

  // Quick action suggestions shown after responses
  const quickActions = [
    { text: "Show more", query: "Show me more properties" },
    { text: "Filter by price", query: "Show rentals under 2000" },
    { text: "Browse all", query: "Take me to discover" },
  ];

  // Initialize and check onboarding status - Using localStorage (no API calls)
  useEffect(() => {
    const initializeChat = () => {
      // Check if user has completed onboarding using localStorage
      const onboardingKey = currentUser ? `lakshmi_onboarding_${currentUser.id}` : 'lakshmi_onboarding_guest';
      const hasCompleted = localStorage.getItem(onboardingKey) === 'true';

      if (hasCompleted) {
        setOnboardingCompleted(true);
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
      }

      // Start with empty messages
      setMessages([]);
    };

    initializeChat();
  }, [currentUser]);

  // Add welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const userName = currentUser?.user_metadata?.full_name?.split(' ')[0] || 'there';
      const greeting = getTimeBasedGreeting();
      const welcomeMessage = {
        id: Date.now() + Math.random(),
        type: 'bot',
        text: `${greeting}, ${userName}! 👋\n\nI'm Lakshmi, your AI property assistant. I can help you:\n\n• Find properties near you\n• Search by price, bedrooms, or location\n• Navigate the dashboard\n• Answer property questions\n\nWhat would you like to explore today?`,
        data: null,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Initialize voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-GB';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
        // Auto-submit after voice input
        setTimeout(() => {
          handleSendMessage(transcript);
        }, 300);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate smart suggestions based on user activity
  useEffect(() => {
    if (!isOpen || !currentUser || messages.length === 0) return;

    const generateSuggestions = () => {
      const suggestions = [];

      // Check if user has viewed properties
      if (viewedProperties && viewedProperties.length > 0) {
        suggestions.push({
          text: "Find similar properties nearby",
          query: "Show me similar properties",
          icon: TrendingUp,
        });
      }

      // Check if user has saved properties
      if (savedProps && savedProps.length > 0) {
        suggestions.push({
          text: "View my saved properties",
          query: "Show my saved properties",
          icon: Heart,
        });
      }

      // Check if user has active applications
      if (appliedProperties && appliedProperties.length > 0) {
        suggestions.push({
          text: "Check my applications",
          query: "Show my applications",
          icon: FileText,
        });
      }

      // Location-based suggestion
      if (activeLocation?.postcode) {
        suggestions.push({
          text: `Properties near ${activeLocation.postcode}`,
          query: `Show properties near ${activeLocation.postcode}`,
          icon: MapPin,
        });
      }

      setSmartSuggestions(suggestions.slice(0, 3));
    };

    // Show suggestions after a delay if no recent activity
    const timer = setTimeout(generateSuggestions, 3000);
    return () => clearTimeout(timer);
  }, [isOpen, currentUser, messages.length, viewedProperties, savedProps, appliedProperties, activeLocation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mark onboarding as completed - Using localStorage (no API calls)
  const markOnboardingCompleted = () => {
    const onboardingKey = currentUser ? `lakshmi_onboarding_${currentUser.id}` : 'lakshmi_onboarding_guest';
    try {
      localStorage.setItem(onboardingKey, 'true');
      setOnboardingCompleted(true);
    } catch (error) {
      console.warn('Could not save onboarding status to localStorage:', error);
    }
  };

  // Parse natural language query for property search
  const parsePropertyQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    const params = {
      location: null,
      bedrooms: null,
      bathrooms: null,
      minPrice: null,
      maxPrice: null,
      propertyType: null, // 'rent' or 'sale'
      searchType: null, // 'trending', 'most-viewed', 'recent', 'high-demand'
    };

    // Extract location (postcode, city, or "near me")
    const postcodeMatch = lowerQuery.match(/\b([a-z]{1,2}\d{1,2}[a-z]?\s?\d[a-z]{2})\b/i);
    const cityMatch = lowerQuery.match(/\b(london|manchester|birmingham|leeds|edinburgh|glasgow|liverpool|bristol|sheffield|newcastle|cardiff|belfast)\b/);
    const nearMeMatch = lowerQuery.match(/\b(near me|nearby|close to me|in my area)\b/);

    if (postcodeMatch) {
      params.location = postcodeMatch[1].toUpperCase().replace(/\s/g, '');
    } else if (cityMatch) {
      params.location = cityMatch[1].charAt(0).toUpperCase() + cityMatch[1].slice(1);
    } else if (nearMeMatch && activeLocation) {
      params.location = activeLocation.postcode || activeLocation.city || 'near you';
    }

    // Extract bedrooms
    const bedMatch = lowerQuery.match(/\b(\d+)\s*(bed|bedroom|bedrooms|br)\b/);
    if (bedMatch) {
      params.bedrooms = parseInt(bedMatch[1]);
    }

    // Extract bathrooms
    const bathMatch = lowerQuery.match(/\b(\d+)\s*(bath|bathroom|bathrooms)\b/);
    if (bathMatch) {
      params.bathrooms = parseInt(bathMatch[1]);
    }

    // Extract price range
    const priceUnderMatch = lowerQuery.match(/\b(under|below|less than|max|maximum)\s*[£$]?(\d+[k]?)\b/);
    const priceOverMatch = lowerQuery.match(/\b(over|above|more than|min|minimum)\s*[£$]?(\d+[k]?)\b/);
    const priceRangeMatch = lowerQuery.match(/\b[£$]?(\d+[k]?)\s*(to|-|and)\s*[£$]?(\d+[k]?)\b/);

    if (priceUnderMatch) {
      let maxPrice = priceUnderMatch[2].replace('k', '000');
      params.maxPrice = parseInt(maxPrice);
    } else if (priceOverMatch) {
      let minPrice = priceOverMatch[2].replace('k', '000');
      params.minPrice = parseInt(minPrice);
    } else if (priceRangeMatch) {
      let minPrice = priceRangeMatch[1].replace('k', '000');
      let maxPrice = priceRangeMatch[3].replace('k', '000');
      params.minPrice = parseInt(minPrice);
      params.maxPrice = parseInt(maxPrice);
    }

    // Extract property type
    if (lowerQuery.match(/\b(rent|rental|renting|to rent|for rent)\b/)) {
      params.propertyType = 'rent';
    } else if (lowerQuery.match(/\b(buy|purchase|sale|for sale|to buy)\b/)) {
      params.propertyType = 'sale';
    }

    // Extract search type
    if (lowerQuery.match(/\b(trending|popular|hot)\b/)) {
      params.searchType = 'trending';
    } else if (lowerQuery.match(/\b(most viewed|most popular|viewed)\b/)) {
      params.searchType = 'most-viewed';
    } else if (lowerQuery.match(/\b(recent|new|newly added|latest)\b/)) {
      params.searchType = 'recent';
    } else if (lowerQuery.match(/\b(high demand|in demand|demand)\b/)) {
      params.searchType = 'high-demand';
    }

    return params;
  };

  // Get contextual information about user
  const getUserContext = useCallback(async () => {
    if (!currentUser) return null;

    try {
      const context = {
        viewedCount: viewedProperties?.length || 0,
        savedCount: savedProps?.length || 0,
        appliedCount: appliedProperties?.length || 0,
        location: activeLocation?.postcode || activeLocation?.city || null,
        recentViews: viewedProperties?.slice(0, 3) || [],
      };

      return context;
    } catch (error) {
      console.error('Error getting user context:', error);
      return {
        viewedCount: viewedProperties?.length || 0,
        savedCount: savedProps?.length || 0,
        appliedCount: appliedProperties?.length || 0,
        location: activeLocation?.postcode || activeLocation?.city || null,
        recentViews: [],
      };
    }
  }, [currentUser, viewedProperties, savedProps, appliedProperties, activeLocation]);

  // Process property search query - Using mock data only, no API calls
  const handlePropertySearch = async (query, parsedParams) => {
    setIsProcessing(true);

    try {
      let searchMessage = "Here are some properties I found:";

      // Rich mock property data generator
      const generateMockProperties = (count = 6, params = {}) => {
        const propertyTypes = ['Apartment', 'House', 'Flat', 'Studio', 'Penthouse', 'Townhouse'];
        const areas = [
          { city: 'London', postcodes: ['SW1A 2AA', 'W1J 5PA', 'EC1A 1BB', 'NW1 6XE', 'SE1 7AB', 'E14 5AB'] },
          { city: 'Manchester', postcodes: ['M1 1HP', 'M2 4WU', 'M3 4JH', 'M4 5FT', 'M15 4PS'] },
          { city: 'Birmingham', postcodes: ['B1 1AA', 'B2 4ND', 'B3 2NS', 'B5 4BU'] },
          { city: 'Edinburgh', postcodes: ['EH1 1YZ', 'EH2 2ER', 'EH3 6SS', 'EH4 1NZ'] },
          { city: 'Bristol', postcodes: ['BS1 4DJ', 'BS2 0JP', 'BS8 1TH'] },
        ];
        const streets = ['High Street', 'King\'s Road', 'Queen Street', 'Park Lane', 'Victoria Road', 'Church Street', 'Station Road', 'Mill Lane', 'The Grove', 'Manor Drive'];
        const images = [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
          'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        ];

        // Find matching area if location specified
        let selectedArea = areas[0]; // Default to London
        if (params.location) {
          const locationLower = params.location.toLowerCase();
          const matchedArea = areas.find(a =>
            a.city.toLowerCase().includes(locationLower) ||
            a.postcodes.some(p => p.toLowerCase().startsWith(locationLower.substring(0, 2)))
          );
          if (matchedArea) selectedArea = matchedArea;
        } else if (activeLocation?.city) {
          const cityLower = activeLocation.city.toLowerCase();
          const matchedArea = areas.find(a => a.city.toLowerCase() === cityLower);
          if (matchedArea) selectedArea = matchedArea;
        }

        return Array.from({ length: count }).map((_, i) => {
          const propType = params.propertyType || (i % 2 === 0 ? 'rent' : 'sale');
          const bedrooms = params.bedrooms || (2 + (i % 3));
          const bathrooms = params.bathrooms || (1 + (i % 2));

          // Calculate price based on type and params
          let basePrice = propType === 'rent' ? 1200 : 250000;
          if (params.maxPrice) {
            basePrice = Math.floor(params.maxPrice * 0.7 + (Math.random() * params.maxPrice * 0.25));
          } else if (params.minPrice) {
            basePrice = params.minPrice + Math.floor(Math.random() * params.minPrice * 0.5);
          } else {
            basePrice = propType === 'rent'
              ? 1000 + (i * 200) + Math.floor(Math.random() * 500)
              : 200000 + (i * 50000) + Math.floor(Math.random() * 100000);
          }

          const propertyTypeName = propertyTypes[i % propertyTypes.length];
          const street = streets[i % streets.length];
          const postcode = selectedArea.postcodes[i % selectedArea.postcodes.length];

          // Generate view count for trending/most-viewed
          const viewCount = params.searchType === 'most-viewed'
            ? 500 + Math.floor(Math.random() * 500)
            : params.searchType === 'trending'
              ? 200 + Math.floor(Math.random() * 300)
              : 10 + Math.floor(Math.random() * 100);

          return {
            id: `mock-${Date.now()}-${i}`,
            title: `${bedrooms} Bed ${propertyTypeName} in ${selectedArea.city}`,
            address_line_1: `${10 + i * 5} ${street}`,
            city: selectedArea.city,
            postcode: postcode,
            price: basePrice,
            bedrooms: bedrooms,
            bathrooms: bathrooms,
            property_type: propType,
            image_urls: [images[i % images.length], images[(i + 1) % images.length]],
            description: `A stunning ${bedrooms} bedroom ${propertyTypeName.toLowerCase()} in the heart of ${selectedArea.city}. This property features ${bathrooms} bathroom${bathrooms > 1 ? 's' : ''}, modern amenities, and excellent transport links.`,
            featured: i === 0,
            view_count: viewCount,
            created_at: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
            latitude: 51.5074 + (Math.random() * 0.1 - 0.05),
            longitude: -0.1278 + (Math.random() * 0.1 - 0.05),
            property_size_sqm: 50 + (bedrooms * 20) + Math.floor(Math.random() * 30),
          };
        });
      };

      // Generate mock results based on search type
      let results = [];

      if (parsedParams.searchType === 'trending') {
        results = generateMockProperties(6, { ...parsedParams, searchType: 'trending' });
        searchMessage = "🔥 Here are trending properties in your area:";
      } else if (parsedParams.searchType === 'most-viewed') {
        results = generateMockProperties(6, { ...parsedParams, searchType: 'most-viewed' });
        searchMessage = "👀 Here are the most viewed properties:";
      } else if (parsedParams.searchType === 'recent') {
        results = generateMockProperties(6, { ...parsedParams, searchType: 'recent' });
        searchMessage = "✨ Here are recently added properties:";
      } else if (parsedParams.searchType === 'high-demand') {
        results = generateMockProperties(6, { ...parsedParams, searchType: 'high-demand' });
        searchMessage = "🏠 Here are high demand properties:";
      } else {
        // Regular search with filters
        results = generateMockProperties(6, parsedParams);

        // Create contextual message
        const locationText = parsedParams.location || activeLocation?.postcode || activeLocation?.city || 'your area';
        if (parsedParams.maxPrice) {
          searchMessage = `💰 Here are properties under £${parsedParams.maxPrice.toLocaleString()} near ${locationText}:`;
        } else if (parsedParams.propertyType === 'rent') {
          searchMessage = `🏡 Here are rental properties near ${locationText}:`;
        } else if (parsedParams.propertyType === 'sale') {
          searchMessage = `🏠 Here are properties for sale near ${locationText}:`;
        } else {
          searchMessage = `📍 Here are properties I found near ${locationText}:`;
        }
      }

      // Add message with results
      addMessage('bot', searchMessage, results.length > 0 ? { type: 'properties', properties: results.slice(0, 6) } : null);

    } catch (error) {
      console.error('Error generating property data:', error);
      // Final safety net mock data
      const mockResults = [
        {
          id: 'mock-error-1',
          title: 'Modern Apartment in London',
          address_line_1: '123 Baker Street',
          city: 'London',
          postcode: 'NW1 6XE',
          price: 2500,
          bedrooms: 2,
          bathrooms: 2,
          property_type: 'rent',
          image_urls: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
          description: "Spacious modern apartment in central London."
        }
      ];
      addMessage('bot', "Here are some example properties:", { type: 'properties', properties: mockResults });
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate contextual response
  const generateContextualResponse = async (query) => {
    const lowerQuery = query.toLowerCase();
    const context = await getUserContext();

    // Check for contextual queries
    if (lowerQuery.match(/\b(my|recent|viewed|saved|applied)\b/)) {
      if (lowerQuery.match(/\b(viewed|recent|recently viewed)\b/) && context?.viewedCount > 0) {
        return `You've recently viewed ${context.viewedCount} ${context.viewedCount === 1 ? 'property' : 'properties'}. Would you like me to show you similar properties or help you find more?`;
      }

      if (lowerQuery.match(/\b(saved|favorites|favourites)\b/) && context?.savedCount > 0) {
        return `You have ${context.savedCount} saved ${context.savedCount === 1 ? 'property' : 'properties'}. I can help you view them or find similar ones.`;
      }

      if (lowerQuery.match(/\b(applied|applications)\b/) && context?.appliedCount > 0) {
        return `You have ${context.appliedCount} active ${context.appliedCount === 1 ? 'application' : 'applications'}. Would you like to check their status?`;
      }
    }

    // Location-based suggestions
    if (lowerQuery.match(/\b(near me|nearby|in my area|local)\b/) && context?.location) {
      return `I see you're looking near ${context.location}. Let me find properties in that area for you.`;
    }

    return null;
  };

  // Main message processing
  const processMessage = async (userMessage) => {
    const lowerMessage = userMessage.toLowerCase().trim();

    // Hide onboarding after first interaction
    if (showOnboarding && !onboardingCompleted) {
      setShowOnboarding(false);
      markOnboardingCompleted();
    }

    // Check for greetings
    if (lowerMessage.match(/\b(hello|hi|hey|greetings|good morning|good afternoon|good evening)\b/)) {
      const context = await getUserContext();
      let greeting = "Hello! How can I help you today?";

      if (context?.location) {
        greeting = `Hello! I can help you find properties near ${context.location} or answer any questions. What would you like to explore?`;
      }

      addMessage('bot', greeting);
      return;
    }

    // Check for contextual queries first
    const contextualResponse = await generateContextualResponse(userMessage);
    if (contextualResponse) {
      addMessage('bot', contextualResponse);
      return;
    }

    // Check for property search queries
    const propertyKeywords = ['property', 'properties', 'house', 'flat', 'apartment', 'rent', 'buy', 'sale', 'find', 'search', 'show', 'listings', 'homes'];
    if (propertyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      const parsedParams = parsePropertyQuery(userMessage);
      await handlePropertySearch(userMessage, parsedParams);
      return;
    }

    // Check for navigation requests
    const navMap = {
      'dashboard': '/user/dashboard',
      'discover': '/user/dashboard/discover',
      'properties': '/user/dashboard/discover',
      'browse': '/user/dashboard/discover',
      'messages': '/user/dashboard/messages',
      'payments': '/user/dashboard/payments',
      'contracts': '/user/dashboard/contracts',
      'overseas': '/user/dashboard/overseas',
      'profile': '/user/dashboard/profile',
      'settings': '/user/dashboard/settings',
      'help': '/user/dashboard/help',
      'applications': '/user/dashboard/applications',
      'saved': '/user/dashboard/saved',
    };

    for (const [key, path] of Object.entries(navMap)) {
      if (lowerMessage.includes(key)) {
        setTimeout(() => navigate(path), 500);
        addMessage('bot', `I'll take you to ${key === 'properties' || key === 'browse' ? 'Discover Properties' : key.charAt(0).toUpperCase() + key.slice(1)} now.`);
        return;
      }
    }

    // Check for FAQ questions
    if (lowerMessage.includes('how do i apply')) {
      addMessage('bot', "To apply for a property:\n1. Browse properties on the Discover page\n2. Click 'View Details' on a property you like\n3. Click 'Apply Now' or 'Buy Now'\n4. Fill out the application form\n\nI can help you find properties to apply for!");
      return;
    }

    if (lowerMessage.includes('how do i save')) {
      addMessage('bot', "To save a property:\n1. Find a property you like\n2. Click the heart icon on the property card\n3. View all saved properties in the 'Saved' section\n\nWould you like me to show you properties to save?");
      return;
    }

    // Default response
    addMessage('bot', "I can help you search for properties, navigate the platform, or answer questions. Try asking me to find properties, show trending listings, or help with applications. What would you like to do?");
  };

  // Add message helper
  const addMessage = (type, text, data = null) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      type,
      text,
      data,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Handle send message
  const handleSendMessage = async (text = null) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isProcessing) return;

    addMessage('user', messageText);
    setInputValue('');
    setIsProcessing(true);

    await processMessage(messageText);
    setIsProcessing(false);
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  // Handle onboarding prompt click
  const handleOnboardingPrompt = async (prompt) => {
    setShowOnboarding(false);
    markOnboardingCompleted();
    setInputValue(prompt.query);
    await handleSendMessage(prompt.query);
  };

  // Handle smart suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSmartSuggestions([]);
    setInputValue(suggestion.query);
    handleSendMessage(suggestion.query);
  };

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      addMessage('bot', "Voice input is not available in your browser. Please type your message instead.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      addMessage('bot', "🎤 Listening... Please speak your query.");
    }
  };

  // Transform property for PropertyCard
  const transformPropertyForCard = (property) => {
    if (!property) return null;

    let images = [];
    if (property.image_urls) {
      if (Array.isArray(property.image_urls)) {
        images = property.image_urls;
      } else if (typeof property.image_urls === 'string') {
        try {
          images = JSON.parse(property.image_urls);
        } catch (e) {
          images = [];
        }
      }
    }

    const locationParts = [
      property.address_line_1,
      property.city,
      property.postcode
    ].filter(Boolean);
    const location = locationParts.length > 0 ? locationParts.join(', ') : 'UK';

    return {
      id: property.id,
      title: property.title || 'Property',
      location: location,
      price: property.price || 0,
      type: property.property_type === 'rent' ? 'Rent' : property.property_type === 'sale' ? 'Sale' : 'Property',
      property_type: property.property_type,
      beds: property.bedrooms || 0,
      baths: property.bathrooms || 0,
      area: property.property_size_sqm || null,
      image: images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      description: property.description || '',
      is_saved: property.is_saved || false,
      is_applied: property.is_applied || false,
      application_status: property.application_status || null,
      view_count: property.view_count || 0,
      latitude: property.latitude,
      longitude: property.longitude,
      listedDate: property.created_at ? new Date(property.created_at) : new Date(),
      featured: property.featured || false,
    };
  };

  // Calculate button style based on position
  const getButtonStyle = () => {
    if (buttonPosition.x !== null && buttonPosition.y !== null) {
      return {
        left: buttonPosition.x,
        top: buttonPosition.y,
        right: 'auto',
        bottom: 'auto',
      };
    }
    // Default position (bottom right)
    return {
      right: 24,
      bottom: 24,
    };
  };

  return (
    <>
      {/* Chat Bubble Button - Draggable */}
      {!isOpen && (
        <div
          ref={buttonRef}
          className="fixed z-40"
          style={getButtonStyle()}
        >
          <button
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onClick={(e) => {
              // Only open if not dragged (simple click)
              if (!hasDragged) {
                setShowWelcomeAnimation(false);
                setIsOpen(true);
              }
              setHasDragged(false); // Reset for next interaction
            }}
            className={`px-4 py-3 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 relative select-none ${isDragging ? 'cursor-grabbing scale-105 opacity-90' : 'cursor-grab hover:scale-105'
              }`}
            aria-label="Ask Lakshmi - Drag to move"
            title="Click to chat, drag to move"
          >
            <Bot size={20} className="flex-shrink-0" />
            <span className="font-medium text-sm whitespace-nowrap">Ask Lakshmi</span>
            {/* Drag indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/30 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </button>
        </div>
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
                <h3 className="font-semibold text-white text-sm">Ask Lakshmi</h3>
                <p className="text-xs text-orange-100">Intelligent Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close chat"
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
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${message.type === 'user'
                    ? 'bg-orange-500 dark:bg-orange-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600'
                    }`}
                >
                  {message.type === 'bot' && (
                    <div className="flex items-center gap-2 mb-1">
                      <Bot size={14} className="text-orange-500" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Ask Lakshmi</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>

                  {/* Property Cards */}
                  {message.data?.type === 'properties' && message.data.properties && (
                    <div className="mt-3 space-y-2">
                      {message.data.properties.map((property) => {
                        const transformed = transformPropertyForCard(property);
                        if (!transformed) return null;
                        return (
                          <div
                            key={property.id}
                            className="border border-gray-200 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
                          >
                            <div className="flex gap-2">
                              <img
                                src={transformed.image}
                                alt={transformed.title}
                                className="w-16 h-16 object-cover rounded"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                                  {transformed.title}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  {transformed.location}
                                </p>
                                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-1">
                                  £{((transformed.price || 0) / 1000).toFixed(0)}k
                                  {transformed.type === 'Rent' ? '/mo' : ''}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  {transformed.beds > 0 && <span>{transformed.beds} bed</span>}
                                  {transformed.baths > 0 && <span>{transformed.baths} bath</span>}
                                </div>
                                <button
                                  onClick={() => navigate(`/user/dashboard/property/${property.id}`)}
                                  className="mt-2 text-xs text-orange-600 dark:text-orange-400 hover:underline font-medium"
                                >
                                  View Details →
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => navigate('/user/dashboard/discover')}
                          className="flex-1 text-xs px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <MapIcon size={12} />
                          Browse All
                        </button>
                        <button
                          onClick={() => navigate('/user/dashboard/discover?view=map')}
                          className="flex-1 text-xs px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <MapPin size={12} />
                          View on Map
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Onboarding Prompts - Always show quick actions after welcome */}
            {messages.length > 0 && messages.length <= 2 && !isProcessing && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Sparkles size={14} className="text-orange-500" />
                  <span className="font-medium">Quick actions:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {onboardingPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleOnboardingPrompt(prompt)}
                      className="px-3 py-2 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/30 border border-gray-200 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-600 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                    >
                      {prompt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions after property results */}
            {messages.length > 2 && messages[messages.length - 1]?.data?.type === 'properties' && !isProcessing && (
              <div className="space-y-2 pt-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <ArrowRight size={12} />
                  <span>What's next?</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(action.query)}
                      className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium transition-colors"
                    >
                      {action.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Suggestions */}
            {smartSuggestions.length > 0 && messages.length > 2 && (
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <Sparkles size={12} />
                  <span>Suggestions:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {smartSuggestions.map((suggestion, index) => {
                    const Icon = suggestion.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1.5"
                      >
                        <Icon size={12} />
                        {suggestion.text}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setSmartSuggestions([])}
                    className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Bot size={14} className="text-orange-500" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Listening Indicator */}
            {isListening && (
              <div className="flex justify-start">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Mic size={14} className="text-red-500 animate-pulse" />
                    <span className="text-xs text-red-700 dark:text-red-400">Listening...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isProcessing}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Type your message to Ask Lakshmi"
              />
              {/* Voice Input Button */}
              {(window.SpeechRecognition || window.webkitSpeechRecognition) && (
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  disabled={isProcessing}
                  className={`p-2 rounded-lg transition-colors ${isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              )}
              <button
                type="submit"
                disabled={!inputValue.trim() || isProcessing}
                className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default LakshmiAssistant;
