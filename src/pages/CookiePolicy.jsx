import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CookiePolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-6">
                    <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-orange-600 transition-colors">
                        <ArrowLeft size={20} />
                        <span>Back to Home</span>
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
                <p className="text-gray-600 mb-8">Last updated: November 23, 2025</p>

                <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Cookies are small text files that are placed on your computer or mobile device when you visit a website.
                            They are widely used to make websites work more efficiently and provide information to the owners of the site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Cookies</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Estospaces uses cookies and local storage to enhance your experience. When you accept cookies, we collect:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li><strong>Essential Cookies:</strong> Store your cookie consent preference</li>
                            <li><strong>Analytics Data:</strong> Session timestamp, user agent, browser language, screen resolution</li>
                            <li><strong>Page Views:</strong> URLs visited and timestamps to understand user journey</li>
                            <li><strong>Referrer Information:</strong> How you arrived at our website</li>
                        </ul>
                        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-primary rounded">
                            <p className="text-sm text-gray-700">
                                <strong>Note:</strong> All data is stored locally in your browser using localStorage.
                                We do not send this data to external servers. You can clear this data anytime by clearing
                                your browser's local storage or using the browser settings.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Types of Cookies We Use</h2>

                        <div className="space-y-4">
                            <div className="border-l-4 border-primary pl-4">
                                <h3 className="font-bold text-gray-900 mb-2">Session Cookies</h3>
                                <p className="text-gray-700">
                                    Temporary cookies that expire when you close your browser. They help us remember what you've
                                    added to your shopping cart and maintain your session.
                                </p>
                            </div>

                            <div className="border-l-4 border-primary pl-4">
                                <h3 className="font-bold text-gray-900 mb-2">Persistent Cookies</h3>
                                <p className="text-gray-700">
                                    Remain on your device for a set period or until you delete them. They help us recognize you
                                    as a returning visitor and remember your preferences.
                                </p>
                            </div>

                            <div className="border-l-4 border-primary pl-4">
                                <h3 className="font-bold text-gray-900 mb-2">Third-Party Cookies</h3>
                                <p className="text-gray-700">
                                    Set by third-party services we use, such as analytics providers. These help us improve our
                                    website and understand user behavior.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. What Data We Store</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            When you accept cookies, we store the following information in your browser's local storage:
                        </p>
                        <div className="space-y-3">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-2">Cookie Consent</h4>
                                <p className="text-sm text-gray-700">
                                    <strong>Key:</strong> <code className="bg-gray-200 px-2 py-1 rounded">cookieConsent</code><br />
                                    <strong>Value:</strong> "accepted" or "declined"<br />
                                    <strong>Purpose:</strong> Remember your cookie preference
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-2">User Session Data</h4>
                                <p className="text-sm text-gray-700">
                                    <strong>Key:</strong> <code className="bg-gray-200 px-2 py-1 rounded">userSession</code><br />
                                    <strong>Data:</strong> Timestamp, user agent, language, screen resolution, referrer<br />
                                    <strong>Purpose:</strong> Understand user demographics and improve UX
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-2">Page Views</h4>
                                <p className="text-sm text-gray-700">
                                    <strong>Key:</strong> <code className="bg-gray-200 px-2 py-1 rounded">pageViews</code><br />
                                    <strong>Data:</strong> Array of visited URLs with timestamps<br />
                                    <strong>Purpose:</strong> Analyze user navigation patterns
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Managing Cookies</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            You can control and/or delete cookies as you wish. You can delete all cookies that are already on
                            your computer and you can set most browsers to prevent them from being placed.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            However, if you do this, you may have to manually adjust some preferences every time you visit a site
                            and some services and functionalities may not work.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Browser Settings</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Most web browsers allow you to control cookies through their settings preferences. To find out more
                            about cookies, including how to see what cookies have been set and how to manage and delete them, visit:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li><a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.allaboutcookies.org</a></li>
                            <li><a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.youronlinechoices.eu</a></li>
                        </ul>
                        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                            <p className="text-sm text-gray-700">
                                <strong>To clear Estospaces data:</strong> Open your browser's Developer Tools (F12),
                                go to Application → Local Storage → select our domain → delete the keys mentioned above.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Updates to This Policy</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We may update this Cookie Policy from time to time. We will notify you of any changes by posting the
                            new Cookie Policy on this page and updating the "Last updated" date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
                        <p className="text-gray-700 leading-relaxed">
                            If you have any questions about our use of cookies, please contact us at:{' '}
                            <a href="mailto:contact@estospaces.com" className="text-primary hover:underline">
                                contact@estospaces.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicy;
