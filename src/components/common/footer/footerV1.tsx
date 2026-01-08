"use client";

import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import logo from "@/assets/images/companyLogo.png";
import { FaInstagram, FaFacebookF } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { BsTwitterX } from "react-icons/bs";
import Link from "next/link";
import footerQuicklinks from "@/assets/json/footer/footerQuicklinks.json";
import footerProducts from "@/assets/json/footer/footerProducts.json";
import footerLegalPage from "@/assets/json/footer/footerLegalPage.json";
import FooterLinks from "./FooterLinks";

export default function FooterV1() {
  return (
    <footer className="w-full h-full min-h-170 md:min-h-min bg-(--footer-bg) text-(--footer-text) hover:text-(--footer-text-Hover)">
      <div className="max-w-11/12 mx-auto px-6 sm:px-10 md:px-16 pb-20 pt-5 sm:py-16 lg:py-20">
        {/* Top Grid Section */}
        <div className="flex justify-between flex-col lg:flex-row gap-10 md:gap-5 text-center">
          {/* Logo Section */}
          <div className="w-full max-w-max mx-auto lg:mx-0 text-center md:text-start">
            <div>
              <Image
                src={logo}
                alt="Art & Rentals Logo"
                width={100}
                height={100}
                className="object-contain mb-3 mx-auto"
              />
              <p className="text-2xl sm:text-3xl font-bold text-(--footer-text) hover:text-(--footer-text-Hover)">
                Alpha Art & Events
              </p>
            </div>
          </div>

          <div className="w-full max-w-6xl hidden md:flex flex-wrap md:flex-nowrap justify-around items-start gap-10">
            {/* Quick Links */}
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-(--footer-text) hover:text-(--footer-text-Hover) mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2 text-center">
                {footerQuicklinks.map((item) => (
                  <li
                    key={item.id}
                    className="mx-auto md:mx-0 text-base sm:text-lg font-medium text-(--footer-text) hover:text-(--footer-text-Hover) transition-colors duration-200"
                  >
                    <Link href={item.path}>{item.page}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Products  */}
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-(--footer-text) hover:text-(--footer-text-Hover) mb-4">
                Products
              </h3>
              <ul className="space-y-2 text-center">
                {footerProducts.map((item) => (
                  <li
                    key={item.id}
                    className="mx-auto md:mx-0 text-base sm:text-lg font-medium text-(--footer-text) hover:text-(--footer-text-Hover) transition-colors duration-200"
                  >
                    <Link href={item.path}>{item.page}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Pages  */}
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-(--footer-text) hover:text-(--footer-text-Hover) mb-4">
                Legal Pages
              </h3>
              <ul className="space-y-2 text-center">
                {footerLegalPage.map((item) => (
                  <li
                    key={item.id}
                    className="mx-auto md:mx-0 text-base sm:text-lg font-medium text-(--footer-text) hover:text-(--footer-text-Hover) transition-colors duration-200"
                  >
                    <Link href={item.path}>{item.page}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-full max-w-6xl md:hidden flex flex-wrap justify-around items-start gap-5">
            <FooterLinks
              footerQuicklinks={footerQuicklinks}
              footerProducts={footerProducts}
              footerLegalPage={footerLegalPage}
            />
          </div>
        </div>

        {/* Divider */}
        <Separator className="my-6" />

        {/* Footer Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left">
          <p className="text-sm sm:text-base font-semibold text-(--footer-text) hover:text-(--footer-text-Hover)">
            © {new Date().getFullYear()} Alpha Art & Events. All rights
            reserved.
          </p>

          <div className="flex justify-center sm:justify-end gap-5">
            <Link
              href="https://www.facebook.com/"
              target="_blank"
              className="text-(--footer-text) hover:text-blue-600 transition-colors duration-300"
            >
              <FaFacebookF className="text-2xl sm:text-3xl" />
            </Link>
            <Link
              href="https://www.instagram.com/alpha_art_and_events"
              target="_blank"
              className="text-(--footer-text) hover:text-pink-600 transition-colors duration-300"
            >
              <FaInstagram className="text-2xl sm:text-3xl" />
            </Link>
            <Link
              href="https://web.whatsapp.com/"
              target="_blank"
              className="text-(--footer-text) hover:text-green-600 transition-colors duration-300"
            >
              <IoLogoWhatsapp className="text-2xl sm:text-3xl" />
            </Link>
            <Link
              href="https://x.com/"
              target="_blank"
              className="text-(--footer-text) hover:text-black transition-colors duration-300"
            >
              <BsTwitterX className="text-2xl sm:text-3xl" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
