import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import MobileAdminNavbar from "@/components/admin/MobileAdminNavbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const session = await getServerSession(authOptions);

  // if (!session || (session.user as any)?.role !== "ADMIN") redirect("/account");

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gray-100">
      {/* Mobile Navbar */}
      <MobileAdminNavbar />

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r bg-white">
        <AdminSidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-2 md:p-4 overflow-y-auto h-[calc(100vh-20px)]">
        {children}
      </main>
    </div>
  );
}
