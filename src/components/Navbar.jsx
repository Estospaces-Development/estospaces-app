import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoIcon from '../assets/logo-icon.png';
import { useChat } from '../contexts/ChatContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { closeChat } = useChat();
    const navigate = useNavigate();

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 100) {
                        setIsScrolled(true);
                    } else {
                        setIsScrolled(false);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        // Check initial scroll position
        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = () => {
        // Close the chat when navigating
        closeChat();
        // Close mobile menu if open
        setIsMobileMenuOpen(false);
    };

    return (
        <header className={`fixed w-full z-50 transition-all duration-1000 ease-in-out ${isScrolled ? 'bg-primary shadow-xl py-2' : 'bg-primary/0 py-4'}`}>
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center">
                        <a href="/" className="text-2xl font-bold text-secondary flex items-center gap-2" onClick={handleNavClick}>
                            <img src={logoIcon} alt="Estospaces Logo" className={`h-8 w-auto object-contain transition-all duration-1000 ${isScrolled ? 'brightness-0 invert' : ''}`} />
                            <span className="text-white font-bold text-xl">Estospaces</span>
                        </a>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {['Features', 'How It Works', 'FAQ', 'Join Waitlist'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={handleNavClick}
                                className={`text-sm font-medium transition-colors duration-300 ${isScrolled ? 'text-white hover:text-secondary' : 'text-white hover:text-primary'}`}
                            >
                                {item}
                            </a>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="hidden md:flex items-center space-x-3">
                        <button 
                            onClick={() => navigate('/auth/login')}
                            className={`px-5 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                                isScrolled 
                                    ? 'text-white hover:bg-white/10' 
                                    : 'text-white hover:bg-white/20'
                            }`}
                        >
                            <LogIn size={18} />
                            Login
                        </button>
                        <button 
                            onClick={() => navigate('/auth/signup')}
                            className={`px-5 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl ${
                                isScrolled 
                                    ? 'bg-white text-primary hover:bg-gray-100' 
                                    : 'bg-primary text-white hover:bg-opacity-90'
                            }`}
                        >
                            <UserPlus size={18} />
                            Sign Up
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className={`md:hidden ${isScrolled ? 'text-white' : 'text-primary'}`}
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
                                onClick={handleNavClick}
                            >
                                {item}
                            </a>
                        ))}
                        <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                            <button 
                                onClick={() => {
                                    handleNavClick();
                                    navigate('/auth/login');
                                }}
                                className="text-secondary font-medium hover:text-primary flex items-center gap-2"
                            >
                                <LogIn size={18} />
                                Login
                            </button>
                            <button 
                                onClick={() => {
                                    handleNavClick();
                                    navigate('/auth/signup');
                                }}
                                className="bg-primary text-white px-6 py-2 rounded-full font-medium w-full flex items-center justify-center gap-2 hover:bg-opacity-90"
                            >
                                <UserPlus size={18} />
                                Sign Up
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
