"use client";

import { DataType } from "@/@types/type";

export default function ContainerV1({ children }: DataType) {
  return (
    <section className="w-11/12 py-6 flex flex-col items-center justify-center gap-2 sm:gap-4 md:gap-8 lg:gap-6 z-10">
      {children}
    </section>
  );
}
