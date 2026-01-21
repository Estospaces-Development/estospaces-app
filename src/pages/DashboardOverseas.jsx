import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Globe, MapPin, Eye, Bath, Bed, ArrowRight, X, Filter,
    DollarSign, Building2, Key, Home, ChevronDown, Video, Phone, Mail,
    Languages, Star, TrendingUp, Clock, Sparkles, Loader2
} from 'lucide-react';
import PropertyCard from '../components/Dashboard/PropertyCard';
import PropertyCardSkeleton from '../components/Dashboard/PropertyCardSkeleton';
import DashboardFooter from '../components/Dashboard/DashboardFooter';
import { getOverseasProperties } from '../services/mockDataService';
import { convertCurrency, formatCurrency, getAllCurrencies, getCurrencySymbol } from '../utils/currencyUtils';

// Country flag emojis
const COUNTRY_FLAGS = {
    ES: '🇪🇸',
    FR: '🇫🇷',
    PT: '🇵🇹',
    AE: '🇦🇪',
    US: '🇺🇸',
    GB: '🇬🇧',
};

// Popular destinations
const COUNTRIES = [
    { code: 'ALL', name: 'All Countries', flag: '🌍' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
];

const DashboardOverseas = () => {
    const navigate = useNavigate();

    // State
    const [selectedCountry, setSelectedCountry] = useState('ALL');
    const [selectedPropertyType, setSelectedPropertyType] = useState('buy');
    const [selectedCurrency, setSelectedCurrency] = useState('GBP');
    const [searchInput, setSearchInput] = useState('');
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCurrencySelectorOpen, setIsCurrencySelectorOpen] = useState(false);
    const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);

    const currencies = getAllCurrencies();

    // Fetch properties based on filters
    useEffect(() => {
        setLoading(true);

        // Simulate loading delay
        setTimeout(() => {
            const filters = {
                country: selectedCountry === 'ALL' ? null : selectedCountry,
                type: selectedPropertyType,
                city: searchInput || null,
            };

            const fetchedProperties = getOverseasProperties(filters);
            setProperties(fetchedProperties);
            setLoading(false);
        }, 600);
    }, [selectedCountry, selectedPropertyType, searchInput]);

    // Transform property for PropertyCard
    const transformPropertyForCard = (property) => {
        if (!property) return null;

        let images = [];
        if (Array.isArray(property.image_urls)) {
            images = property.image_urls;
        }

        // Convert price to selected currency
        const convertedPrice = convertCurrency(property.price, property.currency, selectedCurrency);

        const locationParts = [
            property.city,
            property.country
        ].filter(Boolean);
        const location = locationParts.join(', ');

        return {
            id: property.id,
            title: property.title,
            location: location,
            price: convertedPrice,
            type: property.property_type === 'rent' ? 'Rent' : 'Sale',
            property_type: property.property_type,
            beds: property.bedrooms || 0,
            baths: property.bathrooms || 0,
            image: images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
            images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
            description: property.description || '',
            view_count: property.view_count || 0,
            latitude: property.latitude,
            longitude: property.longitude,
            listedDate: property.created_at ? new Date(property.created_at) : new Date(),
            featured: property.has_virtual_tour || false,
            country: property.country,
            country_code: property.country_code,
            currency: selectedCurrency,
            originalCurrency: property.currency,
            virtualTour: property.virtual_tour_url,
            agent: property.agent,
        };
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Search is handled by useEffect watching searchInput
    };

    const handlePropertyClick = (property) => {
        navigate(`/user/dashboard/property/${property.id}`);
    };

    // Stats
    const totalProperties = properties.length;
    const saleProperties = properties.filter(p => p.property_type === 'sale').length;
    const rentProperties = properties.filter(p => p.property_type === 'rent').length;

    return (
        <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto dark:bg-[#0a0a0a] min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Globe className="text-orange-500" size={32} />
                        Overseas Properties
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Explore international properties across multiple countries
                    </p>
                </div>
            </div>

            {/* Hero Section with Search */}
            <div className="relative rounded-2xl shadow-2xl overflow-hidden min-h-[420px] flex flex-col items-center justify-center">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920')`,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-orange-900/60" />

                {/* Content */}
                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                        Find Your Perfect Home{' '}
                        <span className="text-orange-400">Worldwide</span>
                    </h2>
                    <p className="text-white/90 text-base md:text-lg mb-8">
                        Discover luxury properties in Spain, France, Portugal, UAE, USA and more
                    </p>

                    {/* Search Card */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 lg:p-6 shadow-2xl">
                        {/* Tabs */}
                        <div className="flex items-center gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit mx-auto">
                            <button
                                type="button"
                                onClick={() => setSelectedPropertyType('buy')}
                                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${selectedPropertyType === 'buy'
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                                    }`}
                            >
                                Buy
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedPropertyType('rent')}
                                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${selectedPropertyType === 'rent'
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                                    }`}
                            >
                                Rent
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/user/dashboard')}
                                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-all"
                            >
                                Sell
                            </button>
                        </div>

                        {/* Country & Currency Selectors */}
                        <div className="flex flex-wrap gap-3 mb-5 justify-center">
                            {/* Country Selector */}
                            <div className="relative filter-dropdown-container">
                                <button
                                    onClick={() => setIsCountrySelectorOpen(!isCountrySelectorOpen)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Globe size={18} className="text-gray-600" />
                                    <span className="text-sm font-medium">
                                        {COUNTRIES.find(c => c.code === selectedCountry)?.flag}{' '}
                                        {COUNTRIES.find(c => c.code === selectedCountry)?.name}
                                    </span>
                                    <ChevronDown size={16} />
                                </button>
                                {isCountrySelectorOpen && (
                                    <div className="absolute z-20 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl">
                                        {COUNTRIES.map((country) => (
                                            <button
                                                key={country.code}
                                                onClick={() => {
                                                    setSelectedCountry(country.code);
                                                    setIsCountrySelectorOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${selectedCountry === country.code ? 'bg-orange-50 text-orange-600' : ''
                                                    }`}
                                            >
                                                <span className="text-xl">{country.flag}</span>
                                                <span className="text-sm font-medium">{country.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Currency Selector */}
                            <div className="relative filter-dropdown-container">
                                <button
                                    onClick={() => setIsCurrencySelectorOpen(!isCurrencySelectorOpen)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <DollarSign size={18} className="text-gray-600" />
                                    <span className="text-sm font-medium">{selectedCurrency}</span>
                                    <ChevronDown size={16} />
                                </button>
                                {isCurrencySelectorOpen && (
                                    <div className="absolute z-20 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                        {currencies.map((curr) => (
                                            <button
                                                key={curr.code}
                                                onClick={() => {
                                                    setSelectedCurrency(curr.code);
                                                    setIsCurrencySelectorOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left ${selectedCurrency === curr.code ? 'bg-orange-50 text-orange-600' : ''
                                                    }`}
                                            >
                                                <span className="text-sm font-medium">{curr.code}</span>
                                                <span className="text-xs text-gray-500">{curr.symbol}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Search Form */}
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search by city..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                {searchInput && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchInput('')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Stats Banner */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Building2 className="text-blue-600 dark:text-blue-400" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Properties</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProperties}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <Key className="text-green-600 dark:text-green-400" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">For Sale</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{saleProperties}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <Home className="text-purple-600 dark:text-purple-400" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">For Rent</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{rentProperties}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Properties Grid */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedCountry === 'ALL'
                            ? `All International Properties (${totalProperties})`
                            : `${COUNTRIES.find(c => c.code === selectedCountry)?.flag} ${COUNTRIES.find(c => c.code === selectedCountry)?.name} (${totalProperties})`
                        }
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Prices shown in {selectedCurrency}
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <PropertyCardSkeleton key={i} />
                        ))}
                    </div>
                ) : properties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => {
                            const transformed = transformPropertyForCard(property);
                            if (!transformed) return null;

                            return (
                                <div key={property.id} className="relative">
                                    {/* Country Badge */}
                                    <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                                        <span className="text-lg">{COUNTRY_FLAGS[property.country_code]}</span>
                                        <span className="text-xs font-semibold text-gray-700">{property.country}</span>
                                    </div>

                                    {/* Virtual Tour Badge */}
                                    {property.has_virtual_tour && (
                                        <div className="absolute top-4 right-4 z-10 bg-orange-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                                            <Video size={14} />
                                            <span className="text-xs font-semibold">Virtual Tour</span>
                                        </div>
                                    )}

                                    <PropertyCard
                                        property={transformed}
                                        onViewDetails={handlePropertyClick}
                                    />

                                    {/* Agent Info - Quick Contact */}
                                    {property.agent && (
                                        <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={property.agent.avatar}
                                                    alt={property.agent.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                        {property.agent.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Languages size={12} className="text-gray-400" />
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {property.agent.languages.join(', ')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <a
                                                        href={`tel:${property.agent.phone}`}
                                                        className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                                        title="Call agent"
                                                    >
                                                        <Phone size={14} className="text-green-600 dark:text-green-400" />
                                                    </a>
                                                    <a
                                                        href={`mailto:${property.agent.email}`}
                                                        className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                                        title="Email agent"
                                                    >
                                                        <Mail size={14} className="text-blue-600 dark:text-blue-400" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Globe size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No Properties Found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Try adjusting your filters or search criteria
                        </p>
                        <button
                            onClick={() => {
                                setSelectedCountry('ALL');
                                setSearchInput('');
                            }}
                            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                        >
                            View All Properties
                        </button>
                    </div>
                )}
            </div>

            <DashboardFooter />
        </div>
    );
};

export default DashboardOverseas;
