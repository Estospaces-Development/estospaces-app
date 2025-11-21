import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Shield, Globe, FileText, Lock, ChevronDown, ChevronUp, Mail, Phone, MapPin } from 'lucide-react';

const Terms = () => {
    const [activeTab, setActiveTab] = useState('key-facts');
    const [expandedSection, setExpandedSection] = useState(null);

    const toggleSection = (index) => {
        setExpandedSection(expandedSection === index ? null : index);
    };

    const tabs = [
        { id: 'key-facts', label: 'Key Facts', icon: <Shield size={20} /> },
        { id: 'uk-terms', label: 'UK Terms', icon: <Globe size={20} /> },
        { id: 'india-terms', label: 'India Terms', icon: <Globe size={20} /> },
        { id: 'privacy', label: 'Privacy Policy', icon: <Lock size={20} /> },
        { id: 'full-terms', label: 'Full Terms', icon: <FileText size={20} /> },
    ];

    return (
        <div className="font-sans text-gray-800 bg-gray-50 min-h-screen">
            <Navbar />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-4 max-w-5xl">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
                            Legal Center
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Transparency is key. Here’s everything you need to know about using Estospaces.
                        </p>
                    </div>

                    {/* Company Info Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-secondary mb-3 flex items-center gap-2">
                                <MapPin size={18} className="text-primary" /> Registered Offices
                            </h3>
                            <div className="text-sm text-gray-600 space-y-2">
                                <p><strong>UK:</strong> 27 Oxley Road, Preston, Lancashire PR1 5QH</p>
                                <p><strong>India:</strong> 28/50B, Therku Veethi, Salem, Tamil Nadu 636108</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-secondary mb-3 flex items-center gap-2">
                                <Mail size={18} className="text-primary" /> Contact Us
                            </h3>
                            <div className="text-sm text-gray-600 space-y-2">
                                <p>Email: <a href="mailto:contact@estospaces.com" className="text-primary hover:underline">contact@estospaces.com</a></p>
                                <p>Phone: +44 7435 537052</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-primary text-white shadow-lg transform scale-105'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 min-h-[500px]">

                        {/* Key Facts Summary */}
                        {activeTab === 'key-facts' && (
                            <div className="animate-fade-in">
                                <h2 className="text-3xl font-bold text-secondary mb-8">Key Facts Summary</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { title: "Platform Type", desc: "Digital mediation platform – not a broker or financial intermediary." },
                                        { title: "Our Users", desc: "Property owners, agents, landlords, tenants, and buyers." },
                                        { title: "Services", desc: "Digital contracts, AI tools, virtual tours, and payment facilitation." },
                                        { title: "Pricing", desc: "Subscriptions for brokers/agents. Free for tenants and buyers." },
                                        { title: "Payments", desc: "Processed in local currency (GBP or INR) via PayPal or bank transfer." },
                                        { title: "Disputes", desc: "Estospaces does not resolve disputes between users." },
                                        { title: "Data Protection", desc: "ICO Registration: C1808483 (UK GDPR compliant); DPDP Act 2023 (India)." },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                                            <h3 className="font-bold text-lg text-secondary mb-2">{item.title}</h3>
                                            <p className="text-gray-600">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* UK Terms */}
                        {activeTab === 'uk-terms' && (
                            <div className="animate-fade-in">
                                <h2 className="text-3xl font-bold text-secondary mb-6">Terms & Conditions (UK)</h2>
                                <div className="prose prose-lg max-w-none text-gray-600">
                                    <p className="mb-6">
                                        These Terms & Conditions govern use of Estospaces services in the United Kingdom, provided by <strong>Estospaces Solutions Limited</strong>.
                                    </p>
                                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
                                        <ul className="space-y-3">
                                            <li className="flex items-start gap-3">
                                                <span className="font-bold text-secondary min-w-[120px]">Company No:</span>
                                                <span>16716209</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="font-bold text-secondary min-w-[120px]">Governing Law:</span>
                                                <span>England & Wales</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="font-bold text-secondary min-w-[120px]">Jurisdiction:</span>
                                                <span>Courts of England & Wales</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="font-bold text-secondary min-w-[120px]">Currency:</span>
                                                <span>GBP (location-based pricing applies)</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <p>
                                        The company acts solely as a digital intermediary platform and does not resolve disputes. These terms incorporate all relevant details including disclaimers, subscription policies, data protection references, and payment facilitation.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* India Terms */}
                        {activeTab === 'india-terms' && (
                            <div className="animate-fade-in">
                                <h2 className="text-3xl font-bold text-secondary mb-6">Terms & Conditions (India)</h2>
                                <div className="prose prose-lg max-w-none text-gray-600">
                                    <p className="mb-6">
                                        These Terms & Conditions apply to Indian users of Estospaces, operated by <strong>Estospaces Solutions Private Limited</strong>.
                                    </p>
                                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 mb-6">
                                        <ul className="space-y-3">
                                            <li className="flex items-start gap-3">
                                                <span className="font-bold text-secondary min-w-[120px]">CIN:</span>
                                                <span>U68100TN2025PTC179899</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="font-bold text-secondary min-w-[120px]">Governing Law:</span>
                                                <span>Republic of India</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="font-bold text-secondary min-w-[120px]">Jurisdiction:</span>
                                                <span>Salem, Tamil Nadu</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="font-bold text-secondary min-w-[120px]">Currency:</span>
                                                <span>INR (location-based pricing applies)</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <p>
                                        They reflect compliance with the Indian Companies Act 2013, the Information Technology Act 2000, the Consumer Protection Act 2019, and the Digital Personal Data Protection Act 2023. Estospaces acts solely as a technology intermediary connecting brokers, landlords, and tenants without participating in transactions or dispute resolution.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Privacy Policy */}
                        {activeTab === 'privacy' && (
                            <div className="animate-fade-in">
                                <h2 className="text-3xl font-bold text-secondary mb-6">Privacy Policy</h2>
                                <div className="prose prose-lg max-w-none text-gray-600">
                                    <p className="mb-6">
                                        Estospaces respects your privacy and is committed to protecting personal data in compliance with the UK GDPR, the Data Protection Act 2018, and India’s Digital Personal Data Protection Act 2023.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div className="bg-gray-50 p-5 rounded-xl">
                                            <h4 className="font-bold text-secondary mb-2">Data Controller (UK)</h4>
                                            <p>Estospaces Solutions Limited</p>
                                        </div>
                                        <div className="bg-gray-50 p-5 rounded-xl">
                                            <h4 className="font-bold text-secondary mb-2">Data Controller (India)</h4>
                                            <p>Estospaces Solutions Private Limited</p>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-secondary mb-3">Key Points</h3>
                                    <ul className="list-disc pl-5 space-y-2 mb-6">
                                        <li><strong>ICO Registration:</strong> C1808483</li>
                                        <li><strong>Data Usage:</strong> Legitimate business operations, user account management, secure payment facilitation, and regulatory compliance.</li>
                                        <li><strong>Your Rights:</strong> Access, correction, deletion. Contact <a href="mailto:contact@estospaces.com" className="text-primary hover:underline">contact@estospaces.com</a>.</li>
                                        <li><strong>Cross-border Transfer:</strong> Performed under lawful safeguards and standard contractual clauses.</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Full Terms */}
                        {activeTab === 'full-terms' && (
                            <div className="animate-fade-in">
                                <h2 className="text-3xl font-bold text-secondary mb-2">Full Terms & Conditions</h2>
                                <p className="text-gray-500 mb-8">Effective date: 07 NOVEMBER 2025</p>

                                <div className="space-y-4">
                                    {[
                                        { title: "1. Definitions", content: "Defines key terms like 'Platform', 'User', 'Broker/Agent', and 'Services' to ensure clarity throughout the document." },
                                        { title: "2. Nature of the Platform", content: "Estospaces is a neutral digital intermediary. We do not own properties, act as agents, or hold funds. We connect users and provide tools." },
                                        { title: "3. Eligibility & Account Registration", content: "Users must be 18+ and provide accurate information. You are responsible for your account security." },
                                        { title: "4. Acceptance", content: "Using the platform constitutes a legally binding agreement to these terms." },
                                        { title: "5. Scope of Services", content: "We provide listings, broker tools, AI assistance, virtual tours, digital contracts, and payment facilitation." },
                                        { title: "6. Subscriptions & Fees", content: "Brokers pay subscription fees. Sponsored listings are charged per schedule. Prices may change with notice." },
                                        { title: "7. Payments", content: "We facilitate payments via third parties (e.g., PayPal). We do not hold funds. Users are responsible for lawful transactions." },
                                        { title: "8. Digital Contracts", content: "We provide templates and e-signature tools. Users are responsible for the legal effect of their contracts." },
                                        { title: "9. AI & Automated Tools", content: "AI tools are for convenience only. Verify all information independently." },
                                        { title: "10. User Content", content: "You grant us a license to display your content. You warrant you have the right to post it." },
                                        { title: "11. Prohibited Conduct", content: "No fraud, illegal activity, harassment, or misuse of the platform." },
                                        { title: "13. Data Protection", content: "We process data per UK GDPR and Indian DPDP Act. See Privacy Policy for details." },
                                        { title: "14. Warranties & Disclaimers", content: "Platform provided 'as is'. We do not guarantee accuracy of listings or uninterrupted service." },
                                        { title: "15. Limitation of Liability", content: "Liability limited to fees paid in last 12 months or £/₹ 2,500. No liability for indirect losses." },
                                        { title: "19. Dispute Resolution", content: "UK Law for UK users; Indian Law for Indian users. We do not mediate disputes between users." },
                                    ].map((section, index) => (
                                        <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => toggleSection(index)}
                                                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                                            >
                                                <span className="font-bold text-secondary">{section.title}</span>
                                                {expandedSection === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                            {expandedSection === index && (
                                                <div className="p-4 bg-white text-gray-600 border-t border-gray-200">
                                                    {section.content}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 text-center">
                                    <p className="text-gray-500 italic">This is a summary of key sections. Please refer to the full legal document for complete details.</p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Terms;
