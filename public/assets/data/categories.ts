export interface SubCategoryItem {
  id: number;
  title: string;
  image: string;
  description: string;
  path: string;
}

export interface SubCategory {
  slug: string;
  title: string;
  description: string;
  image: string;
  items?: SubCategoryItem[];
}

export interface CategoryData {
  title: string;
  description: string;
  image: string;
  subCategories?: SubCategory[];
}

export const categories: Record<string, CategoryData> = {
  "alpha-rental": {
    title: "Alpha Rentals",
    description:
      "High-quality event rentals for smooth and stylish gatherings.",
    image: "/assets/images/A-Rentals.jpg",
    subCategories: [
      {
        slug: "structure",
        title: "Structures",
        description:
          "Elegant décor that turns every event into a stunning celebration.",

        image: "/assets/subcategory/Structure.jpg",
        items: [
          {
            id: 1,
            title: "Wooden Stage",
            description: "Strong wooden platform",
            image: "/assets/products/Structure/StructureV1.jpg",
            path: "/",
          },
          {
            id: 2,
            title: "Tent Ceiling",
            description: "Beautiful design",
            image: "/assets/products/Structure/StructureV2.jpg",
            path: "/",
          },
        ],
      },
      {
        slug: "props",
        title: "Props",
        description:
          "High-quality event rentals for smooth and stylish gatherings.",
        image: "/assets/subcategory/Props.jpg",
        items: [
          {
            id: 1,
            title: "Wooden Stage",
            description: "Strong wooden platform",
            image: "/assets/products/Props/PropsV1.jpg",
            path: "/",
          },
          {
            id: 2,
            title: "Tent Ceiling",
            description: "Beautiful design",
            image: "/assets/products/Props/PropsV2.jpg",
            path: "/",
          },
        ],
      },
      {
        slug: "lights",
        title: "Lights",
        description:
          "High-quality event rentals for smooth and stylish gatherings.",
        image: "/assets/subcategory/Lights.jpg",
      },
    ],
  },

  "alpha-decoration": {
    title: "Alpha Decoration",
    description: "Elegant décor for stunning events.",
    image: "/assets/images/Alpha-Decoration.jpg",
    subCategories: [
      {
        slug: "structure",
        title: "Structures",
        description:
          "Elegant décor that turns every event into a stunning celebration.",

        image: "/assets/images/Structure.jpg",
        items: [
          {
            id: 1,
            title: "Wooden Stage",
            description: "Strong wooden platform",
            image: "/assets/images/stage.jpg",
            path: "/",
          },
          {
            id: 2,
            title: "Tent Ceiling",
            description: "Beautiful design",
            image: "/assets/images/tent.jpg",
            path: "/",
          },
        ],
      },
      {
        slug: "props",
        title: "Props",
        description:
          "High-quality event rentals for smooth and stylish gatherings.",
        image: "/assets/images/Props.jpg",
      },
    ],
  },

  "alpha-balloons": {
    title: "Alpha Balloons",
    description: "Colorful balloon designs for every celebration.",
    image: "/assets/images/Alpha-Balloons.jpg",
  },
};
