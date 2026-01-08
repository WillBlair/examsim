"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
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
          <Image
            src="/images/examsimlogogreen-compressed.webp"
            alt="ExamSim Logo"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-xl font-black text-zinc-900 tracking-tight leading-none">ExamSim</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Study Smarter</span>
          </div>
        </Link>
      </div>

      {/* Upgrade CTA - Glowing */}
      <div className="px-3 pt-4 relative z-10">
        <Link
          href="/pricing"
          className="group relative block w-full overflow-hidden rounded-xl p-[2px] transition-all duration-300 hover:scale-[1.02]"
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 animate-gradient-x opacity-90 group-hover:opacity-100" />

          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />

          {/* Content */}
          <div className="relative flex items-center justify-between gap-2 rounded-[10px] bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-300 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <svg className="w-4 h-4 text-zinc-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">Unlock Pro</p>
                <p className="text-[10px] text-purple-200 font-semibold">Unlimited exams ✨</p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 relative z-10 overflow-y-auto custom-scrollbar">
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
                          ? "bg-indigo-50 text-indigo-700 shadow-sm font-semibold"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-md flex items-center justify-center transition-all shrink-0",
                        isActive
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-transparent text-zinc-400 group-hover:text-zinc-600"
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
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-all group"
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
    <aside className="hidden md:flex h-screen w-64 flex-col fixed inset-y-0 left-0 z-[100] shrink-0 border-r border-zinc-200 bg-white overflow-hidden">
      <SidebarContent />
    </aside>
  );
}

export function MobileHeader() {
  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 bg-white sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <Image
          src="/images/examsimlogogreen-compressed.webp"
          alt="ExamSim Logo"
          width={32}
          height={32}
          className="w-8 h-8 object-contain"
        />
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
