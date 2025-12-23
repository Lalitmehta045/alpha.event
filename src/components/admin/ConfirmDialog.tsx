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
      <AlertDialogContent className="max-w-11/12 md:max-w-md p-5">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
        </AlertDialogHeader>
        <p className="my-2 text-sm text-gray-700">{description}</p>
        <AlertDialogFooter className="flex flex-row justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.();
              onOpenChange(false);
            }}
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            Cancel
          </Button>

          <Button
            variant="default"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="text-black bg-green-600 hover:text-white"
          >
            Confirm
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteDialog;
