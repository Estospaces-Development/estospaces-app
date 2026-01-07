import React, { useState } from 'react';
import useParallax from '../hooks/useParallax';
import { Search, MapPin, Home, DollarSign, Settings, Key, Building2 } from 'lucide-react';
import backgroundVideo from '../assets/hero-section-video.mp4';

const Hero = () => {
    const [activeTab, setActiveTab] = useState('buy');
    const offset = useParallax(0.5);

    return (
        <div className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
            {/* Background Video */}
            <div
                className="absolute inset-0 z-0 will-change-transform"
                style={{ transform: `translateY(${offset}px)` }}
            >
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src={backgroundVideo} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 pt-20">
                <div className="text-center text-white mb-12">
                    <h1 className="text-6xl md:text-8xl font-medium mb-6 animate-fade-in-up leading-none font-serif tracking-tighter">
                        <span className="text-white drop-shadow-lg">Discover your</span>
                        <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-400 to-orange-600 font-bold italic pr-4 pb-2">
                            Dream Home
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto animate-fade-in-up delay-100 font-light leading-relaxed drop-shadow-lg">
                        Experience properties like never before with immersive virtual tours and verified listings
                    </p>
                </div>

                {/* Search Form */}
                <div className="max-w-5xl mx-auto bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-1 animate-fade-in-up delay-200">
                    {/* Tabs */}
                    <div className="inline-flex p-1 bg-white/10 backdrop-blur-sm rounded-t-xl border border-white/20 border-b-0">
                        <button
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm tracking-wide transition-all duration-300 ${
                                activeTab === 'buy' 
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]' 
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                            onClick={() => setActiveTab('buy')}
                        >
                            <Key size={18} className={activeTab === 'buy' ? 'animate-pulse' : ''} />
                            Buy
                        </button>
                        <button
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm tracking-wide transition-all duration-300 ${
                                activeTab === 'rent' 
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]' 
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                            onClick={() => setActiveTab('rent')}
                        >
                            <Building2 size={18} className={activeTab === 'rent' ? 'animate-pulse' : ''} />
                            Rent
                        </button>
                    </div>

                    {/* Form Fields */}
                    <div className="bg-white p-6 rounded-b-xl rounded-tr-xl shadow-2xl grid grid-cols-1 md:grid-cols-4 gap-4 border border-gray-100">
                        {/* Keyword */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Keyword</label>
                            <div className="flex items-center border-b border-gray-200 pb-2">
                                <Search size={18} className="text-primary mr-2" />
                                <input
                                    type="text"
                                    placeholder="Enter Keyword..."
                                    className="w-full outline-none text-secondary placeholder-gray-400 bg-white"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Location</label>
                            <div className="flex items-center border-b border-gray-200 pb-2">
                                <MapPin size={18} className="text-primary mr-2" />
                                <select className="w-full outline-none text-secondary bg-transparent cursor-pointer">
                                    <option value="">All Countries</option>
                                    <option value="india">India</option>
                                    <option value="usa">United States</option>
                                    <option value="uk">United Kingdom</option>
                                    <option value="canada">Canada</option>
                                    <option value="australia">Australia</option>
                                    <option value="uae">United Arab Emirates</option>
                                    <option value="singapore">Singapore</option>
                                </select>
                            </div>
                        </div>

                        {/* Type */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Type</label>
                            <div className="flex items-center border-b border-gray-200 pb-2">
                                <Home size={18} className="text-primary mr-2" />
                                <select className="w-full outline-none text-secondary bg-transparent cursor-pointer">
                                    <option value="">All Types</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="villa">Villa</option>
                                    <option value="office">Office</option>
                                </select>
                            </div>
                        </div>

                        {/* Advanced / Search Button */}
                        <div className="flex items-end gap-2">
                            <button className="p-3 border border-gray-200 rounded hover:bg-gray-50 text-gray-500 transition-colors" title="Advanced Search">
                                <Settings size={20} />
                            </button>
                            <button className="flex-1 bg-primary text-white py-3 rounded font-bold hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                                <Search size={20} />
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
