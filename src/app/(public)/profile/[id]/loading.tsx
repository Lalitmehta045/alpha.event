"use client";
import React from "react";
import PencilLoader from "@/components/common/PencilLoader";

export default function LoadingPage() {
  return (
    <div className="w-full flex justify-center items-center h-screen bg-gray-50">
      <div className="flex flex-col items-center p-10 bg-white rounded-xl shadow-2xl">
        <div className="relative mb-4">
          <PencilLoader />
        </div>

        <p className="text-xl font-semibold text-gray-700 mt-2">
          Fetching Profile Data...
        </p>
      </div>
    </div>
  );
}
