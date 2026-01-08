"use client";
import React from "react";
import LayoutV2 from "../layout/layoutV2";
import PencilLoader from "@/components/common/PencilLoader";

export default function SimpleLoading() {
  return (
    <div className="relative flex flex-col gap-10 w-full mx-auto h-min items-center font-sans bg-(--mainBg)">
      <LayoutV2>
        <div className="w-full flex justify-center items-center h-screen bg-gray-50">
          <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg">
            <div className="relative mb-4">
              <PencilLoader />
            </div>

            <p className="text-lg font-medium text-gray-700">Loading...</p>
          </div>
        </div>
      </LayoutV2>
    </div>
  );
}
