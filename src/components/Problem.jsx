import React from 'react';
import { AlertCircle } from 'lucide-react';
import cityBlur from '../assets/city-blur.png';

const Problem = () => {
    return (
        <section className="py-32 relative overflow-hidden">
            {/* Parallax Background - Fixed Attachment */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url(${cityBlur})`,
                    backgroundAttachment: 'fixed',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                }}
            ></div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/95 via-secondary/90 to-secondary/95 z-0"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-10 leading-tight drop-shadow-lg">
                        Real Estate Shouldn't Be <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">This Hard.</span>
                    </h2>

                    <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
                        Endless property visits drain your time and money. Limited broker visibility means you miss great options.
                        Fake listings destroy trust. And outdated, flat images don't show you what you really need to see.
                    </p>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-3xl shadow-2xl transform hover:scale-[1.02] transition-all duration-500 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-orange-400 to-primary opacity-50"></div>
                        <p className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-md group-hover:text-primary transition-colors duration-300">
                            Estospaces changes everything.
                        </p>
                        <p className="text-lg md:text-xl text-gray-300 group-hover:text-white transition-colors duration-300">
                            A virtual-first platform built for trust, transparency, and a seamless property journey.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Problem;
