"use client";
import { Badge } from "@/components/ui/badge";

export function OrderStatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    Processing: "bg-amber-200 text-black font-bold",
    Request: "bg-gray-300 text-black font-bold",
    Accepted: "bg-green-300 text-black font-bold",
    Cancelled: "bg-red-300 text-black font-bold",
  };

  return <Badge className={variants[status] || ""}>{status}</Badge>;
}
