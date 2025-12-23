// import React from "react";
// import { FaInstagram, FaFacebookF, FaTwitter } from "react-icons/fa";
// import { IoLogoWhatsapp } from "react-icons/io";

// export const footerSocialLinks = [
//   {
//     id: 1,
//     icon: React.createElement(FaFacebookF, {
//       className: "text-xl sm:text-2xl",
//     }),
//     url: "https://facebook.com",
//   },
//   {
//     id: 2,
//     icon: React.createElement(FaInstagram, {
//       className: "text-xl sm:text-2xl",
//     }),
//     url: "https://instagram.com",
//   },
//   {
//     id: 3,
//     icon: React.createElement(IoLogoWhatsapp, {
//       className: "text-xl sm:text-2xl",
//     }),
//     url: "https://wa.me/yourwhatsapplink",
//   },
//   {
//     id: 4,
//     icon: React.createElement(FaTwitter, { className: "text-xl sm:text-2xl" }),
//     url: "https://twitter.com",
//   },
// ];

// footerSocialLinks.ts
import { IconType } from "react-icons";
import { FaInstagram, FaFacebookF } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { BsTwitterX } from "react-icons/bs";

interface SocialLink {
  id: number;
  Icon: IconType;
  url: string;
}

export const footerSocialLinks: SocialLink[] = [
  { id: 1, Icon: FaFacebookF, url: "https://facebook.com" },
  { id: 2, Icon: FaInstagram, url: "https://instagram.com" },
  { id: 3, Icon: IoLogoWhatsapp, url: "https://wa.me/yourwhatsapplink" },
  { id: 4, Icon: BsTwitterX, url: "https://twitter.com" },
];
