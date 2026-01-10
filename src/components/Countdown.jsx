import React from 'react';
import { Clock, Sparkles, Rocket } from 'lucide-react';

const Countdown = () => {
    return (
        <section className="py-32 bg-gradient-to-br from-primary/5 via-orange-50 dark:via-gray-900 to-primary/10 dark:to-gray-900 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-orange-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Headline with Gradient */}
                    <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                        <span className="text-gray-900 dark:text-gray-100">We're Launching </span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-orange-600">Soon.</span>
                    </h2>

                    {/* Subheadline */}
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed mb-12 max-w-3xl mx-auto">
                        Stay tuned for new updates, exclusive invites, and launch details. Be part of the revolution in real estate.
                    </p>

                    {/* Launch Date Badge with 3D Effect */}
                    <div className="inline-block relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                        <div className="relative bg-white dark:bg-gray-800 px-10 py-5 rounded-full border-2 border-primary/20 dark:border-primary/40 shadow-xl transform group-hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <Rocket className="text-primary" size={28} />
                                <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600 font-bold text-2xl">
                                    Launching Q1 2026
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Additional CTA */}
                    <div className="mt-12">
                        <p className="text-gray-500 dark:text-gray-400 text-sm tracking-wider uppercase mb-4">
                            Join the waitlist to get early access
                        </p>
                        <div className="flex justify-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Countdown;
