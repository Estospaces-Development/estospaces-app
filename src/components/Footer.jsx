import React from 'react';
import { Twitter, Instagram, Linkedin, Send } from 'lucide-react';
import logoIcon from '../assets/logo-icon.png';

const Footer = () => {
    return (
        <footer className="bg-secondary text-white">
            {/* Main Footer */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <img src={logoIcon} alt="Estospaces" className="w-10 h-10 object-contain" />
                            <span className="font-bold text-xl">Estospaces</span>
                        </div>
                        <p className="text-gray-400 mb-4">
                            A virtual-first real estate platform connecting buyers and renters with verified brokers through immersive 3D property tours.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://x.com/ESTOSPACES" className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-primary transition-colors">
                                <Twitter size={18} />
                            </a>
                            <a href="https://www.instagram.com/estospaces/" className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-primary transition-colors">
                                <Instagram size={18} />
                            </a>
                            <a href="https://www.linkedin.com/company/106770232/admin/dashboard/" className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-primary transition-colors">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Platform</h3>
                        <ul className="space-y-2">
                            {['Virtual Tours', 'How It Works', 'For Brokers', 'Verified Listings', 'FAQ'].map((link) => (
                                <li key={link}>
                                    <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Company</h3>
                        <ul className="space-y-2">
                            {['About Us', 'Blog', 'Careers', 'Press Kit', 'Contact'].map((link) => (
                                <li key={link}>
                                    <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Stay Updated</h3>
                        <p className="text-gray-400 mb-4">
                            Get launch updates and early access.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="flex-1 px-4 py-2 rounded bg-white bg-opacity-10 border border-gray-600 outline-none focus:border-primary transition-colors placeholder-gray-500"
                            />
                            <button className="bg-primary p-2 rounded hover:bg-opacity-90 transition-colors">
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="border-t border-gray-700">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            © 2025 Estospaces. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">Privacy Policy</a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">Terms of Service</a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
