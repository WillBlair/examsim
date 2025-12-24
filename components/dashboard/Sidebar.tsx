"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/auth";
import { AppIcon } from "@/components/ui/icon";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navSections = [
  {
    title: null,
    items: [
      { name: "Dashboard", href: "/dashboard", icon: "Home" },
      { name: "Create New Exam", href: "/dashboard/new", icon: "PlusCircle" },
      { name: "Create Flashcards", href: "/dashboard/flashcards/new", icon: "MediaImageList" },
      { name: "My Exams", href: "/dashboard/exams", icon: "Clock" },
      { name: "My Flashcards", href: "/dashboard/flashcards", icon: "ViewGrid" },
      { name: "Library", href: "/dashboard/library", icon: "Book" },
    ]
  },
  {
    title: "Practice",
    items: [
      { name: "Quick Practice", href: "/dashboard/practice", icon: "Flash" },
      { name: "Study Goals", href: "/dashboard/goals", icon: "Star" },
    ]
  },
  {
    title: "Insights",
    items: [
      { name: "Analytics", href: "/dashboard/analytics", icon: "GraphUp" },
      { name: "Achievements", href: "/dashboard/achievements", icon: "Trophy" },
    ]
  },
  {
    title: "Account",
    items: [
      { name: "Settings", href: "/dashboard/settings", icon: "Settings" },
    ]
  }
];

function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white relative">
      {/* Subtle pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_0)] [background-size:24px_24px] pointer-events-none" />

      {/* Logo */}
      <div className="h-[72px] flex items-center px-5 relative z-10 border-b border-zinc-200/80">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-md flex items-center justify-center group-hover:from-emerald-400 group-hover:to-teal-500 transition-all duration-300 shadow-lg shadow-emerald-500/25 border-2 border-zinc-900">
            <AppIcon name="Cube" className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-zinc-900 tracking-tight leading-none">ExamSim</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Study Smarter</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 px-3 relative z-10 overflow-y-auto custom-scrollbar">
        <div className="space-y-5">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && (
                <div className="flex items-center gap-2 px-3 mb-2">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    {section.title}
                  </p>
                  <div className="flex-1 h-px bg-zinc-200/80" />
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                        isActive
                          ? "bg-indigo-50 text-zinc-900 border-2 border-zinc-900 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)]"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 border-2 border-transparent"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-md flex items-center justify-center transition-all shrink-0",
                        isActive
                          ? "bg-indigo-500 text-white shadow-sm"
                          : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-700"
                      )}>
                        <AppIcon
                          name={item.icon}
                          className="w-4 h-4"
                        />
                      </div>
                      <span className={cn(
                        "text-[13px] tracking-tight",
                        isActive ? "font-black" : "font-semibold"
                      )}>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-200/80 relative z-10">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-all group border-2 border-transparent hover:border-red-200"
        >
          <div className="w-8 h-8 rounded-md bg-zinc-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
            <AppIcon name="LogOut" className="w-4 h-4 group-hover:text-red-500 transition-colors" />
          </div>
          <span className="text-[13px] font-semibold">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex h-screen w-64 flex-col fixed inset-y-0 left-0 z-[100] shrink-0 border-r-[3px] border-zinc-900 bg-white overflow-hidden">
      <SidebarContent />
    </aside>
  );
}

export function MobileHeader() {
  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 bg-white sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-orange border border-zinc-900 rounded-sm flex items-center justify-center shadow-neo-sm">
          <AppIcon name="Cube" className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-zinc-900 tracking-tight">ExamSim</span>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <button className="p-2 border border-zinc-200 rounded-sm hover:bg-zinc-50">
            <AppIcon name="Menu" className="w-6 h-6 text-zinc-600" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 border-r border-zinc-900">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </div>
  )
}
