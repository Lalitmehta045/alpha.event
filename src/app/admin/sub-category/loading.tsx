import { TableRow, TableCell } from "@/components/ui/table";

export default function SubCategoryTableSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i} className="animate-pulse">
          <TableCell className="px-6 text-center">
            <div className="h-8 w-8 bg-gray-200 rounded" />
          </TableCell>

          <TableCell>
            <div className="h-8 w-32 bg-gray-200 rounded" />
          </TableCell>

          <TableCell>
            <div className="h-8 w-24 bg-gray-200 rounded" />
          </TableCell>

          <TableCell>
            <div className="h-8 w-24 bg-gray-200 rounded" />
          </TableCell>

          <TableCell>
            <div className="h-8 w-28 bg-gray-200 rounded" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
