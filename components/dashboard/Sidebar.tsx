"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, PlusCircle, Exam, Gear, SignOut, Terminal } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: House },
  { name: "New Exam", href: "/dashboard/new", icon: PlusCircle },
  { name: "My Exams", href: "/dashboard/exams", icon: Exam },
  { name: "Settings", href: "/dashboard/settings", icon: Gear },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="h-screen w-[140px] flex flex-col sticky top-0 z-50 shrink-0">
      {/* Logo - Separated */}
      <div className="h-24 flex flex-col items-center justify-center shrink-0">
        <Link href="/" className="group flex flex-col items-center gap-2 transition-opacity hover:opacity-80">
          <div className="p-2.5 bg-brand-orange rounded-xl shadow-lg shadow-brand-orange/20 group-hover:scale-110 transition-transform duration-200">
            <Terminal weight="fill" className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xs uppercase tracking-wider text-zinc-500 group-hover:text-zinc-900 transition-colors">ExamSim</span>
        </Link>
      </div>

      {/* Navigation Panel */}
      <div className="flex-1 bg-white border-r border-zinc-100 flex flex-col relative isolate">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 -z-10 opacity-[0.4] pointer-events-none" 
               style={{
                  backgroundImage: `linear-gradient(to right, #f4f4f5 1px, transparent 1px), linear-gradient(to bottom, #f4f4f5 1px, transparent 1px)`,
                  backgroundSize: '24px 24px'
               }}
        />

        <div className="flex-1 flex flex-col gap-4 py-6 items-center overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex flex-col items-center justify-center w-24 py-3 rounded-xl transition-all duration-200 gap-1.5",
                  isActive
                    ? "bg-zinc-900 text-brand-orange shadow-md shadow-brand-orange/10"
                    : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
                )}
              >
                <item.icon 
                  weight={isActive ? "fill" : "duotone"} 
                  className={cn("w-6 h-6 transition-colors", isActive ? "text-brand-orange" : "text-zinc-400 group-hover:text-zinc-900")} 
                />
                <span className="text-[10px] font-bold uppercase tracking-wide text-center leading-tight px-1">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* User / Footer */}
        <div className="pb-6 flex flex-col items-center gap-4 mt-auto shrink-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button 
                  className="group flex flex-col items-center justify-center w-24 py-3 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all gap-1.5"
              >
                <SignOut weight="duotone" className="w-6 h-6 transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-wide">Sign Out</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will be logged out of your account and redirected to the home page.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => logout()} className="bg-red-600 hover:bg-red-700 text-white">Sign Out</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
