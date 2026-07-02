"use client";

import OurTeam from "@/components/core/team/ourTeam";
import AboutV1 from "@/components/core/about/aboutV1";
import CTASection from "@/components/common/ctaButton/ctaSection";
import LayoutV2 from "../layout/layoutV2";

const AboutPage = () => {
  return (
    <div className="relative flex flex-col gap-10 w-full mx-auto min-h-screen items-center font-sans bg-[url('/desktop-banner.jpeg')] bg-cover bg-center bg-no-repeat bg-fixed">
      <LayoutV2>
        {/* Hero / About Section */}
        <AboutV1 />

        {/* Team Section */}
        <OurTeam />

        {/* CTA Section */}
        <CTASection textColor="text-black" descColor="text-gray-800" />
      </LayoutV2>
    </div>
  );
};

export default AboutPage;
