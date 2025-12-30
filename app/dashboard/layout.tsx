import { Sidebar, MobileHeader } from "@/components/dashboard/Sidebar";
import { auth } from "@/auth";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  // Guest layout - simplified without sidebar
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:16px_16px]">
        {/* Simple header for guests */}
        <header className="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-50">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-md flex items-center justify-center border-2 border-zinc-900">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.36.21-.78.21-1.14 0l-7.9-4.44A.991.991 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.36-.21.78-.21 1.14 0l7.9 4.44c.32.17.53.5.53.88v9z" />
              </svg>
            </div>
            <span className="text-xl font-black text-zinc-900 tracking-tight">ExamSim</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-bold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col overflow-y-auto">
          <div className="relative flex-1 flex flex-col">
            {/* Ambient glow */}
            <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-accent-purple/5 blur-[150px] rounded-full pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 px-4 py-6 md:px-8 flex-1 flex flex-col">
              {children}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Authenticated layout with sidebar
  return (
    <div className="min-h-screen flex flex-col md:block bg-zinc-50 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:16px_16px]">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64 h-screen overflow-hidden">
        <MobileHeader />
        <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="relative flex-1 flex flex-col">
            {/* Ambient glow */}
            <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-accent-purple/5 blur-[150px] rounded-full pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 px-4 py-6 md:px-8 flex-1 flex flex-col">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

