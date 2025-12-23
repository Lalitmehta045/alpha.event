"use client";

import ContactV2 from "@/components/core/contact/contactV2";
import LayoutV2 from "../layout/layoutV2";

const ContactPage = () => {
  return (
    <div className="relative flex flex-col gap-10 w-full mx-auto h-min items-center font-sans bg-(--mainBg1)">
      <LayoutV2>
        <ContactV2 />
      </LayoutV2>
    </div>
  );
};

export default ContactPage;
