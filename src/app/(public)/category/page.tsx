"use client";

import LayoutV2 from "../layout/layoutV2";
import MostPopularProd from "@/components/core/mostPopuProd/mostPopularProd";
import CategoryV2 from "@/components/core/category/categoryV2";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { getAllCategory } from "@/services/operations/category";
import { getAllSubCategory } from "@/services/operations/subcategory";
import { getAllProduct } from "@/services/operations/product";
import { useEffect } from "react";
import { getAllCartItems } from "@/services/operations/cartItem";
import { handleAddItemCart } from "@/redux/slices/cartSlice";

const CategoryPage = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  const fetchData = async () => {
    try {
      await getAllCategory(dispatch);
      await getAllSubCategory(dispatch);
      await getAllProduct(dispatch);
    } catch (error) {
      console.error("Error fetching data:", error);
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
    fetchData();
    fetchCartItem();
  }, [token]);

  return (
    <div className="relative flex flex-col gap-10 w-full mx-auto h-min items-center font-sans">
      <LayoutV2>
        <CategoryV2 />
        <MostPopularProd />
      </LayoutV2>
    </div>
  );
};

export default CategoryPage;
