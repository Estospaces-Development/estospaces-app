import React, { useState, useEffect } from 'react';
import { Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Search, User, Menu, X } from 'lucide-react';
import logoIcon from '../assets/logo-icon.png';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center">
                        <a href="/" className="text-2xl font-bold text-secondary flex items-center gap-2">
                            <img src={logoIcon} alt="Estospaces Logo" className="h-8 w-auto object-contain" />
                            <span className={`${isScrolled ? 'text-secondary' : 'text-white'} font-bold text-xl`}>Estospaces</span>
                        </a>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {['Features', 'How It Works', 'FAQ', 'Join Waitlist'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                className={`text-sm font-medium hover:text-primary transition-colors ${isScrolled ? 'text-secondary' : 'text-white'}`}
                            >
                                {item}
                            </a>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-opacity-90 transition-all flex items-center gap-2">
                            <User size={18} />
                            Login/SignUp
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-primary"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg py-4 px-4 flex flex-col space-y-4">
                        {['Features', 'How It Works', 'FAQ', 'Join Waitlist'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                className="text-secondary font-medium hover:text-primary"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item}
                            </a>
                        ))}
                        <button className="bg-primary text-white px-6 py-2 rounded-full font-medium w-full flex items-center justify-center gap-2">
                            <User size={18} />
                            Login/SignUp
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
