"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Product } from "@/@types/product";

const COLORS = [
  "#4f46e5", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#0ea5e9", // Sky
  "#ec4899", // Pink
];

interface OverviewChartsProps {
  products: Product[];
  orders?: any[]; // optional to prevent crashes if undefined
}

export default function OverviewCharts({ products, orders = [] }: OverviewChartsProps) {
  // Compute products by category
  const categoryData = useMemo(() => {
    if (!products || products.length === 0) return [];

    const counts: Record<string, number> = {};

    products.forEach((product) => {
      if (product.category && product.category.length > 0) {
        product.category.forEach((cat: any) => {
          const catName = cat.name || "Unknown";
          counts[catName] = (counts[catName] || 0) + 1;
        });
      } else {
        counts["Uncategorized"] = (counts["Uncategorized"] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by highest
  }, [products]);

  // Compute real monthly trend data from orders
  const monthlyTrendData = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    const monthlyStats: Record<string, { orders: number, revenue: number, dateObj: Date }> = {};

    orders.forEach((order) => {
      if (order.createdAt) {
        const date = new Date(order.createdAt);
        // Format as "MMM yy" (e.g., "Jan 24")
        const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        
        if (!monthlyStats[monthYear]) {
          monthlyStats[monthYear] = { orders: 0, revenue: 0, dateObj: date };
        }
        
        monthlyStats[monthYear].orders += 1;
        monthlyStats[monthYear].revenue += order.totalAmt || 0;
      }
    });

    // Convert to array and sort chronologically
    return Object.entries(monthlyStats)
      .map(([name, data]) => ({
        name,
        orders: data.orders,
        revenue: data.revenue,
        dateObj: data.dateObj
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [orders]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Bar Chart - Orders Trend */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Monthly Performance</h3>
        <div className="h-72 w-full">
          {monthlyTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyTrendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "#f3f4f6" }}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
                <Bar dataKey="orders" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-400 text-sm flex h-full flex-col items-center justify-center">
              <p>No order data available for trends</p>
            </div>
          )}
        </div>
      </div>

      {/* Pie Chart - Products by Category */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Products by Category</h3>
        <div className="h-72 w-full flex items-center justify-center">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-400 text-sm flex flex-col items-center">
              <p>No product data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
