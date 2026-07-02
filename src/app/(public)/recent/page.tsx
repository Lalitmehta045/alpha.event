"use client";

import CTASection from "@/components/common/ctaButton/ctaSection";
import LayoutV2 from "../layout/layoutV2";
import { RecentProductV2 } from "@/components/core/recentProducts/recentProductV2";

export default function RecentProduct() {
  return (
    <div 
      className="relative flex flex-col gap-10 w-full mx-auto min-h-screen items-center font-sans bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/desktop-banner.jpeg')" }}
    >
      <LayoutV2>
        {/* Blogs Page */}
        <RecentProductV2 />

        {/* CTA Section */}
        <CTASection textColor="text-black" descColor="text-gray-800" />
      </LayoutV2>
    </div>
  );
}
