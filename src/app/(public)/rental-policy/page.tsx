import React from 'react';

const RentalPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Rental Policy</h1>
        
        <div className="bg-white shadow rounded-lg p-8">
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Rental Terms</h2>
            <p className="text-gray-600 mb-6">
              Alpha Art & Events offers rental services for various art pieces and event 
              decorations. All rentals are subject to the terms and conditions outlined below.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Rental Period</h2>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Minimum rental period: 24 hours</li>
              <li>Maximum rental period: 7 days</li>
              <li>Extensions may be available upon request</li>
              <li>Late returns will incur additional charges</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Security Deposit</h2>
            <p className="text-gray-600 mb-6">
              A security deposit of 50% of the item's value is required for all rentals. 
              This deposit will be refunded upon return of the item in its original condition.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Care and Maintenance</h2>
            <p className="text-gray-600 mb-6">
              Renters are responsible for the proper care of rented items. Items must be 
              returned in the same condition as received, excluding normal wear and tear.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Damage and Loss</h2>
            <p className="text-gray-600 mb-6">
              In case of damage or loss, the renter will be responsible for the full 
              replacement cost of the item. The security deposit may be applied toward 
              these costs.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Delivery and Pickup</h2>
            <p className="text-gray-600 mb-6">
              Delivery and pickup services are available for an additional fee. Items can 
              also be picked up and returned to our showroom during business hours.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Cancellation Policy</h2>
            <p className="text-gray-600 mb-6">
              Cancellations made 48 hours before the rental date will receive a full refund. 
              Cancellations made less than 48 hours before will forfeit the security deposit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalPolicy;
