"use client";
import { DataType } from "@/@types/type";
import FooterV2 from "@/components/common/footer/footerV2";
import HeaderV2 from "@/components/common/header/headerV2";
// import { Separator } from "@/components/ui/separator";

const LayoutV2 = ({ children }: DataType) => {
  return (
    <>
      <HeaderV2 />
      {children}
      <FooterV2 />
    </>
  );
};

export default LayoutV2;
