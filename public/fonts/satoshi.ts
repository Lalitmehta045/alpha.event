import localFont from "next/font/local";

export const satoshi = localFont({
  src: [
    {
      path: "./satoshi-fonts/Satoshi-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./satoshi-fonts/Satoshi-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./satoshi-fonts/Satoshi-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./satoshi-fonts/Satoshi-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./satoshi-fonts/Satoshi-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap", // ensures fast font loading
});
