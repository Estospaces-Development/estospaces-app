import React, { useState } from 'react';
import { ArrowRight, Play, Eye, MousePointer2 } from 'lucide-react';
import WaitlistModal from './WaitlistModal';

const SneakPeek = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const features = [
        {
            icon: <Eye size={24} />,
            text: 'Virtual Tours'
        },
        {
            icon: <MousePointer2 size={24} />,
            text: 'Verified Brokers'
        },
        {
            icon: <Play size={24} />,
            text: 'Seamless Connections'
        }
    ];

    return (
        <section className="py-32 bg-gradient-to-b from-white dark:from-gray-900 via-gray-50 dark:via-gray-900 to-white dark:to-gray-900 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[10%] right-[5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[10%] left-[5%] w-96 h-96 bg-orange-200/10 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Main Headline */}
                    <h2 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-8 tracking-tight leading-tight">
                        Experience Properties
                        <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-orange-600">
                            Like Never Before
                        </span>
                    </h2>

                    {/* Description */}
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
                        Virtual tours. Verified brokers. Seamless connections. Estospaces brings it all together
                        in one powerful platform built for modern property seekers.
                    </p>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex items-center gap-2 group hover:-translate-y-1"
                            >
                                <div className="text-primary group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA Button with Enhanced Design */}
                    <div className="relative inline-block group">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>

                        {/* Button */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="relative bg-gradient-to-r from-primary to-orange-600 text-white px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto transform group-hover:scale-105 border border-white/20"
                        >
                            Join the Waitlist
                            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Supporting Text */}
                    <p className="mt-8 text-gray-500 dark:text-gray-400 text-sm tracking-wider uppercase">
                        Be among the first • No commitment required
                    </p>
                </div>
            </div>

            {/* Waitlist Modal */}
            <WaitlistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </section>
    );
};

export default SneakPeek;
