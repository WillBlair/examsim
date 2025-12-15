"use client";

import * as React from "react";
import Link from "next/link";
import { AppIcon } from "@/components/ui/icon";

export function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 pt-6">
      <nav
        className="flex items-center gap-8 px-6 py-3 bg-white/95 backdrop-blur-md rounded-md border-2 border-zinc-900 shadow-neo w-full max-w-5xl justify-between"
      >
        <div className="flex-1 flex justify-start">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-900 font-bold text-lg tracking-tight group"
          >
            <div className="w-8 h-8 bg-brand-orange rounded-sm flex items-center justify-center border border-zinc-900 shadow-sm group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-transform">
              <AppIcon name="Terminal" className="w-4 h-4 text-white" />
            </div>
            <span className="font-display">ExamSim</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {["Features", "Why Choose Us", "Reviews", "FAQ"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors font-display uppercase tracking-wide"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex-1 flex justify-end items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-zinc-900 hover:underline decoration-zinc-900/30">
            Sign In
          </Link>
          <Link href="/register" className="px-5 py-2 rounded-sm bg-brand-orange text-white text-sm font-bold border border-zinc-900 shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
            Get Started
          </Link>
        </div>
      </nav>
    </div>
  );
}
