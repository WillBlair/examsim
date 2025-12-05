"use client";

import * as React from "react";
import Link from "next/link";
import { Terminal } from "lucide-react";

export function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 pt-6">
      <nav 
        className="flex items-center gap-8 px-6 py-3 bg-brand-orange backdrop-blur-md rounded-full border border-white/10 shadow-lg shadow-brand-orange/20"
        style={{ backgroundColor: 'hsl(var(--brand-orange) / 0.95)' }}
      >
        <Link 
          href="/" 
          className="flex items-center gap-2 text-white font-bold text-lg tracking-tight"
        >
          <div className="p-1 bg-white rounded-lg">
            <Terminal className="w-4 h-4 text-brand-orange" fill="currentColor" />
          </div>
          <span>ExamSim</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          {["Features", "Why Choose Us", "Reviews", "FAQ"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm font-medium text-white/90 hover:text-white transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
             <Link href="/login" className="text-sm font-bold text-white hover:underline decoration-white/50">
                Sign In
             </Link>
             <Link href="/register" className="px-4 py-2 rounded-full bg-white text-brand-orange text-sm font-bold hover:bg-white/90 transition-all shadow-sm">
                Get Started
             </Link>
        </div>
      </nav>
    </div>
  );
}
