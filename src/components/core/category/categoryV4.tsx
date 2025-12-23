"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// ✅ Match your backend SubCategoryItem shape
interface SubCategoryItem {
  id: number; // from backend
  title: string;
  path: string;
  image: string;
  description?: string;
}

interface SubCategory {
  items?: SubCategoryItem[];
}

interface CategoryV4Props {
  subCategory: SubCategory;
}

const CategoryV4 = ({ subCategory }: CategoryV4Props) => {
  const router = useRouter();

  return (
    <section className="py-5 sm:py-2 px-6 lg:px-2 mx-auto w-full">
      {/* ✅ Responsive Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 place-items-center mx-auto">
        {subCategory.items?.length ? (
          subCategory.items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                onClick={() => router.push(item.path)}
                className="rounded-2xl max-w-80 cursor-pointer  border bg-white shadow-sm hover:shadow-lg transition-all"
              >
                <CardHeader className="p-0">
                  <div className="relative h-40 ">
                    <Image
                      src={item?.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-1">
                  <CardTitle className="text-lg font-semibold line-clamp-1">
                    {item.title}
                  </CardTitle>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {item.description || "No description available."}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No items available.
          </p>
        )}
      </div>
    </section>
  );
};

export default CategoryV4;

// const categories = [
//   {
//     id: 1,
//     title: "Structure",
//     description:
//       "Elegant décor that turns every event into a stunning celebration.",
//     image: "/assets/images/Structure.jpg",
//     className: "",
//     path: "/category/alpha-rentals/structure",
//   },
//   {
//     id: 2,
//     title: "Props",
//     description:
//       "High-quality event rentals for smooth and stylish gatherings.",
//     image: "/assets/images/Props.jpg",
//     className: "",
//     path: "/category/alpha-rentals/props",
//   },
//   {
//     id: 3,
//     title: "Alpha Lights",
//     description: "Vibrant balloon designs that bring joy to every occasion.",
//     image: "/assets/images/Lights.jpg",
//     className: "",
//     path: "/category/alpha-rentals/light",
//   },
//   {
//     id: 4,
//     title: "Alpha Games",
//     description: "Creative themed props that add warmth and festive charm.",
//     image: "/assets/images/Games.jpg",
//     className: "",
//     path: "/category/alpha-rentals/games",
//   },
//   {
//     id: 5,
//     title: "Alpha Furniture",
//     description: "Creative themed props that add warmth and festive charm.",
//     image: "/assets/images/Furniture.jpg",
//     className: "",
//     path: "",
//   },
// ];
