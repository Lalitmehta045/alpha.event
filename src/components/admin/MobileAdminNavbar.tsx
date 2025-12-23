"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import AdminSidebar from "./AdminSidebar";
import { useState } from "react";

export default function MobileAdminNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b sticky top-0 z-50">
      <div className="font-semibold text-xl">Admin Panel</div>
      {/* <div className="font-semibold text-xl">Alpha Art & Events</div> */}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu size={20} />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="p-0 w-64">
          {/* Add SheetHeader and SheetTitle for accessibility */}
          <SheetHeader className="p-4">
            <SheetTitle></SheetTitle>
          </SheetHeader>

          <AdminSidebar onLinkClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
