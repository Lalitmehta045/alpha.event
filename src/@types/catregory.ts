export interface Category {
  _id: string;
  name: string;
  image: string;
  description: string;
}

export interface SubCategory {
  _id: string;
  name: string;
  image?: string;
  category: {
    _id: string;
    name: string;
    image?: string;
    description: string;
  };
}
export interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  subCategory?: string;
  image?: string;
}
