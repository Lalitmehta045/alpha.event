"use client";

import React from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { IoClose } from "react-icons/io5";

interface ViewImageProps {
  url: string;
  open: boolean;
  onClose: () => void;
}

const ViewImage: React.FC<ViewImageProps> = ({ url, open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg max-h-[80vh] p-0 bg-white ">
        <div className="relative w-full h-full flex flex-col">
          {/* Close Button */}
          <DialogClose asChild>
            <button className="absolute top-2 right-2 p-1 text-gray-600 hover:text-gray-900 z-10">
              <IoClose size={25} />
            </button>
          </DialogClose>

          {/* Image */}
          <img
            src={url}
            alt="Full screen"
            className="w-full h-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewImage;
