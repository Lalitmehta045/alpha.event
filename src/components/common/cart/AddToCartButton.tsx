"use client";

import React, { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import {
  addToCart,
  updateQuantity,
  removeFromCart,
} from "@/redux/slices/cartSlice";
import Loading from "./Loading";
import { Product } from "@/@types/product";
import { cn } from "@/lib/utils";
import { IoCartOutline } from "react-icons/io5";
import {
  addCartItem,
  deleteCartItem,
  updateCartItem,
} from "@/services/operations/cartItem";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Props {
  data: Product;
  className?: string;
  icon?: any;
}

const AddToCartButton: React.FC<Props> = ({ data, className, icon }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);

  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(0);

  const cartItem = cartItems.find((item) => item.product._id === data._id);

  useEffect(() => {
    if (cartItem) {
      setQty(cartItem.quantity);
    } else {
      setQty(0);
    }
  }, [cartItem]);

  // ================Add To Cart=========================
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.error("Please Login First");
      router.push("/auth/sign-in");
      return; // 🔥 VERY IMPORTANT
    }

    try {
      setLoading(true);
      const productId = data._id;
      const response = await addCartItem(productId, router, token);
      if (!response) {
        toast.error("Something went wrong!");
        return;
      }

      const addPayload = {
        _id: response._id,
        quantity: response.quantity,
        product: response.productId,
      };

      dispatch(addToCart(addPayload));
      // Success toast
      toast.success("Item added to cart!");
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  // =========================Increase Quantity============================
  const increaseQty = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.error("Please Login First");
    }

    if (!data._id) return;
    const newQty = qty + 1;
    const cartId = cartItem?._id;

    const response = await updateCartItem(
      cartId as string,
      newQty,
      token as string
    );

    const updatePayload = {
      _id: response._id,
      quantity: response.quantity,
      product: response.productId,
    };

    dispatch(updateQuantity(updatePayload));
  };

  // ==========Decrease Quantity=======================
  const decreaseQty = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.error("Please Login First");
      return;
    }

    if (!data._id) return;

    const newQty = qty - 1;
    const cartId = cartItem?._id;

    if (!cartId) return;

    if (newQty === 0) {
      try {
        const delresponse = await deleteCartItem(
          cartId as string,
          token as string
        );

        dispatch(removeFromCart(cartId));
      } catch (error) {
        toast.error("Failed to remove item from cart.");
      }
    } else {
      const response = await updateCartItem(
        cartId as string,
        newQty,
        token as string
      );

      const updatePayload = {
        _id: response._id,
        quantity: response.quantity,
        product: response.productId,
      };

      dispatch(updateQuantity(updatePayload));
    }
  };

  return (
    <div
      className={cn(
        "text-center cursor-pointer rounded-lg bg-white",
        className
      )}
    >
      {qty > 0 ? (
        <div className="flex w-full items-center gap-3">
          <button
            onClick={decreaseQty}
            style={{
              backgroundColor: "var(--cta-Bg)",
            }}
            disabled={loading}
            className="cursor-pointer hover:bg-(--cta-Bg-hover) text-white font-bold rounded-l-lg px-3 py-2 text-xs"
          >
            <FaMinus />
          </button>

          <p className="flex-1 text-center font-semibold">{qty}</p>

          <button
            onClick={increaseQty}
            style={{
              backgroundColor: "var(--cta-Bg)",
            }}
            disabled={loading}
            className="cursor-pointer hover:bg-(--cta-Bg-hover) text-white font-bold rounded-r-lg px-3 py-2 text-xs"
          >
            <FaPlus />
          </button>
        </div>
      ) : (
        <button
          onClick={handleAddToCart}
          className={`text-center flex gap-3 cursor-pointer items-center justify-center mx-auto font-semibold transition-all `}
        >
          {loading ? <Loading /> : "Add to cart"}
          {/* <IoCartOutline style={{ width: 20, height: 20 }} /> */}
          {icon}
        </button>
      )}
    </div>
  );
};

export default AddToCartButton;
