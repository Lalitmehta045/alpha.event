"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface CheckoutDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onSelectDate: (date: Date | undefined) => void;
  onConfirm: (date: Date) => void;
}

export default function CheckoutDateDialog({
  open,
  onOpenChange,
  selectedDate,
  onSelectDate,
  onConfirm,
}: CheckoutDateDialogProps) {
  const [tempDate, setTempDate] = useState<Date | undefined>(selectedDate);

  useEffect(() => {
    if (open) {
      setTempDate(selectedDate);
    }
  }, [open, selectedDate]);

  const formattedTempDate = useMemo(() => {
    if (!tempDate) return null;
    return tempDate.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [tempDate]);

  const handleConfirm = () => {
    if (!tempDate) return;
    onSelectDate(tempDate);
    onConfirm(tempDate);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTempDate(selectedDate); // Reset temp date when closing
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Select Delivery Date
          </DialogTitle>
          <DialogDescription>
            Choose your preferred delivery date for this order.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            {formattedTempDate ? (
              <>
                Selected date:{" "}
                <span className="font-semibold text-gray-900">
                  {formattedTempDate}
                </span>
              </>
            ) : (
              "Please pick a delivery date to continue."
            )}
          </div>
          <Calendar
            mode="single"
            selected={tempDate}
            onSelect={setTempDate}
            disabled={(date) => {
              // Disable dates before today
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today;
            }}
            className="rounded-md border"
          />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!tempDate}
            >
              Confirm Date
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
