import { DataType } from "@/@types/type";
import FooterV1 from "@/components/common/footer/footerV1";
import HeaderV1 from "@/components/common/header/headerV1";

const LayoutV1 = ({ children }: DataType) => {
  return (
    <>
      <HeaderV1 />
      {children}
      <FooterV1 />
    </>
  );
};

export default LayoutV1;
