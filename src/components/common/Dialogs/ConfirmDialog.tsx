"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void; // optional now
  title?: string;
  description?: string;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title = "Permanent Delete",
  description = "Are you sure you want to permanently delete?",
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-76 md:max-w-md p-4 md:p-8 bg-white text-white shadow-2xl border border-neutral-700 rounded-xl">
        <AlertDialogHeader className="mb-0">
          <AlertDialogTitle className="text-3xl font-bold text-red-400 border-b border-neutral-700 pb-3 mb-2">
            {title}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <p className="my-0 text-base font-medium text-neutral-800 leading-relaxed">
          {description}
        </p>
        <AlertDialogFooter className="w-full mt-8 flex flex-row items-center justify-between gap-4 sm:gap-6">
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.();
              onOpenChange(false);
            }}
            className="flex cursor-pointer sm:flex-none border border-red-600 text-red-400 hover:bg-red-600 hover:text-white transition-all duration-300 py-3 px-6 rounded-lg text-base font-semibold"
          >
            Cancel
          </Button>

          <Button
            variant="default"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="flex cursor-pointer sm:flex-none bg-linear-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-300 py-3 px-6 rounded-lg text-base font-semibold shadow-md hover:shadow-lg"
          >
            Confirm
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteDialog;
