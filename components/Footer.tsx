"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
   return (
      <footer className="bg-transparent text-zinc-600 py-12">
         <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">

               {/* Brand */}
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-sm border border-zinc-900 shadow-sm overflow-hidden">
                     <Image src="/images/examsimlogogreen-removebg-preview.png" alt="ExamSim Logo" width={32} height={32} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-bold text-lg tracking-tight text-zinc-900 font-display">ExamSim</span>
               </div>


            </div>


         </div>
      </footer>
   );
}
