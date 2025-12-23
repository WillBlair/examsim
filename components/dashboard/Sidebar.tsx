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
      { name: "My Exams", href: "/dashboard/exams", icon: "Clock" },
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
    <div className="flex flex-col h-full bg-white relative">
      {/* Noise Texture */}
      <div className="absolute inset-0 bg-noise opacity-40 pointer-events-none" />

      {/* Logo */}
      <div className="h-16 flex items-center px-6 relative z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-brand-orange border border-zinc-900 rounded-sm flex items-center justify-center group-hover:bg-emerald-600 transition-all duration-300 shadow-neo-sm">
            <AppIcon name="Cube" className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-zinc-900 tracking-tight">ExamSim</span>
        </Link>
      </div>

      {/* Search/Command Shortcut (reduced icon weight) */}
      <div className="px-4 mb-4 relative z-10">
        <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-900 bg-white border-2 border-zinc-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all focus:outline-none">
          <span className="flex-1 text-left font-bold">Search</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-black bg-zinc-100 border border-zinc-200 text-zinc-900 rounded-sm">⌘K</kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-4 relative z-10 overflow-y-auto custom-scrollbar">
        <div className="space-y-5">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && (
                <p className="px-3 mb-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 border-2",
                        isActive
                          ? "bg-zinc-900 text-white border-zinc-900 shadow-neo-sm"
                          : "text-zinc-600 border-transparent hover:border-zinc-900 hover:bg-white hover:shadow-neo-sm"
                      )}
                    >
                      <AppIcon
                        name={item.icon}
                        className={cn(
                          "w-[18px] h-[18px] shrink-0 transition-colors",
                          isActive ? "text-brand-orange" : "text-zinc-400 group-hover:text-zinc-900"
                        )}
                      />
                      <span className="text-[13px] font-medium tracking-tight">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-200/50 relative z-10">
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-zinc-500 hover:text-red-600 hover:bg-red-50/50 transition-all group"
        >
          <AppIcon name="LogOut" className="w-[18px] h-[18px] shrink-0 group-hover:text-red-500 transition-colors" />
          <span className="text-[13px] font-medium tracking-tight">Sign Out</span>
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
