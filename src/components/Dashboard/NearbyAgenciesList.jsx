import React, { useState } from 'react';
import { MapPin, Phone, MessageSquare, Star, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NearbyAgenciesList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAgency, setSelectedAgency] = useState(null);

    const agencies = [
        {
            id: 1,
            name: 'Prime Realty Group',
            distance: '0.8 miles',
            rating: 4.9,
            reviews: 127,
            image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=200&fit=crop',
            address: '42 High Street, London',
            openNow: true,
            description: 'Prime Realty Group has been serving the London area for over 20 years. We specialize in luxury residential properties and offer a personalized service to help you find your dream home. Our team of experienced agents is dedicated to providing the best possible experience.',
            specialties: ['Luxury Residential', 'Property Management', 'Commercial Sales'],
            openingHours: 'Mon-Fri: 9am - 6pm, Sat: 10am - 4pm',
            email: 'contact@primerealty.com',
            website: 'www.primerealty.com',
            agentCount: 15
        },
        {
            id: 2,
            name: 'Urban Living Estate Agents',
            distance: '1.2 miles',
            rating: 4.7,
            reviews: 89,
            image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop',
            address: '15 Station Road, London',
            openNow: true,
            description: 'Urban Living focuses on modern city apartments and sustainable living spaces. Whether you are looking to buy, rent, or sell, our tech-forward approach ensures a seamless process from start to finish.',
            specialties: ['City Apartments', 'Eco-friendly Homes', 'Student Lettings'],
            openingHours: 'Mon-Fri: 8am - 8pm, Sun: 11am - 4pm',
            email: 'hello@urbanliving.co.uk',
            website: 'www.urbanliving.co.uk',
            agentCount: 8
        },
        {
            id: 3,
            name: 'Knightsbridge Premium Properties',
            distance: '2.5 miles',
            rating: 5.0,
            reviews: 234,
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=200&fit=crop',
            address: '88 Brompton Road, London',
            openNow: false,
            description: 'Exclusive portfolio of high-end properties in Knightsbridge and Chelsea. We offer discreet and professional services for discerning clients looking for exceptional real estate opportunities.',
            specialties: ['High-Net-Worth Individuals', 'Off-Market Listings', 'Investment Portfolios'],
            openingHours: 'Mon-Fri: 9am - 5pm (By Appointment Only)',
            email: 'info@knightsbridge-premium.com',
            website: 'www.knightsbridge-premium.com',
            agentCount: 6
        }
    ];

    const filteredAgencies = agencies.filter(agency =>
        agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agency.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mt-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">Nearby Agencies</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Top rated in your area</p>
                    </div>
                    <button
                        onClick={() => navigate('/user/dashboard/discover')}
                        className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                        View All <ChevronRight size={14} />
                    </button>
                </div>

                {/* Search Input */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search agencies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-3 pr-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                    />
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {filteredAgencies.length > 0 ? (
                        filteredAgencies.map((agency) => (
                            <div
                                key={agency.id}
                                onClick={() => setSelectedAgency(agency)}
                                className="group relative bg-gray-50 dark:bg-gray-900/30 rounded-xl p-3 hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="relative w-16 h-16 flex-shrink-0">
                                        <img
                                            src={agency.image}
                                            alt={agency.name}
                                            className="w-full h-full object-cover rounded-lg shadow-sm"
                                        />
                                        {agency.openNow && (
                                            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full border border-white dark:border-gray-800">
                                                OPEN
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate pr-4 group-hover:text-orange-600 transition-colors">
                                            {agency.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1 mb-2">
                                            <div className="flex items-center gap-1">
                                                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">{agency.rating}</span>
                                                <span className="text-[10px] text-gray-500">({agency.reviews})</span>
                                            </div>
                                            <span className="text-gray-300 dark:text-gray-600">•</span>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <MapPin size={10} />
                                                {agency.distance}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    alert(`Calling ${agency.name} at +44 20 1234 5678...`);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors shadow-sm"
                                            >
                                                <Phone size={12} />
                                                Call
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/user/dashboard/messages?newConversationWith=${encodeURIComponent(agency.name)}`);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-colors shadow-sm shadow-orange-200 dark:shadow-none"
                                            >
                                                <MessageSquare size={12} />
                                                Chat
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-xs">
                            No agencies found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>

            {/* Agency Detail Modal */}
            {selectedAgency && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedAgency(null)}>
                    <div
                        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Image */}
                        <div className="h-32 bg-gray-200 relative">
                            <img src={selectedAgency.image} alt={selectedAgency.name} className="w-full h-full object-cover" />
                            <button
                                onClick={() => setSelectedAgency(null)}
                                className="absolute top-3 right-3 p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors backdrop-blur-sm"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{selectedAgency.name}</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <MapPin size={14} className="text-orange-500" />
                                        {selectedAgency.address}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg">
                                        <Star size={14} className="text-orange-500 fill-orange-500" />
                                        <span className="font-bold text-orange-700 dark:text-orange-400">{selectedAgency.rating}</span>
                                    </div>
                                    <span className="text-xs text-gray-400 mt-1">{selectedAgency.reviews} reviews</span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {selectedAgency.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Specialties</h4>
                                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                        {selectedAgency.specialties.map((s, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Details</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="text-gray-600 dark:text-gray-300">
                                            <span className="block text-xs text-gray-400">Agents</span>
                                            {selectedAgency.agentCount} Agents
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-300">
                                            <span className="block text-xs text-gray-400">Hours</span>
                                            {selectedAgency.openingHours}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={() => alert(`Calling ${selectedAgency.name}...`)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Phone size={18} />
                                    Call Now
                                </button>
                                <button
                                    onClick={() => navigate(`/user/dashboard/messages?newConversationWith=${encodeURIComponent(selectedAgency.name)}`)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
                                >
                                    <MessageSquare size={18} />
                                    Chat
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NearbyAgenciesList;
