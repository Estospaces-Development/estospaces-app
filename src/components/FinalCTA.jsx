import React, { useState } from 'react';
import { ArrowRight, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

const FinalCTA = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle waitlist signup
        console.log('Email submitted:', email);
        alert('Welcome to the waitlist! We\'ll notify you as soon as we launch.');
        setEmail('');
    };

    const benefits = [
        'Early access to platform',
        'Exclusive launch offers',
        'Priority support'
    ];

    return (
        <section className="py-32 bg-gradient-to-br from-secondary via-gray-900 to-secondary text-white relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Headline */}
                    <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                        The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-orange-600">Real Estate</span>
                        <span className="block mt-2">Starts Here</span>
                    </h2>

                    {/* Subheadline */}
                    <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Join the waitlist and be part of the virtual-first revolution in property discovery.
                    </p>

                    {/* Benefits Pills */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20 flex items-center gap-2 hover:bg-white/20 transition-all duration-300"
                            >
                                <CheckCircle2 className="text-primary" size={18} />
                                <span className="text-sm font-medium">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-10">
                        <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl sm:rounded-full border border-white/20 shadow-2xl">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="flex-1 relative">
                                    <Mail className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        required
                                        className="w-full pl-14 pr-6 py-4 rounded-xl sm:rounded-full bg-white text-secondary outline-none focus:ring-2 focus:ring-primary text-lg"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-primary to-orange-600 text-white px-10 py-4 rounded-xl sm:rounded-full font-bold hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap transform hover:scale-105 w-full sm:w-auto"
                                >
                                    Join Waitlist
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Microcopy */}
                    <p className="text-sm text-gray-400 mb-12">
                        🔒 No spam. Unsubscribe anytime. We respect your privacy.
                    </p>

                    {/* Divider */}
                    <div className="max-w-md mx-auto mb-8">
                        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>

                    {/* Contact Info */}
                    <div className="text-gray-400">
                        <p className="text-lg">
                            Questions? Reach us at{' '}
                            <a
                                href="mailto:contact@estospaces.com"
                                className="text-primary hover:text-orange-400 font-semibold transition-colors inline-flex items-center gap-1 group"
                            >
                                contact@estospaces.com
                                <Mail size={16} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FinalCTA;
