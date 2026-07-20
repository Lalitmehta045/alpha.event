"use client";

import React, { useState, useEffect } from "react";
import { FaSearch, FaClock, FaTimes, FaMapMarkerAlt } from "react-icons/fa";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { getAllProduct } from "@/services/operations/product";
import { useDispatch } from "react-redux";
import { ProductFormValues } from "@/@types/product";
import { valideURLConvert } from "@/utils/valideURLConvert";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AddAddressDialog from "@/components/common/address/AddAddressDialog";

const RECENT_SEARCHES_KEY = "recent_searches";
const MAX_RECENT_SEARCHES = 5;

interface SearchBarProps {
  onLocationChange?: (location: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onLocationChange }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<ProductFormValues[]>(
    []
  );
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("Indore");

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch (error) {
          console.error("Failed to parse recent searches:", error);
        }
      }
    }
  }, []);

  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false);
        setShowRecentSearches(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Save search to recent searches
  const addToRecentSearches = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    const updated = [
      searchTerm.trim(),
      ...recentSearches.filter((s) => s.toLowerCase() !== searchTerm.trim().toLowerCase()),
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    }
  };

  // Remove from recent searches
  const removeRecentSearch = (searchTerm: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== searchTerm);
    setRecentSearches(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    }
  };

  // Backend search (debounced)
  useEffect(() => {
    const fetchResults = async () => {
      if (inputValue.trim() === "") {
        setFilteredProducts([]);
        return;
      }

      try {
        const results = await getAllProduct(dispatch, inputValue);
        setFilteredProducts(results || []);
      } catch (error) {
        console.error("Search error:", error);
      }
    };

    const debounce = setTimeout(fetchResults, 300); // 300ms debounce

    return () => clearTimeout(debounce);
  }, [inputValue]);

  return (
    <div className="relative z-[100] w-full max-w-xl sm:max-w-2xl md:max-w-3xl" ref={searchContainerRef}>

      {/* Search Field */}
      <div className="flex items-center bg-white/70 backdrop-blur-lg border border-white/20 shadow-sm hover:shadow-md rounded-full px-2 py-1.5 sm:px-3 sm:py-2 focus-within:border-[#9c6567] focus-within:shadow-md focus-within:hover:shadow-md transition-all duration-300">
        <div className="relative flex items-center h-full">
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 px-3 h-10 sm:h-11 rounded-full bg-[#fcf4f4] text-[#9c6567] hover:bg-[#faeaea] hover:scale-105 transition-all duration-300 shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLocationDropdownOpen((prev) => !prev);
            }}
            title="Select Delivery Location"
          >
            <FaMapMarkerAlt className="text-base sm:text-lg pointer-events-none shrink-0" />
            {selectedLocation && (
              <span className="text-xs sm:text-sm font-medium max-w-[60px] sm:max-w-[80px] truncate pointer-events-none">
                {selectedLocation}
              </span>
            )}
          </button>

          {isLocationDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                Select City
              </div>
              {["Indore", "Bhopal", "Ujjain", "Jabalpur", "Rau", "Pithampur", "Dewas", "Mhow"].map((city) => (
                <button
                  key={city}
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-600 text-gray-700 text-sm font-medium transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedLocation(city);
                    setIsLocationDropdownOpen(false);
                    if (onLocationChange) onLocationChange(city);
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="h-7 w-px bg-gray-200 mx-2 sm:mx-3 shrink-0"></div>

        <div className="relative flex-1 flex items-center">
          {/* Placeholder text animation */}
          {!inputValue && !isFocused && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none font-medium text-gray-500 text-sm sm:text-base flex items-center gap-1 whitespace-nowrap">
              <span>Search for</span>
              <TypingAnimation
                words={[
                  "props",
                  "premium décor",
                  "event lights",
                  "stage backdrops",
                  "creative setups",
                ]}
                loop
              />
            </div>
          )}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowRecentSearches(true);
            }}
            onBlur={() => {
              // Delay to allow click events on recent searches
              setTimeout(() => {
                setIsFocused(false);
                setShowRecentSearches(false);
              }, 200);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputValue.trim()) {
                addToRecentSearches(inputValue);
                setFilteredProducts([]);
                setShowRecentSearches(false);
                setIsFocused(false);
                router.push(`/products?search=${encodeURIComponent(inputValue.trim())}`);
              }
            }}
            className="w-full bg-transparent outline-none font-medium text-gray-800 text-base px-2 placeholder-transparent"
          />
        </div>
        <button
          className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#3a0103] text-white hover:bg-[#9c6567] hover:scale-105 transition-all duration-300 shrink-0"
          onClick={() => {
            if (inputValue.trim()) {
              addToRecentSearches(inputValue);
              setFilteredProducts([]);
              setShowRecentSearches(false);
              setIsFocused(false);
              router.push(`/products?search=${encodeURIComponent(inputValue.trim())}`);
            }
          }}
        >
          <FaSearch className="text-base sm:text-lg cursor-pointer" />
        </button>
      </div>

      {/* Recent Searches - Show when focused and input is empty */}
      {showRecentSearches && !inputValue && recentSearches.length > 0 && (
        <div 
          className="absolute z-50 w-full top-full left-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-lg max-h-96 overflow-y-auto"
          onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking dropdown
        >
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FaClock className="text-gray-500" />
              Recent Searches
            </h3>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowRecentSearches(false);
                setIsFocused(false);
              }}
              className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-full transition-colors flex items-center justify-center"
              aria-label="Close recent searches"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
          <div className="py-1">
            {recentSearches.map((search, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-all group"
                onClick={async () => {
                  setInputValue(search);
                  setIsFocused(true);
                  setShowRecentSearches(false);
                  // Trigger search automatically
                  const results = await getAllProduct(dispatch, search);
                  setFilteredProducts(results || []);
                  addToRecentSearches(search);
                }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <FaClock className="text-gray-400 text-sm" />
                  <span className="text-gray-800 text-sm sm:text-base">
                    {search}
                  </span>
                </div>
                <button
                  onClick={(e) => removeRecentSearch(search, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-200 rounded-full"
                  aria-label="Remove search"
                >
                  <FaTimes className="text-gray-500 text-xs" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result Dropdown */}
      {filteredProducts.length > 0 && (
        <div className="absolute z-50 w-full top-full left-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-lg max-h-96 overflow-y-auto">
          {filteredProducts.map((product) => (
            <Link
              href={`/product/${valideURLConvert(product.name)}-${product._id}`}
              key={product._id}
            >
              <div
                // key={product._id}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer transition-all"
              >
                <img
                  src={product.image[0]}
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded-md"
                />
                <span className="text-gray-800 text-sm sm:text-base">
                  {product.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* No results */}
      {inputValue && filteredProducts.length === 0 && !showRecentSearches && (
        <div className="absolute z-50 w-full top-full left-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-lg px-4 py-3 text-gray-500 text-sm text-center">
          No products found.
        </div>
      )}

      {/* Address Dialog */}
      <AddAddressDialog open={isAddressDialogOpen} setOpen={setIsAddressDialogOpen} />
    </div>
  );
};

export default SearchBar;
