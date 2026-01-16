"use client";

import MainHero from "@/components/core/hero/mainHero";
import LayoutV1 from "../layout/layoutV1";
import ContactV1 from "@/components/core/contact/contactV1";
import { getAllCategory } from "@/services/operations/category";
import { getAllSubCategory } from "@/services/operations/subcategory";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { getAllProduct } from "@/services/operations/product";
import RecentProductV1 from "@/components/core/recentProducts/recentProductV1";
import { getAllCartItems } from "@/services/operations/cartItem";
import { handleAddItemCart } from "@/redux/slices/cartSlice";

export default function Home() {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  const productData = useSelector(
    (state: RootState) => state.product.allProducts
  );

  const categories = useSelector(
    (state: RootState) => state.product.allCategory
  );

  const subCategories = useSelector(
    (state: RootState) => state.product.allSubCategory
  );

  const fetchData = async () => {
    try {
      await getAllCategory(dispatch);
      await getAllSubCategory(dispatch);
      await getAllProduct(dispatch);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    }
  };

  const fetchCartItem = async () => {
    // Only fetch cart if user is authenticated
    if (!token) return;
    
    try {
      const mappedCartData = await getAllCartItems(token);
      dispatch(handleAddItemCart(mappedCartData));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCartItem();
  }, [token]);

  useEffect(() => {
    if (
      categories.length === 0 ||
      subCategories.length === 0 ||
      productData.length === 0
    ) {
      fetchData();
    }
  }, [categories.length, subCategories.length, productData.length]);

  return (
    <div className="relative flex flex-col gap-10 w-full mx-auto h-min items-center font-sans">
      <LayoutV1>
        <MainHero />
        <RecentProductV1 />
        {/* <CategoryV3 />
          <FeaturedProd />
          <MostPopularProd />
          <WhyChooseUs />
          <LatestBlogsV1 />
          <FYQSection />
          <AboutV2 /> */}
        <ContactV1 />
      </LayoutV1>
    </div>
  );
}
