"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IoClose } from "react-icons/io5";

interface AddFieldComponentProps {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const AddFieldComponent: React.FC<AddFieldComponentProps> = ({
  open,
  onClose,
  value,
  onChange,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm sm:max-w-md p-6">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>Add Field</DialogTitle>
          {/* <DialogClose asChild>
            <button className="text-gray-600 hover:text-gray-900">
              <IoClose size={25} />
            </button>
          </DialogClose> */}
        </DialogHeader>

        <div className="mt-2">
          <input
            type="text"
            placeholder="Enter field name"
            value={value}
            onChange={onChange}
            className="w-full p-2 border bg-blue-50 rounded outline-none focus-within:border-primary-100"
          />
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={onSubmit} className="w-full">
            Add Field
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFieldComponent;
