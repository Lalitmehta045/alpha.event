import { TableCell, TableRow } from "@/components/ui/table";

export function TableBodySkeleton({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 10 }).map((_, rowIndex) => (
        <TableRow key={rowIndex} className="animate-pulse">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <TableCell key={colIndex}>
              <div className="h-6 w-full bg-gray-200 rounded" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
