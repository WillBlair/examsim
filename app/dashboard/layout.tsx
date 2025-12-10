import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-zinc-50 bg-[linear-gradient(to_right,#80808040_1px,transparent_1px),linear-gradient(to_bottom,#80808040_1px,transparent_1px)] bg-[size:16px_16px]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto h-screen custom-scrollbar ml-64">
        <div className="relative min-h-full">
          {/* Ambient glow */}
          <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-accent-purple/5 blur-[150px] rounded-full pointer-events-none" />
          
          {/* Content */}
          <div className="relative z-10 px-8 py-6 max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
