import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="bg-white shadow rounded-lg p-8">
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 mb-6">
              Alpha Art & Events collects information to provide better services to our customers. 
              This includes:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Name and contact information</li>
              <li>Email address and phone number</li>
              <li>Shipping and billing addresses</li>
              <li>Payment information</li>
              <li>Order history and preferences</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600 mb-6">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Process and fulfill your orders</li>
              <li>Provide customer support</li>
              <li>Send you promotional offers (with your consent)</li>
              <li>Improve our products and services</li>
              <li>Communicate with you about your account</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Information Security</h2>
            <p className="text-gray-600 mb-6">
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Cookies</h2>
            <p className="text-gray-600 mb-6">
              We use cookies to enhance your experience on our website. Cookies help us 
              remember your preferences and track usage patterns.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Third-Party Services</h2>
            <p className="text-gray-600 mb-6">
              We may share information with trusted third-party service providers who assist 
              us in operating our website, conducting our business, or servicing our customers.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Your Rights</h2>
            <p className="text-gray-600 mb-6">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              Email: privacy@alphaartandevents.com
              <br />
              Phone: +91-XXXXXXXXXX
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
