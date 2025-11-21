import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Linkedin, Twitter, Globe, Target, Heart, Zap } from 'lucide-react';

const About = () => {
    const team = [
        {
            name: 'Yashwanth Manuwada',
            role: 'Co-Founder',
            bio: 'Visionary leader passionate about transforming the real estate landscape through technology and trust.',
            image: 'https://ui-avatars.com/api/?name=Yashwanth+Manuwada&background=f97316&color=fff&size=256',
            socials: {
                linkedin: '#',
                twitter: '#'
            }
        },
        {
            name: 'Siranjeevi',
            role: 'Co-Founder',
            bio: 'Driving operational excellence and strategic growth to build a seamless property experience for everyone.',
            image: 'https://ui-avatars.com/api/?name=Siranjeevi&background=f97316&color=fff&size=256',
            socials: {
                linkedin: '#',
                twitter: '#'
            }
        },
        {
            name: 'Prajole',
            role: 'CTO',
            bio: 'Tech innovator architecting the future of virtual property tours and secure digital transactions.',
            image: 'https://ui-avatars.com/api/?name=Prajole&background=0f172a&color=fff&size=256',
            socials: {
                linkedin: '#',
                twitter: '#'
            }
        }
    ];

    const values = [
        {
            icon: <Target className="text-primary" size={32} />,
            title: 'Transparency',
            desc: 'We believe in no hidden fees, verified listings, and complete honesty in every transaction.'
        },
        {
            icon: <Heart className="text-primary" size={32} />,
            title: 'User-Centric',
            desc: 'Every feature we build is designed to solve real problems for buyers, renters, and brokers.'
        },
        {
            icon: <Zap className="text-primary" size={32} />,
            title: 'Innovation',
            desc: 'Pushing boundaries with 3D tours, AI, and digital contracts to modernize an age-old industry.'
        }
    ];

    return (
        <div className="font-sans text-gray-800 bg-gray-50 min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-40 pb-20 bg-secondary text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-800 via-secondary to-secondary opacity-50"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
                        Redefining <span className="text-primary">Real Estate</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up delay-100">
                        Estospaces is on a mission to make finding your dream home as easy, transparent, and immersive as possible.
                    </p>
                </div>
            </section>

            {/* Our Story / Mission */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
                                Built on Trust, Powered by Tech.
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                The traditional real estate market is fragmented, opaque, and often frustrating. We saw a need for a platform that puts the user first—whether you're a buyer, a renter, or a broker.
                            </p>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                At Estospaces, we combine cutting-edge technology like virtual tours and AI with a rigorous verification process to create a marketplace you can truly rely on. We're not just a listing site; we're your partner in finding a place to call home.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-100 rounded-2xl p-6 h-48 flex flex-col justify-center items-center text-center hover:shadow-lg transition-shadow">
                                <span className="text-4xl font-bold text-primary mb-2">100%</span>
                                <span className="text-gray-600 font-medium">Verified Listings</span>
                            </div>
                            <div className="bg-gray-100 rounded-2xl p-6 h-48 flex flex-col justify-center items-center text-center hover:shadow-lg transition-shadow mt-8">
                                <span className="text-4xl font-bold text-primary mb-2">3D</span>
                                <span className="text-gray-600 font-medium">Virtual Tours</span>
                            </div>
                            <div className="bg-gray-100 rounded-2xl p-6 h-48 flex flex-col justify-center items-center text-center hover:shadow-lg transition-shadow -mt-8">
                                <span className="text-4xl font-bold text-primary mb-2">24/7</span>
                                <span className="text-gray-600 font-medium">AI Support</span>
                            </div>
                            <div className="bg-gray-100 rounded-2xl p-6 h-48 flex flex-col justify-center items-center text-center hover:shadow-lg transition-shadow">
                                <span className="text-4xl font-bold text-primary mb-2">Zero</span>
                                <span className="text-gray-600 font-medium">Hidden Fees</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leadership Team */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-secondary mb-4">Meet the Visionaries</h2>
                        <p className="text-xl text-gray-600">The minds behind Estospaces.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {team.map((member, index) => (
                            <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group">
                                <div className="h-64 overflow-hidden bg-gray-200 relative">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                                        <div className="flex gap-4">
                                            <a href={member.socials.linkedin} className="text-white hover:text-primary transition-colors"><Linkedin size={24} /></a>
                                            <a href={member.socials.twitter} className="text-white hover:text-primary transition-colors"><Twitter size={24} /></a>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 text-center">
                                    <h3 className="text-2xl font-bold text-secondary mb-1">{member.name}</h3>
                                    <p className="text-primary font-medium mb-4 uppercase tracking-wider text-sm">{member.role}</p>
                                    <p className="text-gray-600 leading-relaxed">
                                        {member.bio}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Our Core Values</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="p-8 border border-gray-100 rounded-3xl hover:border-primary/30 hover:bg-orange-50/30 transition-all duration-300 text-center group">
                                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-bold text-secondary mb-3">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {value.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;
