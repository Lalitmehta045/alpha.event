"use client";

import React from "react";
import { FiClock } from "react-icons/fi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";

export default function PendingReviewPage() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4">
      <div className="bg-amber-100 p-6 rounded-full mb-6">
        <FiClock className="w-16 h-16 text-amber-500" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Profile Under Review
      </h1>
      <p className="text-gray-600 max-w-md mx-auto mb-8 text-lg">
        Thank you for submitting your vendor profile, {user?.fname || "there"}!
        Our administration team is currently reviewing your details. This process usually takes 24-48 hours.
      </p>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-md w-full text-left">
        <h3 className="font-semibold text-gray-800 mb-2">What happens next?</h3>
        <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm">
          <li>We will verify your categories, address, and ID proof.</li>
          <li>Once approved, you will get full access to the Vendor Dashboard.</li>
          <li>You can then start uploading and managing your products.</li>
        </ul>
      </div>
    </div>
  );
}
