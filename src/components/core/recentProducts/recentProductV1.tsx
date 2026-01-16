"use client";

import { FaArrowRight } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";
import HeadingV1 from "@/components/common/Texts/HeadingV1";
import ParagraphV1 from "@/components/common/Texts/paragraph";
import CTAButtonV1 from "@/components/common/ctaButton/ctaButtonV1";
import { Card } from "@/components/ui/card";
import recent1 from "@/assets/images/recent1.jpg";
import recent2 from "@/assets/images/recent2.jpg";
import recent3 from "@/assets/images/recent3.jpg";
import recent4 from "@/assets/images/recent4.jpg";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

interface RecentItem {
  _id?: string;
  image: string;
  title?: string;
  order?: number;
}

const fallbackRecents: RecentItem[] = [
  {
    _id: "1",
    title: "Top 5 Wedding Backdrop Ideas for 2025",
    image: recent1 as unknown as string,
    order: 1,
  },
  {
    _id: "2",
    title: "Photo Booth Props That Guests Will Love",
    image: recent2 as unknown as string,
    order: 2,
  },
  {
    _id: "3",
    title: "Lighting Tips to Transform Any Venue",
    image: recent3 as unknown as string,
    order: 3,
  },
  {
    _id: "4",
    title: "Luxury Decor on a Budget",
    image: recent4 as unknown as string,
    order: 4,
  },
];

const RecentProductV1 = () => {
  const router = useRouter();
  const [recentProducts, setRecentProducts] = useState<RecentItem[]>(fallbackRecents);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        const res = await axios.get("/api/recent");
        if (res.data?.success && Array.isArray(res.data.data)) {
          const mergedProducts = fallbackRecents.map((item) => ({ ...item }));

          res.data.data.forEach((apiItem: any) => {
            const order = Number(apiItem.order) || 0;
            const slotIndex = order - 1;
            if (slotIndex >= 0 && slotIndex < mergedProducts.length) {
              const hasValidImage =
                typeof apiItem.image === "string" &&
                apiItem.image.trim().length > 0;

              mergedProducts[slotIndex] = {
                ...mergedProducts[slotIndex],
                _id: apiItem._id || mergedProducts[slotIndex]._id,
                image: hasValidImage
                  ? apiItem.image
                  : mergedProducts[slotIndex].image,
                title:
                  apiItem.title?.trim().length > 0
                    ? apiItem.title
                    : mergedProducts[slotIndex].title,
                order: order,
              };
            }
          });

          setRecentProducts(mergedProducts);
        } else {
          // Use fallback if API returns empty array or no success
          setRecentProducts(fallbackRecents);
        }
      } catch (error) {
        console.error("Failed to load recent products", error);
        // Use fallback on error
        setRecentProducts(fallbackRecents);
      }
    };

    fetchRecentProducts();
  }, []);

  return (
    <section className="bg-(--mainBg1) w-full py-8 flex flex-col text-white px-2 sm:px-6 md:px-10 lg:px-20">
      {/* Header */}
      <div className="w-11/12 mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <HeadingV1
            text="Our Recent Products"
            size="3xl"
            color="text-(--mainHeading1)"
            className="text-left"
          />

          <ParagraphV1
            text="Get inspired with expert tips and creative ideas designed to make your celebration one to remember."
            size="lg"
            color="text-(--primaryParagraph)"
            className="mt-2 text-left"
          />
        </div>

        <CTAButtonV1
          variant="secondary"
          text="Read More"
          icon={<FaArrowRight />}
          onClick={() => router.push("/recent")}
          className="px-5 py-4 md:px-8 md:py-6"
        />
      </div>

      {/* Recent Cards */}
      <div className="w-11/12 mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recentProducts.map((recent, index) => {
          const key = recent._id || recent.title || `recent-${index}`;
          const isLoaded = loadedImages[key];
          return (
          <Card
            key={key}
            className="group w-full h-68 sm:h-72 max-w-sm md:max-w-md lg:max-w-4xl mx-auto sm:mx-0 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="relative w-full h-56 sm:h-64 md:h-60 lg:78 overflow-hidden bg-gradient-to-b from-slate-100 via-white to-slate-100">
              {!isLoaded && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
              )}
              <Image
                src={recent.image}
                alt={recent.title || "Recent product"}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${isLoaded ? "opacity-100" : "opacity-0"}`}
                unoptimized
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                onLoadingComplete={() =>
                  setLoadedImages((prev) => ({ ...prev, [key]: true }))
                }
              />
            </div>
          </Card>
        )})}
      </div>
    </section>
  );
};

export default RecentProductV1;
