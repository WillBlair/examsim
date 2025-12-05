import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-zinc-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto h-screen">
        {/* 
          Added h-full and flex/flex-col to ensure the child page can expand 
          to fill the vertical space 
        */}
        <div className="container mx-auto px-8 py-8 max-w-6xl h-full flex flex-col relative">
          {children}
        </div>
      </main>
    </div>
  );
}
