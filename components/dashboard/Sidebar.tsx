"use client";

import Link from "next/link";
import Image from "next/image";
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
          <div className="w-8 h-8 border border-zinc-900 rounded-sm overflow-hidden group-hover:scale-105 transition-all duration-300 shadow-neo-sm">
            <Image src="/images/examsimlogogreen-removebg-preview.png" alt="ExamSim Logo" width={32} height={32} className="w-full h-full object-cover" />
          </div>
          <span className="text-lg font-bold text-zinc-900 tracking-tight">ExamSim</span>
        </Link>
      </div>

      {/* Search/Command Shortcut (reduced icon weight) */}
      <div className="px-4 mb-2 relative z-10">
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 bg-white border-2 border-zinc-200 rounded-sm hover:border-zinc-900 hover:shadow-neo-sm transition-all focus:outline-none focus:ring-0">
          <span className="flex-1 text-left font-medium">Search</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-sm">⌘K</kbd>
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
                        "group flex items-center gap-3 px-3 py-2 rounded-sm transition-all duration-200 border border-transparent",
                        isActive
                          ? "bg-accent-purple/10 text-accent-purple shadow-neo-purple border-accent-purple"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 hover:border-zinc-200"
                      )}
                    >
                      <AppIcon
                        name={item.icon}
                        className={cn(
                          "w-[18px] h-[18px] shrink-0 transition-colors",
                          isActive ? "text-accent-purple" : "text-zinc-400 group-hover:text-zinc-600"
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
    <aside className="hidden md:flex h-screen w-64 flex-col fixed inset-y-0 left-0 z-[100] shrink-0 border-r-[0.5px] border-zinc-900 shadow-neo-lg bg-white overflow-hidden">
      <SidebarContent />
    </aside>
  );
}

export function MobileHeader() {
  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 bg-white sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 border border-zinc-900 rounded-sm overflow-hidden shadow-neo-sm">
          <Image src="/images/examsimlogogreen-removebg-preview.png" alt="ExamSim Logo" width={32} height={32} className="w-full h-full object-cover" />
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
