"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import LayoutV2 from "../../layout/layoutV2";

export default function OrderSuccessPage() {
  const router = useRouter();

  // ⭐ 1. Get the real data from Redux
  // We rename 'COD' to 'order' so we don't have to change the JSX below
  const order = useSelector((state: RootState) => state.order.COD);

  // console.log("Redux Order Data: ", order);

  // ⭐ 2. (Optional) Redirect if no order exists (prevent manual access to this page)
  // You can keep your "No recent order found" UI, or redirect.
  // useEffect(() => {
  //   if (!order) {
  //     router.push("/");
  //   }
  // }, [order, router]);

  // ⭐ 3. Use the 'order' variable from Redux in your check
  if (!order) {
    return (
      <div className="relative flex flex-col gap-10 w-full mx-auto h-min items-center font-sans bg-gray-50 text-gray-800 min-h-screen">
        <LayoutV2>
          <main className="w-11/12 mx-auto px-4 md:px-6 mt-20 md:mt-28 py-10 flex flex-col gap-10">
            <div className="flex flex-col items-center justify-center h-[70vh] bg-white p-8 rounded-xl shadow-lg">
              <p className="text-xl font-semibold">No recent order found.</p>
              <Button
                className="mt-6 bg-red-500 hover:bg-red-600 transition-colors"
                onClick={() => router.push("/")}
              >
                Go Home
              </Button>
            </div>
          </main>
        </LayoutV2>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-10 w-full mx-auto h-min items-center font-sans bg-gray-200 min-h-screen">
      <LayoutV2>
        <main className="w-11/12 mx-auto px-4 md:px-6 mt-16 sm:mt-20 md:mt-28 py-10 flex flex-col gap-10">
          <div className="flex flex-col items-center text-center p-6 sm:p-8 bg-white rounded-3xl border border-green-500/40 shadow-xl shadow-green-300/50 max-w-4xl mx-auto w-full">
            <CheckCircle className="w-20 h-20 sm:w-24 sm:h-24 text-green-500 drop-shadow-lg animate-pulse" />

            <h1 className="text-4xl sm:text-5xl font-extrabold mt-4 sm:mt-6 text-transparent bg-clip-text bg-linear-to-r from-green-600 to-emerald-700">
              Order Placed Successfully!
            </h1>

            <p className="text-gray-600 mt-2 sm:mt-4 text-base sm:text-lg max-w-lg">
              Thank you for your purchase! Your order{" "}
              <b className="text-green-600 tracking-wide">{order.orderId}</b> is
              confirmed.
            </p>

            <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl mt-8 sm:mt-10 w-full max-w-lg shadow-xl border border-gray-700/50 transform hover:scale-[1.01] transition-transform duration-300 text-white">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-green-400 border-b border-gray-700 pb-2">
                Order Summary
              </h2>

              <div className="text-left space-y-3">
                {/* Container for the bottom section */}
                <div className="flex flex-col gap-4">
                  {/* 1. Product List Section */}
                  <div className="flex flex-col gap-2">
                    {order.products?.map((prod: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm text-gray-300"
                      >
                        {/* Product Name */}
                        <span>{prod.name}</span>

                        {/* Quantity */}
                        <span className="text-gray-500 font-medium">
                          x{prod.qty}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 2. Payment Status Section (Separated for better UI) */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-700/50">
                    <span className="text-sm text-gray-400">
                      Payment Status:
                    </span>
                    <span className="text-green-400 font-bold uppercase bg-green-900/20 px-2 py-1 rounded text-base tracking-wide">
                      {order.payment_status || "COD"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4  border-t border-gray-700 flex justify-between items-center text-lg sm:text-xl font-bold">
                  <span>Total Amount:</span>
                  {/* Ensure totalAmt exists before rendering */}
                  <span className="text-green-400">₹{order.totalAmt || 0}</span>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>Order Status:</span>
                  <span className="text-green-400 font-medium uppercase">
                    {order.order_status || "Processing"}
                  </span>
                </div>
              </div>
            </div>

            <Button
              className="mt-8 sm:mt-10 text-base sm:text-lg font-semibold px-8 sm:px-10 py-4 sm:py-7 w-full max-w-xs sm:max-w-none bg-linear-to-r from-teal-500 to-green-600 hover:from-teal-600 hover:to-green-700 rounded-full shadow-lg shadow-teal-700/40 transform hover:scale-105 transition-all duration-300"
              onClick={() => router.push("/purchase-history")}
            >
              View My Orders
            </Button>
          </div>
        </main>
      </LayoutV2>
    </div>
  );
}
