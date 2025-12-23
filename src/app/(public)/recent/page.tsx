"use client";

import CTASection from "@/components/common/ctaButton/ctaSection";
import LayoutV2 from "../layout/layoutV2";
import { RecentProductV2 } from "@/components/core/recentProducts/recentProductV2";

export default function RecentProduct() {
  return (
    <div className="relative flex flex-col gap-10 w-full mx-auto h-min items-center font-sans bg-(--mainBg)">
      <LayoutV2>
        {/* Blogs Page */}
        <RecentProductV2 />

        {/* CTA Section */}
        <CTASection />
      </LayoutV2>
    </div>
  );
}
