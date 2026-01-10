import React from 'react';
import { Twitter, Instagram, Linkedin } from 'lucide-react';

const DashboardFooter = () => {

    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            {/* Main Footer */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* ESTOSPACES.COM Column */}
                    <div>
                        <h3 className="text-sm font-bold uppercase mb-4" style={{ color: '#1e3a5f' }}>ESTOSPACES.COM</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="/contact" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Contact Us
                                </a>
                            </li>
                            <li>
                                <a href="/find-agent" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Find an Agent
                                </a>
                            </li>
                            <li>
                                <a href="/sitemap" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Sitemap
                                </a>
                            </li>
                            <li>
                                <a href="/careers" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Careers
                                </a>
                            </li>
                            <li>
                                <a href="/faq" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    FAQ
                                </a>
                            </li>
                            <li>
                                <a href="/mobile-apps" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Mobile Apps
                                </a>
                            </li>
                            <li>
                                <a href="/promote-property" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Promote Your Property
                                </a>
                            </li>
                            <li>
                                <a href="/privacy-settings" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Change privacy settings
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Search Column */}
                    <div>
                        <h3 className="text-sm font-bold uppercase mb-4" style={{ color: '#1e3a5f' }}>Search</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="/search-homes-for-sale" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Search homes for sale
                                </a>
                            </li>
                            <li>
                                <a href="/search-homes-for-rent" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Search homes for rent
                                </a>
                            </li>
                            <li>
                                <a href="/commercial-for-sale" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Commercial for sale
                                </a>
                            </li>
                            <li>
                                <a href="/commercial-to-rent" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Commercial to rent
                                </a>
                            </li>
                            <li>
                                <a href="/overseas-homes-for-sale" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Overseas homes for sale
                                </a>
                            </li>
                            <li>
                                <a href="/search-sold-house-prices" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Search sold house prices
                                </a>
                            </li>
                            <li>
                                <a href="/find-agent" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Find an agent
                                </a>
                            </li>
                            <li>
                                <a href="/student-accommodation" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Student accommodation
                                </a>
                            </li>
                            <li>
                                <a href="/retirement-homes" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Retirement homes
                                </a>
                            </li>
                            <li>
                                <a href="/new-homes" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    New homes
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Locations Column */}
                    <div>
                        <h3 className="text-sm font-bold uppercase mb-4" style={{ color: '#1e3a5f' }}>Locations</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="/locations/major-towns-cities-uk" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Major towns and cities in the UK
                                </a>
                            </li>
                            <li>
                                <a href="/locations/london" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    London
                                </a>
                            </li>
                            <li>
                                <a href="/locations/cornwall" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Cornwall
                                </a>
                            </li>
                            <li>
                                <a href="/locations/glasgow" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Glasgow
                                </a>
                            </li>
                            <li>
                                <a href="/locations/cardiff" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Cardiff
                                </a>
                            </li>
                            <li>
                                <a href="/locations/edinburgh" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Edinburgh
                                </a>
                            </li>
                            <li>
                                <a href="/locations/spain" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Spain
                                </a>
                            </li>
                            <li>
                                <a href="/locations/france" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    France
                                </a>
                            </li>
                            <li>
                                <a href="/locations/portugal" className="text-gray-700 hover:text-orange-600 transition-colors">
                                    Portugal
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>

            {/* Bottom Copyright Bar */}
            <div className="border-t border-gray-300">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Copyright */}
                        <p className="text-sm text-gray-700">
                            2026 Copyright Reserved
                        </p>

                        {/* Policy Links */}
                        <div className="flex items-center gap-4 text-sm text-gray-700">
                            <a href="/privacy" className="hover:text-orange-600 transition-colors">
                                Privacy Policy
                            </a>
                            <span className="text-gray-400">|</span>
                            <a href="/cookies" className="hover:text-orange-600 transition-colors">
                                Cookie Policy
                            </a>
                            <span className="text-gray-400">|</span>
                            <a href="/terms" className="hover:text-orange-600 transition-colors">
                                Terms & Conditions
                            </a>
                            <span className="text-gray-400">|</span>
                            <a href="/hosting-terms" className="hover:text-orange-600 transition-colors">
                                Hosting Terms
                            </a>
                        </div>

                        {/* Social Media Icons */}
                        <div className="flex items-center gap-4">
                            <a 
                                href="https://www.facebook.com/estospaces" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-orange-600 transition-colors"
                                aria-label="Facebook"
                            >
                                <span className="text-lg font-bold">f</span>
                            </a>
                            <a 
                                href="https://x.com/ESTOSPACES" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-orange-600 transition-colors"
                                aria-label="X (Twitter)"
                            >
                                <Twitter size={18} />
                            </a>
                            <a 
                                href="https://www.instagram.com/estospaces/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-orange-600 transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram size={18} />
                            </a>
                            <a 
                                href="https://www.linkedin.com/company/estospaces-solutions-private-limited" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-orange-600 transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default DashboardFooter;
