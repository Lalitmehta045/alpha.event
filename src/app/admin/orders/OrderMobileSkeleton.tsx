export default function OrderMobileSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="border p-4 rounded-lg shadow-sm bg-white animate-pulse"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-3 border-b pb-2">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
          </div>

          {/* Customer + Email */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-40 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Items */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-28 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Price & Date */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t">
            <div className="space-y-1">
              <div className="h-3 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>

            <div className="space-y-1 text-right">
              <div className="h-3 w-16 bg-gray-200 rounded ml-auto" />
              <div className="h-5 w-24 bg-gray-200 rounded ml-auto" />
            </div>
          </div>

          {/* Button */}
          <div className="mt-3">
            <div className="h-9 w-full bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </>
  );
}
