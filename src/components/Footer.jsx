import React, { useState } from 'react';
import { Twitter, Instagram, Linkedin, Send, Loader2 } from 'lucide-react';
import logoIcon from '../assets/logo-icon.png';
import { supabase } from '../lib/supabase';
import { useChat } from '../contexts/ChatContext';

const Footer = () => {
    const { closeChat } = useChat();
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!email.trim() || !email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Check if Supabase is configured
            if (!supabase) {
                throw new Error('Newsletter feature is not configured yet.');
            }

            // Insert email into newsletter_subscribers table
            const { error: supabaseError } = await supabase
                .from('newsletter_subscribers')
                .insert([
                    {
                        email: email.trim().toLowerCase(),
                        subscribed_at: new Date().toISOString(),
                        source: 'footer'
                    }
                ]);

            if (supabaseError) {
                // Check for duplicate email
                if (supabaseError.code === '23505') {
                    throw new Error('This email is already subscribed!');
                }
                throw supabaseError;
            }

            console.log('Email saved to Supabase:', email);
            setSubmitted(true);
            setEmail('');

            // Reset the submitted message after 3 seconds
            setTimeout(() => {
                setSubmitted(false);
            }, 3000);
        } catch (err) {
            console.error('Error saving email:', err);
            setError(err.message || 'Failed to subscribe. Please try again.');
            
            // Clear error after 3 seconds
            setTimeout(() => {
                setError('');
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <footer className="bg-secondary text-white">
            {/* Main Footer */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* About */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <img src={logoIcon} alt="Estospaces" className="w-10 h-10 object-contain" />
                            <span className="font-bold text-xl">Estospaces</span>
                        </div>
                        <p className="text-gray-400 mb-4 max-w-sm">
                            A virtual-first real estate platform connecting buyers and renters with verified brokers through immersive 3D property tours.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://x.com/ESTOSPACES" className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-primary transition-colors">
                                <Twitter size={18} />
                            </a>
                            <a href="https://www.instagram.com/estospaces/" className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-primary transition-colors">
                                <Instagram size={18} />
                            </a>
                            <a href="https://www.linkedin.com/company/estospaces-solutions-private-limited" className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-primary transition-colors">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Pages */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Pages</h3>
                        <ul className="space-y-2">
                            {[
                                { name: 'Home', link: '/' },
                                { name: 'Features', link: '#features' },
                                { name: 'Reviews', link: '#reviews' },
                                { name: 'Waitlist', link: '#join-waitlist' },
                                { name: 'About Us', link: '/about' },
                                { name: 'Contact', link: '#contact' }
                            ].map((item) => (
                                <li key={item.name}>
                                    <a 
                                        href={item.link} 
                                        onClick={closeChat}
                                        className="text-gray-400 hover:text-primary transition-colors"
                                    >
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Platform */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Platform</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#faq" onClick={closeChat} className="text-gray-400 hover:text-primary transition-colors">FAQ</a>
                            </li>
                            <li>
                                <a href="/terms" onClick={closeChat} className="text-gray-400 hover:text-primary transition-colors">
                                    Terms & Conditions
                                </a>
                            </li>
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                className="flex-1 px-4 py-2 rounded bg-white bg-opacity-10 border border-gray-600 outline-none focus:border-primary transition-colors placeholder-gray-500 text-gray-900 disabled:opacity-50"
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-primary p-2 rounded hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </div>
                        {submitted && (
                            <p className="text-green-400 text-sm mt-2 animate-fade-in">
                                ✓ Subscribed! We'll keep you updated.
                            </p>
                        )}
                        {error && (
                            <p className="text-red-400 text-sm mt-2 animate-fade-in">
                                ✗ {error}
                            </p>
                        )}
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
                            <a href="/privacy" className="text-gray-400 hover:text-primary transition-colors">Privacy Policy</a>
                            <a href="/terms" className="text-gray-400 hover:text-primary transition-colors">Terms of Service</a>
                            <a href="/cookies" className="text-gray-400 hover:text-primary transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;