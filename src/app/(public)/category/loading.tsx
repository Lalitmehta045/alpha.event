"use client";
import React from "react";
import LayoutV2 from "../layout/layoutV2";

export default function SimpleLoading() {
  return (
    <div className="relative flex flex-col gap-10 w-full mx-auto h-min items-center font-sans bg-(--mainBg)">
      <LayoutV2>
        <div className="w-full flex justify-center items-center h-screen bg-gray-50">
          <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg">
            {/* Spinner */}
            <div className="relative mb-4">
              <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-transparent animate-spin"></div>
            </div>

            {/* Text */}
            <p className="text-lg font-medium text-gray-700">Loading...</p>

            {/* Loading Bar */}
            <div className="w-48 h-2 bg-blue-100 rounded-full mt-4 overflow-hidden">
              <div className="loading-line h-full bg-blue-500"></div>
            </div>
          </div>
        </div>
      </LayoutV2>
    </div>
  );
}
