"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-full text-left border rounded-md px-2.5 py-1.5 flex items-center gap-2",
            "focus:outline-none"
          )}
        >
          <CalendarIcon
            className="text-muted-foreground"
            width={18}
            height={18}
          />
          {value ? (
            <span>{format(value, "dd MMM yyyy")}</span>
          ) : (
            <span className="text-muted-foreground">
              {placeholder || "Select date"}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
