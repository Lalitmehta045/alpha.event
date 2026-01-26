"use client";

import React, { useState, useEffect } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
    value: number;
    onChange: (quantity: number) => void;
    onIncrement?: () => void;
    onDecrement?: () => void;
    min?: number;
    max?: number;
    disabled?: boolean;
    loading?: boolean;
    showPrice?: boolean;
    unitPrice?: number;
    className?: string;
    inputClassName?: string;
    buttonClassName?: string;
    size?: "sm" | "md" | "lg";
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
    value,
    onChange,
    onIncrement,
    onDecrement,
    min = 1,
    max,
    disabled = false,
    loading = false,
    showPrice = false,
    unitPrice = 0,
    className,
    inputClassName,
    buttonClassName,
    size = "md",
}) => {
    const [internalValue, setInternalValue] = useState<string>(value.toString());
    const [isFocused, setIsFocused] = useState(false);

    // Sync internal value with prop value
    useEffect(() => {
        if (!isFocused) {
            setInternalValue(value.toString());
        }
    }, [value, isFocused]);

    // Handle manual input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Allow empty string for user to clear and retype
        if (inputValue === "") {
            setInternalValue("");
            return;
        }

        // Only allow numeric characters
        if (!/^\d+$/.test(inputValue)) {
            return;
        }

        // Parse the value
        const numValue = parseInt(inputValue, 10);

        // Prevent values that are clearly invalid
        if (isNaN(numValue)) {
            return;
        }

        // Update internal state immediately for responsive UI
        // DO NOT call onChange here - only validate on blur
        setInternalValue(inputValue);
    };

    // Handle blur - auto-correct invalid values
    const handleBlur = () => {
        setIsFocused(false);

        const numValue = parseInt(internalValue, 10);

        // Auto-correct to minimum if invalid or empty
        if (isNaN(numValue) || internalValue === "") {
            setInternalValue(min.toString());
            onChange(min);
            return;
        }

        // Auto-correct to minimum if below minimum
        if (numValue < min) {
            setInternalValue(min.toString());
            onChange(min);
            return;
        }

        // Auto-correct to maximum if exceeded
        if (max && numValue > max) {
            setInternalValue(max.toString());
            onChange(max);
            return;
        }

        // Ensure the value is properly formatted (remove leading zeros)
        const formattedValue = numValue.toString();
        setInternalValue(formattedValue);

        // Call onChange only on blur with valid value
        onChange(numValue);
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    // Handle increment
    const handleIncrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (disabled || loading) return;

        const currentValue = parseInt(internalValue, 10) || min;
        const newValue = currentValue + 1;

        if (!max || newValue <= max) {
            setInternalValue(newValue.toString());
            if (onIncrement) {
                onIncrement();
            } else {
                onChange(newValue);
            }
        }
    };

    // Handle decrement
    const handleDecrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (disabled || loading) return;

        const currentValue = parseInt(internalValue, 10) || min;
        const newValue = currentValue - 1;

        if (newValue >= min) {
            setInternalValue(newValue.toString());
            if (onDecrement) {
                onDecrement();
            } else {
                onChange(newValue);
            }
        }
    };

    // Calculate total price
    const totalPrice = showPrice && unitPrice ? (value * unitPrice).toFixed(2) : null;

    // Size-based styling
    const sizeClasses = {
        sm: {
            button: "px-2 py-1 text-xs",
            input: "text-sm h-7 min-w-[40px] max-w-[60px]",
            icon: "w-3 h-3",
        },
        md: {
            button: "px-3 py-2 text-xs",
            input: "text-base h-9 min-w-[50px] max-w-[70px]",
            icon: "w-3.5 h-3.5",
        },
        lg: {
            button: "px-4 py-3 text-sm",
            input: "text-lg h-11 min-w-[60px] max-w-[80px]",
            icon: "w-4 h-4",
        },
    };

    const currentSize = sizeClasses[size];
    const isAtMin = parseInt(internalValue, 10) <= min;
    const isAtMax = max ? parseInt(internalValue, 10) >= max : false;

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <div className="flex items-center gap-0 w-full">
                {/* Decrement Button */}
                <button
                    onClick={handleDecrement}
                    disabled={disabled || loading || isAtMin}
                    style={{
                        backgroundColor: "var(--cta-Bg)",
                    }}
                    className={cn(
                        "cursor-pointer hover:opacity-90 text-white font-bold rounded-l-lg transition-all flex-shrink-0",
                        currentSize.button,
                        (disabled || loading || isAtMin) && "opacity-50 cursor-not-allowed",
                        buttonClassName
                    )}
                    aria-label="Decrease quantity"
                    type="button"
                >
                    <FaMinus className={currentSize.icon} />
                </button>

                {/* Quantity Input */}
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={internalValue}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    disabled={disabled || loading}
                    className={cn(
                        "text-center font-semibold border-y border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all overflow-hidden",
                        currentSize.input,
                        (disabled || loading) && "bg-gray-100 cursor-not-allowed opacity-50",
                        inputClassName
                    )}
                    style={{
                        borderColor: isFocused ? "var(--cta-Bg)" : undefined,
                    }}
                    aria-label="Quantity"
                    min={min}
                    max={max}
                />

                {/* Increment Button */}
                <button
                    onClick={handleIncrement}
                    disabled={disabled || loading || isAtMax}
                    style={{
                        backgroundColor: "var(--cta-Bg)",
                    }}
                    className={cn(
                        "cursor-pointer hover:opacity-90 text-white font-bold rounded-r-lg transition-all",
                        currentSize.button,
                        (disabled || loading || isAtMax) && "opacity-50 cursor-not-allowed",
                        buttonClassName
                    )}
                    aria-label="Increase quantity"
                    type="button"
                >
                    <FaPlus className={currentSize.icon} />
                </button>
            </div>

            {/* Price Display */}
            {showPrice && totalPrice && (
                <div className="text-center text-sm font-semibold text-gray-700">
                    Total: ₹{totalPrice}
                </div>
            )}
        </div>
    );
};

export default QuantitySelector;
