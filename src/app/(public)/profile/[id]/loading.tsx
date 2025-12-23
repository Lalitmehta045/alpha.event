"use client";
import React from "react";

export default function LoadingPage() {
  return (
    <div className="w-full flex justify-center items-center h-screen bg-gray-50">
      <div className="flex flex-col items-center p-10 bg-white rounded-xl shadow-2xl">
        {/* Spinner */}
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-transparent animate-spin"></div>

          <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-[spin_1.5s_linear_infinite]"></div>

          {/* Center Icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-70"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <p className="text-xl font-semibold text-gray-700 mt-2">
          Fetching Profile Data...
        </p>

        {/* Animated Loading Bar */}
        <div className="w-64 h-2 bg-blue-100 rounded-full mt-4 ">
          <div className="h-full bg-blue-600 rounded-full pulse-bar"></div>
        </div>
      </div>
    </div>
  );
}
