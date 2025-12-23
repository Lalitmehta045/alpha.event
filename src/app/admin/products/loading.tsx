import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProductsLoading() {
  return (
    <>
      <div className="space-y-3 flex flex-wrap gap-4 justify-between items-center">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card
            key={i}
            className="relative w-full max-w-42 sm:max-w-56 md:max-w-60 lg:max-w-80 mx-auto h-66 md:h-72 lg:h-78 p-3 gap-0 sm:gap-1 rounded-xl border border-gray-200 animate-pulse"
          >
            {/* Product Image Skeleton */}
            <div className="w-full h-30 md:h-34 lg:h-38 bg-gray-200 rounded-xl" />

            <CardHeader className="px-0 mt-2">
              {/* Title */}
              <div className="w-3/4 h-4 bg-gray-200 rounded" />
            </CardHeader>

            <CardContent className="px-0">
              {/* Price Section */}
              <div className="flex items-center gap-3 mt-1">
                <div className="w-16 h-4 bg-gray-200 rounded" />
                <div className="w-20 h-4 bg-gray-300 rounded" />
              </div>

              {/* Description */}
              <div className="mt-3 space-y-2">
                <div className="w-full h-3 bg-gray-200 rounded" />
                <div className="w-5/6 h-3 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
