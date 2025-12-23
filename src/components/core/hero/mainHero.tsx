"use client";

import ContainerV1 from "@/app/(public)/layout/containerV1";
import SearchBar from "@/components/common/searchBar/searchBar";
import CategoryV1 from "@/components/core/category/categoryV1";

const MainHero = () => {
  return (
    <section className="bg-(--mainBg) w-full min-h-screen pt-24 sm:pt-40 md:pt-32 lg:pt-32 flex flex-col items-center justify-center text-center text-white px-0 sm:px-6 md:px-10 lg:px-20">
      {/* Hero Content */}
      <ContainerV1>
        <SearchBar />
        <CategoryV1 />
      </ContainerV1>
    </section>
  );
};

export default MainHero;
