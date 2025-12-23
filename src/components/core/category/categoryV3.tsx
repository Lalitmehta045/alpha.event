"use client";

import { BentoCard } from "@/components/ui/bento-grid";

// const categories = [
//   {
//     id: 1,
//     title: "Wedding Decor",
//     description:
//       "Elegant décor that turns every event into a stunning celebration.",
//     image: "/assets/images/A-Decor.jpg",
//     className: "",
//     path: "",
//   },
//   {
//     id: 2,
//     title: "Corporate Events",
//     description:
//       "High-quality event rentals for smooth and stylish gatherings.",
//     image: "/assets/images/A-Rentals.jpg",
//     className: "",
//     path: "",
//   },
//   {
//     id: 3,
//     title: "Birthday Parties",
//     description: "Vibrant balloon designs that bring joy to every occasion.",
//     image: "/assets/images/A-Balloons.jpg",
//     className: "",
//     path: "",
//   },
//   {
//     id: 4,
//     title: "Festive Themes",
//     description: "Creative themed props that add warmth and festive charm.",
//     image: "/assets/images/A-Thermal.jpg",
//     className: "",
//     path: "",
//   },
//   // {
//   //   id: 5,
//   //   title: "Alpha Furniture",
//   //   description: "Creative themed props that add warmth and festive charm.",
//   //   image: "/assets/images/Furniture.jpg",
//   //   className: "",
//   // },
// ];

const categories = [
  {
    id: 1,
    title: "Structure",
    description:
      "Elegant décor that turns every event into a stunning celebration.",
    image: "/assets/images/Structure.jpg",
    className: "",
    path: "/category/alpha-rentals/structure",
  },
  {
    id: 2,
    title: "Props",
    description:
      "High-quality event rentals for smooth and stylish gatherings.",
    image: "/assets/images/Props.jpg",
    className: "",
    path: "/category/alpha-rentals/props",
  },
  {
    id: 3,
    title: "Alpha Lights",
    description: "Vibrant balloon designs that bring joy to every occasion.",
    image: "/assets/images/Lights.jpg",
    className: "",
    path: "/category/alpha-rentals/light",
  },
  {
    id: 4,
    title: "Alpha Games",
    description: "Creative themed props that add warmth and festive charm.",
    image: "/assets/images/Games.jpg",
    className: "",
    path: "/category/alpha-rentals/games",
  },
  {
    id: 5,
    title: "Alpha Furniture",
    description: "Creative themed props that add warmth and festive charm.",
    image: "/assets/images/Furniture.jpg",
    className: "",
    path: "",
  },
];

const CategoryV3 = () => {
  return (
    <section className="py-5 sm:py-2 px-6 lg:px-2 mx-auto bg-(--mainBg)">
      {/* Section Heading */}
      {/* <div className="max-w-5xl mx-auto text-center mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-(--mainHeading1) mb-2">
          View Our Range of Categories
        </h2>

        <ParagraphV1
          text="Browse by theme or event type — we’ve curated collections to match every celebration."
          size="lg"
          color="text-(--primaryParagraph)"
          className="mt-2"
        />
      </div> */}

      {/* Simple Responsive Grid */}
      <div className="max-w-max grid grid-cols-2 gap-6 place-items-center mx-auto">
        {categories.map((cat) => (
          <BentoCard
            key={cat.id}
            title={cat.title}
            path={cat.path}
            image={cat.image}
            description={cat.description}
            className="rounded-2xl cursor-pointer"
          />
        ))}
      </div>
    </section>
  );
};

export default CategoryV3;
