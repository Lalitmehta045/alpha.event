"use client";

import LatestBlogsV2 from "@/components/core/latestBlogs/latestBlogV2";
import LayoutV2 from "../layout/layoutV2";
import CTASection from "@/components/common/ctaButton/ctaSection";

const BlogsPage = () => {
  return (
    <div className="relative flex flex-col gap-10 w-full mx-auto h-min items-center font-sans bg-(--mainBg)">
      <LayoutV2>
        {/* Blogs Page */}
        <LatestBlogsV2 />

        {/* CTA Section */}
        <CTASection />
      </LayoutV2>
    </div>
  );
};

export default BlogsPage;
