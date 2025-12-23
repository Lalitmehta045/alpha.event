"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HeadingV1 from "@/components/common/Texts/HeadingV1";
import ParagraphV1 from "@/components/common/Texts/paragraph";
import CTAButtonV1 from "@/components/common/ctaButton/ctaButtonV1";
import { FaArrowRight } from "react-icons/fa";
import sampleImg from "@/assets/images/DummyImg.jpg";

const blogs = [
  {
    id: 1,
    title: "Top 5 Wedding Backdrop Ideas for 2025",
    description:
      "Discover trending wedding backdrop designs that create unforgettable ceremony spaces.",
    author: "Avinash Sharma",
    date: "19 Jan 2025",
    image: sampleImg,
  },
  {
    id: 2,
    title: "Photo Booth Props That Guests Will Love",
    description:
      "Add fun to your events with creative photo booth props everyone will adore.",
    author: "Avinash Sharma",
    date: "20 Jan 2025",
    image: sampleImg,
  },
  {
    id: 3,
    title: "Lighting Tips to Transform Any Venue",
    description:
      "Create the perfect ambiance with professional lighting setup ideas.",
    author: "Avinash Sharma",
    date: "22 Jan 2025",
    image: sampleImg,
  },
  {
    id: 4,
    title: "Luxury Decor on a Budget",
    description:
      "How to create a premium event look without overspending on décor.",
    author: "Avinash Sharma",
    date: "23 Jan 2025",
    image: sampleImg,
  },
];

export default function LatestBlogsV2() {
  return (
    <section className="w-full h-full max-h-5/6 md:max-h-10/12 lg:max-h-11/12 xl:max-h-full pt-32 sm:pt-28 md:pt-32 lg:pt-36 py-20 flex flex-col items-center justify-center text-center text-white px-0 sm:px-6 md:px-10 lg:px-20">
      {/* Heading Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-11/12 text-start mb-10"
      >
        <HeadingV1
          text="Our Latest Blogs"
          size="5xl"
          color="text-(--mainHeading2)"
        />
        <ParagraphV1
          text="Explore expert tips, event inspirations, and creative ideas to make your special day truly extraordinary."
          size="lg"
          color="text-(--secondaryParagraph)"
          className="mt-3 max-w-max"
        />
      </motion.section>

      {/* Blog Grid */}
      <section className="w-11/12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 place-items-center lg:place-items-start justify-start mx-auto">
        {blogs.map((blog, index) => (
          <motion.div
            key={blog.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="bg-white/80 gap-2 px-3 text-start backdrop-blur-md shadow-lg hover:shadow-2xl transition-all border border-white/40 rounded-2xl">
              {/* Responsive image height */}
              <div className="relative w-full h-48 sm:h-56 md:h-60">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  sizes="100%"
                  className="object-cover rounded-2xl"
                />
              </div>

              <CardHeader className="pb-0 px-1">
                <CardTitle className="text-lg sm:text-xl font-semibold leading-snug text-gray-900 line-clamp-2">
                  {blog.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="px-1">
                <p className="text-gray-600 text-sm sm:text-base mb-4 line-clamp-3">
                  {blog.description.length > 40
                    ? `${blog.description.substring(0, 40)}...`
                    : blog.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage
                        src="/assets/images/googleImg.png"
                        alt={blog.author}
                      />
                      <AvatarFallback>AS</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-900">
                      {blog.author}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{blog.date}</span>
                </div>

                <div className="mt-4 flex justify-end">
                  <CTAButtonV1
                    variant="secondary"
                    text="Read More"
                    icon={<FaArrowRight />}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>
    </section>
  );
}
