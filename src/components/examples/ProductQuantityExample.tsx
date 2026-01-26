"use client";

import React, { useState } from "react";
import QuantitySelector from "../common/QuantitySelector";
import { Product } from "@/@types/product";

/**
 * Example: Using QuantitySelector on a Product Page
 * 
 * This example demonstrates:
 * - Real-time price calculation based on quantity
 * - Stock limit validation
 * - Add to cart with selected quantity
 */

interface ProductQuantityExampleProps {
    product: Product;
    onAddToCart: (productId: string, quantity: number) => void;
}

const ProductQuantityExample: React.FC<ProductQuantityExampleProps> = ({
    product,
    onAddToCart,
}) => {
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    const handleQuantityChange = (newQuantity: number) => {
        setQuantity(newQuantity);
    };

    const handleAddToCart = async () => {
        setIsAdding(true);
        try {
            await onAddToCart(product._id, quantity);
            // Reset quantity after adding to cart
            setQuantity(1);
        } catch (error) {
            console.error("Failed to add to cart:", error);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-4">{product.description}</p>

            <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Select Quantity:</p>
                <QuantitySelector
                    value={quantity}
                    onChange={handleQuantityChange}
                    min={1}
                    max={product.stock || undefined}
                    showPrice={true}
                    unitPrice={product.price}
                    disabled={isAdding}
                    loading={isAdding}
                    size="lg"
                />
            </div>

            {product.stock && product.stock < 10 && (
                <p className="text-sm text-orange-600 mb-4">
                    Only {product.stock} items left in stock!
                </p>
            )}

            <button
                onClick={handleAddToCart}
                disabled={isAdding}
                style={{ backgroundColor: "var(--cta-Bg)" }}
                className="w-full py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                {isAdding ? "Adding..." : "Add to Cart"}
            </button>
        </div>
    );
};

export default ProductQuantityExample;
