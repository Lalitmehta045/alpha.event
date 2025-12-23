"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CTAButtonV1 from "@/components/common/ctaButton/ctaButtonV1";
import { FaArrowRight } from "react-icons/fa";
import HeadingV1 from "@/components/common/Texts/HeadingV1";
import ParagraphV1 from "@/components/common/Texts/paragraph";
import sampleImg from "@/assets/images/DummyImg.jpg";

const blogs = [
  {
    id: 1,
    title: "Top 5 Wedding Backdrop Ideas for 2025",
    description: "Discover trending styles to elevate your ceremony space.",
    author: "Avinash Sharma",
    date: "19 Jan 2025",
    image: sampleImg,
  },
  {
    id: 2,
    title: "Photo Booth Props That Guests Will Love",
    description: "Fun, interactive props that guests won’t stop talking about!",
    author: "Avinash Sharma",
    date: "22 Jan 2025",
    image: sampleImg,
  },
  {
    id: 3,
    title: "How to Choose Perfect Lighting for Your Event",
    description: "Transform your venue atmosphere with smart lighting choices.",
    author: "Avinash Sharma",
    date: "28 Jan 2025",
    image: sampleImg,
  },
  {
    id: 4,
    title: "Creating Memorable Corporate Event Themes",
    description: "Professional yet creative designs that impress every client.",
    author: "Avinash Sharma",
    date: "02 Feb 2025",
    image: sampleImg,
  },
];

export default function LatestBlogsV1() {
  return (
    <section className="w-full max-w-5/6 py-16 px-4 sm:px-6 lg:px-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div className="max-w-2xl">
          <HeadingV1
            text="Latest Blogs"
            size="3xl"
            color="text-(--mainHeading1)"
            className="text-left"
          />

          <ParagraphV1
            text="Get inspired with event styling tips, décor trends, and creative ideas — all from our experts at Alpha Art and Event."
            size="lg"
            color="text-(--primaryParagraph)"
            className="mt-2 text-left"
          />
        </div>

        <CTAButtonV1
          variant="secondary"
          text="Read All Blogs"
          icon={<FaArrowRight />}
        />
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {blogs.map((blog) => (
          <Card
            key={blog.id}
            className="w-full  border border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            {/* Blog Image */}
            <div className="relative w-full h-56 sm:h-64 md:h-72">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Blog Content */}
            <CardHeader className="px-5 pt-4 pb-1">
              <CardTitle className="text-lg font-semibold leading-snug line-clamp-2">
                {blog.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="px-5 pb-5">
              <p className="text-sm text-gray-600 mb-5 line-clamp-2">
                {blog.description}
              </p>

              <div className="flex items-center justify-between">
                {/* Author */}
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage
                      src="/assets/images/googleImg.png"
                      alt={blog.author}
                    />
                    <AvatarFallback>
                      {blog.author.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-800">
                    {blog.author}
                  </span>
                </div>

                {/* Date */}
                <span className="text-xs text-gray-500">{blog.date}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
