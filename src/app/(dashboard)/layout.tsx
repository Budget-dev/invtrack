import { SidebarNav } from "@/components/layout/sidebar-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      <SidebarNav />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1320px] mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
