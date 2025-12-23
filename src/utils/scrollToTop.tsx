"use client";
import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 200) setVisible(true);
      else setVisible(false);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <>
      {visible && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-22 right-6 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 flex items-center justify-center w-12 h-12 bg-(--mainBg) border border-gray-500 text-white rounded-full shadow-2xl z-50 transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="text-base sm:text-lg md:text-xl" />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
