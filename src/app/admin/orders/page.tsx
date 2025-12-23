"use client";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrdersTable } from "@/components/admin/orders/orders-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DatePicker } from "@/components/ui/date-picker";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { setAllOrders } from "@/redux/slices/orderSlice";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { getAdminOrders } from "@/services/operations/orders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Helper map to define the display text and its corresponding backend status value
const ORDER_STATUS_MAP: Record<string, string> = {
  all: "",
  processing: "Processing", // Corresponds to backend value
  request: "Request",
  accepted: "Accepted",
  cancelled: "Cancelled",
};

// Map used to iterate over statuses for both Tabs and Select
const STATUS_OPTIONS: { value: string; label: string; tabClassName: string }[] =
  [
    {
      value: "all",
      label: "All",
      tabClassName:
        "data-[state=active]:bg-white data-[state=active]:text-indigo-600",
    },
    {
      value: "processing",
      label: "Processing",
      tabClassName:
        "data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800",
    },
    {
      value: "request",
      label: "Request",
      tabClassName:
        "data-[state=active]:bg-gray-200 data-[state=active]:text-gray-800",
    },
    {
      value: "accepted",
      label: "Accepted",
      tabClassName:
        "data-[state=active]:bg-green-100 data-[state=active]:text-green-800",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      tabClassName:
        "data-[state=active]:bg-red-100 data-[state=active]:text-red-800",
    },
  ];

export default function OrdersPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const { allOrders, loading } = useSelector((state: RootState) => state.order);

  // --- Local State for Filtering & Pagination ---
  const [currentTab, setCurrentTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const limit = 10; // Number of items per page
  // ---------------------------------------------

  console.log("order token: ", token);

  // Function to fetch data from the API
  const fetchOrders = async () => {
    if (!token) {
      toast.error("Unauthorized");
      router.push("/auth/sign-in");
      return;
    }

    const status = ORDER_STATUS_MAP[currentTab];

    const formattedStartDate = startDate
      ? format(startDate, "yyyy-MM-dd")
      : undefined;
    const formattedEndDate = endDate
      ? format(endDate, "yyyy-MM-dd")
      : undefined;

    const params = {
      page: page,
      limit: limit,
      status: status,
      search: searchTerm,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    };

    const response = await getAdminOrders(token, params);

    if (response) {
      dispatch(setAllOrders(response.data));
      setTotalPages(response.totalPages);
    } else {
      dispatch(setAllOrders([]));
      setTotalPages(1);
    }
  };

  // 1. On FIRST LOAD → clear and fetch
  useEffect(() => {
    dispatch(setAllOrders([]));
    fetchOrders();
  }, []);

  // 2. When filters change → reset to page 1
  useEffect(() => {
    setPage(1);
  }, [currentTab, searchTerm, startDate, endDate]);

  // 3. When page OR filter changes → fetch orders
  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [page, currentTab, searchTerm, startDate, endDate, token]);

  // Helper for pagination controls
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="space-y-6 p-1.5 min-h-screen">
      {/* Title + Breadcrumb */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/admin"
                className="text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbLink
                href="/admin/orders"
                className="text-gray-700 font-medium"
              >
                Orders
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Tabs for Status Filtering */}
      <div>
        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={(value) => {
            setCurrentTab(value);
          }}
        >
          <div className="flex flex-col md:flex-row md:items-start gap-4 mb-2">
            {/* 1. Mobile Select Bar (Visible below 'sm' breakpoint) */}
            <div className="w-max ml-auto sm:hidden">
              <Select value={currentTab} onValueChange={setCurrentTab}>
                <SelectTrigger className="w-full h-10 bg-gray-100 border-gray-300">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={`px-4 py-2 text-sm font-semibold rounded-md ${option.tabClassName} data-[state=active]:shadow-sm transition-all text-gray-700 hover:text-indigo-600`}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Desktop Tabs List (Hidden below 'sm' breakpoint) */}
            <TabsList className="hidden sm:flex flex-wrap h-auto p-1 bg-gray-200 rounded-lg shadow-inner w-full md:w-auto">
              {STATUS_OPTIONS.map((option) => (
                <TabsTrigger
                  key={option.value}
                  value={option.value}
                  className={`px-4 py-2 text-sm font-semibold rounded-md ${option.tabClassName} data-[state=active]:shadow-sm transition-all text-gray-700 hover:text-indigo-600`}
                >
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 items-end border-t pt-4">
            {/* Start Date */}
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                From Date
              </label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Start date"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                To Date
              </label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="End date"
              />
            </div>

            {/* Search Input */}
            <div className="relative col-span-1 space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Search
              </label>
              <Search className="absolute left-3 top-[38px] sm:top-[36.5px] -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by Order ID, Customer name, or Email..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table Content */}
          <div className="mt-2">
            <OrdersTable
              orders={allOrders || []}
              loading={loading}
              currentPage={page}
              totalPages={totalPages}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />
          </div>
        </Tabs>
      </div>
    </div>
  );
}
