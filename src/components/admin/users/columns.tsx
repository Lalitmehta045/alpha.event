import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { USERS } from "@/@types/user";

export const columns: ColumnDef<USERS>[] = [
  {
    accessorKey: "index",
    header: "S/No.",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "_id",
    header: "User ID",
    cell: ({ row }) => {
      const id = row.getValue("_id") as string;
      const shortId = `${id.slice(0, 6)}...${id.slice(-4)}`;
      return (
        <span className="text-xs text-indigo-500 underline cursor-pointer">
          #{shortId}
        </span>
      );
    },
  },
  // ✅ FIXED NAME COLUMN (fname + lname)
  {
    header: "Name",
    cell: ({ row }) => {
      const fname = row.original.fname || "";
      const lname = row.original.lname || "";
      return <span>{fname + " " + lname}</span>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Mobile",
  },
  {
    accessorKey: "createdAt",
    header: "Registerd Date",
    cell: ({ row }) => {
      const date: any = row.getValue("createdAt");
      return (
        <span className="text-sm text-gray-700">
          {new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Update Date",
    cell: ({ row }) => {
      const date: any = row.getValue("updatedAt");
      return (
        <span className="text-sm text-gray-700">
          {new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            // hour: "2-digit",
            // minute: "2-digit",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      return (
        <Badge
          className={
            status === "Active"
              ? "bg-green-200 text-green-900"
              : "bg-red-200 text-red-900"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge
          className={
            role === "ADMIN"
              ? "bg-blue-200 text-blue-900"
              : "bg-gray-200 text-gray-900"
          }
        >
          {role}
        </Badge>
      );
    },
  },
  // 👉 ACTIONS COLUMN (WORKING)
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }: any) => {
      const user = row.original;

      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.options.meta?.onView?.(user)}
        >
          <Eye className="w-4 h-4 mr-1" /> View
        </Button>
      );
    },
  },
];
