import React from 'react';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Refund Policy</h1>
        
        <div className="bg-white shadow rounded-lg p-8">
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Returns and Refunds</h2>
            <p className="text-gray-600 mb-6">
              At Alpha Art & Events, we want you to be completely satisfied with your purchase. 
              If you're not satisfied, we'll gladly accept returns within 7 days of delivery 
              under the following conditions.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Eligibility for Returns</h2>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Items must be unused and in the same condition as received</li>
              <li>Original packaging must be intact</li>
              <li>Proof of purchase is required</li>
              <li>Custom or personalized items cannot be returned</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Refund Process</h2>
            <p className="text-gray-600 mb-6">
              Once we receive your returned item, we will inspect it and notify you of the 
              status of your refund. If approved, your refund will be processed and a credit 
              will be applied to your original method of payment within 7-10 business days.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Shipping Costs</h2>
            <p className="text-gray-600 mb-6">
              Shipping costs for returned items are the responsibility of the customer unless 
              the return is due to our error or a defective product.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Contact Us</h2>
            <p className="text-gray-600">
              For any questions about our refund policy, please contact us at:
              <br />
              Email: support@alphaartandevents.com
              <br />
              Phone: +91-XXXXXXXXXX
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
