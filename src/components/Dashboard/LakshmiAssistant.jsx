import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, ArrowRight, Mic, MicOff, Loader2, MapPin, Home, TrendingUp, Eye, Heart, FileText, Map as MapIcon, Sparkles, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useProperties } from '../../contexts/PropertiesContext';
import { useUserLocation } from '../../contexts/LocationContext';
import { useSavedProperties } from '../../contexts/SavedPropertiesContext';
import * as propertyDataService from '../../services/propertyDataService';
import * as propertiesService from '../../services/propertiesService';

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

  // Onboarding prompts
  const onboardingPrompts = [
    { text: "Looking for properties near you?", query: "Show me properties near me" },
    { text: "Find trending properties in your area", query: "Show trending properties" },
    { text: "Check most viewed homes near your postcode", query: "Show most viewed properties" },
    { text: "Help me apply for a property", query: "How do I apply for a property?" },
    { text: "Show rentals under £1500", query: "Find rentals under 1500" },
  ];

  // Initialize and check onboarding status
  useEffect(() => {
    const initializeChat = async () => {
      // Check if user has completed onboarding
      if (currentUser) {
        try {
          const { data } = await supabase
            .from('user_preferences')
            .select('lakshmi_onboarding_completed')
            .eq('user_id', currentUser.id)
            .single();
          
          if (data?.lakshmi_onboarding_completed) {
            setOnboardingCompleted(true);
            setShowOnboarding(false);
          } else {
            setShowOnboarding(true);
          }
        } catch (error) {
          // Table might not exist, show onboarding anyway
          setShowOnboarding(true);
        }
      } else {
        setShowOnboarding(true);
      }
      
      // Start with empty messages - no mock data
      setMessages([]);
    };

    initializeChat();
  }, [currentUser]);

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

  // Mark onboarding as completed
  const markOnboardingCompleted = async () => {
    if (!currentUser) return;
    
    try {
      // Try to update or insert user preference
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: currentUser.id,
          lakshmi_onboarding_completed: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error && error.code !== '42P01') { // 42P01 = table doesn't exist
        console.error('Error saving onboarding status:', error);
      }
    } catch (error) {
      // Table might not exist, that's okay
      console.warn('User preferences table not found');
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

  // Process property search query
  const handlePropertySearch = async (query, parsedParams) => {
    setIsProcessing(true);
    
    try {
      let results = [];
      let searchMessage = "Here are some properties I found:";

      // Helper function to get mock data if live data fails or is empty
      const getMockDataFallback = (count = 6) => {
        // Simple mock generator
        return Array.from({ length: count }).map((_, i) => ({
          id: `mock-${i}`,
          title: `Luxury Apartment ${i + 1}`,
          address_line_1: `${10 + i} Downing Street`,
          city: "London",
          postcode: "SW1A 2AA",
          price: 1500 + (i * 100),
          bedrooms: 2 + (i % 3),
          bathrooms: 1 + (i % 2),
          property_type: i % 2 === 0 ? 'rent' : 'sale',
          image_urls: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
          description: "A beautiful property in the heart of London.",
          featured: i === 0
        }));
      };

      try {
        // Use search type if specified
        if (parsedParams.searchType === 'trending') {
          const trendingResult = await propertyDataService.getTrendingProperties({
            location: parsedParams.location ? { postcode: parsedParams.location } : activeLocation,
            limit: 6,
            userId: currentUser?.id,
          });
          results = trendingResult.properties || [];
          searchMessage = "Here are trending properties:";
        } else if (parsedParams.searchType === 'most-viewed') {
          const mostViewedResult = await propertyDataService.getMostViewedProperties({
            location: parsedParams.location ? { postcode: parsedParams.location } : activeLocation,
            limit: 6,
            userId: currentUser?.id,
          });
          results = mostViewedResult.properties || [];
          searchMessage = "Here are the most viewed properties:";
        } else if (parsedParams.searchType === 'recent') {
          const recentResult = await propertyDataService.getRecentlyAddedProperties({
            location: parsedParams.location ? { postcode: parsedParams.location } : activeLocation,
            limit: 6,
            userId: currentUser?.id,
          });
          results = recentResult.properties || [];
          searchMessage = "Here are recently added properties:";
        } else if (parsedParams.searchType === 'high-demand') {
          const highDemandResult = await propertyDataService.getHighDemandProperties({
            location: parsedParams.location ? { postcode: parsedParams.location } : activeLocation,
            limit: 6,
            userId: currentUser?.id,
          });
          results = highDemandResult.properties || [];
          searchMessage = "Here are high demand properties:";
        } else {
          // Regular search with filters
          const location = parsedParams.location 
            ? { postcode: parsedParams.location }
            : activeLocation || { postcode: 'SW1A 1AA' };

          const searchResult = await propertyDataService.fetchPropertiesWithFallback({
            location,
            radius: 5,
            maxRadius: 20,
            listingStatus: parsedParams.propertyType || 'both',
            userId: currentUser?.id,
            limit: 6,
          });

          results = searchResult.properties || [];

          // Apply filters
          if (parsedParams.bedrooms) {
            results = results.filter(p => p.bedrooms >= parsedParams.bedrooms);
          }
          if (parsedParams.bathrooms) {
            results = results.filter(p => p.bathrooms >= parsedParams.bathrooms);
          }
          if (parsedParams.minPrice) {
            results = results.filter(p => p.price >= parsedParams.minPrice);
          }
          if (parsedParams.maxPrice) {
            results = results.filter(p => p.price <= parsedParams.maxPrice);
          }
        }
      } catch (innerError) {
        console.warn("Live property search failed, falling back to mock data:", innerError);
        // Fallback execution if API call fails
      }

      // If no results found (either from empty API response or failed call), use mock data
      if (!results || results.length === 0) {
        results = getMockDataFallback();
        searchMessage = "I couldn't find exact live matches, but here are some similar properties you might like:";
      }

      // Add message with results
      addMessage('bot', searchMessage, results.length > 0 ? { type: 'properties', properties: results.slice(0, 6) } : null);

    } catch (error) {
      console.error('Error searching properties:', error);
      // Final safety net mock data
      const mockResults = [
        {
            id: 'mock-error-1',
            title: 'Modern Apartment',
            address_line_1: '123 Baker Street',
            city: 'London',
            postcode: 'NW1 6XE',
            price: 2500,
            bedrooms: 2,
            bathrooms: 2,
            property_type: 'rent',
            image_urls: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
            description: "Spacious modern apartment."
        }
      ];
      addMessage('bot', "I encountered an error connecting to the database, but here are some example properties:", { type: 'properties', properties: mockResults });
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
      await markOnboardingCompleted();
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
    await markOnboardingCompleted();
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
            className={`px-4 py-3 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 relative select-none ${
              isDragging ? 'cursor-grabbing scale-105 opacity-90' : 'cursor-grab hover:scale-105'
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
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                      message.type === 'user'
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

            {/* Onboarding Prompts */}
            {showOnboarding && !onboardingCompleted && messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {onboardingPrompts.map((prompt, index) => (
                <button
                      key={index}
                      onClick={() => handleOnboardingPrompt(prompt)}
                      className="px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
                >
                      {prompt.text}
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
                  className={`p-2 rounded-lg transition-colors ${
                    isListening
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
