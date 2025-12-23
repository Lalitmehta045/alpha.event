"use client";

import { useState } from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { MdArrowDropUp, MdOutlineArrowDropDown } from "react-icons/md";

export default function FooterLinks({
  footerQuicklinks,
  footerProducts,
  footerLegalPage,
}: any) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openProduct, setopenProduct] = useState(false);
  const [openLegal, setopenLegal] = useState(false);

  return (
    <>
      {/* Quick Links (Dropdown) */}
      <div className="w-full md:w-auto">
        <button
          className="text-xl sm:text-2xl font-bold text-(--footer-text) hover:text-(--footer-text-Hover) mb-4 flex justify-between items-center w-full md:w-auto"
          onClick={() => setOpenDropdown(!openDropdown)}
        >
          Quick Links
          <span className="ml-2 text-lg">
            {openDropdown ? (
              <MdArrowDropUp fontSize={26} />
            ) : (
              <MdOutlineArrowDropDown fontSize={26} />
            )}
          </span>
        </button>

        {/* Dropdown */}
        <ul
          className={`space-y-2 text-start md:text-left  transition-all duration-300 
          ${openDropdown ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
        >
          {footerQuicklinks.map((item: any) => (
            <li
              key={item.id}
              className="mx-auto md:mx-0 text-base sm:text-lg font-medium text-(--footer-text)
              hover:text-(--footer-text-Hover) transition-colors duration-200"
            >
              <Link href={item.path}>{item.page}</Link>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      {/* Products */}
      <div className="w-full md:w-auto">
        <button
          className="text-xl sm:text-2xl font-bold text-(--footer-text) hover:text-(--footer-text-Hover) mb-4 flex justify-between items-center w-full md:w-auto"
          onClick={() => setopenProduct(!openProduct)}
        >
          Products
          <span className="ml-2 text-lg">
            {openProduct ? (
              <MdArrowDropUp fontSize={26} />
            ) : (
              <MdOutlineArrowDropDown fontSize={26} />
            )}
          </span>
        </button>

        {/* Dropdown */}
        <ul
          className={`space-y-2 text-start md:text-left  transition-all duration-300 
          ${openProduct ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
        >
          {footerProducts.map((item: any) => (
            <li
              key={item.id}
              className="mx-auto md:mx-0 text-base sm:text-lg font-medium text-(--footer-text) hover:text-(--footer-text-Hover)"
            >
              <Link href={item.path}>{item.page}</Link>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      {/* Legal Pages */}
      <div className="w-full md:w-auto">
        <button
          className="text-xl sm:text-2xl font-bold text-(--footer-text) hover:text-(--footer-text-Hover) mb-4 flex justify-between items-center w-full md:w-auto"
          onClick={() => setopenLegal(!openLegal)}
        >
          Legal Pages
          <span className="ml-2 text-lg">
            {openLegal ? (
              <MdArrowDropUp fontSize={26} />
            ) : (
              <MdOutlineArrowDropDown fontSize={26} />
            )}
          </span>
        </button>

        {/* Dropdown */}
        <ul
          className={`space-y-2 text-start md:text-left  transition-all duration-300 
          ${openLegal ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
        >
          {footerLegalPage.map((item: any) => (
            <li
              key={item.id}
              className="mx-auto md:mx-0 text-base sm:text-lg font-medium text-(--footer-text) hover:text-(--footer-text-Hover)"
            >
              <Link href={item.path}>{item.page}</Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
