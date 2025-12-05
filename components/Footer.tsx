"use client";

import Link from "next/link";
import { Terminal, TwitterLogo, GithubLogo } from "@phosphor-icons/react";

export function Footer() {
  return (
    <footer className="bg-transparent border-t border-zinc-100 text-zinc-600 py-12">
       <div className="container px-4 mx-auto">
         <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            
            {/* Brand */}
            <div className="flex items-center gap-2">
               <div className="p-1 bg-zinc-900 rounded-sm">
                  <Terminal weight="fill" className="w-4 h-4 text-white" />
               </div>
               <span className="font-bold text-lg tracking-tight text-zinc-900">ExamSim</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8 text-xs font-bold text-zinc-500 uppercase tracking-widest">
               <Link href="#" className="hover:text-zinc-900 transition-colors">Features</Link>
               <Link href="#" className="hover:text-zinc-900 transition-colors">Pricing</Link>
               <Link href="#" className="hover:text-zinc-900 transition-colors">Reviews</Link>
               <Link href="#" className="hover:text-zinc-900 transition-colors">FAQs</Link>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-4">
              <Link href="#" className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                <TwitterLogo weight="fill" className="w-5 h-5" />
              </Link>
              <Link href="#" className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                <GithubLogo weight="fill" className="w-5 h-5" />
              </Link>
            </div>
         </div>
         
         <div className="text-center md:text-left mt-12 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-400">
            <span>© {new Date().getFullYear()} ExamSim Inc. All Rights Reserved.</span>
            <div className="flex gap-6 mt-4 md:mt-0">
               <Link href="#" className="hover:text-zinc-600">Privacy Policy</Link>
               <Link href="#" className="hover:text-zinc-600">Terms of Service</Link>
            </div>
         </div>
       </div>
    </footer>
  );
}
