import { TableRow, TableCell } from "@/components/ui/table";

export default function CategoryTableSkeleton() {
  // Number of skeleton rows to show

  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i} className="animate-pulse">
          <TableCell>
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
