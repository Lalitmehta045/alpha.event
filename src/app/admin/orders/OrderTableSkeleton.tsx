export default function OrderTableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b text-sm">
          {/* Order ID */}
          <td className="p-4">
            <div className="w-24 h-4 bg-gray-200 rounded" />
          </td>

          {/* Customer Details */}
          <td className="p-4">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="h-8 w-8 bg-gray-200 rounded-full" />

              <div className="space-y-1">
                <div className="w-28 h-4 bg-gray-200 rounded" />
                <div className="w-36 h-3 bg-gray-200 rounded" />
              </div>
            </div>
          </td>

          {/* Date */}
          <td className="p-4 space-y-2">
            <div className="w-24 h-4 bg-gray-200 rounded" />
            <div className="w-20 h-3 bg-gray-200 rounded" />
          </td>

          {/* Total Items */}
          <td className="p-4">
            <div className="w-6 h-4 bg-gray-200 rounded" />
          </td>

          {/* Total Price */}
          <td className="p-4">
            <div className="w-16 h-4 bg-gray-200 rounded" />
          </td>

          {/* Status Badge */}
          <td className="p-4">
            <div className="w-20 h-6 bg-gray-200 rounded-full" />
          </td>

          {/* Actions */}
          <td className="p-4 text-right">
            <div className="h-8 w-8 bg-gray-200 rounded" />
          </td>
        </tr>
      ))}
    </>
  );
}
