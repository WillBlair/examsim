"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-3 md:px-4 pt-4 md:pt-6">
      <nav
        className="flex items-center gap-2 md:gap-8 px-3 md:px-6 py-2 md:py-3 bg-white/95 backdrop-blur-md rounded-md border-2 border-zinc-900 shadow-neo w-full max-w-5xl justify-between"
      >
        <div className="flex justify-start">
          <Link
            href="/"
            className="flex items-center gap-1.5 md:gap-2 text-zinc-900 font-bold text-base md:text-lg tracking-tight group"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-sm flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
              <Image src="/images/examsimlogogreen-removebg-preview.png" alt="ExamSim Logo" width={40} height={40} className="w-full h-full object-contain" loading="lazy" />
            </div>
            <span className="font-display">ExamSim</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {["Features", "Why Choose Us", "FAQ"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors font-display uppercase tracking-wide"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex justify-end items-center gap-2 md:gap-4">
          <Link href="/login" className="text-xs md:text-sm font-bold text-zinc-900 hover:underline decoration-zinc-900/30 whitespace-nowrap">
            Sign In
          </Link>
          <Link href="/register" className="px-3 md:px-5 py-1.5 md:py-2 rounded-sm bg-brand-orange text-zinc-900 text-xs md:text-sm font-bold border border-zinc-900 shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all whitespace-nowrap">
            Get Started
          </Link>
        </div>
      </nav>
    </div>
  );
}
