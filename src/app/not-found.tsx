"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import LayoutV2 from "./(public)/layout/layoutV2";
import Image from "next/image";
import notfoundImg from "@/assets/images/notfoundImg.png";
import CTAButtonV1 from "@/components/common/ctaButton/ctaButtonV1";
import { FaArrowRight } from "react-icons/fa";

export default function NotFound() {
  const router = useRouter();

  return (
    <LayoutV2>
      <main className="w-full flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-8 font-sans">
        {/* Illustration */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full mx-auto mt-20 md:mt-28"
        >
          <div className="h-[300px] md:h-[400px] relative">
            <Image
              src={notfoundImg}
              alt="404 - Page Not Found"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="w-full h-full object-contain rounded-full"
              priority
            />
          </div>
          <h1 className="text-5xl font-extrabold mt-6 text-gray-900 dark:text-gray-100">
            Page Not Found
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
            Oops! The page you’re looking for doesn’t exist or has been moved.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex gap-4 mt-6"
        >
          <CTAButtonV1
            variant="secondary"
            text="Go to Homepage"
            onClick={() => router.push("/")}
            icon={<FaArrowRight />}
            className="py-[22px]"
          />
          <CTAButtonV1
            variant="outline"
            text="Contact Support"
            onClick={() => router.push("/contact")}
            icon={<FaArrowRight />}
            className="py-[22px]"
          />
        </motion.div>
      </main>
    </LayoutV2>
  );
}
