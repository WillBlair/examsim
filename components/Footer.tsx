"use client";

import Link from "next/link";
import { AppIcon } from "@/components/ui/icon";

export function Footer() {
   return (
      <footer className="bg-transparent text-zinc-600 py-12">
         <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">

               {/* Brand */}
               <div className="flex items-center gap-2">
                  <div className="p-1 bg-brand-orange rounded-sm border border-zinc-900 shadow-sm">
                     <AppIcon name="Terminal" className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-lg tracking-tight text-zinc-900 font-display">ExamSim</span>
               </div>


            </div>


         </div>
      </footer>
   );
}
