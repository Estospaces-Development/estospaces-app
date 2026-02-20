import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 mt-auto py-12 px-6 lg:px-12 animate-fadeIn transition-colors duration-300">
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Brand Column */}
                <div className="space-y-4">
                    <div className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-1">
                        <span className="font-extrabold">PRAGENX</span>
                        <span className="text-red-500 font-extrabold">AI</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-normal leading-relaxed max-w-xs transition-colors duration-300">
                        Leading the autonomous revolution. Proactive intelligence for the modern individual.
                    </p>
                </div>

                {/* Product Column */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm tracking-wide transition-colors duration-300">Product</h3>
                    <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                        <li>
                            <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Vision</a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Technology</a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Security</a>
                        </li>
                    </ul>
                </div>

                {/* Company Column */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm tracking-wide transition-colors duration-300">Company</h3>
                    <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                        <li>
                            <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">About</a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Manifesto</a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Careers</a>
                        </li>
                    </ul>
                </div>

                {/* Legal Column */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm tracking-wide transition-colors duration-300">Legal</h3>
                    <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                        <li>
                            <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Privacy</a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Terms</a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Ethics</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className='max-w-[1600px] mx-auto mt-12 pt-8 border-t border-gray-100 dark:border-gray-700'>
                <p className='text-xs text-gray-400 dark:text-gray-500 text-center md:text-left'>
                    &copy; {new Date().getFullYear()} Pragenx AI. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
