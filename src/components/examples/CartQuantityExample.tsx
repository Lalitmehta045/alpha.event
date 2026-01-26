"use client";

import React from "react";
import QuantitySelector from "../common/QuantitySelector";
import { useDispatch } from "react-redux";
import { updateQuantity, removeFromCart } from "@/redux/slices/cartSlice";
import toast from "react-hot-toast";

/**
 * Example: Using QuantitySelector in Shopping Cart
 * 
 * This example demonstrates:
 * - Direct cart quantity updates
 * - Automatic item removal when quantity reaches 0
 * - Real-time total price recalculation
 * - Integration with Redux cart state
 */

interface CartItem {
    _id: string;
    quantity: number;
    product: {
        _id: string;
        name: string;
        price: number;
        image?: string;
    };
}

interface CartQuantityExampleProps {
    item: CartItem;
    onUpdateQuantity: (cartItemId: string, newQuantity: number) => Promise<void>;
    onRemoveItem: (cartItemId: string) => Promise<void>;
}

const CartQuantityExample: React.FC<CartQuantityExampleProps> = ({
    item,
    onUpdateQuantity,
    onRemoveItem,
}) => {
    const dispatch = useDispatch();
    const [isUpdating, setIsUpdating] = React.useState(false);

    const handleQuantityChange = async (newQuantity: number) => {
        setIsUpdating(true);
        try {
            await onUpdateQuantity(item._id, newQuantity);

            // Update Redux state
            dispatch(
                updateQuantity({
                    _id: item._id,
                    quantity: newQuantity,
                })
            );

            toast.success("Quantity updated");
        } catch (error) {
            console.error("Failed to update quantity:", error);
            toast.error("Failed to update quantity");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDecrement = async () => {
        const newQuantity = item.quantity - 1;

        if (newQuantity === 0) {
            // Remove item from cart
            setIsUpdating(true);
            try {
                await onRemoveItem(item._id);
                dispatch(removeFromCart(item._id));
                toast.success("Item removed from cart");
            } catch (error) {
                console.error("Failed to remove item:", error);
                toast.error("Failed to remove item");
            } finally {
                setIsUpdating(false);
            }
        } else {
            await handleQuantityChange(newQuantity);
        }
    };

    const handleIncrement = async () => {
        const newQuantity = item.quantity + 1;
        await handleQuantityChange(newQuantity);
    };

    const totalPrice = (item.product.price * item.quantity).toFixed(2);

    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Product Image */}
            {item.product.image && (
                <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded"
                />
            )}

            {/* Product Info */}
            <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.product.name}</h3>
                <p className="text-sm text-gray-600">₹{item.product.price} per unit</p>
            </div>

            {/* Quantity Selector */}
            <div className="w-40">
                <QuantitySelector
                    value={item.quantity}
                    onChange={handleQuantityChange}
                    onIncrement={handleIncrement}
                    onDecrement={handleDecrement}
                    min={1}
                    disabled={isUpdating}
                    loading={isUpdating}
                    size="sm"
                />
            </div>

            {/* Total Price */}
            <div className="text-right min-w-[100px]">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-lg font-bold">₹{totalPrice}</p>
            </div>

            {/* Remove Button */}
            <button
                onClick={() => handleDecrement()}
                disabled={isUpdating}
                className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                aria-label="Remove item"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                </svg>
            </button>
        </div>
    );
};

export default CartQuantityExample;
