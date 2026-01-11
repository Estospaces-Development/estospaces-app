import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FileText, ArrowLeft, Mail } from 'lucide-react';

const TermsConditions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user came from dashboard
  const cameFromDashboard = location.state?.from?.includes('/user/dashboard') || 
    document.referrer.includes('/user/dashboard');
  
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (cameFromDashboard) {
      navigate('/user/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <FileText className="text-orange-500" size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
          <p className="text-gray-500">Last updated: January 2026</p>
        </div>

        {/* Terms Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing and using Estospaces ("the Platform"), you accept and agree to be bound by these 
              Terms and Conditions. If you do not agree to these terms, please do not use our services. 
              These terms apply to all visitors, users, and others who access or use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              Estospaces provides an online platform connecting property seekers with property owners, 
              landlords, and estate agents. Our services include property listings, search functionality, 
              messaging between parties, application management, and related property services. We act as 
              an intermediary and are not a party to any transaction between users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To access certain features, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorised use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Property Listings</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Users who list properties on Estospaces agree that:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>All listing information must be accurate and not misleading</li>
              <li>They have the legal right to list and/or rent/sell the property</li>
              <li>All images and content belong to them or they have permission to use them</li>
              <li>Prices and availability are kept up to date</li>
              <li>They comply with all applicable property and housing regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. User Conduct</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Use the Platform for any unlawful purpose or fraudulent activity</li>
              <li>Post false, inaccurate, misleading, or defamatory content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to gain unauthorised access to the Platform or other accounts</li>
              <li>Use automated systems or software to extract data from the Platform</li>
              <li>Circumvent any security or authentication measures</li>
              <li>Interfere with the proper working of the Platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Payments and Fees</h2>
            <p className="text-gray-600 leading-relaxed">
              Certain services may require payment. All fees are quoted in GBP unless otherwise stated. 
              You agree to pay all applicable fees and authorise us to charge your chosen payment method. 
              Fees are non-refundable unless otherwise specified. We reserve the right to change our fees 
              at any time with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              To the maximum extent permitted by law, Estospaces shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages arising out of your use of the Platform. 
              We do not guarantee the accuracy of property listings and are not responsible for transactions 
              between users. Our total liability shall not exceed the amount you paid to us in the past 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              The Platform and its original content, features, and functionality are owned by Estospaces 
              and are protected by international copyright, trademark, and other intellectual property laws. 
              You may not reproduce, distribute, modify, or create derivative works without our express 
              written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              We may terminate or suspend your account and access to the Platform immediately, without prior 
              notice or liability, for any reason, including breach of these Terms. Upon termination, your 
              right to use the Platform will cease immediately. You may also terminate your account at any 
              time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of England and Wales, 
              without regard to its conflict of law provisions. Any disputes arising from these Terms or your 
              use of the Platform shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will provide notice of significant 
              changes by posting on the Platform or sending you an email. Your continued use of the Platform 
              after such modifications constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="flex items-center gap-2 text-orange-500">
              <Mail size={18} />
              <a href="mailto:legal@estospaces.com" className="hover:underline">
                legal@estospaces.com
              </a>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            See also:{' '}
            <Link to="/privacy" className="text-orange-500 hover:underline">Privacy Policy</Link>
            {' | '}
            <Link to="/cookies" className="text-orange-500 hover:underline">Cookie Policy</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default TermsConditions;

