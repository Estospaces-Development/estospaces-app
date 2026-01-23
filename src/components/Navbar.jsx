import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, LogIn, UserPlus, User, LayoutDashboard, Settings, LogOut, ChevronDown, Loader2, ArrowRight } from 'lucide-react';
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
        <header
            className={`fixed w-full z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isScrolled
                    ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 py-3'
                    : 'bg-white/60 backdrop-blur-sm border-b border-white/20 py-4 lg:py-5'
            }`}
        >
            <div className="container mx-auto px-4 lg:px-6">
                <div className="flex justify-between items-center">
                    {/* Logo - Refined */}
                    <div className="flex items-center">
                        <a href="/" className="group flex items-center gap-3" onClick={handleNavClick}>
                            <div className="relative transition-transform duration-500">
                                <img
                                    src={logoIcon}
                                    alt="Estospaces Logo"
                                    className="h-9 w-auto object-contain transition-all duration-500"
                                />
                            </div>
                            <span className="font-bold text-xl tracking-tight transition-colors duration-300 text-gray-900 dark:text-white">
                                Estospaces
                            </span>
                        </a>
                    </div>

                    {/* Desktop Navigation - Minimalist Pill */}
                    <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-white rounded-full px-4 py-1.5 border border-gray-100 shadow-sm">
                        {['Features', 'How It Works', 'FAQ', 'Join Waitlist'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={handleNavClick}
                                className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                                {item}
                            </a>
                        ))}
                    </nav>

                    {/* Actions - Premium Profile & CTA */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            /* Profile Dropdown for Authenticated Users */
                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center gap-3 px-2 py-1.5 pl-3 rounded-full transition-all duration-300 border bg-white/50 hover:bg-white/80 border-gray-200/60 dark:bg-gray-800/50 dark:border-gray-700"
                                >
                                    <span className="font-medium text-sm max-w-[120px] truncate text-gray-700 dark:text-gray-200">
                                        {getDisplayName()}
                                    </span>
                                    {getAvatarUrl() ? (
                                        <img
                                            src={getAvatarUrl()}
                                            alt={getDisplayName()}
                                            className="w-8 h-8 rounded-full object-cover border-2 border-white/30 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-white/50">
                                            <User size={16} className="text-gray-500" />
                                        </div>
                                    )}
                                </button>

                                {/* Dropdown Menu - Animation Refined */}
                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-soft-xl border border-gray-100 dark:border-gray-800 py-2 z-50 animate-in fade-in slide-in-from-top-4 duration-200 overflow-hidden">
                                        {/* User Info Header */}
                                        <div className="px-5 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{getDisplayName()}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">{getRole()}</p>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="p-2 space-y-1">
                                            <button
                                                onClick={handleNavigateToDashboard}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                            >
                                                <LayoutDashboard size={18} className="text-gray-400 group-hover:text-current" />
                                                Dashboard
                                            </button>
                                            <button
                                                onClick={handleNavigateToProfile}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                            >
                                                <Settings size={18} className="text-gray-400 group-hover:text-current" />
                                                Profile Settings
                                            </button>
                                        </div>

                                        {/* Sign Out */}
                                        <div className="border-t border-gray-100 dark:border-gray-800 p-2 mt-1">
                                            <button
                                                onClick={handleSignOut}
                                                disabled={isSigningOut}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    className="px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                >
                                    Log in
                                </button>
                                <button
                                    onClick={() => navigate('/auth/signup')}
                                    className="group px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20"
                                >
                                    <span>Get Started</span>
                                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 text-white" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button - Styled */}
                    <button
                        className="md:hidden p-2 rounded-full transition-colors text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-black shadow-2xl py-6 px-4 flex flex-col space-y-4 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2">
                        {['Features', 'How It Works', 'FAQ', 'Join Waitlist'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                className="block px-4 py-3 text-lg font-medium text-gray-800 dark:text-gray-100 hover:text-orange-500 dark:hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition-colors"
                                onClick={handleNavClick}
                            >
                                {item}
                            </a>
                        ))}
                        {isAuthenticated ? (
                            /* Authenticated Mobile Menu */
                            <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-gray-800 mt-2">
                                {/* User Info */}
                                <div className="flex items-center gap-4 px-4 pb-4">
                                    {getAvatarUrl() ? (
                                        <img
                                            src={getAvatarUrl()}
                                            alt={getDisplayName()}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-orange-100"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                                            <User size={24} className="text-orange-500" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white text-lg">{getDisplayName()}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{getRole()}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleNavigateToDashboard}
                                    className="px-4 py-3 text-gray-700 dark:text-gray-200 font-medium hover:text-orange-600 flex items-center gap-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                >
                                    <LayoutDashboard size={20} />
                                    Dashboard
                                </button>
                                <button
                                    onClick={handleNavigateToProfile}
                                    className="px-4 py-3 text-gray-700 dark:text-gray-200 font-medium hover:text-orange-600 flex items-center gap-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                >
                                    <Settings size={20} />
                                    Profile Settings
                                </button>
                                <button
                                    onClick={() => {
                                        handleNavClick();
                                        handleSignOut();
                                    }}
                                    disabled={isSigningOut}
                                    className="px-4 py-3 text-red-600 font-medium hover:text-red-700 flex items-center gap-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
                                >
                                    {isSigningOut ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <LogOut size={20} />
                                    )}
                                    {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                                </button>
                            </div>
                        ) : (
                            /* Unauthenticated Mobile Menu */
                            <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-800 mt-2 px-2">
                                <button
                                    onClick={() => {
                                        handleNavClick();
                                        navigate('/auth/login');
                                    }}
                                    className="w-full py-3.5 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <LogIn size={20} />
                                    Log in
                                </button>
                                <button
                                    onClick={() => {
                                        handleNavClick();
                                        navigate('/auth/signup');
                                    }}
                                    className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-orange-600 active:bg-orange-700 shadow-xl shadow-orange-500/20 transition-all"
                                >
                                    <UserPlus size={20} />
                                    <span>Get Started</span>
                                    <ArrowRight size={18} />
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
