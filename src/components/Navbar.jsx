import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, LogIn, UserPlus, User, LayoutDashboard, Settings, LogOut, ChevronDown, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoIcon from '../assets/logo-icon.png';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const profileMenuRef = useRef(null);
    const { closeChat } = useChat();
    const { isAuthenticated, profile, getDisplayName, getAvatarUrl, getRole, signOut } = useAuth();
    const navigate = useNavigate();

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        setIsProfileMenuOpen(false);
        setIsMobileMenuOpen(false);
        
        // Create a timeout promise to ensure we redirect even if sign out hangs
        const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2000));
        
        const signOutPromise = (async () => {
            try {
                if (signOut) {
                    await signOut();
                }
            } catch (error) {
                console.error('Error during sign out:', error);
            }
        })();
        
        // Wait for either sign out to complete or timeout (whichever comes first)
        await Promise.race([signOutPromise, timeoutPromise]);
        
        // Clear ALL auth-related local storage data
        try {
            // Clear all possible Supabase auth keys
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('sb-yydtsteyknbpfpxjtlxe-auth-token');
            localStorage.removeItem('managerVerified');
            localStorage.removeItem('leads');
            sessionStorage.clear();
        } catch (e) {
            // Ignore storage errors
        }
        
        // Force redirect to home page with full page reload
        window.location.href = '/';
    };

    const handleNavigateToDashboard = () => {
        setIsProfileMenuOpen(false);
        handleNavClick();
        const role = getRole();
        if (role === 'user') {
            navigate('/user/dashboard');
        } else {
            navigate('/manager/dashboard');
        }
    };

    const handleNavigateToProfile = () => {
        setIsProfileMenuOpen(false);
        handleNavClick();
        const role = getRole();
        if (role === 'user') {
            navigate('/user/dashboard/profile');
        } else {
            navigate('/manager/dashboard/profile');
        }
    };

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
                        <a href="/" className="text-2xl font-bold flex items-center gap-2" onClick={handleNavClick}>
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
                                className={`text-sm font-medium transition-colors duration-300 ${isScrolled ? 'text-white hover:text-gray-200' : 'text-white hover:text-primary'}`}
                            >
                                {item}
                            </a>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="hidden md:flex items-center space-x-3">
                        {isAuthenticated ? (
                            /* Profile Dropdown for Authenticated Users */
                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
                                        isScrolled 
                                            ? 'hover:bg-white/10' 
                                            : 'hover:bg-white/20'
                                    }`}
                                >
                                    {getAvatarUrl() ? (
                                        <img 
                                            src={getAvatarUrl()} 
                                            alt={getDisplayName()} 
                                            className="w-8 h-8 rounded-full object-cover border-2 border-white/50"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/50">
                                            <User size={16} className="text-white" />
                                        </div>
                                    )}
                                    <span className="text-white font-medium text-sm max-w-[120px] truncate">
                                        {getDisplayName()}
                                    </span>
                                    <ChevronDown 
                                        size={16} 
                                        className={`text-white transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {/* User Info */}
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{getDisplayName()}</p>
                                            <p className="text-xs text-gray-500 capitalize">{getRole()}</p>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-1">
                                            <button
                                                onClick={handleNavigateToDashboard}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <LayoutDashboard size={18} className="text-gray-400" />
                                                Dashboard
                                            </button>
                                            <button
                                                onClick={handleNavigateToProfile}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <Settings size={18} className="text-gray-400" />
                                                Profile Settings
                                            </button>
                                        </div>

                                        {/* Sign Out */}
                                        <div className="border-t border-gray-100 pt-1">
                                            <button
                                                onClick={handleSignOut}
                                                disabled={isSigningOut}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSigningOut ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    <LogOut size={18} />
                                                )}
                                                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Login/Sign Up Buttons for Unauthenticated Users */
                            <>
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
                            </>
                        )}
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
                    <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-lg dark:shadow-gray-800/50 py-4 px-4 flex flex-col space-y-4 border-t border-gray-100 dark:border-gray-800">
                        {['Features', 'How It Works', 'FAQ', 'Join Waitlist'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                className="text-gray-800 dark:text-gray-100 font-medium hover:text-primary dark:hover:text-primary transition-colors"
                                onClick={handleNavClick}
                            >
                                {item}
                            </a>
                        ))}
                        {isAuthenticated ? (
                            /* Authenticated Mobile Menu */
                            <div className="flex flex-col gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                {/* User Info */}
                                <div className="flex items-center gap-3 pb-2">
                                    {getAvatarUrl() ? (
                                        <img 
                                            src={getAvatarUrl()} 
                                            alt={getDisplayName()} 
                                            className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User size={20} className="text-primary" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{getDisplayName()}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{getRole()}</p>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={handleNavigateToDashboard}
                                    className="text-gray-800 dark:text-gray-100 font-medium hover:text-primary dark:hover:text-primary flex items-center gap-2 py-2 transition-colors"
                                >
                                    <LayoutDashboard size={18} />
                                    Dashboard
                                </button>
                                <button 
                                    onClick={handleNavigateToProfile}
                                    className="text-gray-800 dark:text-gray-100 font-medium hover:text-primary dark:hover:text-primary flex items-center gap-2 py-2 transition-colors"
                                >
                                    <Settings size={18} />
                                    Profile Settings
                                </button>
                                <button 
                                    onClick={() => {
                                        handleNavClick();
                                        handleSignOut();
                                    }}
                                    disabled={isSigningOut}
                                    className="text-red-600 font-medium hover:text-red-700 flex items-center gap-2 py-2 disabled:opacity-50"
                                >
                                    {isSigningOut ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <LogOut size={18} />
                                    )}
                                    {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                                </button>
                            </div>
                        ) : (
                            /* Unauthenticated Mobile Menu */
                            <div className="flex flex-col gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <button 
                                    onClick={() => {
                                        handleNavClick();
                                        navigate('/auth/login');
                                    }}
                                    className="text-gray-800 dark:text-gray-100 font-medium hover:text-primary dark:hover:text-primary flex items-center gap-2 py-2 transition-colors"
                                >
                                    <LogIn size={18} />
                                    Login
                                </button>
                                <button 
                                    onClick={() => {
                                        handleNavClick();
                                        navigate('/auth/signup');
                                    }}
                                    className="bg-primary text-white px-6 py-3 rounded-full font-medium w-full flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all"
                                >
                                    <UserPlus size={18} />
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
